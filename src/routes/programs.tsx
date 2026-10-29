import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarSearch, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATS, EmptyState, ListSkeleton, PageHeader, fmtD, useFakeLoad } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import type { Category } from "@/data/types";
import { d } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [{ title: "Community programs — CampusSphare" }, { name: "description", content: "Free study center, career talks, skill workshops, health camps and scheme help." }, { property: "og:title", content: "Programs hub — CampusSphare" }, { property: "og:description", content: "Free community programs on campus." }] }),
  component: Programs,
});

function Programs() {
  const programs = useApp((s) => s.programs);
  const resources = useApp((s) => s.resources);
  const register = useApp((s) => s.register);
  const me = useMe();
  const loading = useFakeLoad();
  const [cat, setCat] = useState<string>("all");
  const [when, setWhen] = useState("upcoming");
  const [lang, setLang] = useState("all");
  const [mode, setMode] = useState("all");
  const [seats, setSeats] = useState(false);
  const list = programs
    .filter((p) => (cat === "all" || p.category === cat) && (lang === "all" || p.language === lang) && (mode === "all" || p.mode === mode) && (!seats || p.registered.length < p.seats) && (when === "all" || (when === "upcoming" ? p.date >= d(0) : p.date < d(0))))
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      <PageHeader title="Community programs" subtitle="All free. All hosted in our own halls and labs." />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(Object.keys(CATS) as Category[]).map((k) => {
          const c = CATS[k];
          return (
            <button key={k} onClick={() => setCat(cat === k ? "all" : k)} aria-pressed={cat === k} className={cn("lift rounded-2xl border p-4 text-left", c.bg, c.ring, cat === k && "ring-2 ring-primary")}>
              <c.icon className={cn("h-6 w-6", c.text)} />
              <div className="mt-2 text-sm font-semibold">{c.label}</div>
            </button>
          );
        })}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={when} onValueChange={setWhen}><SelectTrigger className="w-36" aria-label="Date"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upcoming">Upcoming</SelectItem><SelectItem value="past">Past</SelectItem><SelectItem value="all">All dates</SelectItem></SelectContent></Select>
        <Select value={lang} onValueChange={setLang}><SelectTrigger className="w-36" aria-label="Language"><SelectValue /></SelectTrigger><SelectContent>{["all", "English", "Hindi", "Bilingual"].map((x) => <SelectItem key={x} value={x}>{x === "all" ? "Any language" : x}</SelectItem>)}</SelectContent></Select>
        <Select value={mode} onValueChange={setMode}><SelectTrigger className="w-36" aria-label="Mode"><SelectValue /></SelectTrigger><SelectContent>{["all", "offline", "online"].map((x) => <SelectItem key={x} value={x}>{x === "all" ? "Online & offline" : x}</SelectItem>)}</SelectContent></Select>
        <Button variant={seats ? "default" : "outline"} aria-pressed={seats} onClick={() => setSeats(!seats)}>Seats left</Button>
      </div>
      {loading ? <ListSkeleton /> : list.length === 0 ? <EmptyState icon={CalendarSearch} title="No programs match" /> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((p) => {
            const c = CATS[p.category];
            const left = p.seats - p.registered.length;
            const mine = p.registered.includes(me.id) || p.waitlist.includes(me.id);
            const recurring = p.category === "study" || p.category === "scheme";
            return (
              <li key={p.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-soft">
                <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", c.bg, c.text)}><c.icon className="h-3.5 w-3.5" />{c.label}</span>
                <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{recurring ? "Daily" : fmtD(p.date)} · {p.start}</span>
                  <span className="inline-flex items-center gap-1">{p.mode === "online" ? <Globe className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}{p.mode === "online" ? "Online" : resources.find((r) => r.id === p.resourceId)?.name}</span>
                  <span>{p.language}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {!recurring && <span className={cn("text-sm font-medium", left > 0 ? "text-st-approved" : "text-st-waitlisted")}>{left > 0 ? `${left} seats left` : `Full · ${p.waitlist.length} waiting`}</span>}
                  {recurring ? <Button asChild variant="outline" className="ml-auto"><Link to={c.to as "/"}>Open</Link></Button> : (
                    <Button className="ml-auto" variant={mine ? "outline" : "default"} disabled={mine || p.date < d(0)} onClick={() => { const r = register(p.id); toast.success(r === "waitlisted" ? "Added to waiting list" : "You're registered!"); }}>
                      {mine ? "Registered" : left > 0 ? "Register" : "Join waitlist"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

