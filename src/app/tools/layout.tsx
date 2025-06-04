import { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Tools | tool-chest",
    description:
        "Browse all available tools in our collection. Base64 encoding/decoding, hash generation, favicon creation, and more utility tools for developers.",
    keywords: [
        "tools",
        "utilities",
        "developer tools",
        "base64",
        "hash",
        "favicon",
        "markdown",
        "converter",
        "encoder",
        "decoder",
    ],
    openGraph: {
        title: "All Tools | tool-chest",
        description:
            "Browse all available tools in our collection. Base64 encoding/decoding, hash generation, favicon creation, and more.",
        type: "website",
        url: "/tools",
    },
    alternates: {
        canonical: "/tools",
    },
};

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 