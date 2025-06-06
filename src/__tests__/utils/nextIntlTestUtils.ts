/**
 * Test utilities for next-intl mocking
 * Provides consistent mocking patterns for translation functionality
 */

export interface TranslationMockConfig {
  namespace: string;
  translations: Record<string, string>;
}

/**
 * Creates a comprehensive next-intl mock for Jest tests
 */
export function createNextIntlMock(configs: TranslationMockConfig[] = []) {
  // Create translation database from provided configs
  const translationDb: Record<string, Record<string, string>> = {};

  configs.forEach(({ namespace, translations }) => {
    translationDb[namespace] = translations;
  });

  // Add default translations for common cases
  if (!translationDb["components.layout.header"]) {
    translationDb["components.layout.header"] = {
      "navigation.home": "Home",
      "navigation.tools": "Tools",
      "navigation.about": "About",
      "navigation.admin": "Admin",
      "mobile.toggleMenu": "Toggle menu",
      "mobile.openMenu": "Open navigation menu",
      "mobile.closeMenu": "Close navigation menu",
    };
  }

  if (!translationDb["common"]) {
    translationDb["common"] = {
      "ui.status.loading": "Loading...",
      "ui.status.error": "Error",
      "ui.actions.tryAgain": "Try Again",
      "errors.troubleLoading": "Trouble loading content",
    };
  }

  if (!translationDb["pages.home"]) {
    translationDb["pages.home"] = {
      "hero.title": "Essential Tools for Developers",
      "hero.subtitle":
        "Privacy-focused utilities that work entirely in your browser",
      "search.placeholder": "Search tools...",
      "search.noResults": "No tools found",
      "errors.troubleLoading": "Trouble loading content",
    };
  }

  const mockTranslationFunction = (namespace: string) => {
    return jest.fn((key: string, values: Record<string, unknown> = {}) => {
      // Handle nested key access
      const fullKey = `${namespace}.${key}`;

      // First try direct namespace lookup
      if (translationDb[namespace] && translationDb[namespace][key]) {
        const result = translationDb[namespace][key];
        // Simple interpolation for test values
        return Object.keys(values).reduce((str, valueKey) => {
          return str.replace(
            new RegExp(`{${valueKey}}`, "g"),
            String(values[valueKey]),
          );
        }, result);
      }

      // Try nested key lookup (for keys like "ui.status.loading")
      if (translationDb[namespace]) {
        const nestedValue = key.split(".").reduce((obj, k) => {
          return obj && typeof obj === "object" && k in obj
            ? obj[k]
            : undefined;
        }, translationDb[namespace] as any);

        if (typeof nestedValue === "string") {
          return Object.keys(values).reduce((str, valueKey) => {
            return str.replace(
              new RegExp(`{${valueKey}}`, "g"),
              String(values[valueKey]),
            );
          }, nestedValue);
        }
      }

      // Return debug-friendly fallback
      return `[${fullKey}]`;
    });
  };

  return {
    useTranslations: jest.fn().mockImplementation(mockTranslationFunction),
    getTranslations: jest.fn().mockImplementation(async (namespace: string) => {
      return mockTranslationFunction(namespace);
    }),
    useLocale: jest.fn().mockReturnValue("en"),
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
      children,
  };
}

/**
 * Default configurations for common translation namespaces
 */
export const defaultTranslationConfigs: TranslationMockConfig[] = [
  {
    namespace: "components.layout.header",
    translations: {
      "navigation.home": "Home",
      "navigation.tools": "Tools",
      "navigation.about": "About",
      "navigation.admin": "Admin",
      "mobile.toggleMenu": "Toggle menu",
      "mobile.openMenu": "Open navigation menu",
      "mobile.closeMenu": "Close navigation menu",
    },
  },
  {
    namespace: "common",
    translations: {
      "ui.status.loading": "Loading...",
      "ui.status.error": "Error",
      "ui.status.success": "Success",
      "ui.status.copied": "Copied!",
      "ui.actions.tryAgain": "Try Again",
      "ui.actions.copy": "Copy",
      "ui.actions.download": "Download",
      "errors.troubleLoading": "Trouble loading content",
      "errors.processingFailed": "Processing failed",
      "validation.emptyInput": "Input cannot be empty",
    },
  },
  {
    namespace: "pages.home",
    translations: {
      "hero.title": "Essential Tools for Developers",
      "hero.subtitle":
        "Privacy-focused utilities that work entirely in your browser",
      "search.placeholder": "Search tools...",
      "search.noResults": "No tools found",
      "search.resultsHeading": "Search Results",
      "errors.troubleLoading": "Trouble loading content",
    },
  },
  {
    namespace: "pages.error.notFound",
    translations: {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist.",
      "suggestions.0": "Check the URL for typos",
      "suggestions.1": "Go back to the homepage",
      "suggestions.2": "Use the search to find what you need",
    },
  },
  {
    namespace: "tools.common",
    translations: {
      "ui.modes.encode": "Encode",
      "ui.modes.decode": "Decode",
      "ui.modes.generate": "Generate",
      "ui.inputTypes.text": "Text",
      "ui.inputTypes.file": "File",
      "ui.inputTypes.upload": "Upload",
      "ui.status.processing": "Processing...",
      "ui.status.success": "Success",
      "ui.status.error": "Error",
      "ui.status.copied": "Copied!",
      "ui.actions.copy": "Copy",
      "ui.actions.download": "Download",
      "validation.emptyInput": "Input cannot be empty",
      "errors.processingFailed": "Processing failed",
    },
  },
];

/**
 * Utility to setup next-intl mock in Jest test files
 * Use this in your test file's beforeEach or describe block
 */
export function setupNextIntlMock(customConfigs: TranslationMockConfig[] = []) {
  const allConfigs = [...defaultTranslationConfigs, ...customConfigs];

  // Mock the module
  jest.mock("next-intl", () => createNextIntlMock(allConfigs));

  return createNextIntlMock(allConfigs);
}
