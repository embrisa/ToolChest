import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ToolDTO } from '@/types/tools/tool';
import { cn } from '@/utils';

export interface ToolCardProps {
    tool: ToolDTO;
    className?: string;
    showUsageCount?: boolean;
    priority?: boolean;
}

export function ToolCard({
    tool,
    className,
    showUsageCount = false,
    priority: _priority = false
}: ToolCardProps) {
    const toolPath = `/tools/${tool.slug}`;

    return (
        <Card
            className={cn(
                'group hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-blue-300',
                'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                className
            )}
            variant="outlined"
        >
            <Link
                href={toolPath}
                className="block h-full focus:outline-none"
                aria-describedby={`tool-description-${tool.id}`}
            >
                <CardHeader className="pb-3">
                    <CardTitle
                        as="h3"
                        className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {tool.iconClass && (
                                <span
                                    className={cn(tool.iconClass, "text-xl text-blue-600")}
                                    aria-hidden="true"
                                />
                            )}
                            <span>{tool.name}</span>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {tool.description && (
                        <p
                            id={`tool-description-${tool.id}`}
                            className="text-sm text-gray-600 mb-3 line-clamp-2"
                        >
                            {tool.description}
                        </p>
                    )}

                    {tool.tags && tool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3" role="list" aria-label="Tool categories">
                            {tool.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag.id}
                                    role="listitem"
                                    className={cn(
                                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                        tag.color
                                            ? `bg-${tag.color}-100 text-${tag.color}-800`
                                            : "bg-gray-100 text-gray-800"
                                    )}
                                    style={tag.color ? {
                                        backgroundColor: `${tag.color}20`,
                                        color: tag.color
                                    } : undefined}
                                >
                                    {tag.name}
                                </span>
                            ))}
                            {tool.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    +{tool.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )}

                    {showUsageCount && tool.usageCount !== undefined && (
                        <div className="text-xs text-gray-500 mt-2">
                            Used {tool.usageCount} times
                        </div>
                    )}
                </CardContent>
            </Link>
        </Card>
    );
} 