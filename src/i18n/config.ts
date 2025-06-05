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
