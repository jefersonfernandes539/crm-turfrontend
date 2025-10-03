"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SecondsFormat = "keep" | "strip" | "zero";

type Props = {
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  timeLabel?: string;
  label?: string;
  dateValue?: Date;
  onDateChange?: (date: Date) => void;
  errorMessage?: string;
  helperText?: string;
  classNameContainer?: string;
  onlyTime?: boolean;
  timeStep?: number; // seconds between increments: 60 disables seconds UI
  secondsFormat?: SecondsFormat; // how to emit seconds in onChange value
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TimePicker({
  id,
  timeLabel,
  label,
  dateValue,
  onDateChange,
  isRequired = false,
  isDisabled = false,
  errorMessage = "This field is required",
  helperText,
  classNameContainer,
  onlyTime = false,
  timeStep = 60,
  secondsFormat = "strip",
  ...rest
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(dateValue);

  const { onChange: externalOnChange, name, ...restProps } = rest;

  const formatTimeByMode = (value: string): string => {
    if (!value) return value;
    const parts = value.split(":");
    if (secondsFormat === "strip") {
      return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : value;
    }
    if (secondsFormat === "zero") {
      const hh = parts[0] ?? "00";
      const mm = parts[1] ?? "00";
      return `${hh}:${mm}:00`;
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatTimeByMode(raw);
    if (externalOnChange) {
      (externalOnChange as any)({ target: { value: formatted, name } });
    }
  };

  return (
    <div className="flex gap-4">
      {!onlyTime && (
        <div className="flex flex-col gap-3">
          {label && (
            <Label htmlFor="date-picker" className="px-1">
              {label}
            </Label>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-32 justify-between font-normal"
                disabled={isDisabled}
              >
                {date ? date.toLocaleDateString() : "Selecionar h"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(d) => {
                  setDate(d);
                  onDateChange?.(d as Date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {timeLabel && (
          <Label htmlFor={id} className="px-1">
            {timeLabel}
          </Label>
        )}
        <Input
          type="time"
          id={id}
          step={rest.step ?? timeStep}
          disabled={isDisabled}
          onChange={handleChange}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          name={name}
          {...restProps}
        />
      </div>
    </div>
  );
}
