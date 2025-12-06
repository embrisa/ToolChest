import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

const pillarKeys = ["privacy", "accessibility", "reliability"] as const;

export default async function AboutPage() {
  const t = await getTranslations("pages.about");
  const locale = await getLocale();
  const localePrefix = `/${locale}`;
  const toolsPath = `${localePrefix}/tools`;
  const homePath = localePrefix;

  return (
    <div className="container-wide px-6 sm:px-8 lg:px-12 py-12 lg:py-16 space-y-12">
      <div className="max-w-4xl mx-auto space-y-6 text-center md:text-left">
        <p className="text-sm font-semibold text-brand-600 tracking-wide uppercase">
          {t("subtitle")}
        </p>
        <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary">
          {t("title")}
        </h1>
        <p className="text-lg text-foreground-secondary leading-relaxed">
          {t("intro")}
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-heading text-2xl font-semibold text-primary">
          {t("pillarsTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillarKeys.map((pillar) => (
            <div key={pillar} className="card p-6 lg:p-8 h-full">
              <div className="flex flex-col h-full gap-3">
                <h3 className="text-xl font-semibold text-primary">
                  {t(`pillars.${pillar}.title`)}
                </h3>
                <p className="text-body text-foreground-secondary leading-relaxed">
                  {t(`pillars.${pillar}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={toolsPath}
          className="btn-primary focus-ring inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold"
        >
          {t("cta.primary")}
        </Link>
        <Link
          href={homePath}
          className="btn-secondary focus-ring inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold"
        >
          {t("cta.secondary")}
        </Link>
      </div>
    </div>
  );
}

