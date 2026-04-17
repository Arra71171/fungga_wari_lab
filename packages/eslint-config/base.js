import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXElement[openingElement.name.name='img']",
          message: "Do not use raw <img> tags. Use next/image instead to ensure performance and optimization.",
        },
        {
          selector: "JSXElement[openingElement.name.name='a'][openingElement.attributes.length>0]",
          message: "Do not use raw <a> tags. Use next/link instead for internal routing.",
        },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
  },
]
