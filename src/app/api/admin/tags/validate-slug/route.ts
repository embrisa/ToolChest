import { NextRequest, NextResponse } from 'next/server';
import { serviceFactory } from '@/services/core/serviceFactory';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const excludeId = searchParams.get('excludeId');

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Slug parameter is required'
                },
                { status: 400 }
            );
        }

        const adminTagService = serviceFactory.getAdminTagService();
        const isAvailable = await adminTagService.checkSlugAvailable(slug, excludeId || undefined);

        return NextResponse.json({
            success: true,
            slug,
            available: isAvailable,
            message: isAvailable ? 'Slug is available' : 'Slug is already in use'
        });
    } catch (error) {
        console.error('Error validating tag slug:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to validate slug',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Name parameter is required'
                },
                { status: 400 }
            );
        }

        const adminTagService = serviceFactory.getAdminTagService();
        const generatedSlug = adminTagService.generateSlugFromName(name);

        return NextResponse.json({
            success: true,
            name,
            slug: generatedSlug
        });
    } catch (error) {
        console.error('Error generating tag slug:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to generate slug',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 