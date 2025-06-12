import { Header, Footer } from "@/components/layout";
import { WebVitals } from "@/components/ui";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: import("@/i18n/config").Locale };
}) {
  const { locale } = params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <WebVitals debug={process.env.NODE_ENV === "development"} />
      <Header />
      <div className="flex-grow relative">{children}</div>
      <Footer />
    </NextIntlClientProvider>
  );
}
