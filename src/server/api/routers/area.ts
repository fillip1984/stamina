import { MeasurableTypeEnum } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { MeasurableType } from "~/trpc/types";
import { calculateProgress } from "~/utils/progressUtil";

export const areaRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.area.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  findAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.area.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: "desc" },
    });
  }),
  findById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.area.findUnique({
      where: { id: input },
    });
  }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.area.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.area.delete({
      where: { id: input },
    });
  }),
});
