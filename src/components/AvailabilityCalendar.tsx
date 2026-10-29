import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import { TODAY } from "@/data/mock";
import { toMin } from "@/lib/contest";
import { DemandBadge } from "./contest";
import { StatusBadge } from "./shared";
import { cn } from "@/lib/utils";
import type { Contest } from "@/data/types";

const H0 = 8, H1 = 20;

/** 7-day availability grid. Booked = solid, contested = amber/violet stripes with a count bubble. */
export function AvailabilityCalendar({ resourceId }: { resourceId: string }) {
  const { bookings, contests, users } = useApp();
  const [open, setOpen] = useState<Contest | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => format(addDays(TODAY, i), "yyyy-MM-dd"));
  const pct = (t: string) => ((toMin(t) - H0 * 60) / ((H1 - H0) * 60)) * 100;
  const liveOpen = open ? contests.find((c) => c.id === open.id) : null;
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-primary/80" />Booked</span>
        <span className="inline-flex items-center gap-1.5"><span className="bg-contested h-3 w-5 rounded border border-amber/40" />Contested</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-amber/60" />Program</span>
      </div>
      <div className="space-y-1.5" role="table" aria-label="Availability for the next 7 days">
        <div className="relative ml-20 h-4 text-[10px] text-muted-foreground" aria-hidden>
          {[8, 10, 12, 14, 16, 18, 20].map((h) => <span key={h} className="absolute -translate-x-1/2" style={{ left: `${((h - H0) / (H1 - H0)) * 100}%` }}>{h}:00</span>)}
        </div>
        {days.map((day) => {
          const bs = bookings.filter((b) => b.resourceId === resourceId && b.date === day && ["approved", "active"].includes(b.status));
          const cs = contests.filter((c) => c.resourceId === resourceId && c.date === day && c.status !== "decided" && c.requestIds.length > 0);
          return (
            <div key={day} role="row" className="flex items-center gap-2">
              <span role="rowheader" className="w-18 shrink-0 text-xs font-medium">{format(new Date(day), "EEE d")}</span>
              <div role="cell" className="relative h-9 flex-1 rounded-lg bg-muted/60">
                {bs.map((b) => (
                  <div key={b.id} title={`${b.start} booked`} className={cn("absolute inset-y-1 rounded-md", b.programId ? "bg-amber/60" : "bg-primary/80")} style={{ left: `${Math.max(0, pct(b.start))}%`, width: `${(b.duration * 60 / ((H1 - H0) * 60)) * 100}%` }}>
                    <span className="sr-only">Booked from {b.start} for {b.duration} hours</span>
                  </div>
                ))}
                {cs.map((c) => (
                  <button key={c.id} onClick={() => setOpen(c)} aria-label={`Contested slot ${c.start} to ${c.end}, ${c.requestIds.length} requests. Open details`} className="bg-contested absolute inset-y-0.5 rounded-md border-2 border-amber/60 transition-transform hover:scale-y-110 focus-visible:outline-2" style={{ left: `${Math.max(0, pct(c.start))}%`, width: `${pct(c.end) - Math.max(0, pct(c.start))}%` }}>
                    <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-st-waitlisted px-1 text-[10px] font-bold text-primary-foreground">{c.requestIds.length}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Sheet open={!!liveOpen} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Contested slot</SheetTitle><SheetDescription>{liveOpen && `${liveOpen.date} · ${liveOpen.start}–${liveOpen.end}`}</SheetDescription></SheetHeader>
          {liveOpen && (
            <div className="space-y-4 px-4">
              <DemandBadge contest={liveOpen} />
              <ul className="space-y-2">
                {liveOpen.requestIds.map((rid, i) => { const b = bookings.find((x) => x.id === rid); if (!b) return null; const u = users.find((x) => x.id === b.userId); return <li key={rid} className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Applicant {i + 1} · {b.purposeCategory ?? "Other"}<span className="block text-xs text-muted-foreground">{b.start} · {b.duration}h{u ? "" : ""}</span></span><StatusBadge status={b.status} /></li>; })}
              </ul>
              <Button asChild className="w-full"><Link to="/contests/$id" params={{ id: liveOpen.id }}>Open contest</Link></Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
