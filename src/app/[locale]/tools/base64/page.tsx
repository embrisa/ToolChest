import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Base64Tool } from "@/components/tools/Base64Tool";
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
    namespace: "tools.base64.metadata",
  });

  return generateSEOMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords"),
    pathname: "/tools/base64",
    type: "website",
  });
}

export default async function Base64Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tPage = await getTranslations({
    locale,
    namespace: "tools.base64.page",
  });
  const tInfo = await getTranslations({
    locale,
    namespace: "tools.base64.info",
  });
  const keyFeatures = tInfo.raw("keyFeatures.items").map((text: string) => ({
    text,
  }));
  const securityAndPrivacy = tInfo
    .raw("securityAndPrivacy.items")
    .map((text: string) => ({ text }));

  return (
    <ToolPageTemplate
      title={tPage("title")}
      description={
        <>
          {tPage("description")}
          <span className="block mt-2">
            {tPage.rich("privacyNotice", {
              bold: (chunks) => (
                <span className="text-brand-600 dark:text-brand-400 font-medium">
                  {chunks}
                </span>
              ),
            })}
          </span>
        </>
      }
      iconText="B64"
      iconClassName="bg-gradient-to-br from-brand-500 to-brand-600"
      titleClassName="text-gradient-brand"
      infoSection={{
        title: tInfo("title"),
        description: tInfo("description"),
        sections: [
          {
            title: tInfo("keyFeatures.title"),
            titleIcon: { color: "bg-brand-500" },
            items: keyFeatures,
          },
          {
            title: tInfo("securityAndPrivacy.title"),
            titleIcon: { color: "bg-success-500" },
            className:
              "surface p-6 rounded-xl border border-success-200/50 dark:border-success-800/50 bg-success-50/50 dark:bg-success-950/20",
            items: securityAndPrivacy,
          },
        ],
      }}
    >
      <Base64Tool />
    </ToolPageTemplate>
  );
}
