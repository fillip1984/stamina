import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { dbEnv } from "./dbEnv";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(dbEnv.DATABASE_URL, {
    prepare: false,
    ssl: dbEnv.NODE_ENV === "production" ? "require" : "prefer",
  });
if (dbEnv.NODE_ENV !== "production") globalForDb.conn = conn;
export const db = drizzle(conn, {
  schema,
  logger: dbEnv.NODE_ENV !== "production",
});
