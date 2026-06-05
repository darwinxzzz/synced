import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/member/dashboard",
}))

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock("~/trpc/react", () => ({
  api: {
    dashboard: {
      getMemberKPIs: {
        useQuery: () => ({
          data: {
            remainingTasks: 3,
            completionRate: 72,
            teamSyncCount: 4,
            nextDeadline: null,
          },
          isPending: false,
          isError: false,
        }),
      },
      getPendingMilestones: {
        useQuery: () => ({
          data: [
            {
              task_id:       "em-123",
              department:    "Software",
              task:          "Build landing page",
              event_name:    "Tech Summit",
              event_id:      "evt-456",
              event_date:    "2099-12-31",
              pillar_status: "in_progress",
            },
          ],
          isPending: false,
          isError: false,
        }),
      },
      getUpcomingMeeting: {
        useQuery: () => ({ data: null, isPending: false, isError: false }),
      },
      getReflectionStreak: {
        useQuery: () => ({
          data: { streakCount: 3, streakPercent: 30 },
          isPending: false,
          isError: false,
        }),
      },
    },
    reflections: {
      getMyReflections: {
        useQuery: () => ({
          data: [],
          refetch: vi.fn(),
          isPending: false,
          isError: false,
        }),
      },
      submitReflection: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
      saveDraft: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
      adminUpdateReflection: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
    },
  },
}))

import MemberDashboard from "~/app/member/dashboard/page"

describe("MemberDashboard page", () => {
  it('renders "PERSONAL WORKSPACE" label', () => {
    render(<MemberDashboard />)
    expect(screen.getByText("PERSONAL WORKSPACE")).toBeInTheDocument()
  })

  it('renders "Your Upcoming Contributions" heading', () => {
    render(<MemberDashboard />)
    expect(screen.getByText("Your Upcoming Contributions")).toBeInTheDocument()
  })

  it("renders Sustained Progress KPI card label", () => {
    render(<MemberDashboard />)
    expect(screen.getByText("SUSTAINED PROGRESS")).toBeInTheDocument()
  })

  it("renders Pending Tasks KPI card label", () => {
    render(<MemberDashboard />)
    expect(screen.getByText("PENDING TASKS")).toBeInTheDocument()
  })

  it("renders Team Syncs KPI card label", () => {
    render(<MemberDashboard />)
    expect(screen.getByText("TEAM SYNCS")).toBeInTheDocument()
  })

  it("renders pendingTaskCount value (remainingTasks = 3)", () => {
    render(<MemberDashboard />)
    expect(screen.getByTestId("kpi-pending-tasks-value")).toHaveTextContent("3")
  })

  it("renders teamSyncCount value (= 4)", () => {
    render(<MemberDashboard />)
    expect(screen.getByTestId("kpi-team-syncs-value")).toHaveTextContent("4")
  })

  it("renders Daily Reflection card", () => {
    render(<MemberDashboard />)
    expect(screen.getByText("Daily Reflection")).toBeInTheDocument()
  })

  it("renders milestone task name when milestones exist", () => {
    render(<MemberDashboard />)
    expect(screen.getByText("Build landing page")).toBeInTheDocument()
  })

  it("milestone link uses taskId param", () => {
    render(<MemberDashboard />)
    const link = screen.getByRole("link", { name: /Build landing page/i })
    expect(link.getAttribute("href")).toContain("taskId=em-123")
  })

  it("milestone link does NOT use eventId param", () => {
    render(<MemberDashboard />)
    const link = screen.getByRole("link", { name: /Build landing page/i })
    expect(link.getAttribute("href")).not.toContain("eventId=")
  })

  it("renders no active events message when no upcoming meeting", () => {
    render(<MemberDashboard />)
    expect(screen.getByText(/No active events scheduled/i)).toBeInTheDocument()
  })
})
