"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  PdfStylingOptions,
  PdfTemplate,
  PDF_TEMPLATES,
  PdfFontFamily,
  SyntaxTheme,
  PdfTheme,
} from "@/types/tools/markdownToPdf";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  DocumentTextIcon,
  Cog6ToothIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface PdfCustomizationPanelProps {
  stylingOptions: PdfStylingOptions;
  onStylingChange: (options: PdfStylingOptions) => void;
  onPreviewChange?: (enabled: boolean) => void;
  showPreview?: boolean;
}

export function PdfCustomizationPanel({
  stylingOptions,
  onStylingChange,
  onPreviewChange,
  showPreview = true,
}: PdfCustomizationPanelProps) {
  const tMarkdown = useTranslations("tools.markdown-to-pdf");
  const updateStyling = (updates: Partial<PdfStylingOptions>) => {
    onStylingChange({ ...stylingOptions, ...updates });
  };

  // Helper functions to ensure proper structure with required properties
  const updateHeader = (
    updates: Partial<NonNullable<PdfStylingOptions["header"]>>,
  ) => {
    const currentHeader = stylingOptions.header || { enabled: false };
    updateStyling({
      header: {
        ...currentHeader,
        enabled: currentHeader.enabled ?? false, // Ensure enabled is always boolean
        ...updates,
      },
    });
  };

  const updateFooter = (
    updates: Partial<NonNullable<PdfStylingOptions["footer"]>>,
  ) => {
    const currentFooter = stylingOptions.footer || { enabled: false };
    updateStyling({
      footer: {
        ...currentFooter,
        enabled: currentFooter.enabled ?? false, // Ensure enabled is always boolean
        ...updates,
      },
    });
  };

  const updateTableOfContents = (
    updates: Partial<NonNullable<PdfStylingOptions["tableOfContents"]>>,
  ) => {
    const currentToc = stylingOptions.tableOfContents || { enabled: false };
    updateStyling({
      tableOfContents: {
        ...currentToc,
        enabled: currentToc.enabled ?? false, // Ensure enabled is always boolean
        ...updates,
      },
    });
  };

  const updateSyntaxHighlighting = (
    updates: Partial<NonNullable<PdfStylingOptions["syntaxHighlighting"]>>,
  ) => {
    const currentSyntax = stylingOptions.syntaxHighlighting || {
      enabled: false,
      theme: "github",
    };
    updateStyling({
      syntaxHighlighting: {
        ...currentSyntax,
        enabled: currentSyntax.enabled ?? false, // Ensure enabled is always boolean
        theme: currentSyntax.theme ?? "github", // Ensure theme is always present
        ...updates,
      },
    });
  };

  const updateAccessibility = (
    updates: Partial<NonNullable<PdfStylingOptions["accessibility"]>>,
  ) => {
    const currentAccessibility = stylingOptions.accessibility || {};
    updateStyling({
      accessibility: {
        ...currentAccessibility,
        ...updates,
      },
    });
  };

  const applyTemplate = (template: PdfTemplate) => {
    onStylingChange({
      ...stylingOptions,
      ...template.stylingOptions,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="tool-icon tool-icon-pdf mx-auto">
          <span className="text-2xl">📄</span>
        </div>
        <div>
          <h1 className="text-display text-4xl font-bold text-gradient-brand mb-2">
            PDF Customization
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Customize your PDF output with templates, typography, colors, and
            advanced options
          </p>
        </div>
      </div>

      {/* Preview Toggle */}
      {onPreviewChange && (
        <div className="flex justify-center">
          <Button
            variant={showPreview ? "primary" : "secondary"}
            onClick={() => onPreviewChange(!showPreview)}
            className="flex items-center gap-2"
          >
            <EyeIcon className="h-4 w-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      )}

      {/* Template Selection */}
      <Card className="tool-card tool-card-pdf">
        <CardHeader>
          <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            PDF Templates
          </h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
            Choose a pre-designed template for your PDF styling
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PDF_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className={`group p-4 text-left border-2 rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
                  stylingOptions.theme === template.stylingOptions.theme
                    ? "border-brand-400 bg-brand-50 dark:bg-brand-950/20 shadow-colored"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-brand-300 hover:bg-brand-50/30 dark:hover:bg-brand-950/10"
                }`}
                aria-label={`Apply ${template.name} template`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {template.name}
                    </span>
                    {template.recommended && (
                      <span className="text-xs bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-300 px-2 py-1 rounded-lg font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {template.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography Settings */}
      <Card>
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/50 rounded-xl flex items-center justify-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Typography
              </h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
                Customize fonts, sizes, and text styling
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label mb-3">Font Family</label>
              <select
                value={stylingOptions.fontFamily}
                onChange={(e) =>
                  updateStyling({ fontFamily: e.target.value as PdfFontFamily })
                }
                className="select"
                aria-label="Select font family"
              >
                <option value="sans-serif">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
                <option value="times">Times</option>
                <option value="helvetica">Helvetica</option>
                <option value="courier">Courier</option>
              </select>
            </div>
            <div>
              <label className="form-label mb-3">
                Font Size: {stylingOptions.fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="24"
                value={stylingOptions.fontSize}
                onChange={(e) =>
                  updateStyling({ fontSize: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Adjust font size"
              />
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                <span>8px</span>
                <span>24px</span>
              </div>
            </div>
            <div>
              <label className="form-label mb-3">
                Line Height: {stylingOptions.lineHeight}
              </label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={stylingOptions.lineHeight}
                onChange={(e) =>
                  updateStyling({ lineHeight: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Adjust line height"
              />
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                <span>1.0</span>
                <span>2.0</span>
              </div>
            </div>
            <div>
              <label className="form-label mb-3">
                Heading Scale: {stylingOptions.headingScale}
              </label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={stylingOptions.headingScale}
                onChange={(e) =>
                  updateStyling({ headingScale: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Adjust heading scale"
              />
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                <span>1.0</span>
                <span>2.0</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Color Theme */}
      <Card>
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 dark:bg-success-900/50 rounded-xl flex items-center justify-center">
              <SwatchIcon className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Color Theme
              </h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
                Choose colors for your PDF design
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label mb-3">Theme</label>
              <select
                value={stylingOptions.theme}
                onChange={(e) =>
                  updateStyling({ theme: e.target.value as PdfTheme })
                }
                className="select"
                aria-label="Select color theme"
              >
                <option value="default">
                  {tMarkdown("tool.themes.default")}
                </option>
                <option value="github">
                  {tMarkdown("tool.themes.github")}
                </option>
                <option value="academic">
                  {tMarkdown("tool.themes.academic")}
                </option>
                <option value="minimal">
                  {tMarkdown("tool.themes.minimal")}
                </option>
                <option value="dark">Dark</option>
                <option value="professional">
                  {tMarkdown("tool.themes.professional")}
                </option>
              </select>
            </div>
            <div>
              <label className="form-label mb-3">Primary Color</label>
              <input
                type="color"
                value={stylingOptions.linkColor || "#0ea5e9"}
                onChange={(e) => updateStyling({ linkColor: e.target.value })}
                className="w-full h-12 border border-neutral-300 dark:border-neutral-600 rounded-xl cursor-pointer focus:ring-2 focus:ring-brand-500/50"
                aria-label="Select link color"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Page Layout */}
      <Card>
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900/50 rounded-xl flex items-center justify-center">
              <DocumentCheckIcon className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Page Layout
              </h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
                Configure page size, margins, and layout options
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label mb-3">Page Format</label>
              <select
                value={stylingOptions.format}
                onChange={(e) =>
                  updateStyling({
                    format: e.target.value as "a4" | "letter" | "legal",
                  })
                }
                className="select"
                aria-label="Select page format"
              >
                <option value="a4">{tMarkdown("tool.pageSizes.a4")}</option>
                <option value="letter">
                  {tMarkdown("tool.pageSizes.letter")}
                </option>
                <option value="legal">
                  {tMarkdown("tool.pageSizes.legal")}
                </option>
              </select>
            </div>
            <div>
              <label className="form-label mb-3">
                Margin: {stylingOptions.margin.top}mm
              </label>
              <input
                type="range"
                min="10"
                max="40"
                value={stylingOptions.margin.top}
                onChange={(e) => {
                  const marginValue = parseInt(e.target.value);
                  updateStyling({
                    margin: {
                      top: marginValue,
                      right: marginValue,
                      bottom: marginValue,
                      left: marginValue,
                    },
                  });
                }}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Adjust page margin"
              />
              <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                <span>10mm</span>
                <span>40mm</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Advanced Options */}
      <Card>
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
              <Cog6ToothIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Advanced Options
              </h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
                Additional features and customizations
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Headers and Footers */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Headers & Footers
              </h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={stylingOptions.header?.enabled || false}
                    onChange={(e) =>
                      updateHeader({ enabled: e.target.checked })
                    }
                    className="checkbox"
                  />
                  <span className="form-label">Include page headers</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={stylingOptions.footer?.enabled || false}
                    onChange={(e) =>
                      updateFooter({ enabled: e.target.checked })
                    }
                    className="checkbox"
                  />
                  <span className="form-label">Include page footers</span>
                </label>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Table of Contents
              </h4>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={stylingOptions.tableOfContents?.enabled || false}
                  onChange={(e) =>
                    updateTableOfContents({ enabled: e.target.checked })
                  }
                  className="checkbox"
                />
                <span className="form-label">Generate table of contents</span>
              </label>
            </div>

            {/* Syntax Highlighting */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Code Highlighting
              </h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={
                      stylingOptions.syntaxHighlighting?.enabled || false
                    }
                    onChange={(e) =>
                      updateSyntaxHighlighting({ enabled: e.target.checked })
                    }
                    className="checkbox"
                  />
                  <span className="form-label">Enable syntax highlighting</span>
                </label>
                {stylingOptions.syntaxHighlighting?.enabled && (
                  <div className="ml-6">
                    <label className="form-label mb-2">
                      Highlighting Theme
                    </label>
                    <select
                      value={
                        stylingOptions.syntaxHighlighting.theme || "github"
                      }
                      onChange={(e) =>
                        updateSyntaxHighlighting({
                          theme: e.target.value as SyntaxTheme,
                        })
                      }
                      className="select"
                      aria-label="Select syntax highlighting theme"
                    >
                      <option value="github">GitHub</option>
                      <option value="github-dark">GitHub Dark</option>
                      <option value="monokai">Monokai</option>
                      <option value="solarized-light">Solarized Light</option>
                      <option value="solarized-dark">Solarized Dark</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Accessibility */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Accessibility
              </h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={
                      stylingOptions.accessibility?.highContrast || false
                    }
                    onChange={(e) =>
                      updateAccessibility({ highContrast: e.target.checked })
                    }
                    className="checkbox"
                  />
                  <span className="form-label">High contrast mode</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={stylingOptions.accessibility?.fontSize === "large"}
                    onChange={(e) =>
                      updateAccessibility({
                        fontSize: e.target.checked ? "large" : "normal",
                      })
                    }
                    className="checkbox"
                  />
                  <span className="form-label">Large text size</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
