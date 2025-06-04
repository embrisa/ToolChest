import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Base64Tool } from "../Base64Tool";

// Mock the entire Base64Service class
jest.mock("@/services/tools/base64Service", () => ({
  Base64Service: {
    encode: jest.fn(),
    decode: jest.fn(),
    validateFile: jest.fn(),
    copyToClipboard: jest.fn(),
    trackUsage: jest.fn(),
    downloadAsFile: jest.fn(),
  }
}));

// Import the mocked service
const { Base64Service } = require("@/services/tools/base64Service");
const encodeMock = Base64Service.encode as jest.Mock;
const validateMock = Base64Service.validateFile as jest.Mock;
const copyMock = Base64Service.copyToClipboard as jest.Mock;
const trackUsageMock = Base64Service.trackUsage as jest.Mock;

// Set up comprehensive mocks
encodeMock.mockResolvedValue({
  success: true,
  data: "YWJj",
  processingTime: 1,
  warnings: []
});
validateMock.mockReturnValue({
  isValid: true,
  warnings: [],
  validationErrors: []
});
copyMock.mockResolvedValue({
  success: true,
  message: "Copied to clipboard"
});
trackUsageMock.mockResolvedValue(undefined);

describe("Base64Tool", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("encodes text input", async () => {
    render(<Base64Tool />);

    // Find the textarea with a more specific selector
    const textarea = screen.getByLabelText(/text input/i);
    await userEvent.type(textarea, "abc");

    await waitFor(() => expect(encodeMock).toHaveBeenCalled(), { timeout: 3000 });

    // Look for the result in the output area instead of display value
    await waitFor(() => {
      expect(screen.getByText(/YWJj/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
