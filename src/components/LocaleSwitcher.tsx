"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
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
        <option value="en">{t("en")}</option>
        <option value="es">{t("es")}</option>
      </select>
    </label>
  );
}
