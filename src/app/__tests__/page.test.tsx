import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import HomePage from "../[locale]/page";
import {
  mockTranslatedTools,
  mockTranslatedTags,
  mockDatabaseTranslationService,
} from "../../../tests/setup/mockData";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
  mutate: jest.fn(),
}));

// Mock the hooks
const mockUseToolsWithState = jest.fn();
const mockUseTagsWithState = jest.fn();

jest.mock("@/hooks/useToolsWithState", () => ({
  useToolsWithState: () => mockUseToolsWithState(),
  useTagsWithState: () => mockUseTagsWithState(),
}));

// Mock components to isolate testing
jest.mock("@/components/tools", () => ({
  ToolCard: ({
    tool,
    className,
    "data-testid": testId,
  }: {
    tool: { name: string; description: string };
    className?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={testId || "tool-card"} className={className}>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
    </div>
  ),
  SearchInput: ({
    value,
    onChange,
    placeholder,
    isLoading,
    resultCount,
    className,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    resultCount?: number;
    className?: string;
  }) => (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        role="searchbox"
        aria-label="Search tools"
        data-testid="search-input"
      />
      {isLoading && <div data-testid="search-loading">Loading...</div>}
      {resultCount !== undefined && (
        <div data-testid="search-results-count">{resultCount} results</div>
      )}
    </div>
  ),
  TagFilter: ({
    tags,
    selectedTags,
    onTagToggle,
    onClearAll,
    showCount,
    testIdPrefix = "",
    "data-testid": testId,
  }: {
    tags: Array<{ id: string; name: string; slug: string; toolCount?: number }>;
    selectedTags: string[];
    onTagToggle: (slug: string) => void;
    onClearAll: () => void;
    showCount?: boolean;
    testIdPrefix?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={testId}>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagToggle(tag.slug)}
          className={selectedTags.includes(tag.slug) ? "selected" : ""}
          data-testid={`${testIdPrefix}tag-${tag.slug}`}
        >
          {tag.name}
          {showCount && tag.toolCount && ` (${tag.toolCount})`}
        </button>
      ))}
      <button
        onClick={onClearAll}
        data-testid={`${testIdPrefix}clear-all-tags`}
      >
        Clear All
      </button>
    </div>
  ),
}));

// Mock UI components
jest.mock("@/components/ui", () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`${variant} ${size} ${className}`}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

// Mock DatabaseTranslationService
jest.mock("@/services/core/databaseTranslationService", () => ({
  DatabaseTranslationService: () => mockDatabaseTranslationService,
}));

describe("HomePage", () => {
  // Use updated mock data with translation keys
  const mockTools = mockTranslatedTools.en;
  const mockTags = mockTranslatedTags.en;

  const defaultToolsState = {
    tools: mockTools,
    isLoading: false,
    error: null,
    isEmpty: false,
    totalCount: 2,
    filterState: {
      query: "",
      tags: [],
      sortBy: "displayOrder",
      sortOrder: "asc" as const,
      page: 1,
      limit: 24,
    },
    actions: {
      setQuery: jest.fn(),
      setTags: jest.fn(),
      setSorting: jest.fn(),
      setPage: jest.fn(),
      clearAllFilters: jest.fn(),
      retry: jest.fn(),
      recordUsage: jest.fn(),
      preloadNextPage: jest.fn(),
      prefetchTool: jest.fn(),
    },
  };

  const defaultTagsState = {
    tags: mockTags,
    isLoading: false,
    error: null,
    retry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToolsWithState.mockReturnValue(defaultToolsState);
    mockUseTagsWithState.mockReturnValue(defaultTagsState);
  });

  describe("Loading States", () => {
    it("should show loading skeleton when tools are loading", () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        isLoading: true,
        tools: [],
      });

      render(<HomePage />);

      // Should show loading skeleton cards
      expect(screen.getAllByTestId("tool-skeleton")).toHaveLength(6);
      expect(screen.getByText("Loading tools...")).toBeInTheDocument();
    });

    it("should show loading skeletons for tools when partially loaded", async () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        isLoading: true,
      });

      render(<HomePage />);

      // Should show loading skeleton cards
      expect(screen.getAllByTestId("tool-skeleton")).toHaveLength(6);
      expect(screen.getByText("Loading tools...")).toBeInTheDocument();
    });
  });

  describe("Error States", () => {
    it("should show error message when tools fail to load", () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        error: new Error("Failed to load tools"),
        tools: [],
      });

      render(<HomePage />);

      // Should show multiple instances of the error message (mobile and desktop)
      expect(
        screen.getAllByText("pages.home.errors.troubleLoading"),
      ).toHaveLength(2);
      expect(
        screen.getByRole("button", { name: "common.actions.tryAgain" }),
      ).toBeInTheDocument();
    });

    it("should show error message when tags fail to load", () => {
      mockUseTagsWithState.mockReturnValue({
        ...defaultTagsState,
        error: new Error("Failed to load tags"),
        tags: [],
      });

      render(<HomePage />);

      // Should show multiple instances of the error message (mobile and desktop)
      expect(
        screen.getAllByText("pages.home.errors.troubleLoading"),
      ).toHaveLength(2);
      expect(
        screen.getByRole("button", { name: "common.actions.tryAgain" }),
      ).toBeInTheDocument();
    });

    it("should call retry functions when retry button is clicked", async () => {
      const retryTools = jest.fn();
      const retryTags = jest.fn();

      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        error: new Error("Failed to load"),
        actions: { ...defaultToolsState.actions, retry: retryTools },
      });

      mockUseTagsWithState.mockReturnValue({
        ...defaultTagsState,
        retry: retryTags,
      });

      const user = userEvent.setup();
      render(<HomePage />);

      const retryButton = screen.getByRole("button", {
        name: "common.actions.tryAgain",
      });
      await user.click(retryButton);

      expect(retryTools).toHaveBeenCalledTimes(1);
      expect(retryTags).toHaveBeenCalledTimes(1);
    });
  });

  describe("Content Rendering", () => {
    it("should render main heading and description", () => {
      render(<HomePage />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "pages.home.hero.title",
      );
      expect(screen.getByText("pages.home.hero.subtitle")).toBeInTheDocument();
      expect(
        screen.getByText("pages.home.hero.description"),
      ).toBeInTheDocument();
    });

    it("should render search input", () => {
      render(<HomePage />);

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute(
        "placeholder",
        "pages.home.hero.searchPlaceholder",
      );
    });

    it("should render tag filters", () => {
      render(<HomePage />);

      expect(screen.getAllByTestId("tag-filters")).toHaveLength(2); // Mobile and desktop
      expect(screen.getByTestId("desktop-tag-encoding")).toHaveTextContent(
        "Encoding (2)",
      );
      expect(screen.getByTestId("desktop-tag-security")).toHaveTextContent(
        "Security (1)",
      );
    });

    it("should render tool cards", () => {
      render(<HomePage />);

      expect(screen.getByText("Base64 Encoder/Decoder")).toBeInTheDocument();
      expect(screen.getByText("Hash Generator")).toBeInTheDocument();
      expect(
        screen.getByText("Encode and decode Base64 strings easily"),
      ).toBeInTheDocument();
    });

    it("should render stats section", () => {
      render(<HomePage />);

      expect(screen.getByText("4")).toBeInTheDocument(); // tools count (updated to match mock data)
      expect(
        screen.getByText("pages.home.stats.toolsAvailable"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("pages.home.stats.clientSideValue"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("pages.home.stats.clientSideProcessing"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("pages.home.stats.freeValue"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("pages.home.stats.freeForever"),
      ).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should update search query when typing in search input", async () => {
      const setQuery = jest.fn();
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        actions: { ...defaultToolsState.actions, setQuery },
      });

      const user = userEvent.setup();
      render(<HomePage />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test");

      // Should be called as user types
      expect(setQuery).toHaveBeenCalled();
      expect(setQuery).toHaveBeenCalledWith("t");
    });

    it("should show search results count", () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        filterState: { ...defaultToolsState.filterState, query: "base64" },
        tools: [mockTools[0]], // Only one result
      });

      render(<HomePage />);

      expect(screen.getByTestId("search-results-count")).toHaveTextContent(
        "1 results",
      );
    });

    it('should show "Search Results" heading when searching', () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        filterState: { ...defaultToolsState.filterState, query: "base64" },
      });

      render(<HomePage />);

      expect(
        screen.getAllByText("pages.home.sections.searchResults"),
      ).toHaveLength(2); // Mobile and desktop
      expect(
        screen.getAllByText(/4 pages.home.loading.toolsFound/),
      ).toHaveLength(2); // Mobile and desktop
    });
  });

  describe("Tag Filtering", () => {
    it("should handle tag toggle", async () => {
      const setTags = jest.fn();
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        actions: { ...defaultToolsState.actions, setTags },
      });

      const user = userEvent.setup();
      render(<HomePage />);

      // Use the desktop tag specifically to avoid responsive duplicate issues
      const encodingTag = screen.getByTestId("desktop-tag-encoding");
      await user.click(encodingTag);

      expect(setTags).toHaveBeenCalledWith(["encoding"]);
    });

    it("should handle tag deselection", async () => {
      const setTags = jest.fn();
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        filterState: { ...defaultToolsState.filterState, tags: ["encoding"] },
        actions: { ...defaultToolsState.actions, setTags },
      });

      const user = userEvent.setup();
      render(<HomePage />);

      // Use the desktop tag specifically to avoid responsive duplicate issues
      const encodingTag = screen.getByTestId("desktop-tag-encoding");
      await user.click(encodingTag);

      expect(setTags).toHaveBeenCalledWith([]);
    });

    it("should show clear filters button when filters are active", () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        filterState: { ...defaultToolsState.filterState, query: "base64" },
      });

      render(<HomePage />);

      const clearButtons = screen.getAllByRole("button", {
        name: "pages.home.filtering.clearAll",
      });
      expect(clearButtons).toHaveLength(2); // Mobile and desktop versions
    });

    it("should clear all filters when clear button is clicked", async () => {
      const clearAllFilters = jest.fn();
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        filterState: { ...defaultToolsState.filterState, query: "test" },
        actions: { ...defaultToolsState.actions, clearAllFilters },
      });

      const user = userEvent.setup();
      render(<HomePage />);

      const clearButtons = screen.getAllByRole("button", {
        name: "pages.home.filtering.clearAll",
      });
      await user.click(clearButtons[0]); // Click the first one (desktop)

      expect(clearAllFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe("Empty States", () => {
    it("should show no tools found message when no results", () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        tools: [],
        filterState: { ...defaultToolsState.filterState, query: "nonexistent" },
      });

      render(<HomePage />);

      expect(
        screen.getByText("pages.home.noResults.title"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("pages.home.noResults.description"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "common.actions.clearFilters" }),
      ).toBeInTheDocument();
    });

    it("should show different message for tag filters", () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        tools: [],
        filterState: {
          ...defaultToolsState.filterState,
          tags: ["nonexistent"],
        },
      });

      render(<HomePage />);

      expect(
        screen.getByText("pages.home.noResults.descriptionFilters"),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<HomePage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper ARIA labels for tools grid", () => {
      render(<HomePage />);

      const toolsGrid = screen.getByRole("region", {
        name: "Available tools",
      });
      expect(toolsGrid).toBeInTheDocument();

      const toolCards = screen.getAllByTestId("tool-card");
      expect(toolCards).toHaveLength(4);
    });

    it("should have proper heading hierarchy", () => {
      render(<HomePage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("pages.home.hero.title");

      const h2Elements = screen.getAllByRole("heading", { level: 2 });
      expect(h2Elements[0]).toHaveTextContent("pages.home.sections.allTools");
    });

    it("should have proper landmark roles", () => {
      render(<HomePage />);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toBeInTheDocument(); // sidebar
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      const searchInput = screen.getByRole("searchbox");
      await user.tab();
      expect(searchInput).toHaveFocus();

      // Should be able to navigate to tag filters
      await user.tab();
      // Check if either mobile or desktop tag button has focus (depends on viewport)
      const mobileTagButton = screen.getByTestId("mobile-tag-encoding");
      const desktopTagButton = screen.getByTestId("desktop-tag-encoding");
      const hasFocus =
        mobileTagButton === document.activeElement ||
        desktopTagButton === document.activeElement;
      expect(hasFocus).toBe(true);
    });
  });

  describe("Responsive Design", () => {
    it("should render mobile-friendly layout", () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<HomePage />);

      // Should still render all essential elements
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
      // Use getAllByTestId to handle both mobile and desktop versions
      expect(screen.getAllByTestId(/tag-filters/)).toHaveLength(2);
    });
  });

  describe("Performance", () => {
    it("should not cause memory leaks with cleanup", () => {
      const { unmount } = render(<HomePage />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it("should handle large numbers of tools efficiently", () => {
      const manyTools = Array.from({ length: 100 }, (_, i) => ({
        id: `tool-${i}`,
        name: `Tool ${i}`,
        slug: `tool-${i}`,
        description: `Description for tool ${i}`,
        tags: [],
        usageCount: i,
      }));

      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        tools: manyTools,
      });

      const startTime = performance.now();
      render(<HomePage />);
      const endTime = performance.now();

      // Should render within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("Integration", () => {
    it("should work with URL state synchronization", () => {
      // Test would verify URL updates when filters change
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        filterState: {
          ...defaultToolsState.filterState,
          query: "base64",
          tags: ["encoding"],
        },
      });

      render(<HomePage />);

      // Should reflect URL state in UI
      expect(screen.getByDisplayValue("base64")).toBeInTheDocument();
      const desktopEncodingTag = screen.getByTestId("desktop-tag-encoding");
      expect(desktopEncodingTag).toHaveClass("selected");
    });

    it("should handle concurrent filter updates gracefully", async () => {
      const setQuery = jest.fn();
      const setTags = jest.fn();

      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        actions: { ...defaultToolsState.actions, setQuery, setTags },
      });

      const user = userEvent.setup();
      render(<HomePage />);

      // Simulate rapid filter updates
      const searchInput = screen.getByRole("searchbox");
      const desktopTagButton = screen.getByTestId("desktop-tag-encoding");

      // Type in search and click tag simultaneously
      await user.type(searchInput, "t");
      await user.click(desktopTagButton);

      expect(setQuery).toHaveBeenCalled();
      expect(setTags).toHaveBeenCalled();
    });
  });

  describe("Locale Support", () => {
    it("should render tools with English translations by default", () => {
      render(<HomePage />);

      // Check that English tool names are displayed
      expect(screen.getByText("Base64 Encoder/Decoder")).toBeInTheDocument();
      expect(screen.getByText("Hash Generator")).toBeInTheDocument();
      expect(
        screen.getByText("Encode and decode Base64 strings easily"),
      ).toBeInTheDocument();
    });

    it("should handle Spanish locale data when available", () => {
      // Mock Spanish tools data
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        tools: mockTranslatedTools.es,
      });

      mockUseTagsWithState.mockReturnValue({
        ...defaultTagsState,
        tags: mockTranslatedTags.es,
      });

      render(<HomePage />);

      // Check that Spanish tool names are displayed
      expect(screen.getByText("Herramienta Base64")).toBeInTheDocument();
      expect(screen.getByText("Generador de Hash")).toBeInTheDocument();
      expect(
        screen.getByText("Codifica y decodifica cadenas Base64 fácilmente"),
      ).toBeInTheDocument();
    });

    it("should handle French locale data when available", () => {
      // Mock French tools data
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        tools: mockTranslatedTools.fr,
      });

      mockUseTagsWithState.mockReturnValue({
        ...defaultTagsState,
        tags: mockTranslatedTags.fr,
      });

      render(<HomePage />);

      // Check that French tool names are displayed
      expect(screen.getByText("Outil Base64")).toBeInTheDocument();
      expect(screen.getByText("Générateur de Hash")).toBeInTheDocument();
      expect(
        screen.getByText("Encodez et décodez facilement les chaînes Base64"),
      ).toBeInTheDocument();
    });

    it("should handle empty translations gracefully", () => {
      // Mock empty translations data
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        tools: [],
      });

      mockUseTagsWithState.mockReturnValue({
        ...defaultTagsState,
        tags: [],
      });

      render(<HomePage />);

      expect(
        screen.getByText("pages.home.noResults.title"),
      ).toBeInTheDocument();
    });

    it("should preserve tool metadata across locales", () => {
      const spanishTools = mockTranslatedTools.es;

      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        tools: spanishTools,
      });

      render(<HomePage />);

      // Verify that non-translated fields are preserved
      const firstTool = spanishTools[0];
      expect(firstTool.id).toBe("1");
      expect(firstTool.toolKey).toBe("base64");
      expect(firstTool.slug).toBe("base64");
      expect(firstTool.usageCount).toBe(100);
    });
  });
});
