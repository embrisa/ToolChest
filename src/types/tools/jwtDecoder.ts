export type JwtDecodeErrorCode =
  | "empty"
  | "invalid-format"
  | "invalid-base64"
  | "invalid-json";

export interface DecodedJwtClaims {
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
  sub?: string;
  aud?: string | string[];
  jti?: string;
}

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
  claims: DecodedJwtClaims;
}

export type JwtDecodeResult =
  | {
      success: true;
      data: DecodedJwt;
      processingTime: number;
      warnings?: string[];
    }
  | {
      success: false;
      error: string;
      code: JwtDecodeErrorCode;
      processingTime: number;
    };

