import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmptyState, Img, ListSkeleton, PageHeader, fmtD, useFakeLoad } from "@/components/shared";
import { DemandBadge } from "@/components/contest";
import { useApp } from "@/store/app";
import { displayName } from "@/lib/contest";

export const Route = createFileRoute("/demand")({
  head: () => ({ meta: [{ title: "Live demand — CampusSphere" }, { name: "description", content: "Every contested slot across the college, sorted by when the decision is made." }, { property: "og:title", content: "Live demand — CampusSphere" }, { property: "og:description", content: "See which slots are in demand." }] }),
  component: Demand,
});

function Demand() {
  const { contests, resources, bookings, users, role, seedDemoContest } = useApp();
  const loading = useFakeLoad();
  const [type, setType] = useState("all");
  const [bld, setBld] = useState("all");
  const [date, setDate] = useState("");
  const [show, setShow] = useState("active");
  const buildings = [...new Set(resources.map((r) => r.location.split(",")[0]))];
  const list = contests
    .filter((c) => (show === "all" || (show === "active" ? c.status !== "decided" : c.status === "decided")) && c.requestIds.length > 0)
    .filter((c) => { const r = resources.find((x) => x.id === c.resourceId)!; return (type === "all" || r.type === type) && (bld === "all" || r.location.startsWith(bld)) && (!date || c.date === date); })
    .sort((a, b) => a.windowClosesAt.localeCompare(b.windowClosesAt));
  return (
    <div>
      <PageHeader title="Live demand" subtitle="Slots more than one person wants. Decided by Fair-Share Score when the window closes — not by who clicked first." actions={<Button variant="outline" onClick={() => seedDemoContest()}><Plus /> Create a 2-person contest</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={show} onValueChange={setShow}><SelectTrigger className="w-36" aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Open & reviewing</SelectItem><SelectItem value="decided">Decided</SelectItem><SelectItem value="all">All</SelectItem></SelectContent></Select>
        <Select value={type} onValueChange={setType}><SelectTrigger className="w-36" aria-label="Type"><SelectValue /></SelectTrigger><SelectContent>{["all", "lab", "hall", "classroom", "equipment"].map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All types" : t}</SelectItem>)}</SelectContent></Select>
        <Select value={bld} onValueChange={setBld}><SelectTrigger className="w-48" aria-label="Building"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All buildings</SelectItem>{buildings.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" aria-label="Date" />
      </div>
      {loading ? <ListSkeleton /> : list.length === 0 ? <EmptyState icon={Flame} title="No contested slots" body="When two people want the same time, it shows up here." /> : (
        <ul className="space-y-3">
          {list.map((c) => {
            const r = resources.find((x) => x.id === c.resourceId)!;
            const reqs = c.requestIds.map((id) => bookings.find((b) => b.id === id)!).filter(Boolean);
            return (
              <li key={c.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:flex-row sm:items-center">
                <Img src={r.image} alt="" className="h-20 w-full rounded-xl sm:w-28" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{fmtD(c.date)} · {c.start}–{c.end}</div>
                  <div className="mt-1.5"><DemandBadge contest={c} /></div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {reqs.map((b) => <span key={b.id} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{displayName(users.find((u) => u.id === b.userId), r.anonymous)} · {b.purposeCategory ?? "Other"}</span>)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {c.status === "open" && role === "user" && <Button asChild size="sm" variant="outline"><Link to="/book/$id" params={{ id: r.id }}>Request this slot too</Link></Button>}
                  <Button asChild size="sm"><Link to="/contests/$id" params={{ id: c.id }}>{["owner", "manager", "admin"].includes(role) && c.status === "closed" ? "Review" : "Details"}</Link></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
