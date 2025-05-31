import { NextRequest, NextResponse } from 'next/server';
import { serviceFactory } from '@/services/core/serviceFactory';

export async function POST(_request: NextRequest) {
    try {
        const relationshipService = serviceFactory.getRelationshipService();
        const result = await relationshipService.autoResolveOrphans();

        return NextResponse.json({
            success: true,
            message: 'Auto-resolve operation completed',
            result
        });
    } catch (error) {
        console.error('Error auto-resolving orphans:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to auto-resolve orphans',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 