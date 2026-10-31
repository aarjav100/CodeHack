import React, { useId, useState } from "react";
import { format, parseISO, addDays } from "date-fns";
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Users, 
  Info, 
  Lock, 
  Wrench, 
  Zap,
  List,
  Grid
} from "lucide-react";
import type { Resource, Booking } from "@/data/types";
import { toMin, fromMin } from "@/lib/contest";

interface VenueTimelineProps {
  resource: Resource;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  bookings: Booking[];
  selectedRange: { start: string; end: string } | null;
  onSelectRange: (range: { start: string; end: string } | null) => void;
  onContinue: () => void;
}

// 1-hour slots from 09:00 to 21:00
const TIME_BLOCKS = [
  { start: "09:00", end: "10:00", label: "09:00 - 10:00" },
  { start: "10:00", end: "11:00", label: "10:00 - 11:00" },
  { start: "11:00", end: "12:00", label: "11:00 - 12:00" },
  { start: "12:00", end: "13:00", label: "12:00 - 13:00" },
  { start: "13:00", end: "14:00", label: "13:00 - 14:00" },
  { start: "14:00", end: "15:00", label: "14:00 - 15:00" },
  { start: "15:00", end: "16:00", label: "15:00 - 16:00" },
  { start: "16:00", end: "17:00", label: "16:00 - 17:00" },
  { start: "17:00", end: "18:00", label: "17:00 - 18:00" },
  { start: "18:00", end: "19:00", label: "18:00 - 19:00" },
  { start: "19:00", end: "20:00", label: "19:00 - 20:00" },
  { start: "20:00", end: "21:00", label: "20:00 - 21:00" },
];

const PRESETS = [
  { id: "morning", label: "Morning (9-1)", start: "09:00", end: "13:00" },
  { id: "afternoon", label: "Afternoon (2-6)", start: "14:00", end: "18:00" },
  { id: "full_day", label: "Full Day (9-9)", start: "09:00", end: "21:00" },
  { id: "evening", label: "Evening (6-9)", start: "18:00", end: "21:00" },
];

export const VenueTimeline: React.FC<VenueTimelineProps> = ({
  resource,
  selectedDate,
  onSelectDate,
  bookings,
  selectedRange,
  onSelectRange,
  onContinue,
}) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [isListView, setIsListView] = useState(false);
  const listId = useId();

  // Next 14 days
  const today = new Date();
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(today, i);
    return {
      dateStr: format(d, "yyyy-MM-dd"),
      dayName: format(d, "EEE"),
      dayNum: format(d, "d"),
      month: format(d, "MMM"),
      isToday: i === 0,
    };
  });

  // Calculate block status
  const getBlockInfo = (blockStart: string, blockEnd: string) => {
    const bStartMin = toMin(blockStart);
    const bEndMin = toMin(blockEnd);

    // Filter bookings on this resource for this date
    const dayBookings = bookings.filter(
      (b) => b.resourceId === resource.id && b.date === selectedDate && b.status !== "cancelled" && b.status !== "rejected"
    );

    // Overlapping bookings
    const overlapping = dayBookings.filter((b) => {
      const startMin = toMin(b.start);
      const endMin = startMin + b.duration * 60;
      return bStartMin < endMin && bEndMin > startMin;
    });

    const confirmed = overlapping.filter((b) => b.status === "approved");
    const requested = overlapping.filter((b) => b.status === "pending" || b.status === "waitlisted");

    if (confirmed.length > 0) {
      const top = confirmed[0];
      return {
        status: "booked" as const,
        title: top.eventName || top.purpose || "Reserved",
        count: confirmed.length,
      };
    }

    if (requested.length > 0) {
      return {
        status: "requested" as const,
        title: `${requested.length} in demand`,
        count: requested.length,
      };
    }

    // Check maintenance
    if (resource.maintenanceBlocks?.some((m) => m.date === selectedDate && m.start === blockStart)) {
      return {
        status: "maintenance" as const,
        title: "Maintenance",
        count: 0,
      };
    }

    return {
      status: "free" as const,
      title: "Free",
      count: 0,
    };
  };

  // Check if a block is inside the current selected range
  const isBlockSelected = (blockStart: string, blockEnd: string) => {
    if (!selectedRange) return false;
    const sMin = toMin(selectedRange.start);
    const eMin = toMin(selectedRange.end);
    const bStart = toMin(blockStart);
    const bEnd = toMin(blockEnd);
    return bStart >= sMin && bEnd <= eMin;
  };

  const handleBlockClick = (blockStart: string, blockEnd: string) => {
    const info = getBlockInfo(blockStart, blockEnd);
    if (info.status === "booked" || info.status === "maintenance") {
      return; // Cannot select booked block
    }

    if (!rangeStart) {
      // First tap sets start
      setRangeStart(blockStart);
      onSelectRange({ start: blockStart, end: blockEnd });
      setActivePreset(null);
    } else {
      // Second tap sets range
      const startMin = toMin(rangeStart);
      const clickedMin = toMin(blockEnd);

      let newStart = rangeStart;
      let newEnd = blockEnd;

      if (clickedMin < startMin) {
        newStart = blockStart;
        newEnd = fromMin(startMin + 60);
      }

      // Check if any block inside this range is booked
      const rangeSMin = toMin(newStart);
      const rangeEMin = toMin(newEnd);
      let hasConflict = false;

      for (const blk of TIME_BLOCKS) {
        const blkS = toMin(blk.start);
        const blkE = toMin(blk.end);
        if (blkS >= rangeSMin && blkE <= rangeEMin) {
          const bInfo = getBlockInfo(blk.start, blk.end);
          if (bInfo.status === "booked" || bInfo.status === "maintenance") {
            hasConflict = true;
            break;
          }
        }
      }

      if (hasConflict) {
        // Just reset to this clicked block
        setRangeStart(blockStart);
        onSelectRange({ start: blockStart, end: blockEnd });
      } else {
        setRangeStart(null);
        onSelectRange({ start: newStart, end: newEnd });
      }
      setActivePreset(null);
    }
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    // Check if any block in preset is booked
    const pSMin = toMin(preset.start);
    const pEMin = toMin(preset.end);
    let conflict = false;

    for (const blk of TIME_BLOCKS) {
      const blkS = toMin(blk.start);
      const blkE = toMin(blk.end);
      if (blkS >= pSMin && blkE <= pEMin) {
        const bInfo = getBlockInfo(blk.start, blk.end);
        if (bInfo.status === "booked" || bInfo.status === "maintenance") {
          conflict = true;
          break;
        }
      }
    }

    if (conflict) {
      alert(`The preset "${preset.label}" overlaps with an existing booking. Please pick custom free blocks.`);
      return;
    }

    setActivePreset(preset.id);
    setRangeStart(null);
    onSelectRange({ start: preset.start, end: preset.end });
  };

  const durationHours = selectedRange
    ? (toMin(selectedRange.end) - toMin(selectedRange.start)) / 60
    : 0;

  // Format date display
  const dateObj = parseISO(selectedDate);
  const formattedDay = format(dateObj, "EEE, MMM d");

  return (
    <div className="space-y-6">
      {/* 14-Day Date Horizontal Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pick Date (Next 14 Days)
            </span>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
            {formattedDay}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x focus:outline-none">
          {days.map((d) => {
            const isSelected = d.dateStr === selectedDate;
            return (
              <button
                key={d.dateStr}
                onClick={() => {
                  onSelectDate(d.dateStr);
                  setRangeStart(null);
                }}
                className={`snap-start flex flex-col items-center justify-center min-w-[62px] py-2.5 px-2 rounded-xl transition-all duration-150 text-center border ${
                  isSelected
                    ? "bg-indigo-700 text-white border-indigo-700 shadow-md scale-105"
                    : "bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750"
                }`}
                aria-pressed={isSelected}
                aria-label={`Select ${d.dayName} ${d.month} ${d.dayNum}`}
              >
                <span className={`text-[11px] font-medium uppercase ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
                  {d.dayName}
                </span>
                <span className="text-lg font-bold leading-tight my-0.5">{d.dayNum}</span>
                <span className={`text-[10px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                  {d.month}
                </span>
                {d.isToday && (
                  <span
                    className={`mt-1 text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? "bg-white text-indigo-700" : "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                    }`}
                  >
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Show-Time Quick Presets
            </span>
          </div>
          <span className="text-xs text-slate-400">1-tap selection</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => {
            const isMatch = selectedRange?.start === p.start && selectedRange?.end === p.end;
            return (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                  isMatch
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                <Clock className="w-3.5 h-3.5 opacity-70" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Duration & Selection Feedback Card */}
      {selectedRange ? (
        <div className="bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-indigo-950/40 dark:to-teal-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{formattedDay}</span>
                <span className="text-indigo-600 dark:text-indigo-400">·</span>
                <span>{selectedRange.start} to {selectedRange.end}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">{durationHours} hours</span>
                <span>•</span>
                <span>Venue Capacity: {resource.capacity ?? 200} people</span>
                {resource.instantConfirm && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Instant Confirm
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelectRange(null);
                setRangeStart(null);
                setActivePreset(null);
              }}
              className="text-xs font-semibold px-3 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Add Event Details</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>Tap start hour then end hour on the timeline below to select a time range.</span>
          </div>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">3 taps total</span>
        </div>
      )}

      {/* Main Timeline Grid / List View Toggle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Day Show-Time Timeline</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select consecutive blocks to book the venue
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsListView(!isListView)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="Toggle list view"
            >
              {isListView ? (
                <>
                  <Grid className="w-3.5 h-3.5" />
                  <span>Timeline view</span>
                </>
              ) : (
                <>
                  <List className="w-3.5 h-3.5" />
                  <span>List view</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 mb-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-500"></span>
            <span>Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-700"></span>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-400 border border-slate-500"></span>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 relative overflow-hidden">
              <span className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_2px,transparent_2px,transparent_4px)]"></span>
            </span>
            <span>Requested (In demand)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 border border-slate-400 relative overflow-hidden">
              <span className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(135deg,#64748b,#64748b_2px,transparent_2px,transparent_4px)]"></span>
            </span>
            <span>Maintenance</span>
          </div>
        </div>

        {/* Timeline Visual Display */}
        {!isListView ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {TIME_BLOCKS.map((blk) => {
              const info = getBlockInfo(blk.start, blk.end);
              const isSelected = isBlockSelected(blk.start, blk.end);
              const isStartBlock = selectedRange?.start === blk.start;

              // Styles based on state
              let containerStyle = "border-slate-200 dark:border-slate-750 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 hover:border-emerald-500";
              let icon = <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;

              if (isSelected) {
                containerStyle = "bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40 scale-[1.02]";
                icon = <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
              } else if (info.status === "booked") {
                containerStyle = "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-90";
                icon = <Lock className="w-3.5 h-3.5 text-slate-400" />;
              } else if (info.status === "requested") {
                containerStyle = "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200";
                icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
              } else if (info.status === "maintenance") {
                containerStyle = "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed";
                icon = <Wrench className="w-3.5 h-3.5 text-slate-400" />;
              }

              return (
                <button
                  key={blk.start}
                  type="button"
                  onClick={() => handleBlockClick(blk.start, blk.end)}
                  disabled={info.status === "booked" || info.status === "maintenance"}
                  aria-label={`${blk.label}, ${isSelected ? "selected" : info.status}`}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 min-h-[78px] justify-between relative overflow-hidden ${containerStyle}`}
                >
                  {/* Subtle stripes for requested blocks */}
                  {info.status === "requested" && !isSelected && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage: "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 4px, transparent 4px, transparent 8px)"
                      }}
                    />
                  )}

                  {/* Top: time & icon */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">{blk.start}</span>
                    {icon}
                  </div>

                  {/* Bottom: state label */}
                  <div className="mt-2 w-full">
                    <div className="text-[11px] font-semibold truncate leading-tight">
                      {isSelected ? "Selected" : info.title}
                    </div>
                    <div className={`text-[10px] truncate ${isSelected ? "text-indigo-200" : "opacity-75"}`}>
                      {info.status === "requested" ? "Competing allowed" : blk.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Accessible List View */
          <div className="space-y-2" id={listId}>
            {TIME_BLOCKS.map((blk) => {
              const info = getBlockInfo(blk.start, blk.end);
              const isSelected = isBlockSelected(blk.start, blk.end);
              const isBooked = info.status === "booked" || info.status === "maintenance";

              return (
                <div
                  key={blk.start}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {blk.label}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {info.title}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBlockClick(blk.start, blk.end)}
                    disabled={isBooked}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : isBooked
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-500"
                    }`}
                  >
                    {isSelected ? "Selected" : isBooked ? "Unavailable" : "Select Slot"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
