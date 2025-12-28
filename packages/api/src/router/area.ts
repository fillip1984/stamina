import { z } from "zod/v4";

import { and, asc, eq } from "@stamina/db";
import { areas } from "@stamina/db/schema";

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
      return ctx.db.insert(areas).values({
        name: input.name,
        description: input.description,
        userId: ctx.session.user.id,
      });
    }),
  findAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.areas.findMany({
      where: eq(areas.userId, ctx.session.user.id),
      orderBy: asc(areas.name),
      columns: { id: true, name: true, description: true },
    });
  }),
  findById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.areas.findFirst({
        where: and(
          eq(areas.id, input.id),
          eq(areas.userId, ctx.session.user.id),
        ),
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
      return ctx.db
        .update(areas)
        .set({
          name: input.name,
          description: input.description,
        })
        .where(
          and(eq(areas.id, input.id), eq(areas.userId, ctx.session.user.id)),
        );
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(areas)
        .where(
          and(eq(areas.id, input.id), eq(areas.userId, ctx.session.user.id)),
        );
    }),
});
