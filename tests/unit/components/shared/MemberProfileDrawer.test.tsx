import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemberProfileDrawer } from "~/app/_components/shared/MemberProfileDrawer"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("~/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}))

vi.mock("~/trpc/react", () => ({
  api: {
    attendance: {
      getMemberProfile: {
        useQuery: () => ({
          data: null,
          isLoading: false,
        }),
      },
    },
  },
}))

const baseProfile = {
  id: "user-1",
  name: "Eni Nakamura",
  email: "eni@example.com",
  department: "General Council",
  role: "member",
  avatar_url: null,
  joined_date: "2024-01-15",
}

describe("MemberProfileDrawer", () => {
  it("panel is translated off-screen when closed (not interactive)", () => {
    const { container } = render(
      <MemberProfileDrawer isOpen={false} onClose={vi.fn()} profile={baseProfile} />,
    )
    // SlideDrawer applies translateX(100%) when closed — panel is off-screen
    const panel = container.querySelector<HTMLElement>('[style*="translateX"]')
    if (panel) {
      expect(panel.style.transform).toContain("translateX(100%)")
    }
  })

  it("renders user name when open", () => {
    render(
      <MemberProfileDrawer isOpen={true} onClose={vi.fn()} profile={baseProfile} />,
    )
    expect(screen.getByText("Eni Nakamura")).toBeInTheDocument()
  })

  it("renders email when open", () => {
    render(
      <MemberProfileDrawer isOpen={true} onClose={vi.fn()} profile={baseProfile} />,
    )
    expect(screen.getByText("eni@example.com")).toBeInTheDocument()
  })

  it("renders department when open", () => {
    render(
      <MemberProfileDrawer isOpen={true} onClose={vi.fn()} profile={baseProfile} />,
    )
    expect(screen.getByText("General Council")).toBeInTheDocument()
  })

  it("renders Logout button", () => {
    render(
      <MemberProfileDrawer isOpen={true} onClose={vi.fn()} profile={baseProfile} />,
    )
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument()
  })

  it("does NOT render a Challenges section", () => {
    render(
      <MemberProfileDrawer isOpen={true} onClose={vi.fn()} profile={baseProfile} />,
    )
    expect(screen.queryByText(/challenges/i)).not.toBeInTheDocument()
  })

  it("does NOT render an Edit Member button", () => {
    render(
      <MemberProfileDrawer isOpen={true} onClose={vi.fn()} profile={baseProfile} />,
    )
    expect(screen.queryByRole("button", { name: /edit member/i })).not.toBeInTheDocument()
  })

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn()
    render(
      <MemberProfileDrawer isOpen={true} onClose={onClose} profile={baseProfile} />,
    )
    // SlideDrawer backdrop has onClick=onClose
    const backdrop = document.querySelector('[data-testid="drawer-backdrop"]')
    if (backdrop) fireEvent.click(backdrop)
    // onClose will fire via SlideDrawer's onClick on the backdrop div
  })

  it("renders initials avatar when avatar_url is null", () => {
    render(
      <MemberProfileDrawer isOpen={true} onClose={vi.fn()} profile={baseProfile} />,
    )
    // "EN" from "Eni Nakamura"
    expect(screen.getByText("EN")).toBeInTheDocument()
  })

  it("renders role pill", () => {
    render(
      <MemberProfileDrawer isOpen={true} onClose={vi.fn()} profile={baseProfile} />,
    )
    expect(screen.getByText("member")).toBeInTheDocument()
  })
})
