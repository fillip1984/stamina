import {
  DayOfWeekEnum,
  DaytimeEnum,
  MeasurableTypeEnum,
  OnCompleteEnum,
} from "@prisma/client";
import { addDays, startOfDay } from "date-fns";
import { z } from "zod";

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
      return ctx.db.measurable.create({
        data: {
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
        },
      });
    }),
  findAll: protectedProcedure.query(async ({ ctx }) => {
    const measurables = await ctx.db.measurable.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { dueDate: "desc" },
    });

    measurables.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return -1;
      if (!b.dueDate) return 1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

    return measurables;
  }),
  findById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.measurable.findUnique({
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
        type: z.enum(MeasurableTypeEnum).optional(),
        suggestedDay: z.enum(DayOfWeekEnum).nullable(),
        suggestedDayTime: z.enum(DaytimeEnum).nullable(),
        dueDate: z.date().nullable(),
        interval: z.number().min(1).optional(),
        onComplete: z.enum(OnCompleteEnum).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.measurable.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: {
          name: input.name,
          description: input.description,
          areaId: input.areaId,
          type: input.type,
          suggestedDay: input.suggestedDay,
          suggestedDayTime: input.suggestedDayTime,
          dueDate: input.dueDate,
          interval: input.interval,
          onComplete: input.onComplete,
        },
      });
    }),
  complete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const measurable = await ctx.db.measurable.findUnique({
        where: { id: input, userId: ctx.session.user.id },
      });
      if (!measurable) {
        throw new Error("Measurable not found");
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
      measurable.setDate = newSetDate;
      measurable.dueDate = newDueDate ?? null;

      // if we were seeking for interval and have set a dueDate, change to count down
      // if type was Countdown or Tally, leave alone
      const newType =
        measurable.type === "Seeking" ? "Countdown" : measurable.type;

      if (
        measurable.onComplete === "Blood_pressure_reading" ||
        measurable.onComplete === "Weigh_in"
      ) {
        // result already accounted for these types

        return ctx.db.result.create({
          data: {
            measurableId: input,
            date: new Date(),
            notes: `Completed measurable: ${measurable.name}`,
            userId: ctx.session.user.id,
          },
        });
      } else {
        const txResult = await ctx.db.$transaction([
          ctx.db.measurable.update({
            where: { id: input, userId: ctx.session.user.id },
            data: {
              type: newType,
              setDate: measurable.setDate,
              dueDate: measurable.dueDate,
              interval: newType === "Countdown" ? effectiveInterval : undefined,
            },
          }),
          ctx.db.result.create({
            data: {
              measurableId: input,
              date: new Date(),
              notes: `Completed measurable: ${measurable.name}`,
              userId: ctx.session.user.id,
            },
          }),
        ]);
        return txResult;
      }
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.measurable.delete({
        where: { id: input, userId: ctx.session.user.id },
      });
    }),
});
