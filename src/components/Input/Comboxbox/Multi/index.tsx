"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import * as Text from "@/components/Text";
import { cn } from "@/utils/lib/utils";
import { useState } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CommandEmpty } from "cmdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MultiSelectComboboxProps {
  id: string;
  name?: string;
  label?: string;
  values?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  messageEmpty?: string;
  options: { label: string; value: string }[];
}

export const Multi: React.FC<MultiSelectComboboxProps> = ({
  id,
  name,
  label,
  values = [],
  onChange,
  isRequired,
  messageEmpty,
  placeholder,
  isInvalid,
  errorMessage,
  options,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (currentValue: string) => {
    const newValues = values.includes(currentValue)
      ? values.filter((v) => v !== currentValue)
      : [...values, currentValue];
    onChange?.(newValues);
  };

  return (
    <div className="grid gap-3 w-full">
      {label ? (
        <Label htmlFor={id} className="flex items-center gap-1">
          {isRequired && <div className="text-red-500">*</div>} {label}
        </Label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            role="combobox"
            size="default"
            aria-expanded={open}
            className="justify-between"
          >
            {values.length > 0
              ? `${values.length} ${"selected"}`
              : placeholder || "placeholder.select"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] h-[200px] p-0">
          <Command className="overflow-auto">
            <CommandInput
              placeholder={placeholder || "placeholder.select"}
              className="h-9"
              name={name || id}
            />
            <CommandList>
              <CommandEmpty>{messageEmpty || "noData"}</CommandEmpty>
              <ScrollArea className="overflow-auto">
                <CommandGroup>
                  {options?.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      {option.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          values.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isInvalid && errorMessage ? (
        <Text.Base className="text-red-500 text-sm font-medium">
          {errorMessage.toLocaleLowerCase()}
        </Text.Base>
      ) : null}
    </div>
  );
};
