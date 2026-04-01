import { defineRelations } from "drizzle-orm";

import * as schema from "./index";

export const relations = defineRelations(schema, (r) => ({
  areas: {
    measurables: r.many.measurables(),
    user: r.one.user({
      from: r.areas.userId,
      to: r.user.id,
    }),
  },
  measurables: {
    area: r.one.areas({
      from: r.measurables.areaId,
      to: r.areas.id,
    }),
    user: r.one.user({
      from: r.measurables.userId,
      to: r.user.id,
    }),
  },
  results: {
    weighIn: r.one.weighIns({
      from: r.results.measurableId,
      to: r.weighIns.id,
    }),
    bloodPressureReading: r.one.bloodPressureReadings({
      from: r.results.measurableId,
      to: r.bloodPressureReadings.id,
    }),
    user: r.one.user({
      from: r.results.userId,
      to: r.user.id,
    }),
  },
  weighIns: {
    weighIns: r.one.weighIns({
      from: r.weighIns.previousWeighInId,
      to: r.weighIns.id,
    }),
    user: r.one.user({
      from: r.weighIns.userId,
      to: r.user.id,
    }),
  },
  weightGoals: {
    user: r.one.user({
      from: r.weightGoals.userId,
      to: r.user.id,
    }),
  },
  bloodPressureReadings: {
    bloodPressureReadings: r.one.bloodPressureReadings({
      from: r.bloodPressureReadings.previousBloodPressureReadingId,
      to: r.bloodPressureReadings.id,
    }),
    user: r.one.user({
      from: r.bloodPressureReadings.userId,
      to: r.user.id,
    }),
  },
  // export const usersRelations = relations(user, ({ many, one }) => ({
  //   areas: many(areas),
  //   measurables: many(measurables),
  //   results: many(results),
  //   weightGoal: one(weightGoals),
  //   weighIns: many(weighIns),
  //   bloodPressureReadings: many(bloodPressureReadings),
  // }));
  /// auth relations
  user: {
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
    // verifications: r.many.verification(),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
}));
