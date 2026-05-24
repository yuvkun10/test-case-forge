import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    ignores: ["dist/**", "coverage/**"]
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-confusing-void-expression": "off"
    }
  }
);
