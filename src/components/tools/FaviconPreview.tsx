'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import {
    FaviconSizeKey,
    FAVICON_SIZES,
    PREVIEW_CONTEXTS,
    FaviconPreviewContext
} from '@/types/tools/faviconGenerator';

export interface FaviconPreviewProps {
    previewUrls: { [key in FaviconSizeKey]?: string };
    selectedContext?: string;
    onContextChange?: (context: string) => void;
    title?: string;
    className?: string;
}

export function FaviconPreview({
    previewUrls,
    selectedContext = 'all',
    onContextChange,
    title = 'Favicon Preview',
    className = ''
}: FaviconPreviewProps) {
    const [activeTab, setActiveTab] = useState('browser');

    const contexts = Object.values(PREVIEW_CONTEXTS);
    const hasPreviewData = Object.keys(previewUrls).length > 0;

    if (!hasPreviewData) {
        return null;
    }

    const BrowserTabPreview = ({ faviconUrl, size }: { faviconUrl: string; size: number }) => (
        <div className="bg-gray-100 rounded-t-lg p-2 border-l border-r border-t max-w-xs">
            <div className="flex items-center space-x-2 bg-white rounded p-2 shadow-sm">
                <img
                    src={faviconUrl}
                    alt="Favicon in browser tab"
                    className="w-4 h-4 flex-shrink-0"
                    style={{ imageRendering: size <= 32 ? 'pixelated' : 'auto' }}
                />
                <span className="text-sm text-gray-700 truncate">ToolChest - Your site</span>
                <button className="text-gray-400 hover:text-gray-600 text-xs ml-auto">×</button>
            </div>
        </div>
    );

    const BookmarkPreview = ({ faviconUrl, size }: { faviconUrl: string; size: number }) => (
        <div className="bg-white border rounded-lg p-3 shadow-sm max-w-xs">
            <div className="flex items-center space-x-3">
                <img
                    src={faviconUrl}
                    alt="Favicon in bookmark"
                    className="w-5 h-5 flex-shrink-0"
                    style={{ imageRendering: size <= 32 ? 'pixelated' : 'auto' }}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">ToolChest</p>
                    <p className="text-xs text-gray-500 truncate">toolchest.app</p>
                </div>
                <div className="text-gray-400 text-xs">⭐</div>
            </div>
        </div>
    );

    const DesktopIconPreview = ({ faviconUrl, size }: { faviconUrl: string; size: number }) => (
        <div className="flex flex-col items-center space-y-2 p-4">
            <div className="relative">
                <img
                    src={faviconUrl}
                    alt="Favicon as desktop icon"
                    className="w-16 h-16 rounded-lg shadow-lg"
                    style={{
                        imageRendering: size <= 64 ? 'pixelated' : 'auto',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs">↗</span>
                </div>
            </div>
            <span className="text-xs text-gray-600 text-center max-w-20 truncate">ToolChest</span>
        </div>
    );

    const PreviewGrid = ({ context }: { context: FaviconPreviewContext }) => {
        const relevantSizes = Object.entries(previewUrls).filter(([sizeKey, _url]) => {
            const size = FAVICON_SIZES[sizeKey as FaviconSizeKey];
            if (context.id === 'browser') return size.width <= 32;
            if (context.id === 'bookmark') return size.width <= 48;
            if (context.id === 'desktop') return size.width >= 64;
            return true;
        });

        if (relevantSizes.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <p>No suitable sizes generated for {context.name}</p>
                    <p className="text-sm mt-1">
                        {context.id === 'browser' && 'Generate 16px or 32px sizes for browser tabs'}
                        {context.id === 'bookmark' && 'Generate 16px, 32px, or 48px sizes for bookmarks'}
                        {context.id === 'desktop' && 'Generate 64px+ sizes for desktop icons'}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h4 className="font-medium text-gray-900">{context.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{context.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relevantSizes.slice(0, 4).map(([sizeKey, url]) => {
                        const size = FAVICON_SIZES[sizeKey as FaviconSizeKey];

                        return (
                            <div key={sizeKey} className="space-y-3">
                                <div className="text-center">
                                    <span className="text-sm font-medium text-gray-700">
                                        {size.name} ({size.width}×{size.height})
                                    </span>
                                </div>

                                <div
                                    className="flex justify-center p-4 rounded-lg"
                                    style={{ backgroundColor: context.backgroundColor }}
                                >
                                    {context.id === 'browser' && (
                                        <BrowserTabPreview faviconUrl={url!} size={size.width} />
                                    )}
                                    {context.id === 'bookmark' && (
                                        <BookmarkPreview faviconUrl={url!} size={size.width} />
                                    )}
                                    {context.id === 'desktop' && (
                                        <DesktopIconPreview faviconUrl={url!} size={size.width} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Size Information */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Size Recommendations</h5>
                    <div className="text-xs text-blue-800 space-y-1">
                        {context.id === 'browser' && (
                            <>
                                <p>• 16×16px: Standard browser favicon</p>
                                <p>• 32×32px: High-DPI browser displays</p>
                            </>
                        )}
                        {context.id === 'bookmark' && (
                            <>
                                <p>• 16×16px: Basic bookmark icon</p>
                                <p>• 32×32px: Standard bookmark bar</p>
                                <p>• 48×48px: Large bookmark displays</p>
                            </>
                        )}
                        {context.id === 'desktop' && (
                            <>
                                <p>• 64×64px: Small desktop icons</p>
                                <p>• 128×128px: Standard desktop icons</p>
                                <p>• 192×192px: Android home screen</p>
                                <p>• 512×512px: iOS/high-res displays</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="flex space-x-1">
                    {contexts.map((context) => (
                        <Button
                            key={context.id}
                            variant={activeTab === context.id ? 'primary' : 'outline'}
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

            <div className="border rounded-lg p-6 bg-white">
                {selectedContext === 'all' || !selectedContext ? (
                    <div className="space-y-8">
                        {contexts.map((context) => (
                            <div key={context.id}>
                                <PreviewGrid context={context} />
                                {context.id !== contexts[contexts.length - 1].id && (
                                    <hr className="mt-8 border-gray-200" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <PreviewGrid context={contexts.find(c => c.id === activeTab) || contexts[0]} />
                )}
            </div>

            {/* Context Information */}
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Preview Information:</p>
                <p>• Browser tabs typically use 16×16 or 32×32 pixel favicons</p>
                <p>• Bookmark bars may use slightly larger icons up to 48×48</p>
                <p>• Desktop shortcuts and app icons use larger sizes (64×64 and above)</p>
                <p>• The preview simulates how your favicon will appear in each context</p>
            </div>
        </div>
    );
} 