import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "artifacts/**",
    "backups/**",
    "development/**",
  ]),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [{
            "group": ["**/development/**", "*/development/**", "development/**", "../development/**", "../../development/**", "../../../development/**"],
            "message": "Production runtime imports from development/ are strictly prohibited."
          }]
        }
      ]
    }
  }
]);

export default eslintConfig;
