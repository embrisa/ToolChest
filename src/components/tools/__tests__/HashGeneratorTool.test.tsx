import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashGeneratorTool } from "../HashGeneratorTool";

// Mock the entire HashGeneratorService class
jest.mock("@/services/tools/hashGeneratorService", () => ({
  HashGeneratorService: {
    generateHash: jest.fn(),
    validateFile: jest.fn(),
    copyToClipboard: jest.fn(),
    trackUsage: jest.fn(),
    downloadAsFile: jest.fn(),
  },
}));

// Import the mocked service using ES module syntax
import { HashGeneratorService } from "@/services/tools/hashGeneratorService";
const genMock = HashGeneratorService.generateHash as jest.Mock;
const validateMock = HashGeneratorService.validateFile as jest.Mock;
const trackUsageMock = HashGeneratorService.trackUsage as jest.Mock;
const copyMock = HashGeneratorService.copyToClipboard as jest.Mock;

// Set up comprehensive mocks
genMock.mockResolvedValue({
  success: true,
  hash: "deadbeef",
  algorithm: "SHA-256",
  inputSize: 3,
  processingTime: 1,
  warnings: [],
});
validateMock.mockReturnValue({
  isValid: true,
  warnings: [],
  validationErrors: [],
});
trackUsageMock.mockResolvedValue(undefined);
copyMock.mockResolvedValue({
  success: true,
  message: "Copied to clipboard",
});

describe("HashGeneratorTool", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates hash for text", async () => {
    render(<HashGeneratorTool />);

    // Find the textarea with a more flexible selector
    const textarea = screen.getByLabelText(/text input/i);
    await userEvent.type(textarea, "abc");

    // Wait for the mock to be called with increased timeout
    await waitFor(() => expect(genMock).toHaveBeenCalled(), { timeout: 5000 });

    // Look for the hash result in the component
    await waitFor(
      () => {
        expect(screen.getByText(/deadbeef/i)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
