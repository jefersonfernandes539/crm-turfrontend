"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import * as Text from "@/components/Text";
import { cn } from "@/utils/lib/utils";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComboboxProps {
  id: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  messageEmpty?: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
}

export const Base: React.FC<ComboboxProps> = ({
  id,
  label,
  value,
  onChange,
  isRequired,
  messageEmpty,
  placeholder,
  isInvalid,
  errorMessage,
  options,
  disabled,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-3 w-full">
      {label ? (
        <Label htmlFor={id} className="flex items-center gap-1">
          {label} {isRequired && <div className="text-red-500">*</div>}
        </Label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            disabled={disabled}
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder || "placeholder.select"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] h-[200px] p-0">
          <Command>
            <CommandInput placeholder={placeholder || "placeholder.select"} />
            <CommandList>
              <ScrollArea className="h-[160px]">
                <CommandEmpty>{messageEmpty || "noData"}</CommandEmpty>
                <CommandGroup>
                  {options?.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        if (!disabled && onChange) {
                          onChange(option.value === value ? "" : option.value);
                        }
                        setOpen(false);
                      }}
                    >
                      {option.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
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
