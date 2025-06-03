import { renderHook, act } from "@testing-library/react";
import { useToggle, usePrevious } from "../core";

describe("core hooks", () => {
  it("toggles value", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
  });

  it("provides previous value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } },
    );
    expect(result.current).toBeUndefined();
    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });
});
