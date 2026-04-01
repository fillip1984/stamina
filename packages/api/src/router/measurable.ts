import { addDays, startOfDay } from "date-fns";
import { z } from "zod/v4";

import { and, eq } from "@stamina/db";
import {
  BLOOD_PRESSURE_ENUM,
  bloodPressureReadings,
  DayOfWeekEnumRAW,
  DaytimeEnumRAW,
  measurables,
  MeasurableTypeEnumRAW,
  OnCompleteEnumRAW,
  results,
  weighIns,
} from "@stamina/db/schema";

import { calculateMeasurableProgress } from "../client/measurableUtils";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const measurableRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        areaId: z.string().nullable(),
        type: z.enum(MeasurableTypeEnumRAW),
        suggestedDay: z.enum(DayOfWeekEnumRAW).nullable(),
        suggestedDayTime: z.enum(DaytimeEnumRAW).nullable(),
        dueDate: z.date().nullable(),
        interval: z.number().min(1).optional(),
        onComplete: z.enum(OnCompleteEnumRAW).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(measurables).values({
        setDate: new Date(),
        name: input.name,
        description: input.description,
        areaId: input.areaId,
        type: input.type,
        suggestedDay: input.suggestedDay,
        suggestedDayTime: input.suggestedDayTime,
        dueDate: input.dueDate,
        interval: input.interval,
        onComplete: input.onComplete,
        userId: ctx.session.user.id,
      });
    }),
  findAll: protectedProcedure.query(async ({ ctx }) => {
    const measurablesToReturn = await ctx.db.query.measurables.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { dueDate: "desc" },
    });

    measurablesToReturn.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return -1;
      if (!b.dueDate) return 1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

    return measurablesToReturn;
  }),
  findById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.measurables.findFirst({
        where: { id: input, userId: ctx.session.user.id },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        areaId: z.string().nullable(),
        type: z.enum(MeasurableTypeEnumRAW).optional(),
        suggestedDay: z.enum(DayOfWeekEnumRAW).nullable(),
        suggestedDayTime: z.enum(DaytimeEnumRAW).nullable(),
        dueDate: z.date().nullable(),
        interval: z.number().min(1).optional(),
        onComplete: z.enum(OnCompleteEnumRAW).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(measurables)
        .set({
          name: input.name,
          description: input.description,
          areaId: input.areaId,
          type: input.type,
          suggestedDay: input.suggestedDay,
          suggestedDayTime: input.suggestedDayTime,
          dueDate: input.dueDate,
          interval: input.interval,
          onComplete: input.onComplete,
        })
        .where(
          and(
            eq(measurables.id, input.id),
            eq(measurables.userId, ctx.session.user.id),
          ),
        );
    }),
  complete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        weighIn: z
          .object({
            date: z.date(),
            weight: z.number(),
            bodyFatPercentage: z.number().optional(),
          })
          .nullish(),
        bloodPressureReading: z
          .object({
            date: z.date(),
            systolic: z.number(),
            diastolic: z.number(),
            pulse: z.number().optional(),
          })
          .nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, weighIn, bloodPressureReading } = input;
      const measurable = await ctx.db.query.measurables.findFirst({
        where: { id, userId: ctx.session.user.id },
      });
      if (!measurable) {
        throw new Error("Measurable not found");
      }
      if (
        measurable.onComplete === OnCompleteEnumRAW[1] && // Weigh_in
        !weighIn
      ) {
        throw new Error(
          "Weigh in data is required to complete this measurable",
        );
      }
      if (
        measurable.onComplete === OnCompleteEnumRAW[2] && // Blood_pressure_reading
        !bloodPressureReading
      ) {
        throw new Error(
          "Blood pressure reading data is required to complete this measurable",
        );
      }

      // increment setDate to previous dueDate
      // if no previous due date, and type was seeking, set to elapsed days
      // if no previous due date, and type was tally, leave due date undefined
      const { interval, elapsedDays } = calculateMeasurableProgress(
        measurable.setDate,
        measurable.dueDate ?? new Date(),
      );
      const effectiveInterval = measurable.interval ?? interval;
      const newSetDate = startOfDay(measurable.dueDate ?? new Date());
      const newDueDate =
        measurable.type === MeasurableTypeEnumRAW[1] //.Countdown
          ? startOfDay(addDays(newSetDate, effectiveInterval))
          : measurable.type === MeasurableTypeEnumRAW[2] //.Seeking
            ? startOfDay(addDays(newSetDate, elapsedDays))
            : undefined;
      // measurable.setDate = newSetDate;
      // measurable.dueDate = newDueDate ?? null;

      // if we were seeking for interval and have set a dueDate, change to count down
      // if type was Countdown or Tally, leave alone
      const newType =
        measurable.type === MeasurableTypeEnumRAW[2] //.Seeking
          ? MeasurableTypeEnumRAW[1] //.Countdown
          : measurable.type;

      const tx = ctx.db.transaction(async (db) => {
        const updatedMeasurable = await db
          .update(measurables)
          .set({
            type: newType,
            setDate: newSetDate,
            dueDate: newDueDate,
            interval: effectiveInterval,
          })
          .where(
            and(
              eq(measurables.id, measurable.id),
              eq(measurables.userId, ctx.session.user.id),
            ),
          )
          .returning();

        if (!updatedMeasurable[0]) {
          throw new Error("Failed to find measurable being completed");
        }

        const result = await db
          .insert(results)
          .values({
            measurableId: id,
            userId: ctx.session.user.id,
            date: new Date(),
            notes: `Completed ${updatedMeasurable[0].name}`,
          })
          .returning();

        if (!result[0]) {
          throw new Error("Failed to record result of completing measurable");
        }

        if (weighIn) {
          const previousWeighIn = await db.query.weighIns.findFirst({
            where: { userId: ctx.session.user.id },
            orderBy: { date: "desc" },
          });

          await db.insert(weighIns).values({
            userId: ctx.session.user.id,
            date: weighIn.date,
            weight: weighIn.weight,
            bodyFatPercentage: weighIn.bodyFatPercentage,
            previousWeighInId: previousWeighIn ? previousWeighIn.id : null,
            // resultId: result[0].id,
          });
        } else if (bloodPressureReading) {
          const previousBloodPressureReading =
            await db.query.bloodPressureReadings.findFirst({
              where: {
                userId: ctx.session.user.id,
                date: { lt: bloodPressureReading.date },
              },
              orderBy: { date: "desc" },
            });
          const category = determineCategory(bloodPressureReading);
          await db.insert(bloodPressureReadings).values({
            userId: ctx.session.user.id,
            date: bloodPressureReading.date,
            systolic: bloodPressureReading.systolic,
            diastolic: bloodPressureReading.diastolic,
            pulse: bloodPressureReading.pulse,
            category,
            previousBloodPressureReadingId:
              previousBloodPressureReading?.id ?? null,
            // resultId: result[0].id,
          });
        }

        return {
          result,
          updatedMeasurable,
        };
      });

      return tx;
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(measurables)
        .where(
          and(
            eq(measurables.id, input),
            eq(measurables.userId, ctx.session.user.id),
          ),
        );
    }),
});

const determineCategory = (bpr: { systolic: number; diastolic: number }) => {
  if (bpr.systolic > 180 || bpr.diastolic > 120) {
    return BLOOD_PRESSURE_ENUM[5]; // "Hypertension_crisis"
  } else if (bpr.systolic >= 140 || bpr.diastolic >= 90) {
    return BLOOD_PRESSURE_ENUM[4]; // "Hypertension_2"
  } else if (bpr.systolic >= 130) {
    return BLOOD_PRESSURE_ENUM[3]; // "Hypertension_1"
  } else if (bpr.diastolic >= 80) {
    return BLOOD_PRESSURE_ENUM[3]; // "Hypertension_1"
  } else if (bpr.systolic >= 120) {
    return BLOOD_PRESSURE_ENUM[2]; // "Elevated"
  } else if (bpr.systolic >= 90) {
    return BLOOD_PRESSURE_ENUM[1]; // "Normal"
  } else {
    return BLOOD_PRESSURE_ENUM[0]; // "Low"
  }
};
