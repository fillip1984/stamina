import PriorityOption from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const taskRouter = createTRPCRouter({
  today: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
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
      where: {
        userId: ctx.session.user.id,
        complete: false,
        dueDate: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
    });
  }),
  upcoming: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
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
      where: {
        userId: ctx.session.user.id,
        complete: false,
        dueDate: {
          gte: startOfDay(new Date()),
        },
      },
    });
  }),
  // readOne: protectedProcedure
  //   .input(z.object({ id: z.string().min(1) }))
  //   .query(async ({ ctx, input }) => {
  //     return await ctx.db.task.findFirst({
  //       where: {
  //         id: input.id,
  //         userId: ctx.session.user.id,
  //       },
  //       include: {
  //         checklistItems: {
  //           orderBy: {
  //             position: "asc",
  //           },
  //         },
  //         comments: {
  //           orderBy: {
  //             posted: "desc",
  //           },
  //         },
  //       },
  //     });
  //   }),
  create: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1),
        description: z.string().nullish(),
        dueDate: z.date().nullish(),
        priority: z
          .enum([
            PriorityOption.PriorityOption.HIGH,
            PriorityOption.PriorityOption.HIGHEST,
            PriorityOption.PriorityOption.IMPORTANT,
            PriorityOption.PriorityOption.LOW,
            PriorityOption.PriorityOption.LOWEST,
            PriorityOption.PriorityOption.MEDIUM,
            PriorityOption.PriorityOption.URGENT,
            PriorityOption.PriorityOption.IMPORTANT,
            PriorityOption.PriorityOption.URGENT_AND_IMPORTANT,
          ])
          .nullish(),
        sectionId: z.string().min(1),
        parentTaskId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.section.findFirst({
        where: { id: input.sectionId, userId: ctx.session.user.id },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      });
      if (!section) {
        throw new Error(`Unable to find section by id: ${input.sectionId}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      let position = section._count.tasks ?? 0;
      if (input.parentTaskId) {
        const parentTask = await ctx.db.task.findUnique({
          where: { id: input.parentTaskId, userId: ctx.session.user.id },
          select: {
            text: true,
            children: true,
          },
        });
        if (parentTask) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          position = parentTask.children.length + 1;
        }
      }
      return await ctx.db.task.create({
        data: {
          text: input.text,
          description: input.description,
          dueDate: input.dueDate,
          // priority: input.priority,
          sectionId: input.sectionId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          position: position,
          parentId: input.parentTaskId,
          userId: ctx.session.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        description: z.string().nullish(),
        complete: z.boolean(),
        position: z.number(),
        dueDate: z.date().nullish(),
        priority: z
          .enum([
            PriorityOption.PriorityOption.HIGH,
            PriorityOption.PriorityOption.HIGHEST,
            PriorityOption.PriorityOption.IMPORTANT,
            PriorityOption.PriorityOption.LOW,
            PriorityOption.PriorityOption.LOWEST,
            PriorityOption.PriorityOption.MEDIUM,
            PriorityOption.PriorityOption.URGENT,
            PriorityOption.PriorityOption.IMPORTANT,
            PriorityOption.PriorityOption.URGENT_AND_IMPORTANT,
          ])
          .nullish(),
        sectionId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          text: input.text,
          description: input.description,
          complete: input.complete,
          position: input.position,
          dueDate: input.dueDate,
          priority: input.priority,
          sectionId: input.sectionId,
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
      return await ctx.db.task.delete({
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
          sectionId: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx) => {
        for (const task of input) {
          await tx.task.update({
            where: {
              id: task.id,
              userId: ctx.session.user.id,
            },
            data: {
              position: task.position,
              sectionId: task.sectionId,
            },
          });
        }
      });
    }),
});
