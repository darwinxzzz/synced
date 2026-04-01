"use client";
import Image from "next/image";
import { BarChart3, Users, CalendarCheck, Zap } from "lucide-react";
import { BlurHeading } from "./BlurHeading";
import { CARD_SHADOW, BAMBOO_BG, ZEN_BG, KYOTO_BG } from "./constants";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Real-Time Progress",
    desc: "Track every member's event contribution as it happens, with live updates and clear visual indicators.",
  },
  {
    icon: Users,
    title: "Dual Role System",
    desc: "Seamless Admin (Exco) and Member views — each person sees exactly what they need, nothing more.",
  },
  {
    icon: CalendarCheck,
    title: "Deadline Awareness",
    desc: "Colour-coded urgency signals keep the whole team gently aware of approaching deadlines.",
  },
  {
    icon: Zap,
    title: "Instant Kanban",
    desc: "Drag-and-drop task boards per event, organised by department and assignee — zero setup friction.",
  },
];

export function BentoSection() {
  return (
    <section className="py-24" style={{ background: "var(--ivory-paper)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <BlurHeading as="p" className="bamboo-label mb-3 block" delay={0.1}>
            Everything you need
          </BlurHeading>
          <BlurHeading
            as="h2"
            delay={0.3}
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 600,
              color: "var(--deep-forest)",
              lineHeight: 1.2,
            }}
          >
            A dashboard built for community rhythm
          </BlurHeading>
        </div>

        {/* Bento Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-6 mb-16"
          style={{ minHeight: "600px" }}
        >
          {/* Block A — Large */}
          <div
            className="reveal md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{ ...CARD_SHADOW, minHeight: "300px" }}
          >
            <Image
              src={BAMBOO_BG}
              alt="Bamboo forest dashboard background"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(28,58,43,0.7), transparent)" }}
            />
            <div
              className="absolute bottom-4 left-4 right-4 rounded-2xl p-5"
              style={{ background: "var(--cream-white)", ...CARD_SHADOW }}
            >
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "var(--deep-forest)" }}>
                94<span style={{ fontSize: "16px" }}>%</span>
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)" }}>
                Average member attendance rate this season
              </p>
              <div className="flex items-end gap-1 mt-3" style={{ height: "28px" }}>
                {[40, 65, 50, 80, 72, 90, 94].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      background: i === 6 ? "var(--bamboo-green)" : "rgba(74,124,89,0.3)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Block B */}
          <div
            className="reveal md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{ ...CARD_SHADOW, minHeight: "200px" }}
          >
            <Image
              src={ZEN_BG}
              alt="Zen garden"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(28,58,43,0.85), rgba(28,58,43,0.2))" }}
            />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "var(--ivory-paper)", marginBottom: "6px" }}>
                Calm by Design
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.75)", lineHeight: 1.5 }}>
                Wabi-sabi philosophy woven into every interaction
              </p>
            </div>
          </div>

          {/* Block C */}
          <div
            className="reveal md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{ ...CARD_SHADOW, minHeight: "200px", background: "var(--deep-forest)" }}
          >
            <Image
              src={KYOTO_BG}
              alt="Kyoto temple"
              fill
              className="object-cover opacity-40"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className="absolute inset-6 flex flex-col justify-end">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(196,163,90,0.25)" }}>
                <Zap size={20} color="var(--accent-gold)" />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "var(--ivory-paper)", marginBottom: "6px" }}>
                Instant Kanban
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.7)", lineHeight: 1.5 }}>
                Drag-and-drop task boards per event
              </p>
            </div>
          </div>

          {/* Block D */}
          <div
            className="reveal md:col-span-2 md:row-span-1 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "var(--cream-white)", ...CARD_SHADOW, minHeight: "200px" }}
          >
            <div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(168,197,160,0.4)" }}>
                <BarChart3 size={20} color="var(--bamboo-green)" />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "var(--charcoal-ink)", marginBottom: "8px" }}>
                Progress at a glance
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--stone-grey)", lineHeight: 1.6 }}>
                Every event shows completion bars, deadline colour codes, and open task counts — all without clicking deeper.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap mt-4">
              {["Real-time", "Multi-role", "Zero friction"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1"
                  style={{ background: "rgba(168,197,160,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: "var(--bamboo-green)", letterSpacing: "0.05em" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature cards 2×2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="reveal rounded-3xl p-8 flex gap-5 items-start transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ background: "var(--cream-white)", ...CARD_SHADOW, transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(168,197,160,0.35)" }}>
                <Icon size={22} color="var(--bamboo-green)" />
              </div>
              <div>
                <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", fontWeight: 600, color: "var(--charcoal-ink)", marginBottom: "6px" }}>
                  {title}
                </h4>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "var(--stone-grey)", lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
