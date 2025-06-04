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
    expect(screen.getByText(/processing data/i)).toBeInTheDocument();
    expect(screen.getByText(/50%/i)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ProgressIndicator progress={progress} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
