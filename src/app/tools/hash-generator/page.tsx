import { Metadata } from "next";
import { HashGeneratorTool } from "@/components/tools/HashGeneratorTool";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ToolHeader
} from "@/components/ui";

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
    <main className="min-h-screen bg-background">
      <div className="container-wide py-12 lg:py-16 space-y-12">
        {/* Tool Header */}
        <div className="text-center animate-fade-in-up">
          <ToolHeader
            title="Hash Generator"
            description="Generate secure cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512) from text or files. All processing happens in your browser using the Web Crypto API."
            iconText="#"
            iconClassName="bg-gradient-to-br from-accent-500 to-accent-600"
            className="justify-center"
          />
        </div>

        {/* Privacy Badge */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <Card variant="elevated" padding="sm" className="inline-flex">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse-gentle" />
              <span className="text-sm font-medium text-accent-700 dark:text-accent-300">
                🔒 Privacy-First • Web Crypto API • Client-Side Processing
              </span>
            </div>
          </Card>
        </div>

        {/* Hash Algorithm Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Card variant="interactive" padding="md" className="group">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-white">MD5</span>
                </div>
                <CardTitle as="h3" className="text-lg mb-0">
                  MD5
                </CardTitle>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                128-bit hash function. Fast but not cryptographically secure.
                Use for checksums only.
              </p>
            </CardContent>
          </Card>

          <Card variant="interactive" padding="md" className="group">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-error-500 to-error-600 rounded-xl flex items-center justify-center">
                  <span className="text-xs font-bold text-white">SHA1</span>
                </div>
                <CardTitle as="h3" className="text-lg mb-0">
                  SHA-1
                </CardTitle>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                160-bit hash function. Legacy algorithm, use SHA-256+ for
                security applications.
              </p>
            </CardContent>
          </Card>

          <Card variant="interactive" padding="md" className="group border-success-200/50 dark:border-success-800/50">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                  <span className="text-xs font-bold text-white">256</span>
                </div>
                <div>
                  <CardTitle as="h3" className="text-lg mb-1">
                    SHA-256
                  </CardTitle>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400">
                    Recommended
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                256-bit hash function. Secure and widely used standard for
                modern applications.
              </p>
            </CardContent>
          </Card>

          <Card variant="interactive" padding="md" className="group">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                  <span className="text-xs font-bold text-white">512</span>
                </div>
                <CardTitle as="h3" className="text-lg mb-0">
                  SHA-512
                </CardTitle>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                512-bit hash function. Maximum security for sensitive data and
                critical applications.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tool Component */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <HashGeneratorTool />
        </div>

        {/* Information Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Card variant="elevated" padding="lg" className="space-y-8">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
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
                </div>
                <CardTitle as="h2" className="text-2xl mb-0">
                  About Hash Functions
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              <p className="text-lg text-foreground-secondary leading-relaxed">
                <strong>Hash functions</strong> are mathematical algorithms
                that convert input data of any size into a fixed-size string
                of characters. They are widely used for data integrity
                verification, password storage, digital signatures, and
                blockchain technology.
              </p>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent-500 rounded-full" />
                    Common Use Cases
                  </h3>
                  <ul className="space-y-4 text-foreground-secondary">
                    {[
                      "File integrity checking and verification",
                      "Password hashing and authentication",
                      "Digital forensics and evidence validation",
                      "Blockchain and cryptocurrency",
                      "Data deduplication and storage"
                    ].map((useCase, index) => (
                      <li key={index} className="flex items-start gap-3">
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
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                    <div className="w-2 h-2 bg-warning-500 rounded-full" />
                    Security Guidelines
                  </h3>
                  <Card variant="default" padding="md" className="border border-warning-200/50 dark:border-warning-800/50 bg-warning-50/50 dark:bg-warning-950/20">
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-foreground">
                            Deprecated Algorithms
                          </p>
                          <p className="text-sm text-foreground-secondary">
                            MD5 and SHA-1 are cryptographically broken and
                            should not be used for security-critical
                            applications.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
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
                        <div>
                          <p className="font-medium text-foreground">
                            Secure Standards
                          </p>
                          <p className="text-sm text-foreground-secondary">
                            Use SHA-256 or SHA-512 for all security-sensitive
                            applications and modern systems.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
