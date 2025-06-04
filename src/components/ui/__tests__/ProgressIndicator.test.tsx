import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ProgressIndicator } from "../ProgressIndicator";
import type { Base64Progress } from "@/types/tools/base64";

expect.extend(toHaveNoViolations);

describe("ProgressIndicator", () => {
  const progress: Base64Progress = {
    stage: "processing",
    progress: 50,
    bytesProcessed: 512,
    totalBytes: 1024,
    estimatedTimeRemaining: 10,
  };

  it("renders progress information", () => {
    render(<ProgressIndicator progress={progress} />);
    expect(screen.getAllByText(/processing data/i)[0]).toBeInTheDocument();
    // Use getAllByText to handle multiple "50%" elements (screen reader + visual)
    const percentageElements = screen.getAllByText(/50%/i);
    expect(percentageElements).toHaveLength(2); // Should have both sr-only and visual
    expect(percentageElements[1]).toBeInTheDocument(); // Visual element (second one)
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ProgressIndicator progress={progress} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
