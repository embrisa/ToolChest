import { render, screen } from "@testing-library/react";
import { Header } from "../Header";

// Create comprehensive mock for next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(() => "en"),
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Next.js Link
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

// Mock the cn utility
jest.mock("@/utils", () => ({
  cn: (...classes: (string | undefined | null | boolean)[]) =>
    classes.filter(Boolean).join(" "),
}));

describe("Header Translation Integration", () => {
  // Import the mocked next-intl module
  const nextIntl = jest.requireMock("next-intl");
  const { useTranslations } = nextIntl;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the translation function to return specific values for known keys
    (useTranslations as jest.Mock).mockImplementation((namespace: string) => {
      return jest.fn((key: string) => {
        // Translation mapping for "components.layout.header" namespace
        if (namespace === "components.layout.header") {
          const translations: Record<string, string> = {
            "navigation.tools": "Tools",
            "navigation.about": "About",
            "navigation.home": "Home",
            "navigation.admin": "Admin",
          };
          return translations[key] || `[${namespace}.${key}]`;
        }
        return `[${namespace}.${key}]`;
      });
    });

    // Reset window properties for clean tests
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    Object.defineProperty(document.body, "style", {
      value: { overflow: "unset" },
      writable: true,
    });
  });

  describe("Translation Usage", () => {
    it("should call useTranslations with correct namespace", () => {
      render(<Header />);
      expect(useTranslations).toHaveBeenCalledWith("components.layout.header");
    });

    it("should render translated navigation links", () => {
      render(<Header />);

      // Verify the translated text appears in the DOM
      expect(screen.getByText("Tools")).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
    });

    it("should maintain proper link functionality with translations", () => {
      render(<Header />);

      // Check that links have correct hrefs
      const toolsLink = screen.getByRole("link", { name: /tools/i });
      const aboutLink = screen.getByRole("link", { name: /about/i });

      expect(toolsLink).toHaveAttribute("href", "/tools");
      expect(aboutLink).toHaveAttribute("href", "/about");
    });
  });

  describe("Different Locales", () => {
    it("should handle different locales correctly", () => {
      // Mock different locale
      const mockLocale = nextIntl.useLocale;
      mockLocale.mockReturnValue("es");

      // Mock Spanish translations
      (useTranslations as jest.Mock).mockImplementation((namespace: string) => {
        return jest.fn((key: string) => {
          if (namespace === "components.layout.header") {
            const spanishTranslations: Record<string, string> = {
              "navigation.tools": "Herramientas",
              "navigation.about": "Acerca de",
            };
            return spanishTranslations[key] || `[${namespace}.${key}]`;
          }
          return `[${namespace}.${key}]`;
        });
      });

      render(<Header />);

      expect(screen.getByText("Herramientas")).toBeInTheDocument();
      expect(screen.getByText("Acerca de")).toBeInTheDocument();
    });
  });

  describe("Fallback Handling", () => {
    it("should handle missing translation keys gracefully", () => {
      (useTranslations as jest.Mock).mockImplementation((namespace: string) => {
        return jest.fn((key: string) => {
          // Only provide partial translations to test fallbacks
          if (namespace === "components.layout.header" && key === "navigation.tools") {
            return "Tools";
          }
          return `[${namespace}.${key}]`;
        });
      });

      render(<Header />);

      // Should show the translated key for "tools"
      expect(screen.getByText("Tools")).toBeInTheDocument();
      // Should show fallback for "about"
      expect(screen.getByText("[components.layout.header.navigation.about]")).toBeInTheDocument();
    });
  });
});
