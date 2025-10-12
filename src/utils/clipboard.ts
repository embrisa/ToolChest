export type CopyMethod = "modern" | "fallback" | "unknown";

export type CopyResult = {
  success: boolean;
  message: string;
  method?: CopyMethod;
};

export async function copyText(text: string): Promise<CopyResult> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true, message: "Copied to clipboard", method: "modern" };
    }
  } catch (e) {
    // fall through to fallback
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok
      ? { success: true, message: "Copied to clipboard", method: "fallback" }
      : { success: false, message: "Copy failed", method: "fallback" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Copy failed";
    return { success: false, message: `Failed to copy: ${msg}`, method: "unknown" };
  }
}

export async function copyJSON(value: unknown, pretty = true): Promise<CopyResult> {
  try {
    const text = pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
    return await copyText(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON";
    return { success: false, message: `Failed to copy JSON: ${msg}`, method: "unknown" };
  }
}

