"use client";
import { useEffect, useRef, useState } from "react";

interface BlurHeadingProps {
  children: React.ReactNode;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
}

export function BlurHeading({
  children,
  delay = 0,
  as: Tag = "h2",
  className = "",
  style = {},
}: BlurHeadingProps) {
  const ref = useRef<HTMLElement>(null);
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

  const AnyTag = Tag as React.ElementType;
  return (
    <AnyTag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? undefined : 0,
        animation: visible ? `blur-in 0.8s ease-out ${delay}s forwards` : "none",
        ...style,
      }}
    >
      {children}
    </AnyTag>
  );
}
