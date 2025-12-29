import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@stamina/eslint-config/base";
import { reactConfig } from "@stamina/eslint-config/react";

// const { defineConfig } = require("eslint/config");
// const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
  // expoConfig,
  restrictEnvAccess,
]);
