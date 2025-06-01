import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sharp from "sharp";
import JSZip from "jszip";

// Request validation schema
const FaviconGenerateRequestSchema = z.object({
  backgroundColor: z.string().default("transparent"),
  padding: z.number().min(0).max(50).default(0),
  format: z.enum(["png", "webp", "jpeg"]).default("png"),
  quality: z.number().min(0.1).max(1).default(0.9),
  sizes: z.array(z.number()).default([16, 32, 48, 64, 96, 128, 180, 192, 512]),
  generateICO: z.boolean().default(true),
  includeManifest: z.boolean().default(true),
});

// File upload validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const FAVICON_SIZES = {
  16: { width: 16, height: 16, name: "favicon-16x16.png" },
  32: { width: 32, height: 32, name: "favicon-32x32.png" },
  48: { width: 48, height: 48, name: "favicon-48x48.png" },
  64: { width: 64, height: 64, name: "favicon-64x64.png" },
  96: { width: 96, height: 96, name: "favicon-96x96.png" },
  128: { width: 128, height: 128, name: "favicon-128x128.png" },
  180: { width: 180, height: 180, name: "apple-touch-icon.png" },
  192: { width: 192, height: 192, name: "android-chrome-192x192.png" },
  512: { width: 512, height: 512, name: "android-chrome-512x512.png" },
} as const;

interface GeneratedFavicon {
  size: number;
  name: string;
  data: Buffer;
  format: string;
}

/**
 * Server-side favicon generation endpoint
 * Used as fallback for large files or when client-side processing fails
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          error: "Content-Type must be multipart/form-data for file upload",
        },
        { status: 400 },
      );
    }

    return await handleFaviconGeneration(request);
  } catch (error) {
    console.error("Favicon generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during favicon generation",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle favicon generation from uploaded image file
 */
async function handleFaviconGeneration(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Parse options with defaults
    const options = {
      backgroundColor:
        (formData.get("backgroundColor") as string) || "transparent",
      padding: parseInt((formData.get("padding") as string) || "0"),
      format: (formData.get("format") as string) || "png",
      quality: parseFloat((formData.get("quality") as string) || "0.9"),
      sizes: JSON.parse(
        (formData.get("sizes") as string) || "[16,32,48,64,96,128,180,192,512]",
      ),
      generateICO: (formData.get("generateICO") as string) !== "false",
      includeManifest: (formData.get("includeManifest") as string) !== "false",
    };

    // Validate options
    const validatedOptions = FaviconGenerateRequestSchema.parse(options);

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No image file provided",
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
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Supported types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const startTime = Date.now();

    // Read and process image
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not determine image dimensions",
        },
        { status: 400 },
      );
    }

    // Validate dimensions
    if (metadata.width < 16 || metadata.height < 16) {
      return NextResponse.json(
        {
          success: false,
          error: "Image too small. Minimum dimensions: 16x16 pixels",
        },
        { status: 400 },
      );
    }

    if (metadata.width > 2048 || metadata.height > 2048) {
      return NextResponse.json(
        {
          success: false,
          error: "Image too large. Maximum dimensions: 2048x2048 pixels",
        },
        { status: 400 },
      );
    }

    // Generate favicons
    const favicons: GeneratedFavicon[] = [];
    const warnings: string[] = [];

    // Add quality warnings
    if (metadata.width < 256 || metadata.height < 256) {
      warnings.push(
        "Source image is smaller than recommended (256x256). Consider using a larger image for best quality.",
      );
    }

    if (metadata.width !== metadata.height) {
      warnings.push(
        "Source image is not square. It will be centered and may have padding.",
      );
    }

    // Process background color
    let background: string | { r: number; g: number; b: number; alpha: number };
    if (validatedOptions.backgroundColor === "transparent") {
      background = { r: 0, g: 0, b: 0, alpha: 0 };
    } else if (validatedOptions.backgroundColor === "white") {
      background = { r: 255, g: 255, b: 255, alpha: 1 };
    } else if (validatedOptions.backgroundColor === "black") {
      background = { r: 0, g: 0, b: 0, alpha: 1 };
    } else {
      // Parse hex color
      const hex = validatedOptions.backgroundColor.replace("#", "");
      if (hex.length === 6) {
        background = {
          r: parseInt(hex.substr(0, 2), 16),
          g: parseInt(hex.substr(2, 2), 16),
          b: parseInt(hex.substr(4, 2), 16),
          alpha: 1,
        };
      } else {
        background = { r: 255, g: 255, b: 255, alpha: 1 };
        warnings.push("Invalid background color, using white as fallback");
      }
    }

    // Generate individual favicon sizes
    for (const size of validatedOptions.sizes) {
      if (FAVICON_SIZES[size as keyof typeof FAVICON_SIZES]) {
        const faviconInfo = FAVICON_SIZES[size as keyof typeof FAVICON_SIZES];

        try {
          let sharpInstance = sharp(inputBuffer);

          // Calculate dimensions with padding
          const targetSize = faviconInfo.width;
          const paddingPixels = Math.round(
            (validatedOptions.padding / 100) * targetSize,
          );
          const imageSize = targetSize - paddingPixels * 2;

          // Resize and process image
          sharpInstance = sharpInstance.resize(imageSize, imageSize, {
            fit: "contain",
            background,
          });

          // Add padding if specified
          if (paddingPixels > 0) {
            sharpInstance = sharpInstance.extend({
              top: paddingPixels,
              bottom: paddingPixels,
              left: paddingPixels,
              right: paddingPixels,
              background,
            });
          }

          // Set output format
          if (validatedOptions.format === "png") {
            sharpInstance = sharpInstance.png({
              quality: Math.round(validatedOptions.quality * 100),
            });
          } else if (validatedOptions.format === "webp") {
            sharpInstance = sharpInstance.webp({
              quality: Math.round(validatedOptions.quality * 100),
            });
          } else if (validatedOptions.format === "jpeg") {
            sharpInstance = sharpInstance.jpeg({
              quality: Math.round(validatedOptions.quality * 100),
            });
          }

          const faviconBuffer = await sharpInstance.toBuffer();

          favicons.push({
            size: targetSize,
            name: faviconInfo.name,
            data: faviconBuffer,
            format: validatedOptions.format,
          });
        } catch (error) {
          console.error(`Error generating favicon size ${size}:`, error);
          warnings.push(`Failed to generate ${size}x${size} favicon`);
        }
      }
    }

    // Generate ICO file if requested
    if (validatedOptions.generateICO && favicons.length > 0) {
      try {
        // For ICO, use PNG format and common sizes
        const icoSizes = [16, 32, 48];
        const icoImages: Buffer[] = [];

        for (const size of icoSizes) {
          const existing = favicons.find((f) => f.size === size);
          if (existing) {
            icoImages.push(existing.data);
          } else {
            // Generate this size specifically for ICO
            const icoBuffer = await sharp(inputBuffer)
              .resize(size, size, { fit: "contain", background })
              .png()
              .toBuffer();
            icoImages.push(icoBuffer);
          }
        }

        // Create basic ICO structure (simplified - real ICO would need proper headers)
        const icoData = Buffer.concat(icoImages);
        favicons.push({
          size: 0, // ICO is multi-size
          name: "favicon.ico",
          data: icoData,
          format: "ico",
        });
      } catch (error) {
        console.error("Error generating ICO file:", error);
        warnings.push("Failed to generate favicon.ico file");
      }
    }

    // Generate web app manifest if requested
    let manifestJson: string | undefined;
    if (validatedOptions.includeManifest) {
      const manifest = {
        name: "Generated Favicon",
        short_name: "Favicon",
        icons: favicons
          .filter((f) => f.size >= 192) // Only large icons for manifest
          .map((f) => ({
            src: f.name,
            sizes: `${f.size}x${f.size}`,
            type: `image/${f.format}`,
            purpose: f.size >= 512 ? "any maskable" : "any",
          })),
        theme_color:
          validatedOptions.backgroundColor === "transparent"
            ? "#ffffff"
            : validatedOptions.backgroundColor,
        background_color:
          validatedOptions.backgroundColor === "transparent"
            ? "#ffffff"
            : validatedOptions.backgroundColor,
        display: "standalone",
      };
      manifestJson = JSON.stringify(manifest, null, 2);
    }

    const processingTime = Date.now() - startTime;

    // Create ZIP package
    const zip = new JSZip();

    // Add favicons to ZIP
    favicons.forEach((favicon) => {
      zip.file(favicon.name, favicon.data);
    });

    // Add manifest if included
    if (manifestJson) {
      zip.file("manifest.json", manifestJson);
    }

    // Add usage instructions
    const instructions = generateUsageInstructions(favicons, !!manifestJson);
    zip.file("README.html", instructions);

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Return response with ZIP file
    const response = new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="tool-chest_favicons_${Date.now()}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });

    // Add metadata headers
    response.headers.set("X-Favicon-Count", favicons.length.toString());
    response.headers.set("X-Processing-Time", processingTime.toString());
    response.headers.set("X-Original-Size", file.size.toString());
    response.headers.set("X-Generated-Size", zipBuffer.length.toString());

    if (warnings.length > 0) {
      response.headers.set("X-Warnings", JSON.stringify(warnings));
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Favicon generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate favicons",
      },
      { status: 500 },
    );
  }
}

/**
 * Generate usage instructions HTML
 */
function generateUsageInstructions(
  favicons: GeneratedFavicon[],
  hasManifest: boolean,
): string {
  const icoFavicon = favicons.find((f) => f.name === "favicon.ico");
  const appleTouchIcon = favicons.find(
    (f) => f.name === "apple-touch-icon.png",
  );
  const androidIcons = favicons.filter((f) =>
    f.name.includes("android-chrome"),
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Favicon Installation Guide</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2rem; line-height: 1.6; }
        .code { background: #f5f5f5; padding: 1rem; border-radius: 4px; font-family: monospace; overflow-x: auto; }
        .section { margin: 2rem 0; }
        .icon-list { list-style: none; padding: 0; }
        .icon-list li { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <h1>🎨 Favicon Installation Guide</h1>
    
    <div class="section">
        <h2>📋 Generated Files</h2>
        <ul class="icon-list">
            ${favicons.map((f) => `<li><strong>${f.name}</strong> - ${f.size > 0 ? `${f.size}x${f.size}` : "Multi-size"} ${f.format.toUpperCase()}</li>`).join("")}
            ${hasManifest ? "<li><strong>manifest.json</strong> - Web App Manifest for PWA support</li>" : ""}
        </ul>
    </div>

    <div class="section">
        <h2>🔧 HTML Implementation</h2>
        <p>Add these tags to your HTML <code>&lt;head&gt;</code> section:</p>
        <div class="code">${icoFavicon ? `&lt;link rel="icon" type="image/x-icon" href="/favicon.ico"&gt;<br>` : ""}${appleTouchIcon ? `&lt;link rel="apple-touch-icon" href="/apple-touch-icon.png"&gt;<br>` : ""}${androidIcons.map((icon) => `&lt;link rel="icon" type="image/png" sizes="${icon.size}x${icon.size}" href="/${icon.name}"&gt;`).join("<br>")}<br>${hasManifest ? `&lt;link rel="manifest" href="/manifest.json"&gt;` : ""}</div>
    </div>

    <div class="section">
        <h2>📁 File Placement</h2>
        <p>Upload all favicon files to your website's root directory (where your index.html file is located).</p>
    </div>

    <div class="section">
        <h2>✅ Testing</h2>
        <p>After uploading, test your favicons:</p>
        <ul>
            <li>Check browser tab icon</li>
            <li>Test bookmarks</li>
            <li>Verify mobile home screen icon</li>
            <li>Use online favicon checkers</li>
        </ul>
    </div>

          <p><em>Generated by tool-chest Favicon Generator</em></p>
</body>
</html>`;
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "favicon-generator",
    endpoints: ["POST /generate"],
    features: [
      "Server-side image processing",
      "Multiple formats",
      "ZIP packaging",
      "Usage instructions",
    ],
  });
}
