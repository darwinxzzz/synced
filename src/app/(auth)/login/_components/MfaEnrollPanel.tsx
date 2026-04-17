"use client"

import { motion } from "motion/react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/app/_components/ui/input-otp"
import { FieldLabel, HoverTapButton, SectionEyebrow, SectionTitle } from "./auth-atoms"

interface MfaEnrollPanelProps {
  qrCode: string
  secret: string
  code: string
  showSecret: boolean
  loading: boolean
  onCodeChange: (v: string) => void
  onToggleSecret: () => void
  onVerify: () => void
}

export function MfaEnrollPanel({
  qrCode,
  secret,
  code,
  showSecret,
  loading,
  onCodeChange,
  onToggleSecret,
  onVerify,
}: MfaEnrollPanelProps) {
  return (
    <motion.div
      key="enroll-panel"
      className="flex h-full flex-col items-center justify-center gap-8 overflow-y-auto px-2 py-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-sm text-center">
        <SectionEyebrow>Final Step</SectionEyebrow>
        <SectionTitle>Set Up Authenticator</SectionTitle>
        <p className="mt-4 text-sm leading-relaxed text-[#7a807a]">
          Scan the QR code with Google Authenticator, Authy, or any TOTP app.
          Then enter the 6-digit code below to complete setup.
        </p>
      </div>

      {qrCode && (
        <div className="rounded-2xl border border-[#d5d0c8] bg-white p-4 shadow-sm">
          <img src={qrCode} alt="Authenticator QR Code" className="h-48 w-48" />
        </div>
      )}

      <div className="w-full max-w-sm space-y-2">
        <button
          type="button"
          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9aa59b] hover:text-[#4b6546]"
          onClick={onToggleSecret}
        >
          {showSecret ? "Hide" : "Show"} manual setup key
        </button>
        {showSecret && (
          <div className="rounded-2xl bg-[#dfdbd3] px-5 py-3">
            <p className="break-all font-mono text-xs tracking-widest text-[#4a4a40]">{secret}</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm space-y-4">
        <FieldLabel htmlFor="enroll-otp" className="text-center">
          Verification Code
        </FieldLabel>
        <div className="flex justify-center">
          <InputOTP id="enroll-otp" maxLength={6} value={code} onChange={onCodeChange}>
            <InputOTPGroup className="gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 border-0 bg-[#dfdbd3] text-lg text-[#1d1c17] first:rounded-l-2xl last:rounded-r-2xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <HoverTapButton
          type="button"
          disabled={loading || code.length !== 6}
          onClick={onVerify}
          className="h-14 w-full rounded-full bg-[linear-gradient(135deg,#1C3A2B_0%,#4A7C59_100%)] text-lg text-white shadow-[0_12px_28px_-14px_rgba(28,58,43,0.9)]"
        >
          {loading ? "Verifying..." : "Complete Setup"}
        </HoverTapButton>
      </div>
    </motion.div>
  )
}
