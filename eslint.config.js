import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@stamina/eslint-config/base";
import { nextjsConfig } from "@stamina/eslint-config/nextjs";
import { reactConfig } from "@stamina/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  restrictEnvAccess,
);
