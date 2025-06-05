# Migration Plan: Adopt next-intl Across the Codebase

The project already uses `next-intl` for layout and a few components. The goal is to replace all remaining hard‑coded strings with translations and standardize how translations are loaded. Below is a breakdown of tasks that can be worked on in parallel by separate AI agents.

## 1. Audit Existing Strings

- **Task 1A – Audit Pages**
  - Identify all pages in `src/app` that contain hard-coded English text.
  - Document which components or sections need translation keys.

### Pages with Hard-coded English Text

- `src/app/page.tsx` – hero section (titles, slogans, search placeholder, stats labels), tools grid messages, loading/error text.
- `src/app/not-found.tsx` – entire 404 page content, suggestions, actions.
- `src/app/error.tsx` – error page strings including title, description, suggestions and action labels.
- `src/app/loading.tsx` – skeleton page text "Loading tools...".
- `src/app/layout.tsx` – metadata titles/descriptions.
- `src/app/debug/page.tsx` – debug page headings and labels.
- `src/app/tools` directory:
  - `layout.tsx` – metadata for "All Tools" page.
  - `page.tsx` – hero section, headings, stats labels, info section.
  - `loading.tsx` – loading message.
  - `base64/page.tsx` – metadata and content describing the tool and its features.
  - `hash-generator/page.tsx` – metadata, feature descriptions, privacy message, info sections.
  - `favicon-generator/page.tsx` – metadata, feature descriptions, privacy message, info sections.
  - `markdown-to-pdf/page.tsx` – metadata, feature/usage texts.
- `src/app/admin` directory pages contain numerous admin UI strings:
  - `layout.tsx` – navigation labels and logout/view site.
  - `dashboard/page.tsx` – stats titles, headers, quick actions.
  - `analytics/page.tsx` – dashboard headings and metric labels.
  - `auth/page.tsx` – admin login form labels and error messages.
  - `loading.tsx` – admin loading message.
  - `monitoring/page.tsx` – monitoring page headings.
  - `tools/page.tsx`, `tools/create/page.tsx`, `tools/[id]/edit/page.tsx` – tool management headings, buttons, table labels.
  - `tags/page.tsx`, `tags/create/page.tsx`, `tags/[id]/edit/page.tsx` – tag management headings, buttons, table labels.
  - `relationships/page.tsx`, `relationships/bulk/page.tsx`, `relationships/validation/page.tsx` – relationship management copy and button text.

- **Task 1B – Audit Components**
  - Inspect files in `src/components` (and subdirectories) for hard-coded strings.
  - List components requiring translation support.

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

## 2. Prepare Translation Files

- **Task 2A – Define Message Structure**
  - Establish a consistent key hierarchy (e.g., `Page.Home.title`, `Components.Header.tools`).
- **Task 2B – Populate English Messages**
  - Create or extend `messages/en.json` with keys from the audit.
- **Task 2C – Populate Spanish Messages**
  - Provide Spanish translations in `messages/es.json` for each key.

## 3. Refactor Pages

- **Task 3A – Home and Tools Pages**
  - Replace text in `src/app/page.tsx` and `src/app/tools` with `useTranslations`.
  - Import messages server‑side if needed using `getMessages`.
- **Task 3B – Error, 404 and Other Utility Pages**
  - Update `src/app/error.tsx`, `src/app/not-found.tsx`, and any additional pages.

## 4. Refactor Shared Components

- **Task 4A – Layout Elements**
  - Ensure header, footer and navigation components pull labels from translations.
- **Task 4B – Tool Components**
  - Update specific tool UIs (Base64, Hash Generator, etc.) to use messages.

## 5. Refactor Admin Section

- **Task 5A – Admin Pages**
  - Apply `next-intl` to all pages under `src/app/admin`.
- **Task 5B – Admin Components**
  - Migrate administrative dashboards and forms to use translations.

## 6. Update Tests

- **Task 6A – Unit and Integration Tests**
  - Adjust Jest tests to mock `next-intl` context where necessary.
- **Task 6B – E2E Tests**
  - Extend Playwright tests to verify that locale switching works across routes.

## 7. Documentation

- **Task 7A – Contributor Guide**
  - Document how to add new translation keys and languages.
- **Task 7B – Usage Examples**
  - Provide code snippets showing typical server and client usage of `next-intl`.

## 8. Cleanup

- Remove any legacy i18n utilities once all pages and components rely solely on `next-intl`.
- Verify `npm run validate` and all tests pass.

---

Each numbered task group can be tackled independently, minimizing merge conflicts. Agents should coordinate on translation key naming to keep files consistent.
