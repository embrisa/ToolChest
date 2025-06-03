import { renderHook, act } from "@testing-library/react";
import { useAdminMode } from "../admin";

describe("admin hooks", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads and toggles admin mode", () => {
    localStorage.setItem("admin", "true");
    const { result } = renderHook(() => useAdminMode());
    expect(result.current.isAdmin).toBe(true);
    act(() => result.current.disable());
    expect(result.current.isAdmin).toBe(false);
    expect(localStorage.getItem("admin")).toBeNull();
    act(() => result.current.enable());
    expect(result.current.isAdmin).toBe(true);
  });
});
