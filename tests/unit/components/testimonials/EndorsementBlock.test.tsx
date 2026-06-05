import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EndorsementBlock } from "~/app/_components/testimonials/EndorsementBlock";

const mockEndorsement = {
  quote: "His presence elevates the standard of our organization.",
  adminName: "Raymond Ishiguro",
  adminTitle: "President, SYAI Global",
};

describe("EndorsementBlock", () => {
  describe("with endorsement", () => {
    it("renders the quote text", () => {
      render(<EndorsementBlock endorsement={mockEndorsement} />);
      expect(screen.getByText(/His presence elevates/)).toBeInTheDocument();
    });

    it("renders the admin name", () => {
      render(<EndorsementBlock endorsement={mockEndorsement} />);
      expect(screen.getByText("Raymond Ishiguro")).toBeInTheDocument();
    });

    it("renders the admin title", () => {
      render(<EndorsementBlock endorsement={mockEndorsement} />);
      expect(screen.getByText("President, SYAI Global")).toBeInTheDocument();
    });

    it("renders initials from adminName in a circle avatar", () => {
      render(<EndorsementBlock endorsement={mockEndorsement} />);
      expect(screen.getByText("RI")).toBeInTheDocument();
    });

    it("renders Executive Endorsement label", () => {
      render(<EndorsementBlock endorsement={mockEndorsement} />);
      expect(screen.getByText("Executive Endorsement")).toBeInTheDocument();
    });

    it("does NOT render a left border accent", () => {
      const { container } = render(
        <EndorsementBlock endorsement={mockEndorsement} />,
      );
      const leftBorderElements = Array.from(
        container.querySelectorAll<HTMLElement>("div"),
      ).filter((el) => el.style.borderLeft?.includes("3px"));
      expect(leftBorderElements).toHaveLength(0);
    });

    it("handles single-word admin name by using first two chars", () => {
      render(
        <EndorsementBlock
          endorsement={{ ...mockEndorsement, adminName: "Admin" }}
        />,
      );
      expect(screen.getByText("AD")).toBeInTheDocument();
    });
  });

  describe("without endorsement", () => {
    it("renders pending placeholder text", () => {
      render(<EndorsementBlock endorsement={null} />);
      expect(
        screen.getByText(/Executive endorsement will appear/),
      ).toBeInTheDocument();
    });

    it("does NOT render initials circle when no endorsement", () => {
      render(<EndorsementBlock endorsement={null} />);
      expect(screen.queryByText("RI")).not.toBeInTheDocument();
    });
  });
});
