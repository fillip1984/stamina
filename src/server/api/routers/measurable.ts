import { MeasurableTypeEnum } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { MeasurableType } from "~/trpc/types";
import { calculateProgress } from "~/utils/progressUtil";

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
  // update: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.string(),
  //       name: z.string().min(1).optional(),
  //       description: z.string().min(1).optional(),
  //       type: z.enum(MeasurableTypeEnum).optional(),
  //       setDate: z.date(),
  //       dueDate: z.date().nullable(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.measurable.update({
  //       where: { id: input.id },
  //       data: {
  //         name: input.name,
  //         description: input.description,
  //         type: input.type,
  //         setDate: input.setDate,
  //         dueDate: input.dueDate,
  //       },
  //     });
  //   }),
  complete: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const measurable = await ctx.db.measurable.findUnique({
        where: { id: input },
      });
      if (!measurable) {
        throw new Error("Measurable not found");
      }

      // increment setDate to tomorrow, dueDate to tomorrow + original duration
      // if no previous due date, and type was seeking, set to elapsed duration
      // if no previous due date, and type was tally, leave due date undefined
      const { duration, elapsedDuration } = calculateProgress(
        measurable.setDate,
        measurable.dueDate ?? undefined,
      );
      const newSetDate = startOfDay(addDays(new Date(), 1));
      const newDueDate =
        measurable.type === "Countdown"
          ? startOfDay(addDays(newSetDate, duration - 1))
          : measurable.type === "Seeking"
            ? startOfDay(addDays(newSetDate, elapsedDuration))
            : undefined;
      measurable.setDate = newSetDate;
      measurable.dueDate = newDueDate ?? null;

      // if we were seeking for duration and have set a dueDate, change to count down
      // if type was Countdown or Tally, leave alone
      const newType =
        measurable.type === "Seeking" ? "Countdown" : measurable.type;
      const xxx = await ctx.db.$transaction([
        ctx.db.measurable.update({
          where: { id: input },
          data: {
            type: newType,
            setDate: measurable.setDate,
            dueDate: measurable.dueDate,
          },
        }),
        ctx.db.result.create({
          data: {
            measurableId: input,
            date: new Date(),
            notes: `Completed measurable: ${measurable.name}`,
          },
        }),
      ]);

      return xxx;
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.measurable.delete({
      where: { id: input },
    });
  }),
  exportData: publicProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.measurable.findMany({
      select: {
        name: true,
        description: true,
        type: true,
        setDate: true,
        dueDate: true,
      },
    });

    return result;
  }),
  importData: publicProcedure
    .input(z.object({ dataUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dataUrl = input.dataUrl;
      const data = dataUrl.split(",")[1]!;
      const buffer = Buffer.from(data, "base64");
      const string = buffer.toString();
      const json = JSON.parse(string) as MeasurableType[];

      for (const measurable of json) {
        const result = await ctx.db.measurable.create({
          data: {
            name: measurable.name,
            description: measurable.description,
            type: measurable.type,
            setDate: measurable.setDate,
            dueDate: measurable.dueDate,
          },
        });
      }
    }),
});
