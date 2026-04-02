import { defineConfig } from "eslint/config";

import { baseConfig } from "@stamina/eslint-config/base";
import { reactConfig } from "@stamina/eslint-config/react";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
);
