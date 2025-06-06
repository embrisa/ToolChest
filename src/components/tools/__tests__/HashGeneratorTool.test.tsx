import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashGeneratorTool } from "../HashGeneratorTool";

// Mock the HashGeneratorService module with proper static methods
jest.mock("@/services/tools/hashGeneratorService", () => ({
  HashGeneratorService: {
    generateHash: jest.fn(),
    validateFile: jest.fn(),
    copyToClipboard: jest.fn(),
    trackUsage: jest.fn(),
  },
}));

// Import the mocked service to get access to the mock functions
import { HashGeneratorService } from "@/services/tools/hashGeneratorService";

// Type cast to get access to the mock functions
const mockGenerateHash = HashGeneratorService.generateHash as jest.Mock;
const mockValidateFile = HashGeneratorService.validateFile as jest.Mock;
const mockCopyToClipboard = HashGeneratorService.copyToClipboard as jest.Mock;
const mockTrackUsage = HashGeneratorService.trackUsage as jest.Mock;

describe("HashGeneratorTool", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the mocks with proper return values
    mockGenerateHash.mockResolvedValue({
      success: true,
      hash: "deadbeef",
      algorithm: "SHA-256",
      inputSize: 3,
      processingTime: 1,
      warnings: [],
    });

    mockValidateFile.mockReturnValue({
      isValid: true,
      warnings: [],
      validationErrors: [],
    });

    mockCopyToClipboard.mockResolvedValue({
      success: true,
      message: "Copied to clipboard",
    });

    mockTrackUsage.mockResolvedValue(undefined);
  });

  it("renders without crashing", () => {
    render(<HashGeneratorTool />);
    expect(screen.getByLabelText(/text input/i)).toBeInTheDocument();
  });

  it("calls generateHash service when text is entered", async () => {
    render(<HashGeneratorTool />);

    // Find the textarea
    const textarea = screen.getByLabelText(/text input/i);

    // Type some text (the service is called on each keystroke)
    await userEvent.type(textarea, "abc");

    // Wait for the service to be called
    await waitFor(
      () => {
        expect(mockGenerateHash).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Verify the service was called (it may be called multiple times due to keystroke processing)
    expect(mockGenerateHash).toHaveBeenCalledWith(
      expect.objectContaining({
        algorithm: "SHA-256",
        inputType: "text",
        // Don't check exact input since it's called on each keystroke
      }),
    );
  });

  it("displays hash result", async () => {
    render(<HashGeneratorTool />);

    // Find the textarea
    const textarea = screen.getByLabelText(/text input/i);

    // Type some text
    await userEvent.type(textarea, "abc");

    // Wait for the service to be called
    await waitFor(
      () => {
        expect(mockGenerateHash).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Look for the hash result in the component
    await waitFor(
      () => {
        expect(screen.getByText(/deadbeef/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
