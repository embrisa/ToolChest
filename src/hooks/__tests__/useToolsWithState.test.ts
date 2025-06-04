import { renderHook, act } from "@testing-library/react";
import useSWR, { mutate as globalMutate } from "swr";
import { useToolsWithState } from "../useToolsWithState";
import { useToolFilterState } from "../useUrlState";
import { swrFetcher } from "@/lib/api";

jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
  mutate: jest.fn(),
}));
jest.mock("../useUrlState", () => ({ useToolFilterState: jest.fn() }));

const mockUseSWR = useSWR as jest.Mock;
const mockMutate = globalMutate as jest.Mock;
const mockUseToolFilterState = useToolFilterState as jest.Mock;

describe("useToolsWithState", () => {
  beforeEach(() => {
    mockUseSWR.mockReset();
    mockMutate.mockReset();
    mockUseToolFilterState.mockReset();
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
});
