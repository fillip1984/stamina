"use client";

import { startOfDay } from "date-fns";
import { addDays } from "date-fns/addDays";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CiTextAlignLeft } from "react-icons/ci";
import { FaCalendarWeek, FaCheck } from "react-icons/fa6";
import { GiDuration } from "react-icons/gi";
import ThemeToggle from "~/components/theme/themeToggle";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "~/components/ui/item";
import { calculateProgress } from "~/utils/progressUtil";

type MeterTypes = "Seeking" | "CountDown" | "CountUp";
type Measurable = {
  id: string;
  name: string;
  description: string;
  type: MeterTypes;
  setDate: Date;
  dueDate?: Date;
  subMeasurables?: Measurable[];
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
      type: "Seeking",
      setDate: new Date("2025-10-31"),
      dueDate: new Date("2025-11-10"),
      subMeasurables: [],
    },
    // {
    //   id: "2",
    //   name: "Clean upstairs bathroom",
    //   description: "General cleaning of the upstairs bathroom",
    //   type: "CountDown",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2025-11-01"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "3",
    //   name: "Clean kitchen",
    //   description: "General cleaning of the kitchen",
    //   type: "CountUp",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2025-11-15"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "4",
    //   name: "Clean living room",
    //   description: "General cleaning of the living room",
    //   type: "Seeking",
    //   setDate: new Date("2025-09-30"),
    //   dueDate: new Date("2025-11-01"),
    //   subMeasurables: [],
    // },
    {
      id: "5",
      name: "Clean master bedroom",
      description: "General cleaning of the master bedroom",
      type: "Seeking",
      setDate: new Date("2025-10-31"),
      dueDate: undefined,
      subMeasurables: [],
    },
    // {
    //   id: "6",
    //   name: "Clean recreation room",
    //   description: "General cleaning of the recreation room",
    //   type: "CountUp",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "7",
    //   name: "Trim finger nails",
    //   description: "Cut and file finger nails",
    //   type: "Seeking",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "8",
    //   name: "Trim beard",
    //   description: "Trim beard",
    //   type: "CountDown",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "9",
    //   name: "Oil change Phil's car",
    //   description: "Change the oil in Phil's car",
    //   type: "CountUp",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "10",
    //   name: "Tire rotation Phil's car",
    //   description: "Rotate the tires on Phil's car",
    //   type: "Seeking",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "11",
    //   name: "Mow the lawn",
    //   description: "Mow the lawn",
    //   type: "CountDown",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "12",
    //   name: "Empty the dishwasher",
    //   description: "Empty the dishwasher",
    //   type: "CountUp",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "13",
    //   name: "Take out the trash",
    //   description: "Take out the trash",
    //   type: "Seeking",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "14",
    //   name: "Do the laundry",
    //   description: "Do the laundry",
    //   type: "CountDown",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
    // {
    //   id: "15",
    //   name: "Fix the mailbox",
    //   description: "Fix the mailbox",
    //   type: "CountUp",
    //   setDate: new Date("2025-10-31"),
    //   dueDate: new Date("2024-11-10"),
    //   subMeasurables: [],
    // },
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
    console.log({ duration, elapsedDuration, newSetDate, newDueDate });
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
  const { daysRemaining, progress, overdue, duration } = calculateProgress(
    measurable.setDate,
    measurable.dueDate,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Item variant="outline" className="relative w-[600px] overflow-hidden p-1">
      <ItemContent
        onClick={() => setIsExpanded((prev) => !prev)}
        className="cursor-pointer"
      >
        <ItemTitle>{measurable.name}</ItemTitle>
        <span className="flex items-center gap-1">
          <span className="text-lg font-bold">
            {daysRemaining < 0 ? daysRemaining * -1 : daysRemaining}
          </span>
          {daysRemaining < 0 ? " days overdue" : "days remaining"}
        </span>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col gap-1 px-1"
            >
              <span className="flex items-center gap-1">
                <CiTextAlignLeft /> {measurable.description}
              </span>
              <span className="flex items-center gap-1">
                <FaCalendarWeek />
                {measurable.setDate.toLocaleDateString()} -{" "}
                {measurable.dueDate
                  ? measurable.dueDate.toLocaleDateString()
                  : "Unknown"}
              </span>
              <span className="flex items-center gap-1">
                <GiDuration />
                {duration} days
              </span>
              {progress}%
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.3,
            // type: "spring",
            // bounce: progress > 100 && progress < 0 ? 0 : 0.3,
          }}
          className="absolute inset-0 -z-20 bg-blue-600/80"
        ></motion.div>
        {overdue && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress - 100}%` }}
            transition={{
              delay: 0.3,
              // duration: 0.8,
              // type: "spring",
              // bounce: progress > 100 ? 0 : 0.3,
            }}
            className="absolute inset-0 -z-10 bg-red-600/80"
            style={{
              width: `
          ${progress - 100}%
          `,
            }}
          ></motion.div>
        )}
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleComplete(measurable.id)}
        >
          <FaCheck />
        </Button>
      </ItemActions>
    </Item>
  );
};
