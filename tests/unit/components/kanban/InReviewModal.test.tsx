import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InReviewModal } from "~/app/_components/kanban/InReviewModal"

function renderModal(props?: Partial<React.ComponentProps<typeof InReviewModal>>) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <InReviewModal
      open={true}
      onConfirm={props?.onConfirm ?? onConfirm}
      onCancel={props?.onCancel ?? onCancel}
    />
  )
  return { onConfirm, onCancel }
}

describe("InReviewModal", () => {
  it("does not render when open=false", () => {
    const { container } = render(
      <InReviewModal open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders title when open", () => {
    renderModal()
    expect(screen.getByText("Moving to In Review")).toBeTruthy()
  })

  it("renders both textarea fields", () => {
    renderModal()
    expect(screen.getByPlaceholderText("What did you change or complete?")).toBeTruthy()
    expect(screen.getByPlaceholderText("What difficulties did you encounter?")).toBeTruthy()
  })

  it("shows validation errors when confirming empty fields", async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByText(/Confirm Move/i))
    expect(screen.getAllByText("Required").length).toBeGreaterThanOrEqual(2)
  })

  it("calls onConfirm with field values when valid", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<InReviewModal open onConfirm={onConfirm} onCancel={vi.fn()} />)

    await user.type(screen.getByPlaceholderText("What did you change or complete?"), "Fixed the login bug")
    await user.type(
      screen.getByPlaceholderText("What difficulties did you encounter?"),
      "OAuth redirect was tricky"
    )
    await user.click(screen.getByText(/Confirm Move/i))

    expect(onConfirm).toHaveBeenCalledWith("Fixed the login bug", "OAuth redirect was tricky")
  })

  it("calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<InReviewModal open onConfirm={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByText("Cancel"))
    expect(onCancel).toHaveBeenCalled()
  })

  it("shows word counter for changes field", () => {
    renderModal()
    // Initial: "0 / 30 words" for changes
    const counters = screen.getAllByText(/0 \/ 30 words/)
    expect(counters.length).toBeGreaterThanOrEqual(1)
  })

  it("shows word count over limit when > 30 words entered", async () => {
    const user = userEvent.setup()
    renderModal()
    const tooManyWords = Array.from({ length: 35 }, (_, i) => `word${i}`).join(" ")
    const textarea = screen.getByPlaceholderText("What did you change or complete?")
    await user.type(textarea, tooManyWords)
    expect(screen.getByText(/35 \/ 30 words/)).toBeTruthy()
  })

  it("shows validation error when changes field exceeds word limit", async () => {
    const user = userEvent.setup()
    renderModal()
    const tooManyWords = Array.from({ length: 35 }, (_, i) => `word${i}`).join(" ")
    await user.type(
      screen.getByPlaceholderText("What did you change or complete?"),
      tooManyWords
    )
    await user.type(
      screen.getByPlaceholderText("What difficulties did you encounter?"),
      "Some challenges"
    )
    await user.click(screen.getByText(/Confirm Move/i))
    expect(screen.getByText(/Max 30 words/i)).toBeTruthy()
  })

  it("calls onCancel when backdrop is clicked", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const { container } = render(
      <InReviewModal open onConfirm={vi.fn()} onCancel={onCancel} />
    )
    // Backdrop is the first fixed div
    const backdrop = container.querySelector("div[style*='position: fixed']")
    if (backdrop) await user.click(backdrop)
    expect(onCancel).toHaveBeenCalled()
  })
})
