import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import HomePage from "../page";

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
  }: {
    tags: Array<{ id: string; name: string; slug: string; toolCount?: number }>;
    selectedTags: string[];
    onTagToggle: (slug: string) => void;
    onClearAll: () => void;
    showCount?: boolean;
  }) => (
    <div data-testid="tag-filters">
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagToggle(tag.slug)}
          className={selectedTags.includes(tag.slug) ? "selected" : ""}
          data-testid={`tag-${tag.slug}`}
        >
          {tag.name}
          {showCount && tag.toolCount && ` (${tag.toolCount})`}
        </button>
      ))}
      <button onClick={onClearAll} data-testid="clear-all-tags">
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

describe("HomePage", () => {
  const mockTools = [
    {
      id: "1",
      name: "Base64 Encoder",
      slug: "base64",
      description: "Encode and decode Base64 strings",
      tags: [{ id: "1", name: "Encoding", slug: "encoding" }],
      usageCount: 100,
    },
    {
      id: "2",
      name: "Hash Generator",
      slug: "hash-generator",
      description: "Generate MD5, SHA1, SHA256 hashes",
      tags: [{ id: "2", name: "Security", slug: "security" }],
      usageCount: 75,
    },
  ];

  const mockTags = [
    { id: "1", name: "Encoding", slug: "encoding", toolCount: 3 },
    { id: "2", name: "Security", slug: "security", toolCount: 2 },
  ];

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

      await waitFor(() => {
        // Should show skeleton cards
        const skeletons = screen.getAllByTestId("tool-skeleton");
        expect(skeletons.length).toBeGreaterThan(0);
      });
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

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText(/We're having trouble loading the tools/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try again/i }),
      ).toBeInTheDocument();
    });

    it("should show error message when tags fail to load", () => {
      mockUseTagsWithState.mockReturnValue({
        ...defaultTagsState,
        error: new Error("Failed to load tags"),
        tags: [],
      });

      render(<HomePage />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
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

      const retryButton = screen.getByRole("button", { name: /try again/i });
      await user.click(retryButton);

      expect(retryTools).toHaveBeenCalledTimes(1);
      expect(retryTags).toHaveBeenCalledTimes(1);
    });
  });

  describe("Content Rendering", () => {
    it("should render main heading and description", () => {
      render(<HomePage />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "tool-chest",
      );
      expect(
        screen.getByText(/Your collection of essential web development tools/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Encode, decode, generate, and convert with ease/),
      ).toBeInTheDocument();
    });

    it("should render search input", () => {
      render(<HomePage />);

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("placeholder", "Search tools...");
    });

    it("should render tag filters", () => {
      render(<HomePage />);

      expect(screen.getByTestId("tag-filters")).toBeInTheDocument();
      expect(screen.getByTestId("tag-encoding")).toHaveTextContent(
        "Encoding (3)",
      );
      expect(screen.getByTestId("tag-security")).toHaveTextContent(
        "Security (2)",
      );
    });

    it("should render tool cards", () => {
      render(<HomePage />);

      expect(screen.getByText("Base64 Encoder")).toBeInTheDocument();
      expect(screen.getByText("Hash Generator")).toBeInTheDocument();
      expect(
        screen.getByText("Encode and decode Base64 strings"),
      ).toBeInTheDocument();
    });

    it("should render stats section", () => {
      render(<HomePage />);

      expect(screen.getByText("2")).toBeInTheDocument(); // tools count
      expect(screen.getByText("Tools Available")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByText("Client-side Processing")).toBeInTheDocument();
      expect(screen.getByText("Free")).toBeInTheDocument();
      expect(screen.getByText("Forever")).toBeInTheDocument();
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

      expect(screen.getByText("Search Results")).toBeInTheDocument();
      expect(screen.getByText("2 tools found")).toBeInTheDocument();
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

      const encodingTag = screen.getByTestId("tag-encoding");
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

      const encodingTag = screen.getByTestId("tag-encoding");
      await user.click(encodingTag);

      expect(setTags).toHaveBeenCalledWith([]);
    });

    it("should show clear filters button when filters are active", () => {
      mockUseToolsWithState.mockReturnValue({
        ...defaultToolsState,
        filterState: { ...defaultToolsState.filterState, query: "base64" },
      });

      render(<HomePage />);

      expect(
        screen.getByRole("button", { name: /clear all filters/i }),
      ).toBeInTheDocument();
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

      const clearButton = screen.getByRole("button", {
        name: /clear all filters/i,
      });
      await user.click(clearButton);

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

      expect(screen.getByText("No tools found")).toBeInTheDocument();
      expect(
        screen.getByText('No tools match "nonexistent"'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /clear filters/i }),
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
        screen.getByText("No tools match your selected filters"),
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
        name: /available tools/i,
      });
      expect(toolsGrid).toBeInTheDocument();

      const toolCards = screen.getAllByTestId("tool-card");
      expect(toolCards).toHaveLength(2);
    });

    it("should have proper heading hierarchy", () => {
      render(<HomePage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("tool-chest");

      const h2 = screen.getByRole("heading", { level: 2 });
      expect(h2).toHaveTextContent("All Tools");
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
      const firstTag = screen.getByTestId("tag-encoding");
      expect(firstTag).toHaveFocus();
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
      expect(screen.getByTestId("tag-filters")).toBeInTheDocument();
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
      expect(screen.getByTestId("tag-encoding")).toHaveClass("selected");
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
      const tagButton = screen.getByTestId("tag-encoding");

      // Type in search and click tag simultaneously
      await user.type(searchInput, "t");
      await user.click(tagButton);

      expect(setQuery).toHaveBeenCalled();
      expect(setTags).toHaveBeenCalled();
    });
  });
});
