"use client";

import React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface DatePickerProps {
  dateRange?: DateRange;
  onDateChange: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
  disabledDates?: (date: Date) => boolean;
}

const DatePicker: React.FC<DatePickerProps> = React.memo(
  ({
    dateRange = { from: undefined, to: undefined },
    onDateChange,
    placeholder,
    disabledDates,
  }) => {
    const [open, setOpen] = React.useState(false);

    function isValidDate(date: any): date is Date {
        return date instanceof Date && !isNaN(date.getTime());
      }

      const fromDate = dateRange?.from;
      const toDate = dateRange?.to;
      
      const formattedDate = isValidDate(fromDate)
        ? isValidDate(toDate)
          ? `${format(fromDate, 'MM/dd/yyyy')} - ${format(toDate, 'MM/dd/yyyy')}`
          : format(fromDate, 'MM/dd/yyyy')
        : placeholder || 'Select date range';

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[260px] pl-3 text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            {formattedDate}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              onDateChange(range);
              // Keep the popover open until both dates are selected
              if (range && range.from && range.to) {
                setOpen(false); // Close the popover
              }
            }}
            disabled={disabledDates}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);

export default DatePicker;
