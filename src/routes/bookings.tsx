import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarX, History, LogIn, LogOut, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EmptyState, Img, ListSkeleton, PageHeader, StatusBadge, Timeline, fmtD, useFakeLoad } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { explain } from "@/lib/logic";
import type { Booking } from "@/data/types";
import { d } from "@/data/mock";
import { Countdown, DemandBadge } from "@/components/contest";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "My bookings — CampusSphere" }, { name: "description", content: "Track your requests, check in, return and see the full history." }, { property: "og:title", content: "My bookings — CampusSphere" }, { property: "og:description", content: "Track your space and equipment requests." }] }),
  component: Bookings,
});

const TABS: Record<string, Booking["status"][]> = {
  upcoming: ["pending", "approved", "waitlisted", "active"],
  past: ["completed", "rejected", "cancelled"],
};

function Bookings() {
  const me = useMe();
  const allBookings = useApp((s) => s.bookings);
  const all = allBookings.filter((b) => b.userId === me.id);
  const resources = useApp((s) => s.resources);
  const cancel = useApp((s) => s.cancelBooking);
  const { withdraw, acceptOffer, declineOffer, contests } = useApp();
  const [tab, setTab] = useState("upcoming");
  const [open, setOpen] = useState<Booking | null>(null);
  const loading = useFakeLoad();
  const list = all.filter((b) => TABS[tab].includes(b.status));
  const live = open ? all.find((b) => b.id === open.id) ?? open : null;
  return (
    <div>
      <PageHeader title="My bookings" subtitle="Every request, its status and the reason behind each decision." actions={<Button asChild variant="hero"><Link to="/discover">New request</Link></Button>} />
      {all.filter((b) => b.offerExpires && b.status === "waitlisted").map((b) => (
        <div key={b.id} role="alert" className="bg-contested mb-4 flex flex-col gap-3 rounded-2xl border border-st-waitlisted/40 p-4 sm:flex-row sm:items-center">
          <div className="flex-1"><div className="font-semibold">A slot freed up: {resources.find((r) => r.id === b.resourceId)?.name}</div><div className="text-sm">You're first on the waiting list. Accept within <Countdown iso={b.offerExpires!} className="font-bold" /> or it goes to the next person.</div></div>
          <div className="flex gap-2"><Button variant="success" onClick={() => acceptOffer(b.id)}>Accept</Button><Button variant="outline" onClick={() => declineOffer(b.id)}>Decline</Button></div>
        </div>
      ))}
      <Tabs value={tab} onValueChange={setTab} className="mb-4"><TabsList><TabsTrigger value="upcoming">Upcoming</TabsTrigger><TabsTrigger value="past">Past</TabsTrigger></TabsList></Tabs>
      {loading ? <ListSkeleton /> : list.length === 0 ? (
        <EmptyState icon={CalendarX} title={tab === "upcoming" ? "No upcoming bookings" : "Nothing here yet"} body="Find a lab, hall or piece of equipment to request." action={<Button asChild><Link to="/discover">Discover spaces</Link></Button>} />
      ) : (
        <ul className="space-y-3">
          {list.map((b) => {
            const r = resources.find((x) => x.id === b.resourceId)!;
            return (
              <li key={b.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:flex-row sm:items-center">
                <Img src={r.image} alt="" className="h-20 w-full rounded-xl sm:w-28" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{r.name}</span><StatusBadge status={b.status} />{b.status === "pending" && b.contestId && <DemandBadge contest={contests.find((c) => c.id === b.contestId)} />}{b.waitPos && b.status === "waitlisted" && <span className="text-xs font-medium text-st-waitlisted">#{b.waitPos} in line</span>}</div>
                  <div className="text-sm text-muted-foreground">{fmtD(b.date)} · {b.start} · {b.duration}h · {b.purpose}</div>
                  <p className="mt-1 flex gap-1.5 text-sm"><Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />{explain(b.status, b.reason)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.status === "approved" && b.date <= d(30) && <Button asChild size="sm" variant="teal"><Link to="/checkin/$id" params={{ id: b.id }}><LogIn /> Check in</Link></Button>}
                  {b.status === "active" && <Button asChild size="sm" variant="teal"><Link to="/return/$id" params={{ id: b.id }}><LogOut /> Return</Link></Button>}
                  <Button size="sm" variant="ghost" onClick={() => setOpen(b)}><History /> Timeline</Button>
                  {b.contestId && contests.find((c) => c.id === b.contestId) && <Button asChild size="sm" variant="outline"><Link to="/contests/$id" params={{ id: b.contestId }}>Contest</Link></Button>}
                  {["pending", "waitlisted", "approved"].includes(b.status) && <Button size="sm" variant="ghost" onClick={() => (b.status === "pending" && b.contestId ? withdraw(b.id) : cancel(b.id))}>{b.status === "pending" && b.contestId ? "Withdraw" : "Cancel"}</Button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Sheet open={!!live} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Booking history</SheetTitle><SheetDescription>Append-only record shared with the space owner.</SheetDescription></SheetHeader>
          {live && <div className="px-4"><Timeline events={live.timeline} /></div>}
        </SheetContent>
      </Sheet>
    </div>
  );
}
