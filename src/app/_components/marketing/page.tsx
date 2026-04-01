"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BentoSection } from "./BentoSection";
import { CTABanner } from "./CTABanner";
import { BlurHeading } from "./BlurHeading";
import { CARD_SHADOW, HERO_BG } from "./constants";

// ── Testimonials data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Event Sync transformed how our chapter tracks progress. The calm, intentional design keeps everyone focused.",
    author: "Amara Chen",
    city: "San Francisco",
    service: "Admin Dashboard",
    stars: 5,
  },
  {
    quote: "Finally, a tool that feels as thoughtful as the community it serves. I always know where I stand.",
    author: "Marcus Osei",
    city: "London",
    service: "Member Portal",
    stars: 5,
  },
  {
    quote: "The kanban board made coordinating our annual gala effortless. Everything flows naturally.",
    author: "Priya Nair",
    city: "Singapore",
    service: "Kanban Board",
    stars: 5,
  },
  {
    quote: "I love how the deadline colours shift as dates approach. It's anxiety-free accountability.",
    author: "Diego Alvarez",
    city: "Buenos Aires",
    service: "Attendance Tracker",
    stars: 5,
  },
  {
    quote: "Our exco team cut planning meetings in half because everyone checks Event Sync first.",
    author: "Keiko Tanaka",
    city: "Tokyo",
    service: "Admin Dashboard",
    stars: 5,
  },
  {
    quote: "The wabi-sabi aesthetic isn't just pretty — it genuinely reduces stress during crunch week.",
    author: "Fatima Al-Hassan",
    city: "Dubai",
    service: "Member Portal",
    stars: 5,
  },
  {
    quote: "Setting up events takes minutes, not hours. The team is always aligned without extra nudges.",
    author: "Noah Williams",
    city: "Melbourne",
    service: "Kanban Board",
    stars: 5,
  },
  {
    quote: "Progress tracking used to be a spreadsheet nightmare. Event Sync made it almost meditative.",
    author: "Zara Khan",
    city: "Karachi",
    service: "Attendance Tracker",
    stars: 5,
  },
  {
    quote: "The bamboo aesthetic keeps us grounded. Even deadline days feel manageable now.",
    author: "Luca Romano",
    city: "Milan",
    service: "Admin Dashboard",
    stars: 5,
  },
];

// ── Star rating ──────────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
      ))}
    </div>
  );
}

// ── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[0] }) {
  return (
    <div className="rounded-3xl p-6 mb-4 flex flex-col gap-4" style={{ background: "var(--cream-white)", ...CARD_SHADOW }}>
      <Stars count={t.stars} />
      <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "15px", color: "var(--charcoal-ink)", lineHeight: 1.6 }}>
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "14px", color: "var(--charcoal-ink)" }}>{t.author}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)" }}>{t.city}</p>
        </div>
        <span
          className="rounded-full px-3 py-1"
          style={{ background: "rgba(168,197,160,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--bamboo-green)" }}
        >
          {t.service}
        </span>
      </div>
    </div>
  );
}

// ── Testimonials Section ─────────────────────────────────────────────────────
function TestimonialsSection() {
  const col1 = [...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(0, 3)];
  const col2 = [...TESTIMONIALS.slice(3, 6), ...TESTIMONIALS.slice(3, 6)];
  const col3 = [...TESTIMONIALS.slice(6, 9), ...TESTIMONIALS.slice(6, 9)];

  return (
    <section id="testimonials" className="py-24" style={{ background: "var(--ivory-paper)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <BlurHeading as="p" className="bamboo-label mb-3 block" delay={0.2}>
            Community Voices
          </BlurHeading>
          <BlurHeading
            as="h2"
            delay={0.4}
            style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: "var(--deep-forest)", lineHeight: 1.2 }}
          >
            Trusted by communities worldwide
          </BlurHeading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ height: "600px", overflow: "hidden", position: "relative" }}>
          <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{ height: "128px", background: "linear-gradient(to bottom, var(--ivory-paper), transparent)" }} />
          <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{ height: "128px", background: "linear-gradient(to top, var(--ivory-paper), transparent)" }} />
          <div className="animate-scroll-down">
            {col1.map((t, i) => <TestimonialCard key={`${t.author}-${i}`} t={t} />)}
          </div>
          <div className="hidden md:block animate-scroll-up">
            {col2.map((t, i) => <TestimonialCard key={`${t.author}-${i}`} t={t} />)}
          </div>
          <div className="hidden md:block animate-scroll-down">
            {col3.map((t, i) => <TestimonialCard key={`${t.author}-${i}`} t={t} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Newsletter Section ───────────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-24" style={{ background: "var(--deep-forest)" }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="bamboo-label mb-4 block" style={{ color: "var(--sage-mist)" }}>
          Stay in the loop
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: "var(--ivory-paper)", lineHeight: 1.2, marginBottom: "12px" }}>
          Join The Sync Newsletter
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", color: "var(--stone-grey)", lineHeight: 1.6, marginBottom: "32px" }}>
          Monthly insights on community event management, product updates, and wabi-sabi leadership.
        </p>
        {submitted ? (
          <div className="flex flex-col items-center gap-4 animate-blur-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(74,124,89,0.25)" }}>
              <CheckCircle2 size={32} color="var(--bamboo-green)" />
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "var(--ivory-paper)" }}>
              You&apos;re in! Welcome to The Sync.
            </p>
          </div>
        ) : (
          <>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-full px-6 py-4 es-input transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(8px)", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "var(--ivory-paper)" }}
              />
              <button
                type="submit"
                className="rounded-full px-8 py-4 transition-all duration-300 hover:scale-[1.02] hover:brightness-105 whitespace-nowrap"
                style={{ background: "var(--accent-gold)", color: "var(--deep-forest)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "15px" }}
              >
                Subscribe →
              </button>
            </form>
            <p className="mt-4" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)" }}>
              No spam. One email a month. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

// ── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY * 0.3;
      const img = heroRef.current.querySelector<HTMLDivElement>(".parallax-bg");
      if (img) img.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); }); },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: "var(--ivory-paper)" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="parallax-bg absolute inset-0 will-change-transform"
          style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center", transform: "translateY(0)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #1C3A2B, rgba(28,58,43,0.55), transparent)" }} />

        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <p className="bamboo-label mb-6 block animate-blur-in" style={{ color: "var(--sage-mist)", animationDelay: "0.2s", opacity: 0 }}>
            Community Event Tracking
          </p>
          <h1
            className="animate-blur-in"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, color: "var(--ivory-paper)", lineHeight: 1.15, marginBottom: "24px", animationDelay: "0.4s", opacity: 0 }}
          >
            Track Every Event.
            <br />
            Never Miss Progress.
          </h1>
          <p
            className="animate-blur-in"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", color: "rgba(245,240,232,0.82)", lineHeight: 1.65, marginBottom: "40px", animationDelay: "0.6s", opacity: 0 }}
          >
            Event Sync brings calm clarity to community event management. Admins and members always know exactly where they stand — in one beautifully simple dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-blur-in" style={{ animationDelay: "0.8s", opacity: 0 }}>
            <button
              onClick={() => router.push("/dashboard")}
              className="group flex items-center gap-3 rounded-full px-8 py-4 transition-all duration-300 hover:scale-[1.02] hover:brightness-105"
              style={{ background: "var(--accent-gold)", color: "var(--deep-forest)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "16px" }}
            >
              Get Started Free
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              className="rounded-full px-8 py-4 border-2 transition-all duration-300"
              style={{ borderColor: "rgba(245,240,232,0.48)", color: "var(--ivory-paper)", fontFamily: "'DM Sans', sans-serif", fontSize: "16px", backdropFilter: "blur(8px)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
            >
              See How It Works
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--stone-grey)" }}>
            Scroll
          </p>
          <div className="animate-pulse-line rounded-full" style={{ width: "2px", height: "40px", background: "var(--bamboo-green)" }} />
        </div>
      </section>

      <BentoSection />
      <TestimonialsSection />
      <CTABanner />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
