import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, XCircle, MapPin, Users, Clock, ArrowLeft, Pencil, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Img, Panel, StatusBadge, fmtD } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { eligibility } from "@/lib/logic";
import { resources as seed } from "@/data/mock";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { DemandBadge, ContestLink } from "@/components/contest";

export const Route = createFileRoute("/resources/$id")({
  loader: ({ params }) => {
    const r = seed.find((x) => x.id === params.id);
    return { name: r?.name ?? "Resource" };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.name ?? "Resource"} — CampusSphere` }, { name: "description", content: `Rules, availability and eligibility for ${loaderData?.name ?? "this resource"}.` }, { property: "og:title", content: `${loaderData?.name ?? "Resource"} — CampusSphere` }, { property: "og:description", content: "Check eligibility and request a booking." }] }),
  component: Detail,
});

const FIX: Record<string, { to: string; label: string }> = {
  verified: { to: "/verify", label: "Verify now" },
  skill: { to: "/workshops", label: "Find a workshop" },
  student: { to: "/profile", label: "See profile" },
};

function Detail() {
  const { id } = Route.useParams();
  const r = useApp((s) => s.resources.find((x) => x.id === id));
  const allBookings = useApp((s) => s.bookings);
  const bookings = allBookings.filter((b) => b.resourceId === id && ["approved", "active", "pending"].includes(b.status));
  const programs = useApp((s) => s.programs);
  const owner = useApp((s) => s.users.find((u) => u.id === r?.ownerId));
  const role = useApp((s) => s.role);
  const allContests = useApp((s) => s.contests);
  const live = allContests.filter((c) => c.resourceId === id && c.status !== "decided" && c.requestIds.length > 0);
  const me = useMe();
  if (!r) throw notFound();
  const el = eligibility(r, me);
  return (
    <div>
      <Link to="/discover" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Discover</Link>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Img src={r.image} alt={r.name} className="aspect-[16/9] w-full rounded-2xl" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{r.dept} · {r.type}</span>
            <h1 className="mt-1 text-3xl font-bold">{r.name}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{r.location}</span>
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />Up to {r.capacity}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{r.availability}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">{live.length ? live.map((c) => <span key={c.id} className="inline-flex flex-wrap items-center gap-2"><DemandBadge contest={c} /><span className="text-xs text-muted-foreground">{c.date} {c.start}–{c.end}</span><ContestLink c={c} /></span>) : <DemandBadge />}</div>
            <p className="mt-4">{r.description}</p>
          </div>
          <Panel title="Availability — next 7 days"><AvailabilityCalendar resourceId={r.id} /></Panel>
          <Panel title="House rules">
            <ul className="list-inside list-disc space-y-1 text-sm">{r.rules.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="mt-3 text-xs text-muted-foreground">Max {r.maxHours} hours per booking. Owner: {owner?.name}.</p>
          </Panel>
          <Panel title={<span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Already booked</span>}>
            {bookings.length === 0 ? <p className="text-sm text-muted-foreground">No bookings yet — wide open!</p> : (
              <ul className="divide-y text-sm">
                {bookings.slice(0, 6).map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-2">
                    <span>{fmtD(b.date)} · {b.start} ({b.duration}h) {b.programId && <span className="ml-1 rounded bg-amber/20 px-1.5 text-xs">Program: {programs.find((p) => p.id === b.programId)?.title}</span>}</span>
                    <StatusBadge status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <div className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <Panel title="Am I eligible?">
            <ul className="space-y-3">
              {el.items.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3">
                  <span className="flex items-start gap-2 text-sm">
                    {i.met ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-st-approved" aria-hidden /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-st-rejected" aria-hidden />}
                    <span><span className="font-medium">{i.label}</span><span className="block text-xs text-muted-foreground">{i.met ? "Met" : "Not met yet"}</span></span>
                  </span>
                  {!i.met && FIX[i.kind] && <Button asChild size="sm" variant="outline"><Link to={FIX[i.kind].to}>{FIX[i.kind].label}</Link></Button>}
                </li>
              ))}
            </ul>
            <div className={`mt-4 rounded-xl p-3 text-sm ${el.eligible ? "bg-st-approved/10 text-st-approved" : "bg-st-pending/10 text-st-pending"}`}>
              {el.eligible ? "You meet every requirement. You can request this now." : "You can still request — but unmet items must be completed before approval."}
            </div>
            <Button asChild variant="hero" size="lg" className="mt-4 w-full"><Link to="/book/$id" params={{ id: r.id }}>Request booking</Link></Button>
          </Panel>
          {(role === "owner" || role === "admin") && (
            <Button asChild variant="outline" className="w-full"><Link to="/resources/new" search={{ edit: r.id }}><Pencil /> Edit this resource</Link></Button>
          )}
        </div>
      </div>
    </div>
  );
}
