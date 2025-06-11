import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HashGeneratorTool } from "@/components/tools/HashGeneratorTool";
import { ToolPageTemplate } from "@/components/ui";
import { generateSEOMetadata } from "@/utils/seo";
import { type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "tools.hash-generator.metadata",
  });

  return generateSEOMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords"),
    pathname: "/tools/hash-generator",
    type: "website",
  });
}

export default async function HashGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tPage = await getTranslations({
    locale,
    namespace: "tools.hash-generator.page",
  });
  const tGrid = await getTranslations({
    locale,
    namespace: "tools.hash-generator.featureGrid",
  });
  const tInfo = await getTranslations({
    locale,
    namespace: "tools.hash-generator.info",
  });

  const useCases = tInfo.raw("useCases.items").map((text: string) => ({
    text,
  }));

  const securityGuidelines = tInfo
    .raw("securityGuidelines.items")
    .map((text: string) => ({ text }));

  const features = ["md5", "sha1", "sha256", "sha512"].map((id) => {
    // Check if badge exists for this algorithm
    let badgeText: string | null = null;
    try {
      badgeText = tGrid(`${id}.badge`);
    } catch (error) {
      // Badge doesn't exist for this algorithm, which is fine
      badgeText = null;
    }

    return {
      id,
      title: tGrid(`${id}.title`),
      description: tGrid(`${id}.description`),
      icon:
        id === "md5" ? (
          <span className="text-sm font-bold text-white">MD5</span>
        ) : id === "sha1" ? (
          <span className="text-xs font-bold text-white">SHA1</span>
        ) : id === "sha256" ? (
          <span className="text-xs font-bold text-white">256</span>
        ) : (
          <span className="text-xs font-bold text-white">512</span>
        ),
      iconBg:
        id === "md5"
          ? "bg-gradient-to-br from-warning-500 to-warning-600"
          : id === "sha1"
            ? "bg-gradient-to-br from-error-500 to-error-600"
            : id === "sha256"
              ? "bg-gradient-to-br from-success-500 to-success-600"
              : "bg-gradient-to-br from-brand-500 to-brand-600",
      ...(badgeText && {
        badge: {
          text: badgeText,
          className:
            "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400",
        },
        className: "border-success-200/50 dark:border-success-800/50",
      }),
    };
  });

  return (
    <ToolPageTemplate
      title={tPage("title")}
      description={tPage("description")}
      iconText="#"
      iconClassName="bg-gradient-to-br from-accent-500 to-accent-600"
      privacyMessage={tPage("privacyMessage")}
      privacyColors={{
        iconColor: "bg-accent-500",
        textColor: "text-accent-700 dark:text-accent-300",
        borderColor: "border-accent-200/50 dark:border-accent-800/50",
      }}
      featureGrid={{
        features,
        columns: { sm: 1, md: 2, lg: 4 },
      }}
      infoSection={{
        title: tInfo("title"),
        description: tInfo("description"),
        icon: (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
        iconBg: "bg-gradient-to-br from-accent-500 to-accent-600",
        sections: [
          {
            title: tInfo("useCases.title"),
            titleIcon: { color: "bg-accent-500" },
            items: useCases,
          },
          {
            title: tInfo("securityGuidelines.title"),
            titleIcon: { color: "bg-warning-500" },
            className:
              "surface p-6 rounded-xl border border-warning-200/50 dark:border-warning-800/50 bg-warning-50/50 dark:bg-warning-950/20",
            items: securityGuidelines,
          },
        ],
      }}
    >
      <HashGeneratorTool />
    </ToolPageTemplate>
  );
}
