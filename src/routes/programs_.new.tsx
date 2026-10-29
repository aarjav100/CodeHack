import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATS, Field, PageHeader, Panel } from "@/components/shared";
import { useApp } from "@/store/app";
import { d } from "@/data/mock";
import { overlaps } from "@/lib/logic";
import type { Category, Program } from "@/data/types";

export const Route = createFileRoute("/programs_/new")({
  head: () => ({ meta: [{ title: "Create a program — CampusSphare" }, { name: "description", content: "Plan a community program and reserve its space automatically." }, { property: "og:title", content: "Create a program — CampusSphare" }, { property: "og:description", content: "Plan a program and reserve a space." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: NewProgram,
});

function NewProgram() {
  const { resources, bookings, createProgram } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ title: "", description: "", category: "career" as Category, date: d(5), start: "10:00", duration: 2, resourceId: resources[0]?.id ?? "", seats: 40, language: "Bilingual" as Program["language"], mode: "offline" as Program["mode"] });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const res = resources.find((r) => r.id === f.resourceId);
  const clash = bookings.filter((b) => ["approved", "active", "pending"].includes(b.status) && overlaps({ ...f }, b));

  const submit = () => {
    const e: Record<string, string> = {};
    if (f.title.trim().length < 4) e.title = "Give the program a title";
    if (f.description.trim().length < 10) e.description = "Add a short description";
    if (res && f.seats > res.capacity) e.seats = `${res.name} holds ${res.capacity}`;
    if (clash.some((b) => b.status !== "pending")) e.resourceId = "That space is already booked then";
    if (res?.maintenance) e.resourceId = "That space is under maintenance";
    setErr(e);
    if (Object.keys(e).length) return;
    createProgram({ ...f });
    toast.success(`Program created and ${res?.name} reserved`);
    nav({ to: "/programs" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Create a program" subtitle="We'll reserve the space for you as soon as you save." />
      <Panel className="space-y-4">
        <Field label="Title" error={err.title} htmlFor="t"><Input id="t" value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Description" error={err.description} htmlFor="ds"><Textarea id="ds" value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category"><Select value={f.category} onValueChange={(v) => set("category", v as Category)}><SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(CATS) as Category[]).map((c) => <SelectItem key={c} value={c}>{CATS[c].label}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Seats" error={err.seats} htmlFor="s"><Input id="s" type="number" min={1} value={f.seats} onChange={(e) => set("seats", Number(e.target.value))} /></Field>
          <Field label="Date" htmlFor="dt"><Input id="dt" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Start" htmlFor="st"><Input id="st" type="time" step={1800} value={f.start} onChange={(e) => set("start", e.target.value)} /></Field>
            <Field label="Hours" htmlFor="h"><Input id="h" type="number" min={1} max={8} value={f.duration} onChange={(e) => set("duration", Number(e.target.value))} /></Field>
          </div>
          <Field label="Language"><Select value={f.language} onValueChange={(v) => set("language", v as Program["language"])}><SelectTrigger aria-label="Language"><SelectValue /></SelectTrigger><SelectContent>{["English", "Hindi", "Bilingual"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Mode"><Select value={f.mode} onValueChange={(v) => set("mode", v as Program["mode"])}><SelectTrigger aria-label="Mode"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="offline">In person</SelectItem><SelectItem value="online">Online</SelectItem></SelectContent></Select></Field>
        </div>
        <Field label="Space" error={err.resourceId}><Select value={f.resourceId} onValueChange={(v) => set("resourceId", v)}><SelectTrigger aria-label="Space"><SelectValue /></SelectTrigger><SelectContent>{resources.filter((r) => r.type !== "equipment").map((r) => <SelectItem key={r.id} value={r.id}>{r.name} · {r.capacity} seats</SelectItem>)}</SelectContent></Select></Field>
        {clash.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl bg-st-approved/10 p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-st-approved" /> {res?.name} is free at that time.</p>
        ) : (
          <p className="flex items-center gap-2 rounded-xl bg-amber/15 p-3 text-sm"><AlertTriangle className="h-4 w-4" /> {clash.length} booking(s) overlap this time{clash.every((b) => b.status === "pending") ? " (pending only — the program will take priority)" : ""}.</p>
        )}
        <Button className="w-full" onClick={submit}>Create program & reserve space</Button>
      </Panel>
    </div>
  );
}

