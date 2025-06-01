import { NextRequest, NextResponse } from "next/server";

/**
 * Download endpoint for individual favicon files
 * Supports downloading individual favicons by providing base64 data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { faviconData, fileName, format } = body;

    if (!faviconData || !fileName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing faviconData or fileName",
        },
        { status: 400 },
      );
    }

    // Parse base64 data
    let buffer: Buffer;
    try {
      // Remove data URL prefix if present
      const base64Data = faviconData.replace(/^data:image\/[a-z]+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid base64 data",
        },
        { status: 400 },
      );
    }

    // Determine content type
    let contentType = "application/octet-stream";
    if (format === "png") {
      contentType = "image/png";
    } else if (format === "webp") {
      contentType = "image/webp";
    } else if (format === "jpeg") {
      contentType = "image/jpeg";
    } else if (format === "ico") {
      contentType = "image/x-icon";
    }

    // Create response with file
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });

    return response;
  } catch (error) {
    console.error("Favicon download error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process download request",
      },
      { status: 500 },
    );
  }
}

/**
 * Get favicon metadata
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "metadata") {
    return NextResponse.json({
      supportedFormats: ["png", "webp", "jpeg", "ico"],
      maxFileSize: "10MB",
      supportedSizes: [16, 32, 48, 64, 96, 128, 180, 192, 512],
      features: [
        "Individual file download",
        "ZIP package download",
        "Custom background colors",
        "Padding options",
        "Quality controls",
        "Web app manifest generation",
      ],
    });
  }

  return NextResponse.json({
    status: "healthy",
    service: "favicon-download",
    endpoints: ["POST /download", "GET /download?action=metadata"],
    usage: "POST with faviconData (base64), fileName, and format",
  });
}
