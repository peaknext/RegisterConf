"use client";

import * as React from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Generate hours (00-23) and minutes (00-59)
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  showTime?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
}

// Format date to Thai Buddhist Era (พ.ศ.)
function formatThaiDate(date: Date, includeTime: boolean = false): string {
  const buddhistYear = date.getFullYear() + 543;
  const day = date.getDate();
  const month = format(date, "MMMM", { locale: th });

  if (includeTime) {
    const time = format(date, "HH:mm", { locale: th });
    return `${day} ${month} ${buddhistYear} เวลา ${time} น.`;
  }

  return `${day} ${month} ${buddhistYear}`;
}

export function DateTimePicker({
  date,
  setDate,
  showTime = false,
  placeholder = "เลือกวันที่",
  disabled = false,
  maxDate,
  minDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState<string>(
    date ? format(date, "HH") : ""
  );
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    date ? format(date, "mm") : ""
  );

  // Update time values when date changes externally
  React.useEffect(() => {
    if (date) {
      setSelectedHour(format(date, "HH"));
      setSelectedMinute(format(date, "mm"));
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }

    // If we have time values, apply them to the selected date
    if (showTime && selectedHour && selectedMinute) {
      selectedDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
    }

    setDate(selectedDate);

    // Close popover if not showing time
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour);
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(parseInt(hour), parseInt(selectedMinute || "0"), 0, 0);
      setDate(newDate);
    }
  };

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(parseInt(selectedHour || "0"), parseInt(minute), 0, 0);
      setDate(newDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatThaiDate(date, showTime) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(dateToCheck) => {
            if (maxDate && dateToCheck > maxDate) return true;
            if (minDate && dateToCheck < minDate) return true;
            return false;
          }}
          locale={th}
          formatters={{
            formatCaption: (captionDate) => {
              const buddhistYear = captionDate.getFullYear() + 543;
              const month = format(captionDate, "LLLL", { locale: th });
              return `${month} ${buddhistYear}`;
            },
          }}
        />
        {showTime && (
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">เวลา:</span>
              <Select value={selectedHour} onValueChange={handleHourChange}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="ชม." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">:</span>
              <Select value={selectedMinute} onValueChange={handleMinuteChange}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="นาที" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">น.</span>
            </div>
          </div>
        )}
        {showTime && (
          <div className="border-t p-3">
            <Button
              className="w-full"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ตกลง
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
