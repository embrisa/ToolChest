# i18n Quick Guide

- Library: `next-intl`
- Files live under `messages/` (modular by page/component/tool)
- Locales: `en, es, zh, hi, pt, ru, ja, de, fr, ko, it, tr, pl, nl, vi, uk`

## Add a Translation Key

1) Pick the right module (e.g., `messages/pages/home/en.json`).
2) Add the key in English.
3) Copy the key to all other locales (placeholder is OK).
4) Validate: `npm run qa:translations`.

Tip: `npm run i18n:addkey` scaffolds keys consistently.

## Use in Components

Client:

```tsx
import { useTranslations } from "next-intl";
const t = useTranslations("pages.home");
return <h1>{t("hero.title")}</h1>;
```

Server:

```tsx
import { getTranslations } from "next-intl/server";
const t = await getTranslations("tools.common");
return t("ui.status.ready");
```

## Add a New Language

1) Add the code in `src/i18n/config.ts` (`locales`).
2) Create `{locale}.json` files for the modules you use.
3) Copy structure from English; translate values.
4) Run `npm run qa:translations`.

## Database Names/Tags

Tool/Tag names and descriptions live in `messages/database/{locale}.json`.
They are applied via `DatabaseTranslationService` in services.

