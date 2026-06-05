"use client"

import { AnimatePresence, motion } from "motion/react"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Input } from "~/app/_components/ui/input"
import { createClient } from "~/lib/supabase/client"
import { FieldLabel, GoogleIcon, HoverTapButton, InputWrapper } from "./_components/auth-atoms"
import { MfaEnrollPanel } from "./_components/MfaEnrollPanel"
import { MfaModal } from "./_components/MfaModal"
import { SignupForm } from "./_components/SignupForm"

type AuthView = "login" | "signup" | "enroll" | "recovery"

const DEPARTMENT_FALLBACK = ["Software", "Monthly Meet-Up", "Inspire", "Publicity", "Connectors"]

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

  // ── Login ────────────────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showMfaModal, setShowMfaModal] = useState(false)
  const [mfaCode, setMfaCode] = useState("")
  const [mfaFactorId, setMfaFactorId] = useState("")

  // ── Signup ───────────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  const [telegramHandle, setTelegramHandle] = useState("")
  const [departments, setDepartments] = useState<string[]>([])
  const [department, setDepartment] = useState("")
  const [departmentOpen, setDepartmentOpen] = useState(false)
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [otherEnabled, setOtherEnabled] = useState(false)
  const [otherTool, setOtherTool] = useState("")

  // ── TOTP Enrollment ──────────────────────────────────────────────────────────
  const [enrollQrCode, setEnrollQrCode] = useState("")
  const [enrollSecret, setEnrollSecret] = useState("")
  const [enrollFactorId, setEnrollFactorId] = useState("")
  const [enrollCode, setEnrollCode] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState("")
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("")
  const [recoveryReady, setRecoveryReady] = useState(false)

  const formVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, when: "beforeChildren" } },
      exit: { opacity: 0, y: -8 },
    }),
    [],
  )

  const fieldVariants = useMemo(
    () => ({ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }),
    [],
  )

  useEffect(() => {
    if (!urlError || shownErrorRef.current === urlError) return
    const message = getUrlErrorMessage(urlError)
    if (message) { toast.error(message); shownErrorRef.current = urlError }
  }, [urlError])

  useEffect(() => {
    if (typeof window === "undefined") return
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const hashErrorCode = hashParams.get("error_code")
    if (!hashErrorCode) return
    if (hashErrorCode === "otp_expired") toast.error("That email link is expired.")
    else if (hashErrorCode === "access_denied") toast.error("Email verification failed. Please request a new code.")
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
  }, [])

  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode !== "recovery") return

    let active = true

    const prepareRecovery = async () => {
      setLoading(true)
      const supabase = createClient()
      const code = searchParams.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          toast.error("That password reset link is invalid or expired.")
          if (active) {
            setLoading(false)
            setRecoveryReady(false)
            setView("login")
          }
          router.replace("/login")
          return
        }
      }

      const hashParams = typeof window === "undefined"
        ? new URLSearchParams()
        : new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const recoveryType = searchParams.get("type") ?? hashParams.get("type")
      const hasRecoveryToken = Boolean(code ?? hashParams.get("access_token"))
      const { data } = await supabase.auth.getSession()

      if (!hasRecoveryToken && recoveryType !== "recovery" && !data.session) {
        toast.error("That password reset link is invalid or expired.")
        if (active) {
          setLoading(false)
          setRecoveryReady(false)
          setView("login")
        }
        router.replace("/login")
        return
      }

      if (!active) return

      setRecoveryPassword("")
      setRecoveryConfirmPassword("")
      setRecoveryReady(true)
      setView("recovery")
      setLoading(false)
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, `${window.location.pathname}?mode=recovery`)
      }
    }

    void prepareRecovery()

    return () => {
      active = false
    }
  }, [router, searchParams])

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

  async function redirectAfterLogin(supabase: ReturnType<typeof createClient>, userId: string) {
    const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", userId).single()
    if (!profile) { await supabase.auth.signOut(); toast.error("You have not been added to Synced. Contact your admin."); return }
    //if (profile.status === "pending") { await supabase.auth.signOut(); toast.error("Your account is pending admin approval"); return }
    if (profile.status === "rejected" || profile.status === "inactive"|| profile.status === "pending") { await supabase.auth.signOut(); toast.error("Your account has not been approved."); return }
    if (profile.status !== "active") { await supabase.auth.signOut(); toast.error("Your account is pending admin approval"); return }
    router.push(profile.role === "admin" ? "/admin/dashboard" : "/member/dashboard")
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (signInError) { toast.error(signInError.message); setLoading(false); return }
    if (!data.user) { toast.error("Unable to sign in. Please try again."); setLoading(false); return }

    const { data: factorsData } = await supabase.auth.mfa.listFactors()
    const totpFactor = factorsData?.totp?.[0]
    if (totpFactor) { setMfaFactorId(totpFactor.id); setMfaCode(""); setShowMfaModal(true); setLoading(false); return }

    const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" })
    if (enrollError) { toast.error(enrollError.message); setLoading(false); return }
    setEnrollQrCode(enrollData.totp.qr_code)
    setEnrollSecret(enrollData.totp.secret)
    setEnrollFactorId(enrollData.id)
    setEnrollCode("")
    setShowSecret(false)
    setView("enroll")
    setLoading(false)
  }

  async function handleMfaVerify() {
    if (!/^\d{6}$/.test(mfaCode)) { toast.error("Enter a valid 6-digit code."); return }
    setLoading(true)
    const supabase = createClient()
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
    if (challengeError) { toast.error(challengeError.message); setLoading(false); return }
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challengeData.id, code: mfaCode })
    if (verifyError) { toast.error(verifyError.message); setMfaCode(""); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("Session error. Please sign in again."); setShowMfaModal(false); setLoading(false); return }
    setShowMfaModal(false)
    await redirectAfterLogin(supabase, user.id)
    setLoading(false)
  }

  async function handleMfaModalClose(open: boolean) {
    if (open) return
    const supabase = createClient()
    await supabase.auth.signOut()
    setShowMfaModal(false)
    setMfaCode("")
    setMfaFactorId("")
  }

  async function handleGoogleVerify() {
    setLoading(true)
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (oauthError) { toast.error(oauthError.message); setLoading(false) }
  }

  async function handleForgotPassword() { 
    if (!loginEmail) { toast.error("Enter your email address first."); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/login?mode=recovery`,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success("Password reset email sent. Check your inbox.")
    setLoading(false)
  }

  async function handlePasswordRecovery(e: React.FormEvent) {
    e.preventDefault()
    if (!recoveryReady) { toast.error("Open the password reset link from your email to continue."); return }
    if (recoveryPassword !== recoveryConfirmPassword) { toast.error("Passwords do not match."); return }
    if (recoveryPassword.length < 8) { toast.error("Password must be at least 8 characters."); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: recoveryPassword })
    if (error) { toast.error(error.message); setLoading(false); return }

    await supabase.auth.signOut()
    toast.success("Password updated. Sign in with your new password.")
    setRecoveryPassword("")
    setRecoveryConfirmPassword("")
    setRecoveryReady(false)
    setView("login")
    setLoading(false)
    router.replace("/login")
  }

  function toggleTool(tool: string) {
    setSelectedTools((prev) => prev.includes(tool) ? prev.filter((v) => v !== tool) : [...prev, tool])
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!department) { toast.error("Please select a department."); return }
    if (signupPassword !== signupConfirmPassword) { toast.error("Passwords do not match"); return }
    if (signupPassword.length < 8) { toast.error("Password must be at least 8 characters"); return }
    setLoading(true)
    const supabase = createClient()
    const fullName = `${firstName} ${lastName}`.trim()
    const tools = otherTool.trim() ? [...selectedTools.filter((t) => t !== otherTool.trim()), otherTool.trim()] : selectedTools
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: signupEmail.trim().toLowerCase(),
      password: signupPassword,
      options: { data: { full_name: fullName, department, telegram_handle: telegramHandle, tools } },
    })
    if (signUpError) { toast.error(signUpError.message); setLoading(false); return }
    const user = signUpData.user
    if (!user) { toast.error("Unable to create account. Please try again."); setLoading(false); return }
    await supabase.from("profiles").update({ name: fullName || signupEmail, department }).eq("id", user.id)
    await supabase.auth.signOut()
    toast.success("Account created! Sign in to set up your authenticator app.")
    setLoginEmail(signupEmail.trim().toLowerCase())
    setView("login")
    setLoading(false)
  }

  async function handleEnrollVerify() {
    if (!/^\d{6}$/.test(enrollCode)) { toast.error("Enter a valid 6-digit code from your authenticator app."); return }
    setLoading(true)
    const supabase = createClient()
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrollFactorId })
    if (challengeError) { toast.error(challengeError.message); setLoading(false); return }
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: enrollFactorId, challengeId: challengeData.id, code: enrollCode })
    if (verifyError) { toast.error(verifyError.message); setEnrollCode(""); setLoading(false); return }
    await supabase.auth.signOut()
    toast.success("Authenticator set up! Sign in again to access your workspace.")
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
          {(view === "login" || view === "recovery") && (
            <motion.div
              key={view === "recovery" ? "recovery-shell" : "login-shell"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="ml-auto w-full max-w-md"
            >
              <div className="rounded-3xl border border-white/20 bg-[#fffdf8]/93 p-8 shadow-[0_26px_80px_-20px_rgba(20,30,24,0.55)] backdrop-blur-md md:p-10">
                <h2 className="font-headline text-3xl italic text-[#052417]">
                  {view === "recovery" ? "Reset Password" : "Welcome Back"}
                </h2>
                <p className="mt-2 text-sm text-[#4e544f]">
                  {view === "recovery"
                    ? "Choose a new password for your workspace."
                    : "Sign in to your workspace."}
                </p>

                <motion.form
                  onSubmit={view === "recovery" ? handlePasswordRecovery : handleSignIn}
                  className="mt-8 space-y-5"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {view === "recovery" ? (
                    <>
                      <motion.div variants={fieldVariants}>
                        <FieldLabel htmlFor="recovery-password">New Password</FieldLabel>
                        <InputWrapper isFocused={focusedField === "recovery-password"}>
                          <Input
                            id="recovery-password"
                            type="password"
                            value={recoveryPassword}
                            onChange={(e) => setRecoveryPassword(e.target.value)}
                            onFocus={() => setFocusedField("recovery-password")}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder="Minimum 8 characters"
                            className="h-14 rounded-full border-0 bg-[#ddd8d0] px-6 text-[#1d1c17] shadow-none placeholder:text-[#a9afaa] focus-visible:ring-0"
                          />
                        </InputWrapper>
                      </motion.div>

                      <motion.div variants={fieldVariants}>
                        <FieldLabel htmlFor="recovery-confirm-password">Confirm New Password</FieldLabel>
                        <InputWrapper isFocused={focusedField === "recovery-confirm-password"}>
                          <Input
                            id="recovery-confirm-password"
                            type="password"
                            value={recoveryConfirmPassword}
                            onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedField("recovery-confirm-password")}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder="Re-enter your password"
                            className="h-14 rounded-full border-0 bg-[#ddd8d0] px-6 text-[#1d1c17] shadow-none placeholder:text-[#a9afaa] focus-visible:ring-0"
                          />
                        </InputWrapper>
                      </motion.div>

                      <motion.div variants={fieldVariants} className="space-y-4 pt-3">
                        <HoverTapButton
                          type="submit"
                          disabled={loading || !recoveryReady}
                          className="h-14 w-full rounded-full bg-[linear-gradient(135deg,#1C3A2B_0%,#4A7C59_100%)] text-lg text-white shadow-[0_12px_28px_-14px_rgba(28,58,43,0.9)] hover:opacity-95"
                        >
                          {loading ? "Updating Password..." : "Save New Password"}
                        </HoverTapButton>
                      </motion.div>
                    </>
                  ) : (
                    <>
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
                            placeholder="name@synced.com"
                            className="h-14 rounded-full border-0 bg-[#ddd8d0] px-6 text-[#1d1c17] shadow-none placeholder:text-[#a9afaa] focus-visible:ring-0"
                          />
                        </InputWrapper>
                      </motion.div>

                      <motion.div variants={fieldVariants}>
                        <div className="mb-2 flex items-center justify-between px-1">
                          <FieldLabel htmlFor="login-password" className="mb-0 px-0">Password</FieldLabel>
                          <button
                            type="button"
                            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9aa59b] hover:text-[#4b6546]"
                            onClick={handleForgotPassword}
                          >
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
                        <HoverTapButton
                          type="submit"
                          disabled={loading}
                          className="h-14 w-full rounded-full bg-[linear-gradient(135deg,#1C3A2B_0%,#4A7C59_100%)] text-lg text-white shadow-[0_12px_28px_-14px_rgba(28,58,43,0.9)] hover:opacity-95"
                        >
                          {loading ? "Signing In..." : "Verify"}
                        </HoverTapButton>

                        <div className="flex items-center gap-4 px-1">
                          <span className="h-px flex-1 bg-[#d9d5cc]" />
                          <span className="text-sm tracking-[0.14em] text-[#b8b3aa]">OR</span>
                          <span className="h-px flex-1 bg-[#d9d5cc]" />
                        </div>

                        <HoverTapButton
                          type="button"
                          disabled={loading}
                          variant="outline"
                          className="h-14 w-full rounded-full border-0 bg-[#ddd8d0] text-lg text-[#2d2d2d] hover:bg-[#d5d0c8]"
                          onClick={handleGoogleVerify}
                        >
                          <GoogleIcon />
                          Sign in with Google
                        </HoverTapButton>
                      </motion.div>
                    </>
                  )}
                </motion.form>

                {view === "recovery" ? (
                  <div className="mt-7 text-center text-sm text-[#4e544f]">
                    Remembered it?{" "}
                    <button
                      type="button"
                      className="font-semibold text-[#2f4d3d] underline underline-offset-4"
                      onClick={() => {
                        setRecoveryReady(false)
                        setRecoveryPassword("")
                        setRecoveryConfirmPassword("")
                        router.replace("/login")
                        setView("login")
                      }}
                    >
                      Return to sign in
                    </button>
                  </div>
                ) : (
                  <div className="mt-7 text-center text-sm text-[#4e544f]">
                    New here?{" "}
                    <button
                      type="button"
                      className="font-semibold text-[#2f4d3d] underline underline-offset-4"
                      onClick={() => setView("signup")}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                <div className="mt-6 border-t border-[#d8d4cb] pt-5 text-center">
                  <p className="text-xs text-[#656d66]">
                    Access is invitation-based. Contact an admin if you need approval.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {(view === "signup" || view === "enroll") && (
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
                    <p className="text-sm uppercase tracking-[0.18em] text-[#9ec0ad]">Synced</p>
                    <h2 className="font-headline mt-8 text-6xl leading-[1.05] tracking-tight">
                      {view === "enroll" ? "Secure Your Account" : "The Path to Alignment Begins Here"}
                    </h2>
                    <p className="mt-8 max-w-sm text-xl leading-relaxed text-[#a9c1b5]">
                      {view === "enroll"
                        ? "Set up two-factor authentication to protect your workspace."
                        : "Step into a synchronized workflow designed for calm precision."}
                    </p>
                  </div>
                  <p className="text-sm italic text-[#9ec0ad]">
                    &ldquo;Efficiency is found in the space between the bamboo.&rdquo;
                  </p>
                </aside>

                <div className="h-full overflow-hidden p-7 sm:p-9 lg:p-10">
                  <AnimatePresence mode="wait">
                    {view === "signup" ? (
                      <SignupForm
                        loading={loading}
                        focusedField={focusedField}
                        firstName={firstName}
                        lastName={lastName}
                        signupEmail={signupEmail}
                        signupPassword={signupPassword}
                        signupConfirmPassword={signupConfirmPassword}
                        telegramHandle={telegramHandle}
                        departments={departments}
                        department={department}
                        departmentOpen={departmentOpen}
                        selectedTools={selectedTools}
                        otherEnabled={otherEnabled}
                        otherTool={otherTool}
                        formVariants={formVariants}
                        fieldVariants={fieldVariants}
                        onFocus={setFocusedField}
                        onBlur={() => setFocusedField(null)}
                        onSubmit={handleSignUp}
                        onBack={() => setView("login")}
                        setFirstName={setFirstName}
                        setLastName={setLastName}
                        setSignupEmail={setSignupEmail}
                        setSignupPassword={setSignupPassword}
                        setSignupConfirmPassword={setSignupConfirmPassword}
                        setTelegramHandle={setTelegramHandle}
                        setDepartment={setDepartment}
                        setDepartmentOpen={setDepartmentOpen}
                        toggleTool={toggleTool}
                        setOtherEnabled={setOtherEnabled}
                        setOtherTool={setOtherTool}
                      />
                    ) : (
                      <MfaEnrollPanel
                        qrCode={enrollQrCode}
                        secret={enrollSecret}
                        code={enrollCode}
                        showSecret={showSecret}
                        loading={loading}
                        onCodeChange={setEnrollCode}
                        onToggleSecret={() => setShowSecret((prev) => !prev)}
                        onVerify={handleEnrollVerify}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <MfaModal
        open={showMfaModal}
        loading={loading}
        code={mfaCode}
        onCodeChange={setMfaCode}
        onVerify={handleMfaVerify}
        onOpenChange={handleMfaModalClose}
      />

      <style jsx global>{`
        .signup-scroll { scrollbar-width: thin; scrollbar-color: #4a7c59 transparent; }
        .signup-scroll::-webkit-scrollbar { width: 6px; }
        .signup-scroll::-webkit-scrollbar-track { background: transparent; }
        .signup-scroll::-webkit-scrollbar-thumb { background: #4a7c59; border-radius: 9999px; }
      `}</style>
    </main>
  )
}

function getUrlErrorMessage(urlError: string) {
  if (urlError === "not_registered") return "You have not been added to Synced. Contact your admin."
  if (urlError === "pending_approval") return "Your account is pending admin approval"
  if (urlError === "access_rejected") return "Your account has not been approved. Contact an admin."
  if (urlError === "auth_failed") return "Authentication failed. Please try again."
  return null
}
