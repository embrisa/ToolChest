import { Metadata } from "next";
import { FaviconGeneratorTool } from "@/components/tools/FaviconGeneratorTool";

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
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-20" />
      <div className="absolute inset-0 bg-noise" />

      <div className="relative">
        <div className="container-wide py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl mb-6 shadow-colored">
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
            </div>

            <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl mb-6">
              <span className="text-gradient bg-gradient-to-r from-success-500 to-success-600 bg-clip-text text-transparent">
                Favicon Generator
              </span>
            </h1>

            <p className="text-body text-lg sm:text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
              Generate favicons in all standard sizes from any image. Create
              complete favicon packages with PNG, ICO formats and web app
              manifest.
              <span className="block mt-2 text-success-600 dark:text-success-400 font-medium">
                All processing happens in your browser using Canvas API.
              </span>
            </p>
          </div>

          {/* Privacy Badge */}
          <div
            className="flex justify-center mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="surface-glass rounded-xl px-6 py-3 border border-success-200/50 dark:border-success-800/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-gentle" />
                <span className="text-sm font-medium text-success-700 dark:text-success-300">
                  🔒 Privacy-First • Canvas API • Client-Side Processing
                </span>
              </div>
            </div>
          </div>

          {/* Favicon Type Cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="card p-6 hover:shadow-colored transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
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
                </div>
                <h3 className="text-heading font-semibold text-foreground">
                  Browser Icons
                </h3>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                16×16, 32×32, 48×48 favicons for browser tabs, bookmarks, and
                desktop shortcuts.
              </p>
            </div>

            <div className="card p-6 hover:shadow-colored transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <h3 className="text-heading font-semibold text-foreground">
                  Apple Touch Icons
                </h3>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                180×180 icons for iOS home screen and Safari bookmark icons with
                rounded corners.
              </p>
            </div>

            <div className="card p-6 hover:shadow-colored transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.523 15.3414c-.5665-.0085-1.0765-.1533-1.5323-.3758l-.9775-.4766c-.2243-.1092-.4715-.2014-.7425-.2766-.2709-.075-.5766-.1257-.9173-.1518-.3407-.026-.8157-.0125-1.425.04l-.105.0085c-.2125.0162-.4083.0328-.5875.0498-.1791.017-.3375.0255-.4749.0255h-.027c-.5832 0-1.0665-.0752-1.4498-.2256-.3833-.1504-.7-.3716-.95-.6638-.25-.2922-.4083-.6254-.475-.9996l-.0165-.089c-.0583-.3666-.0875-.7832-.0875-1.2498v-.1915c0-.3666.0375-.7958.1125-1.2874.075-.4916.2-.9791.375-1.4623l.525-.0833c.2166-.0333.4082-.0583.575-.075.1666-.0166.3207-.025.4624-.025h.0915c.3374 0 .6748.0625 1.0123.1875.3374.125.6665.2916.9872.4998l.9124.5916c.3958.2583.8082.4082 1.2373.4498l.1832.0166c.3916.0333.7915-.0124.1998-.1374l.9331-.2666c.4332-.1249.8665-.2416 1.2997-.3498l.0332-.0166c.6249-.1833 1.2165-.2332 1.7748-.1498.5582.0834 1.0581.3.4998.6498z" />
                  </svg>
                </div>
                <h3 className="text-heading font-semibold text-foreground">
                  Android Icons
                </h3>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                192×192, 512×512 icons for Android home screen and Progressive
                Web Apps.
              </p>
            </div>

            <div className="card p-6 hover:shadow-colored transition-all duration-300 group border-accent-200/50 dark:border-accent-800/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
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
                </div>
                <div>
                  <h3 className="text-heading font-semibold text-foreground">
                    Web App Manifest
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-400">
                    PWA Ready
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                Complete manifest.json for Progressive Web Apps with all
                required metadata.
              </p>
            </div>
          </div>

          {/* Tool Component */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <FaviconGeneratorTool />
          </div>

          {/* Information Section */}
          <div
            className="mt-16 animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="card-glass p-8 sm:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-title text-2xl sm:text-3xl font-semibold text-foreground">
                  About Favicons
                </h2>
              </div>

              <div className="prose-custom">
                <p className="text-body text-lg text-foreground-secondary mb-8 leading-relaxed">
                  <strong>Favicons</strong> (favorite icons) are small icons
                  displayed in browser tabs, bookmarks, and address bars. They
                  help users identify your website quickly and improve brand
                  recognition. Modern websites require multiple favicon sizes
                  for different devices and use cases.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-4">
                    <h3 className="text-heading text-xl font-semibold text-foreground flex items-center gap-3">
                      <div className="w-2 h-2 bg-success-500 rounded-full" />
                      Standard Sizes
                    </h3>
                    <ul className="space-y-3 text-foreground-secondary">
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>16×16, 32×32 - Browser tabs and bookmarks</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>48×48, 64×64 - Desktop shortcuts and apps</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          96×96, 128×128 - High-DPI and retina displays
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>180×180 - Apple touch icon for iOS</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>192×192, 512×512 - Android and PWA icons</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-heading text-xl font-semibold text-foreground flex items-center gap-3">
                      <div className="w-2 h-2 bg-brand-500 rounded-full" />
                      Best Practices
                    </h3>
                    <div className="surface p-6 rounded-xl border border-brand-200/50 dark:border-brand-800/50 bg-brand-50/50 dark:bg-brand-950/20">
                      <ul className="space-y-3 text-foreground-secondary">
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Use square images (1:1 aspect ratio)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            Start with 512×512 source for best quality
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Keep design simple and recognizable</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Test on different backgrounds</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Use PNG format for transparency support</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-950/20 dark:to-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-warning-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-warning-800 dark:text-warning-200 mb-2">
                        Implementation Tips
                      </h3>
                      <p className="text-sm text-warning-700 dark:text-warning-300 leading-relaxed">
                        Add generated favicons to your website's head section
                        and include the manifest.json for PWA support. Consider
                        using different designs for very small sizes (16×16) to
                        maintain readability. Always test your favicons on
                        various devices and browsers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
