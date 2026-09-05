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
    // Playwright specs are type-checked/run by Playwright's own toolchain.
    "e2e/**",
    "playwright.config.ts",
    "test-results/**",
    "playwright-report/**",
  ]),
  {
    // Vendored React Bits components drive an imperative WebGL (ogl) render loop
    // from a useEffect + refs. The new react-hooks immutability/ref lints don't
    // model that; scope them off for the vendored files rather than editing
    // upstream code.
    files: ["components/reactbits/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      // PillNav renders a caller-supplied logo URL via a plain <img>; next/image
      // buys nothing for a inline-SVG monogram in the nav.
      "@next/next/no-img-element": "off",
    },
  },
  {
    // The hero character is a CSS sprite sheet driven by background-position,
    // which next/image cannot serve; the two <img> tags alongside it are the
    // already-optimised static WebPs the stack loads and fades between.
    files: ["components/hero/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
