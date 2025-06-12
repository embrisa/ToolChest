import { getRequestConfig, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export type TranslationModule =
  | "common"
  | "pages.home"
  | "pages.tools"
  | "pages.error"
  | "pages.admin"
  | "pages.loading"
  | "components.layout"
  | "components.forms"
  | "components.ui"
  | "database"
  | "tools.common"
  | `tools.${string}`;

/**
 * Load translation modules for a specific locale
 */
export async function loadTranslationModules(
  locale: string,
  modules: TranslationModule[],
): Promise<Record<string, unknown>> {
  const translations: Record<string, unknown> = {};

  // Helper to deep merge the loaded module into the translations object
  const deepMerge = (
    target: Record<string, unknown>,
    keys: string[],
    value: Record<string, unknown>,
  ) => {
    const key = keys[0]!;
    // When we reach the last key, merge the value
    if (keys.length === 1) {
      if (
        typeof target[key] === "object" &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        target[key] = { ...target[key], ...value };
      } else {
        target[key] = value;
      }
      return;
    }

    // Otherwise ensure nested object exists and recurse
    if (typeof target[key] !== "object" || target[key] === null) {
      target[key] = {};
    }
    deepMerge(target[key] as Record<string, unknown>, keys.slice(1), value);
  };

  for (const moduleName of modules) {
    try {
      // Convert dot notation in module name to a path for import, e.g. "components.layout" -> "components/layout"
      const modulePath = moduleName.replace(/\./g, "/");

      // Dynamically import the translation JSON (Vite/Next will tree-shake this correctly)
      const moduleTranslations = await import(
        `../../../messages/${modulePath}/${locale}.json`
      );

      // Insert the module translations into the nested translations object
      const keys = moduleName.split(".");
      deepMerge(
        translations,
        keys,
        moduleTranslations.default || moduleTranslations,
      );
    } catch (error) {
      // Don't fail hard on missing modules – just log a warning for developers
      console.warn(
        `⚠️  Failed to load translation module "${moduleName}" for locale "${locale}":`,
        error,
      );
      // Continue loading other modules even if one fails
    }
  }

  return translations;
}

/**
 * Load modular translations for a page
 * Combines common, page-specific, and component translations
 */
export async function getPageTranslations(
  locale: string,
  page: string,
  components: string[] = [],
) {
  const translations = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: `pages.${page}` }),
    ...components.map((component) =>
      getTranslations({ locale, namespace: `components.${component}` }),
    ),
  ]);

  return {
    common: translations[0],
    page: translations[1],
    components: Object.fromEntries(
      components.map((component, index) => [
        component,
        translations[index + 2],
      ]),
    ),
  };
}

/**
 * Load modular translations for a tool
 * Combines common, tool common, and tool-specific translations
 */
export async function getToolTranslations(locale: string, toolSlug: string) {
  const translations = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "tools.common" }),
    getTranslations({ locale, namespace: `tools.${toolSlug}` }),
  ]);

  return {
    common: translations[0],
    toolCommon: translations[1],
    tool: translations[2],
  };
}

/**
 * Load admin translations
 * Combines common, admin pages, and form translations
 */
export async function getAdminTranslations(locale: string) {
  const translations = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "pages.admin" }),
    getTranslations({ locale, namespace: "components.forms" }),
  ]);

  return {
    common: translations[0],
    admin: translations[1],
    forms: translations[2],
  };
}

/**
 * Flatten nested translation object for easier access
 */
export function flattenTranslations(
  translations: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(translations)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      Object.assign(
        flattened,
        flattenTranslations(value as Record<string, unknown>, newKey),
      );
    } else {
      flattened[newKey] = String(value);
    }
  }

  return flattened;
}

/**
 * Merge multiple translation objects with conflict resolution
 */
export function mergeTranslations(
  ...translationObjects: Record<string, unknown>[]
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  for (const obj of translationObjects) {
    for (const [key, value] of Object.entries(obj)) {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        merged[key] = merged[key]
          ? mergeTranslations(
              merged[key] as Record<string, unknown>,
              value as Record<string, unknown>,
            )
          : { ...value };
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

/**
 * Get available locales
 */
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

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * next-intl configuration with modular loading
 */
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !isValidLocale(locale)) notFound();

  // Load common translations for all pages
  const commonTranslations = await loadTranslationModules(locale, [
    "common",
    "components.layout",
    "components.ui",
    "database",
    "pages.error",
  ]);

  return {
    locale,
    messages: commonTranslations,
  };
});
