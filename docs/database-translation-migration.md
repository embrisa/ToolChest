# Database Translation Key Migration Guide

## Overview

This guide outlines the migration from storing hardcoded text in the database to using translation keys that integrate with our modular translation system.

## Current vs Proposed Schema

### Current Schema (Problems)

```prisma
model Tool {
  name           String          @unique    // ❌ Hardcoded English
  description    String?                    // ❌ Not translatable
}

model Tag {
  name        String    @unique           // ❌ Hardcoded English
  description String?                     // ❌ Not translatable
}
```

### Proposed Schema (Solution)

```prisma
model Tool {
  // Translation keys instead of hardcoded text
  nameKey          String          @unique  // e.g., "tools.base64.name"
  descriptionKey   String?                  // e.g., "tools.base64.description"

  // Technical identifiers
  slug             String          @unique  // e.g., "base64" - for routing
  toolKey          String          @unique  // e.g., "base64" - for translations

  // Additional improvements
  isFeatured       Boolean         @default(false)
}

model Tag {
  // Translation keys instead of hardcoded text
  nameKey        String    @unique  // e.g., "tags.encoding.name"
  descriptionKey String?            // e.g., "tags.encoding.description"

  // Technical identifiers
  slug           String    @unique  // e.g., "encoding"
  tagKey         String    @unique  // e.g., "encoding"

  // Additional improvements
  iconClass      String?   // e.g., "tag-icon-encoding"
  displayOrder   Int       @default(0)
  isActive       Boolean   @default(true)
}
```

## Migration Strategy

### Phase 1: Add New Columns

```sql
-- Add new translation key columns
ALTER TABLE "Tool" ADD COLUMN "nameKey" TEXT;
ALTER TABLE "Tool" ADD COLUMN "descriptionKey" TEXT;
ALTER TABLE "Tool" ADD COLUMN "toolKey" TEXT;
ALTER TABLE "Tool" ADD COLUMN "isFeatured" BOOLEAN DEFAULT false;

ALTER TABLE "Tag" ADD COLUMN "nameKey" TEXT;
ALTER TABLE "Tag" ADD COLUMN "descriptionKey" TEXT;
ALTER TABLE "Tag" ADD COLUMN "tagKey" TEXT;
ALTER TABLE "Tag" ADD COLUMN "iconClass" TEXT;
ALTER TABLE "Tag" ADD COLUMN "displayOrder" INTEGER DEFAULT 0;
ALTER TABLE "Tag" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
```

### Phase 2: Populate Translation Keys

```sql
-- Populate tool keys based on current data
UPDATE "Tool" SET
  "toolKey" = "slug",
  "nameKey" = 'tools.' || "slug" || '.name',
  "descriptionKey" = 'tools.' || "slug" || '.description'
WHERE "toolKey" IS NULL;

-- Populate tag keys based on current data
UPDATE "Tag" SET
  "tagKey" = "slug",
  "nameKey" = 'tags.' || "slug" || '.name',
  "descriptionKey" = 'tags.' || "slug" || '.description'
WHERE "tagKey" IS NULL;
```

### Phase 3: Create Translation Files

Update `messages/database/en.json` with current database content:

```json
{
  "tools": {
    "base64": {
      "name": "Base64 Tool",
      "description": "Encode and decode Base64 data"
    }
  },
  "tags": {
    "encoding": {
      "name": "Encoding",
      "description": "Data encoding and decoding tools"
    }
  }
}
```

### Phase 4: Update Application Code

Replace direct database text usage:

```typescript
// BEFORE: Using hardcoded database text
const toolName = tool.name;

// AFTER: Using translation service
import { DatabaseTranslationService } from "@/services/core/databaseTranslationService";
const translatedTool = await DatabaseTranslationService.translateTool(
  tool,
  locale,
);
const toolName = translatedTool.name;
```

### Phase 5: Remove Old Columns

```sql
-- After verifying everything works
ALTER TABLE "Tool" DROP COLUMN "name";
ALTER TABLE "Tool" DROP COLUMN "description";
ALTER TABLE "Tag" DROP COLUMN "name";
ALTER TABLE "Tag" DROP COLUMN "description";

-- Add constraints
ALTER TABLE "Tool" ALTER COLUMN "nameKey" SET NOT NULL;
ALTER TABLE "Tool" ALTER COLUMN "toolKey" SET NOT NULL;
ALTER TABLE "Tag" ALTER COLUMN "nameKey" SET NOT NULL;
ALTER TABLE "Tag" ALTER COLUMN "tagKey" SET NOT NULL;

-- Add unique constraints
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_nameKey_key" UNIQUE ("nameKey");
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_toolKey_key" UNIQUE ("toolKey");
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_nameKey_key" UNIQUE ("nameKey");
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_tagKey_key" UNIQUE ("tagKey");
```

## Benefits of Key-Based System

### ✅ **Internationalization Ready**

- All 16 languages supported without schema changes
- Consistent with modular tool translations
- Easy to add new languages

### ✅ **Maintainable**

- Translation keys are version-controlled in files
- No database migrations needed for text changes
- Clear separation of data vs presentation

### ✅ **Performance**

- Translation resolution happens at application layer
- Database queries remain fast
- Can implement caching strategies

### ✅ **Developer Experience**

- Type-safe translation keys
- Easy to generate database records with proper keys
- Consistent patterns across tools and tags

## Usage Examples

### Creating New Tools

```typescript
// Generate tool record with proper translation keys
const newTool = DatabaseTranslationService.generateToolRecord("url-shortener", {
  iconClass: "tool-icon-url",
  displayOrder: 5,
  isFeatured: true,
});

// Add translations to messages/database/en.json:
// "tools.urlShortener.name": "URL Shortener"
// "tools.urlShortener.description": "Create short URLs"
```

### Retrieving Translated Content

```typescript
// In your API routes or server components
import { getTranslatedTools } from "@/services/core/databaseTranslationService";

const tools = await prisma.tool.findMany();
const translatedTools = await getTranslatedTools(tools, locale);

// Now translatedTools have localized name/description
```

### Admin Interface

```typescript
// Admin can manage tools by their technical keys
// Display shows translated names in admin's preferred language
const adminLocale = "en";
const translatedTools = await getTranslatedTools(tools, adminLocale);
```

## Migration Checklist

- [ ] Phase 1: Add new columns to database
- [ ] Phase 2: Populate translation keys from existing data
- [ ] Phase 3: Create `messages/database/{lang}.json` files for all 16 languages
- [ ] Phase 4: Update all code to use `DatabaseTranslationService`
- [ ] Phase 5: Test thoroughly with different locales
- [ ] Phase 6: Remove old text columns
- [ ] Phase 7: Update Prisma schema and regenerate client

This migration transforms your database from English-only to fully internationalized while maintaining clean, scalable architecture.
