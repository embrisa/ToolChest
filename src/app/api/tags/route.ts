import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/services/core/serviceFactory";
import { ToolService } from "@/services/tools";
import { ApiResponse } from "@/types/api/common";
import { TagDTO } from "@/types/tools/tool";

export async function GET(
  _request: NextRequest,
): Promise<NextResponse<ApiResponse<TagDTO[]>>> {
  try {
    const prisma = ServiceFactory.getInstance().getPrisma();
    const toolService = new ToolService(prisma);
    const tags = await toolService.getAllTags();

    return NextResponse.json({
      success: true,
      data: tags,
      message: "Tags retrieved successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching tags:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tags",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
