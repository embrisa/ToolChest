# New Ideas To Try Sometime

Status: Brainstorming. Privacy-first, client-side-only processing. Keep UX simple, fast, and accessible (WCAG 2.1 AA). Nothing here is a commitment — just a parking lot of ideas.

---

## Website

- Performance: Prefer React Server Components where possible; keep client bundles tiny.
- Performance: Set explicit performance budgets; fail CI if budgets are exceeded.
- Performance: Use route-level code-splitting; lazy-load heavy tool engines.
- Performance: Precompute/inline critical CSS; defer non-critical styles.
- Performance: Optimize fonts (subset, `display=swap`, variable font if possible).
- Performance: Preconnect to nothing by default (privacy); only local assets.
- Performance: Tune Next.js image usage; verify all images have `sizes` and `alt`.
- Performance: Avoid hydration for static content; prefer server components.
- Performance: Add `next/script` with `strategy="afterInteractive"` only when necessary.
- Performance: Add a lightweight bundle analyzer during `validate:build`.

- Accessibility: Add high-contrast theme option (remains AA in both modes).
- Accessibility: Add reduced motion mode; disable non-essential transitions.
- Accessibility: Ensure focus outlines are always visible and consistent.
- Accessibility: Add skip-to-content link and landmark roles on all pages.
- Accessibility: Improve tool result announcements with ARIA live regions.
- Accessibility: Confirm keyboard-only flows for every tool (tab order + shortcuts).

- Internationalization: Add RTL support (dir-aware components, logical properties).
- Internationalization: Validate pluralization and ICU messages in tests.
- Internationalization: Per-locale typography tweaks for CJK and long strings.
- Internationalization: Translation coverage dashboard tied to `qa:translations`.

- Navigation & Discovery: Global command palette (⌘K/CTRL+K) to jump to tools.
- Navigation & Discovery: Fuzzy local search across tools, tags, and descriptions.
- Navigation & Discovery: Recently used and pinned tools (stored locally).
- Navigation & Discovery: Tag pages with curated collections (e.g., Security, Images).

- SEO (privacy-safe): Generate sitemaps, structured data for tools, richer metadata.
- SEO (privacy-safe): Social cards per tool with light-weight, self-hosted images.

- PWA & Offline: Installable PWA; cache tool shells and documentation for offline use.
- PWA & Offline: Offline fallback page for tool docs; clarify privacy guarantees.
- PWA & Offline: Respect 10MB input cap even offline; show clear progress for 5MB+.

- Error States: Friendly error pages (404/500) with local-only diagnostics hints.
- Error States: Offer one-click “export debug report” (local text file) on crashes.

---

## Tools — New Candidates

- JSON <→ CSV converter (fast, streaming, preserves types when possible).
- JSON <→ YAML/TOML converter with schema validation (Zod-based samples).
- JSON/JS object pretty-printer and minifier with safe parser.
- JWT decoder/inspector (offline, no secret input, warns about alg none).
- UUID generator (v4, v7), ULID generator, with copy and batch modes.
- Regex tester with safe-timeout and quick library recipes (URL-safe flags).
- Text diff and folder diff (client-side, WASM-accelerated if feasible).
- Markdown previewer with extensions (tables, footnotes) and export to HTML.
- HTML <→ Markdown converter (tuneable sanitization and schema whitelist).
- Color utilities: contrast checker, palette generator, tints/shades, luminance.
- Image EXIF viewer/stripper (client-side; privacy-preserving by default strip).
- Image resize/compress (client-side, WebAssembly; clear quality sliders).
- PDF merge/split/extract images (client-side, best-effort size limits).
- QR code generator/decoder (drag-and-drop image to decode).
- Barcode generator (Code128, EAN) with SVG export.
- Password generator (memorable and random modes; entropy meter).
- Hash tool combo (SHA-256/512, BLAKE3) with incremental hashing for big files.
- Base58/Base62/Base85 encoders (beyond Base64) for specialized workflows.
- URL parser/builder with safe encode/decode and component editing.
- Date/time utilities: timezone convert, ISO formatting, unix epoch helpers.
- CSV cleaner: delimiter normalize, header sanitize, quote/escape fixer.
- Accessibility tools: heading order checker on pasted HTML; color-blind simulators.
- i18n helpers: extract keys, check duplicates, compare locale files.
- Frontmatter editor: parse/edit YAML/TOML frontmatter safely.
- Git ignore generator: recipes for common stacks; export `.gitignore`.

---

## Tools — Improvements to Existing

- Unified import/export: consistent drag-drop zones, paste-from-clipboard, file pickers.
- Copy UX: `Copy`, `Copy raw`, `Copy JSON`, and `Download` buttons standardized.
- URL-hash state: optional shareable, privacy-preserving state in `#` fragment.
- Tool chaining: “Open in…” actions to send current output into another tool.
- Presets: save/load named presets per tool (stored locally).
- Batch mode: process multiple inputs sequentially with a progress overview.
- Progress UI: show stepwise progress for 5MB+ files; graceful cancel.
- Workerization: heavy ops offloaded to Web Workers; keep UI responsive.
- WASM acceleration: selectively use BLAKE3/Imagemin/Sharp-like WASM builds when small.
- Schema-aware textareas: JSON lines mode; schema hints; sample data buttons.
- Favicon tool: generate multi-size, maskable icons + manifest.json preview.
- Hash tool: streaming mode and drag-in folders (walk + filter by type).
- Markdown → PDF: add templates, page numbers, TOC, and code block themes.
- Error boundaries: consistent per-tool error surfaces with recovery actions.
- Keyboard shortcuts: consistent across tools (copy, clear, download, focus input).
- Accessibility: live region for “result updated”; focus return after actions.
- Mobile UX: large tap targets; sticky action bar; virtual keyboard safe areas.
- File validation: clear errors on oversized/unsupported formats; sample files to try.

---

## User Experience

- Onboarding: quick spotlight of features (privacy, offline, local processing).
- Favorites: pin tools; reorder; show on home for fastest access.
- History: optional local history per tool with clear “wipe” controls.
- Command palette: navigate to tools, run actions, change language quickly.
- Empty states: provide sample inputs and one-click “try example”.
- Help mode: inline info icons toggle contextual docs without leaving the tool.
- Keyboard help: `?` opens shortcut cheatsheet for the current tool.
- Form UX: use `useId()` consistently; label + description + help text patterns.
- Visual consistency: align buttons, spacing, and section headers across tools.
- Reduced motion: subtle, purposeful animations only; disable on preference.
- Responsive: ensure polished layouts from 320px to ultra-wide.
- Error copy: plain language; suggests next steps; never blames the user.
- Privacy copy: clear explanation of client-side processing; no data leaves browser.
- Local preferences: theme, language, reduced motion, contrast, units (e.g., bytes).
- Accessibility testing: run `npm run test:a11y` per tool before release.

---

## Bug Maintenance & Quality

- Issue triage: severity (S0–S3), area tags (Tool:Hash, i18n, Accessibility, Perf).
- Templates: bug, feature, regression with reproduction steps and env summary.
- Local repro kit: “Export debug report” bundles tool state + redacted metadata.
- Repro sharing: import/export tool state JSON (never sent to server by default).
- Test coverage: `npm run test:coverage` badge in CI comments; target thresholds.
- E2E stability: Playwright retries + trace viewer; run per-locale smoke tests.
- Flake hunts: run e2e with `--repeat-each` nightly; auto-open issues on flakes.
- Accessibility gates: block on critical violations; track waivers with expiry.
- Translation QA: enforce `npm run qa:translations` in CI; detect missing/unused keys.
- Performance budgets: block merges that push key metrics (TTFB/CLS/LCP) regressions.
- Security hardening: strict CSP; no inline scripts; audit third-party WASM.
- Dependency policy: pin versions; automated PRs with changelog diff summary.
- Consistent error shapes: central error helpers for user-facing messages.
- Big file guardrails: explicit 10MB limit tests; progress logic unit-tested.
- Fixture library: curated sample files for images, JSON, CSV, and edge cases.

---

## Small, Medium, Large Candidates

- Small:
  - Add skip link and landmark roles to layout.
  - Standardize Copy/Clear/Download actions across tools.
  - Add command palette stub with tool search.
  - Expose “Try example” button for top 5 tools.
  - Enforce translation key lint and coverage metrics.

- Medium:
  - Implement favorites/recently-used with localStorage + UI.
  - Workerize heavy tools (hashing, image ops) with progress reporting.
  - Introduce URL-hash state sharing for selected tools.
  - Add high-contrast and reduced-motion modes.
  - Build curated tag pages (Security, Images, Text, Data).

- Large:
  - PWA offline support with selective caching and fallback screens.
  - Tool chaining (“Open in…”) with shared schema contracts between tools.
  - WASM acceleration for image and hashing pipelines (size-budgeted).
  - Visual diff tool with side-by-side and inline modes.

---

## Guardrails & Principles

- Privacy-first: no network calls for user data; all processing client-side.
- Local-first: shareable state via URL fragment only; never upload by default.
- Accessibility: AA conformance minimum; test and document deviations with waivers.
- Performance: fast by default; progressive enhancement; graceful degradation.
- Clarity: obvious affordances; consistent patterns; minimal configuration.
- Safety: validate inputs; clear limits; sensible defaults; reversible actions.

---

## Rough Implementation Notes (when/if we try these)

- Use Web Workers for CPU-heavy tasks; message passing with transferable objects.
- For URL-hash state, use compact encodings (e.g., LZ-based + base64url).
- For tool chaining, define a minimal schema contract per tool (Zod types in `@/types`).
- Centralize shared UI patterns in `@/components/ui` (drop zone, action bar, toasts).
- Keep tests focused: unit for logic in `@/utils`, component tests for UI states.
- Add a small “examples” library under `src/examples` for demos and tests.

---

If any item sounds promising, we can spin it out into a proper ticket with scope, acceptance criteria, and risk notes.

