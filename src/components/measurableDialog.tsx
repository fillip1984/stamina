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
import { AppContext, UncategorizedArea } from "~/contexts/AppContext";

import { differenceInCalendarDays } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { api } from "~/trpc/react";
import type { AreaType, MeasurableType } from "~/trpc/types";
import Combobox from "./ui/combobox";

export default function MeasurableDialog() {
  const {
    isCreateMeasurableModalOpen,
    openCreateMeasurableModal,
    closeCreateMeasurableModal,
    measurableIdToEdit,
  } = useContext(AppContext);

  const utils = api.useUtils();
  const { data: measurableToEdit } = api.measurable.findById.useQuery(
    measurableIdToEdit!,
    {
      enabled: !!measurableIdToEdit,
    },
  );
  const { data: areas } = api.area.findAll.useQuery();
  const { mutateAsync: createMeasurable, isPending: isCreatingMeasurable } =
    api.measurable.create.useMutation({
      onSuccess: async () => {
        await utils.measurable.findAll.invalidate();
        closeCreateMeasurableModal();
        setName("");
        setDescription("");
        setType("Countdown");
        setDueDate(null);
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
  const [type, setType] = useState<MeasurableType["type"]>("Countdown");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [suggestDayTime, setSuggestDayTime] = useState<DaytimeEnum | null>(
    null,
  );
  const [suggestedDay, setSuggestedDay] = useState<DayOfWeekEnum | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [effectiveArea, setEffectiveArea] = useState<AreaType>();

  useEffect(() => {
    if (measurableToEdit) {
      setId(measurableToEdit.id);
      setName(measurableToEdit.name);
      setDescription(measurableToEdit.description);
      setType(measurableToEdit.type);
      setDueDate(measurableToEdit.dueDate);
      setSuggestDayTime(measurableToEdit.suggestedDayTime);
      setSuggestedDay(measurableToEdit.suggestedDay);
      setAreaId(measurableToEdit.areaId ?? "Uncategorized");
    } else {
      setName("");
      setDescription("");
      setType("Countdown");
      setDueDate(null);
      setSuggestDayTime(null);
      setSuggestedDay(null);
      setAreaId("Uncategorized");
    }
  }, [measurableToEdit]);

  useEffect(() => {
    if (areaId === "Uncategorized") {
      setEffectiveArea(UncategorizedArea);
    } else if (areaId) {
      setEffectiveArea(areas?.find((a) => a.id === areaId));
    }
  }, [areaId, areas]);

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
        "A measurable that we don't know how long the interval should be, due date is set open ended until you complete and then the duration is set.",
    },
    {
      label: "Tally",
      icon: <LuTally4 />,
      description: "A measurable that tallies up days since being set.",
    },
  ];

  const handleCreateOrUpdate = () => {
    if (id) {
      updateMeasurable({
        id,
        name,
        description,
        type,
        dueDate: dueDate,
        areaId: effectiveArea?.id ?? null,
        suggestedDay: suggestedDay,
        suggestedDayTime: suggestDayTime,
      });
    } else {
      createMeasurable({
        name,
        description,
        type,
        dueDate: dueDate,
        areaId: effectiveArea?.id ?? null,
        suggestedDay: suggestedDay,
        suggestedDayTime: suggestDayTime,
      });
    }
  };

  const [validToCreate, setValidToCreate] = useState(false);
  const validateForm = () => {
    if (name.trim().length === 0) return false;
    if (type === "Countdown" && !dueDate) return false;
    if (areaId === null) return false;

    return true;
  };
  useEffect(() => {
    setValidToCreate(validateForm());
  }, [name, type, dueDate, areaId]);

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
        <DialogHeader>
          <DialogTitle>Create Measurable</DialogTitle>
          <DialogDescription>Create a new measurable item.</DialogDescription>
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
                value={areaId}
                setValue={setAreaId}
                options={[UncategorizedArea]
                  .map((area) => ({ id: area.id, label: area.name }))
                  .concat(
                    areas?.map((area) => ({ id: area.id, label: area.name })) ||
                      [],
                  )}
                placeholder="Select an area"
              />
            </div>
            <div className="grid gap-2">
              <Label>Area Description</Label>
              <span className="text-muted-foreground text-sm">
                {effectiveArea?.description}
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
          <AnimatePresence>
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
                      options={[
                        { id: "Sunday", label: "Sunday" },
                        { id: "Monday", label: "Monday" },
                        { id: "Tuesday", label: "Tuesday" },
                        { id: "Wednesday", label: "Wednesday" },
                        { id: "Thursday", label: "Thursday" },
                        { id: "Friday", label: "Friday" },
                        { id: "Saturday", label: "Saturday" },
                      ]}
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
                      value={suggestDayTime}
                      setValue={(value) =>
                        setSuggestDayTime(value as DaytimeEnum | null)
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
                    <Label>Duration</Label>
                    <span className="text-muted-foreground text-sm">
                      {`${differenceInCalendarDays(dueDate ?? new Date(), new Date())} days`}
                    </span>
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
            ) : id ? (
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
