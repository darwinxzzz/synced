"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/app/_components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/app/_components/ui/input-otp"
import { HoverTapButton } from "./auth-atoms"

interface MfaModalProps {
  open: boolean
  loading: boolean
  code: string
  onCodeChange: (v: string) => void
  onVerify: () => void
  onOpenChange: (open: boolean) => void
}

export function MfaModal({ open, loading, code, onCodeChange, onVerify, onOpenChange }: MfaModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border border-[#d8d4cb] bg-[#fffdf8] p-8 shadow-[0_26px_80px_-20px_rgba(20,30,24,0.55)]">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="font-headline text-2xl italic text-[#052417]">
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4e544f]">
            Enter the 6-digit code from your authenticator app.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <InputOTP maxLength={6} value={code} onChange={onCodeChange}>
            <InputOTPGroup className="gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 border-0 bg-[#ddd8d0] text-lg text-[#1d1c17] first:rounded-l-2xl last:rounded-r-2xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <HoverTapButton
          type="button"
          onClick={onVerify}
          disabled={loading || code.length !== 6}
          className="h-14 w-full rounded-full bg-[linear-gradient(135deg,#1C3A2B_0%,#4A7C59_100%)] text-lg text-white shadow-[0_12px_28px_-14px_rgba(28,58,43,0.9)]"
        >
          {loading ? "Verifying..." : "Verify"}
        </HoverTapButton>
      </DialogContent>
    </Dialog>
  )
}
