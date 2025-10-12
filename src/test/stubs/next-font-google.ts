// Minimal stub for `next/font/google` to avoid network fetch during builds
// in restricted environments (e.g., CI/E2E). It returns shape-compatible
// objects exposing a `variable` class name used by our layout.

type FontReturn = { className?: string; variable?: string };

export function Inter(_opts?: any): FontReturn {
  return { className: "", variable: "" };
}

export function JetBrains_Mono(_opts?: any): FontReturn {
  return { className: "", variable: "" };
}

