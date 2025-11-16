import { resultRouter } from "apps/stamina-web/src/server/api/routers/result";
import {
  createCallerFactory,
  createTRPCRouter,
} from "apps/stamina-web/src/server/api/trpc";
import { areaRouter } from "./routers/area";
import { measurableRouter } from "./routers/measurable";
import { adminRouter } from "./routers/admin";
import { WeighInRouter } from "./routers/weighIn";
import { BloodPressureReadingRouter } from "./routers/bloodPressureReading";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  area: areaRouter,
  measurable: measurableRouter,
  result: resultRouter,
  bloodPressureReading: BloodPressureReadingRouter,
  weighIn: WeighInRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
