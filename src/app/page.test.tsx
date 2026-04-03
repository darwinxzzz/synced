import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Shared push spy — must be declared before vi.mock (hoisted)
const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

vi.mock("~/app/_components/context/RoleContext", () => ({
  useRole: () => ({ role: "member", setRole: vi.fn() }),
}));

// Mock tRPC so NewsletterSection can call api.newsletter.subscribe.useMutation
const mockMutate = vi.hoisted(() => vi.fn());
vi.mock("~/trpc/react", () => ({
  api: {
    newsletter: {
      subscribe: {
        useMutation: () => ({
          mutate: mockMutate,
          isPending: false,
          isSuccess: false,
        }),
      },
    },
  },
}));

import Landing from "./_components/marketing/page";

describe("/ (home route)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockMutate.mockClear();
  });

  it("renders the landing page hero heading", () => {
    render(<Landing />);
    expect(screen.getByText(/Track Every Event/i)).toBeInTheDocument();
  });

  it("renders the Get Started Free CTA button", () => {
    render(<Landing />);
    expect(
      screen.getByRole("button", { name: /Get Started Free/i }),
    ).toBeInTheDocument();
  });

  it("Get Started Free button routes to /login", async () => {
    render(<Landing />);
    const cta = screen.getByRole("button", { name: /Get Started Free/i });
    await userEvent.click(cta);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("newsletter form calls subscribe mutation with email on submit", async () => {
    render(<Landing />);
    const emailInput = screen.getByPlaceholderText(/your@email\.com/i);
    await userEvent.type(emailInput, "test@example.com");
    const subscribeBtn = screen.getByRole("button", { name: /subscribe/i });
    await userEvent.click(subscribeBtn);
    expect(mockMutate).toHaveBeenCalledWith({ email: "test@example.com" });
  });
});
