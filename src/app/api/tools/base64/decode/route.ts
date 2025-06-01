import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Request validation schema
const DecodeRequestSchema = z.object({
  data: z.string(),
  variant: z.enum(["standard", "url-safe"]).default("standard"),
  outputType: z.enum(["text", "file"]).default("text"),
});

// File processing validation
const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB of Base64 data

/**
 * Server-side Base64 decoding endpoint
 * Used as fallback for large files or when client-side processing fails
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      return await handleFileDecoding(request);
    }

    // Handle JSON request (text decoding)
    if (contentType.includes("application/json")) {
      return await handleTextDecoding(request);
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
    console.error("Base64 decoding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during decoding",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle text decoding from JSON request
 */
async function handleTextDecoding(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, variant, outputType } = DecodeRequestSchema.parse(body);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "No Base64 data provided for decoding",
        },
        { status: 400 },
      );
    }

    // Check input size
    if (data.length > MAX_INPUT_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Input too large. Maximum size is ${MAX_INPUT_SIZE / (1024 * 1024)}MB.`,
        },
        { status: 413 },
      );
    }

    const startTime = Date.now();

    try {
      let cleanBase64 = data.trim().replace(/\s/g, "");

      // Handle URL-safe variant
      if (variant === "url-safe") {
        cleanBase64 = cleanBase64.replace(/-/g, "+").replace(/_/g, "/");
        // Add padding if needed
        while (cleanBase64.length % 4) {
          cleanBase64 += "=";
        }
      }

      // Validate Base64 format
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid Base64 format. Please check your input for invalid characters.",
          },
          { status: 400 },
        );
      }

      // Decode Base64
      const buffer = Buffer.from(cleanBase64, "base64");

      if (outputType === "text") {
        // Try to decode as UTF-8 text
        const decoder = new TextDecoder("utf-8", { fatal: true });
        const text = decoder.decode(buffer);

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
          success: true,
          data: text,
          originalSize: data.length,
          outputSize: text.length,
          processingTime,
          dataType: "text",
        });
      } else {
        // Return as binary data (base64 encoded for JSON response)
        const processingTime = Date.now() - startTime;

        return NextResponse.json({
          success: true,
          data: buffer.toString("base64"),
          originalSize: data.length,
          outputSize: buffer.length,
          processingTime,
          dataType: "binary",
          mimeType: "application/octet-stream",
        });
      }
    } catch (decodeError) {
      if (
        decodeError instanceof TypeError &&
        decodeError.message.includes("Invalid character")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid UTF-8 sequence. Data may be binary - try file output mode.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to decode Base64 data",
        },
        { status: 400 },
      );
    }
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

    console.error("Text decoding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to decode text",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle file decoding from multipart form data
 */
async function handleFileDecoding(request: NextRequest) {
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
    if (file.size > MAX_INPUT_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_INPUT_SIZE / (1024 * 1024)}MB.`,
        },
        { status: 413 },
      );
    }

    const startTime = Date.now();

    // Read file content
    const fileContent = await file.text();
    let cleanBase64 = fileContent.trim().replace(/\s/g, "");

    // Handle URL-safe variant
    if (variant === "url-safe") {
      cleanBase64 = cleanBase64.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding if needed
      while (cleanBase64.length % 4) {
        cleanBase64 += "=";
      }
    }

    // Validate Base64 format
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Base64 format in file",
        },
        { status: 400 },
      );
    }

    // Decode Base64
    const buffer = Buffer.from(cleanBase64, "base64");

    const processingTime = Date.now() - startTime;

    // Try to determine if it's text or binary
    let dataType = "binary";
    let decodedText = null;

    try {
      const decoder = new TextDecoder("utf-8", { fatal: true });
      decodedText = decoder.decode(buffer);
      dataType = "text";
    } catch {
      // It's binary data
    }

    return NextResponse.json({
      success: true,
      data: dataType === "text" ? decodedText : buffer.toString("base64"),
      originalSize: file.size,
      outputSize: buffer.length,
      fileName: file.name,
      processingTime,
      dataType,
      mimeType: dataType === "text" ? "text/plain" : "application/octet-stream",
      warnings:
        file.size > 5 * 1024 * 1024
          ? ["Large file processed on server"]
          : undefined,
    });
  } catch (error) {
    console.error("File decoding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to decode file",
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
    service: "Base64 Decoder",
    status: "healthy",
    timestamp: new Date().toISOString(),
    maxInputSize: `${MAX_INPUT_SIZE / (1024 * 1024)}MB`,
    supportedOutputTypes: ["text", "file"],
  });
}
