"use client";

import type { DayOfWeekEnum, DaytimeEnum } from "@prisma/client";
import { ChevronDownIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { ImHourGlass } from "react-icons/im";
import { LuTally4, LuTelescope } from "react-icons/lu";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";
import { AppContext } from "~/contexts/AppContext";

import { nextDay, type Day } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { api } from "~/trpc/react";
import type { AreaType, MeasurableType } from "~/trpc/types";
import Combobox from "./ui/combobox";
import { set } from "zod";

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
    measurableIdToEdit!,
    {
      enabled: !!measurableIdToEdit,
    },
  );
  const { mutateAsync: createMeasurable, isPending: isCreatingMeasurable } =
    api.measurable.create.useMutation({
      onSuccess: async () => {
        await utils.measurable.findAll.invalidate();
        closeCreateMeasurableModal();
        setName("");
        setDescription("");
        setAreaId(null);
        setType("Countdown");
        setSuggestedDay(null);
        setSuggestedDayTime(null);
        setDueDate(null);
        setInterval(undefined);
      },
    });

  const { mutateAsync: updateMeasurable, isPending: isUpdatingMeasurable } =
    api.measurable.update.useMutation({
      onSuccess: async () => {
        await utils.measurable.findAll.invalidate();
        closeCreateMeasurableModal();
        setName("");
        setDescription("");
        setType("Countdown");
        setDueDate(null);
      },
    });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [type, setType] = useState<MeasurableType["type"]>("Countdown");
  const [suggestedDayTime, setSuggestedDayTime] = useState<DaytimeEnum | null>(
    null,
  );
  const [suggestedDay, setSuggestedDay] = useState<DayOfWeekEnum | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [interval, setInterval] = useState<number>();
  const [effectiveArea, setEffectiveArea] = useState<AreaType | null>();

  const handleCreateOrUpdate = () => {
    if (id) {
      updateMeasurable({
        id,
        name,
        description,
        areaId: effectiveArea?.id ?? null,
        type,
        suggestedDay: suggestedDay,
        suggestedDayTime: suggestedDayTime,
        dueDate: dueDate,
        interval,
      });
    } else {
      createMeasurable({
        name,
        description,
        areaId: effectiveArea?.id ?? null,
        type,
        suggestedDay,
        suggestedDayTime,
        dueDate,
        interval,
      });
    }
  };

  const [validToCreate, setValidToCreate] = useState(false);
  const validateForm = () => {
    if (name.trim().length === 0) return false;
    if (type === "Countdown" && !dueDate) return false;

    return true;
  };
  useEffect(() => {
    setValidToCreate(validateForm());
  }, [name, type, dueDate, areaId]);

  // UX: when editing, populate fields or set defaults when creating new
  useEffect(() => {
    if (measurableToEdit) {
      setId(measurableToEdit.id);
      setName(measurableToEdit.name);
      setDescription(measurableToEdit.description);
      setAreaId(measurableToEdit.areaId ?? "");
      setType(measurableToEdit.type);
      setSuggestedDay(measurableToEdit.suggestedDay);
      setSuggestedDayTime(measurableToEdit.suggestedDayTime);
      setDueDate(measurableToEdit.dueDate);
      setInterval(measurableToEdit.interval ?? undefined);
    } else {
      setId(null);
      setName("");
      setDescription("");
      setAreaId(null);
      setType("Countdown");
      setSuggestedDayTime(null);
      setSuggestedDay(null);
      setDueDate(null);
      setInterval(undefined);
    }
  }, [measurableToEdit]);

  // UX: set effective area when areaId or areas change
  useEffect(() => {
    setEffectiveArea(areas?.find((a) => a.id === areaId));
  }, [areaId, areas]);

  // UX: set dueDate to next instance of suggestedDay when it is selected
  useEffect(() => {
    if (type !== "Countdown") return;
    if (!suggestedDay) return;

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

    // default interval to 7 days
    setInterval(7);
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

  const daysOfWeek = [
    { id: "Sunday", label: "Sunday" },
    { id: "Monday", label: "Monday" },
    { id: "Tuesday", label: "Tuesday" },
    { id: "Wednesday", label: "Wednesday" },
    { id: "Thursday", label: "Thursday" },
    { id: "Friday", label: "Friday" },
    { id: "Saturday", label: "Saturday" },
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
      <DialogContent>
        {/* <DialogHeader>
          <DialogTitle>Create Measurable</DialogTitle>
          <DialogDescription>Create a new measurable item.</DialogDescription>
        </DialogHeader> */}
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
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="area">Area</Label>
              <Combobox
                value={effectiveArea?.name ?? "Uncategorized"}
                setValue={setAreaId}
                options={[
                  { id: "Uncategorized", label: "Uncategorized" },
                ].concat(
                  areas?.map((area) => ({ id: area.id, label: area.name })) ||
                    [],
                )}
                placeholder="Select an area"
              />
            </div>
            <div className="grid gap-2">
              <Label>Area Description</Label>
              <span className="text-muted-foreground text-sm">
                {effectiveArea?.description ?? "Uncategorized"}
              </span>
            </div>
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
          <AnimatePresence initial={false}>
            {type === "Countdown" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid gap-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="suggestedDay">
                      Suggested Day
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Combobox
                      value={suggestedDay}
                      setValue={(value) =>
                        setSuggestedDay(value as DayOfWeekEnum | null)
                      }
                      options={daysOfWeek}
                      placeholder="Select a day"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="suggestDayTime">
                      Suggest Day Time
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Combobox
                      value={suggestedDayTime}
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
                <div className="grid grid-cols-2 gap-3">
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
