import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

// Request validation schema
const GenerateRequestSchema = z.object({
  text: z.string().optional(),
  algorithm: z.enum(["MD5", "SHA-1", "SHA-256", "SHA-512"]),
});

// File upload validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "text/plain",
  "application/json",
  "text/csv",
  "text/html",
  "text/xml",
  "application/xml",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/zip",
  "application/octet-stream",
];

// Algorithm mapping for Node.js crypto
const ALGORITHM_MAP: Record<string, string> = {
  MD5: "md5",
  "SHA-1": "sha1",
  "SHA-256": "sha256",
  "SHA-512": "sha512",
};

/**
 * Server-side hash generation endpoint
 * Used as fallback for large files or when client-side processing fails
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      return await handleFileHashing(request);
    }

    // Handle JSON request (text hashing)
    if (contentType.includes("application/json")) {
      return await handleTextHashing(request);
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
    console.error("Hash generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during hash generation",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle text hashing from JSON request
 */
async function handleTextHashing(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, algorithm } = GenerateRequestSchema.parse(body);

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "No text provided for hashing",
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

    // Generate hash
    const nodeAlgorithm = ALGORITHM_MAP[algorithm];
    if (!nodeAlgorithm) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported algorithm: ${algorithm}`,
        },
        { status: 400 },
      );
    }

    const hash = crypto
      .createHash(nodeAlgorithm)
      .update(text, "utf8")
      .digest("hex");
    const processingTime = Date.now() - startTime;

    const warnings: string[] = [];
    if (algorithm === "MD5" || algorithm === "SHA-1") {
      warnings.push(
        `${algorithm} is not cryptographically secure. Use SHA-256 or SHA-512 for security-critical applications.`,
      );
    }

    return NextResponse.json({
      success: true,
      hash,
      algorithm,
      inputSize: text.length,
      processingTime,
      warnings: warnings.length > 0 ? warnings : undefined,
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

    console.error("Text hashing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate hash from text",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle file hashing from multipart form data
 */
async function handleFileHashing(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const algorithm = (formData.get("algorithm") as string) || "SHA-256";

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 },
      );
    }

    // Validate algorithm
    if (!ALGORITHM_MAP[algorithm]) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported algorithm: ${algorithm}`,
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
    const buffer = Buffer.from(arrayBuffer);

    // Generate hash
    const nodeAlgorithm = ALGORITHM_MAP[algorithm];
    const hash = crypto.createHash(nodeAlgorithm).update(buffer).digest("hex");
    const processingTime = Date.now() - startTime;

    const warnings: string[] = [];
    if (algorithm === "MD5" || algorithm === "SHA-1") {
      warnings.push(
        `${algorithm} is not cryptographically secure. Use SHA-256 or SHA-512 for security-critical applications.`,
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      warnings.push("Large file processed on server");
    }

    return NextResponse.json({
      success: true,
      hash,
      algorithm,
      inputSize: file.size,
      fileName: file.name,
      fileType: file.type,
      processingTime,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    console.error("File hashing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate hash from file",
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
    status: "ok",
    service: "hash-generator",
    algorithms: Object.keys(ALGORITHM_MAP),
    maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    supportedTypes: ALLOWED_FILE_TYPES,
  });
}
