import { Metadata } from "next";
import { FaviconGeneratorTool } from "@/components/tools/FaviconGeneratorTool";
import { ToolPageTemplate } from "@/components/ui";

export const metadata: Metadata = {
  title: "Favicon Generator - Create Favicons in All Sizes | tool-chest",
  description:
    "Free online favicon generator. Create favicons in all standard sizes (16x16, 32x32, 192x192, 512x512) from any image. Generate complete favicon packages with manifest files.",
  keywords: [
    "favicon generator",
    "favicon",
    "icon generator",
    "website icon",
    "app icon",
    "16x16",
    "32x32",
    "192x192",
    "512x512",
    "ico file",
    "png icon",
    "web app manifest",
    "free tool",
  ],
  openGraph: {
    title: "Favicon Generator - Create Favicons in All Sizes | tool-chest",
    description:
      "Free online favicon generator. Create favicons in all standard sizes from any image with complete manifest files.",
    type: "website",
    url: "/tools/favicon-generator",
  },
  alternates: {
    canonical: "/tools/favicon-generator",
  },
};

export default function FaviconGeneratorPage() {
  return (
    <ToolPageTemplate
      title="Favicon Generator"
      description={
        <>
          Generate favicons in all standard sizes from any image. Create
          complete favicon packages with PNG, ICO formats and web app manifest.
          <span className="block mt-2 text-success-600 dark:text-success-400 font-medium">
            All processing happens in your browser using Canvas API.
          </span>
        </>
      }
      icon={
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      }
      iconClassName="bg-gradient-to-br from-success-500 to-success-600"
      titleClassName="text-gradient bg-gradient-to-r from-success-500 to-success-600 bg-clip-text text-transparent"
      privacyMessage="🔒 Privacy-First • Canvas API • Client-Side Processing"
      privacyColors={{
        iconColor: "bg-success-500",
        textColor: "text-success-700 dark:text-success-300",
        borderColor: "border-success-200/50 dark:border-success-800/50",
      }}
      featureGrid={{
        features: [
          {
            id: "browser-icons",
            title: "Browser Icons",
            description:
              "16×16, 32×32, 48×48 favicons for browser tabs, bookmarks, and desktop shortcuts.",
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
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                />
              </svg>
            ),
            iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
          },
          {
            id: "apple-touch",
            title: "Apple Touch Icons",
            description:
              "180×180 icons for iOS home screen and Safari bookmark icons with rounded corners.",
            icon: (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            ),
            iconBg: "bg-gradient-to-br from-neutral-700 to-neutral-800",
          },
          {
            id: "android-icons",
            title: "Android Icons",
            description:
              "192×192, 512×512 icons for Android home screen and Progressive Web Apps.",
            icon: (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.523 15.3414c-.5665-.0085-1.0765-.1533-1.5323-.3758l-.9775-.4766c-.2243-.1092-.4715-.2014-.7425-.2766-.2709-.075-.5766-.1257-.9173-.1518-.3407-.026-.8157-.0125-1.425.04l-.105.0085c-.2125.0162-.4083.0328-.5875.0498-.1791.017-.3375.0255-.4749.0255h-.027c-.5832 0-1.0665-.0752-1.4498-.2256-.3833-.1504-.7-.3716-.95-.6638-.25-.2922-.4083-.6254-.475-.9996l-.0165-.089c-.0583-.3666-.0875-.7832-.0875-1.2498v-.1915c0-.3666.0375-.7958.1125-1.2874.075-.4916.2-.9791.375-1.4623l.525-.0833c.2166-.0333.4082-.0583.575-.075.1666-.0166.3207-.025.4624-.025h.0915c.3374 0 .6748.0625 1.0123.1875.3374.125.6665.2916.9872.4998l.9124.5916c.3958.2583.8082.4082 1.2373.4498l.1832.0166c.3916.0333.7915-.0124.1998-.1374l.9331-.2666c.4332-.1249.8665-.2416 1.2997-.3498l.0332-.0166c.6249-.1833 1.2165-.2332 1.7748-.1498.5582.0834 1.0581.3.4998.6498z" />
              </svg>
            ),
            iconBg: "bg-gradient-to-br from-success-500 to-success-600",
          },
          {
            id: "web-manifest",
            title: "Web App Manifest",
            description:
              "Complete manifest.json for Progressive Web Apps with all required metadata.",
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
            iconBg: "bg-gradient-to-br from-accent-500 to-accent-600",
            badge: {
              text: "PWA Ready",
              className:
                "bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-400",
            },
            className: "border-accent-200/50 dark:border-accent-800/50",
          },
        ],
        columns: { sm: 1, md: 2, lg: 4 },
      }}
      infoSection={{
        title: "About Favicons",
        description:
          "Favicons (favorite icons) are small icons displayed in browser tabs, bookmarks, and address bars. They help users identify your website quickly and improve brand recognition. Modern websites require multiple favicon sizes for different devices and use cases.",
        iconBg: "bg-gradient-to-br from-success-500 to-success-600",
        sections: [
          {
            title: "Standard Sizes",
            titleIcon: { color: "bg-success-500" },
            items: [
              { text: "16×16, 32×32 - Browser tabs and bookmarks" },
              { text: "48×48, 64×64 - Desktop shortcuts and apps" },
              { text: "96×96, 128×128 - High-DPI and retina displays" },
              { text: "180×180 - Apple touch icon for iOS" },
              { text: "192×192, 512×512 - Android and PWA icons" },
            ],
          },
          {
            title: "Best Practices",
            titleIcon: { color: "bg-brand-500" },
            className:
              "surface p-6 rounded-xl border border-brand-200/50 dark:border-brand-800/50 bg-brand-50/50 dark:bg-brand-950/20",
            items: [
              { text: "Use square images (1:1 aspect ratio)" },
              { text: "Start with 512×512 source for best quality" },
              { text: "Keep design simple and recognizable" },
              { text: "Test on different backgrounds" },
              { text: "Use PNG format for transparency support" },
            ],
          },
        ],
      }}
    >
      <FaviconGeneratorTool />
    </ToolPageTemplate>
  );
}
