import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";
import { BulkTagOperation } from "@/types/admin/relationship";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation: operationData } = body;

    if (!operationData) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing operation data",
        },
        { status: 400 },
      );
    }

    const { type, toolIds, tagIds, requiresConfirmation } =
      operationData as BulkTagOperation;

    if (!type || !toolIds || !tagIds) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: type, toolIds, tagIds",
        },
        { status: 400 },
      );
    }

    const relationshipService = serviceFactory.getRelationshipService();
    const operation: BulkTagOperation = {
      type,
      toolIds,
      tagIds,
      requiresConfirmation: requiresConfirmation || false,
      estimatedChanges: toolIds.length * tagIds.length,
    };

    const result = await relationshipService.executeBulkOperation(operation);

    return NextResponse.json({
      message: "Bulk operation executed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error executing bulk operation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to execute bulk operation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
