"use client";

import { api } from "~/trpc/react";
import { MemberTestimonialView } from "~/app/_components/testimonials/MemberTestimonialView";

export default function TestimonialsPage() {
  const { data: user, isLoading } = api.auth.getUser.useQuery();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "var(--stone-grey)",
            fontSize: "14px",
          }}
        >
          Loading…
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--ivory-paper)",
        minHeight: "100vh",
        padding: "clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px)",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <MemberTestimonialView memberId={user.id} viewerRole="member" />
      </div>
    </div>
  );
}
