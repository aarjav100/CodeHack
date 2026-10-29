import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, Panel, FairGauge } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { d } from "@/data/mock";
import { findConflicts, fairScore } from "@/lib/logic";
import { PURPOSES, endOf, toMin } from "@/lib/contest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Countdown } from "@/components/contest";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/book/$id")({
  head: () => ({ meta: [{ title: "Request a booking — CampusSphere" }, { name: "description", content: "Choose a date, time and purpose to request a space." }, { property: "og:title", content: "Request a booking — CampusSphere" }, { property: "og:description", content: "Request a campus space or equipment." }] }),
  component: Book,
});

function Book() {
  const { id } = Route.useParams();
  const r = useApp((s) => s.resources.find((x) => x.id === id))!;
  const bookings = useApp((s) => s.bookings);
  const create = useApp((s) => s.createBooking);
  const contests = useApp((s) => s.contests);
  const weights = useApp((s) => s.weights);
  const [cat, setCat] = useState(PURPOSES[0]);
  const me = useMe();
  const nav = useNavigate();
  const [files, setFiles] = useState<string[]>([]);
  const schema = z.object({
    date: z.string().min(1, "Pick a date").refine((v) => v >= d(0), "Date can't be in the past"),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Pick a start time"),
    duration: z.coerce.number().min(1, "At least 1 hour").max(r?.maxHours ?? 3, `Max ${r?.maxHours ?? 3} hours for this resource`),
    purpose: z.string().min(10, "Tell us a bit more (at least 10 characters)").max(300),
  });
  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { date: d(2), start: "15:00", duration: 2, purpose: "" } });
  if (!r) return null;
  const w = watch();
  const conflicts = w.date && w.start ? findConflicts({ id: "x", resourceId: r.id, date: w.date, start: w.start, duration: Number(w.duration) || 1 } as never, bookings) : [];
  const end = w.start ? endOf({ start: w.start, duration: Number(w.duration) || 1 }) : "00:00";
  const contest = w.date && w.start ? contests.find((c) => c.status === "open" && c.resourceId === r.id && c.date === w.date && toMin(w.start) < toMin(c.end) && toMin(c.start) < toMin(end)) : undefined;
  const predicted = fairScore(me.factors, weights);
  const onSubmit = (v: z.infer<typeof schema>) => {
    create({ ...v, resourceId: r.id, attachments: files, purposeCategory: cat });
    toast.success("Request sent!", { description: "We'll notify you when it's reviewed." });
    nav({ to: me.verified === "verified" ? "/bookings" : "/verify" });
  };
  return (
    <div>
      <Link to="/resources/$id" params={{ id }} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {r.name}</Link>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Request {r.name}</h1>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border bg-card p-5 shadow-soft" noValidate>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date" error={errors.date?.message} htmlFor="date"><Input id="date" type="date" min={d(0)} {...register("date")} aria-invalid={!!errors.date} /></Field>
            <Field label="Start time" error={errors.start?.message} htmlFor="start"><Input id="start" type="time" {...register("start")} /></Field>
            <Field label="Hours" error={errors.duration?.message} htmlFor="dur"><Input id="dur" type="number" min={1} max={r.maxHours} {...register("duration")} aria-invalid={!!errors.duration} /></Field>
          </div>
          {contest && (
            <div role="status" className="bg-contested flex gap-2 rounded-xl border border-amber/40 p-3 text-sm">
              <Flame className="h-5 w-5 shrink-0 text-amber" />
              <span><strong>{contest.requestIds.length} {contest.requestIds.length === 1 ? "person has" : "people have"} already requested this slot.</strong> Priority is decided by the Fair-Share Score, not by who clicked first. You may still apply. Window closes in <Countdown iso={contest.windowClosesAt} className="font-semibold" />.</span>
            </div>
          )}
          {!contest && conflicts.length > 0 && (
            <div role="status" className="flex gap-2 rounded-xl border border-st-pending/30 bg-st-pending/10 p-3 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 text-st-pending" />
              <span>This time overlaps {conflicts.length} other {conflicts.length > 1 ? "requests" : "request"}{conflicts.some((c) => c.programId) ? " including a community program" : ""}. You may be waitlisted — try another time for a better chance.</span>
            </div>
          )}
          <Field label="Purpose category" hint="Shown publicly as a chip — your description stays private.">
            <Select value={cat} onValueChange={setCat}><SelectTrigger aria-label="Purpose category"><SelectValue /></SelectTrigger><SelectContent>{PURPOSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          </Field>
          <Field label="Purpose" error={errors.purpose?.message} hint="e.g. 'Robotics club practice for inter-college meet'" htmlFor="purpose">
            <Textarea id="purpose" rows={4} {...register("purpose")} aria-invalid={!!errors.purpose} />
          </Field>
          <Field label="Attachments (optional)" hint="A club letter or supervisor note helps.">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground hover:border-primary/50">
              <Paperclip className="h-4 w-4" /> Add files
              <input type="file" multiple className="sr-only" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? []).map((f) => f.name)])} />
            </label>
            <div className="flex flex-wrap gap-2">
              {files.map((f) => <span key={f} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">{f}<button type="button" aria-label={`Remove ${f}`} onClick={() => setFiles(files.filter((x) => x !== f))}><X className="h-3 w-3" /></button></span>)}
            </div>
          </Field>
          <Button type="submit" variant="hero" size="lg" className="w-full">{me.verified === "verified" ? "Submit request" : "Continue to verification"}</Button>
        </form>
        <div className="space-y-4">
          <Panel title="Your Fair-Share Score">
            <div className="flex justify-center"><FairGauge factors={me.factors} /></div>
            <p className="mt-1 text-center text-sm font-medium">Predicted score: {predicted}</p>
            {me.factors.lowUsage < 50 ? <p className="mt-1 text-center text-xs text-muted-foreground">Tip: you've used shared resources a lot lately — off-peak slots have less competition.</p> : me.factors.skill < 50 ? <p className="mt-1 text-center text-xs text-muted-foreground">Tip: a free workshop badge raises your skill points.</p> : null}
            <p className="mt-2 text-center text-sm text-muted-foreground">Used only when several people want the same slot. <Link to="/fair-share" className="text-primary underline">How it works</Link></p>
          </Panel>
          <Panel title="Before you submit">
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">{r.rules.map((x) => <li key={x}>{x}</li>)}</ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
