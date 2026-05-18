import tsParser from "@typescript-eslint/parser";

/**
 * Minimal flat config. Next 16's eslint-config-next doesn't expose a true
 * flat-config build yet, so we wire @typescript-eslint/parser directly and
 * apply a few project-specific rules. `tsc --noEmit` (`pnpm typecheck`)
 * remains the primary safety net.
 */
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "sanity/.sanity/**",
      "public/**",
      "scripts/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-debugger": "error",
      "prefer-const": "warn",
    },
  },
];
