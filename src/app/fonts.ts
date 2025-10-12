const OFFLINE = process.env.OFFLINE_FONTS === "1";

type FontObj = { className?: string; variable?: string };

async function loadRealFonts(): Promise<{ inter: FontObj; jetbrainsMono: FontObj }> {
  try {
    const mod = await import("next/font/google");
    const interLoader = typeof mod.Inter === "function" ? mod.Inter : null;
    const jetbrainsLoader =
      typeof mod.JetBrains_Mono === "function" ? mod.JetBrains_Mono : null;

    if (!interLoader || !jetbrainsLoader) {
      throw new Error("Font loaders unavailable");
    }

    const inter = interLoader({
      subsets: ["latin"],
      variable: "--font-inter",
      display: "swap",
      preload: true,
      fallback: ["system-ui", "arial"],
    });
    const jetbrainsMono = jetbrainsLoader({
      subsets: ["latin"],
      variable: "--font-jetbrains-mono",
      display: "swap",
      preload: true,
      fallback: ["monospace"],
    });
    return { inter, jetbrainsMono };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falling back to stub Google fonts", error);
    }
    return stub;
  }
}

const stub: { inter: FontObj; jetbrainsMono: FontObj } = {
  inter: { className: "", variable: "--font-inter" },
  jetbrainsMono: { className: "", variable: "--font-jetbrains-mono" },
};

const resolved = OFFLINE ? stub : await loadRealFonts();

export const inter = resolved.inter;
export const jetbrainsMono = resolved.jetbrainsMono;
