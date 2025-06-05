# Migration Plan: Adopt next-intl Across the Codebase

The project already uses `next-intl` for layout and a few components. The goal is to replace all remaining hard‑coded strings with translations and standardize how translations are loaded. Below is a breakdown of tasks that can be worked on in parallel by separate AI agents.

## 1. Audit Existing Strings

- **Task 1A – Audit Pages**
  - Identify all pages in `src/app` that contain hard-coded English text.
  - Document which components or sections need translation keys.
- **Task 1B – Audit Components**
  - Inspect files in `src/components` (and subdirectories) for hard-coded strings.
  - List components requiring translation support.

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
