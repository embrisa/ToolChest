import { renderHook, act, waitFor } from "@testing-library/react";
import { useUrlState } from "../useUrlState";

const pushMock = jest.fn();
const replaceMock = jest.fn();
let params = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => params,
  usePathname: () => "/tools",
}));

describe("useUrlState", () => {
  beforeEach(() => {
    params = new URLSearchParams();
    pushMock.mockClear();
    replaceMock.mockClear();
  });

  it("returns default values when none in url", async () => {
    const { result } = renderHook(() =>
      useUrlState({ defaultValues: { page: "1" } }),
    );

    await waitFor(() => expect(result.current.mounted).toBe(true));
    expect(result.current.urlState).toEqual({ page: "1" });
  });

  it("updates url params via setParam", async () => {
    const { result } = renderHook(() =>
      useUrlState({ defaultValues: { page: "1" } }),
    );

    await waitFor(() => expect(result.current.mounted).toBe(true));
    act(() => result.current.setParam("page", "2"));

    expect(pushMock).toHaveBeenCalledWith("/tools?page=2");
  });

  it("removes params when value is null", async () => {
    params = new URLSearchParams("page=3");
    const { result } = renderHook(() =>
      useUrlState({ defaultValues: { page: "1" } }),
    );
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.setParam("page", null));
    expect(pushMock).toHaveBeenCalledWith("/tools");
  });
});
