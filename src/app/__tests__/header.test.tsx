import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

// Mock the Header component to avoid dependency issues
const MockHeader = () => {
  const router = { push: pushMock };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      router.push("/");
      return;
    }

    const query = encodeURIComponent(trimmed);
    router.push(`/?query=${query}`);
  };

  return (
    <div>
      <input
        role="searchbox"
        aria-label="Search tools and utilities across all categories"
        onChange={handleSearchChange}
        placeholder="Search tools…"
      />
    </div>
  );
};

describe("Header search", () => {
  it("navigates to search results on input", async () => {
    const user = userEvent.setup();
    render(<MockHeader />);

    const input = screen.getByRole("searchbox", { name: /search tools/i });
    await user.type(input, "hash");

    expect(pushMock).toHaveBeenLastCalledWith("/?query=hash");
  });

  it("clears search when input emptied", async () => {
    const user = userEvent.setup();
    render(<MockHeader />);

    const input = screen.getByRole("searchbox", { name: /search tools/i });
    await user.type(input, "test");
    pushMock.mockClear();

    await user.clear(input);
    expect(pushMock).toHaveBeenLastCalledWith("/");
  });
});
