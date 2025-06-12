import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { ToolPageTemplate, SuspenseFallback } from "@/components/ui";
import { generateSEOMetadata } from "@/utils/seo";
import { locales } from "@/i18n";
import { type Locale } from "@/i18n/config";
import { StaticDataService } from "@/services/tools/staticDataService";
import {
  getToolComponent,
  isValidToolSlug,
} from "@/utils/tools/componentMapper";

// Build-time: generate all locale + slug combinations
export const generateStaticParams = async () => {
  const slugs = await StaticDataService.getAllToolSlugs();

  // Return an array of { locale, slug }
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
};

// Build-time: metadata per page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;

  // Validate the tool exists
  if (!isValidToolSlug(slug)) {
    return { title: "Tool Not Found" };
  }

  const toolData = await StaticDataService.getToolData(slug, locale);
  if (!toolData) {
    return { title: "Tool Not Found" };
  }

  const t = await getTranslations({
    locale,
    namespace: `tools.${slug}.metadata`,
  });

  return generateSEOMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords"),
    pathname: `/tools/${slug}`,
    type: "website",
  });
}

// Optional: ISR
export const revalidate = 60;

// Runtime: server component rendering
export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // Validate the tool slug exists
  if (!isValidToolSlug(slug)) {
    notFound();
  }

  // Fetch tool data
  const toolData = await StaticDataService.getToolData(slug, locale);
  if (!toolData) {
    notFound();
  }

  // Get translations
  const tPage = await getTranslations({
    locale,
    namespace: `tools.${slug}.page`,
  });
  const tInfo = await getTranslations({
    locale,
    namespace: `tools.${slug}.info`,
  });

  // Get the tool component
  const ToolComponent = getToolComponent(slug);

  // Prepare tool-specific data based on slug
  const getToolSpecificProps = () => {
    switch (slug) {
      case "base64":
        const keyFeatures = tInfo
          .raw("keyFeatures.items")
          .map((text: string) => ({ text }));
        const securityAndPrivacy = tInfo
          .raw("securityAndPrivacy.items")
          .map((text: string) => ({ text }));

        return {
          iconText: "B64",
          iconClassName: "bg-gradient-to-br from-brand-500 to-brand-600",
          titleClassName: "text-gradient-brand",
          description: (
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
          ),
          infoSection: {
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
          },
        };

      case "hash-generator":
        return {
          iconText: "#",
          iconClassName: "bg-gradient-to-br from-accent-500 to-accent-600",
          titleClassName: "text-gradient-accent",
          description: tPage("description"),
          infoSection: {
            title: tInfo("title"),
            description: tInfo("description"),
            sections: [
              {
                title: tInfo("supportedAlgorithms.title"),
                titleIcon: { color: "bg-accent-500" },
                items: tInfo
                  .raw("supportedAlgorithms.items")
                  .map((text: string) => ({ text })),
              },
              {
                title: tInfo("useCases.title"),
                titleIcon: { color: "bg-brand-500" },
                items: tInfo
                  .raw("useCases.items")
                  .map((text: string) => ({ text })),
              },
            ],
          },
        };

      case "favicon-generator":
        return {
          iconText: "🎨",
          iconClassName: "bg-gradient-to-br from-success-500 to-success-600",
          titleClassName: "text-gradient-success",
          description: tPage("description"),
          infoSection: {
            title: tInfo("title"),
            description: tInfo("description"),
            sections: [
              {
                title: tInfo("supportedSizes.title"),
                titleIcon: { color: "bg-success-500" },
                items: tInfo
                  .raw("supportedSizes.items")
                  .map((text: string) => ({ text })),
              },
              {
                title: tInfo("outputFormats.title"),
                titleIcon: { color: "bg-brand-500" },
                items: tInfo
                  .raw("outputFormats.items")
                  .map((text: string) => ({ text })),
              },
            ],
          },
        };

      case "markdown-to-pdf":
        const features = tInfo
          .raw("features.items")
          .map((text: string) => ({ text }));
        return {
          iconText: "📄",
          iconClassName: "bg-gradient-to-br from-warning-500 to-warning-600",
          titleClassName: "text-gradient-warning",
          description: tPage("description"),
          featureGrid: { features },
          privacyMessage: tPage("privacyMessage"),
          privacyColors: {
            iconColor: "bg-warning-500",
            textColor: "text-warning-700 dark:text-warning-300",
            borderColor: "border-warning-200/50 dark:border-warning-800/50",
          },
          infoSection: {
            title: tInfo("title"),
            description: tInfo("description"),
            sections: [
              {
                title: tInfo("keyFeatures.title"),
                items: tInfo
                  .raw("keyFeatures.items")
                  .map((text: string) => ({ text })),
                titleIcon: { color: "bg-warning-500" },
              },
              {
                title: tInfo("supportedFeatures.title"),
                items: tInfo
                  .raw("supportedFeatures.items")
                  .map((text: string) => ({ text })),
                titleIcon: { color: "bg-brand-500" },
              },
              {
                title: tInfo("pdfTemplates.title"),
                items: tInfo
                  .raw("pdfTemplates.items")
                  .map((text: string) => ({ text })),
                titleIcon: { color: "bg-accent-500" },
              },
              {
                title: tInfo("howToUse.title"),
                items: tInfo
                  .raw("howToUse.items")
                  .map((text: string) => ({ text })),
                titleIcon: { color: "bg-success-500" },
              },
            ],
          },
        };

      default:
        return {
          iconText: (slug as string).charAt(0).toUpperCase(),
          iconClassName: "bg-gradient-to-br from-brand-500 to-brand-600",
          titleClassName: "text-gradient-brand",
          description: tPage("description"),
        };
    }
  };

  const toolProps = getToolSpecificProps();

  return (
    <ToolPageTemplate title={tPage("title")} {...toolProps}>
      <Suspense
        fallback={
          <SuspenseFallback
            variant="card"
            message={`Loading ${toolData.name}...`}
          />
        }
      >
        <ToolComponent />
      </Suspense>
    </ToolPageTemplate>
  );
}
