import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse optional filters
    const toolIds = searchParams.get("toolIds")?.split(",").filter(Boolean);
    const tagIds = searchParams.get("tagIds")?.split(",").filter(Boolean);

    const relationshipService = serviceFactory.getRelationshipService();
    const validationResult = await relationshipService.validateRelationships(
      toolIds,
      tagIds,
    );

    return NextResponse.json({
      success: true,
      ...validationResult,
    });
  } catch (error) {
    console.error("Error validating relationships:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to validate relationships",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
