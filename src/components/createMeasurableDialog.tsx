"use client";

import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FaStopwatch20 } from "react-icons/fa6";
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
import { api } from "~/trpc/react";
import type { MeasurableType } from "~/trpc/types";

export default function CreateMeasurableDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { mutateAsync: createMeasurable, isPending: isCreatingMeasurable } =
    api.measurable.create.useMutation({
      onSuccess: async () => {
        await utils.measurable.findAll.invalidate();
        onClose();
        setName("");
        setDescription("");
        setType("Countdown");
        setDueDate(null);
      },
    });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
  );
}
