"use client"

import { motion, type Variants } from "motion/react"
import { ChevronDown } from "lucide-react"
import { Input } from "~/app/_components/ui/input"
import { Field, FieldLabel, HoverTapButton, SectionEyebrow, SectionTitle } from "./auth-atoms"

const TOOL_OPTIONS = ["Figma", "Notion", "Canva", "Slides", "GitHub", "Slack"]
const DEPARTMENT_FALLBACK = ["Software", "Operations", "Design", "Publicity", "Partnerships"]

interface SignupFormProps {
  loading: boolean
  focusedField: string | null
  firstName: string
  lastName: string
  signupEmail: string
  signupPassword: string
  signupConfirmPassword: string
  telegramHandle: string
  departments: string[]
  department: string
  departmentOpen: boolean
  selectedTools: string[]
  otherEnabled: boolean
  otherTool: string
  formVariants: Variants
  fieldVariants: Variants
  onFocus: (id: string) => void
  onBlur: () => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  setFirstName: (v: string) => void
  setLastName: (v: string) => void
  setSignupEmail: (v: string) => void
  setSignupPassword: (v: string) => void
  setSignupConfirmPassword: (v: string) => void
  setTelegramHandle: (v: string) => void
  setDepartment: (v: string) => void
  setDepartmentOpen: (v: boolean) => void
  toggleTool: (tool: string) => void
  setOtherEnabled: (v: boolean) => void
  setOtherTool: (v: string) => void
}

export function SignupForm({
  loading,
  focusedField,
  firstName,
  lastName,
  signupEmail,
  signupPassword,
  signupConfirmPassword,
  telegramHandle,
  departments,
  department,
  departmentOpen,
  selectedTools,
  otherEnabled,
  otherTool,
  formVariants,
  fieldVariants,
  onFocus,
  onBlur,
  onSubmit,
  onBack,
  setFirstName,
  setLastName,
  setSignupEmail,
  setSignupPassword,
  setSignupConfirmPassword,
  setTelegramHandle,
  setDepartment,
  setDepartmentOpen,
  toggleTool,
  setOtherEnabled,
  setOtherTool,
}: SignupFormProps) {
  return (
    <motion.form
      key="signup-form"
      onSubmit={onSubmit}
      className="signup-scroll h-full space-y-10 overflow-y-auto pr-2"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8 }}
    >
      <motion.section variants={fieldVariants} className="space-y-5">
        <SectionEyebrow>Section 01</SectionEyebrow>
        <SectionTitle>Personal Identity</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" id="signup-first" focused={focusedField === "signup-first"}>
            <Input
              id="signup-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => onFocus("signup-first")}
              onBlur={onBlur}
              placeholder="E.g. Kenji"
              className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0"
              required
            />
          </Field>
          <Field label="Last Name" id="signup-last" focused={focusedField === "signup-last"}>
            <Input
              id="signup-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={() => onFocus("signup-last")}
              onBlur={onBlur}
              placeholder="E.g. Sato"
              className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0"
              required
            />
          </Field>
        </div>

        <Field label="Institutional Email" id="signup-email" focused={focusedField === "signup-email"}>
          <Input
            id="signup-email"
            type="email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            onFocus={() => onFocus("signup-email")}
            onBlur={onBlur}
            placeholder="kenji@protocol.org"
            className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Password" id="signup-password" focused={focusedField === "signup-password"}>
            <Input
              id="signup-password"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              onFocus={() => onFocus("signup-password")}
              onBlur={onBlur}
              placeholder="********"
              className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0"
              required
            />
          </Field>
          <Field label="Confirm Password" id="signup-confirm" focused={focusedField === "signup-confirm"}>
            <Input
              id="signup-confirm"
              type="password"
              value={signupConfirmPassword}
              onChange={(e) => setSignupConfirmPassword(e.target.value)}
              onFocus={() => onFocus("signup-confirm")}
              onBlur={onBlur}
              placeholder="********"
              className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0"
              required
            />
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
              <button
                type="button"
                className="flex h-14 w-full items-center justify-between rounded-full bg-[#dfdbd3] px-6 text-left text-[22px] text-[#2d2d2d]"
                onClick={() => setDepartmentOpen(!departmentOpen)}
              >
                <span className={`text-base ${department ? "text-[#2d2d2d]" : "text-[#6f7770]"}`}>
                  {department || "Select Department"}
                </span>
                <ChevronDown className={`size-5 text-[#6f7770] transition-transform ${departmentOpen ? "rotate-180" : ""}`} />
              </button>
              {departmentOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl border border-[#d5d0c8] bg-[#f5f1ea] p-2 shadow-xl">
                  <div className="max-h-[168px] space-y-1 overflow-y-auto pr-1">
                    {(departments.length > 0 ? departments : DEPARTMENT_FALLBACK).map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm ${department === option ? "bg-[#1c3a2b] text-white" : "bg-transparent text-[#2d2d2d] hover:bg-[#e5dfd5]"}`}
                        onClick={() => { setDepartment(option); setDepartmentOpen(false) }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Field label="Telegram Handle" id="telegram" focused={focusedField === "telegram"}>
            <Input
              id="telegram"
              value={telegramHandle}
              onChange={(e) => setTelegramHandle(e.target.value)}
              onFocus={() => onFocus("telegram")}
              onBlur={onBlur}
              placeholder="@ handle"
              className="h-14 rounded-full border-0 bg-[#dfdbd3] px-6 shadow-none focus-visible:ring-0"
            />
          </Field>
        </div>
      </motion.section>

      <motion.section variants={fieldVariants} className="space-y-4">
        <SectionEyebrow>Section 03</SectionEyebrow>
        <SectionTitle>Ecosystem Tools</SectionTitle>
        <p className="text-sm text-[#7a807a]">Select integrations required for your synchronization.</p>

        <div className="flex flex-wrap gap-3">
          {TOOL_OPTIONS.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => toggleTool(tool)}
              className={`rounded-full px-5 py-2 text-sm ${selectedTools.includes(tool) ? "bg-[#1c3a2b] text-white" : "bg-[#ece8e0] text-[#2d2d2d]"}`}
            >
              {tool}
            </button>
          ))}
          {otherEnabled ? (
            <div className="rounded-full bg-[#ece8e0] px-4 py-2">
              <input
                value={otherTool}
                onChange={(e) => setOtherTool(e.target.value.slice(0, 10))}
                placeholder="Other"
                className="w-[92px] bg-transparent text-sm outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOtherEnabled(true)}
              className="rounded-full bg-[#ece8e0] px-5 py-2 text-sm text-[#2d2d2d]"
            >
              Other
            </button>
          )}
        </div>
      </motion.section>

      <motion.div variants={fieldVariants} className="space-y-3 pt-2">
        <HoverTapButton
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-full bg-[linear-gradient(135deg,#1C3A2B_0%,#4A7C59_100%)] text-lg text-white shadow-[0_12px_28px_-14px_rgba(28,58,43,0.9)]"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </HoverTapButton>

        <HoverTapButton
          type="button"
          variant="ghost"
          className="h-12 w-full rounded-full text-[#2f4d3d]"
          onClick={onBack}
        >
          Back to Sign In
        </HoverTapButton>
      </motion.div>
    </motion.form>
  )
}
