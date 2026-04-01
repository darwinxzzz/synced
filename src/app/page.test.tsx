import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation used by Landing and its children
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

// Mock next/image (not available in jsdom)
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock RoleContext
vi.mock("~/app/_components/context/RoleContext", () => ({
  useRole: () => ({ role: "member", setRole: vi.fn() }),
}));

import Landing from "./_components/marketing/page";

describe("/ (home route)", () => {
  it("renders the landing page hero heading", () => {
    render(<Landing />);
    expect(
      screen.getByText(/Track Every Event/i),
    ).toBeInTheDocument();
  });

  it("renders the Get Started Free CTA button", () => {
    render(<Landing />);
    expect(
      screen.getByRole("button", { name: /Get Started Free/i }),
    ).toBeInTheDocument();
  });

  it("renders the navbar", () => {
    render(<Landing />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
