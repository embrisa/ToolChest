import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashGeneratorTool } from "../HashGeneratorTool";
import { HashGeneratorService } from "@/services/tools/hashGeneratorService";

jest.mock("@/services/tools/hashGeneratorService");

const genMock = jest.mocked(HashGeneratorService).generateHash as jest.Mock;
const validateMock = jest.mocked(HashGeneratorService)
  .validateFile as jest.Mock;

genMock.mockResolvedValue({
  success: true,
  hash: "deadbeef",
  algorithm: "SHA-256",
  inputSize: 3,
  processingTime: 1,
});
validateMock.mockReturnValue({ isValid: true });

describe("HashGeneratorTool", () => {
  it("generates hash for text", async () => {
    jest.useFakeTimers();
    render(<HashGeneratorTool />);
    const textarea = screen.getByLabelText(/text input for hash generation/i);
    await userEvent.type(textarea, "abc");
    jest.runOnlyPendingTimers();

    await waitFor(() => expect(genMock).toHaveBeenCalled());
    expect(await screen.findByText(/SHA-256: deadbeef/i)).toBeInTheDocument();
    jest.useRealTimers();
  });
});
