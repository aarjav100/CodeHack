import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Users, MapPin, SearchX, CheckCircle2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, Img, ListSkeleton, PageHeader, useFakeLoad } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { eligibility } from "@/lib/logic";
import { DemandBadge } from "@/components/contest";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover spaces & equipment — CampusSphere" }, { name: "description", content: "Search labs, halls, classrooms and equipment you can request." }, { property: "og:title", content: "Discover spaces — CampusSphere" }, { property: "og:description", content: "Search labs, halls and equipment." }] }),
  component: Discover,
});

function Discover() {
  const resources = useApp((s) => s.resources);
  const contests = useApp((s) => s.contests);
  const me = useMe();
  const loading = useFakeLoad();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [minCap, setMinCap] = useState("0");
  const list = useMemo(
    () => resources.filter((r) =>
      (type === "all" || r.type === type) &&
      r.capacity >= Number(minCap) &&
      (!q || `${r.name} ${r.dept} ${r.description}`.toLowerCase().includes(q.toLowerCase())) &&
      (!onlyEligible || eligibility(r, me).eligible)),
    [resources, q, type, onlyEligible, minCap, me],
  );
  return (
    <div>
      <PageHeader title="Discover spaces & equipment" subtitle="Find a lab, hall or tool. Each listing shows exactly what you need to use it." />
      <div className="mb-6 grid gap-3 rounded-2xl border bg-card p-3 shadow-soft sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search labs, halls, cameras…" className="pl-9" />
        </label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="sm:w-40" aria-label="Type"><SelectValue /></SelectTrigger>
          <SelectContent>{["all", "lab", "hall", "classroom", "equipment"].map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All types" : t[0].toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={minCap} onValueChange={setMinCap}>
          <SelectTrigger className="sm:w-40" aria-label="Capacity"><SelectValue /></SelectTrigger>
          <SelectContent>{["0", "10", "30", "100"].map((t) => <SelectItem key={t} value={t}>{t === "0" ? "Any capacity" : `${t}+ people`}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant={onlyEligible ? "default" : "outline"} onClick={() => setOnlyEligible(!onlyEligible)} aria-pressed={onlyEligible}>
          <CheckCircle2 /> I'm eligible
        </Button>
      </div>
      {loading ? <ListSkeleton rows={4} /> : list.length === 0 ? (
        <EmptyState icon={SearchX} title="No matches" body="Try a different search or remove a filter." action={<Button variant="outline" onClick={() => { setQ(""); setType("all"); setOnlyEligible(false); setMinCap("0"); }}>Clear filters</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => {
            const el = eligibility(r, me);
            const unmet = el.items.filter((i) => !i.met).length;
            return (
              <Link key={r.id} to="/resources/$id" params={{ id: r.id }} className="lift group overflow-hidden rounded-2xl border bg-card shadow-soft">
                <div className="relative">
                  <Img src={r.image} alt={r.name} className="aspect-[16/10] w-full" />
                  <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-semibold capitalize">{r.type}</span>
                </div>
                <div className="p-4">
                  <div className="font-semibold">{r.name}</div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{r.location.split(",")[0]}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{r.capacity}</span>
                  </div>
                  <div className="mt-2">{(() => { const live = contests.filter((c) => c.resourceId === r.id && c.status !== "decided" && c.requestIds.length > 0); return live.length ? <DemandBadge contest={live.sort((a, b) => b.requestIds.length - a.requestIds.length)[0]} /> : <DemandBadge />; })()}</div>
                  <div className="mt-3 text-xs">
                    {unmet === 0 ? <span className="inline-flex items-center gap-1 font-medium text-st-approved"><CheckCircle2 className="h-3.5 w-3.5" /> You meet all requirements</span>
                      : <span className="inline-flex items-center gap-1 font-medium text-st-pending"><Lock className="h-3.5 w-3.5" /> {unmet} requirement{unmet > 1 ? "s" : ""} to unlock</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
