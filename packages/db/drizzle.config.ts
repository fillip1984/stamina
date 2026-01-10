import type { Config } from "drizzle-kit";

import { dbEnv } from "./src/dbEnv";

// const nonPoolingUrl = process.env.DATABASE_URL.replace(":6543", ":5432");
export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbEnv.DATABASE_URL,
    ssl: dbEnv.NODE_ENV === "production" ? "require" : "prefer",
  },
  schemaFilter: [dbEnv.DATABASE_SCHEMA],
  casing: "camelCase",
} satisfies Config;
