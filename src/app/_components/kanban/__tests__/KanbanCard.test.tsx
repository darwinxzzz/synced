import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { KanbanCard } from "../KanbanCard"
import type { KanbanTask } from "../KanbanCard"

const baseTask: KanbanTask = {
  id: "task-1",
  name: "Build the kanban board",
  department: "Software",
  priority: "high",
  pillarStatus: "new",
  deadline: new Date("2026-04-20"),
  assignedBy: "Admin",
  contributionId: null,
  isEditable: true,
}

describe("KanbanCard", () => {
  it("renders task name", () => {
    render(<KanbanCard task={baseTask} />)
    expect(screen.getByText("Build the kanban board")).toBeTruthy()
  })

  it("renders department badge", () => {
    render(<KanbanCard task={baseTask} />)
    expect(screen.getByText("Software")).toBeTruthy()
  })

  it("renders priority label", () => {
    render(<KanbanCard task={baseTask} />)
    expect(screen.getByText("High")).toBeTruthy()
  })

  it("renders assigned-by metadata", () => {
    render(<KanbanCard task={baseTask} />)
    expect(screen.getByText(/Assigned by Admin/i)).toBeTruthy()
  })

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<KanbanCard task={baseTask} onClick={handleClick} />)
    await user.click(screen.getByText("Build the kanban board"))
    expect(handleClick).toHaveBeenCalledWith(baseTask)
  })

  it("shows Completed badge for done tasks", () => {
    render(<KanbanCard task={{ ...baseTask, pillarStatus: "done", isEditable: false }} />)
    expect(screen.getByText(/Completed/i)).toBeTruthy()
  })

  it("done card has green left border via style", () => {
    const { container } = render(
      <KanbanCard task={{ ...baseTask, pillarStatus: "done", isEditable: false }} />
    )
    const card = container.firstChild as HTMLElement
    expect(card.style.borderLeft).toContain("var(--deadline-green)")
  })

  it("non-done card is draggable", () => {
    const { container } = render(<KanbanCard task={baseTask} />)
    const card = container.firstChild as HTMLElement
    expect(card.getAttribute("draggable")).toBe("true")
  })

  it("done card is not draggable", () => {
    const { container } = render(
      <KanbanCard task={{ ...baseTask, pillarStatus: "done", isEditable: false }} />
    )
    const card = container.firstChild as HTMLElement
    expect(card.getAttribute("draggable")).toBe("false")
  })

  it("applies kanban-shake class when shake=true", () => {
    const { container } = render(<KanbanCard task={baseTask} shake />)
    const card = container.firstChild as HTMLElement
    expect(card.classList.contains("kanban-shake")).toBe(true)
  })

  it("applies kanban-highlight class when highlighted=true", () => {
    const { container } = render(<KanbanCard task={baseTask} highlighted />)
    const card = container.firstChild as HTMLElement
    expect(card.classList.contains("kanban-highlight")).toBe(true)
  })

  it("shows medium priority with amber colour token", () => {
    render(<KanbanCard task={{ ...baseTask, priority: "medium" }} />)
    const label = screen.getByText("Medium")
    expect(label).toBeTruthy()
  })

  it("shows low priority with green colour token", () => {
    render(<KanbanCard task={{ ...baseTask, priority: "low" }} />)
    expect(screen.getByText("Low")).toBeTruthy()
  })

  it("renders 'Move →' button for non-done tasks when onMoveRequest provided", () => {
    const handler = vi.fn()
    render(<KanbanCard task={baseTask} onMoveRequest={handler} />)
    const btn = screen.getByText("Move →")
    expect(btn).toBeTruthy()
  })
})
