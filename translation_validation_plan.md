Translation stability plan (“ground-zero” fix)

## Audit results (2025-06-12)

Legend  
✅ Implemented / functionally covered  
⚠️ Partially implemented  
❌ Missing / to-do  

| Step | Area | Status |
| ---- | ----- | ------ |
| 1 | Reference locale & mirrored structure | ✅ |
| 2 | Canonical schemas in code | ❌ |
| 3 | Automated validator | ✅ / ⚠️ (no schema validation) |
| 4 | One-time key sweep | ❌ |
| 5 | Align code with schema | ❌ |
| 6 | Fallback locale | ❌ |
| 7 | CI integration | ⚠️ |
| 8 | Translator workflow helpers | ⚠️ |
| 9 | Placeholder backfill | ⚠️ |

1. Pick one reference locale (English)  **[Status: ✅]**
   • Treat every other language as a mirror of this "source of truth".  
   • Put every translation file that drives the UI into the workspace under the same relative path as its English twin.

2. Freeze a canonical JSON structure for every namespace  **[Status: ❌]**
   • pages.admin.analytics → `{ title, description, charts: { … }, loading }`  
   • pages.admin.loading      → `{ panel, dashboard, analytics }`  
   • tools.<tool>.info        → `{ title, description, <sections> }`  
   Write each structure as a TypeScript interface (or Zod schema) inside `src/types/i18n/*.ts`.  
   Example:  
   ```ts
   // src/types/i18n/pagesAdminAnalytics.ts
   export const PagesAdminAnalyticsSchema = z.object({
     title: z.string(),
     description: z.string(),
     charts: z.object({ usageOverTime: z.string(), topTools: z.string(), userMetrics: z.string() }),
     loading: z.string(),          // <- important missing field
   });
   ```

3. Create an automated validator (script)  **[Status: ✅ / ⚠️]**
   1. Scan `messages/**/{en}.json` to load the canonical object for each namespace.  
   2. Recursively walk the same path for every other locale.  
   3. For each namespace:  
      • parse JSON,  
      • validate with its schema,  
      • diff keys vs. the English file (flags: missing, extra, type-mismatch).  
   4. Summarise results and return non-zero exit code on any violation.  
   Put it in `scripts/validateTranslations.ts` and wire to `npm run qa:translations` (already exists).

4. Fill the currently breaking keys (one-time sweep)  **[Status: ❌]**
   • pages/admin/*/analytics.json → add `"loading": "Loading analytics..."` in every locale.  
   • messages/tools/hash-generator/* → under `info` add  
     ```
     "supportedAlgorithms": {
       "title": "Supported Algorithms",
       "items": [ "MD5", "SHA-1", "SHA-256", "SHA-512" ]
     }
     ```  
   • messages/tools/markdown-to-pdf/* → under `info` add  
     ```
     "features": {
       "items": [
         "Live preview", "Multiple templates", "GFM support",
         "Syntax highlighting", "Custom styling", "File upload",
         "Professional output", "Privacy-first"
       ]
     }
     ```  
   (Copy English strings first; translators can localise later.)

5. Align code with schema (future-proof)  **[Status: ❌]**
   • Wherever a component expects a key (e.g. `t("loading")` inside `pages.admin.analytics`), make sure the schema includes it.  
   • If a key lives in a different namespace today (e.g. `pages.admin.loading.analytics`) decide ONE canonical place and update the code OR move the key – never both.

6. Provide automatic fall-backs (optional but useful)  **[Status: ❌]**
   In `next-intl.config.ts` set `fallbackLocale: "en"` so missing strings never break production, but keep validator failing in CI.

7. CI integration  **[Status: ⚠️]**
   Add the validator to `npm run validate` and to your GitHub/GitLab pipeline so nobody can merge PRs that introduce missing keys.

8. Ongoing workflow for translators  **[Status: ⚠️]**
   • When engineers add a new key in English, they must also append an empty string (or the English text) to every locale file.  
   • `npm run qa:translations --fix` can optionally auto-insert missing keys with English placeholders.

9. Backfill existing files gradually  **[Status: ⚠️]**
   Run the validator in "add placeholders" mode once to make sure every locale file is structurally complete. Hand the resulting diffs to translators.

If you follow steps 1-4 immediately, the current build stops failing; steps 5-9 make sure it never happens again.