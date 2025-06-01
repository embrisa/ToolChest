import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  ...compat.plugins("jsx-a11y"),
  {
    rules: {
      // Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "error",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // React rules
      "react/jsx-key": "error",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // General rules
      "prefer-const": "warn",
      "no-var": "error",

      // Next.js rules
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
