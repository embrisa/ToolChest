import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import { z } from "zod";

// Register tsconfig paths etc when executed via `tsx` – no-op otherwise
// (the script itself is TypeScript, so we assume it's run via `tsx`).

// ------------------------------ Util helpers ------------------------------

const getKeys = (obj: any, prefix = ""): string[] => {
  if (obj === null || typeof obj !== "object") return [];
  return Object.keys(obj).reduce<string[]>((res, el) => {
    if (path.basename(el) === "metadata") return res; // Skip metadata keys
    if (typeof obj[el] === "object" && obj[el] !== null) {
      return [...res, ...getKeys(obj[el], prefix + el + ".")];
    }
    return [...res, prefix + el];
  }, []);
};

const flattenMessages = (obj: any, prefix = ""): Record<string, unknown> => {
  if (obj === null || typeof obj !== "object") return {};
  return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
    if (path.basename(key) === "metadata") return acc;
    const value = obj[key];
    if (typeof value === "object" && value !== null) {
      return { ...acc, ...flattenMessages(value, prefix + key + ".") };
    }
    return { ...acc, [prefix + key]: value };
  }, {});
};

const findEmptyValues = (obj: any, prefix = ""): string[] => {
  if (obj === null || typeof obj !== "object") return [];
  return Object.keys(obj).reduce<string[]>((res, el) => {
    const currentPath = prefix ? `${prefix}.${el}` : el;
    if (typeof obj[el] === "object" && obj[el] !== null) {
      return [...res, ...findEmptyValues(obj[el], currentPath)];
    }
    if (obj[el] === "") return [...res, currentPath];
    return res;
  }, []);
};

// --------------------------- Schema integration ---------------------------

import {
  PagesAdminAnalyticsSchema,
  PagesAdminLoadingSchema,
  PagesAdminDashboardSchema,
  PagesAdminToolsSchema,
  PagesAdminTagsSchema,
  PagesAdminAuthSchema,
  PagesAdminNavigationSchema,
  PagesHomeSchema,
  PagesToolsSchema,
  PagesLoadingSchema,
  PagesErrorSchema,
  CommonMessagesSchema,
  ComponentsUiSchema,
  ComponentsFormsSchema,
  ComponentsLayoutSchema,
  ToolsBase64InfoSchema,
  ToolsHashGeneratorInfoSchema,
  ToolsMarkdownToPdfInfoSchema,
  ToolsCommonSchema,
} from "../src/types/i18n";

interface MappingEntry {
  namespace: string; // Human-friendly identifier, kept for reference/logging
  baseDir: string; // Directory path under messages/
  pathInFile: string; // Dot-notation path inside the JSON – "" for root
  schema: z.ZodTypeAny;
}

const SCHEMA_MAP: MappingEntry[] = [
  // Admin pages
  {
    namespace: "pages.admin.analytics",
    baseDir: "pages/admin",
    pathInFile: "analytics",
    schema: PagesAdminAnalyticsSchema,
  },
  {
    namespace: "pages.admin.loading",
    baseDir: "pages/admin",
    pathInFile: "loading",
    schema: PagesAdminLoadingSchema,
  },
  {
    namespace: "pages.admin.dashboard",
    baseDir: "pages/admin",
    pathInFile: "dashboard",
    schema: PagesAdminDashboardSchema,
  },
  {
    namespace: "pages.admin.tools",
    baseDir: "pages/admin",
    pathInFile: "tools",
    schema: PagesAdminToolsSchema,
  },
  {
    namespace: "pages.admin.tags",
    baseDir: "pages/admin",
    pathInFile: "tags",
    schema: PagesAdminTagsSchema,
  },
  {
    namespace: "pages.admin.auth",
    baseDir: "pages/admin",
    pathInFile: "auth",
    schema: PagesAdminAuthSchema,
  },
  {
    namespace: "pages.admin.navigation",
    baseDir: "pages/admin",
    pathInFile: "navigation",
    schema: PagesAdminNavigationSchema,
  },
  // Public pages
  {
    namespace: "pages.home",
    baseDir: "pages/home",
    pathInFile: "",
    schema: PagesHomeSchema,
  },
  {
    namespace: "pages.tools",
    baseDir: "pages/tools",
    pathInFile: "",
    schema: PagesToolsSchema,
  },
  {
    namespace: "pages.loading",
    baseDir: "pages/loading",
    pathInFile: "",
    schema: PagesLoadingSchema,
  },
  {
    namespace: "pages.error",
    baseDir: "pages/error",
    pathInFile: "",
    schema: PagesErrorSchema,
  },
  // Components
  {
    namespace: "components.ui",
    baseDir: "components/ui",
    pathInFile: "",
    schema: ComponentsUiSchema,
  },
  {
    namespace: "components.forms",
    baseDir: "components/forms",
    pathInFile: "",
    schema: ComponentsFormsSchema,
  },
  {
    namespace: "components.layout",
    baseDir: "components/layout",
    pathInFile: "",
    schema: ComponentsLayoutSchema,
  },
  // Common
  {
    namespace: "common",
    baseDir: "common",
    pathInFile: "",
    schema: CommonMessagesSchema,
  },
  // Tools common
  {
    namespace: "tools.common",
    baseDir: "tools/common",
    pathInFile: "",
    schema: ToolsCommonSchema,
  },
  // Tool-specific info sections
  {
    namespace: "tools.base64.info",
    baseDir: "tools/base64",
    pathInFile: "info",
    schema: ToolsBase64InfoSchema,
  },
  {
    namespace: "tools.hash-generator.info",
    baseDir: "tools/hash-generator",
    pathInFile: "info",
    schema: ToolsHashGeneratorInfoSchema,
  },
  {
    namespace: "tools.markdown-to-pdf.info",
    baseDir: "tools/markdown-to-pdf",
    pathInFile: "info",
    schema: ToolsMarkdownToPdfInfoSchema,
  },
];

// Helper to fetch mapping entries for a given messages subdirectory
const mappingsByDir = SCHEMA_MAP.reduce<Record<string, MappingEntry[]>>(
  (acc, m) => {
    (acc[m.baseDir] ||= []).push(m);
    return acc;
  },
  {} as Record<string, MappingEntry[]>,
);

function getObjectByPath(obj: any, pathStr: string): any {
  if (!pathStr) return obj;
  return pathStr
    .split(".")
    .reduce((res, key) => (res ? res[key] : undefined), obj);
}

// ------------------------------ Main QA ------------------------------

async function qaTranslations(): Promise<void> {
  console.log("Starting translation file QA with schema validation...");

  const modulePaths = await glob("messages/**/", {
    ignore: "messages/node_modules/**",
  });

  let totalErrors = 0;
  let filesWithErrors = 0;

  for (const modulePath of modulePaths) {
    const relativeDir = modulePath
      .replace(/^messages\//, "")
      .replace(/\/$/, "");
    const dirMappings = mappingsByDir[relativeDir];
    // Skip dirs that have no schemas but keep legacy checks

    const filesInDir = await fs.readdir(modulePath);
    const jsonFiles: string[] = [];
    for (const file of filesInDir) {
      if (file.endsWith(".json")) {
        const stat = await fs.stat(path.join(modulePath, file));
        if (stat.isFile()) jsonFiles.push(file);
      }
    }

    if (!jsonFiles.includes("en.json")) continue;

    const englishFilePath = path.join(modulePath, "en.json");
    let englishContent: any;
    let englishKeys: Set<string>;

    try {
      englishContent = JSON.parse(await fs.readFile(englishFilePath, "utf8"));
      englishKeys = new Set(getKeys(englishContent));
    } catch (e: any) {
      console.error(`\n❌ Error processing English file: ${englishFilePath}`);
      console.error(e.message);
      totalErrors++;
      filesWithErrors++;
      continue;
    }

    // ---------------- Schema validation for English ----------------
    if (dirMappings) {
      for (const mapping of dirMappings) {
        const targetObj = getObjectByPath(englishContent, mapping.pathInFile);
        const result = mapping.schema.safeParse(targetObj);
        if (!result.success) {
          console.error(
            `\n❌ [SCHEMA] ${englishFilePath} → ${mapping.namespace}`,
          );
          console.error(result.error.format());
          totalErrors += 1;
          filesWithErrors += 1;
        }
      }
    }

    // ------------ Check other locales ------------
    for (const file of jsonFiles) {
      if (file === "en.json") continue;

      const filePath = path.join(modulePath, file);
      let hasError = false;

      try {
        const fileContentRaw = await fs.readFile(filePath, "utf8");
        let jsonContent: any;
        try {
          jsonContent = JSON.parse(fileContentRaw);
        } catch (e: any) {
          console.error(`\n❌ [${filePath}] Invalid JSON syntax: ${e.message}`);
          totalErrors++;
          hasError = true;
          if (!hasError) filesWithErrors++;
          continue;
        }

        const fileKeys = new Set(getKeys(jsonContent));

        // Key diff
        const missingKeys = [...englishKeys].filter((k) => !fileKeys.has(k));
        const extraKeys = [...fileKeys].filter((k) => !englishKeys.has(k));

        if (missingKeys.length > 0) {
          if (!hasError) console.error(`\n❌ [${filePath}]`);
          hasError = true;
          console.error(
            `  - Missing keys: \n    - ${missingKeys.join("\n    - ")}`,
          );
          totalErrors += missingKeys.length;
        }
        if (extraKeys.length > 0) {
          if (!hasError) console.error(`\n❌ [${filePath}]`);
          hasError = true;
          console.error(
            `  - Extra keys: \n    - ${extraKeys.join("\n    - ")}`,
          );
          totalErrors += extraKeys.length;
        }

        // Untranslated keys
        const englishFlat = flattenMessages(englishContent);
        const fileFlat = flattenMessages(jsonContent);

        const untranslatedKeys = Object.keys(englishFlat).filter(
          (k) => fileFlat[k] !== undefined && fileFlat[k] === englishFlat[k],
        );
        if (untranslatedKeys.length > 0) {
          console.warn(`\n⚠️  [${filePath}] Untranslated keys:`);
          console.warn(`    - ${untranslatedKeys.join("\n    - ")}`);
        }

        // Empty values
        const emptyValues = findEmptyValues(jsonContent);
        if (emptyValues.length > 0) {
          console.warn(`\n⚠️  [${filePath}] Empty values:`);
          console.warn(`    - ${emptyValues.join("\n    - ")}`);
        }

        // Schema validation for locale
        if (dirMappings) {
          for (const mapping of dirMappings) {
            const targetObj = getObjectByPath(jsonContent, mapping.pathInFile);
            const result = mapping.schema.safeParse(targetObj);
            if (!result.success) {
              if (!hasError) console.error(`\n❌ [${filePath}]`);
              hasError = true;
              console.error(
                `  - Schema mismatch for ${mapping.namespace}: ${JSON.stringify(
                  result.error.format(),
                  null,
                  2,
                )}`,
              );
              totalErrors += 1;
            }
          }
        }

        if (hasError) filesWithErrors++;
      } catch (e: any) {
        console.error(`\n❌ Error processing file: ${filePath}`);
        console.error(e.message);
        totalErrors++;
        filesWithErrors++;
      }
    }
  }

  console.log("\n----------------------------------");
  if (totalErrors === 0) {
    console.log(
      "✅ QA checks passed. All translation files are consistent and valid.",
    );
    process.exit(0);
  } else {
    console.error(
      `🚨 QA checks failed. Found ${totalErrors} issue(s) in ${filesWithErrors} file(s).`,
    );
    process.exit(1);
  }
}

qaTranslations().catch((e) => {
  console.error("Unexpected error in QA script", e);
  process.exit(1);
});
