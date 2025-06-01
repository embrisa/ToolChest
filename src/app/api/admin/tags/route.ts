import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";
import { AdminTagsSortOptions, AdminTagsFilters } from "@/types/admin/tag";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse sort options
    const sortOptions: AdminTagsSortOptions = {
      field:
        (searchParams.get("sortField") as AdminTagsSortOptions["field"]) ||
        "name",
      direction: (searchParams.get("sortDirection") as "asc" | "desc") || "asc",
    };

    // Parse filters
    const filters: AdminTagsFilters = {};

    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    const hasTools = searchParams.get("hasTools");
    if (hasTools !== null) {
      filters.hasTools = hasTools === "true";
    }

    const adminTagService = serviceFactory.getAdminTagService();
    const tags = await adminTagService.getAllTagsForAdmin(sortOptions, filters);

    return NextResponse.json({
      success: true,
      tags,
      count: tags.length,
    });
  } catch (error) {
    console.error("Error fetching admin tags:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tags",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const adminTagService = serviceFactory.getAdminTagService();

    // Validate the form data
    const validationErrors = await adminTagService.validateTagData(body);
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

    // Create the tag
    const tag = await adminTagService.createTag(body);

    return NextResponse.json(
      {
        success: true,
        message: "Tag created successfully",
        tag,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating tag:", error);

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
        message: "Failed to create tag",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
