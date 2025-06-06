"use client";

import { useLocale, useTranslations } from "next-intl";
import { locales } from "@/i18n/config";
import { useTransition } from "react";

export default function LocaleSwitcher() {
  // Use the same namespace as the existing layout translations
  const t = useTranslations("components.layout.localeSwitcher");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: value }),
      });
      window.location.reload();
    });
  };

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">{t("label")}</span>
      <select
        onChange={onChange}
        defaultValue={locale}
        disabled={isPending}
        className="border rounded p-1 text-sm"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {t(l)}
          </option>
        ))}
      </select>
    </label>
  );
}
