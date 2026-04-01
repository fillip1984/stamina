import { appSchema, baseFields } from "./base";

export const user = appSchema.table("User", (d) => ({
  ...baseFields,
  name: d.text().notNull(),
  email: d.text().notNull().unique(),
  emailVerified: d
    .boolean()
    .$defaultFn(() => false)
    .notNull(),
  image: d.text(),
  // createdAt: d
  //   .timestamp()
  //   .$defaultFn(() => /* @__PURE__ */ new Date())
  //   .notNull(),
  // updatedAt: d
  //   .timestamp()
  //   .$defaultFn(() => /* @__PURE__ */ new Date())
  //   .notNull(),
}));

export const session = appSchema.table("Session", (d) => ({
  // id: d.text().primaryKey(),
  ...baseFields,
  expiresAt: d.timestamp().notNull(),
  token: d.text().notNull().unique(),
  // createdAt: d.timestamp().notNull(),
  // updatedAt: d.timestamp().notNull(),
  ipAddress: d.text(),
  userAgent: d.text(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}));

export const account = appSchema.table("Account", (d) => ({
  // id: d.text().primaryKey(),
  ...baseFields,
  accountId: d.text().notNull(),
  providerId: d.text().notNull(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: d.text(),
  refreshToken: d.text(),
  idToken: d.text(),
  accessTokenExpiresAt: d.timestamp(),
  refreshTokenExpiresAt: d.timestamp(),
  scope: d.text(),
  password: d.text(),
  // createdAt: d.timestamp().notNull(),
  // updatedAt: d.timestamp().notNull(),
}));

export const verification = appSchema.table("Verification", (d) => ({
  // id: d.text().primaryKey(),
  ...baseFields,
  identifier: d.text().notNull(),
  value: d.text().notNull(),
  expiresAt: d.timestamp().notNull(),
  // createdAt: d.timestamp().$defaultFn(() => /* @__PURE__ */ new Date()),
  // updatedAt: d.timestamp().$defaultFn(() => /* @__PURE__ */ new Date()),
}));

// export const userRelations = relations(user, ({ many }) => ({
//   account: many(account),
//   session: many(session),
// }));

// export const accountRelations = relations(account, ({ one }) => ({
//   user: one(user, { fields: [account.userId], references: [user.id] }),
// }));

// export const sessionRelations = relations(session, ({ one }) => ({
//   user: one(user, { fields: [session.userId], references: [user.id] }),
// }));
