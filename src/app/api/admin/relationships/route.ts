import { NextRequest, NextResponse } from 'next/server';
import { serviceFactory } from '@/services/core/serviceFactory';
import { RelationshipFilters, RelationshipSortOptions, BulkTagOperation } from '@/types/admin/relationship';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse filters from query parameters
        const filters: RelationshipFilters = {
            search: searchParams.get('search') || undefined,
            toolIds: searchParams.get('toolIds')?.split(',').filter(Boolean) || undefined,
            tagIds: searchParams.get('tagIds')?.split(',').filter(Boolean) || undefined,
            toolIsActive: searchParams.get('toolIsActive') === 'true' ? true :
                searchParams.get('toolIsActive') === 'false' ? false : undefined,
        };

        // Parse sort options
        const sortOptions: RelationshipSortOptions = {
            field: (searchParams.get('sortField') as RelationshipSortOptions['field']) || 'toolName',
            direction: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc'
        };

        const relationshipService = serviceFactory.getRelationshipService();
        const relationships = await relationshipService.getAllRelationships(filters, sortOptions);

        return NextResponse.json({
            success: true,
            relationships,
            count: relationships.length
        });
    } catch (error) {
        console.error('Error fetching relationships:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch relationships',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, toolIds, tagIds } = body as BulkTagOperation;

        if (!type || !toolIds || !tagIds) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required fields: type, toolIds, tagIds'
                },
                { status: 400 }
            );
        }

        const relationshipService = serviceFactory.getRelationshipService();
        const operation: BulkTagOperation = {
            type,
            toolIds,
            tagIds,
            requiresConfirmation: false,
            estimatedChanges: toolIds.length * tagIds.length
        };

        const result = await relationshipService.executeBulkOperation(operation);

        return NextResponse.json({
            success: true,
            message: 'Bulk operation completed successfully',
            result
        });
    } catch (error) {
        console.error('Error executing bulk operation:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to execute bulk operation',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 