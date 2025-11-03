import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const resultRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ measurableId: z.string(), notes: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.result.create({
        data: {
          measurableId: input.measurableId,
          notes: input.notes,
          date: new Date(),
        },
      });
    }),
  findAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.result.findMany();
  }),
});
