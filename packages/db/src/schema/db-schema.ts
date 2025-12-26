import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { env } from "~/env";

export const appSchema = pgSchema(env.DATABASE_SCHEMA);

export const baseFields = {
  // id: uuid().primaryKey().defaultRandom(),
  id: text().primaryKey(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => /* @__PURE__ */ new Date()),
};
