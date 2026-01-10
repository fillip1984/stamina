import { pgEnum } from "drizzle-orm/pg-core";

// Enums, https://github.com/drizzle-team/drizzle-orm/discussions/1914
export enum MeasurableTypeEnum {
  Tally = "Tally",
  Countdown = "Countdown",
  Seeking = "Seeking",
}
export const measurableTypePgEnum = pgEnum(
  "MeasurableTypeEnum",
  MeasurableTypeEnum,
);

export enum DaytimeEnum {
  Morning = "Morning",
  Afternoon = "Afternoon",
  Evening = "Evening",
  Night = "Night",
}
export const daytimePgEnum = pgEnum("DaytimeEnum", DaytimeEnum);

export enum DayOfWeekEnum {
  Sunday = "Sunday",
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
}
export const dayOfWeekPgEnum = pgEnum("DayOfWeekEnum", DayOfWeekEnum);

export enum OnCompleteEnum {
  Note = "Note",
  Weigh_in = "Weigh_in",
  Blood_pressure_reading = "Blood_pressure_reading",
  Runners_log = "Runners_log",
}
export const onCompletePgEnum = pgEnum("OnCompleteEnum", OnCompleteEnum);

export enum BloodPressureCategoryEnum {
  Low = "Low",
  Normal = "Normal",
  Elevated = "Elevated",
  Hypertension_1 = "Hypertension_1",
  Hypertension_2 = "Hypertension_2",
  Hypertension_crisis = "Hypertension_crisis",
}
export const bloodPressureCategoryPgEnum = pgEnum(
  "BloodPressureCategoryEnum",
  BloodPressureCategoryEnum,
);
