'use client';

import React from 'react';
import {
    PdfStylingOptions,
    PdfTemplate,
    PDF_TEMPLATES,
    PdfFontFamily,
    SyntaxTheme
} from '@/types/tools/markdownToPdf';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    DocumentTextIcon,
    Cog6ToothIcon,
    EyeIcon,
    AdjustmentsHorizontalIcon,
    SwatchIcon,
    DocumentCheckIcon,
} from '@heroicons/react/24/outline';

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
    const updateStyling = (updates: Partial<PdfStylingOptions>) => {
        onStylingChange({ ...stylingOptions, ...updates });
    };

    // Helper functions to ensure proper structure with required properties
    const updateHeader = (updates: Partial<NonNullable<PdfStylingOptions['header']>>) => {
        const currentHeader = stylingOptions.header || { enabled: false };
        updateStyling({
            header: {
                ...currentHeader,
                enabled: currentHeader.enabled ?? false, // Ensure enabled is always boolean
                ...updates,
            }
        });
    };

    const updateFooter = (updates: Partial<NonNullable<PdfStylingOptions['footer']>>) => {
        const currentFooter = stylingOptions.footer || { enabled: false };
        updateStyling({
            footer: {
                ...currentFooter,
                enabled: currentFooter.enabled ?? false, // Ensure enabled is always boolean
                ...updates,
            }
        });
    };

    const updateTableOfContents = (updates: Partial<NonNullable<PdfStylingOptions['tableOfContents']>>) => {
        const currentToc = stylingOptions.tableOfContents || { enabled: false };
        updateStyling({
            tableOfContents: {
                ...currentToc,
                enabled: currentToc.enabled ?? false, // Ensure enabled is always boolean
                ...updates,
            }
        });
    };

    const updateSyntaxHighlighting = (updates: Partial<NonNullable<PdfStylingOptions['syntaxHighlighting']>>) => {
        const currentSyntax = stylingOptions.syntaxHighlighting || { enabled: false, theme: 'github' };
        updateStyling({
            syntaxHighlighting: {
                ...currentSyntax,
                enabled: currentSyntax.enabled ?? false, // Ensure enabled is always boolean
                theme: currentSyntax.theme ?? 'github', // Ensure theme is always present
                ...updates,
            }
        });
    };



    const updateAccessibility = (updates: Partial<NonNullable<PdfStylingOptions['accessibility']>>) => {
        const currentAccessibility = stylingOptions.accessibility || {};
        updateStyling({
            accessibility: {
                ...currentAccessibility,
                ...updates,
            }
        });
    };

    const applyTemplate = (template: PdfTemplate) => {
        onStylingChange({
            ...stylingOptions,
            ...template.stylingOptions,
        });
    };

    return (
        <div className="space-y-6">
            {/* Template Selection */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">PDF Templates</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PDF_TEMPLATES.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => applyTemplate(template)}
                            className={`p-3 text-left border-2 rounded-lg transition-all hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${stylingOptions.theme === template.stylingOptions.theme
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'
                                }`}
                            aria-label={`Apply ${template.name} template`}
                        >
                            <div className="font-medium text-sm text-gray-900">
                                {template.name}
                                {template.recommended && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                        Recommended
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {template.description}
                            </div>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Typography Settings */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Typography</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Font Family
                        </label>
                        <select
                            value={stylingOptions.fontFamily}
                            onChange={(e) => updateStyling({ fontFamily: e.target.value as PdfFontFamily })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Font Size: {stylingOptions.fontSize}px
                        </label>
                        <input
                            type="range"
                            min="8"
                            max="24"
                            value={stylingOptions.fontSize}
                            onChange={(e) => updateStyling({ fontSize: parseInt(e.target.value) })}
                            className="w-full"
                            aria-label="Adjust font size"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Line Height: {stylingOptions.lineHeight}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="2"
                            step="0.1"
                            value={stylingOptions.lineHeight}
                            onChange={(e) => updateStyling({ lineHeight: parseFloat(e.target.value) })}
                            className="w-full"
                            aria-label="Adjust line height"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heading Scale: {stylingOptions.headingScale}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="2"
                            step="0.1"
                            value={stylingOptions.headingScale}
                            onChange={(e) => updateStyling({ headingScale: parseFloat(e.target.value) })}
                            className="w-full"
                            aria-label="Adjust heading scale"
                        />
                    </div>
                </div>
            </Card>

            {/* Colors */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <SwatchIcon className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Colors</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Background Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={stylingOptions.backgroundColor || '#ffffff'}
                                onChange={(e) => updateStyling({ backgroundColor: e.target.value })}
                                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                aria-label="Select background color"
                            />
                            <input
                                type="text"
                                value={stylingOptions.backgroundColor || '#ffffff'}
                                onChange={(e) => updateStyling({ backgroundColor: e.target.value })}
                                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="#ffffff"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Text Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={stylingOptions.textColor || '#000000'}
                                onChange={(e) => updateStyling({ textColor: e.target.value })}
                                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                aria-label="Select text color"
                            />
                            <input
                                type="text"
                                value={stylingOptions.textColor || '#000000'}
                                onChange={(e) => updateStyling({ textColor: e.target.value })}
                                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={stylingOptions.linkColor || '#0066cc'}
                                onChange={(e) => updateStyling({ linkColor: e.target.value })}
                                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                aria-label="Select link color"
                            />
                            <input
                                type="text"
                                value={stylingOptions.linkColor || '#0066cc'}
                                onChange={(e) => updateStyling({ linkColor: e.target.value })}
                                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="#0066cc"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Header & Footer */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <DocumentCheckIcon className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold">Header & Footer</h3>
                </div>

                <div className="space-y-4">
                    {/* Header Settings */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="header-enabled"
                                checked={stylingOptions.header?.enabled || false}
                                onChange={(e) => updateHeader({ enabled: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="header-enabled" className="font-medium text-gray-900">
                                Enable Header
                            </label>
                        </div>

                        {stylingOptions.header?.enabled && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Header Content
                                    </label>
                                    <input
                                        type="text"
                                        value={stylingOptions.header?.content || ''}
                                        onChange={(e) => updateStyling({
                                            header: {
                                                enabled: stylingOptions.header?.enabled || false,
                                                ...stylingOptions.header,
                                                content: e.target.value
                                            }
                                        })}
                                        placeholder="e.g., {{title}} | {{date}}"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Use variables: &#123;&#123;title&#125;&#125;, &#123;&#123;author&#125;&#125;, &#123;&#123;date&#125;&#125;
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Alignment
                                        </label>
                                        <select
                                            value={stylingOptions.header?.alignment || 'center'}
                                            onChange={(e) => updateHeader({ alignment: e.target.value as 'left' | 'center' | 'right' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Border Bottom
                                        </label>
                                        <input
                                            type="checkbox"
                                            checked={stylingOptions.header?.borderBottom || false}
                                            onChange={(e) => updateHeader({ borderBottom: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Settings */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="footer-enabled"
                                checked={stylingOptions.footer?.enabled || false}
                                onChange={(e) => updateFooter({ enabled: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="footer-enabled" className="font-medium text-gray-900">
                                Enable Footer
                            </label>
                        </div>

                        {stylingOptions.footer?.enabled && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Footer Content
                                    </label>
                                    <input
                                        type="text"
                                        value={stylingOptions.footer?.content || ''}
                                        onChange={(e) => updateFooter({ content: e.target.value })}
                                        placeholder="e.g., {{author}}"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Alignment
                                        </label>
                                        <select
                                            value={stylingOptions.footer?.alignment || 'center'}
                                            onChange={(e) => updateFooter({ alignment: e.target.value as 'left' | 'center' | 'right' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Page Numbers
                                        </label>
                                        <input
                                            type="checkbox"
                                            checked={stylingOptions.footer?.includePageNumbers || false}
                                            onChange={(e) => updateFooter({ includePageNumbers: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Border Top
                                        </label>
                                        <input
                                            type="checkbox"
                                            checked={stylingOptions.footer?.borderTop || false}
                                            onChange={(e) => updateFooter({ borderTop: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Table of Contents */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Cog6ToothIcon className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold">Table of Contents</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="toc-enabled"
                            checked={stylingOptions.tableOfContents?.enabled || false}
                            onChange={(e) => updateTableOfContents({ enabled: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="toc-enabled" className="font-medium text-gray-900">
                            Generate Table of Contents
                        </label>
                    </div>

                    {stylingOptions.tableOfContents?.enabled && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={stylingOptions.tableOfContents?.title || 'Table of Contents'}
                                    onChange={(e) => updateTableOfContents({ title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Depth
                                    </label>
                                    <select
                                        value={stylingOptions.tableOfContents?.maxDepth || 3}
                                        onChange={(e) => updateTableOfContents({ maxDepth: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={1}>H1 only</option>
                                        <option value={2}>H1-H2</option>
                                        <option value={3}>H1-H3</option>
                                        <option value={4}>H1-H4</option>
                                        <option value={5}>H1-H5</option>
                                        <option value={6}>H1-H6</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="toc-page-numbers"
                                            checked={stylingOptions.tableOfContents?.includePageNumbers || false}
                                            onChange={(e) => updateTableOfContents({ includePageNumbers: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="toc-page-numbers" className="text-sm text-gray-700">
                                            Page Numbers
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="toc-dot-fill"
                                            checked={stylingOptions.tableOfContents?.dotFill || false}
                                            onChange={(e) => updateTableOfContents({ dotFill: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="toc-dot-fill" className="text-sm text-gray-700">
                                            Dot Fill
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Syntax Highlighting */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Cog6ToothIcon className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-semibold">Syntax Highlighting</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="syntax-enabled"
                            checked={stylingOptions.syntaxHighlighting?.enabled || false}
                            onChange={(e) => updateSyntaxHighlighting({ enabled: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="syntax-enabled" className="font-medium text-gray-900">
                            Enable Syntax Highlighting
                        </label>
                    </div>

                    {stylingOptions.syntaxHighlighting?.enabled && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Theme
                                </label>
                                <select
                                    value={stylingOptions.syntaxHighlighting?.theme || 'github'}
                                    onChange={(e) => updateSyntaxHighlighting({ theme: e.target.value as SyntaxTheme })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="github">GitHub</option>
                                    <option value="monokai">Monokai</option>
                                    <option value="vs">Visual Studio</option>
                                    <option value="atom-one-dark">Atom One Dark</option>
                                    <option value="rainbow">Rainbow</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Font Size: {stylingOptions.syntaxHighlighting?.fontSize || 11}px
                                    </label>
                                    <input
                                        type="range"
                                        min="8"
                                        max="16"
                                        value={stylingOptions.syntaxHighlighting?.fontSize || 11}
                                        onChange={(e) => updateSyntaxHighlighting({ fontSize: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="syntax-line-numbers"
                                            checked={stylingOptions.syntaxHighlighting?.lineNumbers || false}
                                            onChange={(e) => updateSyntaxHighlighting({ lineNumbers: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="syntax-line-numbers" className="text-sm text-gray-700">
                                            Line Numbers
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Accessibility Settings */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <EyeIcon className="h-5 w-5 text-teal-600" />
                    <h3 className="text-lg font-semibold">Accessibility</h3>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="high-contrast"
                                    checked={stylingOptions.accessibility?.highContrast || false}
                                    onChange={(e) => updateAccessibility({ highContrast: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="high-contrast" className="text-sm text-gray-700">
                                    High Contrast Mode
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="structured-headings"
                                    checked={stylingOptions.accessibility?.structuredHeadings || false}
                                    onChange={(e) => updateAccessibility({ structuredHeadings: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="structured-headings" className="text-sm text-gray-700">
                                    Structured Headings
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="alt-text-images"
                                    checked={stylingOptions.accessibility?.altTextForImages || false}
                                    onChange={(e) => updateAccessibility({ altTextForImages: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="alt-text-images" className="text-sm text-gray-700">
                                    Alt Text for Images
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Accessibility Font Size
                            </label>
                            <select
                                value={stylingOptions.accessibility?.fontSize || 'normal'}
                                onChange={(e) => updateAccessibility({ fontSize: e.target.value as 'small' | 'normal' | 'large' | 'x-large' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="small">Small</option>
                                <option value="normal">Normal</option>
                                <option value="large">Large</option>
                                <option value="x-large">Extra Large</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Preview Toggle */}
            {onPreviewChange && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => onPreviewChange(!showPreview)}
                        className="flex items-center gap-2"
                    >
                        <EyeIcon className="h-4 w-4" />
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                </div>
            )}
        </div>
    );
} 