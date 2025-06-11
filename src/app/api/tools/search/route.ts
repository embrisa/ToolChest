import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/services/core/serviceFactory";
import { ToolService } from "@/services/tools";
import { ApiResponse } from "@/types/api/common";
import { ToolDTO } from "@/types/tools/tool";
import { extractLocaleFromRequest } from "@/utils/locale";

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ToolDTO[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const locale = extractLocaleFromRequest(request);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Empty search query",
        timestamp: new Date().toISOString(),
      });
    }

    // Validate search query length
    if (query.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query too long",
          message: "Search query must be 100 characters or less",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const prisma = ServiceFactory.getInstance().getPrisma();
    const toolService = new ToolService(prisma);
    const tools = await toolService.searchTools(query.trim(), locale);

    return NextResponse.json({
      success: true,
      data: tools,
      message: `Found ${tools.length} tools matching "${query}"`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error searching tools:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search tools",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
