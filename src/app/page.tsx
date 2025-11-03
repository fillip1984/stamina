"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { format, startOfDay } from "date-fns";
import { addDays } from "date-fns/addDays";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  FaCalendarWeek,
  FaCheck,
  FaEllipsisVertical,
  FaEye,
  FaPencil,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";
import { GiDuration } from "react-icons/gi";
import { TbTargetArrow } from "react-icons/tb";
import ThemeToggle from "~/components/theme/themeToggle";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "~/components/ui/item";
import { api } from "~/trpc/react";
import type { MeasurableType } from "~/trpc/types";
import { calculateProgress } from "~/utils/progressUtil";

export default function Home() {
  const utils = api.useUtils();
  const { data: measurables } = api.measurable.findAll.useQuery();
  const { mutateAsync: createMeasurable } = api.measurable.create.useMutation({
    onSuccess: () => {
      utils.measurable.findAll.invalidate();
    },
  });

  // const [activities, setActivities] = useState<Activity[]>([]);

  return (
    <div className="flex grow flex-col">
      <div className="flex justify-end gap-2 p-2">
        <ThemeToggle />
        <Dialog>
          <DialogTrigger>
            <Button className="rounded-full">
              <FaPlus />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create Measurable</DialogTitle>
            <DialogFooter>
              <DialogClose>
                <Button
                  onClick={async () => {
                    await createMeasurable({
                      name: "New Measurable",
                      description: "Description",
                      type: "Seeking",
                    });
                  }}
                >
                  Create
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex grow flex-col gap-1 overflow-hidden overflow-y-auto pb-24">
        <div className="mx-auto flex grow flex-col gap-2">
          {measurables?.map((measurable) => (
            <Meter key={measurable.id} measurable={measurable} />
          ))}
        </div>
      </div>
    </div>
  );
}

const Meter = ({ measurable }: { measurable: MeasurableType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { daysRemaining, progress, overdue, duration, elapsedDuration } =
    calculateProgress(measurable.setDate, measurable.dueDate ?? undefined);

  const utils = api.useUtils();
  const { mutateAsync: updateMeasurable } = api.measurable.update.useMutation({
    onSuccess: () => {
      utils.measurable.findAll.invalidate();
    },
  });
  const { mutateAsync: deleteMeasurable } = api.measurable.delete.useMutation({
    onSuccess: () => {
      utils.measurable.findAll.invalidate();
    },
  });

  const handleComplete = () => {
    // const measureable = measurables.find((m) => m.id === id);
    // if (!measureable) return;
    // TODO: show toast with error

    // setActivities((prev) => [
    //   ...prev,
    //   {
    //     id: (prev.length + 1).toString(),
    //     date: new Date(),
    //     notes: `${measureable.type === "Tally" ? "Reset" : "Completed"} measurable: ${measureable.name} on ${new Date().toLocaleDateString()}`,
    //     measurableId: id,
    //   },
    // ]);

    // increment setDate to tomorrow, dueDate to tomorrow + original duration
    // if no previous due date, and type was seeking, set to elapsed duration
    // if no previous due date, and type was tally, leave due date undefined
    const { duration, elapsedDuration } = calculateProgress(
      measurable.setDate,
      measurable.dueDate ?? undefined,
    );
    const newSetDate = startOfDay(addDays(new Date(), 1));
    const newDueDate =
      measurable.type === "Count_Down"
        ? startOfDay(addDays(newSetDate, duration - 1))
        : measurable.type === "Seeking"
          ? startOfDay(addDays(newSetDate, elapsedDuration))
          : undefined;
    measurable.setDate = newSetDate;
    measurable.dueDate = newDueDate ?? null;

    // if we were seeking for duration and have set a dueDate, change to count down
    // if type was Count_Down or Tally, leave alone
    const newType =
      measurable.type === "Seeking" ? "Count_Down" : measurable.type;

    // setMeasurables((prev) =>
    //   prev.map((m) => (m.id === id ? { ...measureable, type: newType } : m)),
    // );
    updateMeasurable({
      ...measurable,
      type: newType,
      setDate: newSetDate,
      dueDate: newDueDate ?? null,
    });
  };

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
      <ItemActions className="flex flex-col">
        <Button
          variant="outline"
          size="sm"
          onClick={handleComplete}
          className="flex flex-col items-center gap-0"
        >
          <div>
            <FaCheck />
          </div>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="sm">
              <FaEllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <FaPencil />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem>
                <FaEye />
                View Activity
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => deleteMeasurable(measurable.id)}
              >
                <FaTrash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
};
