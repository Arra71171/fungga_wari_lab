import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    // Ignore vendored ONNX runtime minified assets — not source code
    ignores: ["public/onnx/**"],
  },
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];
