"use client";

import { format, startOfDay } from "date-fns";
import { addDays } from "date-fns/addDays";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  FaCalendarWeek,
  FaCheck,
  FaEllipsisVertical,
  FaEye,
  FaPencil,
  FaPlus,
  FaStopwatch20,
  FaTrash,
} from "react-icons/fa6";
import { GiDuration, GiStoneStack } from "react-icons/gi";
import { LuTally4, LuTelescope } from "react-icons/lu";
import { TbTargetArrow } from "react-icons/tb";
import ThemeToggle from "~/components/theme/themeToggle";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Input } from "~/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "~/components/ui/item";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import type { MeasurableType } from "~/trpc/types";
import { calculateProgress } from "~/utils/progressUtil";

export default function Home() {
  const utils = api.useUtils();
  const { data: measurables, isLoading } = api.measurable.findAll.useQuery();
  const { mutateAsync: createMeasurable, isPending: isCreatingMeasurable } =
    api.measurable.create.useMutation({
      onSuccess: async () => {
        await utils.measurable.findAll.invalidate();
        setIsCreatingMeasurableModalOpen(false);
        setName("");
        setDescription("");
        setType("Countdown");
        setDueDate(null);
      },
    });

  const [isCreatingMeasurableModalOpen, setIsCreatingMeasurableModalOpen] =
    useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [name, setName] = useState("test");
  const [description, setDescription] = useState("test");
  const [type, setType] = useState<MeasurableType["type"]>("Countdown");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const measurableTypes = [
    {
      label: "Countdown",
      icon: <FaStopwatch20 />,
      description: "A measurable that counts down to a due date.",
    },
    {
      label: "Tally",
      icon: <LuTally4 />,
      description: "A measurable that tallies up days since being set.",
    },
    {
      label: "Seeking",
      icon: <LuTelescope />,
      description:
        "A measurable that we don't know how long the interval should be, due date is set open ended until you complete and then the duration is set.",
    },
  ];

  const handleCreate = () => {
    createMeasurable({
      name,
      description,
      type,
      dueDate: dueDate ?? undefined,
    });
  };

  const [validToCreate, setValidToCreate] = useState(false);
  const validateForm = () => {
    if (name.trim().length === 0) return false;
    if (type === "Countdown" && !dueDate) return false;
    return true;
  };
  useEffect(() => {
    setValidToCreate(validateForm());
  }, [name, type, dueDate]);

  return (
    <div className="flex grow flex-col">
      <div className="flex justify-end gap-2 p-2">
        <ThemeToggle />
        <Button
          className="rounded-full"
          onClick={() => setIsCreatingMeasurableModalOpen(true)}
        >
          <FaPlus />
        </Button>
        <Dialog
          open={isCreatingMeasurableModalOpen}
          onOpenChange={() => setIsCreatingMeasurableModalOpen((prev) => !prev)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Measurable</DialogTitle>
              <DialogDescription>
                Create a new measurable item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <div className="flex justify-center gap-2">
                  {measurableTypes.map((t) => (
                    <div
                      onClick={() => setType(t.label as MeasurableType["type"])}
                      className={`flex h-24 w-32 flex-col items-center justify-center gap-2 rounded-md select-none ${type === t.label ? "border-accent bg-accent/40 border-2" : "border"} p-4`}
                    >
                      {t.label}
                      {t.icon}
                    </div>
                  ))}
                </div>
                <span className="text-muted-foreground h-10 text-sm">
                  {measurableTypes.find((mt) => mt.label === type)?.description}
                </span>
              </div>
              {type === "Countdown" && (
                <div className="grid gap-2">
                  <Label htmlFor="date" className="px-1">
                    Due Date
                  </Label>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                      >
                        {dueDate ? dueDate.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={dueDate ?? undefined}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDueDate(date ?? null);
                          setIsCalendarOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  // ref={dialogCloseRef}
                  disabled={isCreatingMeasurable}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleCreate}
                disabled={!validToCreate || isCreatingMeasurable}
              >
                {isCreatingMeasurable ? <Spinner /> : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex grow flex-col gap-1 overflow-hidden overflow-y-auto pb-24">
        {isLoading && <Spinner className="mx-auto h-24 w-24" />}
        {!isLoading && measurables && measurables.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GiStoneStack />
              </EmptyMedia>
              <EmptyTitle>Nothing to show yet</EmptyTitle>
              <EmptyDescription>
                Try clicking some of the buttons to get started...
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button onClick={() => setIsCreatingMeasurableModalOpen(true)}>
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => alert("Work in progress...")}
                >
                  Import
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        )}
        {!isLoading && measurables && measurables.length > 0 && (
          <div className="mx-auto flex grow flex-col gap-2">
            {measurables?.map((measurable) => (
              <Meter key={measurable.id} measurable={measurable} />
            ))}
          </div>
        )}
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
    // increment setDate to tomorrow, dueDate to tomorrow + original duration
    // if no previous due date, and type was seeking, set to elapsed duration
    // if no previous due date, and type was tally, leave due date undefined
    const { duration, elapsedDuration } = calculateProgress(
      measurable.setDate,
      measurable.dueDate ?? undefined,
    );
    const newSetDate = startOfDay(addDays(new Date(), 1));
    const newDueDate =
      measurable.type === "Countdown"
        ? startOfDay(addDays(newSetDate, duration - 1))
        : measurable.type === "Seeking"
          ? startOfDay(addDays(newSetDate, elapsedDuration))
          : undefined;
    measurable.setDate = newSetDate;
    measurable.dueDate = newDueDate ?? null;

    // if we were seeking for duration and have set a dueDate, change to count down
    // if type was Countdown or Tally, leave alone
    const newType =
      measurable.type === "Seeking" ? "Countdown" : measurable.type;

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
              <span className="text-xl font-bold">
                {elapsedDuration > 0 ? elapsedDuration : 0}
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
                  : measurable.type === "Seeking"
                    ? "Seeking"
                    : "Open ended"}
              </span>
              <span className="flex items-center gap-1">
                <GiDuration />
                {measurable.type === "Countdown"
                  ? `${duration} days`
                  : "No duration set"}
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
