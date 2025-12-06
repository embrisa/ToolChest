import { JwtDecoderService } from "@/services/tools/jwtDecoderService";

function buildToken(payload: Record<string, unknown>, header: Record<string, unknown> = {}) {
  const base64Url = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const headerPart = base64Url({ alg: "none", typ: "JWT", ...header });
  const payloadPart = base64Url(payload);
  const signaturePart = "signature";
  return `${headerPart}.${payloadPart}.${signaturePart}`;
}

describe("JwtDecoderService", () => {
  it("decodes a valid token", () => {
    const token = buildToken({ sub: "123", exp: 1234567890 });
    const result = JwtDecoderService.decode(token);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.payload.sub).toBe("123");
      expect(result.data.claims.exp).toBe(1234567890);
      expect(result.data.signature).toBe("signature");
    }
  });

  it("returns error for invalid format", () => {
    const result = JwtDecoderService.decode("invalid-token");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("invalid-format");
    }
  });

  it("returns error for invalid JSON", () => {
    // Token with invalid JSON payload part
    const badPayload = Buffer.from("not-json").toString("base64url");
    const token = `${Buffer.from('{"alg":"none"}').toString("base64url")}.${badPayload}.sig`;
    const result = JwtDecoderService.decode(token);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("invalid-json");
    }
  });
});

