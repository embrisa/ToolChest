import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Request validation schema
const EncodeRequestSchema = z.object({
  text: z.string().optional(),
  variant: z.enum(["standard", "url-safe"]).default("standard"),
});

// File upload validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "text/plain",
  "application/json",
  "text/csv",
  "text/html",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

/**
 * Server-side Base64 encoding endpoint
 * Used as fallback for large files or when client-side processing fails
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      return await handleFileEncoding(request);
    }

    // Handle JSON request (text encoding)
    if (contentType.includes("application/json")) {
      return await handleTextEncoding(request);
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unsupported content type. Use application/json for text or multipart/form-data for files.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Base64 encoding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during encoding",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle text encoding from JSON request
 */
async function handleTextEncoding(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, variant } = EncodeRequestSchema.parse(body);

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "No text provided for encoding",
        },
        { status: 400 },
      );
    }

    // Check text size (1MB limit for text)
    if (text.length > 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "Text too large. Maximum size is 1MB.",
        },
        { status: 413 },
      );
    }

    const startTime = Date.now();

    // Encode text to Base64
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let base64 = Buffer.from(bytes).toString("base64");

    // Apply URL-safe variant if requested
    if (variant === "url-safe") {
      base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: base64,
      originalSize: text.length,
      outputSize: base64.length,
      processingTime,
      warnings:
        text.length > 100000 ? ["Large text input processed"] : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Text encoding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to encode text",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle file encoding from multipart form data
 */
async function handleFileEncoding(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const variant = (formData.get("variant") as string) || "standard";

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        },
        { status: 413 },
      );
    }

    // Validate file type
    if (
      !ALLOWED_FILE_TYPES.includes(file.type) &&
      file.type !== "application/octet-stream"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}`,
        },
        { status: 400 },
      );
    }

    const startTime = Date.now();

    // Read file data
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Encode to Base64
    let base64 = Buffer.from(bytes).toString("base64");

    // Apply URL-safe variant if requested
    if (variant === "url-safe") {
      base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: base64,
      originalSize: file.size,
      outputSize: base64.length,
      fileName: file.name,
      fileType: file.type,
      processingTime,
      warnings:
        file.size > 5 * 1024 * 1024
          ? ["Large file processed on server"]
          : undefined,
    });
  } catch (error) {
    console.error("File encoding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to encode file",
      },
      { status: 500 },
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    service: "Base64 Encoder",
    status: "healthy",
    timestamp: new Date().toISOString(),
    maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    supportedTypes: ALLOWED_FILE_TYPES,
  });
}
