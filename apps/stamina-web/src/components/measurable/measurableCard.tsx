"use client";

import { differenceInCalendarDays, endOfYear, format } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { useContext, useState } from "react";
import {
  FaCalendarWeek,
  FaCheck,
  FaEllipsisVertical,
  FaEye,
  FaPencil,
  FaTrash,
} from "react-icons/fa6";
import { GiDuration } from "react-icons/gi";
import { TbTargetArrow } from "react-icons/tb";

import type { MeasurableType } from "@stamina/api";

import { AppContext } from "~/contexts/AppContext";
import { useModal } from "~/hooks/useModal";
import { api } from "~/trpc/react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemTitle } from "../ui/item";
import OnCompleteModal from "./onCompleteDialog";

/**
 * Calculates progress metrics based on setDate and dueDate
 * @param setDate - The date when the measurable was set
 * @param dueDate - The date when the measurable is due (optional)
 * @returns An object containing interval, elapsedDays, daysRemaining, progress percentage, and overdue status
 *
 * If dueDate is not provided, set dueDate to the end of the current year and calculate accordingly.
 */
export const calculateProgress = (setDate: Date, dueDate?: Date) => {
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

export default function MeasureableCard({
  measurable,
}: {
  measurable: MeasurableType & { areaName: string };
}) {
  const { isOpen, show, hide } = useModal();

  const [isExpanded, setIsExpanded] = useState(false);
  const { daysRemaining, progress, overdue, interval, elapsedDays } =
    calculateProgress(measurable.setDate, measurable.dueDate ?? undefined);

  const utils = api.useUtils();
  const { mutateAsync: completeMeasurable } =
    api.measurable.complete.useMutation({
      onSuccess: async () => {
        await utils.measurable.findAll.invalidate();
      },
    });
  const { mutateAsync: deleteMeasurable } = api.measurable.delete.useMutation({
    onSuccess: async () => {
      await utils.measurable.findAll.invalidate();
    },
  });

  const handleComplete = async () => {
    if (measurable.onComplete) {
      show();
    } else {
      await completeMeasurable(measurable.id);
    }
  };

  const { setMeasurableIdToEdit } = useContext(AppContext);
  const handleEdit = () => {
    setMeasurableIdToEdit(measurable.id);
  };

  return (
    <>
      <Item
        variant="outline"
        className="bg-card relative w-full items-start p-2"
      >
        <ItemContent
          onClick={() => setIsExpanded((prev) => !prev)}
          className="cursor-pointer gap-0"
        >
          <ItemTitle>
            {measurable.name}
            <Badge variant={"secondary"}>{measurable.areaName}</Badge>
          </ItemTitle>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
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
              <div className="absolute inset-0 flex items-center gap-1">
                <span className="text-xl font-bold">
                  {elapsedDays > 0 ? elapsedDays : 0}
                </span>
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
              className="absolute inset-0 bg-blue-600/30"
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
                className="absolute inset-0 bg-red-600/30"
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
                    : measurable.type === "Seeking"
                      ? "Seeking"
                      : "Open ended"}
                </span>
                <span className="flex items-center gap-1">
                  <GiDuration />
                  {measurable.type === "Countdown"
                    ? `${interval} days`
                    : "No interval set"}
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
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <FaEllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleEdit}>
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

      {isOpen && (
        <OnCompleteModal
          measurable={measurable}
          dismiss={hide}
          onComplete={() => completeMeasurable(measurable.id)}
        />
      )}
    </>
  );
}
