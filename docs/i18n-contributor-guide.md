# Internationalization (i18n) Contributor Guide

This guide provides comprehensive instructions for contributors working with internationalization in the Tool Chest project. We use `next-intl` with a modular translation architecture to support 16 languages efficiently.

## Table of Contents

1. [Overview](#overview)
2. [Translation Architecture](#translation-architecture)
3. [Adding New Translation Keys](#adding-new-translation-keys)
4. [Adding New Languages](#adding-new-languages)
5. [Translation Key Conventions](#translation-key-conventions)
6. [Component Integration Patterns](#component-integration-patterns)
7. [Testing Translations](#testing-translations)
8. [Quality Assurance](#quality-assurance)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

## Overview

The project uses a **modular translation architecture** that organizes translations into logical modules rather than monolithic files. This approach provides:

- **Better Organization**: Clear ownership of translation keys
- **Parallel Development**: Multiple teams can work on different modules
- **Performance**: Efficient loading with code-splitting potential
- **Scalability**: Easy to add new pages/tools without affecting existing translations
- **Maintainability**: Easier to audit and update specific functionality

## Translation Architecture

### Directory Structure

```
messages/
├── common/               # Shared strings across entire app
│   ├── en.json          # English base
│   ├── es.json          # Spanish
│   └── ...              # Other languages
├── pages/               # Page-specific content
│   ├── home/
│   │   ├── en.json      # Home page strings
│   │   └── ...
│   ├── tools/
│   ├── error/
│   ├── admin/
│   └── loading/
├── components/          # Component-specific strings
│   ├── layout/
│   ├── forms/
│   └── ui/
├── database/            # Database entity translations
│   ├── en.json          # Tool names, tag names, descriptions
│   └── ...
└── tools/               # Tool-specific content
    ├── common/          # Shared tool UI patterns
    ├── base64/          # Base64 tool specific
    ├── hash-generator/  # Hash generator specific
    └── {tool-name}/     # Other tools
```

### Supported Languages

The project supports 16 languages with English as the base:

```typescript
export const locales = [
  "en",
  "es",
  "zh",
  "hi",
  "pt",
  "ru",
  "ja",
  "de",
  "fr",
  "ko",
  "it",
  "tr",
  "pl",
  "nl",
  "vi",
  "uk",
] as const;
```

## Adding New Translation Keys

### Step 1: Identify the Appropriate Module

Determine which module should contain your new keys:

- **Common** (`messages/common/`): UI actions, status messages, validation, privacy
- **Pages** (`messages/pages/{page}/`): Page-specific content (hero sections, headings)
- **Components** (`messages/components/{type}/`): Component-specific strings
- **Database** (`messages/database/`): Tool names, tag names, descriptions
- **Tools** (`messages/tools/{tool}/`): Tool-specific metadata and features

### Step 2: Add Keys to English Base File

Add your new keys to the appropriate English file (`messages/{module}/en.json`):

```json
{
  "ui": {
    "status": {
      "processing": "Processing...",
      "completed": "Completed",
      "failed": "Failed"
    },
    "actions": {
      "retry": "Try Again",
      "download": "Download"
    }
  }
}
```

### Step 3: Update the Loading Configuration

If you're adding a new module, update `src/i18n/request.ts`:

```typescript
const modules = [
  "common",
  "pages/home",
  // ... existing modules
  "pages/new-page", // Add your new module here
  "tools/new-tool", // Or new tool module
];
```

### Step 4: Integrate in Components

Use the appropriate translation hook in your component:

```typescript
// Client component
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("pages.newPage");
  const tCommon = useTranslations("common");

  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <button>{tCommon("actions.save")}</button>
    </div>
  );
}

// Server component
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("pages.newPage");

  return <h1>{t("hero.title")}</h1>;
}
```

### Step 5: Update Other Languages

Add the same keys to all other language files:

```bash
# Add to Spanish
messages/{module}/es.json

# Add to Chinese
messages/{module}/zh.json

# ... and so on for all 16 languages
```

## Adding New Languages

### Step 1: Update Configuration

Add the new language code to `src/i18n/config.ts`:

```typescript
export const locales = [
  "en",
  "es",
  "zh",
  "hi",
  "pt",
  "ru",
  "ja",
  "de",
  "fr",
  "ko",
  "it",
  "tr",
  "pl",
  "nl",
  "vi",
  "uk",
  "ar", // Add new language code
] as const;
```

### Step 2: Create Translation Files

Create translation files for all modules:

```bash
# Create all module files for the new language
messages/common/ar.json
messages/pages/home/ar.json
messages/pages/tools/ar.json
messages/pages/error/ar.json
messages/pages/admin/ar.json
messages/pages/loading/ar.json
messages/components/layout/ar.json
messages/components/forms/ar.json
messages/components/ui/ar.json
messages/database/ar.json
messages/tools/common/ar.json
messages/tools/base64/ar.json
messages/tools/hash-generator/ar.json
messages/tools/favicon-generator/ar.json
messages/tools/markdown-to-pdf/ar.json
```

### Step 3: Copy Structure from English

Use the English files as templates and translate the values:

```json
// messages/common/ar.json
{
  "actions": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف"
  },
  "ui": {
    "status": {
      "loading": "جار التحميل",
      "success": "نجح",
      "error": "خطأ"
    }
  }
}
```

### Step 4: Test the New Language

Verify that all keys exist and the language works correctly:

```bash
# Run the QA script to check for missing keys
node scripts/qa-translations.mjs
```

## Translation Key Conventions

### Naming Patterns

- Use **camelCase** for key names: `heroTitle`, `buttonText`
- Use **descriptive names**: `validationEmailRequired` not `validationError1`
- Group related keys: `ui.status.loading`, `ui.status.success`
- Avoid abbreviations: `description` not `desc`

### Key Hierarchy

```json
{
  "ui": {
    "status": {
      // Group related statuses
      "loading": "Loading...",
      "success": "Success"
    },
    "actions": {
      // Group related actions
      "save": "Save",
      "cancel": "Cancel"
    }
  },
  "validation": {
    // Group validation messages
    "required": "This field is required",
    "invalid": "Invalid input"
  }
}
```

### Context Comments

For ambiguous terms, add context in a comment:

```json
{
  "common": {
    "save": "Save", // Save button text
    "saving": "Saving...", // Progress indicator text
    "saved": "Saved!" // Success message text
  }
}
```

## Component Integration Patterns

### Client Components

```typescript
import { useTranslations } from "next-intl";

export function ToolComponent() {
  // Multiple translation namespaces
  const t = useTranslations("tools.base64");
  const tCommon = useTranslations("common");
  const tTools = useTranslations("tools.common");

  return (
    <div>
      <h1>{t("tool.title")}</h1>
      <button onClick={handleProcess}>
        {tCommon("actions.process")}
      </button>
      <div className="status">
        {processing ? tTools("ui.status.processing") : tTools("ui.status.ready")}
      </div>
    </div>
  );
}
```

### Server Components

```typescript
import { getTranslations } from "next-intl/server";

export default async function ToolPage() {
  const t = await getTranslations("pages.tools");
  const tCommon = await getTranslations("common");

  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.description")}</p>
      <button>{tCommon("actions.getStarted")}</button>
    </div>
  );
}
```

### Dynamic Content

```typescript
// String interpolation
const t = useTranslations("tools.common");
const message = t("validation.fileTooLarge", { maxSize: "5MB" });

// Pluralization
const itemCount = 5;
const message = t("ui.itemCount", { count: itemCount });
```

### Error Handling

```typescript
const t = useTranslations("common");

try {
  // Some operation
} catch (error) {
  setError(t("errors.processingFailed"));
  console.error(error);
}
```

## Testing Translations

### Unit Tests

```typescript
// jest.setup.js mock for next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn().mockImplementation((namespace) =>
    (key: string, values?: any) => {
      if (values) {
        return `${namespace}.${key} with ${JSON.stringify(values)}`;
      }
      return `${namespace}.${key}`;
    }
  ),
}));

// Test component with translations
import { render, screen } from "@testing-library/react";
import MyComponent from "./MyComponent";

test("renders translated text", () => {
  render(<MyComponent />);
  expect(screen.getByText(/pages\.home\.hero\.title/)).toBeInTheDocument();
});
```

### E2E Tests

```typescript
// playwright test
test("homepage shows translated content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
  await expect(page.getByText(/all tools/i)).toBeVisible();
});
```

## Quality Assurance

### QA Script

Run the QA script to validate translations:

```bash
node scripts/qa-translations.mjs
```

This script checks:

- All language files have the same keys
- No missing translations
- Valid JSON syntax
- Consistent structure

### Manual QA Checklist

- [ ] All new keys added to English base file
- [ ] All language files updated with new keys
- [ ] Keys follow naming conventions
- [ ] No hard-coded strings remain in components
- [ ] Translation loading updated if new modules added
- [ ] Tests updated to handle new translations
- [ ] QA script passes without errors

## Common Patterns

### Loading States

```typescript
const tCommon = useTranslations("common");

// Loading indicator
{isLoading && <div>{tCommon("ui.status.loading")}</div>}

// Processing state
{isProcessing && <div>{tCommon("ui.status.processing")}</div>}
```

### Form Validation

```typescript
const tCommon = useTranslations("common");

const validateForm = (data) => {
  const errors = {};

  if (!data.email) {
    errors.email = tCommon("validation.required");
  }

  if (!isValidEmail(data.email)) {
    errors.email = tCommon("validation.invalidEmail");
  }

  return errors;
};
```

### Tool Status Updates

```typescript
const tTools = useTranslations("tools.common");
const [status, setStatus] = useState("ready");

const handleProcess = async () => {
  setStatus("processing");
  setStatusMessage(tTools("ui.status.processing"));

  try {
    const result = await processData();
    setStatus("success");
    setStatusMessage(tTools("ui.status.success"));
  } catch (error) {
    setStatus("error");
    setStatusMessage(tTools("ui.status.error"));
  }
};
```

## Troubleshooting

### Common Issues

**1. Translation key not found**

```
Error: Translation key "pages.home.hero.title" not found
```

- Check if the key exists in the English file
- Verify the module is loaded in `src/i18n/request.ts`
- Ensure the namespace matches the usage

**2. Module not loading**

```
Warning: Failed to load module pages/newPage for locale en
```

- Check if the file exists: `messages/pages/newPage/en.json`
- Verify the module is added to the `modules` array in `src/i18n/request.ts`
- Check file permissions and syntax

**3. Server vs Client component mismatch**

```
Error: useTranslations called in server component
```

- Use `getTranslations` in server components
- Use `useTranslations` in client components
- Add `"use client"` directive if needed

**4. Missing translation in other languages**

```
Warning: Key "newKey" missing in es.json
```

- Run the QA script to identify missing keys
- Add the missing keys to all language files
- Provide appropriate translations

### Debug Mode

Enable debug mode to see translation key usage:

```typescript
// In development, show translation keys instead of values
const t = useTranslations("pages.home");
console.log("Using key:", "hero.title", "->", t("hero.title"));
```

### Performance Considerations

- Keep translation files reasonably sized (< 100KB each)
- Use lazy loading for tool-specific translations when possible
- Avoid deeply nested key structures (max 3-4 levels)
- Group related keys to minimize namespace overhead

## Best Practices Summary

1. **Always start with English** - Create English keys first, then translate
2. **Use descriptive key names** - Make keys self-documenting
3. **Group related keys** - Use logical hierarchies
4. **Test translations** - Verify integration with components
5. **Run QA checks** - Use automated validation before committing
6. **Document context** - Add comments for ambiguous terms
7. **Keep modules focused** - Each module should have clear ownership
8. **Handle errors gracefully** - Provide fallbacks for missing keys
9. **Consider pluralization** - Use appropriate patterns for counts
10. **Performance matters** - Keep translation files optimized

---

For questions or assistance with translations, refer to the [Usage Examples Guide](./i18n-usage-examples.md) or consult the existing implementations in the codebase.
