import { Header, Footer } from "@/components/layout";
import { LocaleSwitcher } from "@/components";
import { WebVitals } from "@/components/ui";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import "../globals.css";

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params: routeParams,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Use the new variable name to get the locale
    const { locale } = routeParams;

    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as any)) {
        notFound();
    }

    // Locale is handled by next-intl

    const messages = await getMessages();

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <WebVitals debug={process.env.NODE_ENV === "development"} />
            <Header />
            <div className="absolute top-2 right-4">
                <LocaleSwitcher />
            </div>
            <main className="flex-grow relative">{children}</main>
            <Footer />
        </NextIntlClientProvider>
    );
} 