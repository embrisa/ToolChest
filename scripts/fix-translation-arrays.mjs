#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the messages directory
const messagesDir = path.join(__dirname, "..", "messages");

// Function to recursively convert object items to arrays
function convertObjectsToArrays(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertObjectsToArrays);
  }

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === "items" && typeof value === "object" && !Array.isArray(value)) {
      // Convert object with numbered keys to array
      const keys = Object.keys(value);
      if (keys.every((k) => /^\d+$/.test(k))) {
        // All keys are numbers, convert to array
        const maxIndex = Math.max(...keys.map(Number));
        const array = [];
        for (let i = 0; i <= maxIndex; i++) {
          array[i] = value[i.toString()] || "";
        }
        result[key] = array;
      } else {
        result[key] = convertObjectsToArrays(value);
      }
    } else {
      result[key] = convertObjectsToArrays(value);
    }
  }

  return result;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);

    const converted = convertObjectsToArrays(data);

    // Check if conversion was needed
    const originalString = JSON.stringify(data, null, 2);
    const convertedString = JSON.stringify(converted, null, 2);

    if (originalString !== convertedString) {
      fs.writeFileSync(filePath, convertedString);
      console.log(`✅ Fixed: ${path.relative(messagesDir, filePath)}`);
      return true;
    } else {
      console.log(
        `⚪ No changes needed: ${path.relative(messagesDir, filePath)}`,
      );
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find all JSON files
function findJsonFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findJsonFiles(fullPath, files);
    } else if (item.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
console.log("🔧 Converting object items to arrays in translation files...\n");

const jsonFiles = findJsonFiles(messagesDir);
let fixedCount = 0;

for (const file of jsonFiles) {
  if (processFile(file)) {
    fixedCount++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Total files processed: ${jsonFiles.length}`);
console.log(`   Files fixed: ${fixedCount}`);
console.log(`   Files unchanged: ${jsonFiles.length - fixedCount}`);

if (fixedCount > 0) {
  console.log("\n✅ Array format conversion completed successfully!");
} else {
  console.log("\n⚪ All files already have correct array format.");
}
