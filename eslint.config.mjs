// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend recommended Next.js configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Add your custom rules here
  {
    rules: {
      'react/no-unescaped-entities': 'off', // Disables the error about unescaped entities
      '@next/next/no-page-custom-font': 'off', // Disables the rule about custom fonts on pages
    },
  },
];

export default eslintConfig;