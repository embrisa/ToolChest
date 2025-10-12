import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const nextConfig: NextConfig = {
  /* Performance Optimizations */

  // Enable experimental features for better performance
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Image optimization configuration
  images: {
    // Enable optimization for external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Optimize image formats
    formats: ["image/webp", "image/avif"],
    // Configure image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable AVIF format for better compression
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression and output optimization
  compress: true,

  // Conditionally skip lint/type errors during builds for E2E runs
  eslint: {
    ignoreDuringBuilds:
      process.env.NODE_ENV === "test" || process.env.DISABLE_LINT_BUILD === "1",
  },
  typescript: {
    ignoreBuildErrors:
      process.env.NODE_ENV === "test" || process.env.DISABLE_TYPES_BUILD === "1",
  },

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache API routes appropriately
        source: "/api/tools/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },

  // Webpack customizations
  webpack: (config: any) => {
    // Offline Google Fonts during test/CI runs to avoid network fetches
    if (process.env.OFFLINE_FONTS === "1") {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      // Stub both the next/font/google JS entry and its generated CSS target
      config.resolve.alias["next/font/google"] = path.resolve(
        __dirname,
        "src/test/stubs/next-font-google.ts",
      );
      config.resolve.alias["next/font/google/target.css"] = path.resolve(
        __dirname,
        "src/test/stubs/next-font-google.css",
      );
      // Also stub our module indirection if referenced
      config.resolve.alias["@/app/fonts"] = path.resolve(
        __dirname,
        "src/test/stubs/fonts.ts",
      );
    }
    // Enable bundle analyzer in development when ANALYZE=true
    if (process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: 8888,
          openAnalyzer: true,
        }),
      );
    }
    return config;
  },

  // Output configuration for better performance
  output: "standalone",

  // Reduce build output size
  generateEtags: false,

  // Optimize module resolution
  modularizeImports: {
    "@heroicons/react/24/outline": {
      transform: "@heroicons/react/24/outline/{{member}}",
    },
    "@heroicons/react/24/solid": {
      transform: "@heroicons/react/24/solid/{{member}}",
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
