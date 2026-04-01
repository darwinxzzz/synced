"use client";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Users, CalendarCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { BlurHeading } from "./BlurHeading";
import { HERO_BG } from "./constants";

const CTA_PROPS = [
  {
    icon: CheckCircle2,
    title: "No spreadsheets",
    desc: "Replace fragmented tracking with one source of truth.",
  },
  {
    icon: Users,
    title: "Everyone aligned",
    desc: "Admin and Member dashboards perfectly in sync.",
  },
  {
    icon: CalendarCheck,
    title: "Built for communities",
    desc: "Designed for clubs, chapters, and volunteer groups.",
  },
];

export function CTABanner() {
  const router = useRouter();

  return (
    <section className="py-24" style={{ background: "var(--ivory-paper)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="reveal rounded-3xl overflow-hidden relative" style={{ minHeight: "400px" }}>
          <Image
            src={HERO_BG}
            alt="Arashiyama bamboo grove"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, #1C3A2B, rgba(28,58,43,0.85), rgba(28,58,43,0.2))" }}
          />
          <div className="relative z-10 p-12 lg:p-16 max-w-lg">
            <BlurHeading
              as="h2"
              delay={0.2}
              style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: "var(--ivory-paper)", lineHeight: 1.2, marginBottom: "32px" }}
            >
              Ready to bring calm to your community events?
            </BlurHeading>

            <div className="flex flex-col gap-5 mb-10">
              {CTA_PROPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="reveal flex items-start gap-4" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(196,163,90,0.2)" }}>
                    <Icon size={17} color="var(--accent-gold)" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "15px", color: "var(--ivory-paper)" }}>
                      {title}
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(245,240,232,0.7)" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="group flex items-center gap-3 rounded-full px-8 py-4 transition-all duration-300 hover:scale-[1.02] hover:brightness-105"
              style={{ background: "var(--accent-gold)", color: "var(--deep-forest)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "16px" }}
            >
              Start for Free
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
