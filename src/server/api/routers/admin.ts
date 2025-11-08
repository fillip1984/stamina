import { DayOfWeekEnum, DaytimeEnum, MeasurableTypeEnum } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  exportData: publicProcedure.mutation(async ({ ctx }) => {
    const areas = await ctx.db.area.findMany();
    const measurables = await ctx.db.measurable.findMany();

    return {
      areas,
      measurables,
    };
  }),
  importData: publicProcedure
    .input(
      z.object({
        areas: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
          }),
        ),
        measurables: z.array(
          z.object({
            id: z.string(),
            setDate: z.date(),
            name: z.string(),
            description: z.string(),
            areaId: z.string().nullable(),
            suggestedDay: z.enum(DayOfWeekEnum).nullable(),
            suggestedDayTime: z.enum(DaytimeEnum).nullable(),
            type: z.enum(MeasurableTypeEnum),
            dueDate: z.date().nullable(),
            interval: z.number().min(1).optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      for (const area of input.areas) {
        const existingArea = await ctx.db.area.findUnique({
          where: { id: area.id },
        });
        if (!existingArea) {
          await ctx.db.area.create({
            data: {
              id: area.id,
              name: area.name,
              description: area.description,
            },
          });
        }
      }

      for (const measurable of input.measurables) {
        const existingMeasurable = await ctx.db.measurable.findUnique({
          where: { id: measurable.id },
        });
        if (existingMeasurable) continue;

        const result = await ctx.db.measurable.create({
          data: {
            setDate: measurable.setDate,
            name: measurable.name,
            description: measurable.description,
            areaId: measurable.areaId,
            suggestedDay: measurable.suggestedDay,
            suggestedDayTime: measurable.suggestedDayTime,
            type: measurable.type,
            dueDate: measurable.dueDate,
            interval: measurable.interval,
          },
        });
      }
    }),
});
