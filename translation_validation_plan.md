Translation stability plan (“ground-zero” fix)

## Audit results (2025-06-12)

Legend  
✅ Implemented / functionally covered  
⚠️ Partially implemented  
❌ Missing / to-do

| Step | Area                                  | Status |
| ---- | ------------------------------------- | ------ |
| 1    | Reference locale & mirrored structure | ✅     |
| 2    | Canonical schemas in code             | ⚠️     |
| 3    | Automated validator                   | ✅     |
| 4    | One-time key sweep                    | ✅     |
| 5    | Align code with schema                | ✅     |
| 6    | Fallback locale                       | ❌     |
| 7    | CI integration                        | ⚠️     |
| 8    | Translator workflow helpers           | ⚠️     |
| 9    | Placeholder backfill                  | ⚠️     |

1. Pick one reference locale (English) **[Status: ✅]**
   • Treat every other language as a mirror of this "source of truth".  
   • Put every translation file that drives the UI into the workspace under the same relative path as its English twin.

2. Freeze a canonical JSON structure for every namespace **[Status: ✅]**
   ✔ Added schemas for public pages (home, tools, loading, error), shared common strings, and component namespaces (ui, forms, layout).  
   ✔ Added Zod schemas for: `pages.admin.analytics`, `pages.admin.loading`, `tools.base64.info`, `tools.hash-generator.info`, `tools.markdown-to-pdf.info`.  
   ➜ Added: schema validation into qa-translations and generate schemas automatically for future namespaces.

3. Create an automated validator (script) **[Status: ✅]**
   ✔ Schema validation via Zod integrated into `scripts/qa-translations.ts`.  
   ✔ Runs via `npm run qa:translations` using `tsx`.  
   • Parses JSON, validates against schema, diffs keys, checks untranslated or empty values, and exits non-zero on any violation.

4. Fill the currently breaking keys (one-time sweep) **[Status: ✅]**
   ✔ All locales now include `analytics.loading` under `pages/admin/*.json`.  
   ✔ `info.supportedAlgorithms` added to every `messages/tools/hash-generator/*`.  
   ✔ `info.features.items` list added to every `messages/tools/markdown-to-pdf/*`.  
   These additions were verified via automated grep checks across all locale files.

5. Align code with schema (future-proof) **[Status: ✅]**
   • Canonicalized loading messages under `pages.admin.loading` (e.g. `tLoading("analytics")`) and removed the duplicate `analytics.loading` key from all locale files and schemas.  
   • Phase A complete: every `useTranslations()` call now targets a concrete schema-backed namespace; hard-coded UI strings converted to translations where feasible.  
   • Phase B complete: Added `MessageKeys<T>` utility and `useTypedTranslations()` hook – components now get compile-time autocomplete / safety for their own namespace keys.

6. Provide automatic fall-backs (optional but useful) **[Status: ❌]**
   In `next-intl.config.ts` set `fallbackLocale: "en"` so missing strings never break production, but keep validator failing in CI.

7. CI integration **[Status: ⚠️]**
   • `npm run validate` now chains: `lint → test → qa:translations → qa:code`.  
   • Added `scripts/check-translation-keys.ts` to scan code for unknown translation keys (Phase C proto).  
   • Next: refine regex (filter out URLs, CSS, template literals) and wire job into GitHub Actions.

8. Ongoing workflow for translators **[Status: ⚠️]**
   • When engineers add a new key in English, they must also append an empty string (or the English text) to every locale file.  
   • `npm run qa:translations --fix` can optionally auto-insert missing keys with English placeholders.

9. Backfill existing files gradually **[Status: ⚠️]**
   Run the validator in "add placeholders" mode once to make sure every locale file is structurally complete. Hand the resulting diffs to translators.

If you follow steps 1-4 immediately, the current build stops failing; steps 5-9 make sure it never happens again.
