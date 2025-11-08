import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { endOfWeek, startOfWeek } from "date-fns";
import type { BloodPressureCategoryEnum } from "@prisma/client";

export const BloodPressureReadingRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        date: z.date(),
        systolic: z.number(),
        diastolic: z.number(),
        pulse: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const category = determineCategory(input);

      const result = await ctx.db.bloodPressureReading.create({
        data: {
          // userId: ctx.session.user.id,
          date: input.date,
          systolic: input.systolic,
          diastolic: input.diastolic,
          pulse: input.pulse ? parseInt(input.pulse) : null,
          category: category as BloodPressureCategoryEnum,
        },
      });
      return result;
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
});

const determineCategory = (bpr: { systolic: number; diastolic: number }) => {
  if (bpr.systolic > 180 || bpr.diastolic > 120) {
    return "Hypertensive_crisis";
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
