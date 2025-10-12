# i18n Snippets

## Client Component

```tsx
"use client";
import { useTranslations } from "next-intl";

export function Title() {
  const t = useTranslations("pages.home");
  return <h1>{t("hero.title")}</h1>;
}
```

## Server Component

```tsx
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("tools.common");
  return <p>{t("ui.status.ready")}</p>;
}
```

## Interpolation & Pluralization

```ts
const t = useTranslations("tools.common");
t("validation.fileTooLarge", { maxSize: "5MB" });
t("ui.itemCount", { count: 3 });
```

