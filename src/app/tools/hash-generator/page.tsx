import { Metadata } from "next";
import { HashGeneratorTool } from "@/components/tools/HashGeneratorTool";
import { ToolPageTemplate } from "@/components/ui";

export const metadata: Metadata = {
  title:
    "Hash Generator - Generate MD5, SHA-1, SHA-256, SHA-512 Hashes | tool-chest",
  description:
    "Free online hash generator for MD5, SHA-1, SHA-256, SHA-512, and other hash algorithms. Generate secure hashes for text and files with client-side processing.",
  keywords: [
    "hash generator",
    "md5",
    "sha1",
    "sha256",
    "sha512",
    "checksum",
    "crypto",
    "security",
    "file hash",
    "text hash",
    "online tool",
    "free",
  ],
  openGraph: {
    title:
      "Hash Generator - Generate MD5, SHA-1, SHA-256, SHA-512 Hashes | tool-chest",
    description:
      "Free online hash generator for multiple algorithms with file support. Privacy-first client-side processing.",
    type: "website",
    url: "/tools/hash-generator",
  },
  alternates: {
    canonical: "/tools/hash-generator",
  },
};

export default function HashGeneratorPage() {
  return (
    <ToolPageTemplate
      title="Hash Generator"
      description="Generate secure cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512) from text or files. All processing happens in your browser using the Web Crypto API."
      iconText="#"
      iconClassName="bg-gradient-to-br from-accent-500 to-accent-600"
      privacyMessage="🔒 Privacy-First • Web Crypto API • Client-Side Processing"
      privacyColors={{
        iconColor: "bg-accent-500",
        textColor: "text-accent-700 dark:text-accent-300",
        borderColor: "border-accent-200/50 dark:border-accent-800/50",
      }}
      featureGrid={{
        features: [
          {
            id: "md5",
            title: "MD5",
            description: "128-bit hash function. Fast but not cryptographically secure. Use for checksums only.",
            icon: <span className="text-sm font-bold text-white">MD5</span>,
            iconBg: "bg-gradient-to-br from-warning-500 to-warning-600",
          },
          {
            id: "sha1",
            title: "SHA-1",
            description: "160-bit hash function. Legacy algorithm, use SHA-256+ for security applications.",
            icon: <span className="text-xs font-bold text-white">SHA1</span>,
            iconBg: "bg-gradient-to-br from-error-500 to-error-600",
          },
          {
            id: "sha256",
            title: "SHA-256",
            description: "256-bit hash function. Secure and widely used standard for modern applications.",
            icon: <span className="text-xs font-bold text-white">256</span>,
            iconBg: "bg-gradient-to-br from-success-500 to-success-600",
            badge: {
              text: "Recommended",
              className: "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400",
            },
            className: "border-success-200/50 dark:border-success-800/50",
          },
          {
            id: "sha512",
            title: "SHA-512",
            description: "512-bit hash function. Maximum security for sensitive data and critical applications.",
            icon: <span className="text-xs font-bold text-white">512</span>,
            iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
          },
        ],
        columns: { sm: 1, md: 2, lg: 4 },
      }}
      infoSection={{
        title: "About Hash Functions",
        description:
          "Hash functions are mathematical algorithms that convert input data of any size into a fixed-size string of characters. They are widely used for data integrity verification, password storage, digital signatures, and blockchain technology.",
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
            title: "Common Use Cases",
            titleIcon: { color: "bg-accent-500" },
            items: [
              { text: "File integrity checking and verification" },
              { text: "Password hashing and authentication" },
              { text: "Digital forensics and evidence validation" },
              { text: "Blockchain and cryptocurrency" },
              { text: "Data deduplication and storage" },
            ],
          },
          {
            title: "Security Guidelines",
            titleIcon: { color: "bg-warning-500" },
            className:
              "surface p-6 rounded-xl border border-warning-200/50 dark:border-warning-800/50 bg-warning-50/50 dark:bg-warning-950/20",
            items: [
              { text: "MD5 and SHA-1 are cryptographically broken and should not be used for security-critical applications" },
              { text: "Use SHA-256 or SHA-512 for all security-sensitive applications and modern systems" },
            ],
          },
        ],
      }}
    >
      <HashGeneratorTool />
    </ToolPageTemplate>
  );
}
