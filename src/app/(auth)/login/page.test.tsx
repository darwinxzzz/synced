import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Fragment, createElement } from "react"
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  push,
  replace,
  toastSuccess,
  toastError,
  searchParamsState,
  resetPasswordForEmail,
  exchangeCodeForSession,
  getSession,
  updateUser,
  signOut,
} = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  searchParamsState: { value: new URLSearchParams() },
  resetPasswordForEmail: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  getSession: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => searchParamsState.value,
}))

vi.mock("motion/react", () => {
  const motion = new Proxy(
    {},
    {
      get: (_, tag: string) =>
        ({ children, ...props }: ComponentProps<"div">) => createElement(tag, props, children),
    },
  )

  return {
    AnimatePresence: ({ children }: { children: ReactNode }) => <Fragment>{children}</Fragment>,
    motion,
  }
})

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}))

vi.mock("~/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail,
      exchangeCodeForSession,
      getSession,
      updateUser,
      signOut,
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      mfa: {
        listFactors: vi.fn(),
        enroll: vi.fn(),
        challenge: vi.fn(),
        verify: vi.fn(),
      },
      getUser: vi.fn(),
    },
    from: vi.fn(),
  }),
}))

vi.mock("./_components/MfaModal", () => ({
  MfaModal: () => null,
}))

vi.mock("./_components/MfaEnrollPanel", () => ({
  MfaEnrollPanel: () => <div>MFA Enroll</div>,
}))

vi.mock("./_components/SignupForm", () => ({
  SignupForm: () => <div>Signup Form</div>,
}))

vi.mock("./_components/auth-atoms", () => ({
  FieldLabel: ({
    children,
    htmlFor,
    className,
  }: {
    children: ReactNode
    htmlFor?: string
    className?: string
  }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
  GoogleIcon: () => <span>G</span>,
  HoverTapButton: ({
    children,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  InputWrapper: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import LoginPage from "./page"

describe("LoginPage forgot password flow", () => {
  beforeEach(() => {
    searchParamsState.value = new URLSearchParams()
    push.mockReset()
    replace.mockReset()
    toastSuccess.mockReset()
    toastError.mockReset()
    resetPasswordForEmail.mockReset()
    exchangeCodeForSession.mockReset()
    getSession.mockReset()
    updateUser.mockReset()
    signOut.mockReset()

    resetPasswordForEmail.mockResolvedValue({ error: null })
    exchangeCodeForSession.mockResolvedValue({ error: null })
    getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } })
    updateUser.mockResolvedValue({ error: null })
    signOut.mockResolvedValue({ error: null })
  })

  it("sends the reset email to recovery mode", async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "member@eventsync.com" },
    })
    await user.click(screen.getByRole("button", { name: /forgot\?/i }))

    await waitFor(() => {
      expect(resetPasswordForEmail).toHaveBeenCalledWith("member@eventsync.com", {
        redirectTo: "http://localhost:3000/login?mode=recovery",
      })
    })

    expect(toastSuccess).toHaveBeenCalledWith("Password reset email sent. Check your inbox.")
  })

  it("lets the user set a new password from a recovery link", async () => {
    searchParamsState.value = new URLSearchParams("mode=recovery&code=recovery-code")
    const { container } = render(<LoginPage />)

    await screen.findByText("Reset Password")

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "new-password-123" },
    })
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "new-password-123" },
    })
    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(exchangeCodeForSession).toHaveBeenCalledWith("recovery-code")
    })

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({ password: "new-password-123" })
    })

    expect(signOut).toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledWith("Password updated. Sign in with your new password.")
    expect(replace).toHaveBeenCalledWith("/login")
  })
})
