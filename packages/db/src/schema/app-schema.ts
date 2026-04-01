import { user } from "./auth-schema";
import { appSchema, baseFields } from "./base";
import {
  bloodPressureCategoryPgEnum,
  dayOfWeekPgEnum,
  daytimePgEnum,
  measurablePgEnum,
  onCompletePgEnum,
} from "./enums";

export const areas = appSchema.table("Area", (t) => ({
  ...baseFields,
  name: t.text().notNull(),
  description: t.text().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id),
}));

export const measurables = appSchema.table("Measurable", (t) => ({
  ...baseFields,
  name: t.text("name").notNull(),
  description: t.text().notNull(),
  type: measurablePgEnum().notNull(),
  setDate: t.timestamp().notNull(),
  dueDate: t.timestamp(),
  suggestedDayTime: daytimePgEnum(),
  suggestedDay: dayOfWeekPgEnum(),
  interval: t.integer(),
  onComplete: onCompletePgEnum(),
  areaId: t.text().references(() => areas.id, { onDelete: "set null" }),
  userId: t
    .text()
    .notNull()
    .references(() => user.id),
}));

export const results = appSchema.table("Result", (t) => ({
  ...baseFields,
  date: t.timestamp().notNull(),
  notes: t.text().notNull(),
  measurableId: t.text().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id),
}));

export const weighIns = appSchema.table("WeighIn", (t) => ({
  ...baseFields,
  date: t.timestamp().notNull(),
  weight: t.real().notNull(),
  bodyFatPercentage: t.real(),
  previousWeighInId: t.text(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id),
}));

export const weightGoals = appSchema.table("WeightGoal", (t) => ({
  ...baseFields,
  weight: t.real(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id),
}));

export const bloodPressureReadings = appSchema.table(
  "BloodPressureReading",
  (t) => ({
    ...baseFields,
    date: t.timestamp().notNull(),
    systolic: t.integer().notNull(),
    diastolic: t.integer().notNull(),
    pulse: t.integer(),
    category: bloodPressureCategoryPgEnum().notNull(),
    previousBloodPressureReadingId: t.text(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id),
  }),
);
