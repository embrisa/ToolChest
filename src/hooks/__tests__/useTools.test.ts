import { renderHook } from "@testing-library/react";
import useSWR from "swr";
import { useTools, useToolsSearch } from "../useTools";
import { swrFetcher } from "@/lib/api";

jest.mock("swr", () => ({ __esModule: true, default: jest.fn() }));

const mockUseSWR = useSWR as jest.Mock;

describe("useTools", () => {
  beforeEach(() => {
    mockUseSWR.mockReset();
  });

  it("returns tools from swr", () => {
    mockUseSWR.mockReturnValue({
      data: [{ id: "1" }],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });
    const { result } = renderHook(() => useTools());
    expect(result.current.tools).toHaveLength(1);
    expect(mockUseSWR).toHaveBeenCalledWith("/tools", swrFetcher);
  });

  it("builds search endpoint", () => {
    mockUseSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });
    renderHook(() => useToolsSearch("test"));
    expect(mockUseSWR).toHaveBeenLastCalledWith(
      "/tools/search?q=test",
      swrFetcher,
      { revalidateOnFocus: false, dedupingInterval: 300 },
    );
  });
});
