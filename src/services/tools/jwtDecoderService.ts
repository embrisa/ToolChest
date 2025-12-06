import { DecodedJwt, JwtDecodeResult, JwtDecodeErrorCode } from "@/types/tools/jwtDecoder";

function normalizeBase64Url(segment: string) {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if missing
  const paddingNeeded = padded.length % 4;
  if (paddingNeeded === 2) return `${padded}==`;
  if (paddingNeeded === 3) return `${padded}=`;
  if (paddingNeeded === 0) return padded;
  // If only one character remains, pad with === for safety
  return `${padded}===`;
}

function decodeBase64Url(segment: string): string {
  const normalized = normalizeBase64Url(segment);
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(normalized, "base64").toString("utf8");
    }
    // Fallback for environments without Buffer (should not happen in Next.js)
    if (typeof atob !== "undefined") {
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(normalized), (c: string) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(""),
      );
    }
    throw new Error("No base64 decoder available");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Base64 decoding failed";
    throw new Error(message);
  }
}

function decodeJsonSegment(segment: string, part: "header" | "payload") {
  const jsonString = decodeBase64Url(segment);
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error(`${part} is not a valid JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    throw new Error(`${part} JSON parse error: ${message}`);
  }
}

function buildClaims(payload: Record<string, unknown>) {
  const claims: DecodedJwt["claims"] = {};
  const numberClaims = ["exp", "iat", "nbf"] as const;
  numberClaims.forEach((key) => {
    const value = payload[key];
    if (typeof value === "number") {
      claims[key] = value;
    } else if (typeof value === "string" && !Number.isNaN(Number(value))) {
      claims[key] = Number(value);
    }
  });

  const stringClaims = ["iss", "sub", "jti"] as const;
  stringClaims.forEach((key) => {
    const value = payload[key];
    if (typeof value === "string") {
      claims[key] = value;
    }
  });

  if (typeof payload.aud === "string" || Array.isArray(payload.aud)) {
    claims.aud = payload.aud as string | string[];
  }

  return claims;
}

function errorResult(
  code: JwtDecodeErrorCode,
  message: string,
  start: number,
): JwtDecodeResult {
  return {
    success: false,
    error: message,
    code,
    processingTime: Date.now() - start,
  };
}

export class JwtDecoderService {
  public static decode(token: string): JwtDecodeResult {
    const start = Date.now();
    const trimmed = token.trim();
    if (!trimmed) {
      return errorResult("empty", "Token is required", start);
    }

    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      return errorResult(
        "invalid-format",
        "Invalid JWT format. Expected three segments separated by dots.",
        start,
      );
    }

    const [headerSegment, payloadSegment, signatureSegment] = parts;

    try {
      const header = decodeJsonSegment(headerSegment, "header");
      const payload = decodeJsonSegment(payloadSegment, "payload");
      const claims = buildClaims(payload);

      const decoded: DecodedJwt = {
        header,
        payload,
        signature: signatureSegment || "",
        raw: {
          header: headerSegment,
          payload: payloadSegment,
          signature: signatureSegment,
        },
        claims,
      };

      return {
        success: true,
        data: decoded,
        processingTime: Date.now() - start,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to decode token";
      const code: JwtDecodeErrorCode =
        message.includes("format") || message.includes("segments")
          ? "invalid-format"
          : message.toLowerCase().includes("base64")
            ? "invalid-base64"
            : "invalid-json";

      return errorResult(code, message, start);
    }
  }
}

