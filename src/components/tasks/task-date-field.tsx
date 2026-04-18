"use client";

import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TaskDateFieldProps = {
  id?: string;
  value: string;
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  placeholder: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

function parseLocalDate(yyyyMmDd: string): Date | undefined {
  if (!yyyyMmDd.trim()) return undefined;
  try {
    return parse(yyyyMmDd, "yyyy-MM-dd", new Date());
  } catch {
    return undefined;
  }
}

export function TaskDateField({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  "aria-invalid": ariaInvalid,
}: TaskDateFieldProps) {
  const selected = parseLocalDate(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className={cn(
            "h-9 w-full justify-start border-border bg-background font-normal text-left shadow-xs",
            "focus-visible:border-border focus-visible:ring-2 focus-visible:ring-border/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            !selected && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 opacity-60" aria-hidden />
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto gap-0 border-border p-0 shadow-md ring-1 ring-foreground/10" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
