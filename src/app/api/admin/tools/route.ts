import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";
import { AdminToolsSortOptions, AdminToolsFilters } from "@/types/admin/tool";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse sort options
    const sortOptions: AdminToolsSortOptions = {
      field:
        (searchParams.get("sortField") as AdminToolsSortOptions["field"]) ||
        "displayOrder",
      direction: (searchParams.get("sortDirection") as "asc" | "desc") || "asc",
    };

    // Parse filters
    const filters: AdminToolsFilters = {};

    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    const isActive = searchParams.get("isActive");
    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }

    const tagIds = searchParams.get("tagIds");
    if (tagIds) {
      filters.tagIds = tagIds.split(",").filter(Boolean);
    }

    const adminToolService = serviceFactory.getAdminToolService();
    const tools = await adminToolService.getAllToolsForAdmin(
      sortOptions,
      filters,
    );

    return NextResponse.json({
      success: true,
      tools,
      count: tools.length,
    });
  } catch (error) {
    console.error("Error fetching admin tools:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tools",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const adminToolService = serviceFactory.getAdminToolService();

    // Validate the form data
    const validationErrors = await adminToolService.validateToolData(body);
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 },
      );
    }

    // Create the tool
    const tool = await adminToolService.createTool(body);

    return NextResponse.json(
      {
        success: true,
        message: "Tool created successfully",
        tool,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating tool:", error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes("already in use")) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: { slug: error.message },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create tool",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
