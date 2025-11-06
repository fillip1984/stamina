import { MeasurableTypeEnum } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const measurableRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(MeasurableTypeEnum),
        dueDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.measurable.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          setDate: new Date(),
          dueDate: input.dueDate,
        },
      });
    }),
  findAll: publicProcedure.query(async ({ ctx }) => {
    const measurables = await ctx.db.measurable.findMany({
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
  findById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.measurable.findUnique({
      where: { id: input },
    });
  }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        type: z.nativeEnum(MeasurableTypeEnum).optional(),
        setDate: z.date(),
        dueDate: z.date().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.measurable.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          setDate: input.setDate,
          dueDate: input.dueDate,
        },
      });
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.measurable.delete({
      where: { id: input },
    });
  }),
});
