import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket, Sparkles, CheckCircle2, ShieldCheck, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyBookingBarProps {
  selectedSeats: string[];
  dateStr: string;
  slotLabel: string;
  resourceName: string;
  isInstantConfirm?: boolean;
  weeklyUsedCount?: number;
  weeklyMaxQuota?: number;
  onSendRequest: () => void;
  isSubmitting?: boolean;
  isWholeLab?: boolean;
}

export function StickyBookingBar({
  selectedSeats,
  dateStr,
  slotLabel,
  resourceName,
  isInstantConfirm = false,
  weeklyUsedCount = 2,
  weeklyMaxQuota = 3,
  onSendRequest,
  isSubmitting = false,
  isWholeLab = false,
}: StickyBookingBarProps) {
  const hasSelection = selectedSeats.length > 0 || isWholeLab;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-card/95 shadow-lift py-3 px-4 sm:px-6 animate-in slide-in-from-bottom duration-200">
      <div className="mx-auto flex max-w-[1360px] flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Info: Selected seats, Date, Time & Quota nudge */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 shrink-0">
                <Ticket className="h-3.5 w-3.5" />
              </span>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {hasSelection ? (
                  isWholeLab ? (
                    <span>Whole {resourceName}</span>
                  ) : selectedSeats.length === 1 ? (
                    <span>Seat {selectedSeats[0]}</span>
                  ) : (
                    <span>
                      {selectedSeats.length} Seats: {selectedSeats.join(", ")}
                    </span>
                  )
                ) : (
                  <span className="text-muted-foreground font-medium">
                    Tap a seat above to select
                  </span>
                )}
                <span className="text-slate-400 dark:text-slate-600 font-normal"> · </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {dateStr} ({slotLabel})
                </span>
              </div>
            </div>

            {/* Quota Nudge as requested */}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Free with Student ID
              </span>
              <span>&bull;</span>
              <span className="text-slate-600 dark:text-slate-400">
                You&apos;ve used{" "}
                <strong className="text-slate-900 dark:text-white font-bold">
                  {weeklyUsedCount} of {weeklyMaxQuota}
                </strong>{" "}
                bookings this week.
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button
            type="button"
            disabled={!hasSelection || isSubmitting}
            onClick={onSendRequest}
            className={cn(
              "h-12 w-full sm:w-auto min-w-[200px] rounded-2xl text-sm font-bold shadow-md transition-all active:scale-[0.98]",
              isInstantConfirm
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Booking in progress...
              </span>
            ) : isInstantConfirm ? (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-200" />
                Confirm Instant Booking <ArrowRight className="h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Send Booking Request <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
