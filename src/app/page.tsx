"use client";

import { format, startOfDay } from "date-fns";
import { addDays } from "date-fns/addDays";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FaCalendarWeek, FaCheck } from "react-icons/fa6";
import { GiDuration } from "react-icons/gi";
import { TbTargetArrow } from "react-icons/tb";
import ThemeToggle from "~/components/theme/themeToggle";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "~/components/ui/item";
import { calculateProgress } from "~/utils/progressUtil";

type MeterTypes = "Seeking" | "Count Down" | "Tally";
type Measurable = {
  id: string;
  name: string;
  description: string;
  type: MeterTypes;
  setDate: Date;
  dueDate?: Date;
};

type Activity = {
  id: string;
  date: Date;
  notes: string;
  measurableId: string;
};

export default function Home() {
  const [measurables, setMeasurables] = useState<Measurable[]>([
    {
      id: "1",
      name: "Clean downstairs bathroom",
      description: "General cleaning of the downstairs bathroom",
      type: "Count Down",
      setDate: new Date("2025-10-31"),
      dueDate: new Date("2025-11-10"),
    },
    {
      id: "2",
      name: "Clean upstairs bathroom",
      description: "General cleaning of the upstairs bathroom",
      type: "Count Down",
      setDate: new Date("2025-10-31"),
      dueDate: new Date("2025-11-01"),
    },
    {
      id: "3",
      name: "Clean kitchen",
      description: "General cleaning of the kitchen",
      type: "Count Down",
      setDate: new Date("2025-10-31"),
      dueDate: new Date("2025-11-15"),
    },
    {
      id: "4",
      name: "Clean living room",
      description: "General cleaning of the living room",
      type: "Count Down",
      setDate: new Date("2025-09-30"),
      dueDate: new Date("2025-11-01"),
    },
    {
      id: "5",
      name: "Clean master bedroom",
      description: "General cleaning of the master bedroom",
      type: "Seeking",
      setDate: new Date("2025-10-31"),
      dueDate: undefined,
    },
    {
      id: "6",
      name: "Quit smoking",
      description: "Quit smoking for good",
      type: "Tally",
      setDate: new Date("2025-11-03"),
      dueDate: undefined,
    },
  ]);

  const handleComplete = (id: string) => {
    const measureable = measurables.find((m) => m.id === id);
    if (!measureable) return;
    // TODO: show toast with error

    setActivities((prev) => [
      ...prev,
      {
        id: (prev.length + 1).toString(),
        date: new Date(),
        notes: `Completed measurable ${measureable.name} on ${new Date().toLocaleDateString()}`,
        measurableId: id,
      },
    ]);

    // increment setDate to tomorrow, dueDate to tomorrow + original duration
    const { duration, elapsedDuration } = calculateProgress(
      measureable.setDate,
      measureable.dueDate,
    );
    const newSetDate = startOfDay(addDays(new Date(), 1));
    const newDueDate = startOfDay(
      addDays(newSetDate, duration != 0 ? duration - 1 : elapsedDuration),
    );
    measureable.setDate = newSetDate;
    measureable.dueDate = newDueDate;

    setMeasurables((prev) =>
      prev.map((m) => (m.id === id ? { ...measureable } : m)),
    );
  };

  const [activities, setActivities] = useState<Activity[]>([]);

  return (
    <div className="flex grow flex-col">
      <div className="flex justify-end p-2">
        <ThemeToggle />
      </div>
      <div className="flex grow flex-col gap-1 overflow-hidden overflow-y-auto pb-24">
        <div className="mx-auto flex grow flex-col gap-2">
          {measurables.map((measurable) => (
            <Meter
              key={measurable.id}
              measurable={measurable}
              handleComplete={handleComplete}
            />
          ))}
        </div>
        <div>
          <h4>Results</h4>
          <ul>
            {activities.map((activity) => (
              <li key={activity.id}>{activity.notes}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const Meter = ({
  measurable,
  handleComplete,
}: {
  measurable: Measurable;
  handleComplete: (id: string) => void;
}) => {
  const { daysRemaining, progress, overdue, duration, elapsedDuration } =
    calculateProgress(measurable.setDate, measurable.dueDate);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Item
      variant="outline"
      className="relative w-[600px] items-start overflow-hidden p-2"
    >
      <ItemContent
        onClick={() => setIsExpanded((prev) => !prev)}
        className="cursor-pointer gap-0"
      >
        <ItemTitle>{measurable.name}</ItemTitle>
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          {/* <CiTextAlignLeft /> */}
          {measurable.description}
        </span>
        <div className="relative my-2 flex h-8 w-full items-center justify-center overflow-hidden rounded-2xl border">
          {measurable.dueDate && (
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold">
                {daysRemaining > 0 ? daysRemaining : daysRemaining * -1}
              </span>
              <span className="text-xs">
                {daysRemaining > 0 ? "days remaining" : "days overdue"}
              </span>
              <span className="ml-4 flex items-center gap-1 text-xs">
                <TbTargetArrow className="text-xl" />
                {format(measurable.dueDate, "MMM do")}
              </span>
            </div>
          )}

          {(measurable.type === "Tally" || measurable.type === "Seeking") && (
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold">{elapsedDuration + 1}</span>
              {measurable.type === "Tally" ? (
                <span className="text-xs">days and counting</span>
              ) : (
                <span className="text-xs">days since</span>
              )}
            </div>
          )}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: 0.3,
              type: "spring",
              bounce: progress > 100 && progress < 0 ? 0 : 0.3,
            }}
            className="absolute inset-0 -z-20 bg-blue-600/80"
          ></motion.div>
          {overdue && (
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress - 100}%` }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                type: "spring",
                bounce: progress > 100 ? 0 : 0.3,
              }}
              className="absolute inset-0 -z-10 bg-red-600/80"
              style={{
                width: `
          ${progress - 100}%
          `,
              }}
            ></motion.div>
          )}
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col gap-1 py-1"
            >
              <span className="flex items-center gap-1">
                <FaCalendarWeek />
                {measurable.setDate.toLocaleDateString()} -{" "}
                {measurable.dueDate
                  ? measurable.dueDate.toLocaleDateString()
                  : "Seeking"}
              </span>
              <span className="flex items-center gap-1">
                <GiDuration />
                {duration > 0 ? `${duration} days` : "No duration set"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleComplete(measurable.id)}
          className="flex flex-col items-center gap-0"
        >
          <div className="flex flex-col items-center gap-1">
            <FaCheck />
          </div>
        </Button>
      </ItemActions>
    </Item>
  );
};
