import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/services/core/serviceFactory";
import { ToolService } from "@/services/tools";
import { ApiResponse } from "@/types/api/common";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const { slug } = await context.params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tool slug",
          message: "Tool slug is required and must be a string",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const prisma = ServiceFactory.getInstance().getPrisma();
    const toolService = new ToolService(prisma);

    // Record the tool usage
    await toolService.recordToolUsage(slug);

    return NextResponse.json({
      success: true,
      data: { success: true },
      message: "Tool usage recorded successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error recording tool usage:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to record tool usage",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
