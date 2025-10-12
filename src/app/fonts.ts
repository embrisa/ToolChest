const OFFLINE = process.env.OFFLINE_FONTS === "1";

type FontObj = { className?: string; variable?: string };

async function loadRealFonts(): Promise<{ inter: FontObj; jetbrainsMono: FontObj }> {
  const mod = await import("next/font/google");
  const inter = mod.Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    preload: true,
    fallback: ["system-ui", "arial"],
  });
  const jetbrainsMono = mod.JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
    display: "swap",
    preload: true,
    fallback: ["monospace"],
  });
  return { inter, jetbrainsMono };
}

const stub: { inter: FontObj; jetbrainsMono: FontObj } = {
  inter: { className: "", variable: "--font-inter" },
  jetbrainsMono: { className: "", variable: "--font-jetbrains-mono" },
};

const resolved = OFFLINE ? stub : await loadRealFonts();

export const inter = resolved.inter;
export const jetbrainsMono = resolved.jetbrainsMono;
