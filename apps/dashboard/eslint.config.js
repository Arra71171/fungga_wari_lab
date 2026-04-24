import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    // Ignore standalone Node.js CJS utility scripts — not part of the Next.js app.
    // These use require() and process.env which are invalid in ESM/browser lint context.
    ignores: ["reset_pwd.js", "reset_pwd.cjs", "create_superadmin.js"],
  },
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
