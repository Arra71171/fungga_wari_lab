import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // Iron Law: @ts-ignore requires a two-line explanatory comment.
      // Never disable without documented reason and removal timeline.
      "@typescript-eslint/ban-ts-comment": "warn",
      // NOTE: no-explicit-any is intentionally NOT disabled here.
      // Use `unknown` + type narrowing, or derive from Zod/Supabase types.
      // If you need any, add a justified `// eslint-disable-next-line` with reason.
    },
  },
]
