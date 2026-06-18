"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"
import { buttonVariants } from "../../components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 flex opacity-50 hover:opacity-100 items-center justify-center cursor-pointer"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-parchment/50 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 flex items-center justify-center relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-parchment/5 [&:has([aria-selected])]:bg-parchment/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center cursor-pointer"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gold text-forest-light hover:bg-gold hover:text-forest-light focus:bg-gold focus:text-forest-light",
        day_today: "bg-parchment/10 text-parchment",
        day_outside:
          "day-outside text-parchment/50 opacity-50 aria-selected:bg-parchment/10 aria-selected:text-parchment/50 aria-selected:opacity-30",
        day_disabled: "text-parchment/30 opacity-50",
        day_range_middle:
          "aria-selected:bg-parchment/10 aria-selected:text-parchment",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-parchment items-center flex" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-parchment items-center flex" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
