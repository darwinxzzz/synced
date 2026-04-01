import { Camera, Briefcase, MessageCircle, Code } from "lucide-react";

const FOOTER_LINKS = {
  Platform: ["Features", "Pricing", "Changelog", "Roadmap", "API Docs"],
  About: ["Our Story", "Design Philosophy", "Team", "Blog", "Careers"],
  Support: ["Help Center", "Getting Started", "Contact", "Status", "Forum"],
};

const SOCIAL = [
  { icon: Camera, label: "Instagram" },
  { icon: Briefcase, label: "LinkedIn" },
  { icon: MessageCircle, label: "Twitter / X" },
  { icon: Code, label: "GitHub" },
];

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "var(--charcoal-ink)" }}
    >
      {/* Watermark */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none select-none"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(120px, 20vw, 400px)",
          fontWeight: 700,
          color: "var(--ivory-paper)",
          opacity: 0.06,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        EventSync
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎋</span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--ivory-paper)",
                }}
              >
                Event Sync
              </span>
            </div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "var(--stone-grey)",
                lineHeight: 1.6,
              }}
            >
              Grow together. Track every step.
            </p>
            <div className="flex gap-3">
              {SOCIAL.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 group"
                  style={{
                    background: "var(--charcoal-ink)",
                    borderColor: "var(--stone-grey)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--bamboo-green)";
                    const icon = (e.currentTarget as HTMLButtonElement).querySelector("svg");
                    if (icon) icon.style.color = "var(--bamboo-green)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--stone-grey)";
                    const icon = (e.currentTarget as HTMLButtonElement).querySelector("svg");
                    if (icon) icon.style.color = "var(--stone-grey)";
                  }}
                  aria-label={label}
                >
                  <Icon size={15} color="var(--stone-grey)" />
                </button>
              ))}
            </div>
          </div>

          {/* Columns 2–4 — Links */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="flex flex-col gap-4">
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--stone-grey)",
                }}
              >
                {heading}
              </p>
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-left transition-colors duration-200"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "15px",
                      color: "var(--stone-grey)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--ivory-paper)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--stone-grey)")
                    }
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(140,140,140,0.2)" }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              color: "var(--stone-grey)",
            }}
          >
            © 2026 Event Sync. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms", "Cookie Settings"].map((item) => (
              <a
                key={item}
                href="#"
                className="transition-colors duration-200"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "var(--stone-grey)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--ivory-paper)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--stone-grey)")
                }
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
