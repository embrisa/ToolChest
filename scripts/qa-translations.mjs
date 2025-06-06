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

        // 3. Check for empty translation values
        const emptyValues = findEmptyValues(jsonContent);
        if (emptyValues.length > 0) {
          if (!hasError) console.error(`\n❌ [${filePath}]`);
          hasError = true;
          console.error(
            `  - Found empty translation values for keys: \n    - ${emptyValues.join("\n    - ")}`,
          );
          totalErrors += emptyValues.length;
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
