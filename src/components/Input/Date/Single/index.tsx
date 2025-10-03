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
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DayPickerSingleProps } from "react-day-picker";

type DatePickerProps = Omit<DayPickerSingleProps, "mode" | "captionLayout"> & {
  id: string;
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  helperText?: string;
  classNameContainer?: string;
  enableYearNavigation?: boolean;
  fromDate?: Date; // explicitamente adicionadas
  toDate?: Date; // explicitamente adicionadas
};

export function Single({
  id,
  value: date,
  onChange: setDate,
  label,
  isRequired = false,
  isInvalid = false,
  errorMessage = "This field is required",
  helperText,
  isDisabled,
  classNameContainer,
  enableYearNavigation,
  fromDate,
  toDate,
  ...props
}: DatePickerProps) {
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
              !date && "text-muted-foreground",
              isInvalid && "border-destructive"
            )}
            disabled={isDisabled}
            onClick={() => setIsOpen(!isOpen)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: ptBR })
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            {...props}
            mode="single"
            captionLayout={enableYearNavigation ? "dropdown" : undefined}
            selected={date}
            onSelect={(value) => {
              if (value) {
                setDate(value);
                setIsOpen(false);
              }
            }}
            disabled={isDisabled}
            defaultMonth={date}
            locale={ptBR}
            fromDate={fromDate}
            toDate={toDate}
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
