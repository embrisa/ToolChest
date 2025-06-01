import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId") || undefined;

    const relationshipService = serviceFactory.getRelationshipService();
    const statistics = await relationshipService.getTagUsageStatistics(tagId);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error fetching tag usage statistics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tag usage statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
