import { Metadata } from "next";
import { Base64Tool } from "@/components/tools/Base64Tool";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder | tool-chest",
  description:
    "Free online Base64 encoder and decoder. Convert text to Base64 and decode Base64 to text. Supports file encoding/decoding with URL-safe options. Privacy-first with client-side processing.",
  keywords: [
    "base64",
    "encoder",
    "decoder",
    "encode",
    "decode",
    "text",
    "file",
    "url-safe",
    "online tool",
    "free",
    "privacy",
  ],
  openGraph: {
    title: "Base64 Encoder & Decoder | tool-chest",
    description:
      "Free online Base64 encoder and decoder with file support and URL-safe options. Privacy-first client-side processing.",
    type: "website",
    url: "/tools/base64",
  },
  alternates: {
    canonical: "/tools/base64",
  },
};

export default function Base64Page() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-20" />
      <div className="absolute inset-0 bg-noise" />

      <div className="relative">
        <div className="container-wide py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-6 shadow-colored">
              <span
                className="text-2xl font-bold text-white"
                aria-hidden="true"
              >
                B64
              </span>
            </div>

            <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-gradient-brand">
              Base64 Encoder & Decoder
            </h1>

            <p className="text-body text-lg sm:text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
              Encode and decode Base64 data with support for text and files.
              <span className="block mt-2 text-brand-600 dark:text-brand-400 font-medium">
                All processing happens in your browser for maximum privacy.
              </span>
            </p>
          </div>

          {/* Privacy Badge */}
          <div
            className="flex justify-center mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="surface-glass rounded-xl px-6 py-3 border border-brand-200/50 dark:border-brand-800/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse-gentle" />
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  🔒 Privacy-First • Client-Side Processing
                </span>
              </div>
            </div>
          </div>

          {/* Tool Component */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Base64Tool />
          </div>

          {/* Information Section */}
          <div
            className="mt-16 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="card-glass p-8 sm:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
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
                  About Base64 Encoding
                </h2>
              </div>

              <div className="prose-custom">
                <p className="text-body text-lg text-foreground-secondary mb-8 leading-relaxed">
                  Base64 is a binary-to-text encoding scheme that converts
                  binary data into a text format using a set of 64 characters.
                  It's commonly used for encoding data in email, web pages, and
                  data URLs, ensuring safe transmission over text-based
                  protocols.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-4">
                    <h3 className="text-heading text-xl font-semibold text-foreground flex items-center gap-3">
                      <div className="w-2 h-2 bg-brand-500 rounded-full" />
                      Key Features
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
                        <span>Text and file encoding/decoding</span>
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
                        <span>URL-safe Base64 encoding option</span>
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
                        <span>Client-side processing for privacy</span>
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
                        <span>Copy to clipboard functionality</span>
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
                        <span>Download encoded/decoded results</span>
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
                        <span>Real-time encoding/decoding</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-heading text-xl font-semibold text-foreground flex items-center gap-3">
                      <div className="w-2 h-2 bg-success-500 rounded-full" />
                      Security & Privacy
                    </h3>
                    <div className="surface p-6 rounded-xl border border-success-200/50 dark:border-success-800/50 bg-success-50/50 dark:bg-success-950/20">
                      <ul className="space-y-3 text-foreground-secondary">
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>No data sent to servers</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Processing happens in your browser</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Files stay on your device</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>No data storage or logging</span>
                        </li>
                      </ul>
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
