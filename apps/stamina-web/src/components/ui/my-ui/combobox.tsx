"use client";

import { cva } from "class-variance-authority";
import { useState } from "react";

import { Check, ChevronDownIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "../button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../command";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

const comboboxVariants = cva("justify-between font-normal");

export default function Combobox({
  value,
  setValue,
  options,
  searchable,
  placeholder,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  value: string | null;
  setValue: (value: string | null) => void;
  options: { id: string | null; label: string }[];
  searchable?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(comboboxVariants({ className }))}
          {...props}
        >
          {options.find((o) => o.id === value)?.label ??
            placeholder ??
            "Select an option"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Command>
          {searchable && (
            <CommandInput placeholder="Search..." className="h-9" />
          )}
          <CommandList>
            <CommandEmpty>No options found</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id ?? ""}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? null : currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      option.id === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
