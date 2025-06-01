import { Metadata } from "next";
import { Base64Tool } from "@/components/tools/Base64Tool";
import { ToolPageTemplate } from "@/components/ui";

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
    <ToolPageTemplate
      title="Base64 Encoder & Decoder"
      description={
        <>
          Encode and decode Base64 data with support for text and files.
          <span className="block mt-2 text-brand-600 dark:text-brand-400 font-medium">
            All processing happens in your browser for maximum privacy.
          </span>
        </>
      }
      iconText="B64"
      iconClassName="bg-gradient-to-br from-brand-500 to-brand-600"
      titleClassName="text-gradient-brand"
      infoSection={{
        title: "About Base64 Encoding",
        description:
          "Base64 is a binary-to-text encoding scheme that converts binary data into a text format using a set of 64 characters. It's commonly used for encoding data in email, web pages, and data URLs, ensuring safe transmission over text-based protocols.",
        sections: [
          {
            title: "Key Features",
            titleIcon: { color: "bg-brand-500" },
            items: [
              { text: "Text and file encoding/decoding" },
              { text: "URL-safe Base64 encoding option" },
              { text: "Client-side processing for privacy" },
              { text: "Copy to clipboard functionality" },
              { text: "Download encoded/decoded results" },
              { text: "Real-time encoding/decoding" },
            ],
          },
          {
            title: "Security & Privacy",
            titleIcon: { color: "bg-success-500" },
            className:
              "surface p-6 rounded-xl border border-success-200/50 dark:border-success-800/50 bg-success-50/50 dark:bg-success-950/20",
            items: [
              { text: "No data sent to servers" },
              { text: "Processing happens in your browser" },
              { text: "Files stay on your device" },
              { text: "No data storage or logging" },
            ],
          },
        ],
      }}
    >
      <Base64Tool />
    </ToolPageTemplate>
  );
}
