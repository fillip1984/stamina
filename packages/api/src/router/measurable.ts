import { addDays, startOfDay } from "date-fns";
import { z } from "zod/v4";

import { and, desc, eq, lt } from "@stamina/db";
import {
  bloodPressureCategoryEnum,
  bloodPressureReadings,
  dayOfWeekEnum,
  daytimeEnum,
  measurables,
  measurableTypeEnum,
  onCompleteEnum,
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
        type: z.enum(measurableTypeEnum.enumValues),
        suggestedDay: z.enum(dayOfWeekEnum.enumValues).nullable(),
        suggestedDayTime: z.enum(daytimeEnum.enumValues).nullable(),
        dueDate: z.date().nullable(),
        interval: z.number().min(1).optional(),
        onComplete: z.enum(onCompleteEnum.enumValues).nullable(),
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
        type: z.enum(measurableTypeEnum.enumValues).optional(),
        suggestedDay: z.enum(dayOfWeekEnum.enumValues).nullable(),
        suggestedDayTime: z.enum(daytimeEnum.enumValues).nullable(),
        dueDate: z.date().nullable(),
        interval: z.number().min(1).optional(),
        onComplete: z.enum(onCompleteEnum.enumValues).nullable(),
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
      if (
        measurable.onComplete ===
          onCompleteEnum.enumValues.find((e) => e === "Weigh_in") &&
        !weighIn
      ) {
        throw new Error(
          "Weigh in data is required to complete this measurable",
        );
      }
      if (
        measurable.onComplete ===
          onCompleteEnum.enumValues.find(
            (e) => e === "Blood_pressure_reading",
          ) &&
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
        measurable.type === "Countdown"
          ? startOfDay(addDays(newSetDate, effectiveInterval))
          : measurable.type === "Seeking"
            ? startOfDay(addDays(newSetDate, elapsedDays))
            : undefined;
      // measurable.setDate = newSetDate;
      // measurable.dueDate = newDueDate ?? null;

      // if we were seeking for interval and have set a dueDate, change to count down
      // if type was Countdown or Tally, leave alone
      const newType =
        measurable.type === "Seeking" ? "Countdown" : measurable.type;

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

        const result = await db
          .insert(results)
          .values({
            measurableId: id,
            userId: ctx.session.user.id,
            date: new Date(),
            notes: `Completed ${updatedMeasurable[0]!.name}`,
          })
          .returning();
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
            resultId: result[0]!.id,
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
            category: category, //as bloodPressureCategoryEnum,
            previousBloodPressureReadingId:
              previousBloodPressureReading?.id ?? null,
            resultId: result[0]!.id,
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
