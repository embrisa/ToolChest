"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import {
  FaviconSizeKey,
  FAVICON_SIZES,
  PREVIEW_CONTEXTS,
  FaviconPreviewContext,
} from "@/types/tools/faviconGenerator";

export interface FaviconPreviewProps {
  previewUrls: { [key in FaviconSizeKey]?: string };
  selectedContext?: string;
  onContextChange?: (context: string) => void;
  title?: string;
  className?: string;
}

export function FaviconPreview({
  previewUrls,
  selectedContext = "all",
  onContextChange,
  title = "Favicon Preview",
  className = "",
}: FaviconPreviewProps) {
  const [activeTab, setActiveTab] = useState("browser");

  const contexts = Object.values(PREVIEW_CONTEXTS);
  const hasPreviewData = Object.keys(previewUrls).length > 0;

  if (!hasPreviewData) {
    return null;
  }

  const BrowserTabPreview = ({
    faviconUrl,
    size,
  }: {
    faviconUrl: string;
    size: number;
  }) => (
    <div className="surface rounded-t-xl p-3 border-b-0 max-w-xs shadow-medium">
      <div className="flex items-center space-x-3 bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-soft border border-neutral-200 dark:border-neutral-700">
        <img
          src={faviconUrl}
          alt="Favicon in browser tab"
          className="w-4 h-4 flex-shrink-0"
          style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
        />
        <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate font-medium">
          tool-chest - Your site
        </span>
        <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-sm ml-auto focus:outline-none focus:ring-2 focus:ring-neutral-500/50 rounded">
          ×
        </button>
      </div>
    </div>
  );

  const BookmarkPreview = ({
    faviconUrl,
    size,
  }: {
    faviconUrl: string;
    size: number;
  }) => (
    <div className="surface rounded-xl p-4 shadow-medium max-w-xs hover:shadow-large transition-all duration-200">
      <div className="flex items-center space-x-3">
        <img
          src={faviconUrl}
          alt="Favicon in bookmark"
          className="w-5 h-5 flex-shrink-0"
          style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            tool-chest
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            tool-chest.com
          </p>
        </div>
        <div className="text-warning-500 dark:text-warning-400 text-sm">⭐</div>
      </div>
    </div>
  );

  const DesktopIconPreview = ({
    faviconUrl,
    size,
  }: {
    faviconUrl: string;
    size: number;
  }) => (
    <div className="flex flex-col items-center space-y-3 p-6">
      <div className="relative group">
        <img
          src={faviconUrl}
          alt="Favicon as desktop icon"
          className="w-16 h-16 rounded-2xl shadow-large hover:shadow-extra-large transition-all duration-200 hover:scale-105"
          style={{
            imageRendering: size <= 64 ? "pixelated" : "auto",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
          }}
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-500 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center shadow-medium">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l9.2-9.2M17 17V7H7"
            />
          </svg>
        </div>
      </div>
      <span className="text-xs text-neutral-600 dark:text-neutral-400 text-center max-w-20 truncate font-medium">
        tool-chest
      </span>
    </div>
  );

  const PreviewGrid = ({ context }: { context: FaviconPreviewContext }) => {
    const relevantSizes = Object.entries(previewUrls).filter(
      ([sizeKey, _url]) => {
        const size = FAVICON_SIZES[sizeKey as FaviconSizeKey];
        if (context.id === "browser") return size.width <= 32;
        if (context.id === "bookmark") return size.width <= 48;
        if (context.id === "desktop") return size.width >= 64;
        return true;
      },
    );

    if (relevantSizes.length === 0) {
      return (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-neutral-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              No suitable sizes generated for {context.name}
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2 max-w-md mx-auto">
              {context.id === "browser" &&
                "Generate 16px or 32px sizes for browser tabs"}
              {context.id === "bookmark" &&
                "Generate 16px, 32px, or 48px sizes for bookmarks"}
              {context.id === "desktop" &&
                "Generate 64px+ sizes for desktop icons"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h4 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {context.name}
          </h4>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            {context.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {relevantSizes.slice(0, 4).map(([sizeKey, url]) => {
            const size = FAVICON_SIZES[sizeKey as FaviconSizeKey];

            return (
              <div key={sizeKey} className="space-y-4">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {size.name} • {size.width}×{size.height}
                  </span>
                </div>

                <div
                  className="flex justify-center p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-600"
                  style={{ backgroundColor: context.backgroundColor }}
                >
                  {context.id === "browser" && (
                    <BrowserTabPreview faviconUrl={url!} size={size.width} />
                  )}
                  {context.id === "bookmark" && (
                    <BookmarkPreview faviconUrl={url!} size={size.width} />
                  )}
                  {context.id === "desktop" && (
                    <DesktopIconPreview faviconUrl={url!} size={size.width} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Size Information */}
        <div className="p-6 bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-950/20 dark:to-accent-950/20 rounded-2xl border border-brand-200 dark:border-brand-800">
          <h5 className="text-sm font-semibold text-brand-900 dark:text-brand-100 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Size Recommendations
          </h5>
          <div className="text-sm text-brand-800 dark:text-brand-200 space-y-2">
            {context.id === "browser" && (
              <>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>
                  16×16px: Standard browser favicon
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>
                  32×32px: High-DPI browser displays
                </p>
              </>
            )}
            {context.id === "bookmark" && (
              <>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  16×16px: Basic bookmark icon
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  32×32px: Standard bookmark bar
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  48×48px: Large bookmark displays
                </p>
              </>
            )}
            {context.id === "desktop" && (
              <>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-success-500 rounded-full mr-3"></span>
                  64×64px: Small desktop icons
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-success-500 rounded-full mr-3"></span>
                  128×128px: Standard desktop icons
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-success-500 rounded-full mr-3"></span>
                  192×192px: Android home screen
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-success-500 rounded-full mr-3"></span>
                  512×512px: iOS/high-res displays
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 animate-fade-in-up ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {contexts.map((context) => (
            <Button
              key={context.id}
              variant={activeTab === context.id ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setActiveTab(context.id);
                onContextChange?.(context.id);
              }}
              className="text-sm"
            >
              {context.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-medium overflow-hidden">
        <div className="p-8">
          {contexts.map((context) => (
            <div
              key={context.id}
              className={`${activeTab === context.id ? "block" : "hidden"}`}
            >
              <PreviewGrid context={context} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
