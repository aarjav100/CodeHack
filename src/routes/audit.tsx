import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ListSkeleton, PageHeader, fmtDT, useFakeLoad } from "@/components/shared";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit log — CampusSphere" }, { name: "description", content: "Append-only record of every decision. No health data is ever logged." }, { property: "og:title", content: "Audit log — CampusSphere" }, { property: "og:description", content: "Append-only decision history." }] }),
  component: Audit,
});

const CATS = ["all", "contest", "booking", "program", "user", "incident", "resource", "health", "helpdesk", "volunteer", "invite"];

function Audit() {
  const { audit, users } = useApp();
  const loading = useFakeLoad();
  const [cat, setCat] = useState("all");
  const [role, setRole] = useState("all");
  const [actor, setActor] = useState("all");
  const [date, setDate] = useState("");
  const list = [...audit]
    .filter((a) => (cat === "all" || a.action.startsWith(cat)) && (role === "all" || a.role === role) && (actor === "all" || a.actorId === actor) && (!date || a.at.slice(0, 10) === date))
    .sort((a, b) => b.at.localeCompare(a.at));
  const name = (id: string) => (id === "system" ? "System" : users.find((u) => u.id === id)?.name ?? id);
  return (
    <div>
      <PageHeader title="Audit log" subtitle="Append-only. Entries can't be edited or deleted. Health details are never recorded." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={cat} onValueChange={setCat}><SelectTrigger className="w-40" aria-label="Action"><SelectValue /></SelectTrigger><SelectContent>{CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c === "all" ? "All actions" : c}</SelectItem>)}</SelectContent></Select>
        <Select value={role} onValueChange={setRole}><SelectTrigger className="w-36" aria-label="Role"><SelectValue /></SelectTrigger><SelectContent>{["all", "system", "user", "owner", "manager", "volunteer", "partner", "admin"].map((c) => <SelectItem key={c} value={c} className="capitalize">{c === "all" ? "All roles" : c}</SelectItem>)}</SelectContent></Select>
        <Select value={actor} onValueChange={setActor}><SelectTrigger className="w-44" aria-label="Actor"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All actors</SelectItem><SelectItem value="system">System</SelectItem>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" aria-label="Date" />
      </div>
      {loading ? <ListSkeleton /> : list.length === 0 ? <EmptyState icon={ScrollText} title="No entries match" /> : (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground"><th className="p-3">When</th><th>Actor</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap p-3 text-muted-foreground" suppressHydrationWarning>{fmtDT(a.at)}</td>
                  <td className="whitespace-nowrap">{name(a.actorId)} <span className="text-xs capitalize text-muted-foreground">({a.role})</span></td>
                  <td><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{a.action}</code></td>
                  <td>{a.target}</td>
                  <td className="text-muted-foreground">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
