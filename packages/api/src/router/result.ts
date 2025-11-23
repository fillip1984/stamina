import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const resultRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ measurableId: z.string(), notes: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.result.create({
        data: {
          measurableId: input.measurableId,
          notes: input.notes,
          date: new Date(),
          userId: ctx.session.user.id,
        },
      });
    }),
  findAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.result.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        bloodPressureReading: true,
        weighIn: true,
      },
      orderBy: { date: "desc" },
    });
  }),
});
