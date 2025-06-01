import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";

export async function GET(_request: NextRequest) {
  try {
    const relationshipService = serviceFactory.getRelationshipService();
    const orphanedEntities = await relationshipService.findOrphanedEntities();

    return NextResponse.json({
      success: true,
      ...orphanedEntities,
    });
  } catch (error) {
    console.error("Error finding orphaned entities:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to find orphaned entities",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
