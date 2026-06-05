import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin open-board optimistic mutation", () => {
  it("uses the mutation context eventId for rollback and invalidation", () => {
    const sourcePath = resolve(process.cwd(), "src/app/admin/kanban/[eventId]/page.tsx");
    const source = readFileSync(sourcePath, "utf8");

    expect(source).toContain("return { prev, eventId };");
    expect(source).toContain("ctx?.eventId");
    expect(source).toContain("getOpenBoard.setData({ eventId: ctx.eventId }, ctx.prev)");
    expect(source).toContain("getOpenBoard.invalidate({ eventId: ctx.eventId })");
  });
});
