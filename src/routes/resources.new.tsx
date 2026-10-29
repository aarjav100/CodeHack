import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, PageHeader, Panel, PhotoDrop } from "@/components/shared";
import { useApp } from "@/store/app";
import type { Requirement, Resource } from "@/data/types";

export const Route = createFileRoute("/resources/new")({
  validateSearch: z.object({ edit: z.string().optional() }),
  head: () => ({ meta: [{ title: "List a resource — CampusSphere" }, { name: "description", content: "Add a lab, hall, classroom or equipment with rules and requirements." }, { property: "og:title", content: "List a resource — CampusSphere" }, { property: "og:description", content: "Share an underused space." }] }),
  component: NewResource,
});

const REQS: Requirement[] = [
  { id: "r-ver", label: "Identity verified", kind: "verified" },
  { id: "r-stu", label: "Enrolled college student", kind: "student" },
  { id: "r-safe", label: "Lab Safety badge", kind: "skill", skill: "Lab Safety" },
  { id: "r-cb", label: "Computer Basics badge", kind: "skill", skill: "Computer Basics" },
  { id: "r-cam", label: "Camera Handling badge", kind: "skill", skill: "Camera Handling" },
];

function NewResource() {
  const { edit } = Route.useSearch();
  const existing = useApp((s) => s.resources.find((r) => r.id === edit));
  const { addResource, updateResource } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({
    name: existing?.name ?? "", type: existing?.type ?? "lab", dept: existing?.dept ?? "", location: existing?.location ?? "",
    capacity: String(existing?.capacity ?? 20), description: existing?.description ?? "", rules: existing?.rules.join("\n") ?? "",
    availability: existing?.availability ?? "Mon–Fri, 10 AM – 5 PM", maxHours: String(existing?.maxHours ?? 3), checklist: existing?.checklist.join("\n") ?? "",
  });
  const [reqs, setReqs] = useState<string[]>(existing?.requirements.map((r) => r.id) ?? ["r-ver"]);
  const [windowHours, setWindowHours] = useState(String(existing?.windowHours ?? 24));
  const [anonymous, setAnonymous] = useState(!!existing?.anonymous);
  const [firstCome, setFirstCome] = useState(existing?.firstComeIfAlone ?? true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [err, setErr] = useState<Record<string, string>>({});
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = "Name needs at least 3 characters";
    if (!f.location.trim()) e.location = "Where is it?";
    if (!(Number(f.capacity) > 0)) e.capacity = "Capacity must be at least 1";
    if (f.description.trim().length < 20) e.description = "Describe it in at least 20 characters";
    setErr(e);
    if (Object.keys(e).length) return;
    const data: Omit<Resource, "id" | "ownerId"> = {
      name: f.name, type: f.type as Resource["type"], dept: f.dept || "General", location: f.location, capacity: Number(f.capacity),
      image: photos[0] ?? existing?.image ?? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70",
      description: f.description, rules: f.rules.split("\n").filter(Boolean), availability: f.availability, maxHours: Number(f.maxHours) || 3,
      checklist: f.checklist.split("\n").filter(Boolean).length ? f.checklist.split("\n").filter(Boolean) : ["Space clean", "Equipment working"],
      requirements: REQS.filter((r) => reqs.includes(r.id)),
      windowHours: Number(windowHours), anonymous, firstComeIfAlone: firstCome,
    };
    if (existing) { updateResource(existing.id, data); toast.success("Changes saved"); nav({ to: "/resources/$id", params: { id: existing.id } }); }
    else { const id = addResource(data); toast.success("Resource listed!"); nav({ to: "/resources/$id", params: { id } }); }
  };
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={existing ? `Edit ${existing.name}` : "List a resource"} subtitle="Clear rules and requirements mean fewer back-and-forth questions." />
      <div className="space-y-5">
        <Panel title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={err.name} htmlFor="n"><Input id="n" value={f.name} onChange={up("name")} /></Field>
            <Field label="Type"><Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as Resource["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["lab", "hall", "classroom", "equipment"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Department" htmlFor="dp"><Input id="dp" value={f.dept} onChange={up("dept")} /></Field>
            <Field label="Location" error={err.location} htmlFor="lc"><Input id="lc" value={f.location} onChange={up("location")} /></Field>
            <Field label="Capacity" error={err.capacity} htmlFor="cp"><Input id="cp" type="number" value={f.capacity} onChange={up("capacity")} /></Field>
            <Field label="Max hours per booking" htmlFor="mh"><Input id="mh" type="number" value={f.maxHours} onChange={up("maxHours")} /></Field>
          </div>
          <div className="mt-4"><Field label="Description" error={err.description} htmlFor="ds"><Textarea id="ds" rows={3} value={f.description} onChange={up("description")} /></Field></div>
        </Panel>
        <Panel title="Availability & rules">
          <div className="space-y-4">
            <Field label="Availability" htmlFor="av"><Input id="av" value={f.availability} onChange={up("availability")} /></Field>
            <Field label="Rules (one per line)" htmlFor="ru"><Textarea id="ru" rows={3} value={f.rules} onChange={up("rules")} /></Field>
            <Field label="Condition checklist (one per line)" hint="Used at check-in and return" htmlFor="ck"><Textarea id="ck" rows={3} value={f.checklist} onChange={up("checklist")} /></Field>
          </div>
        </Panel>
        <Panel title="Requirements">
          <div className="grid gap-2 sm:grid-cols-2">
            {REQS.map((r) => (
              <label key={r.id} className="flex items-center gap-2 rounded-xl border p-3 text-sm">
                <Checkbox checked={reqs.includes(r.id)} onCheckedChange={(c) => setReqs(c ? [...reqs, r.id] : reqs.filter((x) => x !== r.id))} />{r.label}
              </label>
            ))}
          </div>
        </Panel>
        <Panel title="Competing requests settings">
          <div className="space-y-4">
            <Field label="Request window length" hint="How long requests are collected before the Fair-Share ranking runs.">
              <Select value={windowHours} onValueChange={setWindowHours}><SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger><SelectContent>{["6", "12", "24", "48"].map((h) => <SelectItem key={h} value={h}>{h} hours</SelectItem>)}</SelectContent></Select>
            </Field>
            <label className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm"><span><span className="font-medium">Anonymous applicants</span><span className="block text-xs text-muted-foreground">Publicly show "Anonymous applicant" instead of first name + department.</span></span><Switch checked={anonymous} onCheckedChange={setAnonymous} /></label>
            <label className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm"><span><span className="font-medium">Allow first-come approval when there's no competition</span><span className="block text-xs text-muted-foreground">If only one request exists at window close, it goes to the manager as a normal request.</span></span><Switch checked={firstCome} onCheckedChange={setFirstCome} /></label>
          </div>
        </Panel>
        <Panel title="Photos"><PhotoDrop value={photos} onChange={setPhotos} /></Panel>
        <Button variant="hero" size="lg" className="w-full" onClick={save}>{existing ? "Save changes" : "Publish listing"}</Button>
      </div>
    </div>
  );
}
