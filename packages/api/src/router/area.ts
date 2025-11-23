import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const areaRouter = createTRPCRouter({
  create: protectedProcedure
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
          userId: ctx.session.user.id,
        },
      });
    }),
  findAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.area.findMany({
      where: { userId: ctx.session.user.id },
      select: { id: true, name: true, description: true },
      orderBy: { name: "asc" },
    });
  }),
  findById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.area.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.area.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.area.delete({
        where: { id: input, userId: ctx.session.user.id },
      });
    }),
});
