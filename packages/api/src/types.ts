import type { RouterOutputs } from ".";

export type AreaType = RouterOutputs["area"]["findAll"][number];
export type MeasurableType = RouterOutputs["measurable"]["findAll"][number];
export type ResultType = RouterOutputs["result"]["findAll"][number];
export type BloodPressureReadingType = NonNullable<
  ResultType["bloodPressureReading"]
>;
export type WeighInType = NonNullable<ResultType["weighIn"]>;
