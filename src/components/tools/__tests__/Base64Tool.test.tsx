import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Base64Tool } from "../Base64Tool";
import { Base64Service } from "@/services/tools/base64Service";

jest.mock("@/services/tools/base64Service");

const encodeMock = jest.mocked(Base64Service).encode as jest.Mock;
const validateMock = jest.mocked(Base64Service).validateFile as jest.Mock;

encodeMock.mockResolvedValue({ success: true, data: "YWJj" });
validateMock.mockReturnValue({ isValid: true });

describe("Base64Tool", () => {
  it("encodes text input", async () => {
    render(<Base64Tool />);
    const textarea = screen.getByLabelText(/text input for encoding/i);
    await userEvent.type(textarea, "abc");

    await waitFor(() => expect(encodeMock).toHaveBeenCalled());
    await screen.findByDisplayValue("YWJj");
  });
});
