import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { DeadlineBadge } from "./DeadlineBadge"

describe("DeadlineBadge", () => {
  it("renders compact day count for future deadlines", () => {
    render(<DeadlineBadge daysAway={5} />)
    expect(screen.getByText("5 Days")).toBeInTheDocument()
  })

  it("renders '1 Day' for single-day deadline", () => {
    render(<DeadlineBadge daysAway={1} />)
    expect(screen.getByText("1 Day")).toBeInTheDocument()
  })

  it("renders 'Overdue' when deadline has passed", () => {
    render(<DeadlineBadge daysAway={0} />)
    expect(screen.getByText("Overdue")).toBeInTheDocument()
  })

  it("renders 'Overdue' for negative days", () => {
    render(<DeadlineBadge daysAway={-3} />)
    expect(screen.getByText("Overdue")).toBeInTheDocument()
  })

  it("applies red color for ≤7 days", () => {
    const { container } = render(<DeadlineBadge daysAway={3} />)
    const badge = container.firstChild as HTMLElement
    expect(badge.getAttribute("style")).toContain("var(--deadline-red)")
  })

  it("applies amber color for 8–14 days", () => {
    const { container } = render(<DeadlineBadge daysAway={10} />)
    const badge = container.firstChild as HTMLElement
    expect(badge.getAttribute("style")).toContain("var(--deadline-amber)")
  })

  it("applies green color for 15+ days", () => {
    const { container } = render(<DeadlineBadge daysAway={20} />)
    const badge = container.firstChild as HTMLElement
    expect(badge.getAttribute("style")).toContain("var(--deadline-green)")
  })

  it("does NOT use verbose 'Due in X days' format", () => {
    render(<DeadlineBadge daysAway={7} />)
    expect(screen.queryByText(/Due in/i)).toBeNull()
    expect(screen.queryByText(/Due tomorrow/i)).toBeNull()
  })
})
