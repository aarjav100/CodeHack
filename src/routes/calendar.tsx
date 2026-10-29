import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { addDays, format } from "date-fns";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader, Panel } from "@/components/shared";
import { DemandBadge } from "@/components/contest";
import { useApp } from "@/store/app";
import { TODAY } from "@/data/mock";
import { endOf, fromMin, toMin } from "@/lib/contest";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Campus calendar — CampusSphare" }, { name: "description", content: "See every space's booked, contested, program and free time on one timeline." }, { property: "og:title", content: "Campus calendar — CampusSphare" }, { property: "og:description", content: "One timeline for every shared space." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: CalendarPage,
});

const H0 = 8, H1 = 20, SPAN = (H1 - H0) * 60;
const pct = (t: string) => ((toMin(t) - H0 * 60) / SPAN) * 100;
type Pick = { kind: "free"; resourceId: string; start: string } | { kind: "booked"; bookingId: string } | { kind: "contest"; contestId: string };

function CalendarPage() {
  const { resources, bookings, contests, programs, role, me } = useApp();
  const self = me();
  const [day, setDay] = useState(0);
  const [type, setType] = useState("all");
  const [pick, setPick] = useState<Pick | null>(null);
  const date = format(addDays(TODAY, day), "yyyy-MM-dd");
  const list = resources.filter((r) => type === "all" || r.type === type);
  const staff = ["owner", "manager", "admin"].includes(role);

  const pb = pick?.kind === "booked" ? bookings.find((b) => b.id === pick.bookingId) : null;
  const pc = pick?.kind === "contest" ? contests.find((c) => c.id === pick.contestId) : null;
  const pr = pick ? resources.find((r) => r.id === (pick.kind === "free" ? pick.resourceId : pb?.resourceId ?? pc?.resourceId)) : null;

  return (
    <div>
      <PageHeader title="Campus calendar" subtitle="Tap a free slot to book, a striped slot to see demand." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1" role="tablist" aria-label="Day">
          {Array.from({ length: 7 }, (_, i) => (
            <button key={i} role="tab" aria-selected={day === i} onClick={() => setDay(i)} className={cn("rounded-lg px-3 py-1.5 text-sm whitespace-nowrap", day === i ? "bg-background font-semibold shadow-sm" : "text-muted-foreground")}>
              {i === 0 ? "Today" : format(addDays(TODAY, i), "EEE d")}
            </button>
          ))}
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40" aria-label="Space type"><SelectValue /></SelectTrigger>
          <SelectContent>{["all", "lab", "hall", "classroom", "equipment"].map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All spaces" : t}</SelectItem>)}</SelectContent>
        </Select>
        <div className="ml-auto flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-primary/80" />Booked</span>
          <span className="inline-flex items-center gap-1.5"><span className="bg-contested h-3 w-5 rounded border border-amber/40" />Contested</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-amber/60" />Program</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded border border-dashed" />Free</span>
        </div>
      </div>
      <Panel className="overflow-x-auto">
        <div className="min-w-[720px] space-y-2">
          <div className="relative ml-44 h-4 text-[10px] text-muted-foreground" aria-hidden>
            {[8, 10, 12, 14, 16, 18, 20].map((h) => <span key={h} className="absolute -translate-x-1/2" style={{ left: `${((h - H0) / (H1 - H0)) * 100}%` }}>{h}:00</span>)}
          </div>
          {list.map((r) => {
            const bs = bookings.filter((b) => b.resourceId === r.id && b.date === date && ["approved", "active"].includes(b.status));
            const cs = contests.filter((c) => c.resourceId === r.id && c.date === date && c.status !== "decided" && c.requestIds.length > 0);
            const busy = (m: number) => bs.some((b) => toMin(b.start) <= m && m < toMin(endOf(b))) || cs.some((c) => toMin(c.start) <= m && m < toMin(c.end));
            return (
              <div key={r.id} className="flex items-center gap-3">
                <Link to="/resources/$id" params={{ id: r.id }} className="w-41 shrink-0 truncate text-sm font-medium hover:underline">{r.name}{r.maintenance && <span className="block text-[11px] text-destructive">Under maintenance</span>}</Link>
                <div className={cn("relative h-10 flex-1 rounded-lg bg-muted/50", r.maintenance && "opacity-50")}>
                  {!r.maintenance && Array.from({ length: H1 - H0 }, (_, i) => (H0 + i) * 60).filter((m) => !busy(m)).map((m) => (
                    <button key={m} aria-label={`Free at ${fromMin(m)}, ${r.name}`} onClick={() => setPick({ kind: "free", resourceId: r.id, start: fromMin(m) })} className="absolute inset-y-1 rounded-md border border-dashed border-transparent hover:border-primary/50 hover:bg-primary/5" style={{ left: `${pct(fromMin(m))}%`, width: `${100 / (H1 - H0)}%` }} />
                  ))}
                  {bs.map((b) => (
                    <button key={b.id} onClick={() => setPick({ kind: "booked", bookingId: b.id })} aria-label={`Booked ${b.start} to ${endOf(b)}`} className={cn("absolute inset-y-1 rounded-md", b.programId ? "bg-amber/60" : "bg-primary/80")} style={{ left: `${Math.max(0, pct(b.start))}%`, width: `${(b.duration * 60 / SPAN) * 100}%` }} />
                  ))}
                  {cs.map((c) => (
                    <button key={c.id} onClick={() => setPick({ kind: "contest", contestId: c.id })} aria-label={`Contested ${c.start} to ${c.end}, ${c.requestIds.length} requests`} className="bg-contested absolute inset-y-0.5 rounded-md border-2 border-amber/60" style={{ left: `${Math.max(0, pct(c.start))}%`, width: `${pct(c.end) - Math.max(0, pct(c.start))}%` }}>
                      <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-st-waitlisted px-1 text-[10px] font-bold text-primary-foreground">{c.requestIds.length}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Sheet open={!!pick} onOpenChange={(o) => !o && setPick(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{pr?.name}</SheetTitle>
            <SheetDescription>{format(addDays(TODAY, day), "EEEE, d MMM")}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4">
            {pick?.kind === "free" && pr && (<>
              <p className="text-sm">Free from <b>{pick.start}</b>. Max {pr.maxHours} h per booking.</p>
              <Button asChild className="w-full"><Link to="/book/$id" params={{ id: pr.id }}>Request this slot</Link></Button>
            </>)}
            {pb && (<>
              <p className="text-sm">{pb.start}–{endOf(pb)}</p>
              {pb.programId ? (
                <p className="text-sm">Reserved for program: <b>{programs.find((p) => p.id === pb.programId)?.title}</b></p>
              ) : staff || pb.userId === self.id ? (
                <p className="text-sm">Purpose: {pb.purpose}</p>
              ) : (
                <p className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" /> Booked. Details are private.</p>
              )}
            </>)}
            {pc && (<>
              <DemandBadge contest={pc} />
              <p className="text-sm">{pc.start}–{pc.end} · {pc.requestIds.length} people want this slot. It goes to the highest Fair-Share Score when the window closes.</p>
              <Button asChild className="w-full"><Link to="/contests/$id" params={{ id: pc.id }}>See demand</Link></Button>
            </>)}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

