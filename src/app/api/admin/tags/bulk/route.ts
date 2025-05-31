import { NextRequest, NextResponse } from 'next/server';
import { serviceFactory } from '@/services/core/serviceFactory';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { operation, tagIds, data } = body;

        if (!operation || !tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required fields: operation, tagIds (array)'
                },
                { status: 400 }
            );
        }

        const adminTagService = serviceFactory.getAdminTagService();
        const errors: string[] = [];
        let successCount = 0;

        switch (operation) {
            case 'delete':
                for (const tagId of tagIds) {
                    try {
                        // Check if tag can be deleted (no tools assigned)
                        const warning = await adminTagService.checkDeleteRelationshipWarnings(tagId);
                        if (warning && !warning.canProceed) {
                            errors.push(`Tag ${tagId}: ${warning.message}`);
                            continue;
                        }

                        await adminTagService.deleteTag(tagId);
                        successCount++;
                    } catch (error) {
                        errors.push(`Tag ${tagId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
                break;

            case 'update_colors':
                if (!data || !data.colors) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: 'Colors data is required for this operation'
                        },
                        { status: 400 }
                    );
                }

                for (const tagId of tagIds) {
                    try {
                        const newColor = data.colors[tagId];
                        if (newColor) {
                            const tag = await adminTagService.getTagByIdForAdmin(tagId);
                            if (tag) {
                                await adminTagService.updateTag({
                                    id: tagId,
                                    name: tag.name,
                                    slug: tag.slug,
                                    description: tag.description || undefined,
                                    color: newColor
                                });
                                successCount++;
                            }
                        }
                    } catch (error) {
                        errors.push(`Tag ${tagId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
                break;

            case 'generate_slugs':
                for (const tagId of tagIds) {
                    try {
                        const tag = await adminTagService.getTagByIdForAdmin(tagId);
                        if (tag) {
                            const newSlug = adminTagService.generateSlugFromName(tag.name);
                            const isAvailable = await adminTagService.checkSlugAvailable(newSlug, tagId);

                            if (isAvailable) {
                                await adminTagService.updateTag({
                                    id: tagId,
                                    name: tag.name,
                                    slug: newSlug,
                                    description: tag.description || undefined,
                                    color: tag.color || '#3B82F6'
                                });
                                successCount++;
                            } else {
                                errors.push(`Tag ${tagId}: Generated slug '${newSlug}' is already in use`);
                            }
                        }
                    } catch (error) {
                        errors.push(`Tag ${tagId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
                break;

            default:
                return NextResponse.json(
                    {
                        success: false,
                        message: `Unknown operation: ${operation}. Supported operations: delete, update_colors, generate_slugs`
                    },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: errors.length === 0,
            message: `Bulk operation completed: ${successCount} successful, ${errors.length} failed`,
            results: {
                operation,
                totalRequested: tagIds.length,
                successCount,
                errorCount: errors.length,
                errors
            }
        });
    } catch (error) {
        console.error('Error performing bulk tag operation:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to perform bulk operation',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 