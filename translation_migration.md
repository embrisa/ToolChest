# Translation Migration

This document tracks progress on adding i18n support.

## Task 1A – Set Up Translation Foundation

- ✅ Completed in previous work (next-intl configured and base messages added).

## Task 1B – Audit Components

- Inspect `src/components` for hard-coded strings that need translation.
- **Status:** Completed.

### Components Requiring Translation

The following components contain user facing text that is currently hard-coded and should be refactored to use `next-intl` translations:

- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/errors/ErrorBoundary.tsx`
- `src/components/errors/ErrorPage.tsx`
- `src/components/errors/ErrorTemplates.tsx`
- `src/components/errors/ErrorRecoveryProvider.tsx`
- `src/components/admin/AnalyticsDashboard.tsx`
- `src/components/admin/AnalyticsChart.tsx`
- `src/components/admin/BulkOperations.tsx`
- `src/components/admin/TagForm.tsx`
- `src/components/admin/TagFilters.tsx`
- `src/components/admin/TagTable.tsx`
- `src/components/admin/TagUsageStats.tsx`
- `src/components/admin/ToolForm.tsx`
- `src/components/admin/ToolFilters.tsx`
- `src/components/admin/ToolTable.tsx`
- `src/components/admin/SystemHealthDashboard.tsx`
- `src/components/tools/Base64Tool.tsx`
- `src/components/tools/FaviconGeneratorTool.tsx`
- `src/components/tools/FaviconPreview.tsx`
- `src/components/tools/HashGeneratorTool.tsx`
- `src/components/tools/MarkdownToPdfTool.tsx`
- `src/components/tools/PdfCustomizationPanel.tsx`
- `src/components/tools/SearchInput.tsx`
- `src/components/tools/TagFilter.tsx`
- `src/components/tools/ToolCard.tsx`
- `src/components/ui/Alert.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/FileUpload.tsx`
- `src/components/ui/NetworkErrorHandler.tsx`
- `src/components/ui/ProgressCard.tsx`
- `src/components/ui/ResultsPanel.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/ToolHeader.tsx`
- `src/components/ui/ToolInfoSection.tsx`
- `src/components/ui/ToolPageHero.tsx`
- `src/components/ui/ToolPageLayout.tsx`
- `src/components/ui/ToolPageTemplate.tsx`

(Other UI components were inspected but contain little or no user-facing text.)

### Next Steps

- **Task 1C – Extract Messages**: Create message keys for the above components and update them to use `useTranslations`.
