import { Metadata } from "next";
import { Base64Tool } from "@/components/tools/Base64Tool";
import { ToolPageTemplate } from "@/components/ui";
import { getToolTranslationsForPage } from "@/utils/i18n/toolTranslations";

// Example of how to generate metadata from tool translations
export async function generateMetadata(): Promise<Metadata> {
  const translations = await getToolTranslationsForPage("base64");

  return {
    title: translations.metadata.title,
    description: translations.metadata.description,
    keywords: translations.metadata.keywords,
    openGraph: {
      title: translations.metadata.title,
      description: translations.metadata.description,
      type: "website",
      url: "/tools/base64",
    },
    alternates: {
      canonical: "/tools/base64",
    },
  };
}

export default async function Base64Page() {
  // Load tool-specific translations
  const translations = await getToolTranslationsForPage("base64");

  return (
    <ToolPageTemplate
      title={translations.page.title}
      description={
        <>
          {translations.page.description}
          <span className="block mt-2 text-brand-600 dark:text-brand-400 font-medium">
            {translations.privacy.clientSideNote}
          </span>
        </>
      }
      iconText="B64"
      iconClassName="bg-gradient-to-br from-brand-500 to-brand-600"
      titleClassName="text-gradient-brand"
      infoSection={{
        title: translations.info.title,
        description: translations.info.description,
        sections: [
          {
            title: translations.info.keyFeatures?.title || "Key Features",
            titleIcon: { color: "bg-brand-500" },
            items:
              translations.info.keyFeatures?.items.map((item: string) => ({
                text: item,
              })) || [],
          },
          {
            title: "Security & Privacy",
            titleIcon: { color: "bg-success-500" },
            className:
              "surface p-6 rounded-xl border border-success-200/50 dark:border-success-800/50 bg-success-50/50 dark:bg-success-950/20",
            items: [
              { text: translations.privacy.noDataSent },
              { text: translations.privacy.filesStayLocal },
              { text: translations.privacy.noLogging },
            ],
          },
          ...(translations.info.useCases
            ? [
                {
                  title: translations.info.useCases.title,
                  titleIcon: { color: "bg-accent-500" },
                  items: translations.info.useCases.items.map(
                    (item: string) => ({ text: item }),
                  ),
                },
              ]
            : []),
        ],
      }}
    >
      {/* Tool component would use translations internally */}
      <Base64Tool />
    </ToolPageTemplate>
  );
}

// Example of how a tool component would consume these translations
/*
// In Base64Tool.tsx
interface Base64ToolProps {
  translations: ReturnType<typeof getToolTranslations>;
}

export function Base64Tool({ translations }: Base64ToolProps) {
  return (
    <div>
      <button>{translations.ui.actions.process}</button>
      <input placeholder={translations.ui.placeholders.textInput} />
      // Use translations.ui.status.processing, etc.
    </div>
  );
}
*/
