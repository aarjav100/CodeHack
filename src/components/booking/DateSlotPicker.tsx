import React, { useRef } from "react";
import { format, addDays, isToday, isTomorrow, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { SlotDefinition } from "@/data/types";
import { cn } from "@/lib/utils";

interface DateSlotPickerProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  slots: SlotDefinition[];
  selectedSlot: SlotDefinition;
  onSelectSlot: (slot: SlotDefinition) => void;
  slotAvailabilityMap?: Record<string, { free: number; total: number }>; // slotId -> { free, total }
  daysCount?: number;
}

export function DateSlotPicker({
  selectedDate,
  onSelectDate,
  slots,
  selectedSlot,
  onSelectSlot,
  slotAvailabilityMap = {},
  daysCount = 14,
}: DateSlotPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());

  const days = Array.from({ length: daysCount }, (_, i) => {
    const d = addDays(today, i);
    const dateStr = format(d, "yyyy-MM-dd");
    return {
      dateStr,
      dateObj: d,
      dayName: format(d, "EEE"),
      dayNumber: format(d, "d"),
      monthName: format(d, "MMM"),
      isToday: isToday(d),
      isTomorrow: isTomorrow(d),
    };
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Horizontal 14-Day Strip */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Choose Date (Next 14 Days)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="grid h-7 w-7 place-items-center rounded-lg border bg-white dark:bg-card text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Scroll dates left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="grid h-7 w-7 place-items-center rounded-lg border bg-white dark:bg-card text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Scroll dates right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Day Chips Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth"
          role="tablist"
          aria-label="Dates list"
        >
          {days.map((item) => {
            const isSelected = item.dateStr === selectedDate;

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => onSelectDate(item.dateStr)}
                role="tab"
                aria-selected={isSelected}
                className={cn(
                  "flex min-w-[76px] flex-col items-center justify-between rounded-2xl border p-2.5 text-center transition-all duration-150 outline-none select-none cursor-pointer active:scale-95 shrink-0",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-card dark:text-slate-300"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                  )}
                >
                  {item.isToday ? "Today" : item.isTomorrow ? "Tmrw" : item.dayName}
                </span>

                <span className="text-lg font-extrabold leading-tight my-0.5">
                  {item.dayNumber}
                </span>

                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Horizontal Time Slot Chips */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Choose Time Slot
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Layout updates live with slot
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {slots.map((slot) => {
            const isSelected = slot.id === selectedSlot.id;
            const avail = slotAvailabilityMap[slot.id];
            const freeCount = avail ? avail.free : 18;
            const totalCount = avail ? avail.total : 30;
            const isFull = freeCount === 0;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isFull}
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  "relative flex flex-col items-start justify-between p-3 rounded-2xl border text-left transition-all duration-150 outline-none cursor-pointer active:scale-[0.98]",
                  isSelected
                    ? "border-teal-600 bg-teal-50/70 text-teal-950 shadow-xs ring-2 ring-teal-500/20 dark:bg-teal-950/40 dark:border-teal-600 dark:text-teal-100"
                    : isFull
                    ? "border-slate-200 bg-slate-100/60 opacity-60 cursor-not-allowed text-slate-400 dark:border-slate-800 dark:bg-slate-900/40"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800 dark:border-slate-800 dark:bg-card dark:text-slate-200"
                )}
                aria-label={`Time slot ${slot.label}, ${freeCount} of ${totalCount} free`}
              >
                <div className="font-bold text-xs leading-snug">{slot.label}</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      isFull
                        ? "bg-rose-500"
                        : freeCount <= 3
                        ? "bg-amber-500 animate-pulse"
                        : "bg-emerald-500"
                    )}
                  />
                  <span
                    className={cn(
                      "font-semibold",
                      isSelected
                        ? "text-teal-700 dark:text-teal-300"
                        : isFull
                        ? "text-rose-500"
                        : freeCount <= 3
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {isFull ? "Fully booked" : `${freeCount} free`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
