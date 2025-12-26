import type { Config } from "drizzle-kit";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

if (!process.env.DATABASE_SCHEMA) {
  throw new Error("Missing DATABASE_SCHEMA");
}

const nonPoolingUrl = process.env.POSTGRES_URL.replace(":6543", ":5432");
export default {
  schema: "./src/schema",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  schemaFilter: [process.env.DATABASE_SCHEMA],
} satisfies Config;
