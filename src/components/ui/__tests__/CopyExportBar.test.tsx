import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyExportBar } from "../CopyExportBar";

jest.mock("@/hooks/useClipboard", () => ({
  useClipboard: () => ({
    copyText: jest.fn(async () => ({ success: true, message: "Copied to clipboard" })),
    copyJSON: jest.fn(async () => ({ success: true, message: "Copied to clipboard" })),
    copyRaw: jest.fn(async () => ({ success: true, message: "Copied to clipboard" })),
  }),
}));

const downloadBlobMock = jest.fn();
jest.mock("@/utils/file-processing", () => ({
  downloadBlob: (blob: Blob, filename: string) => downloadBlobMock(blob, filename),
}));

describe("CopyExportBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("enables/disables buttons based on provided values", () => {
    const { rerender } = render(<CopyExportBar value="abc" />);

    expect(screen.getByRole("button", { name: /copy result/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /copy raw result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /copy json result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /download result/i })).toBeEnabled();

    rerender(<CopyExportBar value={""} rawValue={"raw"} />);
    expect(screen.getByRole("button", { name: /copy result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /copy raw result/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /copy json result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /download result/i })).toBeEnabled();

    rerender(<CopyExportBar value={""} rawValue={""} jsonValue={{ a: 1 }} />);
    expect(screen.getByRole("button", { name: /copy result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /copy raw result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /copy json result/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /download result/i })).toBeEnabled();
  });

  it("enables download when only onDownloadData is provided", () => {
    render(<CopyExportBar onDownloadData={() => "download"} />);

    expect(screen.getByRole("button", { name: /copy result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /copy raw result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /copy json result/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /download result/i })).toBeEnabled();
  });

  it("copies text, raw and JSON and shows feedback", async () => {
    const onAnnounce = jest.fn();
    render(
      <CopyExportBar
        value="hello"
        rawValue="hello"
        jsonValue={{ ok: true }}
        onAnnounce={onAnnounce}
      />,
    );

    const copyBtn = screen.getByRole("button", { name: /copy result/i });
    await userEvent.click(copyBtn);
    expect(copyBtn).toHaveTextContent(/copied!/i);
    expect(onAnnounce).toHaveBeenCalledWith("Copied to clipboard", "polite");

    const copyRawBtn = screen.getByRole("button", { name: /copy raw result/i });
    await userEvent.click(copyRawBtn);
    expect(copyRawBtn).toHaveTextContent(/copied!/i);

    const copyJsonBtn = screen.getByRole("button", { name: /copy json result/i });
    await userEvent.click(copyJsonBtn);
    expect(copyJsonBtn).toHaveTextContent(/copied!/i);
  });

  it("downloads data via onDownloadData and announces", async () => {
    const onAnnounce = jest.fn();
    render(
      <CopyExportBar
        value="download me"
        filename="out.txt"
        mimeType="text/plain;charset=utf-8"
        onDownloadData={() => "download me"}
        onAnnounce={onAnnounce}
      />,
    );

    const downloadBtn = screen.getByRole("button", { name: /download result/i });
    await userEvent.click(downloadBtn);

    expect(downloadBlobMock).toHaveBeenCalled();
    const [blobArg, nameArg] = downloadBlobMock.mock.calls[0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect(nameArg).toBe("out.txt");
    expect(onAnnounce).toHaveBeenCalledWith("Downloaded out.txt", "polite");
  });
});

