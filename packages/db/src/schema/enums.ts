import { appSchema } from "./base";

export const MeasurableTypeEnumRAW = ["Tally", "Countdown", "Seeking"] as const;
export const measurableTypeEnum = appSchema.enum(
  "MeasurableTypeEnum",
  MeasurableTypeEnumRAW,
);

export const DaytimeEnumRAW = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
] as const;
export const daytimeEnum = appSchema.enum("DaytimeEnum", DaytimeEnumRAW);

export const DayOfWeekEnumRAW = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export const dayOfWeekEnum = appSchema.enum("DayOfWeekEnum", DayOfWeekEnumRAW);

export const OnCompleteEnumRAW = [
  "Note",
  "Weigh_in",
  "Blood_pressure_reading",
  "Runners_log",
] as const;
export const onCompleteEnum = appSchema.enum(
  "OnCompleteEnum",
  OnCompleteEnumRAW,
);

export const BLOOD_PRESSURE_ENUM = [
  "Low",
  "Normal",
  "Elevated",
  "Hypertension_1",
  "Hypertension_2",
  "Hypertension_crisis",
] as const;
export const bloodPressureCategoryEnum = appSchema.enum(
  "BloodPressureCategoryEnum",
  BLOOD_PRESSURE_ENUM,
);
// Enums, https://github.com/drizzle-team/drizzle-orm/discussions/1914
// export enum MeasurableTypeEnum {
//   Tally = "Tally",
//   Countdown = "Countdown",
//   Seeking = "Seeking",
// }
// export const measurableTypePgEnum = pgEnum(
//   "MeasurableTypeEnum11",
//   MeasurableTypeEnum,
// );

// export enum DaytimeEnum {
//   Morning = "Morning",
//   Afternoon = "Afternoon",
//   Evening = "Evening",
//   Night = "Night",
// }
// export const daytimePgEnum = pgEnum("DaytimeEnum11", DaytimeEnum);

// export enum DayOfWeekEnum {
//   Sunday = "Sunday",
//   Monday = "Monday",
//   Tuesday = "Tuesday",
//   Wednesday = "Wednesday",
//   Thursday = "Thursday",
//   Friday = "Friday",
//   Saturday = "Saturday",
// }
// export const dayOfWeekPgEnum = pgEnum("DayOfWeekEnum11", DayOfWeekEnum);

// export enum OnCompleteEnum {
//   Note = "Note",
//   Weigh_in = "Weigh_in",
//   Blood_pressure_reading = "Blood_pressure_reading",
//   Runners_log = "Runners_log",
// }
// export const onCompletePgEnum = pgEnum("OnCompleteEnum", OnCompleteEnum);

// export const BLOOD_PRESSURE_ENUM = [
//   "Low",
//   "Normal",
//   "Elevated",
//   "Hypertension_1",
//   "Hypertension_2",
//   "Hypertension_crisis",
// ] as const;
// export const bloodPressureCategoryPgEnum = pgEnum(
//   "BloodPressureCategoryEnum1122",
//   BLOOD_PRESSURE_ENUM,
// );
