import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./config";

async function loadModularMessages(locale: string) {
  const modules = [
    "common",
    "pages/home",
    "pages/tools",
    "pages/error",
    "pages/admin",
    "pages/loading",
    "components/layout",
    "components/forms",
    "components/ui",
    "database",
    "tools/common",
    "tools/base64",
    "tools/hash-generator",
    "tools/favicon-generator",
    "tools/markdown-to-pdf",
  ];

  const messages: any = {};

  for (const moduleName of modules) {
    try {
      const moduleMessages = (
        await import(`../../messages/${moduleName}/${locale}.json`)
      ).default;

      // Convert module path to nested object structure
      const parts = moduleName.split("/");
      let current = messages;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = moduleMessages;
    } catch (error) {
      // It's okay if a message file for a specific module doesn't exist.
      // console.warn(
      //   `Could not load messages for module ${moduleName} for locale ${locale}:`,
      //   error,
      // );
    }
  }

  return messages;
}

export default getRequestConfig(async ({ locale: rawLocale }) => {
  const locale =
    rawLocale && (locales as readonly string[]).includes(rawLocale)
      ? rawLocale
      : defaultLocale;

  return {
    locale,
    messages: await loadModularMessages(locale),
  };
});
