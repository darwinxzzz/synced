"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "rgba(255, 253, 248, 0.96)",
          "--normal-text": "#1d1c17",
          "--normal-border": "rgba(74, 124, 89, 0.22)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
