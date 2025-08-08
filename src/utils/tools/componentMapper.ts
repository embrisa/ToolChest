import { lazy } from "react";

// Lazy load tool components for better performance
const Base64Tool = lazy(() =>
  import("@/components/tools/Base64Tool").then((module) => ({
    default: module.Base64Tool,
  })),
);
const HashGeneratorTool = lazy(() =>
  import("@/components/tools/HashGeneratorTool").then((module) => ({
    default: module.HashGeneratorTool,
  })),
);
const FaviconGeneratorTool = lazy(() =>
  import("@/components/tools/FaviconGeneratorTool").then((module) => ({
    default: module.FaviconGeneratorTool,
  })),
);
const MarkdownToPdfTool = lazy(() =>
  import("@/components/tools/MarkdownToPdfTool").then((module) => ({
    default: module.MarkdownToPdfTool,
  })),
);
const FormatConverterTool = lazy(() =>
  import("@/components/tools/FormatConverterTool").then((module) => ({
    default: module.FormatConverterTool,
  })),
);

// Tool component mapping
export const TOOL_COMPONENTS = {
  base64: Base64Tool,
  "hash-generator": HashGeneratorTool,
  "favicon-generator": FaviconGeneratorTool,
  "markdown-to-pdf": MarkdownToPdfTool,
  "format-converter": FormatConverterTool,
} as const;

export type ToolSlug = keyof typeof TOOL_COMPONENTS;

/**
 * Get the React component for a given tool slug
 */
export function getToolComponent(slug: string) {
  return TOOL_COMPONENTS[slug as ToolSlug];
}

/**
 * Check if a tool slug has a corresponding component
 */
export function isValidToolSlug(slug: string): slug is ToolSlug {
  return slug in TOOL_COMPONENTS;
}
