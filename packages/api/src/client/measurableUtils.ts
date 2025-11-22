import { differenceInCalendarDays, endOfYear } from "date-fns";

/**
 * Calculates progress metrics based on setDate and dueDate
 * @param setDate - The date when the measurable was set
 * @param dueDate - The date when the measurable is due (optional)
 * @returns An object containing interval, elapsedDays, daysRemaining, progress percentage, and overdue status
 *
 * If dueDate is not provided, set dueDate to the end of the current year and calculate accordingly.
 */
export const calculateMeasurableProgress = (setDate: Date, dueDate?: Date) => {
  const currentDate = new Date();
  const elapsedDays = differenceInCalendarDays(currentDate, setDate);

  dueDate ??= endOfYear(currentDate);

  // include both start and end dates in interval and daysRemaining calculations
  const interval = differenceInCalendarDays(dueDate, setDate) + 1;
  const daysRemaining = differenceInCalendarDays(dueDate, currentDate) + 1;
  const progress = Math.round((elapsedDays / interval) * 100);
  const overdue = currentDate > dueDate;

  return {
    interval,
    elapsedDays,
    daysRemaining,
    progress: progress > 0 ? progress : 0,
    overdue,
  };
};
