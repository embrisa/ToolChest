import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/services/locale";

async function loadModularMessages(locale: string) {
  const modules = [
    'common',
    'pages/home',
    'pages/tools',
    'pages/error',
    'pages/admin',
    'pages/loading',
    'components/layout',
    'components/forms',
    'components/ui',
    'database',
    'tools/common',
    'tools/base64',
    'tools/hash-generator',
    'tools/favicon-generator',
    'tools/markdown-to-pdf',
  ];

  const messages: any = {};

  for (const module of modules) {
    try {
      const moduleMessages = (await import(`../../messages/${module}/${locale}.json`)).default;

      // Convert module path to nested object structure
      const parts = module.split('/');
      let current = messages;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = moduleMessages;
    } catch (error) {
      console.warn(`Failed to load module ${module} for locale ${locale}:`, error);
    }
  }

  return messages;
}

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: await loadModularMessages(locale),
  };
});
