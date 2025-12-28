import { z } from "zod/v4";

import { eq } from "@stamina/db";
import { results } from "@stamina/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const resultRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ measurableId: z.string(), notes: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(results).values({
        measurableId: input.measurableId,
        notes: input.notes,
        date: new Date(),
        userId: ctx.session.user.id,
      });
    }),
  findAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.results.findMany({
      where: eq(results.userId, ctx.session.user.id),
      with: {
        bloodPressureReading: true,
        weighIn: true,
      },
      orderBy: (result, { desc }) => desc(result.date),
    });
  }),
});
