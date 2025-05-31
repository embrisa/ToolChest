import { NextRequest, NextResponse } from 'next/server';
import { serviceFactory } from '@/services/core/serviceFactory';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const adminTagService = serviceFactory.getAdminTagService();
        const tag = await adminTagService.getTagByIdForAdmin(id);

        if (!tag) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Tag not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            tag
        });
    } catch (error) {
        console.error('Error fetching tag:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch tag',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const adminTagService = serviceFactory.getAdminTagService();

        // Validate the form data
        const validationErrors = await adminTagService.validateTagData(body);
        if (Object.keys(validationErrors).length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                },
                { status: 400 }
            );
        }

        // Update the tag
        const tag = await adminTagService.updateTag({ id, ...body });

        return NextResponse.json({
            success: true,
            message: 'Tag updated successfully',
            tag
        });
    } catch (error) {
        console.error('Error updating tag:', error);

        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Tag not found'
                },
                { status: 404 }
            );
        }

        if (error instanceof Error && error.message.includes('already in use')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: { slug: error.message }
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update tag',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const adminTagService = serviceFactory.getAdminTagService();
        await adminTagService.deleteTag(id);

        return NextResponse.json({
            success: true,
            message: 'Tag deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting tag:', error);

        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Tag not found'
                },
                { status: 404 }
            );
        }

        if (error instanceof Error && error.message.includes('assigned to')) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete tag',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 