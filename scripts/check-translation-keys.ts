import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import * as ts from "typescript";

interface MissingEntry {
  file: string;
  key: string;
}

const SRC_GLOBS = ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"];
const TRANSLATION_FACTORY_NAMES = new Set([
  "useTranslations",
  "getTranslations",
  "useTypedTranslations",
]);

async function collectEnglishKeys(): Promise<Set<string>> {
  const files = await glob("messages/**/en.json", {
    ignore: "messages/node_modules/**",
  });
  const allKeys = new Set<string>();
  const walk = (obj: any, prefix = "") => {
    if (obj === null || typeof obj !== "object") return;
    for (const k of Object.keys(obj)) {
      const val = obj[k];
      const current = prefix ? `${prefix}.${k}` : k;
      if (Array.isArray(val)) {
        allKeys.add(current);
      } else if (val && typeof val === "object") {
        walk(val, current);
      } else {
        allKeys.add(current);
      }
    }
  };

  for (const file of files) {
    const json = JSON.parse(await fs.readFile(file, "utf8"));
    const relativePath = path.relative("messages", file);
    const segments = relativePath.split(path.sep);
    segments.pop(); // remove filename (e.g., en.json)
    const basePrefix = segments.filter(Boolean).join(".");
    walk(json, basePrefix);
  }
  return allKeys;
}

const TRANSLATION_IMPORT_MODULES = new Set([
  "next-intl",
  "next-intl/server",
  "@/i18n/useTypedTranslations",
]);

function isFromIntlModule(moduleName: string): boolean {
  return TRANSLATION_IMPORT_MODULES.has(moduleName);
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (true) {
    if (ts.isAsExpression(current) || ts.isTypeAssertionExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isParenthesizedExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isAwaitExpression(current)) {
      current = current.expression;
      continue;
    }
    break;
  }
  return current;
}

function extractLiteralKey(node: ts.Expression | undefined): string | null {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isTemplateExpression(node) && node.templateSpans.length === 0) {
    return node.head.text;
  }
  return null;
}

type NamespaceInfo = {
  value: string | null;
  isKnown: boolean;
};

function collectKeysFromFile(filePath: string, content: string): Set<string> {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const factoryAliases = new Set<string>();
  const translatorIdentifiers = new Set<string>();
  const translatorNamespaceInfo = new Map<string, NamespaceInfo>();
  const keys = new Set<string>();

  // Gather import aliases for translation factories
  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node) || !node.importClause) return;
    const moduleName = (node.moduleSpecifier as ts.StringLiteral).text;
    if (!isFromIntlModule(moduleName)) return;
    const named = node.importClause.namedBindings;
    if (!named || !ts.isNamedImports(named)) return;
    for (const element of named.elements) {
      const importedName =
        element.propertyName?.text ?? element.name.text;
      if (TRANSLATION_FACTORY_NAMES.has(importedName)) {
        factoryAliases.add(element.name.text);
      }
    }
  });

  function getNamespaceFromCall(call: ts.CallExpression): NamespaceInfo {
    if (call.arguments.length === 0) {
      return { value: null, isKnown: true };
    }

    const firstArg = call.arguments[0];

    if (
      ts.isStringLiteral(firstArg) ||
      ts.isNoSubstitutionTemplateLiteral(firstArg)
    ) {
      return { value: firstArg.text, isKnown: true };
    }

    if (
      ts.isTemplateExpression(firstArg) &&
      firstArg.templateSpans.length === 0
    ) {
      return { value: firstArg.head.text, isKnown: true };
    }

    if (ts.isObjectLiteralExpression(firstArg)) {
      for (const prop of firstArg.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const name = prop.name;
        const propName =
          ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : null;
        if (propName !== "namespace") continue;
        const value = prop.initializer;
        if (
          ts.isStringLiteral(value) ||
          ts.isNoSubstitutionTemplateLiteral(value)
        ) {
          return { value: value.text, isKnown: true };
        }
        if (ts.isTemplateExpression(value) && value.templateSpans.length === 0) {
          return { value: value.head.text, isKnown: true };
        }
        // Non-literal namespace value; cannot determine statically
        return { value: null, isKnown: false };
      }
      // Namespace key not found; treat as unknown
      return { value: null, isKnown: false };
    }

    return { value: null, isKnown: false };
  }

  function registerTranslator(binding: ts.BindingName, info: NamespaceInfo) {
    if (ts.isIdentifier(binding)) {
      translatorIdentifiers.add(binding.text);
      translatorNamespaceInfo.set(binding.text, info);
      return;
    }

    for (const element of binding.elements) {
      if (ts.isBindingElement(element)) {
        registerTranslator(element.name, info);
      }
    }
  }

  function markTranslatorFromInitializer(
    binding: ts.BindingName,
    initializer: ts.Expression,
  ) {
    const unwrapped = unwrapExpression(initializer);
    if (ts.isCallExpression(unwrapped)) {
      const callee = unwrapped.expression;
      if (ts.isIdentifier(callee) && factoryAliases.has(callee.text)) {
        const namespaceInfo = getNamespaceFromCall(unwrapped);
        registerTranslator(binding, namespaceInfo);
        return;
      }
    }
    if (ts.isIdentifier(unwrapped) && translatorIdentifiers.has(unwrapped.text)) {
      const namespaceInfo =
        translatorNamespaceInfo.get(unwrapped.text) ??
        ({ value: null, isKnown: false } satisfies NamespaceInfo);
      registerTranslator(binding, namespaceInfo);
    }
  }

  function visitForTranslators(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      markTranslatorFromInitializer(node.name, node.initializer);
    } else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isIdentifier(node.left)
    ) {
      markTranslatorFromInitializer(node.left, node.right);
    }
    ts.forEachChild(node, visitForTranslators);
  }

  visitForTranslators(sourceFile);

  function getTranslatorIdentifier(
    expression: ts.LeftHandSideExpression,
  ): string | null {
    if (ts.isIdentifier(expression) && translatorIdentifiers.has(expression.text)) {
      return expression.text;
    }
    if (ts.isPropertyAccessExpression(expression)) {
      const base = expression.expression;
      if (ts.isIdentifier(base) && translatorIdentifiers.has(base.text)) {
        return base.text;
      }
    }
    return null;
  }

  function visitForKeys(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const translatorName = getTranslatorIdentifier(node.expression);
      if (translatorName) {
        const key = extractLiteralKey(node.arguments[0]);
        if (key && !/\s/.test(key) && !key.startsWith("http")) {
          const info = translatorNamespaceInfo.get(translatorName);
          if (info && info.isKnown === false) {
            return;
          }
          const namespace = info?.value ?? null;
          const fullKey =
            namespace && !key.startsWith(`${namespace}.`)
              ? `${namespace}.${key}`
              : key;
          keys.add(fullKey);
        }
      }
    }
    ts.forEachChild(node, visitForKeys);
  }

  visitForKeys(sourceFile);
  return keys;
}

async function collectUsedKeys(): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>();
  const visitedFiles = new Set<string>();

  for (const pattern of SRC_GLOBS) {
    const files = await glob(pattern, {
      ignore: ["**/*.test.*", "**/__tests__/**", "node_modules/**", ".next/**"],
    });
    for (const file of files) {
      if (visitedFiles.has(file)) continue;
      visitedFiles.add(file);
      const content = await fs.readFile(file, "utf8");
      const keys = collectKeysFromFile(file, content);
      if (keys.size > 0) {
        result.set(file, keys);
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
