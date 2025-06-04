import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../Header";

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

describe("Header mobile menu", () => {
  it("toggles mobile menu", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const toggle = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    await user.click(toggle);
    expect(
      screen.getByRole("dialog", { name: /mobile navigation menu/i }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /close navigation menu/i }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
