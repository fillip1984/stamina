import { relations } from "drizzle-orm";

import { user } from "./auth-schema";
import { appSchema, baseFields } from "./db-utils";
import {
  bloodPressureCategoryPgEnum,
  dayOfWeekPgEnum,
  daytimePgEnum,
  measurableTypePgEnum,
  onCompletePgEnum,
} from "./enums";

// Tables
export const areas = appSchema.table(
  "Area",
  (t) => ({
    ...baseFields,
    name: t.text("name").notNull(),
    description: t.text("description").notNull(),
    userId: t
      .text("userId")
      .notNull()
      .references(() => user.id),
  }),
  // (table) => [index().on(table.name, table.userId)],
);

export const measurables = appSchema.table(
  "Measurable",
  (t) => ({
    ...baseFields,
    name: t.text("name").notNull(),
    description: t.text("description").notNull(),
    type: measurableTypePgEnum("type").notNull(),
    setDate: t.timestamp("setDate").notNull(),
    dueDate: t.timestamp("dueDate"),
    suggestedDayTime: daytimePgEnum("suggestedDayTime"),
    suggestedDay: dayOfWeekPgEnum("suggestedDay"),
    interval: t.integer("interval"),
    onComplete: onCompletePgEnum("onComplete"),
    areaId: t
      .text("areaId")
      .references(() => areas.id, { onDelete: "set null" }),
    userId: t
      .text("userId")
      .notNull()
      .references(() => user.id),
  }),
  // (table) => ({
  //   nameUserIdIdx: index().on(table.name, table.userId),
  // }),
);

export const results = appSchema.table(
  "Result",
  (t) => ({
    ...baseFields,
    date: t.timestamp("date").notNull(),
    notes: t.text("notes").notNull(),
    measurableId: t.text("measurableId").notNull(),
    userId: t
      .text("userId")
      .notNull()
      .references(() => user.id),
  }),
  // (table) => ({
  //   dateUserIdIdx: index().on(table.date, table.userId),
  //   measurableIdIdx: index().on(table.measurableId),
  // }),
);

export const weighIns = appSchema.table("WeighIn", (t) => ({
  ...baseFields,
  date: t.timestamp("date").notNull(),
  weight: t.real("weight").notNull(),
  bodyFatPercentage: t.real("bodyFatPercentage"),
  previousWeighInId: t.text("previousWeighInId"),
  resultId: t
    .text("resultId")
    .notNull()
    .unique()
    .references(() => results.id),
  userId: t
    .text("userId")
    .notNull()
    .references(() => user.id),
}));

export const weightGoals = appSchema.table("WeightGoal", (t) => ({
  ...baseFields,
  weight: t.real("weight"),
  userId: t
    .text("userId")
    .notNull()
    .unique()
    .references(() => user.id),
}));

export const bloodPressureReadings = appSchema.table(
  "BloodPressureReading",
  (t) => ({
    ...baseFields,
    date: t.timestamp("date").notNull(),
    systolic: t.integer("systolic").notNull(),
    diastolic: t.integer("diastolic").notNull(),
    pulse: t.integer("pulse"),
    category: bloodPressureCategoryPgEnum("category").notNull(),
    previousBloodPressureReadingId: t.text("previousBloodPressureReadingId"),
    resultId: t
      .text("resultId")
      .notNull()
      .unique()
      .references(() => results.id),
    userId: t
      .text("userId")
      .notNull()
      .references(() => user.id),
  }),
);

// Relations
export const usersRelations = relations(user, ({ many, one }) => ({
  areas: many(areas),
  measurables: many(measurables),
  results: many(results),
  weightGoal: one(weightGoals),
  weighIns: many(weighIns),
  bloodPressureReadings: many(bloodPressureReadings),
}));

export const areasRelations = relations(areas, ({ one, many }) => ({
  user: one(user, { fields: [areas.userId], references: [user.id] }),
  measurables: many(measurables),
}));

export const measurablesRelations = relations(measurables, ({ one }) => ({
  area: one(areas, { fields: [measurables.areaId], references: [areas.id] }),
  user: one(user, { fields: [measurables.userId], references: [user.id] }),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  user: one(user, { fields: [results.userId], references: [user.id] }),
  weighIn: one(weighIns),
  bloodPressureReading: one(bloodPressureReadings),
}));

export const weighInsRelations = relations(weighIns, ({ one }) => ({
  result: one(results, {
    fields: [weighIns.resultId],
    references: [results.id],
  }),
  user: one(user, { fields: [weighIns.userId], references: [user.id] }),
}));

export const weightGoalsRelations = relations(weightGoals, ({ one }) => ({
  user: one(user, { fields: [weightGoals.userId], references: [user.id] }),
}));

export const bloodPressureReadingsRelations = relations(
  bloodPressureReadings,
  ({ one }) => ({
    result: one(results, {
      fields: [bloodPressureReadings.resultId],
      references: [results.id],
    }),
    user: one(user, {
      fields: [bloodPressureReadings.userId],
      references: [user.id],
    }),
  }),
);

export * from "./auth-schema";
export * from "./enums";
