"use client";

import { useLocale, useTranslations } from "next-intl";
import { locales, localeNames, Locale } from "@/i18n/config";
import { useTransition, useState } from "react";
import { cn } from "@/utils";
import { usePathname, useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  // Use the same namespace as the existing layout translations
  const t = useTranslations("components.layout.localeSwitcher");
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const localeFlags: Record<Locale, string> = {
    en: "🇺🇸",
    es: "🇪🇸",
    zh: "🇨🇳",
    hi: "🇮🇳",
    pt: "🇧🇷",
    ru: "🇷🇺",
    ja: "🇯🇵",
    de: "🇩🇪",
    fr: "🇫🇷",
    ko: "🇰🇷",
    it: "🇮🇹",
    tr: "🇹🇷",
    pl: "🇵🇱",
    nl: "🇳🇱",
    vi: "🇻🇳",
    uk: "🇺🇦",
  };

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Locale;
    setSelectedLocale(value);
    startTransition(async () => {
      // Persist locale preference in a cookie for future visits
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: value }),
      });

      // Compute new pathname by replacing the locale segment (always present as the first segment)
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length === 0) {
        // Should never happen because localePrefix is "always", but guard anyway
        router.replace(`/${value}`);
        return;
      }

      // Replace the first segment with selected locale and force a full reload
      segments[0] = value;
      const newPath = `/${segments.join("/")}`;
      // Use full reload to ensure all translations are reloaded correctly
      window.location.assign(newPath);
    });
  };

  return (
    <div className="relative">
      <label htmlFor="locale-switcher" className="sr-only">
        {t("selectLanguage")}
      </label>
      <select
        id="locale-switcher"
        onChange={onChange}
        value={selectedLocale}
        disabled={isPending}
        className={cn(
          "input-field pr-10 cursor-pointer min-h-[44px] font-medium w-auto", // design token utilities
          "appearance-none", // hide default arrow for custom icon
          isPending && "opacity-70",
        )}
        aria-describedby="current-locale"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeNames[l]}
          </option>
        ))}
      </select>
      {/* Current locale for screen readers */}
      <span id="current-locale" className="sr-only">
        {t("current", { locale })}
      </span>

      {/* Custom dropdown icon showing the current locale flag */}
      <span
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      >
        {localeFlags[selectedLocale as Locale]}
      </span>
    </div>
  );
}
