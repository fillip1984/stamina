"use client";

import type {
  DayOfWeekEnum,
  DaytimeEnum,
  OnCompleteEnum,
} from "@prisma/client";
import type { Day } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { nextDay } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ImHourGlass } from "react-icons/im";
import { LuTally4, LuTelescope } from "react-icons/lu";

import type { AreaType, MeasurableType } from "@stamina/api";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { AppContext } from "~/contexts/AppContext";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { DialogFooter, DialogHeader } from "../ui/dialog";
import { Input } from "../ui/input";
import Combobox from "../ui/my-ui/combobox";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";

export default function MeasurableDialog() {
  const {
    isCreateMeasurableModalOpen,
    openCreateMeasurableModal,
    closeCreateMeasurableModal,
    measurableIdToEdit,
  } = useContext(AppContext);

  const utils = api.useUtils();
  const { data: areas } = api.area.findAll.useQuery();
  const { data: measurableToEdit } = api.measurable.findById.useQuery(
    measurableIdToEdit,
    {
      enabled: !!measurableIdToEdit,
    },
  );
  const { mutateAsync: createMeasurable, isPending: isCreatingMeasurable } =
    api.measurable.create.useMutation({
      onSuccess: async () => {
        await utils.measurable.findAll.invalidate();
        closeCreateMeasurableModal();
      },
    });

  const { mutateAsync: updateMeasurable, isPending: isUpdatingMeasurable } =
    api.measurable.update.useMutation({
      onSuccess: async () => {
        await utils.measurable.findAll.invalidate();
        closeCreateMeasurableModal();
      },
    });

  const [mode, setMode] = useState<"Create" | "Update">("Create");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<AreaType | null>(null);
  const [type, setType] = useState<MeasurableType["type"]>("Countdown");
  const [suggestedDayTime, setSuggestedDayTime] = useState<DaytimeEnum | null>(
    null,
  );
  const [suggestedDay, setSuggestedDay] = useState<DayOfWeekEnum | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [interval, setInterval] = useState<number>();
  const [onComplete, setOnComplete] = useState<OnCompleteEnum | null>(null);

  const handleCreateOrUpdate = async () => {
    if (mode === "Update" && id) {
      await updateMeasurable({
        id,
        name,
        description,
        areaId: area?.id ?? null,
        type,
        suggestedDay: suggestedDay,
        suggestedDayTime: suggestedDayTime,
        dueDate: dueDate,
        interval,
        onComplete,
      });
    } else {
      await createMeasurable({
        name,
        description,
        areaId: area?.id ?? null,
        type,
        suggestedDay,
        suggestedDayTime,
        dueDate,
        interval,
        onComplete,
      });
    }
  };

  const [validToCreate, setValidToCreate] = useState(false);
  const validateForm = () => {
    if (name.trim().length === 0) return false;
    if (description.trim().length === 0) return false;
    if (type === "Countdown" && !dueDate) return false;

    return true;
  };
  useEffect(() => {
    setValidToCreate(validateForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description, type, dueDate]);

  // UX: when editing, populate fields or set defaults when creating new
  useEffect(() => {
    if (measurableToEdit) {
      setId(measurableToEdit.id);
      setName(measurableToEdit.name);
      setDescription(measurableToEdit.description);
      setArea(areas?.find((a) => a.id === measurableToEdit.areaId) ?? null);
      setType(measurableToEdit.type);
      setSuggestedDay(measurableToEdit.suggestedDay);
      setSuggestedDayTime(measurableToEdit.suggestedDayTime);
      setDueDate(measurableToEdit.dueDate);
      setInterval(measurableToEdit.interval ?? undefined);
      setOnComplete(measurableToEdit.onComplete ?? null);
      setMode("Update");
    } else {
      setId(null);
      setName("");
      setDescription("");
      setArea(null);
      setType("Countdown");
      setSuggestedDayTime(null);
      setSuggestedDay(null);
      setDueDate(null);
      setInterval(undefined);
      setOnComplete(null);
      setMode("Create");
    }
  }, [measurableToEdit, areas, isCreateMeasurableModalOpen]);

  const daysOfWeek = [
    { id: "Sunday", label: "Sunday" },
    { id: "Monday", label: "Monday" },
    { id: "Tuesday", label: "Tuesday" },
    { id: "Wednesday", label: "Wednesday" },
    { id: "Thursday", label: "Thursday" },
    { id: "Friday", label: "Friday" },
    { id: "Saturday", label: "Saturday" },
  ];

  // UX: set dueDate to next instance of suggestedDay when it is selected
  useEffect(() => {
    if (type !== "Countdown") return;
    if (!suggestedDay) return;
    // only update if changed
    if (measurableToEdit?.suggestedDay === suggestedDay) return;

    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const targetDayOfWeek = daysOfWeek.findIndex(
      (d) => d.label === suggestedDay,
    );

    // if today, set today
    if (todayDayOfWeek === targetDayOfWeek) {
      setDueDate(today);
    } else {
      const nextDate = nextDay(today, targetDayOfWeek as Day);
      setDueDate(nextDate);
    }

    // default interval to 7 days, if not set
    if (!interval) {
      setInterval(7);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedDay, type]);

  const measurableTypes = [
    {
      label: "Countdown",
      icon: <ImHourGlass />,
      description: "A measurable that counts down to a due date.",
    },
    {
      label: "Seeking",
      icon: <LuTelescope />,
      description:
        "A measurable that we don't know how long the interval should be, due date is set open ended until you complete and then the interval is set.",
    },
    {
      label: "Tally",
      icon: <LuTally4 />,
      description: "A measurable that tallies up days since being set.",
    },
  ];

  return (
    <Dialog
      open={isCreateMeasurableModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeCreateMeasurableModal();
        } else {
          openCreateMeasurableModal();
        }
      }}
    >
      <DialogContent className="h-3/4 px-0 lg:h-1/2">
        <DialogHeader className="px-2">
          <DialogTitle>{mode} Measurable</DialogTitle>
          <DialogDescription>
            {mode} measurable item, measurable items are used to track progress
            towards a goal.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 overflow-y-auto px-4 py-2">
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
            <Label htmlFor="description">
              Description
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="area">Area</Label>
              <Combobox
                id="area"
                value={area?.id ?? "Uncategorized"}
                setValue={(value) =>
                  setArea(areas?.find((a) => a.id === value) ?? null)
                }
                options={[
                  { id: "Uncategorized", label: "Uncategorized" },
                ].concat(
                  areas?.map((area) => ({ id: area.id, label: area.name })) ??
                    [],
                )}
                placeholder="Select an area"
                className="w-52"
              />
            </div>
            <div className="grid gap-2">
              <Label>Area Description</Label>
              <span className="text-muted-foreground text-sm">
                {area?.description ?? "Uncategorized"}
              </span>
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="onComplete">On Complete Action</Label>
            <Combobox
              id="onComplete"
              value={onComplete ?? "None"}
              setValue={(value) =>
                setOnComplete(
                  value === "None" ? null : (value as OnCompleteEnum),
                )
              }
              options={[
                { id: "None", label: "None" },
                // { id: "Note", label: "Note" },
                {
                  id: "Blood_pressure_reading",
                  label: "Blood pressure reading",
                },
                { id: "Weigh_in", label: "Weigh in" },
                // { id: "Runners_log", label: "Runners log" },
              ]}
              placeholder="Select an action"
              className="w-52"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <div className="flex flex-wrap justify-center gap-2">
              {measurableTypes.map((t) => (
                <div
                  key={t.label}
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
          <AnimatePresence initial={false}>
            {type === "Countdown" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid gap-3"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="suggestedDay">
                      Suggested Day
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Combobox
                      id="suggestedDay"
                      value={suggestedDay as string}
                      setValue={(value) =>
                        setSuggestedDay(value as DayOfWeekEnum | null)
                      }
                      options={daysOfWeek}
                      placeholder="Select a day"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="suggestedDayTime">
                      Suggest Day Time
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Combobox
                      id="suggestedDayTime"
                      value={suggestedDayTime as string}
                      setValue={(value) =>
                        setSuggestedDayTime(value as DaytimeEnum | null)
                      }
                      options={[
                        { id: "Morning", label: "Morning" },
                        { id: "Afternoon", label: "Afternoon" },
                        { id: "Evening", label: "Evening" },
                        { id: "Night", label: "Night" },
                      ]}
                      placeholder="Select a time of day"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Due Date</Label>
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
                          {dueDate
                            ? dueDate.toLocaleDateString()
                            : "Select date"}
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
                  <div className="grid gap-2">
                    <Label>Interval</Label>
                    <Input
                      type="number"
                      value={interval}
                      onChange={(e) => setInterval(Number(e.target.value))}
                      placeholder="days"
                      className="w-24"
                    />
                    {/*<span className="text-muted-foreground text-sm">
                      {interval
                        ? `Every ${interval} day${interval > 1 ? "s" : ""}`
                        : ""}
                    </span>*/}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isCreatingMeasurable}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreateOrUpdate}
            disabled={
              !validToCreate || isCreatingMeasurable || isUpdatingMeasurable
            }
          >
            {isCreatingMeasurable || isUpdatingMeasurable ? (
              <Spinner />
            ) : measurableIdToEdit ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
