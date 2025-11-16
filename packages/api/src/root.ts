import { adminRouter } from "./router/admin";
import { areaRouter } from "./router/area";
import { authRouter } from "./router/auth";
import { BloodPressureReadingRouter } from "./router/bloodPressureReading";
import { measurableRouter } from "./router/measurable";
import { resultRouter } from "./router/result";
import { WeighInRouter } from "./router/weighIn";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  area: areaRouter,
  auth: authRouter,
  measurable: measurableRouter,
  result: resultRouter,
  weighIn: WeighInRouter,
  bloodPressureReading: BloodPressureReadingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
