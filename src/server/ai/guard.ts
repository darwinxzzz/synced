import { randomUUID } from "node:crypto";
import { createAdminClient } from "~/lib/supabase/admin";

type AiModel = "gpt-5-mini" | "gpt-5.4-mini" | "gpt-5.4";

type ReserveQuotaInput = {
  userId: string;
  model: AiModel;
  promptText: string;
  maxOutputTokens: number;
};

type ReserveQuotaResult = {
  requestId: string;
  estimatedPromptTokens: number;
  estimatedTotalTokens: number;
  remainingRequests: number;
  remainingTokens: number;
};

type UsageLogInput = {
  userId: string;
  requestId: string;
  model: AiModel;
  promptTokens: number;
  completionTokens: number;
  status: "ok" | "blocked" | "error";
  errorMessage?: string;
  metadata?: Record<string, unknown>;
};

const MODEL_PRICING_PER_1K_TOKEN: Record<AiModel, { inputUsd: number; outputUsd: number }> = {
  "gpt-5-mini": { inputUsd: 0.00025, outputUsd: 0.002 },
  "gpt-5.4-mini": { inputUsd: 0.0003, outputUsd: 0.0022 },
  "gpt-5.4": { inputUsd: 0.0012, outputUsd: 0.01 },
};

function estimatePromptTokens(text: string) {
  // Fast approximation: 1 token ~= 4 characters (English-centric)
  return Math.max(Math.ceil(text.length / 4), 1);
}

function roundUsd(n: number) {
  return Math.round(n * 1_000_000) / 1_000_000;
}

function estimateCostUsd(model: AiModel, promptTokens: number, completionTokens: number) {
  const price = MODEL_PRICING_PER_1K_TOKEN[model];
  const inputCost = (promptTokens / 1000) * price.inputUsd;
  const outputCost = (completionTokens / 1000) * price.outputUsd;
  return roundUsd(inputCost + outputCost);
}

export async function reserveAiQuota(input: ReserveQuotaInput): Promise<ReserveQuotaResult> {
  if (!input.userId) {
    throw new Error("Missing userId");
  }

  if (input.maxOutputTokens <= 0 || input.maxOutputTokens > 4000) {
    throw new Error("maxOutputTokens must be between 1 and 4000");
  }

  if (input.promptText.length > 12_000) {
    throw new Error("Prompt too large");
  }

  const estimatedPromptTokens = estimatePromptTokens(input.promptText);
  const estimatedTotalTokens = estimatedPromptTokens + input.maxOutputTokens;
  const requestId = randomUUID();

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("consume_ai_quota", {
    p_user_id: input.userId,
    p_estimated_tokens: estimatedTotalTokens,
  });

  if (error) {
    throw new Error(`Quota RPC failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.allowed) {
    const reason = row?.reason ?? "quota_blocked";
    throw new Error(`AI quota blocked: ${reason}`);
  }

  return {
    requestId,
    estimatedPromptTokens,
    estimatedTotalTokens,
    remainingRequests: Number(row.remaining_requests ?? 0),
    remainingTokens: Number(row.remaining_tokens ?? 0),
  };
}

export async function logAiUsage(input: UsageLogInput): Promise<void> {
  const promptTokens = Math.max(input.promptTokens, 0);
  const completionTokens = Math.max(input.completionTokens, 0);
  const estimatedCostUsd = estimateCostUsd(input.model, promptTokens, completionTokens);

  const admin = createAdminClient();
  const { error } = await admin.rpc("log_ai_usage_event", {
    p_user_id: input.userId,
    p_request_id: input.requestId,
    p_model: input.model,
    p_prompt_tokens: promptTokens,
    p_completion_tokens: completionTokens,
    p_estimated_cost_usd: estimatedCostUsd,
    p_status: input.status,
    p_error_message: input.errorMessage ?? null,
    p_metadata: input.metadata ?? {},
  });

  if (error) {
    throw new Error(`Usage log RPC failed: ${error.message}`);
  }
}
