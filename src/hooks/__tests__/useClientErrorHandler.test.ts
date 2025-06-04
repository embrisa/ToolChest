import { renderHook, act } from "@testing-library/react";
import { useClientErrorHandler } from "../useClientErrorHandler";

jest.mock("@/utils/errors", () => ({
  createClientError: jest.fn((err) => ({
    message: err.message,
    requestId: "1",
  })),
  categorizeError: jest.fn(() => "network"),
  getUserFriendlyMessage: jest.fn(() => "Friendly"),
  isRecoverableError: jest.fn(() => false),
  logError: jest.fn(),
}));

jest.mock("@/components/ui/Toast", () => ({
  createErrorToast: jest.fn((t, m) => ({ id: "1", title: t, message: m })),
  createCriticalToast: jest.fn((t, m) => ({ id: "2", title: t, message: m })),
  createWarningToast: jest.fn((t, m) => ({ id: "3", title: t, message: m })),
}));

describe("useClientErrorHandler", () => {
  it("handles error and adds notification", async () => {
    const { result } = renderHook(() => useClientErrorHandler());

    await act(async () => {
      await result.current.handleError(new Error("fail"));
    });

    expect(result.current.errors.length).toBe(1);
    expect(result.current.notifications.length).toBe(1);
  });
});
