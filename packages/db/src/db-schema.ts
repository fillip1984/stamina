import { createId } from "@paralleldrive/cuid2";
import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { env } from "~/env";

console.log("DB SCHEMA:", "stamina");
export const appSchema = pgSchema("stamina");

export const baseFields = {
  // id: uuid().primaryKey().defaultRandom(),
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => /* @__PURE__ */ new Date()),
};
