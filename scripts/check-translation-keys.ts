import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

interface MissingEntry {
  file: string;
  key: string;
}

const SRC_GLOBS = ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"];

async function collectEnglishKeys(): Promise<Set<string>> {
  const files = await glob("messages/**/en.json", {
    ignore: "messages/node_modules/**",
  });
  const allKeys = new Set<string>();
  const walk = (obj: any, prefix = "") => {
    if (obj === null || typeof obj !== "object") return;
    for (const k of Object.keys(obj)) {
      if (k === "metadata") continue; // Skip metadata sections
      const val = obj[k];
      const current = prefix ? `${prefix}.${k}` : k;
      if (val && typeof val === "object") {
        walk(val, current);
      } else {
        allKeys.add(current);
      }
    }
  };

  for (const file of files) {
    const json = JSON.parse(await fs.readFile(file, "utf8"));
    walk(json);
  }
  return allKeys;
}

async function collectUsedKeys(): Promise<Map<string, Set<string>>> {
  const translationCallRegex =
    /[a-zA-Z_$][a-zA-Z0-9_$]*\(\s*(["'`])([^"'`\n]+?)\1/g;
  const result = new Map<string, Set<string>>();
  for (const pattern of SRC_GLOBS) {
    const files = await glob(pattern, {
      ignore: ["**/*.test.*", "**/__tests__/**", "node_modules/**", ".next/**"],
    });
    for (const file of files) {
      const content = await fs.readFile(file, "utf8");
      let match: RegExpExecArray | null;
      while ((match = translationCallRegex.exec(content))) {
        const key = match[2];
        // Skip obviously non-translation keys – heuristic: keys with whitespace or starting with http
        if (/\s/.test(key) || key.startsWith("http")) continue;
        (result.get(file) ?? result.set(file, new Set()).get(file)!).add(key);
      }
    }
  }
  return result;
}

async function main() {
  const englishKeys = await collectEnglishKeys();
  const used = await collectUsedKeys();

  const missing: MissingEntry[] = [];
  for (const [file, keys] of used) {
    for (const key of keys) {
      if (!englishKeys.has(key)) {
        missing.push({ file, key });
      }
    }
  }

  if (missing.length === 0) {
    console.log(
      "✅ All translation keys referenced in code exist in English messages",
    );
    return;
  }

  console.error("\n❌ Missing translation keys referenced in code:");
  for (const entry of missing) {
    console.error(
      `  [${path.relative(process.cwd(), entry.file)}] ${entry.key}`,
    );
  }
  console.error(`\nTotal missing keys: ${missing.length}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
