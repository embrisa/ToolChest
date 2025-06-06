import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Base64Tool } from "../Base64Tool";

// Mock the Base64Service module with proper static methods
jest.mock("@/services/tools/base64Service", () => ({
  Base64Service: {
    encode: jest.fn(),
    decode: jest.fn(),
    validateFile: jest.fn(),
    copyToClipboard: jest.fn(),
    trackUsage: jest.fn(),
    generateDownload: jest.fn(),
  },
}));

// Import the mocked service to get access to the mock functions
import { Base64Service } from "@/services/tools/base64Service";

// Type cast to get access to the mock functions
const mockEncode = Base64Service.encode as jest.Mock;
const mockValidateFile = Base64Service.validateFile as jest.Mock;
const mockCopyToClipboard = Base64Service.copyToClipboard as jest.Mock;
const mockTrackUsage = Base64Service.trackUsage as jest.Mock;

describe("Base64Tool", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the mocks with proper return values
    mockEncode.mockResolvedValue({
      success: true,
      data: "YWJj",
      originalSize: 3,
      outputSize: 4,
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
      method: "modern",
      message: "Copied to clipboard",
    });

    mockTrackUsage.mockResolvedValue(undefined);
  });

  it("renders without crashing", () => {
    render(<Base64Tool />);
    expect(screen.getByLabelText(/text input/i)).toBeInTheDocument();
  });

  it("calls encode service when text is entered", async () => {
    render(<Base64Tool />);

    // Find the textarea
    const textarea = screen.getByLabelText(/text input/i);

    // Type some text (the service is called on each keystroke)
    await userEvent.type(textarea, "abc");

    // Wait for the service to be called
    await waitFor(
      () => {
        expect(mockEncode).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Verify the service was called (it may be called multiple times due to keystroke processing)
    expect(mockEncode).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "encode",
        variant: "standard",
        inputType: "text",
        // Don't check exact input since it's called on each keystroke
      }),
    );
  });

  it("displays encoded result", async () => {
    render(<Base64Tool />);

    // Find the textarea
    const textarea = screen.getByLabelText(/text input/i);

    // Type some text
    await userEvent.type(textarea, "abc");

    // Wait for the service to be called
    await waitFor(
      () => {
        expect(mockEncode).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Look for the result in the component
    await waitFor(
      () => {
        expect(screen.getByText(/YWJj/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
