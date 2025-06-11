import { renderHook, act } from "@testing-library/react";
import useSWR, { mutate as globalMutate } from "swr";
import { useToolsWithState } from "../useToolsWithState";
import { useToolFilterState } from "../useUrlState";
import { swrFetcher } from "@/lib/api";
import { mockLocaleUtils } from "../../../tests/setup/mockData";

// Mock Response for Node.js environment
interface MockResponseInit {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

class MockResponse {
  private _body: string | null;
  public status: number;
  public statusText: string;
  public headers: Map<string, string>;
  public ok: boolean;

  constructor(body: string | null = null, init: MockResponseInit = {}) {
    this._body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || "OK";
    this.headers = new Map(Object.entries(init.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return JSON.parse(this._body || "{}");
  }
  async text() {
    return this._body?.toString() || "";
  }
  async arrayBuffer() {
    return new ArrayBuffer(0);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Response = MockResponse;

jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
  mutate: jest.fn(),
}));
jest.mock("../useUrlState", () => ({ useToolFilterState: jest.fn() }));
jest.mock("@/utils/locale", () => mockLocaleUtils);

const mockUseSWR = useSWR as jest.Mock;
const mockMutate = globalMutate as jest.Mock;
const mockUseToolFilterState = useToolFilterState as jest.Mock;

describe("useToolsWithState", () => {
  beforeEach(() => {
    mockUseSWR.mockReset();
    mockMutate.mockReset();
    mockUseToolFilterState.mockReset();
    jest.clearAllMocks();
  });

  it("returns loading before mount", () => {
    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "",
        tags: [],
        sortBy: "displayOrder",
        sortOrder: "asc",
        page: 1,
        limit: 24,
      },
      setQuery: jest.fn(),
      setTags: jest.fn(),
      setSorting: jest.fn(),
      setPage: jest.fn(),
      clearAllFilters: jest.fn(),
      updateParams: jest.fn(),
      mounted: false,
    });
    mockUseSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });
    const { result } = renderHook(() => useToolsWithState());
    expect(result.current.isLoading).toBe(true);
  });

  it("builds endpoint and records usage", async () => {
    const mutateMock = jest.fn();
    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "",
        tags: [],
        sortBy: "displayOrder",
        sortOrder: "asc",
        page: 1,
        limit: 24,
      },
      setQuery: jest.fn(),
      setTags: jest.fn(),
      setSorting: jest.fn(),
      setPage: jest.fn(),
      clearAllFilters: jest.fn(),
      updateParams: jest.fn(),
      mounted: true,
    });
    mockUseSWR.mockReturnValue({
      data: [{ slug: "t1" }],
      error: null,
      isLoading: false,
      mutate: mutateMock,
    });

    const fetchMock: jest.MockedFunction<typeof fetch> = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    global.fetch = fetchMock;
    const { result } = renderHook(() => useToolsWithState());

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/tools?limit=24",
      swrFetcher,
      expect.any(Object),
    );

    await act(async () => {
      await result.current.actions.recordUsage("t1");
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(mutateMock).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith("/api/tools?popular=true");
  });

  it("should include locale in API endpoint when available", () => {
    mockLocaleUtils.getDefaultRouteLocale.mockReturnValue("es");

    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "",
        tags: [],
        sortBy: "displayOrder",
        sortOrder: "asc",
        page: 1,
        limit: 24,
      },
      setQuery: jest.fn(),
      setTags: jest.fn(),
      setSorting: jest.fn(),
      setPage: jest.fn(),
      clearAllFilters: jest.fn(),
      updateParams: jest.fn(),
      mounted: true,
    });

    mockUseSWR.mockReturnValue({
      data: [{ slug: "t1" }],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    renderHook(() => useToolsWithState());

    // Should include locale in the API call
    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/tools?limit=24",
      swrFetcher,
      expect.any(Object),
    );
  });

  it("should handle locale changes in API endpoints", () => {
    mockLocaleUtils.getDefaultRouteLocale.mockReturnValue("fr");

    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "test",
        tags: ["encoding"],
        sortBy: "displayOrder",
        sortOrder: "asc",
        page: 1,
        limit: 24,
      },
      setQuery: jest.fn(),
      setTags: jest.fn(),
      setSorting: jest.fn(),
      setPage: jest.fn(),
      clearAllFilters: jest.fn(),
      updateParams: jest.fn(),
      mounted: true,
    });

    mockUseSWR.mockReturnValue({
      data: [{ slug: "t1" }],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    renderHook(() => useToolsWithState());

    // Should use search endpoint when query is present
    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/tools/search?q=test",
      swrFetcher,
      expect.any(Object),
    );
  });

  it("builds a full API endpoint with all filters", () => {
    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "",
        tags: ["encoding", "security"],
        sortBy: "name",
        sortOrder: "desc",
        page: 3,
        limit: 10,
      },
      mounted: true,
    });
    mockUseSWR.mockReturnValue({ data: [], error: null, isLoading: false });

    renderHook(() => useToolsWithState());

    const receivedUrl = mockUseSWR.mock.calls[0][0];
    expect(receivedUrl).toContain("tag=encoding");
    expect(receivedUrl).toContain("tag=security");
    expect(receivedUrl).toContain("sortBy=name");
    expect(receivedUrl).toContain("sortOrder=desc");
    expect(receivedUrl).toContain("offset=20");
    expect(receivedUrl).toContain("limit=10");
  });

  it("performs client-side filtering when searching with tags", () => {
    const mockTools = [
      { slug: "tool1", tags: [{ slug: "encoding" }] },
      { slug: "tool2", tags: [{ slug: "security" }] },
      { slug: "tool3", tags: [{ slug: "encoding" }, { slug: "design" }] },
    ];
    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "search-query", // query is present
        tags: ["encoding"],      // tags are present
        page: 1,
        limit: 10,
      },
      mounted: true,
    });
    mockUseSWR.mockReturnValue({ data: mockTools, error: null, isLoading: false });

    const { result } = renderHook(() => useToolsWithState());

    expect(result.current.tools.map(t => t.slug)).toEqual(["tool1", "tool3"]);
    expect(result.current.totalCount).toBe(2);
  });

  it("handles recordUsage failure and reverts optimistic update", async () => {
    const originalData = [{ slug: "t1", usageCount: 10 }];
    const mutateMock = jest.fn();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "",
        tags: [],
        sortBy: "displayOrder",
        sortOrder: "asc",
        page: 1,
        limit: 24,
      },
      mounted: true,
    });
    mockUseSWR.mockReturnValue({
      data: originalData,
      error: null,
      isLoading: false,
      mutate: mutateMock,
    });

    const fetchMock: jest.MockedFunction<typeof fetch> = jest
      .fn()
      .mockRejectedValue(new Error("Network error"));
    global.fetch = fetchMock;

    const { result } = renderHook(() => useToolsWithState());

    await act(async () => {
      await result.current.actions.recordUsage("t1");
    });

    // Called once for optimistic update, once for revert
    expect(mutateMock).toHaveBeenCalledTimes(2);
    // The second call should be with the original data to revert
    expect(mutateMock).toHaveBeenLastCalledWith();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to record tool usage:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("calls mutate on retry", async () => {
    const mutateMock = jest.fn();
    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "",
        tags: [],
        sortBy: "displayOrder",
        sortOrder: "asc",
        page: 1,
        limit: 24,
      },
      mounted: true,
    });
    mockUseSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: mutateMock,
    });
    const { result } = renderHook(() => useToolsWithState());

    await act(async () => {
      result.current.actions.retry();
    });

    expect(mutateMock).toHaveBeenCalledTimes(1);
  });

  it("correctly determines isEmpty state", () => {
    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "",
        tags: [],
        sortBy: "displayOrder",
        sortOrder: "asc",
        page: 1,
        limit: 24,
      },
      mounted: true,
    });
    const { result, rerender } = renderHook(({ data, isLoading }) => {
      mockUseSWR.mockReturnValue({ data, isLoading, error: null });
      return useToolsWithState();
    }, {
      initialProps: { data: [] as { slug: string }[], isLoading: false }
    });

    expect(result.current.isEmpty).toBe(true);

    rerender({ data: [{ slug: "t1" }], isLoading: false });
    expect(result.current.isEmpty).toBe(false);

    rerender({ data: [], isLoading: true });
    expect(result.current.isEmpty).toBe(false); // Should not be empty while loading
  });

  it("prefetches a tool", async () => {
    mockUseToolFilterState.mockReturnValue({
      filterState: {
        query: "",
        tags: [],
        sortBy: "displayOrder",
        sortOrder: "asc",
        page: 1,
        limit: 24,
      },
      mounted: true
    });
    mockUseSWR.mockReturnValue({ data: [], error: null, isLoading: false });
    const fetchMock: jest.MockedFunction<typeof fetch> = jest
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    global.fetch = fetchMock;

    const { result } = renderHook(() => useToolsWithState());

    await act(async () => {
      await result.current.actions.prefetchTool("my-tool");
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/tools/my-tool");
  });
});
