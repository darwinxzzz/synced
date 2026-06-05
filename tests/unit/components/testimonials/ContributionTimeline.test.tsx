import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContributionTimeline } from "~/app/_components/testimonials/ContributionTimeline";

const mockEntry = {
  id: "entry-1",
  title: "Lead Architect: Arashiyama Digital Twin",
  role: "Lead",
  date: "2023-09-01T00:00:00.000Z",
  description: "Spearheaded development of the high-fidelity spatial model.",
  contributionCount: 3,
  reflection: null,
};

describe("ContributionTimeline", () => {
  it("renders nothing when entries is empty", () => {
    const { container } = render(
      <ContributionTimeline entries={[]} onSelectReflection={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the section heading", () => {
    render(
      <ContributionTimeline
        entries={[mockEntry]}
        onSelectReflection={vi.fn()}
      />,
    );
    expect(screen.getByText("Contribution History")).toBeInTheDocument();
  });

  it("renders the entry title", () => {
    render(
      <ContributionTimeline
        entries={[mockEntry]}
        onSelectReflection={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/Lead Architect: Arashiyama Digital Twin/),
    ).toBeInTheDocument();
  });

  it("renders the entry description", () => {
    render(
      <ContributionTimeline
        entries={[mockEntry]}
        onSelectReflection={vi.fn()}
      />,
    );
    expect(screen.getByText(/Spearheaded development/)).toBeInTheDocument();
  });

  it("renders the contribution count label", () => {
    render(
      <ContributionTimeline
        entries={[mockEntry]}
        onSelectReflection={vi.fn()}
      />,
    );
    expect(screen.getByText(/3 CONTRIBUTIONS/i)).toBeInTheDocument();
  });

  it("renders the formatted date", () => {
    render(
      <ContributionTimeline
        entries={[mockEntry]}
        onSelectReflection={vi.fn()}
      />,
    );
    expect(screen.getByText(/Sept? 2023/)).toBeInTheDocument();
  });

  it("does NOT render timeline dots", () => {
    const { container } = render(
      <ContributionTimeline
        entries={[mockEntry]}
        onSelectReflection={vi.fn()}
      />,
    );
    const circles = Array.from(
      container.querySelectorAll<HTMLElement>("div"),
    ).filter((el) => el.style.borderRadius === "50%");
    expect(circles).toHaveLength(0);
  });

  it("renders multiple entries", () => {
    const entries = [
      mockEntry,
      {
        ...mockEntry,
        id: "entry-2",
        title: "Sustainable AI Symposium",
        date: "2023-07-01T00:00:00.000Z",
      },
    ];
    render(
      <ContributionTimeline entries={entries} onSelectReflection={vi.fn()} />,
    );
    expect(
      screen.getByText(/Lead Architect: Arashiyama Digital Twin/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sustainable AI Symposium/)).toBeInTheDocument();
  });
});
