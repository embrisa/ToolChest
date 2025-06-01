import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, toolIds, data } = body;

    if (
      !operation ||
      !toolIds ||
      !Array.isArray(toolIds) ||
      toolIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: operation, toolIds (array)",
        },
        { status: 400 },
      );
    }

    const adminToolService = serviceFactory.getAdminToolService();
    const errors: string[] = [];
    let successCount = 0;

    switch (operation) {
      case "activate":
        for (const toolId of toolIds) {
          try {
            const tool = await adminToolService.getToolByIdForAdmin(toolId);
            if (tool) {
              await adminToolService.updateTool({
                id: toolId,
                name: tool.name,
                slug: tool.slug,
                description: tool.description || undefined,
                iconClass: tool.iconClass || undefined,
                displayOrder: tool.displayOrder,
                isActive: true,
                tagIds: tool.tags?.map((t) => t.id) || [],
              });
              successCount++;
            }
          } catch (error) {
            errors.push(
              `Tool ${toolId}: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
        break;

      case "deactivate":
        for (const toolId of toolIds) {
          try {
            const tool = await adminToolService.getToolByIdForAdmin(toolId);
            if (tool) {
              await adminToolService.updateTool({
                id: toolId,
                name: tool.name,
                slug: tool.slug,
                description: tool.description || undefined,
                iconClass: tool.iconClass || undefined,
                displayOrder: tool.displayOrder,
                isActive: false,
                tagIds: tool.tags?.map((t) => t.id) || [],
              });
              successCount++;
            }
          } catch (error) {
            errors.push(
              `Tool ${toolId}: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
        break;

      case "delete":
        for (const toolId of toolIds) {
          try {
            await adminToolService.deleteTool(toolId);
            successCount++;
          } catch (error) {
            errors.push(
              `Tool ${toolId}: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
        break;

      case "update_display_order":
        if (!data || !data.displayOrders) {
          return NextResponse.json(
            {
              success: false,
              message: "Display orders data is required for this operation",
            },
            { status: 400 },
          );
        }

        for (const toolId of toolIds) {
          try {
            const displayOrder = data.displayOrders[toolId];
            if (displayOrder !== undefined) {
              const tool = await adminToolService.getToolByIdForAdmin(toolId);
              if (tool) {
                await adminToolService.updateTool({
                  id: toolId,
                  name: tool.name,
                  slug: tool.slug,
                  description: tool.description || undefined,
                  iconClass: tool.iconClass || undefined,
                  displayOrder: displayOrder,
                  isActive: tool.isActive,
                  tagIds: tool.tags?.map((t) => t.id) || [],
                });
                successCount++;
              }
            }
          } catch (error) {
            errors.push(
              `Tool ${toolId}: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: `Unknown operation: ${operation}. Supported operations: activate, deactivate, delete, update_display_order`,
          },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Bulk operation completed: ${successCount} successful, ${errors.length} failed`,
      results: {
        operation,
        totalRequested: toolIds.length,
        successCount,
        errorCount: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform bulk operation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
