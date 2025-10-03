"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange, DayPickerRangeProps } from "react-day-picker";

type DateRangePickerProps = Omit<DayPickerRangeProps, "mode"> & {
  id: string;
  value: DateRange;
  onChange: (date: DateRange | undefined) => void;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  helperText?: string;
  classNameContainer?: string;
};

export function Range({
  id,
  value: dateRange,
  onChange: setDateRange,
  label,
  isRequired = false,
  isInvalid = false,
  errorMessage = "This field is required",
  helperText,
  isDisabled,
  classNameContainer,
  ...props
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("grid gap-3 w-full relative", classNameContainer)}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
              isInvalid && "border-destructive"
            )}
            disabled={isDisabled}
            onClick={() => setIsOpen(!isOpen)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full md:w-auto p-0" align="start">
          <Calendar
            {...props}
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            disabled={isDisabled}
            defaultMonth={dateRange?.from}
            numberOfMonths={2}
            className="w-full"
            toDate={new Date()}
          />
        </PopoverContent>
      </Popover>
      {!isInvalid && helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {isInvalid && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
