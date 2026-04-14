"use client"

import { AnimatePresence, motion } from "motion/react"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronDown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/app/_components/ui/button"
import { Input } from "~/app/_components/ui/input"
import { createClient } from "~/lib/supabase/client"

type AuthView = "login" | "signup"

const TOOL_OPTIONS = ["Figma", "Notion", "Canva", "Slides", "GitHub", "Slack"]
const DEPARTMENT_FALLBACK = ["Software", "Operations", "Design", "Publicity", "Partnerships"]

export default function LoginPage() {
  return (
    <Suspense>
      <AuthSurface />
    </Suspense>
  )
}

function AuthSurface() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlError = searchParams.get("error")
  const shownErrorRef = useRef<string | null>(null)

  const [view, setView] = useState<AuthView>("login")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  const [telegramHandle, setTelegramHandle] = useState("")

  const [departments, setDepartments] = useState<string[]>([])
  const [department, setDepartment] = useState("")
  const [departmentOpen, setDepartmentOpen] = useState(false)

  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [otherEnabled, setOtherEnabled] = useState(false)
  const [otherTool, setOtherTool] = useState("")

  const formVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 12 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.07, when: "beforeChildren" },
      },
      exit: { opacity: 0, y: -8 },
    }),
    [],
  )

  const fieldVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }),
    [],
  )

  useEffect(() => {
    if (!urlError || shownErrorRef.current === urlError) return

    const message = getUrlErrorMessage(urlError)
    if (message) {
      toast.error(message)
      shownErrorRef.current = urlError
    }
  }, [urlError])

  useEffect(() => {
    if (typeof window === "undefined") return

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const hashErrorCode = hashParams.get("error_code")
    if (!hashErrorCode) return

    if (hashErrorCode === "otp_expired") {
      toast.error("That email link is expired. Request a new verification code and use the latest code.")
    } else if (hashErrorCode === "access_denied") {
      toast.error("Email verification failed. Please request a new code.")
    }

    const cleanUrl = `${window.location.pathname}${window.location.search}`
    window.history.replaceState({}, document.title, cleanUrl)
  }, [])

  useEffect(() => {
    if (view !== "signup") return

    const loadDepartments = async () => {
      try {
        const res = await fetch("/api/auth/departments", { cache: "no-store" })
        const json = (await res.json()) as { departments?: string[] }
        const values = (json.departments ?? []).filter(Boolean)
        setDepartments(values.length > 0 ? values : DEPARTMENT_FALLBACK)
      } catch {
        setDepartments(DEPARTMENT_FALLBACK)
      }
    }

    void loadDepartments()
  }, [view])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (signInError) {
      toast.error(signInError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      toast.error("Unable to sign in. Please try again.")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      toast.error("You have not been added to Event Sync. Contact your admin.")
      setLoading(false)
      return
    }

    if (profile.status === "pending") {
      await supabase.auth.signOut()
      toast.error("Your account is pending admin approval")
      setLoading(false)
      return
    }

    if (profile.status === "rejected" || profile.status === "inactive") {
      await supabase.auth.signOut()
      toast.error("Your account has not been approved. Contact an admin.")
      setLoading(false)
      return
    }

    if (profile.status !== "active") {
      await supabase.auth.signOut()
      toast.error("Your account is pending admin approval")
      setLoading(false)
      return
    }

    router.push(profile.role === "admin" ? "/admin/dashboard" : "/member/dashboard")
    setLoading(false)
  }

  async function handleGoogleVerify() {
    setLoading(true)
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })

    if (oauthError) {
      toast.error(oauthError.message)
      setLoading(false)
      return
    }
  }

  async function handleForgotPassword() {
    if (!loginEmail) {
      toast.error("Enter your email address first.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success("Password reset email sent. Check your inbox.")
    setLoading(false)
  }

  async function handleEmailVerify() {
    const email = signupEmail.trim().toLowerCase()

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Enter a valid institutional email first.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSignupEmail(email)
    setEmailVerified(false)
    setOtpSent(true)
    toast.success("Verification code sent. Enter the latest 6-digit code from your email.")
    setLoading(false)
  }

  async function handleOtpConfirm() {
    const token = otpCode.trim()

    if (!/^\d{6}$/.test(token)) {
      toast.error("Enter a valid 6-digit verification code.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email: signupEmail,
      token,
      type: "email",
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      toast.error("Unable to verify email. Please request a new code.")
      setLoading(false)
      return
    }

    setEmailVerified(true)
    setOtpSent(false)
    toast.success("Email verified successfully.")
    setLoading(false)
  }

  function toggleTool(tool: string) {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((value) => value !== tool) : [...prev, tool],
    )
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()

    if (!emailVerified) {
      toast.error("Please verify your email before creating an account.")
      return
    }

    if (!department) {
      toast.error("Please select a department.")
      return
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (signupPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const fullName = `${firstName} ${lastName}`.trim()
    const tools = otherTool.trim()
      ? [...selectedTools.filter((tool) => tool !== otherTool.trim()), otherTool.trim()]
      : selectedTools

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error("Session expired. Verify your email again before creating an account.")
      setEmailVerified(false)
      setOtpSent(false)
      setOtpCode("")
      setLoading(false)
      return
    }

    if ((user.email ?? "").toLowerCase() !== signupEmail.trim().toLowerCase()) {
      toast.error("Verified email does not match. Please verify again.")
      setEmailVerified(false)
      setOtpSent(false)
      setOtpCode("")
      setLoading(false)
      return
    }

    const { error: updateAuthError } = await supabase.auth.updateUser({
      password: signupPassword,
      data: {
        full_name: fullName,
        department,
        telegram_handle: telegramHandle,
        tools,
      },
    })

    if (updateAuthError) {
      toast.error(updateAuthError.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        name: fullName || signupEmail,
        department,
      })
      .eq("id", user.id)

    if (profileError) {
      toast.error(profileError.message)
      setLoading(false)
      return
    }

    await supabase.auth.signOut()

    toast.success("Account created. Your account is pending admin approval")
    setLoginEmail(signupEmail)
    setView("login")
    setLoading(false)
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj0oHWw5NAbD4M9PATIIjTxAqRMbEh7bNiQs0R8K80ABVb6ZByq3NxwgPR8p2Z4urdpjPd5TLvCLIerGq6twiB0TDS-Mw1G84_VVPJ0xYuMdeIXUe4dLhUI5muO61HXTbdyABZoohCXA9ReiHV5A2EQxu-6NJUolsjFcEAlIl6etyaxfpAmqfTVisbF8ee58W8TPOEj1QkTcBH8wemJtFZ8uVI3ES1OP7zbuQ5-9LxLY3VgGgooVE-iswhNtrUXhAPIZH58vJzgq6T"
          alt="Arashiyama bamboo grove"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(28,58,43,0.95)_0%,rgba(28,58,43,0.45)_48%,rgba(28,58,43,0.2)_100%)]" />
      </div>

      <section className="relative z-10 mx-auto flex h-screen w-full max-w-[1600px] items-center overflow-hidden px-4 py-6 lg:px-10 lg:py-10">
        <AnimatePresence mode="wait" initial={false}>
          {view === "login" ? (
            <motion.div
              key="login-shell"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="ml-auto w-full max-w-md"
            >
              <div className="rounded-3xl border border-white/20 bg-[#fffdf8]/93 p-8 shadow-[0_26px_80px_-20px_rgba(20,30,24,0.55)] backdrop-blur-md md:p-10">
                <h2 className="font-headline text-3xl italic text-[#052417]">Welcome Back</h2>
                <p className="mt-2 text-sm text-[#4e544f]">Sign in to your workspace.</p>

                <motion.form onSubmit={handleSignIn} className="mt-8 space-y-5" variants={formVariants} initial="hidden" animate="visible">
                  <motion.div variants={fieldVariants}>
                    <FieldLabel htmlFor="login-email">Email Address</FieldLabel>
                    <InputWrapper isFocused={focusedField === "login-email"}>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        onFocus={() => setFocusedField("login-email")}
                        onBlur={() => setFocusedField(null)}
                        required
                        placeholder="name@eventsync.com"
                        className="h-14 rounded-full border-0 bg-[#ddd8d0] px-6 text-[#1d1c17] shadow-none placeholder:text-[#a9afaa] focus-visible:ring-0"
                      />
                    </InputWrapper>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <div className="mb-2 flex items-center justify-between px-1">
                      <FieldLabel htmlFor="login-password" className="mb-0 px-0">Password</FieldLabel>
                      <button type="button" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9aa59b] hover:text-[#4b6546]" onClick={handleForgotPassword}>
                        Forgot?
                      </button>
                    </div>
                    <InputWrapper isFocused={focusedField === "login-password"}>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onFocus={() => setFocusedField("login-password")}
                        onBlur={() => setFocusedField(null)}
                        required
                        placeholder="********"
                        className="h-14 rounded-full border-0 bg-[#ddd8d0] px-6 text-[#1d1c17] shadow-none placeholder:text-[#a9afaa] focus-visible:ring-0"
                      />
                    </InputWrapper>
                  </motion.div>

                  <motion.div variants={fieldVariants} className="space-y-4 pt-3">
                    <HoverTapButton type="submit" disabled={loading} className="h-14 w-full rounded-full bg-[linear-gradient(135deg,#1C3A2B_0%,#4A7C59_100%)] text-lg text-white shadow-[0_12px_28px_-14px_rgba(28,58,43,0.9)] hover:opacity-95">
                      {loading ? "Signing In..." : "Sign In"}
                    </HoverTapButton>

                    <div className="flex items-center gap-4 px-1">
                      <span className="h-px flex-1 bg-[#d9d5cc]" />
                      <span className="text-sm tracking-[0.14em] text-[#b8b3aa]">OR</span>
                      <span className="h-px flex-1 bg-[#d9d5cc]" />
                    </div>

                    <HoverTapButton type="button" disabled={loading} variant="outline" className="h-14 w-full rounded-full border-0 bg-[#ddd8d0] text-lg text-[#2d2d2d] hover:bg-[#d5d0c8]" onClick={handleGoogleVerify}>
                      <GoogleIcon />
                      Sign in with Google
                    </HoverTapButton>
                  </motion.div>
                </motion.form>

                <div className="mt-7 text-center text-sm text-[#4e544f]">
                  New here?{" "}
                  <button type="button" className="font-semibold text-[#2f4d3d] underline underline-offset-4" onClick={() => setView("signup")}>Create Account</button>
                </div>

                <div className="mt-6 border-t border-[#d8d4cb] pt-5 text-center">
                  <p className="text-xs text-[#656d66]">Access is invitation-based. Contact an admin if you need approval.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signup-shell"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.32 }}
              className="mx-auto h-[90vh] w-full max-w-[1260px] overflow-hidden rounded-3xl border border-white/30 bg-[#f7f4ed]/95 shadow-[0_26px_80px_-20px_rgba(20,30,24,0.55)]"
            >
              <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_1.35fr]">
                <aside className="hidden h-full bg-[#123f2d] p-10 text-[#e8efe9] lg:flex lg:flex-col lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-[#9ec0ad]">Event Sync</p>
                    <h2 className="font-headline mt-8 text-6xl leading-[1.05] tracking-tight">The Path to Alignment Begins Here</h2>
                    <p className="mt-8 max-w-sm text-xl leading-relaxed text-[#a9c1b5]">Step into a synchronized workflow designed for calm precision.</p>
                  </div>
                  <p className="text-sm italic text-[#9ec0ad]">&ldquo;Efficiency is found in the space between the bamboo.&rdquo;</p>
                </aside>

                <div className="h-full overflow-hidden p-7 sm:p-9 lg:p-10">
                  <motion.form
                    onSubmit={handleSignUp}
                    className="signup-scroll h-full space-y-10 overflow-y-auto pr-2"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.section variants={fieldVariants} className="space-y-5">
                      <SectionEyebrow>Section 01</SectionEyebrow>
                      <SectionTitle>Personal Identity</SectionTitle>

                      <div className="grid grid-cols-2 gap-4">
                        <Field label="First Name" id="signup-first" focused={focusedField === "signup-first"}>
                          <Input id="signup-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} onFocus={() => setFocusedField("signup-first")} onBlur={() => setFocusedField(null)} placeholder="E.g. Kenji" className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0" required />
                        </Field>
                        <Field label="Last Name" id="signup-last" focused={focusedField === "signup-last"}>
                          <Input id="signup-last" value={lastName} onChange={(e) => setLastName(e.target.value)} onFocus={() => setFocusedField("signup-last")} onBlur={() => setFocusedField(null)} placeholder="E.g. Sato" className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0" required />
                        </Field>
                      </div>

                      <Field label="Institutional Email" id="signup-email" focused={focusedField === "signup-email"}>
                        <div className="grid grid-cols-[1fr_auto] gap-3">
                          <InputWrapper isFocused={focusedField === "signup-email"}>
                            <Input
                              id="signup-email"
                              type="email"
                              value={signupEmail}
                              onChange={(e) => {
                                setSignupEmail(e.target.value)
                                setEmailVerified(false)
                                setOtpSent(false)
                                setOtpCode("")
                              }}
                              onFocus={() => setFocusedField("signup-email")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="kenji@protocol.org"
                              className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0"
                              required
                            />
                          </InputWrapper>
                          <HoverTapButton
                            type="button"
                            variant="outline"
                            onClick={handleEmailVerify}
                            className={`h-14 rounded-full border px-6 ${emailVerified ? "border-[#4a7c59] bg-[#4a7c59] text-white" : "border-[#8cab97] bg-transparent text-[#4a7c59]"}`}
                          >
                            {emailVerified ? <Check className="size-5" /> : "Verify"}
                          </HoverTapButton>
                        </div>

                        {otpSent && !emailVerified && (
                          <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                            <Input
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="Enter OTP code"
                              className="h-12 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0"
                            />
                            <HoverTapButton
                              type="button"
                              variant="outline"
                              onClick={handleOtpConfirm}
                              className="h-12 rounded-full border border-[#8cab97] bg-transparent px-5 text-[#4a7c59]"
                            >
                              Confirm
                            </HoverTapButton>
                          </div>
                        )}
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Password" id="signup-password" focused={focusedField === "signup-password"}>
                          <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} onFocus={() => setFocusedField("signup-password")} onBlur={() => setFocusedField(null)} placeholder="********" className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0" required />
                        </Field>
                        <Field label="Confirm Password" id="signup-confirm" focused={focusedField === "signup-confirm"}>
                          <Input id="signup-confirm" type="password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} onFocus={() => setFocusedField("signup-confirm")} onBlur={() => setFocusedField(null)} placeholder="********" className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0" required />
                        </Field>
                      </div>
                    </motion.section>

                    <motion.section variants={fieldVariants} className="space-y-5">
                      <SectionEyebrow>Section 02</SectionEyebrow>
                      <SectionTitle>Protocol Details</SectionTitle>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <FieldLabel htmlFor="department">Department</FieldLabel>
                          <div className="relative">
                            <button type="button" className="flex h-14 w-full items-center justify-between rounded-full bg-[#dfdbd3] px-6 text-left text-[22px] text-[#2d2d2d]" onClick={() => setDepartmentOpen((prev) => !prev)}>
                              <span className={`text-base ${department ? "text-[#2d2d2d]" : "text-[#6f7770]"}`}>{department || "Select Department"}</span>
                              <ChevronDown className={`size-5 text-[#6f7770] transition-transform ${departmentOpen ? "rotate-180" : ""}`} />
                            </button>
                            {departmentOpen && (
                              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl border border-[#d5d0c8] bg-[#f5f1ea] p-2 shadow-xl">
                                <div className="max-h-[168px] space-y-1 overflow-y-auto pr-1">
                                  {(departments.length > 0 ? departments : DEPARTMENT_FALLBACK).map((option) => (
                                    <button key={option} type="button" className={`w-full rounded-xl px-3 py-2 text-left text-sm ${department === option ? "bg-[#1c3a2b] text-white" : "bg-transparent text-[#2d2d2d] hover:bg-[#e5dfd5]"}`} onClick={() => { setDepartment(option); setDepartmentOpen(false) }}>
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Field label="Telegram Handle" id="telegram" focused={focusedField === "telegram"}>
                          <Input id="telegram" value={telegramHandle} onChange={(e) => setTelegramHandle(e.target.value)} onFocus={() => setFocusedField("telegram")} onBlur={() => setFocusedField(null)} placeholder="@ handle" className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0" />
                        </Field>
                      </div>
                    </motion.section>

                    <motion.section variants={fieldVariants} className="space-y-4">
                      <SectionEyebrow>Section 03</SectionEyebrow>
                      <SectionTitle>Ecosystem Tools</SectionTitle>
                      <p className="text-sm text-[#7a807a]">Select integrations required for your synchronization.</p>

                      <div className="flex flex-wrap gap-3">
                        {TOOL_OPTIONS.map((tool) => (
                          <button key={tool} type="button" onClick={() => toggleTool(tool)} className={`rounded-full px-5 py-2 text-sm ${selectedTools.includes(tool) ? "bg-[#1c3a2b] text-white" : "bg-[#ece8e0] text-[#2d2d2d]"}`}>
                            {tool}
                          </button>
                        ))}

                        {otherEnabled ? (
                          <div className="rounded-full bg-[#ece8e0] px-4 py-2">
                            <input value={otherTool} onChange={(e) => setOtherTool(e.target.value.slice(0, 10))} placeholder="Other" className="w-[92px] bg-transparent text-sm outline-none" />
                          </div>
                        ) : (
                          <button type="button" onClick={() => setOtherEnabled(true)} className="rounded-full bg-[#ece8e0] px-5 py-2 text-sm text-[#2d2d2d]">Other</button>
                        )}
                      </div>
                    </motion.section>

                    <motion.div variants={fieldVariants} className="space-y-3 pt-2">
                      <HoverTapButton type="submit" disabled={loading} className="h-14 w-full rounded-full bg-[linear-gradient(135deg,#1C3A2B_0%,#4A7C59_100%)] text-lg text-white shadow-[0_12px_28px_-14px_rgba(28,58,43,0.9)]">
                        {loading ? "Creating Account..." : "Create Account"}
                      </HoverTapButton>

                      <HoverTapButton type="button" variant="ghost" className="h-12 w-full rounded-full text-[#2f4d3d]" onClick={() => setView("login")}>
                        Back to Sign In
                      </HoverTapButton>
                    </motion.div>
                  </motion.form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <style jsx global>{`
        .signup-scroll {
          scrollbar-width: thin;
          scrollbar-color: #4a7c59 transparent;
        }
        .signup-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .signup-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .signup-scroll::-webkit-scrollbar-thumb {
          background: #4a7c59;
          border-radius: 9999px;
        }
      `}</style>
    </main>
  )
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.16em] text-[#8f968f]">{children}</p>
}

function Field({ label, id, focused, children }: { label: string; id: string; focused: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputWrapper isFocused={focused}>{children}</InputWrapper>
    </div>
  )
}

function FieldLabel({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return <label htmlFor={htmlFor} className={`block px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8f968f] ${className ?? ""}`}>{children}</label>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-headline text-5xl italic leading-none text-[#1f3f2f]">{children}</h3>
}

function InputWrapper({ isFocused, children }: { isFocused: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      className="rounded-full border border-transparent"
      animate={isFocused ? { borderColor: "rgba(74,124,89,0.55)", boxShadow: "0 0 0 3px rgba(74,124,89,0.2)" } : { borderColor: "transparent", boxShadow: "0 0 0 0 rgba(74,124,89,0)" }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

function HoverTapButton(props: React.ComponentProps<typeof Button>) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
      <Button {...props} />
    </motion.div>
  )
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  )
}

function getUrlErrorMessage(urlError: string) {
  if (urlError === "not_registered") return "You have not been added to Event Sync. Contact your admin."
  if (urlError === "pending_approval") return "Your account is pending admin approval"
  if (urlError === "access_rejected") return "Your account has not been approved. Contact an admin."
  if (urlError === "auth_failed") return "Authentication failed. Please try again."
  return null
}
