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
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// SEO Configuration
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  hi: "हिन्दी",
  pt: "Português",
  ru: "Русский",
  ja: "日本語",
  de: "Deutsch",
  fr: "Français",
  ko: "한국어",
  it: "Italiano",
  tr: "Türkçe",
  pl: "Polski",
  nl: "Nederlands",
  vi: "Tiếng Việt",
  uk: "Українська",
};

// OpenGraph locale mapping for social media
export const openGraphLocales: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  zh: "zh_CN",
  hi: "hi_IN",
  pt: "pt_BR",
  ru: "ru_RU",
  ja: "ja_JP",
  de: "de_DE",
  fr: "fr_FR",
  ko: "ko_KR",
  it: "it_IT",
  tr: "tr_TR",
  pl: "pl_PL",
  nl: "nl_NL",
  vi: "vi_VN",
  uk: "uk_UA",
};
