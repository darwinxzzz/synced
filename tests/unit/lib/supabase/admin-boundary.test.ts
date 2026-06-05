import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Supabase service-role boundary", () => {
  it("marks the admin client module as server-only", () => {
    const adminModulePath = resolve(process.cwd(), "src/lib/supabase/admin.ts");
    const source = readFileSync(adminModulePath, "utf8");

    expect(source).toMatch(/import\s+["']server-only["']/);
  });
});
