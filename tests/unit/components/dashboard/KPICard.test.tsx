import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { KPICard } from "~/app/_components/dashboard/KPICard"

describe("KPICard", () => {
  it("renders label and value", () => {
    render(<KPICard label="PENDING TASKS" value={12} />)
    expect(screen.getByText("PENDING TASKS")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
  })

  it("renders description when provided", () => {
    render(<KPICard label="TEST" value={5} description="tasks pending" />)
    expect(screen.getByText("tasks pending")).toBeInTheDocument()
  })

  it("does not render progress bar when showProgress is not set", () => {
    const { container } = render(<KPICard label="TEST" value={5} />)
    // No progress bar div should be present
    const progressTrack = container.querySelector('[data-testid="progress-track"]')
    expect(progressTrack).toBeNull()
  })

  it("renders progress bar when showProgress=true", () => {
    const { container } = render(
      <KPICard label="TEST" value="72%" showProgress progressValue={72} />,
    )
    const progressTrack = container.querySelector('[data-testid="progress-track"]')
    expect(progressTrack).toBeInTheDocument()
  })

  it("renders dark variant with deep-forest background", () => {
    const { container } = render(<KPICard label="TEAM SYNCS" value={4} dark />)
    const card = container.firstChild as HTMLElement
    expect(card.getAttribute("style")).toContain("var(--deep-forest)")
  })

  it("renders light label text in dark variant", () => {
    render(<KPICard label="TEAM SYNCS" value={4} dark />)
    const label = screen.getByText("TEAM SYNCS")
    // jsdom normalises inline styles with spaces: rgba(255, 255, 255, 0.7)
    expect(label.getAttribute("style")).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.7\)/)
  })

  it("renders badge when badge prop is provided", () => {
    render(<KPICard label="TEST" value={72} badge="ACTIVE MOMENTUM" />)
    expect(screen.getByText("ACTIVE MOMENTUM")).toBeInTheDocument()
  })

  it("does not render badge when badge prop is absent", () => {
    render(<KPICard label="TEST" value={72} />)
    expect(screen.queryByTestId("kpi-badge")).toBeNull()
  })
})
