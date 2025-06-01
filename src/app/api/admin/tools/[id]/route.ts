import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const adminToolService = serviceFactory.getAdminToolService();
    const tool = await adminToolService.getToolByIdForAdmin(id);

    if (!tool) {
      return NextResponse.json(
        {
          success: false,
          message: "Tool not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      tool,
    });
  } catch (error) {
    console.error("Error fetching tool:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tool",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // Update the tool
    const tool = await adminToolService.updateTool({ ...body, id });

    return NextResponse.json({
      success: true,
      message: "Tool updated successfully",
      tool,
    });
  } catch (error) {
    console.error("Error updating tool:", error);

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

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          success: false,
          message: "Tool not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update tool",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const adminToolService = serviceFactory.getAdminToolService();
    await adminToolService.deleteTool(id);

    return NextResponse.json({
      success: true,
      message: "Tool deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tool:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          success: false,
          message: "Tool not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete tool",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
