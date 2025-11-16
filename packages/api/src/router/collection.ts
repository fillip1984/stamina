import { z } from "zod/v4";

import type { trpcContextShape } from "../trpc";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const collectionRouter = createTRPCRouter({
  readAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.collection.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        preferredView: true,
        position: true,
        parentId: true,
        children: {
          select: {
            id: true,
            name: true,
            parentId: true,
          },
        },
        sections: {
          select: {
            id: true,
            name: true,
            position: true,
            _count: {
              select: {
                tasks: { where: { complete: { not: true } } },
              },
            },
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });
    // another idea to sum: collection.sections.map((s) => s.tasks).flat(1).length}
    // return collections.map((collection) => {
    // 	return {
    // 		...collection,
    // 		taskCount: collection.sections
    // 			.map((s) => s.tasks.length)
    // 			.reduce((a, b) => a + b, 0),
    // 	};
    // });
  }),
  readOne: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if ("inbox" === input.id.toLowerCase()) {
        const inboxId = (await findOrCreateInbox(ctx)).id;
        console.log({ inboxId });
        return await fetchCollection(inboxId, ctx);
      } else if ("today" === input.id.toLowerCase()) {
        return await fetchCollection(input.id, ctx);
      } else if ("upcoming" === input.id.toLowerCase()) {
        return await fetchCollection(input.id, ctx);
      } else {
        return fetchCollection(input.id, ctx);
      }
    }),
  findBySectionId: protectedProcedure
    .input(z.object({ sectionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const collectionId = await ctx.db.collection.findFirst({
        where: {
          userId: ctx.session.user.id,
          sections: {
            some: {
              id: input.sectionId,
            },
          },
        },
        select: { id: true },
      });
      if (!collectionId) {
        throw new Error(
          `Unable to find collection by sectionId: ${input.sectionId}`,
        );
      }
      return await fetchCollection(collectionId.id, ctx);
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const collectionCount = await ctx.db.collection.count();
      return await ctx.db.collection.create({
        data: {
          name: input.name,
          position: collectionCount + 1,
          sections: {
            create: [
              {
                name: "Uncategorized",
                position: 0,
                userId: ctx.session.user.id,
              },
            ],
          },
          userId: ctx.session.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        preferredView: z.string().min(1),
        parentId: z.string().nullish(),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.collection.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          name: input.name,
          preferredView: input.preferredView,
          parentId: input.parentId,
          position: input.position,
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
      return await ctx.db.collection.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
  reorder: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          position: z.number(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx) => {
        for (const collection of input) {
          await tx.collection.update({
            where: {
              id: collection.id,
              userId: ctx.session.user.id,
            },
            data: {
              position: collection.position,
            },
          });
        }
      });
    }),
  inboxId: protectedProcedure.query(async ({ ctx }) => {
    const inbox = await findOrCreateInbox(ctx);
    return inbox.id;
  }),
});

async function fetchCollection(id: string, ctx: trpcContextShape) {
  if (!ctx.session?.user.id) {
    throw new Error("No user ID found in session.");
  }
  return await ctx.db.collection.findFirst({
    where: { id: id, userId: ctx.session.user.id },
    select: {
      id: true,
      name: true,
      preferredView: true,
      position: true,
      sections: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          name: true,
          position: true,
          collectionId: true,
          _count: {
            select: {
              tasks: { where: { complete: { not: true }, parentId: null } },
            },
          },
          tasks: {
            orderBy: {
              position: "asc",
            },
            include: {
              comments: true,
              children: {
                select: {
                  complete: true,
                  id: true,
                  text: true,
                  dueDate: true,
                  priority: true,
                  sectionId: true,
                  position: true,
                  parentId: true,
                },
                orderBy: {
                  position: "asc",
                },
              },
            },
            where: { complete: false, userId: ctx.session.user.id },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

async function findOrCreateInbox(ctx: trpcContextShape) {
  if (!ctx.session?.user.id) {
    throw new Error("No user ID found in session.");
  }
  const existingInbox = await ctx.db.collection.findFirst({
    where: { name: "Inbox", userId: ctx.session.user.id },
    select: { id: true },
  });
  if (existingInbox) {
    return existingInbox;
  } else {
    return await ctx.db.collection.create({
      data: {
        name: "Inbox",
        position: 0,
        sections: {
          create: [
            {
              name: "Uncategorized",
              position: 0,
              userId: ctx.session.user.id,
            },
          ],
        },
        userId: ctx.session.user.id,
      },
      select: {
        id: true,
      },
    });
  }
}
