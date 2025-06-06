import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarkdownToPdfTool } from "@/components/tools/MarkdownToPdfTool";
import { ToolPageTemplate } from "@/components/ui/ToolPageTemplate";
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
    namespace: "tools.markdown-to-pdf.metadata",
  });

  return generateSEOMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords"),
    pathname: "/tools/markdown-to-pdf",
    type: "website",
  });
}

export default async function MarkdownToPdfPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tPage = await getTranslations({
    locale,
    namespace: "tools.markdown-to-pdf.page",
  });
  const tGrid = await getTranslations({
    locale,
    namespace: "tools.markdown-to-pdf.featureGrid",
  });
  const tInfo = await getTranslations({
    locale,
    namespace: "tools.markdown-to-pdf.info",
  });

  const features = [
    "live-preview",
    "templates",
    "gfm-support",
    "syntax-highlighting",
    "custom-styling",
    "file-upload",
    "professional-output",
    "privacy-first",
  ].map((id) => ({
    id,
    title: tGrid(`${id}.title`),
    description: tGrid(`${id}.description`),
    icon: tGrid(`${id}.icon`),
  }));

  const infoSection = {
    title: tInfo("title"),
    description: tInfo("description"),
    sections: [
      {
        title: tInfo("keyFeatures.title"),
        items: tInfo.raw("keyFeatures.items").map((text: string) => ({ text })),
        titleIcon: {
          color: "bg-warning-500",
        },
      },
      {
        title: tInfo("supportedFeatures.title"),
        items: tInfo
          .raw("supportedFeatures.items")
          .map((text: string) => ({ text })),
        titleIcon: {
          color: "bg-brand-500",
        },
      },
      {
        title: tInfo("pdfTemplates.title"),
        items: tInfo
          .raw("pdfTemplates.items")
          .map((text: string) => ({ text })),
        titleIcon: {
          color: "bg-accent-500",
        },
      },
      {
        title: tInfo("howToUse.title"),
        items: tInfo.raw("howToUse.items").map((text: string) => ({ text })),
        titleIcon: {
          color: "bg-success-500",
        },
      },
    ],
  };

  return (
    <ToolPageTemplate
      title={tPage("title")}
      description={tPage("description")}
      iconText="📄"
      iconClassName="bg-gradient-to-br from-warning-500 to-warning-600"
      featureGrid={{ features }}
      infoSection={infoSection}
      privacyMessage={tPage("privacyMessage")}
      privacyColors={{
        iconColor: "bg-warning-500",
        textColor: "text-warning-700 dark:text-warning-300",
        borderColor: "border-warning-200/50 dark:border-warning-800/50",
      }}
    >
      <MarkdownToPdfTool />
    </ToolPageTemplate>
  );
}
