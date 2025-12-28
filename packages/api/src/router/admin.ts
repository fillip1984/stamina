import { z } from "zod/v4";

import { and, eq } from "@stamina/db";
import {
  areas,
  DayOfWeekEnum,
  DaytimeEnum,
  measurables,
  MeasurableTypeEnum,
} from "@stamina/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    const areasToExport = await ctx.db.query.areas.findMany({
      where: eq(areas.userId, ctx.session.user.id), //{ userId: ctx.session.user.id },
    });
    const measurablesToExport = await ctx.db.query.measurables.findMany({
      where: eq(measurables.userId, ctx.session.user.id), //{ userId: ctx.session.user.id },
    });

    return {
      areas: areasToExport,
      measurables: measurablesToExport,
    };
  }),
  importData: protectedProcedure
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
        const existingArea = await ctx.db.query.areas.findFirst({
          where: and(
            eq(areas.id, area.id),
            eq(areas.userId, ctx.session.user.id),
          ),
        });
        if (!existingArea) {
          await ctx.db.insert(areas).values({
            id: area.id,
            name: area.name,
            description: area.description,
            userId: ctx.session.user.id,
          });
        }
      }

      for (const measurable of input.measurables) {
        const existingMeasurable = await ctx.db.query.measurables.findFirst({
          where: and(
            eq(measurables.id, measurable.id),
            eq(measurables.userId, ctx.session.user.id),
          ),
        });
        if (existingMeasurable) continue;

        await ctx.db.insert(measurables).values({
          setDate: measurable.setDate,
          name: measurable.name,
          description: measurable.description,
          areaId: measurable.areaId,
          suggestedDay: measurable.suggestedDay,
          suggestedDayTime: measurable.suggestedDayTime,
          type: measurable.type,
          dueDate: measurable.dueDate,
          interval: measurable.interval,
          userId: ctx.session.user.id,
        });
      }
    }),
});
