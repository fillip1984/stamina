import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const sectionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        collectionId: z.string().min(1),
        addAfter: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sections = await ctx.db.collection.findFirst({
        where: { id: input.collectionId, userId: ctx.session.user.id },
        select: {
          _count: {
            select: { sections: true },
          },
        },
      });
      if (sections === null) {
        throw new Error(
          `Unable to find collection by id: ${input.collectionId}`,
        );
      }
      return await ctx.db.section.create({
        data: {
          name: input.name,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          position: sections._count.sections ?? 0,
          collectionId: input.collectionId,
          userId: ctx.session.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.section.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.section.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
  reorder: protectedProcedure
    .input(z.array(z.object({ id: z.string().min(1), position: z.number() })))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx) => {
        for (const section of input) {
          await tx.section.update({
            where: {
              id: section.id,
              userId: ctx.session.user.id,
            },
            data: {
              position: section.position,
            },
          });
        }
      });
    }),
});
