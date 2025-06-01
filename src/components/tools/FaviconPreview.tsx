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
    <div className="bg-neutral-50 rounded-t-xl p-4 border-b-0 max-w-sm shadow-soft">
      <div className="flex items-center gap-3 bg-neutral-25 rounded-lg p-3 shadow-soft border border-neutral-200">
        <img
          src={faviconUrl}
          alt="Favicon in browser tab"
          className="w-4 h-4 flex-shrink-0"
          style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
        />
        <span className="text-sm text-foreground truncate font-medium">
          tool-chest - Your Site
        </span>
        <button
          className="text-neutral-400 hover:text-neutral-600 text-sm ml-auto focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded p-1"
          aria-label="Close tab"
        >
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
    <div className="bg-neutral-50 rounded-xl p-4 shadow-soft max-w-sm hover:shadow-medium transition-all duration-200 border border-neutral-200">
      <div className="flex items-center gap-3">
        <img
          src={faviconUrl}
          alt="Favicon in bookmark"
          className="w-5 h-5 flex-shrink-0"
          style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            tool-chest
          </p>
          <p className="text-xs text-foreground-secondary truncate">
            tool-chest.com
          </p>
        </div>
        <div className="text-amber-500 text-sm" aria-label="Bookmarked">⭐</div>
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
    <div className="flex flex-col items-center gap-3 p-6">
      <div className="relative group">
        <img
          src={faviconUrl}
          alt="Favicon as desktop icon"
          className="w-16 h-16 rounded-2xl shadow-medium hover:shadow-large transition-all duration-200 hover:scale-105"
          style={{
            imageRendering: size <= 64 ? "pixelated" : "auto",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
          }}
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-neutral-25 flex items-center justify-center shadow-soft">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
      <span className="text-xs text-foreground-secondary text-center max-w-20 truncate font-medium">
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
        <div className="text-center py-12 space-y-6">
          <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center shadow-soft">
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <div className="space-y-3">
            <p className="text-foreground-secondary font-medium text-body">
              No suitable sizes generated for {context.name}
            </p>
            <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
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
        <div className="text-center space-y-3">
          <h4 className="text-title text-xl font-semibold text-foreground">
            {context.name}
          </h4>
          <p className="text-body text-foreground-secondary max-w-2xl mx-auto">
            {context.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {relevantSizes.slice(0, 4).map(([sizeKey, url]) => {
            const size = FAVICON_SIZES[sizeKey as FaviconSizeKey];

            return (
              <div key={sizeKey} className="space-y-4">
                <div className="text-center">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-neutral-100 border border-neutral-200 text-sm font-medium text-foreground shadow-soft">
                    {size.name} • {size.width}×{size.height}
                  </span>
                </div>

                <div
                  className="flex justify-center p-6 rounded-2xl border border-neutral-200 transition-all duration-200 hover:border-neutral-300 hover:shadow-soft"
                  style={{ backgroundColor: context.backgroundColor || '#f8f9fa' }}
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
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 shadow-soft">
          <h5 className="text-body font-semibold text-emerald-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-3 text-emerald-600"
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
            Size Recommendations for {context.name}
          </h5>
          <div className="text-sm text-emerald-800 space-y-3">
            {context.id === "browser" && (
              <>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>16×16px:</strong> Standard browser favicon for tabs</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>32×32px:</strong> High-DPI browser displays and shortcuts</span>
                </p>
              </>
            )}
            {context.id === "bookmark" && (
              <>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-sky-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>16×16px:</strong> Basic bookmark icon in toolbars</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-sky-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>32×32px:</strong> Standard bookmark bar display</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-sky-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>48×48px:</strong> Large bookmark grid views</span>
                </p>
              </>
            )}
            {context.id === "desktop" && (
              <>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>64×64px:</strong> Small desktop icons and taskbar</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>128×128px:</strong> Standard desktop icons</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>192×192px:</strong> Android home screen icons</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span><strong>512×512px:</strong> iOS and high-resolution displays</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-8 animate-fade-in-up ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-title text-xl font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-foreground-secondary">
            Preview your favicons in realistic browser contexts
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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
              aria-pressed={activeTab === context.id}
            >
              {context.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-neutral-25 rounded-2xl border border-neutral-200 shadow-soft overflow-hidden">
        <div className="p-8">
          {contexts.map((context) => (
            <div
              key={context.id}
              className={`${activeTab === context.id ? "block" : "hidden"}`}
              role="tabpanel"
              aria-labelledby={`tab-${context.id}`}
            >
              <PreviewGrid context={context} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
