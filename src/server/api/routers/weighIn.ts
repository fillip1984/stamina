import { endOfWeek, startOfWeek } from "date-fns";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const WeighInRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        measurableId: z.string(),
        date: z.date(),
        weight: z.number(),
        bodyFatPercentage: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const previousWeighIn = await ctx.db.weighIn.findFirst({
        where: {
          // userId: ctx.session.user.id,
        },
        orderBy: {
          date: "desc",
        },
      });
      const txResult = await ctx.db.$transaction(async (db) => {
        const result = await db.result.create({
          data: {
            // userId: ctx.session.user.id,
            measurableId: input.measurableId,
            date: input.date,
            notes: `Weigh-in recorded: ${input.weight} lbs${
              input.bodyFatPercentage
                ? `, Body Fat: ${input.bodyFatPercentage}%`
                : ""
            }`,
          },
        });
        const weighIn = await db.weighIn.create({
          data: {
            // userId: ctx.session.user.id,
            date: input.date,
            weight: input.weight,
            bodyFatPercentage: input.bodyFatPercentage,
            previousWeighInId: previousWeighIn ? previousWeighIn.id : null,
            resultId: result.id,
          },
        });
        return { weighIn, result };
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

        const result = await ctx.db.weighIn.findMany({
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
        const result = await ctx.db.weighIn.findMany({
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

      const result = await ctx.db.weighIn.findMany({
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
      const weighIn = await ctx.db.weighIn.findUnique({
        where: {
          id: input.id,
          // userId: ctx.session.user.id
        },
      });
      return weighIn;
    }),
  getWeightGoal: publicProcedure.query(async ({ ctx }) => {
    const weightGoal = await ctx.db.weightGoal.findFirst({
      // where: { userId: ctx.session.user.id },
    });
    return weightGoal;
  }),
  setWeightGoal: publicProcedure
    .input(
      z.object({
        weightGoal: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentGoal = await ctx.db.weightGoal.findFirst({
        // where: { userId: ctx.session.user.id },
      });
      if (currentGoal) {
        const updatedGoal = await ctx.db.weightGoal.update({
          where: { id: currentGoal.id },
          data: {
            weight: input.weightGoal,
          },
        });
        return updatedGoal;
      } else {
        const newGoal = await ctx.db.weightGoal.create({
          data: {
            // userId: ctx.session.user.id,
            weight: input.weightGoal,
          },
        });
        return newGoal;
      }
    }),
});
