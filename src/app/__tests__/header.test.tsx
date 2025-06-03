import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/Header";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

describe("Header search", () => {
  it("navigates to search results on input", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const input = screen.getByRole("searchbox", { name: /search tools/i });
    await user.type(input, "hash");

    expect(pushMock).toHaveBeenLastCalledWith("/?query=hash");
  });

  it("clears search when input emptied", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const input = screen.getByRole("searchbox", { name: /search tools/i });
    await user.type(input, "test");
    pushMock.mockClear();

    await user.clear(input);
    expect(pushMock).toHaveBeenLastCalledWith("/");
  });
});
