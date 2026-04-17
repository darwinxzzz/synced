"use client"

import { motion } from "motion/react"
import { Button } from "~/app/_components/ui/button"

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.16em] text-[#8f968f]">{children}</p>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-headline text-5xl italic leading-none text-[#1f3f2f]">{children}</h3>
  )
}

export function FieldLabel({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8f968f] ${className ?? ""}`}
    >
      {children}
    </label>
  )
}

export function InputWrapper({
  isFocused,
  children,
}: {
  isFocused: boolean
  children: React.ReactNode
}) {
  return (
    <motion.div
      className="rounded-full border border-transparent"
      animate={
        isFocused
          ? { borderColor: "rgba(74,124,89,0.55)", boxShadow: "0 0 0 3px rgba(74,124,89,0.2)" }
          : { borderColor: "transparent", boxShadow: "0 0 0 0 rgba(74,124,89,0)" }
      }
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export function Field({
  label,
  id,
  focused,
  children,
}: {
  label: string
  id: string
  focused: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputWrapper isFocused={focused}>{children}</InputWrapper>
    </div>
  )
}

export function HoverTapButton(props: React.ComponentProps<typeof Button>) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
      <Button {...props} />
    </motion.div>
  )
}

export function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  )
}
