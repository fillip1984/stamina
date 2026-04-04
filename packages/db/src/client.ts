import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./index";
import * as relations from "./schema/relations";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not set");
// }

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

// const conn =
//   globalForDb.conn ??
//   postgres(process.env.DATABASE_URL, {
//     prepare: false,
//     ssl: process.env.NODE_ENV === "production" ? "require" : "prefer",
//   });
// if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

export const db = drizzle({
  client: pool,
  ...schema,
  ...relations,
  // logger: process.env.NODE_ENV !== "production",
});

// const result = await db.execute("select 1");
// console.log("Database connected:", result);
