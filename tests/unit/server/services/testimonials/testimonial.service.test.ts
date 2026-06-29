import { describe, expect, it } from "vitest"
import { resolveEndorsementIdentity } from "~/server/services/testimonials/testimonial.service"

describe("resolveEndorsementIdentity", () => {
  const admin = { name: "Ada Admin", department: "Operations" }

  it("uses the provided name and title when present", () => {
    expect(
      resolveEndorsementIdentity(
        { endorsementName: "Custom Name", endorsementTitle: "Lead" },
        admin,
      ),
    ).toEqual({ name: "Custom Name", title: "Lead" })
  })

  it("falls back to the admin identity when omitted", () => {
    expect(resolveEndorsementIdentity({}, admin)).toEqual({
      name: "Ada Admin",
      title: "Operations",
    })
  })

  it("treats blank/whitespace input as omitted", () => {
    expect(
      resolveEndorsementIdentity({ endorsementName: "   ", endorsementTitle: "" }, admin),
    ).toEqual({ name: "Ada Admin", title: "Operations" })
  })

  it("defaults the title to Admin when the admin has no department", () => {
    expect(resolveEndorsementIdentity({}, { name: "Ada", department: null })).toEqual({
      name: "Ada",
      title: "Admin",
    })
  })
})
