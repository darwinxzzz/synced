import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("~/app/_components/marketing/Navbar", () => ({
  Navbar: () => <nav data-testid="marketing-navbar">Navbar</nav>,
}));

vi.mock("~/app/_components/marketing/Footer", () => ({
  Footer: () => <footer data-testid="marketing-footer">Footer</footer>,
}));

// This import will fail until (marketing)/layout.tsx is created — RED phase
import MarketingLayout from "../layout";

describe("(marketing)/layout", () => {
  it("renders the Navbar", () => {
    render(
      <MarketingLayout>
        <div>page content</div>
      </MarketingLayout>,
    );
    expect(screen.getByTestId("marketing-navbar")).toBeInTheDocument();
  });

  it("renders the Footer", () => {
    render(
      <MarketingLayout>
        <div>page content</div>
      </MarketingLayout>,
    );
    expect(screen.getByTestId("marketing-footer")).toBeInTheDocument();
  });

  it("renders children between Navbar and Footer", () => {
    render(
      <MarketingLayout>
        <div data-testid="page-content">hello world</div>
      </MarketingLayout>,
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });
});
