import { Header, Footer } from "@/components/layout";
import { WebVitals } from "@/components/ui";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "@/i18n/config";
import HomePage from "./[locale]/page";

export default async function IndexPage() {
  let locale = (await getLocale()) as Locale;
  if (!locales.includes(locale)) {
    locale = defaultLocale;
  }
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <WebVitals debug={process.env.NODE_ENV === "development"} />
      <Header />
      <main className="flex-grow relative">
        <HomePage />
      </main>
      <Footer />
    </NextIntlClientProvider>
  );
}
