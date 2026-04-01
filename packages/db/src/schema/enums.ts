import { appSchema } from "./base";

// Enums, https://github.com/drizzle-team/drizzle-orm/discussions/1914
export enum MeasurableEnum {
  Tally = "Tally",
  Countdown = "Countdown",
  Seeking = "Seeking",
}
export const measurablePgEnum = appSchema.enum(
  "measurableEnum",
  MeasurableEnum,
);

export enum DaytimeEnum {
  Morning = "Morning",
  Afternoon = "Afternoon",
  Evening = "Evening",
  Night = "Night",
}
export const daytimePgEnum = appSchema.enum("daytimeEnum", DaytimeEnum);

export enum DayOfWeekEnum {
  Sunday = "Sunday",
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
}
export const dayOfWeekPgEnum = appSchema.enum("dayOfWeekEnum", DayOfWeekEnum);

export enum OnCompleteEnum {
  Note = "Note",
  Weigh_in = "Weigh_in",
  Blood_pressure_reading = "Blood_pressure_reading",
  Runners_log = "Runners_log",
}
export const onCompletePgEnum = appSchema.enum(
  "onCompleteEnum",
  OnCompleteEnum,
);

export enum BloodPressureCategoryEnum {
  Low = "Low",
  Normal = "Normal",
  Elevated = "Elevated",
  Hypertension_1 = "Hypertension_1",
  Hypertension_2 = "Hypertension_2",
  Hypertension_crisis = "Hypertension_crisis",
}
export const bloodPressureCategoryPgEnum = appSchema.enum(
  "bloodPressureCategoryEnum",
  BloodPressureCategoryEnum,
);
