"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "~/lib/supabase/client"

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function getUrlErrorMessage() {
    if (urlError === "not_registered")
      return "You haven't been added to Event Sync. Contact your admin."
    if (urlError === "auth_failed")
      return "Authentication failed. Please try again."
    return null
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (!profile) {
        await supabase.auth.signOut()
        setError("You haven't been added to Event Sync. Contact your admin.")
        setLoading(false)
        return
      }

      router.push(profile.role === "admin" ? "/admin/dashboard" : "/member/dashboard")
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  const displayError = error ?? getUrlErrorMessage()

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--ivory-paper)" }}>
      {/* Left — bamboo photo */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(28,58,43,0.75) 0%, rgba(74,124,89,0.48) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <p
            className="text-sm uppercase tracking-widest mb-3"
            style={{ color: "var(--sage-mist)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Event Sync
          </p>
          <h2
            className="text-3xl leading-snug mb-4"
            style={{ color: "var(--ivory-paper)", fontFamily: "'Playfair Display', serif" }}
          >
            A sanctuary for seamless coordination.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.72)" }}>
            Integrated kanban, attendance tracking, and reflections — designed with Wabi-sabi minimalism.
          </p>
        </div>
      </div>

      {/* Right — sign in panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md mb-8">
          <span
            className="text-lg font-semibold"
            style={{ color: "var(--deep-forest)", fontFamily: "'Playfair Display', serif" }}
          >
            🎋 Event Sync
          </span>
        </div>

        <div
          className="w-full max-w-md rounded-2xl p-8 card-shadow"
          style={{ backgroundColor: "var(--cream-white)" }}
        >
          <h1
            className="text-2xl mb-1"
            style={{ color: "var(--charcoal-ink)", fontFamily: "'Playfair Display', serif" }}
          >
            Welcome back
          </h1>
          <p className="text-sm mb-7" style={{ color: "var(--stone-grey)" }}>
            Sign in to your workspace
          </p>

          {displayError && (
            <div
              role="alert"
              className="mb-5 rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: "#FEE2E2", color: "var(--deadline-red)" }}
            >
              {displayError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: "var(--bamboo-green)" }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@sgyouthai.org"
                required
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  backgroundColor: "var(--ivory-paper)",
                  color: "var(--charcoal-ink)",
                  border: "1.5px solid transparent",
                }}
                onFocus={(e) => (e.currentTarget.style.border = "1.5px solid var(--bamboo-green)")}
                onBlur={(e) => (e.currentTarget.style.border = "1.5px solid transparent")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs uppercase tracking-widest"
                  style={{ color: "var(--bamboo-green)" }}
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs hover:underline"
                  style={{ color: "var(--stone-grey)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Forgot?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  backgroundColor: "var(--ivory-paper)",
                  color: "var(--charcoal-ink)",
                  border: "1.5px solid transparent",
                }}
                onFocus={(e) => (e.currentTarget.style.border = "1.5px solid var(--bamboo-green)")}
                onBlur={(e) => (e.currentTarget.style.border = "1.5px solid transparent")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold tracking-wide transition-opacity disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, var(--deep-forest) 0%, var(--bamboo-green) 100%)",
                color: "var(--ivory-paper)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--sage-mist)" }} />
            <span className="text-xs" style={{ color: "var(--stone-grey)" }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--sage-mist)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-sm font-medium border transition-colors disabled:opacity-60"
            style={{
              backgroundColor: "var(--ivory-paper)",
              color: "var(--charcoal-ink)",
              borderColor: "var(--sage-mist)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ece8df")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--ivory-paper)")}
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <p className="text-center text-xs mt-6" style={{ color: "var(--stone-grey)" }}>
            Access is by invitation only. Contact your admin to get added.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}
