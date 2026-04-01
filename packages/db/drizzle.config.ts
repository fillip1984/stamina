import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

if (!process.env.DATABASE_SCHEMA) {
  throw new Error("Missing DATABASE_SCHEMA");
}

const nonPoolingUrl = process.env.DATABASE_URL.replace(":6543", ":5432");

// TODO: you have to change dbCredentials to individual sections to work on prod: https://github.com/drizzle-team/drizzle-orm/issues/4527
export default {
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: nonPoolingUrl,
    ssl: process.env.NODE_ENV === "production" ? "require" : "prefer",
  },
  schemaFilter: [`${process.env.DATABASE_SCHEMA}`],
  casing: "camelCase",
} satisfies Config;
