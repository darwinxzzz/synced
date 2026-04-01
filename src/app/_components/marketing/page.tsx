import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  Users,
  CalendarCheck,
  Zap,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

// ── Images ──────────────────────────────────────────────────────────────────
const HERO_BG =
  "https://images.unsplash.com/photo-1759519028791-13f7fb5e71aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFzaGl5YW1hJTIwYmFtYm9vJTIwZ3JvdmUlMjBLeW90byUyMHN1bmxpZ2h0fGVufDF8fHx8MTc3NDg5MDE0MHww&ixlib=rb-4.1.0&q=80&w=1920";
const BAMBOO_BG =
  "https://images.unsplash.com/photo-1594349335663-c25034fb807b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW1ib28lMjBmb3Jlc3QlMjBwYXRoJTIwSmFwYW4lMjBncmVlbnxlbnwxfHx8fDE3NzQ4OTAxNDF8MA&ixlib=rb-4.1.0&q=80&w=1080";
const KYOTO_BG =
  "https://images.unsplash.com/photo-1728200696568-cbdcc9a20ad7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKYXBhbiUyMEt5b3RvJTIwdGVtcGxlJTIwc2VyZW5lJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3NDg5MDE0NXww&ixlib=rb-4.1.0&q=80&w=1080";
const ZEN_BG =
  "https://images.unsplash.com/photo-1762932922297-767ca87bfe3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKYXBhbmVzZSUyMHplbiUyMGdhcmRlbiUyMG1pbmltYWwlMjBuYXR1cmV8ZW58MXx8fHwxNzc0ODkwMTQxfDA&ixlib=rb-4.1.0&q=80&w=1080";

const CARD_SHADOW = {
  boxShadow:
    "rgba(14,63,126,0.04) 0px 0px 0px 1px, rgba(42,51,69,0.04) 0px 1px 1px -0.5px, rgba(42,51,70,0.04) 0px 3px 3px -1.5px, rgba(42,51,70,0.04) 0px 6px 6px -3px, rgba(14,63,126,0.04) 0px 12px 12px -6px, rgba(14,63,126,0.04) 0px 24px 24px -12px",
};

// ── Testimonials data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "Event Sync transformed how our chapter tracks progress. The calm, intentional design keeps everyone focused.",
    author: "Amara Chen",
    city: "San Francisco",
    service: "Admin Dashboard",
    stars: 5,
  },
  {
    quote:
      "Finally, a tool that feels as thoughtful as the community it serves. I always know where I stand.",
    author: "Marcus Osei",
    city: "London",
    service: "Member Portal",
    stars: 5,
  },
  {
    quote:
      "The kanban board made coordinating our annual gala effortless. Everything flows naturally.",
    author: "Priya Nair",
    city: "Singapore",
    service: "Kanban Board",
    stars: 5,
  },
  {
    quote:
      "I love how the deadline colours shift as dates approach. It's anxiety-free accountability.",
    author: "Diego Alvarez",
    city: "Buenos Aires",
    service: "Attendance Tracker",
    stars: 5,
  },
  {
    quote:
      "Our exco team cut planning meetings in half because everyone checks Event Sync first.",
    author: "Keiko Tanaka",
    city: "Tokyo",
    service: "Admin Dashboard",
    stars: 5,
  },
  {
    quote:
      "The wabi-sabi aesthetic isn't just pretty — it genuinely reduces stress during crunch week.",
    author: "Fatima Al-Hassan",
    city: "Dubai",
    service: "Member Portal",
    stars: 5,
  },
  {
    quote:
      "Setting up events takes minutes, not hours. The team is always aligned without extra nudges.",
    author: "Noah Williams",
    city: "Melbourne",
    service: "Kanban Board",
    stars: 5,
  },
  {
    quote:
      "Progress tracking used to be a spreadsheet nightmare. Event Sync made it almost meditative.",
    author: "Zara Khan",
    city: "Karachi",
    service: "Attendance Tracker",
    stars: 5,
  },
  {
    quote:
      "The bamboo aesthetic keeps us grounded. Even deadline days feel manageable now.",
    author: "Luca Romano",
    city: "Milan",
    service: "Admin Dashboard",
    stars: 5,
  },
];

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

// ── Scroll reveal hook ──────────────────────────────────────────────────────
// (used via IntersectionObserver in useEffect below)

// ── Blur-in heading (triggers on scroll into view) ──────────────────────────
function BlurHeading({
  children,
  delay = 0,
  as: Tag = "h2",
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTimeout(() => setVisible(true), delay * 1000);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? undefined : 0,
        animation: visible ? `blur-in 0.8s ease-out ${delay}s forwards` : "none",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// ── Star rating ─────────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} fill="#C4A35A" color="#C4A35A" />
      ))}
    </div>
  );
}

// ── Testimonial Card ────────────────────────────────────────────────────────
function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[0] }) {
  return (
    <div
      className="rounded-3xl p-6 mb-4 flex flex-col gap-4"
      style={{ background: "var(--cream-white)", ...CARD_SHADOW }}
    >
      <Stars count={t.stars} />
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "15px",
          color: "var(--charcoal-ink)",
          lineHeight: 1.6,
        }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--charcoal-ink)",
            }}
          >
            {t.author}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              color: "var(--stone-grey)",
            }}
          >
            {t.city}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1"
          style={{
            background: "rgba(168,197,160,0.3)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "var(--bamboo-green)",
          }}
        >
          {t.service}
        </span>
      </div>
    </div>
  );
}

// ── Testimonials Section ────────────────────────────────────────────────────
function TestimonialsSection() {
  const col1 = [...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(0, 3)];
  const col2 = [...TESTIMONIALS.slice(3, 6), ...TESTIMONIALS.slice(3, 6)];
  const col3 = [...TESTIMONIALS.slice(6, 9), ...TESTIMONIALS.slice(6, 9)];

  return (
    <section id="testimonials" className="py-24" style={{ background: "var(--ivory-paper)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <BlurHeading
            as="p"
            className="bamboo-label mb-3 block"
            delay={0.2}
          >
            Community Voices
          </BlurHeading>
          <BlurHeading
            as="h2"
            delay={0.4}
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 600,
              color: "var(--deep-forest)",
              lineHeight: 1.2,
            }}
          >
            Trusted by communities worldwide
          </BlurHeading>
        </div>

        {/* 3 columns */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ height: "600px", overflow: "hidden", position: "relative" }}
        >
          {/* Gradient masks */}
          <div
            className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
            style={{
              height: "128px",
              background:
                "linear-gradient(to bottom, var(--ivory-paper), transparent)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
            style={{
              height: "128px",
              background:
                "linear-gradient(to top, var(--ivory-paper), transparent)",
            }}
          />

          <div className="animate-scroll-down">
            {col1.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
          <div className="hidden md:block animate-scroll-up">
            {col2.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
          <div className="hidden md:block animate-scroll-down">
            {col3.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
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
    <section
      id="contact"
      className="py-24"
      style={{ background: "var(--deep-forest)" }}
    >
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p
          className="bamboo-label mb-4 block"
          style={{ color: "var(--sage-mist)" }}
        >
          Stay in the loop
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 600,
            color: "var(--ivory-paper)",
            lineHeight: 1.2,
            marginBottom: "12px",
          }}
        >
          Join The Sync Newsletter
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "18px",
            color: "var(--stone-grey)",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          Monthly insights on community event management, product updates, and
          wabi-sabi leadership.
        </p>

        {submitted ? (
          <div
            className="flex flex-col items-center gap-4 animate-blur-in"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(74,124,89,0.25)" }}
            >
              <CheckCircle2 size={32} color="var(--bamboo-green)" />
            </div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                color: "var(--ivory-paper)",
              }}
            >
              You&apos;re in! Welcome to The Sync.
            </p>
          </div>
        ) : (
          <>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubmitted(true);
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-full px-6 py-4 es-input transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  backdropFilter: "blur(8px)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  color: "var(--ivory-paper)",
                }}
              />
              <button
                type="submit"
                className="rounded-full px-8 py-4 transition-all duration-300 hover:scale-[1.02] hover:brightness-105 whitespace-nowrap"
                style={{
                  background: "var(--accent-gold)",
                  color: "var(--deep-forest)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
                }}
              >
                Subscribe →
              </button>
            </form>
            <p
              className="mt-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "var(--stone-grey)",
              }}
            >
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

  // Parallax on hero bg
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

  // Scroll reveal for cards
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: "var(--ivory-paper)" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background image (parallax) */}
        <div
          className="parallax-bg absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "translateY(0)",
          }}
        />
        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #1C3A2B, rgba(28,58,43,0.55), transparent)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          {/* Label */}
          <p
            className="bamboo-label mb-6 block animate-blur-in"
            style={{
              color: "var(--sage-mist)",
              animationDelay: "0.2s",
              opacity: 0,
            }}
          >
            Community Event Tracking
          </p>

          {/* Headline */}
          <h1
            className="animate-blur-in"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 700,
              color: "var(--ivory-paper)",
              lineHeight: 1.15,
              marginBottom: "24px",
              animationDelay: "0.4s",
              opacity: 0,
            }}
          >
            Track Every Event.
            <br />
            Never Miss Progress.
          </h1>

          {/* Subtext */}
          <p
            className="animate-blur-in"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "18px",
              color: "rgba(245,240,232,0.82)",
              lineHeight: 1.65,
              marginBottom: "40px",
              animationDelay: "0.6s",
              opacity: 0,
            }}
          >
            Event Sync brings calm clarity to community event management.
            Admins and members always know exactly where they stand — in one
            beautifully simple dashboard.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-blur-in"
            style={{ animationDelay: "0.8s", opacity: 0 }}
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="group flex items-center gap-3 rounded-full px-8 py-4 transition-all duration-300 hover:scale-[1.02] hover:brightness-105"
              style={{
                background: "var(--accent-gold)",
                color: "var(--deep-forest)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              Get Started Free
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
            <button
              className="rounded-full px-8 py-4 border-2 transition-all duration-300"
              style={{
                borderColor: "rgba(245,240,232,0.48)",
                color: "var(--ivory-paper)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "16px",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.08)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "transparent")
              }
            >
              See How It Works
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--stone-grey)",
            }}
          >
            Scroll
          </p>
          <div
            className="animate-pulse-line rounded-full"
            style={{
              width: "2px",
              height: "40px",
              background: "var(--bamboo-green)",
            }}
          />
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section className="py-24" style={{ background: "var(--ivory-paper)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Heading */}
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
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-6 mb-16" style={{ minHeight: "600px" }}>
            {/* Block A — Large */}
            <div
              className="reveal md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{ ...CARD_SHADOW, minHeight: "300px" }}
            >
              <img
                src={BAMBOO_BG}
                alt="Dashboard"
                className="w-full h-full object-cover"
                style={{ minHeight: "300px" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(28,58,43,0.7), transparent)",
                }}
              />
              {/* Stat overlay card */}
              <div
                className="absolute bottom-4 left-4 right-4 rounded-2xl p-5"
                style={{ background: "var(--cream-white)", ...CARD_SHADOW }}
              >
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--deep-forest)",
                  }}
                >
                  94<span style={{ fontSize: "16px" }}>%</span>
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "var(--stone-grey)",
                  }}
                >
                  Average member attendance rate this season
                </p>
                {/* Mini sparkline */}
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
              <img
                src={ZEN_BG}
                alt="Zen"
                className="w-full h-full object-cover"
                style={{ minHeight: "200px" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(28,58,43,0.85), rgba(28,58,43,0.2))",
                }}
              />
              <div className="absolute bottom-6 left-6 right-6">
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--ivory-paper)",
                    marginBottom: "6px",
                  }}
                >
                  Calm by Design
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.75)",
                    lineHeight: 1.5,
                  }}
                >
                  Wabi-sabi philosophy woven into every interaction
                </p>
              </div>
            </div>

            {/* Block C */}
            <div
              className="reveal md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                ...CARD_SHADOW,
                minHeight: "200px",
                background: "var(--deep-forest)",
              }}
            >
              <img
                src={KYOTO_BG}
                alt="Kyoto"
                className="w-full h-full object-cover opacity-40"
                style={{ minHeight: "200px" }}
              />
              <div className="absolute inset-6 flex flex-col justify-end">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "rgba(196,163,90,0.25)" }}
                >
                  <Zap size={20} color="var(--accent-gold)" />
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--ivory-paper)",
                    marginBottom: "6px",
                  }}
                >
                  Instant Kanban
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.7)",
                    lineHeight: 1.5,
                  }}
                >
                  Drag-and-drop task boards per event
                </p>
              </div>
            </div>

            {/* Block D — spans remaining 2 cols */}
            <div
              className="reveal md:col-span-2 md:row-span-1 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "var(--cream-white)", ...CARD_SHADOW, minHeight: "200px" }}
            >
              <div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(168,197,160,0.4)" }}
                >
                  <BarChart3 size={20} color="var(--bamboo-green)" />
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "var(--charcoal-ink)",
                    marginBottom: "8px",
                  }}
                >
                  Progress at a glance
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    color: "var(--stone-grey)",
                    lineHeight: 1.6,
                  }}
                >
                  Every event shows completion bars, deadline colour codes, and
                  open task counts — all without clicking deeper.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap mt-4">
                {["Real-time", "Multi-role", "Zero friction"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1"
                    style={{
                      background: "rgba(168,197,160,0.3)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--bamboo-green)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Feature cards 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="reveal rounded-3xl p-8 flex gap-5 items-start transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{
                  background: "var(--cream-white)",
                  ...CARD_SHADOW,
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(168,197,160,0.35)" }}
                >
                  <Icon size={22} color="var(--bamboo-green)" />
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "var(--charcoal-ink)",
                      marginBottom: "6px",
                    }}
                  >
                    {title}
                  </h4>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "15px",
                      color: "var(--stone-grey)",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection />

      {/* ── CTA BANNER ── */}
      <section className="py-24" style={{ background: "var(--ivory-paper)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className="reveal rounded-3xl overflow-hidden relative"
            style={{ minHeight: "400px" }}
          >
            <img
              src={HERO_BG}
              alt="CTA Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, #1C3A2B, rgba(28,58,43,0.85), rgba(28,58,43,0.2))",
              }}
            />
            <div className="relative z-10 p-12 lg:p-16 max-w-lg">
              <BlurHeading
                as="h2"
                delay={0.2}
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 600,
                  color: "var(--ivory-paper)",
                  lineHeight: 1.2,
                  marginBottom: "32px",
                }}
              >
                Ready to bring calm to your community events?
              </BlurHeading>

              <div className="flex flex-col gap-5 mb-10">
                {CTA_PROPS.map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    className="reveal flex items-start gap-4"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(196,163,90,0.2)" }}
                    >
                      <Icon size={17} color="var(--accent-gold)" />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "15px",
                          color: "var(--ivory-paper)",
                        }}
                      >
                        {title}
                      </p>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "14px",
                          color: "rgba(245,240,232,0.7)",
                        }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="group flex items-center gap-3 rounded-full px-8 py-4 transition-all duration-300 hover:scale-[1.02] hover:brightness-105"
                style={{
                  background: "var(--accent-gold)",
                  color: "var(--deep-forest)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                Start for Free
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <NewsletterSection />

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}