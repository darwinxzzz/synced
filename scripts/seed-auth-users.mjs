import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_PASSWORD = "Passw0rd!123";
const APPLY_FLAG = "--apply";
const DRY_RUN_FLAG = "--dry-run";
const argv = new Set(process.argv.slice(2));
const shouldApply = argv.has(APPLY_FLAG);
const shouldDryRun = argv.has(DRY_RUN_FLAG) || !shouldApply;

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env file in project root.");
  }
  return fs.readFileSync(envPath, "utf8");
}

function readEnvValue(content, key) {
  const line = content
    .split(/\r?\n/)
    .find((rawLine) => rawLine.trim().startsWith(`${key}=`));

  if (!line) return null;

  const rhs = line.split("=", 2)[1]?.trim();
  if (!rhs) return null;

  const withoutInlineComment = rhs.split(" #")[0].trim();
  const unquoted =
    withoutInlineComment.startsWith('"') && withoutInlineComment.endsWith('"')
      ? withoutInlineComment.slice(1, -1)
      : withoutInlineComment;

  return unquoted.trim();
}

function buildCohort() {
  const departments = ["Software", "Meet-ups", "Inspire", "Publicity", "Connectors", "Labs"];
  const users = [];

  users.push({
    email: "seed.admin@eventsync.test",
    name: "Seed Admin",
    role: "admin",
    status: "active",
    department: "Software",
  });

  for (let i = 1; i <= 16; i++) {
    users.push({
      email: `seed.member${String(i).padStart(2, "0")}@eventsync.test`,
      name: `Seed Member ${String(i).padStart(2, "0")}`,
      role: "member",
      status: "active",
      department: departments[(i - 1) % departments.length],
    });
  }

  for (let i = 1; i <= 4; i++) {
    users.push({
      email: `seed.pending${String(i).padStart(2, "0")}@eventsync.test`,
      name: `Seed Pending ${String(i).padStart(2, "0")}`,
      role: "member",
      status: "pending",
      department: departments[(i + 1) % departments.length],
    });
  }

  for (let i = 1; i <= 2; i++) {
    users.push({
      email: `seed.rejected${String(i).padStart(2, "0")}@eventsync.test`,
      name: `Seed Rejected ${String(i).padStart(2, "0")}`,
      role: "member",
      status: "rejected",
      department: departments[(i + 3) % departments.length],
    });
  }

  return users;
}

async function listUsersByEmail(adminClient) {
  const emailMap = new Map();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users ?? [];
    for (const user of users) {
      if (user.email) emailMap.set(user.email.toLowerCase(), user);
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return emailMap;
}

async function ensureProfile(adminClient, row) {
  const { error } = await adminClient.from("profiles").upsert(
    {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      department: row.department,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}

async function main() {
  const envContent = loadEnvFile();
  const supabaseUrl = readEnvValue(envContent, "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnvValue(envContent, "SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const cohort = buildCohort();

  if (shouldDryRun) {
    console.log("[dry-run] Auth seed plan");
    console.log(`- total users: ${cohort.length}`);
    console.log(`- active admin: 1`);
    console.log(`- active members: 16`);
    console.log(`- pending members: 4`);
    console.log(`- rejected members: 2`);
    console.log(`- default password (for created users): ${DEFAULT_PASSWORD}`);
    console.log(`Run with "${APPLY_FLAG}" to apply.`);
    return;
  }

  const existingByEmail = await listUsersByEmail(adminClient);
  let created = 0;
  let reused = 0;

  for (const entry of cohort) {
    const key = entry.email.toLowerCase();
    let user = existingByEmail.get(key);

    if (!user) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: entry.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: entry.name,
          department: entry.department,
        },
      });

      if (error) throw error;
      user = data.user;
      created += 1;
    } else {
      reused += 1;
    }

    const { error: userUpdateError } = await adminClient.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        full_name: entry.name,
        department: entry.department,
      },
    });
    if (userUpdateError) throw userUpdateError;

    await ensureProfile(adminClient, {
      id: user.id,
      name: entry.name,
      email: entry.email.toLowerCase(),
      role: entry.role,
      status: entry.status,
      department: entry.department,
    });
  }

  console.log("[ok] Seeded auth users and profiles");
  console.log(`- created: ${created}`);
  console.log(`- reused existing auth users: ${reused}`);
  console.log(`- total processed: ${cohort.length}`);
}

main().catch((error) => {
  console.error("[error] Auth seed failed");
  console.error(error.message);
  process.exit(1);
});
