import { renderHook, act } from "@testing-library/react";
import { useClipboard } from "../useClipboard";
import * as clipboardModule from "@/utils/clipboard";

jest.mock("@/utils/clipboard", () => ({
  copyText: jest.fn(),
  copyJSON: jest.fn(),
}));

describe("useClipboard hook", () => {
  const mockedClipboard = jest.mocked(clipboardModule);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedClipboard.copyText.mockResolvedValue({
      success: true,
      message: "Copied to clipboard",
      method: "modern",
    });
    mockedClipboard.copyJSON.mockResolvedValue({
      success: true,
      message: "Copied to clipboard",
      method: "modern",
    });
  });

  it("copies text (modern)", async () => {
    const { result } = renderHook(() => useClipboard());
    let output;
    await act(async () => {
      output = await result.current.copyText("abc");
    });
    expect(output).toEqual({ success: true, message: "Copied to clipboard" });
  });

  it("copies json (pretty)", async () => {
    const { result } = renderHook(() => useClipboard());
    let output;
    await act(async () => {
      output = await result.current.copyJSON({ ok: true }, true);
    });
    expect(output).toEqual({ success: true, message: "Copied to clipboard" });
  });

  it("maps fallback/error results from util", async () => {
    mockedClipboard.copyText.mockResolvedValueOnce({
      success: true,
      message: "Copied to clipboard",
      method: "fallback",
    });
    mockedClipboard.copyJSON.mockResolvedValueOnce({
      success: false,
      message: "Failed to copy JSON: Invalid JSON",
      method: "unknown",
    });

    const { result } = renderHook(() => useClipboard());
    let textRes;
    let jsonRes;
    await act(async () => {
      textRes = await result.current.copyText("abc");
      jsonRes = await result.current.copyJSON(undefined as unknown as string);
    });

    expect(textRes).toEqual({ success: true, message: "Copied to clipboard" });
    expect(jsonRes).toEqual({
      success: false,
      message: "Failed to copy JSON: Invalid JSON",
    });
  });
});
