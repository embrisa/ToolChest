import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";

export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params;
    const toolService = serviceFactory.getToolService();
    await toolService.recordToolUsage(slug);

    return NextResponse.json({
      success: true,
      message: "Usage recorded successfully",
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
