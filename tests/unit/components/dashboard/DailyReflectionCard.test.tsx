import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DailyReflectionCard } from "~/app/_components/dashboard/DailyReflectionCard"

describe("DailyReflectionCard", () => {
  it('renders "Daily Reflection" label', () => {
    render(<DailyReflectionCard onOpenReflection={vi.fn()} />)
    expect(screen.getByText("Daily Reflection")).toBeInTheDocument()
  })

  it('renders "CURRENT FOCUS" sub-label', () => {
    render(<DailyReflectionCard onOpenReflection={vi.fn()} />)
    expect(screen.getByText(/CURRENT FOCUS/i)).toBeInTheDocument()
  })

  it("renders the curated daily quote", () => {
    render(<DailyReflectionCard onOpenReflection={vi.fn()} />)
    expect(screen.getByText(/Nature does not hurry/i)).toBeInTheDocument()
  })

  it('renders "MENTAL CLARITY" tag', () => {
    render(<DailyReflectionCard onOpenReflection={vi.fn()} />)
    expect(screen.getByText("MENTAL CLARITY")).toBeInTheDocument()
  })

  it('renders "Add Reflection +" button', () => {
    render(<DailyReflectionCard onOpenReflection={vi.fn()} />)
    expect(
      screen.getByRole("button", { name: /Add Reflection/i }),
    ).toBeInTheDocument()
  })

  it("calls onOpenReflection when button is clicked", async () => {
    const onOpen = vi.fn()
    render(<DailyReflectionCard onOpenReflection={onOpen} />)
    await userEvent.click(screen.getByRole("button", { name: /Add Reflection/i }))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it("renders a progress bar for the reflection streak", () => {
    const { container } = render(<DailyReflectionCard onOpenReflection={vi.fn()} />)
    const track = container.querySelector('[data-testid="streak-track"]')
    expect(track).toBeInTheDocument()
  })
})
