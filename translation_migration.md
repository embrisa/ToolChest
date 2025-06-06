# Migration Plan: Adopt next-intl Across the Codebase

The project already uses `next-intl` for layout and a few components. The goal is to replace all remaining hard‑coded strings with translations and standardize how translations are loaded. Below is a breakdown of tasks that can be worked on in parallel by separate AI agents.

## 1. Audit Existing Strings ✅ COMPLETED

- **Task 1A – Audit Pages ✅**
  - ✅ Identified all pages in `src/app` that contain hard-coded English text
  - ✅ Documented components and sections needing translation keys
  - ✅ Created comprehensive translation coverage plan

### Pages Translation Status ✅ ALL CORE PAGES COMPLETED

- ✅ `src/app/page.tsx` – **INTEGRATED** with `pages.home` translations (hero, stats, search, filtering)
- ✅ `src/app/not-found.tsx` – **INTEGRATED** with `pages.error.notFound` translations (complete 404 content)
- ✅ `src/app/error.tsx` – **INTEGRATED** with `pages.error.serverError` translations (error handling)
- ✅ `src/app/loading.tsx` – **INTEGRATED** with `pages.loading.page` translations (loading states)
- ✅ `src/app/tools/page.tsx` – **INTEGRATED** with `pages.tools` translations (hero, headings, stats)
- 🔧 `src/app/layout.tsx` – metadata titles/descriptions (handled via tool-specific metadata)
- 🔧 `src/app/debug/page.tsx` – debug page (low priority, development only)
- 🔧 `src/app/tools/loading.tsx` – loading message (inherits from main loading)
- 🔧 Tool-specific pages (`base64/page.tsx`, etc.) – need to integrate with existing translation files
- 🔧 `src/app/admin` directory pages – need to integrate with existing `pages.admin` translations:
  - Dashboard, analytics, auth, monitoring, tools management, tags management, relationships

- **Task 1B – Audit Components ✅**
  - ✅ Inspected all files in `src/components` for hard-coded strings
  - ✅ Documented components requiring translation support
  - ✅ Prioritized by user impact and complexity

### Components Translation Status 

**✅ FULLY INTEGRATED:**
- Layout components (Header, Footer, Navigation) - Using `components.layout` translations
- `src/components/tools/ToolCard.tsx` - Basic integration completed

**🔧 INTEGRATION NEEDED (Translation files exist, components need updating):**

**High Priority Tool Components:**
- 🔧 `src/components/tools/Base64Tool.tsx` - **MANY HARD-CODED STRINGS** to replace:
  - UI feedback: "Starting {mode} operation" → `t('ui.status.processing')`
  - Mode labels: "Encode", "Decode" → `t('ui.modes.encode/decode')`
  - Variants: "Standard", "URL-Safe" → `t('tools.base64.variants.standard/urlSafe')`
  - Status: "Processing...", "Copied!", "Download" → `t('ui.status.*')`
- 🔧 `src/components/tools/HashGeneratorTool.tsx` - Replace hard-coded UI strings
- 🔧 `src/components/tools/FaviconGeneratorTool.tsx` - Replace tool-specific strings
- 🔧 `src/components/tools/MarkdownToPdfTool.tsx` - Replace customization options text
- 🔧 `src/components/tools/PdfCustomizationPanel.tsx` - Replace theme names, size options

**Medium Priority Admin Components:**
- 🔧 `src/components/admin/AnalyticsDashboard.tsx` - Replace chart titles, metric labels
- 🔧 `src/components/admin/ToolForm.tsx` - Replace form labels: "Tool Name *" → `t('labels.name')`
- 🔧 `src/components/admin/TagForm.tsx` - Replace tag form interface strings
- 🔧 `src/components/admin/ToolTable.tsx` - Replace column headers, action buttons
- 🔧 `src/components/admin/TagTable.tsx` - Replace table structure strings
- 🔧 `src/components/admin/BulkOperations.tsx` - Replace bulk action labels

**Lower Priority Error/UI Components:**
- 🔧 `src/components/errors/ErrorBoundary.tsx` - Replace error boundary messages
- 🔧 `src/components/errors/ErrorPage.tsx` - Replace generic error content
- 🔧 `src/components/tools/SearchInput.tsx` - Replace search placeholders
- 🔧 `src/components/tools/TagFilter.tsx` - Replace filter labels
- 🔧 `src/components/ui/FileUpload.tsx` - Replace upload messages
- 🔧 `src/components/ui/Toast.tsx` - Replace notification messages
- 🔧 `src/components/ui/ProgressCard.tsx` - Replace progress status messages

**✅ ALREADY HANDLED:**
- `src/components/layout/Header.tsx` - Uses `components.layout` translations
- `src/components/layout/Footer.tsx` - Uses `components.layout` translations  
- Most UI components contain minimal user-facing text and are lower priority

**💡 IMPLEMENTATION STRATEGY:**
1. **Start with Base64Tool** as template - Most complex tool component, shows all integration patterns
2. **Extend pattern to other tools** - HashGenerator, FaviconGenerator, MarkdownToPdf  
3. **Admin components next** - Use existing `pages.admin` and `components.forms` translations
4. **UI/Error components last** - Lower user impact, simpler integration

**🔧 INTEGRATION PATTERN EXAMPLE:**
```tsx
// BEFORE (hard-coded):
<Button>Encode</Button>

// AFTER (translated):
import { useTranslations } from 'next-intl';
const t = useTranslations('tools.common.ui');
<Button>{t('modes.encode')}</Button>
```

## 2. Prepare Translation Files

### 2.1 Foundation Tasks

- **Task 2A – Define Message Structure**

  - Establish a consistent key hierarchy following the pattern: `Page.{PageName}.{section}.{element}`
  - Define component key structure: `Components.{ComponentName}.{element}`
  - Create shared keys structure: `Common.{category}.{element}` for reusable strings
  - Document naming conventions and best practices for translation keys
  - Create template structure for new message files

- **Task 2B – Create Master English Messages**
  - Audit and extract ALL hard-coded strings from pages identified in Phase 1
  - Audit and extract ALL hard-coded strings from components identified in Phase 1
  - Organize extracted strings into the defined key hierarchy
  - Create comprehensive `messages/en.json` with all identified strings
  - Include metadata comments for context where translations might be ambiguous
  - Validate that all keys follow the established naming conventions

### 2.2 Language-Specific Translation Tasks

Each language task should be tackled independently and includes:

1. Creating four language-specific message files (core, database, tool common, tool-specific)
2. Translating all keys from the master English files
3. Ensuring cultural and technical appropriateness for developer audience
4. Validating JSON syntax and key completeness across all files
5. **Tag-focused translations**: Translating tag names for tool organization (no categories)

- **Task 2C – English (en) - Base Language ✅ COMPLETED**

  - **All 12 Modular Files Complete**: 
    - `messages/common/en.json` ✅ **COMPLETE** (actions, status, validation, privacy)
    - `messages/pages/home/en.json` ✅ **COMPLETE** (hero, stats, search, filtering)
    - `messages/pages/tools/en.json` ✅ **COMPLETE** (tools listing page)
    - `messages/pages/error/en.json` ✅ **COMPLETE** (404, 500, error boundaries)
    - `messages/pages/admin/en.json` ✅ **COMPLETE** (admin dashboard, management)
    - `messages/pages/loading/en.json` ✅ **COMPLETE** (loading states)
    - `messages/components/layout/en.json` ✅ **COMPLETE** (header, footer, navigation)
    - `messages/components/forms/en.json` ✅ **COMPLETE** (form components, validation)
    - `messages/components/ui/en.json` ✅ **COMPLETE** (buttons, alerts, modals, tooltips)
    - `messages/database/en.json` ✅ **COMPLETE** (tool & tag names)
    - `messages/tools/common/en.json` ✅ **COMPLETE** (shared tool patterns)
    - `messages/tools/{tool}/en.json` ✅ **COMPLETE** (base64, hash-generator, favicon-generator, markdown-to-pdf)
  - Status: ✅ **ALL ENGLISH TRANSLATION FILES EXIST AND ARE READY TO USE**
  - Infrastructure: ✅ Modular loading system implemented in `src/i18n/request.ts`

- **Task 2D – Spanish (es)**

  - **Create 12 Spanish Translation Files**: 
    - `messages/common/es.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/es.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/es.json` (tools listing page)
    - `messages/pages/error/es.json` (404, 500, error boundaries)
    - `messages/pages/admin/es.json` (admin dashboard, management)
    - `messages/pages/loading/es.json` (loading states)
    - `messages/components/layout/es.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/es.json` (form components, validation)
    - `messages/components/ui/es.json` (buttons, alerts, modals, tooltips)
    - `messages/database/es.json` (tool & tag names)
    - `messages/tools/common/es.json` (shared tool patterns)
    - `messages/tools/{tool}/es.json` (per tool, as needed)
  - Target community: Spanish-speaking developers worldwide
  - Focus on technical terminology appropriate for software development
  - Translate tag names for tool organization (codificación, generación, seguridad, etc.)

- **Task 2E – Chinese Simplified (zh)**

  - ***Create 12 Chinese Translation Files**:
    - `messages/common/zh.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/zh.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/zh.json` (tools listing page)
    - `messages/pages/error/zh.json` (404, 500, error boundaries)
    - `messages/pages/admin/zh.json` (admin dashboard, management)
    - `messages/pages/loading/zh.json` (loading states)
    - `messages/components/layout/zh.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/zh.json` (form components, validation)
    - `messages/components/ui/zh.json` (buttons, alerts, modals, tooltips)
    - `messages/database/zh.json` (tool & tag names)
    - `messages/tools/common/zh.json` (shared tool patterns)
    - `messages/tools/{tool}/zh.json` (per tool, as needed)
  - Target community: Chinese developers and tech workers
  - Ensure proper technical terminology translation
  - Translate tag names for tool organization (编码, 生成, 安全, etc.)

- **Task 2F – Hindi (hi)**

  - **Create 12 Hindi Translation Files**:
    - `messages/common/hi.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/hi.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/hi.json` (tools listing page)
    - `messages/pages/error/hi.json` (404, 500, error boundaries)
    - `messages/pages/admin/hi.json` (admin dashboard, management)
    - `messages/pages/loading/hi.json` (loading states)
    - `messages/components/layout/hi.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/hi.json` (form components, validation)
    - `messages/components/ui/hi.json` (buttons, alerts, modals, tooltips)
    - `messages/database/hi.json` (tool & tag names)
    - `messages/tools/common/hi.json` (shared tool patterns)
    - `messages/tools/{tool}/hi.json` (per tool, as needed)
  - Target community: Indian developer community
  - Balance between Hindi terms and commonly used English technical terms
  - Translate tag names for tool organization, keeping technical clarity

- **Task 2G – Portuguese (pt)**

  - **Create 12 Portuguese Translation Files**:
    - `messages/common/pt.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/pt.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/pt.json` (tools listing page)
    - `messages/pages/error/pt.json` (404, 500, error boundaries)
    - `messages/pages/admin/pt.json` (admin dashboard, management)
    - `messages/pages/loading/pt.json` (loading states)
    - `messages/components/layout/pt.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/pt.json` (form components, validation)
    - `messages/components/ui/pt.json` (buttons, alerts, modals, tooltips)
    - `messages/database/pt.json` (tool & tag names)
    - `messages/tools/common/pt.json` (shared tool patterns)
    - `messages/tools/{tool}/pt.json` (per tool, as needed)
  - Target community: Brazilian and Portuguese developers
  - Consider Brazilian Portuguese as primary variant
  - Translate tag names for tool organization (codificação, geração, segurança, etc.)

- **Task 2H – Russian (ru)**

  **Create 12 Russian Translation Files**:
    - `messages/common/ru.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/ru.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/ru.json` (tools listing page)
    - `messages/pages/error/ru.json` (404, 500, error boundaries)
    - `messages/pages/admin/ru.json` (admin dashboard, management)
    - `messages/pages/loading/ru.json` (loading states)
    - `messages/components/layout/ru.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/ru.json` (form components, validation)
    - `messages/components/ui/ru.json` (buttons, alerts, modals, tooltips)
    - `messages/database/ru.json` (tool & tag names)
    - `messages/tools/common/ru.json` (shared tool patterns)
    - `messages/tools/{tool}/ru.json` (per tool, as needed)
  - Target community: Russian-speaking developers in Eastern Europe
  - Maintain technical accuracy for development tools
  - Translate tag names for tool organization (кодирование, генерация, безопасность, etc.)

- **Task 2I – Japanese (ja)**

  **Create 12 Japanese Translation Files**:
    - `messages/common/ja.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/ja.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/ja.json` (tools listing page)
    - `messages/pages/error/ja.json` (404, 500, error boundaries)
    - `messages/pages/admin/ja.json` (admin dashboard, management)
    - `messages/pages/loading/ja.json` (loading states)
    - `messages/components/layout/ja.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/ja.json` (form components, validation)
    - `messages/components/ui/ja.json` (buttons, alerts, modals, tooltips)
    - `messages/database/ja.json` (tool & tag names)
    - `messages/tools/common/ja.json` (shared tool patterns)
    - `messages/tools/{tool}/ja.json` (per tool, as needed)
  - Target community: Japanese developer community
  - Ensure appropriate politeness levels and technical terminology
  - Translate tag names for tool organization (エンコーディング, 生成, セキュリティ, etc.)

- **Task 2J – German (de)**

  **Create 12 German Translation Files**:
    - `messages/common/de.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/de.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/de.json` (tools listing page)
    - `messages/pages/error/de.json` (404, 500, error boundaries)
    - `messages/pages/admin/de.json` (admin dashboard, management)
    - `messages/pages/loading/de.json` (loading states)
    - `messages/components/layout/de.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/de.json` (form components, validation)
    - `messages/components/ui/de.json` (buttons, alerts, modals, tooltips)
    - `messages/database/de.json` (tool & tag names)
    - `messages/tools/common/de.json` (shared tool patterns)
    - `messages/tools/{tool}/de.json` (per tool, as needed)
  - Target community: German-speaking developers in Europe
  - Focus on precise technical terminology
  - Translate tag names for tool organization (Kodierung, Generierung, Sicherheit, etc.)

- **Task 2K – French (fr)**

  **Create 12 French Translation Files**:
    - `messages/common/fr.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/fr.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/fr.json` (tools listing page)
    - `messages/pages/error/fr.json` (404, 500, error boundaries)
    - `messages/pages/admin/fr.json` (admin dashboard, management)
    - `messages/pages/loading/fr.json` (loading states)
    - `messages/components/layout/fr.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/fr.json` (form components, validation)
    - `messages/components/ui/fr.json` (buttons, alerts, modals, tooltips)
    - `messages/database/fr.json` (tool & tag names)
    - `messages/tools/common/fr.json` (shared tool patterns)
    - `messages/tools/{tool}/fr.json` (per tool, as needed)
  - Target community: French-speaking developers worldwide
  - Balance between French technical terms and accepted English terms
  - Translate tag names for tool organization (encodage, génération, sécurité, etc.)

- **Task 2L – Korean (ko)**

  **Create 12 Korean Translation Files**:
    - `messages/common/ko.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/ko.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/ko.json` (tools listing page)
    - `messages/pages/error/ko.json` (404, 500, error boundaries)
    - `messages/pages/admin/ko.json` (admin dashboard, management)
    - `messages/pages/loading/ko.json` (loading states)
    - `messages/components/layout/ko.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/ko.json` (form components, validation)
    - `messages/components/ui/ko.json` (buttons, alerts, modals, tooltips)
    - `messages/database/ko.json` (tool & tag names)
    - `messages/tools/common/ko.json` (shared tool patterns)
    - `messages/tools/{tool}/ko.json` (per tool, as needed)
  - Target community: South Korean developer community
  - Ensure appropriate formality levels and technical accuracy
  - Translate tag names for tool organization (인코딩, 생성, 보안, etc.)

- **Task 2M – Italian (it) ✅**

  **Create 12 Italian Translation Files**:
    - `messages/common/it.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/it.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/it.json` (tools listing page)
    - `messages/pages/error/it.json` (404, 500, error boundaries)
    - `messages/pages/admin/it.json` (admin dashboard, management)
    - `messages/pages/loading/it.json` (loading states)
    - `messages/components/layout/it.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/it.json` (form components, validation)
    - `messages/components/ui/it.json` (buttons, alerts, modals, tooltips)
    - `messages/database/it.json` (tool & tag names)
    - `messages/tools/common/it.json` (shared tool patterns)
    - `messages/tools/{tool}/it.json` (per tool, as needed)
  - Target community: Italian developer community
  - Maintain clarity in technical documentation terms
  - Translate tag names for tool organization (codifica, generazione, sicurezza, etc.)

- **Task 2N – Turkish (tr)**

  **Create 12 Turkish Translation Files**:
    - `messages/common/tr.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/tr.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/tr.json` (tools listing page)
    - `messages/pages/error/tr.json` (404, 500, error boundaries)
    - `messages/pages/admin/tr.json` (admin dashboard, management)
    - `messages/pages/loading/tr.json` (loading states)
    - `messages/components/layout/tr.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/tr.json` (form components, validation)
    - `messages/components/ui/tr.json` (buttons, alerts, modals, tooltips)
    - `messages/database/tr.json` (tool & tag names)
    - `messages/tools/common/tr.json` (shared tool patterns)
    - `messages/tools/{tool}/tr.json` (per tool, as needed)
  - Target community: Turkish developer community
  - Balance between Turkish translations and accepted English technical terms
  - Translate tag names for tool organization (kodlama, üretim, güvenlik, etc.)

- **Task 2O – Polish (pl)**

  **Create 12 Polish Translation Files**:
    - `messages/common/pl.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/pl.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/pl.json` (tools listing page)
    - `messages/pages/error/pl.json` (404, 500, error boundaries)
    - `messages/pages/admin/pl.json` (admin dashboard, management)
    - `messages/pages/loading/pl.json` (loading states)
    - `messages/components/layout/pl.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/pl.json` (form components, validation)
    - `messages/components/ui/pl.json` (buttons, alerts, modals, tooltips)
    - `messages/database/pl.json` (tool & tag names)
    - `messages/tools/common/pl.json` (shared tool patterns)
    - `messages/tools/{tool}/pl.json` (per tool, as needed)
  - Target community: Polish developer community
  - Ensure technical accuracy for development tools and concepts
  - Translate tag names for tool organization (kodowanie, generowanie, bezpieczeństwo, etc.)

- **Task 2P – Dutch (nl)**

  **Create 12 Dutch Translation Files**:
    - `messages/common/nl.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/nl.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/nl.json` (tools listing page)
    - `messages/pages/error/nl.json` (404, 500, error boundaries)
    - `messages/pages/admin/nl.json` (admin dashboard, management)
    - `messages/pages/loading/nl.json` (loading states)
    - `messages/components/layout/nl.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/nl.json` (form components, validation)
    - `messages/components/ui/nl.json` (buttons, alerts, modals, tooltips)
    - `messages/database/nl.json` (tool & tag names)
    - `messages/tools/common/nl.json` (shared tool patterns)
    - `messages/tools/{tool}/nl.json` (per tool, as needed)
  - Target community: Dutch and Belgian developers
  - Maintain technical precision while being accessible
  - Translate tag names for tool organization (codering, generatie, beveiliging, etc.)

- **Task 2Q – Vietnamese (vi)**

  **Create 12 Vietnamese Translation Files**:
    - `messages/common/vi.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/vi.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/vi.json` (tools listing page)
    - `messages/pages/error/vi.json` (404, 500, error boundaries)
    - `messages/pages/admin/vi.json` (admin dashboard, management)
    - `messages/pages/loading/vi.json` (loading states)
    - `messages/components/layout/vi.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/vi.json` (form components, validation)
    - `messages/components/ui/vi.json` (buttons, alerts, modals, tooltips)
    - `messages/database/vi.json` (tool & tag names)
    - `messages/tools/common/vi.json` (shared tool patterns)
    - `messages/tools/{tool}/vi.json` (per tool, as needed)
  - Target community: Vietnamese developer community
  - Focus on clarity and technical accuracy
  - Translate tag names for tool organization (mã hóa, tạo, bảo mật, etc.)

- **Task 2R – Ukrainian (uk)**

  **Create 12 Ukrainian Translation Files**:
    - `messages/common/uk.json` (shared strings: actions, status, validation, privacy)
    - `messages/pages/home/uk.json` (home page: hero, stats, search, filtering)
    - `messages/pages/tools/uk.json` (tools listing page)
    - `messages/pages/error/uk.json` (404, 500, error boundaries)
    - `messages/pages/admin/uk.json` (admin dashboard, management)
    - `messages/pages/loading/uk.json` (loading states)
    - `messages/components/layout/uk.json` (header, footer, navigation, locale switcher)
    - `messages/components/forms/uk.json` (form components, validation)
    - `messages/components/ui/uk.json` (buttons, alerts, modals, tooltips)
    - `messages/database/uk.json` (tool & tag names)
    - `messages/tools/common/uk.json` (shared tool patterns)
    - `messages/tools/{tool}/uk.json` (per tool, as needed)
  - Target community: Ukrainian developer community
  - Ensure technical terminology is appropriate and current
  - Translate tag names for tool organization (кодування, генерація, безпека, etc.)

### 2.3 Quality Assurance Tasks

- **Task 2S – Cross-Language Validation**

  - Verify all language files contain the same set of keys
  - Check for missing translations or untranslated strings
  - Validate JSON syntax across all language files
  - Ensure consistent formatting and structure

- **Task 2T – Context Documentation**
  - Add inline comments for complex or ambiguous translations
  - Document cultural considerations for each language
  - Create translation guidelines for future contributors
  - Document common technical terms and their approved translations per language

### Progress Status (Updated: Latest)

**Phase 1 - Foundation ✅ COMPLETED**
- **Task 2A ✅**: Message keys follow the `Page.*` and `Components.*` hierarchy.
- **Task 2B ✅**: Master English messages created with modular tool architecture.
- **Task 2C ✅**: Database translation key system designed and documented.
- **Modular Architecture ✅**: Implemented scalable tool translation architecture.
- **Database Migration ✅**: Created tag-only database schema with translation keys.

**Phase 2 - Translation Files ✅ COMPLETED**
- **Task 2C - English Base Language ✅**: All 12 modular files created and populated
  - `messages/common/en.json` ✅ 
  - `messages/pages/home/en.json` ✅ 
  - `messages/pages/tools/en.json` ✅ **NEWLY COMPLETED**
  - `messages/pages/error/en.json` ✅ 
  - `messages/pages/admin/en.json` ✅ **NEWLY COMPLETED**
  - `messages/pages/loading/en.json` ✅ 
  - `messages/components/layout/en.json` ✅ 
  - `messages/components/forms/en.json` ✅ **NEWLY COMPLETED**
  - `messages/components/ui/en.json` ✅ 
  - `messages/database/en.json` ✅ 
  - `messages/tools/common/en.json` ✅
  - `messages/tools/{tool}/en.json` ✅ (base64, hash-generator, favicon-generator, markdown-to-pdf)

**Task 2M - Italian Language Files ✅**
  - `messages/common/it.json` ✅
  - `messages/pages/home/it.json` ✅
  - `messages/pages/tools/it.json` ✅
  - `messages/pages/error/it.json` ✅
  - `messages/pages/admin/it.json` ✅
  - `messages/pages/loading/it.json` ✅
  - `messages/components/layout/it.json` ✅
  - `messages/components/forms/it.json` ✅
  - `messages/components/ui/it.json` ✅
  - `messages/database/it.json` ✅
  - `messages/tools/common/it.json` ✅
  - `messages/tools/{tool}/it.json` ✅ (base64, hash-generator, favicon-generator, markdown-to-pdf)

**Phase 3 - Integration ⚠️ PARTIALLY COMPLETED**
- **Core Pages ✅**: All main pages now use translations
  - `src/app/page.tsx` ✅ **UPDATED** - Uses `pages.home` translations
  - `src/app/not-found.tsx` ✅ **COMPLETED** - Uses `pages.error.notFound` translations  
  - `src/app/error.tsx` ✅ **COMPLETED** - Uses `pages.error.serverError` translations
  - `src/app/loading.tsx` ✅ **COMPLETED** - Uses `pages.loading.page` translations
  - `src/app/tools/page.tsx` ✅ **COMPLETED** - Uses `pages.tools` translations

- **Infrastructure ✅**: 
  - `src/i18n/request.ts` ✅ **UPDATED** - Now loads modular translation structure
  - Modular loading utilities ✅ **ENHANCED**

- **Components 🔄 IN PROGRESS**:
  - `src/components/tools/ToolCard.tsx` ✅ **UPDATED** - Basic translation integration
  - Tool components (Base64Tool, etc.) ⏳ **PENDING** - Have many hard-coded strings
  - Admin components ⏳ **PENDING** - Translation files ready, integration needed

### 2.4 Enhanced Modular Translation Architecture

To handle hundreds of future tools efficiently and improve maintainability, we've implemented an enhanced modular translation system with **common module + page-specific modules**:

**Structure:**

```
messages/
├── common/
│   ├── en.json                 # Shared strings across entire app
│   └── es.json, zh.json...     # Translated common strings
├── pages/
│   ├── home/
│   │   ├── en.json             # Home page specific
│   │   └── es.json, zh.json... # Translated home page
│   ├── tools/
│   │   ├── en.json             # Tools listing page
│   │   └── es.json, zh.json... # Translated tools page
│   ├── error/
│   │   ├── en.json             # Error pages (404, 500, etc.)
│   │   └── es.json, zh.json... # Translated error pages
│   ├── admin/
│   │   ├── en.json             # Admin pages
│   │   └── es.json, zh.json... # Translated admin pages
│   └── loading/
│       ├── en.json             # Loading states
│       └── es.json, zh.json... # Translated loading states
├── components/
│   ├── layout/
│   │   ├── en.json             # Header, Footer, Navigation
│   │   └── es.json, zh.json... # Translated layout components
│   ├── forms/
│   │   ├── en.json             # Form components
│   │   └── es.json, zh.json... # Translated form components
│   └── ui/
│       ├── en.json             # UI components (buttons, alerts, etc.)
│       └── es.json, zh.json... # Translated UI components
├── database/
│   ├── en.json                 # Database entities (tools, tags)
│   └── es.json, zh.json...     # Translated database entities
└── tools/
    ├── common/
    │   ├── en.json             # Shared tool UI patterns
    │   └── es.json, zh.json... # Translated tool patterns
    ├── base64/
    │   ├── en.json             # Base64-specific content
    │   └── es.json, zh.json... # Translated Base64 content
    └── {tool}/
        ├── en.json             # Tool-specific content
        └── es.json, zh.json... # Translated tool content
```

**Benefits:**

- **✅ Better Organization**: Clear ownership - each page/component has its own translation space
- **✅ Parallel Development**: Different teams can work on different pages simultaneously
- **✅ Performance Optimization**: Can implement lazy loading per module
- **✅ Scalable Architecture**: Easy to add new pages without affecting existing ones
- **✅ Maintainability**: Easier to audit and update specific pages

**Module Responsibilities:**

1. **Common Module** (`messages/common/`): Actions, status messages, validation, privacy strings
2. **Page Modules** (`messages/pages/`): Page-specific content (home, tools, error, admin, loading)
3. **Component Modules** (`messages/components/`): Layout, forms, UI components
4. **Database Module** (`messages/database/`): Tool names, tag names, descriptions
5. **Tool Modules** (`messages/tools/`): Common patterns + tool-specific content

**Implementation:**

- Created `src/utils/i18n/modularTranslations.ts` utility for loading/merging modular translations
- Created `src/services/core/databaseTranslationService.ts` for database entity translation
- Pages use `getPageTranslations(locale, page)` to get merged translations for their scope
- Tool pages use `getToolTranslations(locale, toolSlug)` to get tool-specific translations
- Database entities use translation keys: `tools.{toolKey}.name`, `tags.{tagKey}.name`
- **Tag-only organization**: Tools are categorized exclusively through tags (no categories)

**Next Step**: Execute individual language tasks (2D-2R) with enhanced modular scope.

### 2.5 Database Translation Key Migration

**Critical Issue Identified**: The current database schema stores hardcoded English text in `Tool.name`, `Tool.description`, `Tag.name`, and `Tag.description` fields, which prevents internationalization.

**Solution**: Migrate to translation key-based system that integrates with our modular translations.

**Benefits:**

- **Language-agnostic database**: Store translation keys instead of text
- **Seamless integration**: Works with existing modular tool translation system
- **Scalable**: Add new languages without schema changes
- **Maintainable**: All translations in version-controlled files

**Implementation:**

- Created `messages/database/en.json` for database entity translations
- Created `DatabaseTranslationService` for resolving translation keys
- Detailed migration guide in `docs/database-translation-migration.md`

**Impact on Language Tasks (2D-2R):**
Each language task now includes **enhanced modular translation files**:

1. **Common**: `messages/common/{lang}.json` - Shared strings across entire app
2. **Page modules**: `messages/pages/{page}/{lang}.json` - Page-specific content (5 pages)  
3. **Component modules**: `messages/components/{type}/{lang}.json` - Component-specific strings (3 types)
4. **Database entities**: `messages/database/{lang}.json` - Tool names, tag names, descriptions
5. **Tool common patterns**: `messages/tools/common/{lang}.json` - Shared UI patterns across tools
6. **Tool-specific content**: `messages/tools/{tool}/{lang}.json` - Individual tool metadata and features

**Total files per language**: ~12-15 files (vs previous 4 files)

**Database Entity Translation Scope:**
- Tool names and descriptions for all existing tools
- Tag names and descriptions (encoding, generation, security, web, etc.)
- **Tag-only system**: No categories to translate (tools organized by tags only)
- Translation keys follow pattern: `tools.{toolKey}.name`, `tags.{tagKey}.name`

## 3. Refactor Pages ✅ COMPLETED

- **Task 3A – Home and Tools Pages ✅**
  - ✅ `src/app/page.tsx` - Updated to use `pages.home` translations with `useTranslations`
  - ✅ `src/app/tools/page.tsx` - Updated to use `pages.tools` translations with `useTranslations`
- **Task 3B – Error, 404 and Other Utility Pages ✅**
  - ✅ `src/app/error.tsx` - Updated to use `pages.error.serverError` translations
  - ✅ `src/app/not-found.tsx` - Updated to use `pages.error.notFound` translations  
  - ✅ `src/app/loading.tsx` - Updated to use `pages.loading.page` translations (server component)

## 4. Refactor Shared Components ⚠️ PARTIALLY COMPLETED

- **Task 4A – Layout Elements ✅**
  - ✅ Header, footer and navigation components already use `components.layout` translations
- **Task 4B – Tool Components 🔄 IN PROGRESS**
  - ✅ `src/components/tools/ToolCard.tsx` - Basic translation integration added
  - ⏳ `src/components/tools/Base64Tool.tsx` - **PENDING** - Contains many hard-coded strings:
    - "Starting {mode} operation", "Operation completed successfully", "File validation failed"
    - Mode labels: "Encode", "Decode", "Standard", "URL-Safe"  
    - Status messages: "Processing...", "Copied to clipboard", "Download complete"
  - ⏳ `src/components/tools/HashGeneratorTool.tsx` - **PENDING** - Similar hard-coded strings
  - ⏳ `src/components/tools/FaviconGeneratorTool.tsx` - **PENDING** - Tool-specific UI strings
  - ⏳ `src/components/tools/MarkdownToPdfTool.tsx` - **PENDING** - Customization panel strings

## 5. Refactor Admin Section 🔄 PARTIALLY COMPLETED

- **Task 5A – Admin Pages ⏳ TRANSLATION FILES READY**
  - ✅ Translation files created: `messages/pages/admin/en.json` with comprehensive coverage
  - ⏳ **PENDING**: Update `src/app/admin/dashboard/page.tsx` and other admin pages to use translations
  - ⏳ **PENDING**: Apply `next-intl` to all pages under `src/app/admin/`
- **Task 5B – Admin Components ⏳ TRANSLATION FILES READY**  
  - ✅ Translation files created: `messages/components/forms/en.json` with form validation/labels
  - ⏳ **PENDING**: Update admin dashboard and management components
  - ⏳ **PENDING**: Migrate forms and tables to use `components.forms` translations

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

## 8. Cleanup ✅ COMPLETED

- ✅ Updated i18n infrastructure to use modular translation loading
- ✅ Enhanced `src/i18n/request.ts` to properly load all translation modules  
- ✅ Removed dependency on legacy single-file translation structure
- ⚠️ **NOTE**: Validation and tests should be run after remaining component integration

---

## Implementation Notes & Discoveries

### Critical Infrastructure Changes Made:

1. **Modular Translation Loading ✅**: Updated `src/i18n/request.ts` to load translations from the modular structure instead of single files:
   ```typescript
   // OLD: messages/${locale}.json  
   // NEW: messages/{module}/${locale}.json with nested structure
   ```

2. **Translation Key Structure Standardized ✅**: All pages now follow consistent patterns:
   - Pages: `useTranslations("pages.{pageName}")`  
   - Components: `useTranslations("components.{componentType}")`
   - Tools: `useTranslations("tools.{toolSlug}")` or `useTranslations("tools.common")`

3. **Server vs Client Components ✅**: Properly differentiated:
   - Server components: `getTranslations()` (e.g., `loading.tsx`)
   - Client components: `useTranslations()` (e.g., `page.tsx`, `not-found.tsx`)

### Translation File Coverage Status:

**✅ COMPLETE (12/12 modules)**:
- All English translation files created and populated
- All core pages integrated with translations  
- Infrastructure updated to support modular loading

**⏳ REMAINING WORK**:
- **Tool Components Integration** (Medium Priority): Base64Tool, HashGeneratorTool, etc. contain numerous hard-coded UI strings
- **Admin Components Integration** (Lower Priority): Translation files ready, components need integration
- **Language Tasks 2D-2R** (Future): Ready to execute for 15 additional languages

### Key Implementation Insights:

1. **Error Page Structure**: Had to change suggestions from array to object for proper `t("suggestions.0")` access
2. **Mixed Translation Usage**: Some components need both common and specific translations (e.g., `useTranslations("common")` + `useTranslations("pages.home")`)
3. **Tool Components Complexity**: Individual tool components have extensive UI feedback strings that will require systematic translation  
4. **Performance**: Modular loading allows for better code-splitting and reduced bundle sizes

### Next Priority Actions:

1. **Tool Component Integration**: Focus on Base64Tool first as the template for other tools
2. **Admin Integration**: Update admin dashboard and management pages  
3. **Language Expansion**: Execute tasks 2D-2R for 15 additional languages
4. **Testing**: Ensure all translation integrations work correctly

Each numbered task group can be tackled independently, minimizing merge conflicts. The foundation is solid and ready for language expansion.
