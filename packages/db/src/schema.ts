import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { appSchema, baseFields } from "./db-schema";

// Enums
export const measurableTypeEnum = pgEnum("MeasurableTypeEnum", [
  "Tally",
  "Countdown",
  "Seeking",
]);
export const daytimeEnum = pgEnum("DaytimeEnum", [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
]);
export const dayOfWeekEnum = pgEnum("DayOfWeekEnum", [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);
export const onCompleteEnum = pgEnum("OnCompleteEnum", [
  "Note",
  "Weigh_in",
  "Blood_pressure_reading",
  "Runners_log",
]);
export const bloodPressureCategoryEnum = pgEnum("BloodPressureCategoryEnum", [
  "Low",
  "Normal",
  "Elevated",
  "Hypertension_1",
  "Hypertension_2",
  "Hypertension_crisis",
]);

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
  (table) => [index().on(table.name, table.userId)],
);

export const measurables = appSchema.table(
  "Measurable",
  {
    ...baseFields,
    name: text("name").notNull(),
    description: text("description").notNull(),
    type: measurableTypeEnum("type").notNull(),
    setDate: timestamp("setDate").notNull(),
    dueDate: timestamp("dueDate"),
    suggestedDayTime: daytimeEnum("suggestedDayTime"),
    suggestedDay: dayOfWeekEnum("suggestedDay"),
    interval: integer("interval"),
    onComplete: onCompleteEnum("onComplete"),
    areaId: text("areaId").references(() => areas.id, { onDelete: "set null" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    nameUserIdIdx: index().on(table.name, table.userId),
  }),
);

export const results = appSchema.table(
  "Result",
  {
    ...baseFields,
    date: timestamp("date").notNull(),
    notes: text("notes").notNull(),
    measurableId: text("measurableId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    dateUserIdIdx: index().on(table.date, table.userId),
    measurableIdIdx: index().on(table.measurableId),
  }),
);

export const weighIns = appSchema.table("WeighIn", {
  ...baseFields,
  date: timestamp("date").notNull(),
  weight: real("weight").notNull(),
  bodyFatPercentage: real("bodyFatPercentage"),
  previousWeighInId: text("previousWeighInId"),
  resultId: text("resultId")
    .notNull()
    .unique()
    .references(() => results.id),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export const weightGoals = appSchema.table("WeightGoal", {
  ...baseFields,
  weight: real("weight"),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => user.id),
});

export const bloodPressureReadings = appSchema.table("BloodPressureReading", {
  ...baseFields,
  date: timestamp("date").notNull(),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  pulse: integer("pulse"),
  category: bloodPressureCategoryEnum("category").notNull(),
  previousBloodPressureReadingId: text("previousBloodPressureReadingId"),
  resultId: text("resultId")
    .notNull()
    .unique()
    .references(() => results.id),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

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
