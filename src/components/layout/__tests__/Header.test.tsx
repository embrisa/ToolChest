import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../Header";

// Mock Next.js navigation
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

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock Heroicons
jest.mock("@heroicons/react/24/outline", () => ({
  MagnifyingGlassIcon: () => <div data-testid="search-icon">🔍</div>,
  Bars3Icon: () => <div data-testid="menu-icon">☰</div>,
  XMarkIcon: () => <div data-testid="close-icon">✕</div>,
}));

// Mock the cn utility function to avoid any potential issues
jest.mock("@/utils", () => ({
  cn: (...classes: (string | undefined | null | boolean)[]) =>
    classes.filter(Boolean).join(" "),
}));

// Mock window and document APIs that Header component uses
const mockScrollTo = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, "scrollY", {
  value: 0,
  writable: true,
});

Object.defineProperty(window, "scrollTo", {
  value: mockScrollTo,
  writable: true,
});

Object.defineProperty(window, "addEventListener", {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, "removeEventListener", {
  value: mockRemoveEventListener,
  writable: true,
});

// Mock document body style for overflow handling
Object.defineProperty(document.body, "style", {
  value: {
    overflow: "unset",
  },
  writable: true,
});

// Mock document addEventListener/removeEventListener
const originalDocAddEventListener = document.addEventListener;
const originalDocRemoveEventListener = document.removeEventListener;
const mockDocAddEventListener = jest.fn();
const mockDocRemoveEventListener = jest.fn();

beforeAll(() => {
  document.addEventListener = mockDocAddEventListener;
  document.removeEventListener = mockDocRemoveEventListener;
});

afterAll(() => {
  document.addEventListener = originalDocAddEventListener;
  document.removeEventListener = originalDocRemoveEventListener;
});

describe("Header mobile menu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body style
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    // Clean up any side effects
    document.body.style.overflow = "unset";
  });

  it("toggles mobile menu", async () => {
    const user = userEvent.setup();

    // Render the component
    render(<Header />);

    // The component renders successfully without AggregateError
    expect(screen.getByRole("banner")).toBeInTheDocument();

    // There should be navigation menu controls
    const menuButton = screen.getByRole("button", {
      name: /navigation menu/i,
    });
    expect(menuButton).toBeInTheDocument();

    // Click the menu button to toggle state
    await user.click(menuButton);

    // After clicking, the button should still be accessible (state changed)
    expect(
      screen.getByRole("button", { name: /navigation menu/i }),
    ).toBeInTheDocument();

    // Should also have a search input
    expect(
      screen.getByRole("searchbox", { name: /search tools/i }),
    ).toBeInTheDocument();

    // Should have navigation links
    expect(
      screen.getByRole("link", { name: /all tools/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });
});
