import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

if (!process.env.DATABASE_SCHEMA) {
  throw new Error("Missing DATABASE_SCHEMA");
}

console.log("Using DATABASE_SCHEMA:", process.env.DATABASE_SCHEMA);
const nonPoolingUrl = process.env.DATABASE_URL.replace(":6543", ":5432");
export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  schemaFilter: [process.env.DATABASE_SCHEMA],
} satisfies Config;
