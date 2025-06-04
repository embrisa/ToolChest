// Mock the utils/errors module
jest.mock("@/utils/errors", () => ({
  createClientError: jest.fn(),
  categorizeError: jest.fn(),
  getUserFriendlyMessage: jest.fn(),
  isRecoverableError: jest.fn(),
  logError: jest.fn(),
}));

jest.mock("@/components/ui/Toast", () => ({
  createErrorToast: jest.fn((t, m) => ({ id: "1", title: t, message: m })),
  createCriticalToast: jest.fn((t, m) => ({ id: "2", title: t, message: m })),
  createWarningToast: jest.fn((t, m) => ({ id: "3", title: t, message: m })),
}));

import { renderHook, act } from "@testing-library/react";
import { useClientErrorHandler } from "../useClientErrorHandler";
import {
  createClientError,
  categorizeError,
  getUserFriendlyMessage,
  isRecoverableError,
  logError,
} from "@/utils/errors";

// Get the mocked functions for type safety
const mockCreateClientError = createClientError as jest.MockedFunction<typeof createClientError>;
const mockCategorizeError = categorizeError as jest.MockedFunction<typeof categorizeError>;
const mockGetUserFriendlyMessage = getUserFriendlyMessage as jest.MockedFunction<typeof getUserFriendlyMessage>;
const mockIsRecoverableError = isRecoverableError as jest.MockedFunction<typeof isRecoverableError>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe("useClientErrorHandler", () => {
  beforeEach(() => {
    // Set up mock implementations
    mockCreateClientError.mockImplementation((err: Error) => ({
      code: "mock-error-id",
      message: err.message,
      category: "unknown",
      severity: "medium",
      timestamp: new Date().toISOString(),
      requestId: "1",
      component: undefined,
      stack: err.stack,
    }));

    mockCategorizeError.mockReturnValue("network");
    mockGetUserFriendlyMessage.mockReturnValue("Friendly");
    mockIsRecoverableError.mockReturnValue(false);
    mockLogError.mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles error and adds notification", async () => {
    const { result } = renderHook(() => useClientErrorHandler());

    await act(async () => {
      await result.current.handleError(new Error("fail"));
    });

    expect(result.current.errors.length).toBe(1);
    expect(result.current.notifications.length).toBe(1);
    expect(mockCreateClientError).toHaveBeenCalledWith(
      expect.any(Error),
      undefined
    );
  });
});
