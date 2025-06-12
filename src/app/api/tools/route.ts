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
    const tag = searchParams.get("tag");
    const popular = searchParams.get("popular");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const sortBy = searchParams.get("sortBy") || "displayOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Validation
    const limitNum = limit
      ? Math.max(1, Math.min(100, parseInt(limit, 10)))
      : undefined;
    const offsetNum = offset ? Math.max(0, parseInt(offset, 10)) : undefined;

    if (limit && isNaN(limitNum!)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid limit parameter",
          message: "Limit must be a number between 1 and 100",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    if (offset && isNaN(offsetNum!)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid offset parameter",
          message: "Offset must be a non-negative number",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const validSortFields = ["displayOrder", "name", "createdAt", "usageCount"];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid sortBy parameter",
          message: `sortBy must be one of: ${validSortFields.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    if (!["asc", "desc"].includes(sortOrder)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid sortOrder parameter",
          message: 'sortOrder must be either "asc" or "desc"',
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const prisma = ServiceFactory.getInstance().getPrisma();
    const toolService = new ToolService(prisma);

    let tools: ToolDTO[];
    let totalCount: number | undefined;

    if (popular === "true") {
      const popularLimit = limitNum || 6;
      tools = await toolService.getPopularTools(popularLimit, locale);
      totalCount = tools.length;
    } else if (tag) {
      tools = await toolService.getToolsByTag(tag, locale);
      totalCount = tools.length;
    } else {
      // Get all tools with optional pagination
      if (limitNum || offsetNum) {
        const result = await toolService.getAllToolsPaginated(
          {
            limit: limitNum,
            offset: offsetNum,
            sortBy: sortBy as
              | "displayOrder"
              | "name"
              | "createdAt"
              | "usageCount",
            sortOrder: sortOrder as "asc" | "desc",
          },
          locale,
        );
        tools = result.tools;
        totalCount = result.total;
      } else {
        tools = await toolService.getAllTools(locale);
        totalCount = tools.length;
      }
    }

    // Add cache headers for better performance
    const response = NextResponse.json({
      success: true,
      data: tools,
      meta: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        sortBy,
        sortOrder,
      },
      message: "Tools retrieved successfully",
      timestamp: new Date().toISOString(),
    });

    // Cache for 5 minutes for public data
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600",
    );

    return response;
  } catch (error) {
    console.error("Error fetching tools:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tools",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
