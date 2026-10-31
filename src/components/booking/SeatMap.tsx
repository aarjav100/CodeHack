import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Lock,
  Clock,
  Wrench,
  Shield,
  Calendar,
  Plus,
  Sparkles,
  Users,
  Layers,
  List,
  Grid,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import type { Resource, SeatItem, SeatLayout, SlotDefinition, SeatState, User, Booking } from "@/data/types";
import { resolveSeatStatus, pickBestSeat, pickAdjacentSeats } from "@/data/cinemaMock";
import { SeatLegend } from "./SeatLegend";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SeatMapProps {
  resource: Resource;
  dateStr: string;
  selectedSlot: SlotDefinition;
  currentUser: { id?: string; skills?: string[] } | null;
  bookings: Booking[];
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
  onSelectMultipleSeats: (seatIds: string[]) => void;
  isWholeLab: boolean;
  onToggleWholeLab: (val: boolean) => void;
  maxSeatsPerBooking?: number;
}

export function SeatMap({
  resource,
  dateStr,
  selectedSlot,
  currentUser,
  bookings,
  selectedSeats,
  onToggleSeat,
  onSelectMultipleSeats,
  isWholeLab,
  onToggleWholeLab,
  maxSeatsPerBooking = 5,
}: SeatMapProps) {
  const layout = resource.seatLayout;
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [groupSize, setGroupSize] = useState<number>(2);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [activeSeatModal, setActiveSeatModal] = useState<{ seat: SeatItem; status: any } | null>(null);

  // Zoom & Pan for mobile / large rooms
  const [scale, setScale] = useState(1);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  if (!layout) {
    return (
      <div className="rounded-3xl border border-slate-200 p-8 text-center bg-white dark:border-slate-800 dark:bg-card">
        <p className="text-sm text-muted-foreground">
          No visual seat layout configured for this space.
        </p>
      </div>
    );
  }

  // Resolve status for every seat in the room
  const seatStatusMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof resolveSeatStatus>>();
    layout.seats.forEach((seat) => {
      const status = resolveSeatStatus(
        seat,
        resource,
        dateStr,
        selectedSlot,
        currentUser,
        selectedSeats,
        bookings
      );
      map.set(seat.id, status);
    });
    return map;
  }, [layout, resource, dateStr, selectedSlot, currentUser, selectedSeats, bookings]);

  // Available seats list
  const availableSeatIds = useMemo(() => {
    return layout.seats
      .filter((s) => seatStatusMap.get(s.id)?.state === "available")
      .map((s) => s.id);
  }, [layout, seatStatusMap]);

  // Counts for the live counter
  const totalSeats = layout.seats.length;
  const freeCount = availableSeatIds.length;
  const bookedCount = layout.seats.filter(
    (s) => seatStatusMap.get(s.id)?.state === "booked"
  ).length;

  // "Pick the best seat for me" handler
  const handlePickBestSeat = () => {
    const best = pickBestSeat(layout, availableSeatIds);
    if (!best) {
      toast.error("No free seats available in this slot");
      return;
    }
    onSelectMultipleSeats([best]);
    toast.success(`Selected best center seat: ${best}`, {
      icon: <Sparkles className="h-4 w-4 text-primary" />,
    });
  };

  // "Join as a group" handler
  const handleConfirmGroup = () => {
    const adjacent = pickAdjacentSeats(layout, availableSeatIds, groupSize);
    if (adjacent.length < groupSize) {
      toast.warning(
        `Could not find ${groupSize} adjacent seats together in one row. Selected closest available.`
      );
      onSelectMultipleSeats(availableSeatIds.slice(0, groupSize));
    } else {
      onSelectMultipleSeats(adjacent);
      toast.success(
        `Selected ${adjacent.length} adjacent seats: ${adjacent.join(", ")}`
      );
    }
    setIsGroupModalOpen(false);
  };

  // "Book the whole lab" check
  const canBookWholeLab = bookedCount === 0;
  const handleWholeLabToggle = (checked: boolean) => {
    if (checked && !canBookWholeLab) {
      toast.error(
        `${bookedCount} seat(s) are already booked. Choose another slot or pick seats individually.`
      );
      return;
    }
    onToggleWholeLab(checked);
    if (checked) {
      onSelectMultipleSeats(availableSeatIds);
      toast.info(`Selected all ${availableSeatIds.length} stations for full lab reservation`);
    } else {
      onSelectMultipleSeats([]);
    }
  };

  // Keyboard navigation for accessible grid
  const handleKeyDown = (e: React.KeyboardEvent, seatId: string, rIdx: number, cIdx: number) => {
    const rows = layout.rows;
    const cols = layout.cols;
    let targetRow = rIdx;
    let targetCol = cIdx;

    if (e.key === "ArrowUp") targetRow = Math.max(0, rIdx - 1);
    else if (e.key === "ArrowDown") targetRow = Math.min(rows - 1, rIdx + 1);
    else if (e.key === "ArrowLeft") targetCol = Math.max(1, cIdx - 1);
    else if (e.key === "ArrowRight") targetCol = Math.min(cols, cIdx + 1);
    else return;

    e.preventDefault();
    const targetSeatId = `${String.fromCharCode(65 + targetRow)}${targetCol}`;
    const targetEl = document.getElementById(`seat-btn-${targetSeatId}`);
    if (targetEl) targetEl.focus();
  };

  // Render individual seat button
  const renderSeatButton = (seat: SeatItem, rIdx: number) => {
    const status = seatStatusMap.get(seat.id)!;
    const isSelected = status.state === "selected";
    const isAvailable = status.state === "available";
    const isBooked = status.state === "booked";
    const isRequested = status.state === "requested";
    const isMaintenance = status.state === "maintenance";
    const isLocked = status.state === "locked";
    const isEvent = status.state === "event_reserved";

    // Style token according to exact specifications
    let colorClass =
      "border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-100/80 hover:scale-105 active:scale-95 shadow-xs";
    let Icon = Plus;

    if (isSelected) {
      colorClass =
        "border-indigo-600 bg-indigo-600 text-white font-extrabold shadow-md ring-2 ring-indigo-500/40 scale-105";
      Icon = Check;
    } else if (isBooked) {
      colorClass =
        "border-slate-300 bg-slate-200/90 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 cursor-not-allowed opacity-80";
      Icon = Lock;
    } else if (isRequested) {
      colorClass =
        "border-amber-400 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-400/40 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.18)_50%,transparent_75%,transparent)] bg-[length:10px_10px] hover:scale-105";
      Icon = Clock;
    } else if (isMaintenance) {
      colorClass =
        "border-slate-300 bg-slate-100 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 bg-[repeating-linear-gradient(45deg,#cbd5e1,#cbd5e1_2px,transparent_2px,transparent_6px)] cursor-not-allowed opacity-75";
      Icon = Wrench;
    } else if (isLocked) {
      colorClass =
        "border-dashed border-rose-400 bg-rose-50/80 text-rose-700 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300 hover:border-rose-500";
      Icon = Shield;
    } else if (isEvent) {
      colorClass =
        "border-purple-300 bg-purple-100 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300 cursor-not-allowed opacity-85";
      Icon = Calendar;
    }

    const ariaLabel = `Seat ${seat.id}${seat.label ? ` (${seat.label})` : ""}, ${
      status.state === "event_reserved"
        ? `reserved for ${status.eventName}`
        : status.state === "locked"
        ? `locked: requires ${seat.trainingReq}`
        : status.state
    }`;

    const handleClick = () => {
      if (isBooked || isMaintenance || isEvent) {
        setActiveSeatModal({ seat, status });
        return;
      }
      if (isLocked) {
        setActiveSeatModal({ seat, status });
        return;
      }
      if (isRequested) {
        // Can still select competing request under Fair-Share queue!
        onToggleSeat(seat.id);
        toast.info(`Joined Fair-Share queue for Seat ${seat.id}`, {
          description: "Competing requests are ranked by score, not fastest click.",
        });
        return;
      }
      onToggleSeat(seat.id);
    };

    return (
      <TooltipProvider key={seat.id} delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              id={`seat-btn-${seat.id}`}
              type="button"
              onClick={handleClick}
              onKeyDown={(e) => handleKeyDown(e, seat.id, rIdx, seat.col)}
              className={cn(
                "relative flex h-12 w-12 sm:h-13 sm:w-13 flex-col items-center justify-center rounded-2xl border text-xs font-bold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                colorClass
              )}
              aria-label={ariaLabel}
              aria-checked={isSelected}
              role="checkbox"
            >
              {/* Pattern / Icon Indicator */}
              <Icon className="h-3.5 w-3.5 stroke-[2.5] mb-0.5" />
              <span className="text-[11px] leading-none">{seat.id}</span>

              {/* Competing request count badge */}
              {isRequested && status.requestCount && (
                <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-[9px] font-extrabold text-white shadow-xs">
                  {status.requestCount}
                </span>
              )}
            </button>
          </TooltipTrigger>

          <TooltipContent side="top" className="rounded-xl text-xs max-w-xs p-2.5">
            <div className="font-bold">{seat.label || `Seat ${seat.id}`}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">
              Status: {status.state.replace("_", " ")}
            </div>
            {status.reason && (
              <p className="mt-1 text-[11px] text-foreground font-medium">
                {status.reason}
              </p>
            )}
            {isLocked && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                Tap to unlock with free safety training &rarr;
              </p>
            )}
            {isRequested && (
              <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-300">
                Tap to enter request. Decided by Fair-Share score.
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Group seats by row for grid rendering
  const rows = useMemo(() => {
    const map = new Map<string, SeatItem[]>();
    layout.seats.forEach((seat) => {
      if (!map.has(seat.row)) map.set(seat.row, []);
      map.get(seat.row)!.push(seat);
    });
    // Sort each row by column
    map.forEach((seatsInRow) => seatsInRow.sort((a, b) => a.col - b.col));
    return Array.from(map.entries());
  }, [layout]);

  return (
    <div className="space-y-4">
      {/* Live Counter & Smart Booking Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-card">
        {/* Live Free Counter */}
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 font-bold text-xs">
            {freeCount}
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{freeCount} of {totalSeats} seats free</span>
              {freeCount > 0 && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.2 text-[10px] font-bold">
                  Open Now
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {dateStr} &bull; Slot: {selectedSlot.label}
            </p>
          </div>
        </div>

        {/* Action Buttons: Pick Best / Group / Whole Lab */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pick Best Seat */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handlePickBestSeat}
            disabled={freeCount === 0}
            className="h-8 rounded-xl text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Pick best seat
          </Button>

          {/* Join as Group */}
          {maxSeatsPerBooking > 1 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsGroupModalOpen(true)}
              disabled={freeCount < 2}
              className="h-8 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300"
            >
              <Users className="h-3.5 w-3.5 mr-1" /> Join as a group
            </Button>
          )}

          {/* Book the whole lab toggle switch */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-2.5 py-1 text-xs font-semibold transition-colors",
              canBookWholeLab
                ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
                : "border-slate-200 bg-slate-100/50 opacity-60 cursor-not-allowed"
            )}
            title={
              canBookWholeLab
                ? "Select all free seats for full team reservation"
                : `${bookedCount} seat(s) are already booked in this slot`
            }
          >
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
              Book whole lab
            </span>
            <Switch
              checked={isWholeLab}
              disabled={!canBookWholeLab}
              onCheckedChange={handleWholeLabToggle}
              aria-label="Book the whole lab"
            />
          </div>

          {/* View mode toggle (Grid vs Accessible List) */}
          <div className="flex items-center rounded-xl border bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-card dark:text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid layout view"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-card dark:text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Accessible list view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Seat Layout Stage */}
      {viewMode === "grid" ? (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 p-4 sm:p-8 dark:border-slate-800 dark:from-card dark:via-background dark:to-card/60 shadow-xs">
          {/* Zoom controls (mobile / large rooms) */}
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-xl border bg-white/90 p-1 backdrop-blur-sm dark:bg-card/90 shadow-xs">
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            {scale !== 1 && (
              <button
                type="button"
                onClick={() => setScale(1)}
                className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Cinema-Style Screen Curve: "Whiteboard / Entrance" */}
          <div className="mx-auto mb-8 max-w-md text-center">
            <div className="relative mx-auto h-3 w-full rounded-t-full border-t-4 border-indigo-400/80 dark:border-indigo-500/80 shadow-[0_-4px_12px_rgba(99,102,241,0.2)]" />
            <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
              <span>{layout.screenLabel || "Whiteboard / Main Entrance"}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Front of the room &bull; Workstations face forward
            </p>
          </div>

          {/* Interactive Seat Rows Grid */}
          <div
            ref={gridContainerRef}
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            className="flex flex-col items-center gap-3 transition-transform duration-150 overflow-x-auto py-2"
          >
            {rows.map(([rowLetter, seatsInRow], rIdx) => (
              <div key={rowLetter} className="flex items-center gap-3">
                {/* Left Row Identifier */}
                <span className="grid h-6 w-6 place-items-center text-xs font-bold text-slate-400 select-none">
                  {rowLetter}
                </span>

                {/* Seat Buttons in Row */}
                <div className="flex items-center gap-2">
                  {seatsInRow.map((seat, cIdx) => {
                    const hasAisle = layout.aisles?.includes(seat.col);
                    return (
                      <React.Fragment key={seat.id}>
                        {renderSeatButton(seat, rIdx)}
                        {/* Aisle gap */}
                        {hasAisle && (
                          <div
                            className="w-4 sm:w-6 border-r border-dashed border-slate-200 dark:border-slate-800"
                            aria-hidden="true"
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Identifier */}
                <span className="grid h-6 w-6 place-items-center text-xs font-bold text-slate-400 select-none">
                  {rowLetter}
                </span>
              </div>
            ))}
          </div>

          {/* Minimap indicator for large rooms */}
          {totalSeats > 40 && (
            <div className="mt-6 flex items-center justify-center text-xs text-muted-foreground">
              <span>Drag or pinch to pan across room layout</span>
            </div>
          )}
        </div>
      ) : (
        /* Accessible List View for Screen Reader & Low Vision Users */
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-card">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Accessible Seat Directory
          </div>
          <div className="space-y-2">
            {layout.seats.map((seat, idx) => {
              const status = seatStatusMap.get(seat.id)!;
              const isSelected = status.state === "selected";
              const isAvailable = status.state === "available";

              return (
                <div
                  key={seat.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm">{seat.label || `Seat ${seat.id}`}</span>
                    <span className="text-xs text-muted-foreground">Row {seat.row}, Col {seat.col}</span>
                    <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      {status.state.replace("_", " ")}
                    </span>
                  </div>

                  {isAvailable && (
                    <Button
                      size="sm"
                      onClick={() => onToggleSeat(seat.id)}
                      className="rounded-xl text-xs h-8"
                    >
                      {isSelected ? "Remove" : "Select"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Legend */}
      <SeatLegend />

      {/* Group Booking Modal */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Users className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Join as a Group</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose how many people are in your study group. The app will automatically find adjacent seats in the same row.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Group Size (Number of Seats)
              </label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGroupSize(num)}
                    className={cn(
                      "py-3 rounded-xl border text-sm font-extrabold transition-all",
                      groupSize === num
                        ? "border-primary bg-primary text-white shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    )}
                  >
                    {num} People
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Maximum allowed for {resource.name} is {maxSeatsPerBooking} seats per group reservation.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsGroupModalOpen(false)}
              className="rounded-xl text-xs flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmGroup}
              className="rounded-xl text-xs flex-1 bg-primary text-white font-bold"
            >
              Find Adjacent Seats &rarr;
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seat Details Modal for Locked / Maintenance / Event seats */}
      <Dialog
        open={!!activeSeatModal}
        onOpenChange={(open) => !open && setActiveSeatModal(null)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Info className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {activeSeatModal?.seat.label || `Seat ${activeSeatModal?.seat.id}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Station Status: <strong className="capitalize">{activeSeatModal?.status.state.replace("_", " ")}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-3">
            {activeSeatModal?.status.reason && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border">
                {activeSeatModal.status.reason}
              </p>
            )}

            {activeSeatModal?.status.state === "locked" && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200">
                <p className="font-bold">Missing Required Certification:</p>
                <p className="mt-1 text-[11px]">
                  This station requires the <strong>{activeSeatModal.seat.trainingReq}</strong> badge before operation.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  <Link to="/discover">
                    <Sparkles className="mr-1 h-3.5 w-3.5" /> Take Free Safety Training
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
