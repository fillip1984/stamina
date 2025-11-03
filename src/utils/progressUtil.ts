import { differenceInCalendarDays } from "date-fns";

/**
 * Calculates progress metrics based on setDate and dueDate
 * @param setDate - The date when the measurable was set
 * @param dueDate - The date when the measurable is due (optional)
 * @returns An object containing duration, elapsedDuration, daysRemaining, progress percentage, and overdue status
 *
 * If dueDate is not provided, all returned values will be zero or false.
 */
export const calculateProgress = (setDate: Date, dueDate?: Date) => {
  const currentDate = new Date();
  const elapsedDuration = differenceInCalendarDays(currentDate, setDate);

  if (!dueDate) {
    return {
      duration: 0,
      elapsedDuration,
      daysRemaining: 0,
      progress: 0,
      overdue: false,
    };
  }

  // include both start and end dates in duration and daysRemaining calculations
  const duration = differenceInCalendarDays(dueDate, setDate) + 1;
  const daysRemaining = differenceInCalendarDays(dueDate, currentDate) + 1;
  const progress = Math.round((elapsedDuration / duration) * 100);
  const overdue = currentDate > dueDate;

  return {
    duration,
    elapsedDuration,
    daysRemaining,
    progress: progress > 0 ? progress : 0,
    overdue,
  };
};
