import { createId } from "@paralleldrive/cuid2";
import { pgSchema, text, timestamp } from "drizzle-orm/pg-core";

// if (!process.env.DATABASE_SCHEMA) {
//   throw new Error("Missing DATABASE_SCHEMA");
// }

/**
 * Table schema is used to separate different applications using the same database.
 */
// export const appSchema = pgSchema(process.env.DATABASE_SCHEMA);
export const appSchema = pgSchema("stamina");

/**
 * Base fields for all tables.
 */
export const baseFields = {
  // id: uuid().primaryKey().defaultRandom(),
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => /* @__PURE__ */ new Date()),
};
