# i18n Overview (Essentials)

- Library: `next-intl`
- Loading: Modular messages assembled in `src/i18n/request.ts`
- Privacy: All translations are static JSON files in `messages/`

## Structure

```
messages/
├── common/{locale}.json
├── pages/{home,tools,error,admin,loading}/{locale}.json
├── components/{layout,forms,ui}/{locale}.json
├── database/{locale}.json         # tool/tag names & descriptions
└── tools/{common,base64,hash-generator,favicon-generator,markdown-to-pdf}/{locale}.json
```

Loaded modules (exact list used by the app):

```
common
pages/home, pages/tools, pages/error, pages/admin, pages/loading
components/layout, components/forms, components/ui
database
tools/common, tools/base64, tools/hash-generator, tools/favicon-generator, tools/markdown-to-pdf
```

## Locales

`en, es, zh, hi, pt, ru, ja, de, fr, ko, it, tr, pl, nl, vi, uk`

## Add Keys

1) Add to English file under the correct module.  
2) Copy the same key to all other locales (value can be a placeholder).  
3) Run `npm run qa:translations` to validate.

Tip: use `npm run i18n:addkey` to scaffold a key consistently.

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

## Validation

- `npm run qa:translations` checks structure/coverage.  
- Avoid dynamic keys; prefer literal keys for safety.
