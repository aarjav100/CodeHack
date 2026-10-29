import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { Building2, Gauge, Inbox, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { EmptyState, Img, PageHeader, Panel, StatCard } from "@/components/shared";
import { useApp } from "@/store/app";
import { TODAY } from "@/data/mock";

export const Route = createFileRoute("/owner")({
  head: () => ({ meta: [{ title: "Owner dashboard — CampusSphere" }, { name: "description", content: "Utilization, pending requests and condition reports for your spaces." }, { property: "og:title", content: "Owner dashboard — CampusSphere" }, { property: "og:description", content: "Run your shared spaces." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Owner,
});

function Owner() {
  const { resources, bookings, role, me, updateResource, seedApprovals } = useApp();
  const self = me();
  if (!["owner", "manager", "admin"].includes(role)) return <EmptyState icon={Building2} title="For space owners" body="Switch to the Owner role from the top bar." />;
  const mine = role === "owner" ? resources.filter((r) => r.ownerId === self.id) : resources;
  const ids = mine.map((r) => r.id);
  const week = Array.from({ length: 7 }, (_, i) => format(addDays(TODAY, i), "yyyy-MM-dd"));
  const pending = bookings.filter((b) => b.status === "pending" && ids.includes(b.resourceId)).length;
  const util = (rid: string) => Math.min(100, Math.round((bookings.filter((b) => b.resourceId === rid && week.includes(b.date) && ["approved", "active", "completed"].includes(b.status)).reduce((a, b) => a + b.duration, 0) / (12 * 7)) * 100));
  const avg = mine.length ? Math.round(mine.reduce((a, r) => a + util(r.id), 0) / mine.length) : 0;

  return (
    <div>
      <PageHeader title="Owner dashboard" subtitle="How your spaces are doing this week." actions={<Button variant="outline" onClick={() => toast.success(`${seedApprovals()} test requests added to Approvals`)}><Sparkles /> Load test requests</Button>} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Spaces" value={mine.length} icon={Building2} />
        <StatCard label="Pending requests" value={pending} icon={Inbox} tone="text-st-waitlisted bg-st-waitlisted/10" />
        <StatCard label="Avg. utilization" value={avg} suffix="%" icon={Gauge} tone="text-teal bg-teal/10" />
      </div>
      <div>
        <div className="space-y-3">
          {mine.map((r) => {
            const last = bookings.find((b) => b.resourceId === r.id && b.ret);
            const issues = last?.ret?.items.filter((i) => !i.ok) ?? [];
            return (
              <Panel key={r.id} className="flex flex-col gap-3 sm:flex-row">
                <Img src={r.image} alt={r.name} className="h-24 w-full rounded-lg object-cover sm:w-32" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.location}</p></div>
                    <label className="flex items-center gap-2 text-xs"><Wrench className="h-3.5 w-3.5" /> Maintenance
                      <Switch checked={!!r.maintenance} onCheckedChange={(v) => { updateResource(r.id, { maintenance: v }); toast(v ? `${r.name} paused for maintenance` : `${r.name} is open again`); }} aria-label={`Maintenance mode for ${r.name}`} />
                    </label>
                  </div>
                  <div><div className="mb-1 flex justify-between text-xs"><span>Utilization this week</span><span>{util(r.id)}%</span></div><Progress value={util(r.id)} /></div>
                  <p className="text-xs text-muted-foreground">Last return: {last ? (issues.length ? `${issues.length} issue(s) — ${issues.map((i) => i.item).join(", ")}` : "all items OK") : "no returns yet"}</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline"><Link to="/resources/new" search={{ edit: r.id }}>Edit</Link></Button>
                    <Button asChild size="sm" variant="outline"><Link to="/calendar">Calendar</Link></Button>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </div>
  );
}
