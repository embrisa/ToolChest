import { Header, Footer } from "@/components/layout";
import { LocaleSwitcher } from "@/components";
import { WebVitals } from "@/components/ui";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { locales, defaultLocale } from "@/i18n/config";
import HomePage from "./[locale]/page";

export default async function IndexPage() {
  let locale = await getLocale();
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <WebVitals debug={process.env.NODE_ENV === "development"} />
      <Header />
      <div className="absolute top-2 right-4">
        <LocaleSwitcher />
      </div>
      <main className="flex-grow relative">
        <HomePage />
      </main>
      <Footer />
    </NextIntlClientProvider>
  );
}
