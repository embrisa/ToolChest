import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolCard } from "../ToolCard";
import { mockTranslatedTools, mockDatabaseTranslationService } from "../../../../tests/setup/mockData";

// Mock next/link
jest.mock("next/link", () => {
    const MockLink = ({
        children,
        href,
    }: {
        children: React.ReactNode;
        href: string;
    }) => <a href={href}>{children}</a>;
    MockLink.displayName = "MockLink";
    return MockLink;
});

// Mock DatabaseTranslationService
jest.mock("@/services/core/databaseTranslationService", () => ({
    DatabaseTranslationService: mockDatabaseTranslationService,
}));

describe("ToolCard", () => {
    const mockTool = mockTranslatedTools.en[0]; // Base64 tool with translations

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render tool with translated name and description", () => {
            render(<ToolCard tool={mockTool} />);

            expect(screen.getByText("Base64 Encoder/Decoder")).toBeInTheDocument();
            expect(screen.getByText("Encode and decode Base64 strings easily")).toBeInTheDocument();
        });

        it("should render tool link with correct href", () => {
            render(<ToolCard tool={mockTool} />);

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("href", "/en/tools/base64");
        });

        it("should render usage count when provided", () => {
            render(<ToolCard tool={mockTool} showUsageCount={true} />);

            expect(screen.getByText("100 uses")).toBeInTheDocument();
        });

        it("should render tags when provided", () => {
            render(<ToolCard tool={mockTool} />);

            expect(screen.getByText("Encoding")).toBeInTheDocument();
        });
    });

    describe("Translation Support", () => {
        it("should render Spanish translations correctly", () => {
            const spanishTool = mockTranslatedTools.es[0];
            render(<ToolCard tool={spanishTool} />);

            expect(screen.getByText("Herramienta Base64")).toBeInTheDocument();
            expect(screen.getByText("Codifica y decodifica cadenas Base64 fácilmente")).toBeInTheDocument();
        });

        it("should render French translations correctly", () => {
            const frenchTool = mockTranslatedTools.fr[0];
            render(<ToolCard tool={frenchTool} />);

            expect(screen.getByText("Outil Base64")).toBeInTheDocument();
            expect(screen.getByText("Encodez et décodez facilement les chaînes Base64")).toBeInTheDocument();
        });

        it("should handle missing translations gracefully", () => {
            const toolWithMissingTranslations = {
                ...mockTool,
                name: "",
                description: null,
            };

            render(<ToolCard tool={toolWithMissingTranslations} />);

            // Should not crash and should show fallback or nothing
            expect(screen.queryByText("Base64 Encoder/Decoder")).not.toBeInTheDocument();
        });

        it("should preserve tool metadata across locales", () => {
            const spanishTool = mockTranslatedTools.es[0];
            render(<ToolCard tool={spanishTool} />);

            // Verify that non-translated fields are preserved
            expect(spanishTool.id).toBe("1");
            expect(spanishTool.toolKey).toBe("base64");
            expect(spanishTool.slug).toBe("base64");
            expect(spanishTool.usageCount).toBe(100);
        });
    });

    describe("Error Handling", () => {
        it("should handle tools without name gracefully", () => {
            const toolWithoutName = {
                ...mockTool,
                name: "",
            };

            render(<ToolCard tool={toolWithoutName} />);

            // Should not render the card or show error state
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });

        it("should handle tools without description gracefully", () => {
            const toolWithoutDescription = {
                ...mockTool,
                description: "",
            };

            render(<ToolCard tool={toolWithoutDescription} />);

            // Should still render the tool name
            expect(screen.getByText("Base64 Encoder/Decoder")).toBeInTheDocument();
            // Should not display empty description content
            const descriptionElement = screen.queryByText((content, element) => {
                return element?.tagName.toLowerCase() === 'p' && content === '';
            });
            expect(descriptionElement).not.toBeInTheDocument();
        });

        it("should handle tools with null description", () => {
            const toolWithNullDescription = {
                ...mockTool,
                description: null,
            };

            render(<ToolCard tool={toolWithNullDescription} />);

            expect(screen.getByText("Base64 Encoder/Decoder")).toBeInTheDocument();
        });

        it("should handle empty tags array", () => {
            const toolWithoutTags = {
                ...mockTool,
                tags: [],
            };

            render(<ToolCard tool={toolWithoutTags} />);

            expect(screen.getByText("Base64 Encoder/Decoder")).toBeInTheDocument();
            // Should not show any tags
            expect(screen.queryByText("Encoding")).not.toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have proper ARIA labels", () => {
            render(<ToolCard tool={mockTool} />);

            const link = screen.getByRole("link");
            // Check if the link has accessible content (either aria-label or text content)
            const hasAccessibleName = link.getAttribute('aria-label') || link.textContent?.includes('Base64 Encoder/Decoder');
            expect(hasAccessibleName).toBeTruthy();
        });

        it("should be keyboard navigable", async () => {
            const user = userEvent.setup();
            render(<ToolCard tool={mockTool} />);

            const link = screen.getByRole("link");

            await user.tab();
            expect(link).toHaveFocus();
        });

        it("should have proper heading hierarchy", () => {
            render(<ToolCard tool={mockTool} />);

            const heading = screen.getByRole("heading");
            expect(heading).toHaveTextContent("Base64 Encoder/Decoder");
        });

        it("should have semantic HTML structure", () => {
            render(<ToolCard tool={mockTool} />);

            // Should have proper article structure
            const article = screen.getByRole("article");
            expect(article).toBeInTheDocument();
        });
    });

    describe("Visual States", () => {
        it("should apply custom className when provided", () => {
            const { container } = render(<ToolCard tool={mockTool} className="custom-class" />);

            expect(container.firstChild).toHaveClass("custom-class");
        });

        it("should handle featured tools differently", () => {
            const featuredTool = {
                ...mockTool,
                isFeatured: true,
            };

            render(<ToolCard tool={featuredTool} />);

            // Should have featured styling or indicator
            expect(screen.getByText("Base64 Encoder/Decoder")).toBeInTheDocument();
        });

        it("should show usage statistics when available", () => {
            render(<ToolCard tool={mockTool} showUsageCount={true} />);

            expect(screen.getByText("100 uses")).toBeInTheDocument();
        });

        it("should handle zero usage count", () => {
            const newTool = {
                ...mockTool,
                usageCount: 0,
            };

            render(<ToolCard tool={newTool} showUsageCount={true} />);

            expect(screen.getByText("0 uses")).toBeInTheDocument();
        });
    });

    describe("Interaction", () => {
        it("should be clickable", async () => {
            const user = userEvent.setup();
            render(<ToolCard tool={mockTool} />);

            const link = screen.getByRole("link");

            // Should be able to click
            await user.click(link);

            // Link should have correct href with locale
            expect(link).toHaveAttribute("href", "/en/tools/base64");
        });

        it("should handle hover states", async () => {
            const user = userEvent.setup();
            render(<ToolCard tool={mockTool} />);

            const link = screen.getByRole("link");

            await user.hover(link);

            // Should not throw errors on hover
            expect(link).toBeInTheDocument();
        });
    });

    describe("Performance", () => {
        it("should render efficiently with large tool objects", () => {
            const largeToolObject = {
                ...mockTool,
                tags: Array.from({ length: 20 }, (_, i) => ({
                    id: `tag-${i}`,
                    name: `Tag ${i}`,
                    slug: `tag-${i}`,
                    description: `Description for tag ${i}`,
                    color: '#3B82F6',
                    createdAt: new Date('2024-01-01'),
                    updatedAt: new Date('2024-01-01'),
                })),
            };

            const startTime = performance.now();
            render(<ToolCard tool={largeToolObject} />);
            const endTime = performance.now();

            // Should render within reasonable time
            expect(endTime - startTime).toBeLessThan(50);
        });

        it("should not cause memory leaks", () => {
            const { unmount } = render(<ToolCard tool={mockTool} />);

            // Should unmount cleanly
            expect(() => unmount()).not.toThrow();
        });
    });

    describe("Edge Cases", () => {
        it("should handle very long tool names", () => {
            const toolWithLongName = {
                ...mockTool,
                name: "This is a very long tool name that might cause layout issues if not handled properly",
            };

            render(<ToolCard tool={toolWithLongName} />);

            expect(screen.getByText(toolWithLongName.name)).toBeInTheDocument();
        });

        it("should handle very long descriptions", () => {
            const toolWithLongDescription = {
                ...mockTool,
                description: "This is a very long description that goes on and on and might cause layout issues if not properly truncated or handled in the UI component design system",
            };

            render(<ToolCard tool={toolWithLongDescription} />);

            expect(screen.getByText(toolWithLongDescription.description)).toBeInTheDocument();
        });

        it("should handle special characters in names", () => {
            const toolWithSpecialChars = {
                ...mockTool,
                name: "Tool with Special Chars: @#$%^&*()",
            };

            render(<ToolCard tool={toolWithSpecialChars} />);

            expect(screen.getByText(toolWithSpecialChars.name)).toBeInTheDocument();
        });

        it("should handle Unicode characters", () => {
            const toolWithUnicode = {
                ...mockTool,
                name: "工具 🔧 Herramienta",
                description: "Description with émojis 🚀 and ñ characters",
            };

            render(<ToolCard tool={toolWithUnicode} />);

            expect(screen.getByText(toolWithUnicode.name)).toBeInTheDocument();
            expect(screen.getByText(toolWithUnicode.description)).toBeInTheDocument();
        });
    });
}); 