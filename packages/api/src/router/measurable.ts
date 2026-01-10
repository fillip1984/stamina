import { addDays, startOfDay } from "date-fns";
import { z } from "zod/v4";

import type { BloodPressureCategoryEnum } from "@stamina/db/enums";
import { and, desc, eq, lt } from "@stamina/db";
import {
  DayOfWeekEnum,
  DaytimeEnum,
  MeasurableTypeEnum,
  OnCompleteEnum,
} from "@stamina/db/enums";
import {
  bloodPressureReadings,
  measurables,
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
        type: z.enum(MeasurableTypeEnum),
        suggestedDay: z.enum(DayOfWeekEnum).nullable(),
        suggestedDayTime: z.enum(DaytimeEnum).nullable(),
        dueDate: z.date().nullable(),
        interval: z.number().min(1).optional(),
        onComplete: z.enum(OnCompleteEnum).nullable(),
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
      where: eq(measurables.userId, ctx.session.user.id),
      orderBy: desc(measurables.dueDate),
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
        where: and(
          eq(measurables.id, input),
          eq(measurables.userId, ctx.session.user.id),
        ),
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        areaId: z.string().nullable(),
        type: z.enum(MeasurableTypeEnum).optional(),
        suggestedDay: z.enum(DayOfWeekEnum).nullable(),
        suggestedDayTime: z.enum(DaytimeEnum).nullable(),
        dueDate: z.date().nullable(),
        interval: z.number().min(1).optional(),
        onComplete: z.enum(OnCompleteEnum).nullable(),
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
        where: and(
          eq(measurables.userId, ctx.session.user.id),
          eq(measurables.id, id),
        ),
      });
      if (!measurable) {
        throw new Error("Measurable not found");
      }
      if (measurable.onComplete === OnCompleteEnum.Weigh_in && !weighIn) {
        throw new Error(
          "Weigh in data is required to complete this measurable",
        );
      }
      if (
        measurable.onComplete === OnCompleteEnum.Blood_pressure_reading &&
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
        measurable.type === MeasurableTypeEnum.Countdown
          ? startOfDay(addDays(newSetDate, effectiveInterval))
          : measurable.type === MeasurableTypeEnum.Seeking
            ? startOfDay(addDays(newSetDate, elapsedDays))
            : undefined;
      // measurable.setDate = newSetDate;
      // measurable.dueDate = newDueDate ?? null;

      // if we were seeking for interval and have set a dueDate, change to count down
      // if type was Countdown or Tally, leave alone
      const newType =
        measurable.type === MeasurableTypeEnum.Seeking
          ? MeasurableTypeEnum.Countdown
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
            where: eq(weighIns.userId, ctx.session.user.id),
            orderBy: desc(weighIns.date),
          });

          await db.insert(weighIns).values({
            userId: ctx.session.user.id,
            date: weighIn.date,
            weight: weighIn.weight,
            bodyFatPercentage: weighIn.bodyFatPercentage,
            previousWeighInId: previousWeighIn ? previousWeighIn.id : null,
            resultId: result[0].id,
          });
        } else if (bloodPressureReading) {
          const previousBloodPressureReading =
            await db.query.bloodPressureReadings.findFirst({
              where: and(
                eq(bloodPressureReadings.userId, ctx.session.user.id),
                lt(bloodPressureReadings.date, bloodPressureReading.date),
              ),
              orderBy: desc(bloodPressureReadings.date),
            });
          const category = determineCategory(bloodPressureReading);
          await db.insert(bloodPressureReadings).values({
            userId: ctx.session.user.id,
            date: bloodPressureReading.date,
            systolic: bloodPressureReading.systolic,
            diastolic: bloodPressureReading.diastolic,
            pulse: bloodPressureReading.pulse,
            category: category as BloodPressureCategoryEnum,
            previousBloodPressureReadingId:
              previousBloodPressureReading?.id ?? null,
            resultId: result[0].id,
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
    return "Hypertension_crisis";
  } else if (bpr.systolic >= 140 || bpr.diastolic >= 90) {
    return "Hypertension_2";
  } else if (bpr.systolic >= 130) {
    return "Hypertension_1";
  } else if (bpr.diastolic >= 80) {
    return "Hypertension_1";
  } else if (bpr.systolic >= 120) {
    return "Elevated";
  } else if (bpr.systolic >= 90) {
    return "Normal";
  } else {
    return "Low";
  }
};
