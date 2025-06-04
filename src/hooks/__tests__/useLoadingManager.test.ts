import { renderHook, act } from "@testing-library/react";
import { useLoadingManager } from "../useLoadingManager";

describe("useLoadingManager", () => {
  it("tracks loading states", () => {
    const { result } = renderHook(() => useLoadingManager());

    act(() => result.current.setLoading("fetch", true));
    expect(result.current.isLoading("fetch")).toBe(true);
    expect(result.current.isLoading()).toBe(true);

    act(() => result.current.setLoading("fetch", false));
    expect(result.current.isLoading()).toBe(false);
  });

  it("clears all states", () => {
    const { result } = renderHook(() => useLoadingManager());
    act(() => {
      result.current.setLoading("a", true);
      result.current.setLoading("b", true);
    });
    act(() => result.current.clearAll());
    expect(result.current.isLoading()).toBe(false);
  });
});
