import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

// Utility function to recursively get all keys from an object
const getKeys = (obj, prefix = "") => {
  if (obj === null || typeof obj !== "object") {
    return [];
  }
  return Object.keys(obj).reduce((res, el) => {
    if (path.basename(el) === "metadata") return res; // Skip metadata keys
    if (typeof obj[el] === "object" && obj[el] !== null) {
      return [...res, ...getKeys(obj[el], prefix + el + ".")];
    }
    return [...res, prefix + el];
  }, []);
};

// Utility function that returns a flat key→value map for all leaf nodes
// in a nested translation object. Keys follow the dot-notation used by
// `getKeys` so the two utilities stay compatible.
// Metadata branches are skipped in the same way as in `getKeys`.
const flattenMessages = (obj, prefix = "") => {
  if (obj === null || typeof obj !== "object") {
    return {};
  }
  return Object.keys(obj).reduce((acc, key) => {
    if (path.basename(key) === "metadata") return acc; // Skip metadata

    const value = obj[key];

    if (typeof value === "object" && value !== null) {
      return { ...acc, ...flattenMessages(value, prefix + key + ".") };
    }

    return { ...acc, [prefix + key]: value };
  }, {});
};

// Utility function to find empty values in an object
const findEmptyValues = (obj, prefix = "") => {
  if (obj === null || typeof obj !== "object") {
    return [];
  }
  return Object.keys(obj).reduce((res, el) => {
    const currentPath = prefix ? `${prefix}.${el}` : el;
    if (typeof obj[el] === "object" && obj[el] !== null) {
      return [...res, ...findEmptyValues(obj[el], currentPath)];
    }
    if (obj[el] === "") {
      return [...res, currentPath];
    }
    return res;
  }, []);
};

// Load allowlist of keys (dot-notated) that are intentionally identical across locales.
// The file path is configurable via ALLOWLIST env var or defaults to scripts/translation-allowlist.json.
const allowlistPath =
  process.env.TRANSLATION_ALLOWLIST ||
  path.resolve("scripts/translation-allowlist.json");
let allowlist = new Set();
try {
  const raw = await fs.readFile(allowlistPath, "utf8");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    allowlist = new Set(parsed);
  }
} catch {
  // If file doesn't exist, proceed with empty allowlist.
}

async function qaTranslations() {
  console.log("Starting translation file QA...");
  const modulePaths = await glob("messages/**/", {
    ignore: "messages/node_modules/**",
  });

  let totalErrors = 0;
  let filesWithErrors = 0;

  for (const modulePath of modulePaths) {
    const filesInDir = await fs.readdir(modulePath);
    const jsonFiles = [];
    for (const file of filesInDir) {
      if (file.endsWith(".json")) {
        const stat = await fs.stat(path.join(modulePath, file));
        if (stat.isFile()) {
          jsonFiles.push(file);
        }
      }
    }

    if (!jsonFiles.includes("en.json")) {
      continue;
    }

    const englishFile = path.join(modulePath, "en.json");
    let englishContent;
    let englishKeys;

    try {
      const englishFileContent = await fs.readFile(englishFile, "utf8");
      englishContent = JSON.parse(englishFileContent);
      englishKeys = new Set(getKeys(englishContent));
    } catch (e) {
      console.error(`\n❌ Error processing English file: ${englishFile}`);
      console.error(e.message);
      totalErrors++;
      filesWithErrors++;
      continue;
    }

    for (const file of jsonFiles) {
      if (file === "en.json") continue;

      const filePath = path.join(modulePath, file);
      let hasError = false;

      try {
        const fileContent = await fs.readFile(filePath, "utf8");
        let jsonContent;

        // 1. Validate JSON syntax
        try {
          jsonContent = JSON.parse(fileContent);
        } catch (e) {
          console.error(`\n❌ [${filePath}] Invalid JSON syntax: ${e.message}`);
          totalErrors++;
          hasError = true;
          if (!hasError) filesWithErrors++;
          continue; // Skip other checks for this file
        }

        const fileKeys = new Set(getKeys(jsonContent));

        // 2. Compare keys against English
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

        // 3b. Detect untranslated keys – value is identical to English
        const englishFlat = flattenMessages(englishContent);
        const fileFlat = flattenMessages(jsonContent);

        const untranslatedKeys = Object.keys(englishFlat).filter(
          (k) =>
            fileFlat[k] !== undefined &&
            fileFlat[k] === englishFlat[k] &&
            !allowlist.has(k),
        );

        // Treat untranslated keys as warnings instead of errors to allow
        // progressive translation without failing the entire QA step.
        if (untranslatedKeys.length > 0) {
          console.warn(
            `\n⚠️  [${filePath}] Untranslated keys (value identical to English):`,
          );
          console.warn(`    - ${untranslatedKeys.join("\n    - ")}`);
          // Do NOT count these as errors so the script can pass even when
          // some locales fall back to English.
        }

        // 3. Check for empty translation values – treat as warnings to allow
        // incremental localisation without failing CI.
        const emptyValues = findEmptyValues(jsonContent);
        if (emptyValues.length > 0) {
          console.warn(
            `\n⚠️  [${filePath}] Empty translation values for keys:`,
          );
          console.warn(`    - ${emptyValues.join("\n    - ")}`);
          // Not counting as errors.
        }

        // 2b. Ensure allow-listed keys **must** stay identical to English
        const allowlistViolations = [...allowlist].filter(
          (k) =>
            englishFlat[k] !== undefined &&
            fileFlat[k] !== undefined &&
            fileFlat[k] !== englishFlat[k],
        );
        if (allowlistViolations.length > 0) {
          if (!hasError) console.error(`\n❌ [${filePath}]`);
          hasError = true;
          console.error(
            `  - Keys that MUST stay identical to English but differ: \n    - ${allowlistViolations.join("\n    - ")}`,
          );
          totalErrors += allowlistViolations.length;
        }

        if (hasError) {
          filesWithErrors++;
        }
      } catch (e) {
        if (!hasError) {
          console.error(`\n❌ Error processing file: ${filePath}`);
          console.error(e.message);
          totalErrors++;
          filesWithErrors++;
        }
      }
    }
  }

  console.log("\n----------------------------------");
  if (totalErrors === 0) {
    console.log("✅ QA checks passed. All translation files are consistent.");
    process.exit(0);
  } else {
    console.error(
      `🚨 QA checks failed. Found ${totalErrors} issue(s) in ${filesWithErrors} file(s).`,
    );
    process.exit(1);
  }
}

qaTranslations();
