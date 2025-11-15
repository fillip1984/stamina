import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { endOfWeek, startOfWeek } from "date-fns";
import type { BloodPressureCategoryEnum } from "@prisma/client";
import { read } from "fs";

export const BloodPressureReadingRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        measurableId: z.string(),
        date: z.date(),
        systolic: z.number(),
        diastolic: z.number(),
        pulse: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const previousBloodPressureReading =
        await ctx.db.bloodPressureReading.findFirst({
          where: {
            // userId: ctx.session.user.id,
            date: {
              lt: input.date,
            },
          },
          orderBy: {
            date: "desc",
          },
        });
      const category = determineCategory(input);
      const txResult = await ctx.db.$transaction(async (db) => {
        const result = await db.result.create({
          data: {
            // userId: ctx.session.user.id,
            measurableId: input.measurableId,
            date: input.date,
            notes: `Blood Pressure Reading recorded: ${input.systolic} over ${input.diastolic}${
              input.pulse ? `, Pulse: ${input.pulse}` : ""
            }, Category: ${category.replaceAll("_", " ")}`,
          },
        });
        const bpr = await db.bloodPressureReading.create({
          data: {
            // userId: ctx.session.user.id,
            date: input.date,
            systolic: input.systolic,
            diastolic: input.diastolic,
            pulse: input.pulse,
            category: category as BloodPressureCategoryEnum,
            previousBloodPressureReadingId:
              previousBloodPressureReading?.id || null,

            resultId: result.id,
          },
        });
        return { bpr, result };
      });
      return txResult;
    }),
  readAll: publicProcedure
    .input(z.object({ filter: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.filter === "This week") {
        console.warn("Probably going to have timezone issues with this");
        const now = new Date();
        const start = startOfWeek(now);
        const end = endOfWeek(now);

        const result = await ctx.db.bloodPressureReading.findMany({
          where: {
            // userId: ctx.session.user.id,
            date: {
              gte: start,
              lte: end,
            },
          },
          orderBy: {
            date: "asc",
          },
        });
        return result;
      }

      if (input.filter === "Last 10") {
        const result = await ctx.db.bloodPressureReading.findMany({
          where: {
            // userId: ctx.session.user.id,
          },
          take: 10,
          orderBy: {
            date: "asc",
          },
        });
        return result;
      }

      const result = await ctx.db.bloodPressureReading.findMany({
        where: {
          // userId: ctx.session.user.id,
        },
        orderBy: {
          date: "asc",
        },
      });
      return result;
    }),
  readById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.bloodPressureReading.findUnique({
        where: {
          id: input.id,
        },
      });
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
