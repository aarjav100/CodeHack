import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Clock, Inbox, Sparkles, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState, FactorBars, FairGauge, Img, PageHeader, Panel, StatusBadge, VerifiedBadge, fmtD } from "@/components/shared";
import { useApp } from "@/store/app";
import { eligibility, fairScore, findConflicts } from "@/lib/logic";
import { endOf } from "@/lib/contest";
import { cn } from "@/lib/utils";
import type { Booking } from "@/data/types";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals inbox — CampusSphare" }, { name: "description", content: "Review booking requests with Fair-Share insights, eligibility and conflicts." }, { property: "og:title", content: "Approvals inbox — CampusSphare" }, { property: "og:description", content: "Review booking requests fairly." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Approvals,
});

type Decision = "approved" | "rejected" | "waitlisted";
const REC_TO: Record<Booking["recommendation"], Decision> = { approve: "approved", waitlist: "waitlisted", reject: "rejected" };
const REC_STYLE: Record<Booking["recommendation"], string> = { approve: "bg-st-approved/15 text-st-approved", waitlist: "bg-st-waitlisted/15 text-st-waitlisted", reject: "bg-destructive/15 text-destructive" };

function Approvals() {
  const { bookings, resources, users, weights, role, me, decide, seedApprovals } = useApp();
  const self = me();
  const [inspect, setInspect] = useState<string | null>(null);
  const [act, setAct] = useState<{ b: Booking; d: Decision } | null>(null);
  const [reason, setReason] = useState("");

  const mine = useMemo(() => {
    const ids = role === "owner" ? resources.filter((r) => r.ownerId === self.id).map((r) => r.id) : resources.map((r) => r.id);
    return bookings.filter((b) => b.status === "pending" && !b.contestId && ids.includes(b.resourceId));
  }, [bookings, resources, role, self.id]);

  if (!["owner", "manager", "admin"].includes(role)) {
    return <EmptyState icon={Inbox} title="Approvals are for space owners and managers" body="Switch role from the top bar to review requests." />;
  }

  const isOverride = act ? REC_TO[act.b.recommendation] !== act.d : false;
  const needReason = act ? act.d === "rejected" || isOverride : false;
  const submit = () => {
    if (!act) return;
    if (needReason && reason.trim().length < 5) { toast.error("Please give a short reason (at least 5 characters)"); return; }
    decide(act.b.id, act.d, reason.trim() || "Meets the space rules and no conflicts.");
    toast.success(`Request ${act.d}${isOverride ? " (override logged)" : ""}`);
    setAct(null); setReason("");
  };
  const ib = inspect ? bookings.find((b) => b.id === inspect) : null;
  const iu = ib ? users.find((u) => u.id === ib.userId) : null;

  return (
    <div>
      <PageHeader
        title="Approvals inbox"
        subtitle={role === "owner" ? "Requests for the spaces you own." : "All pending requests across campus."}
        actions={<Button variant="outline" onClick={() => toast.success(`${seedApprovals()} sample requests added`)}><Sparkles /> Load test requests</Button>}
      />
      {mine.length === 0 ? (
        <EmptyState icon={Inbox} title="Inbox zero" body="No pending requests. Load test requests to try the flow." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {mine.map((b) => {
            const u = users.find((x) => x.id === b.userId)!;
            const r = resources.find((x) => x.id === b.resourceId)!;
            const score = fairScore(u.factors, weights);
            const el = eligibility(r, u);
            const conflicts = findConflicts(b, bookings);
            return (
              <Panel key={b.id} className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Img src={r.image} alt={r.name} className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{fmtD(b.date)} · {b.start}–{endOf(b)}</p>
                    <button className="mt-1 text-sm font-medium text-primary underline-offset-2 hover:underline" onClick={() => setInspect(b.id)}>{u.name}</button>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums">{score}</p>
                    <p className="text-[11px] text-muted-foreground">Fair-Share</p>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm">“{b.purpose}”</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={cn("rounded-full px-2.5 py-1 font-semibold", REC_STYLE[b.recommendation])}>Suggested: {b.recommendation}</span>
                  <span className={cn("rounded-full px-2.5 py-1", el.eligible ? "bg-st-approved/10 text-st-approved" : "bg-destructive/10 text-destructive")}>{el.eligible ? "Eligible" : `Missing: ${el.items.filter((i) => !i.met).map((i) => i.label).join(", ")}`}</span>
                  {conflicts.length > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2.5 py-1"><AlertTriangle className="h-3 w-3" />{conflicts.length} overlap{conflicts.length > 1 ? "s" : ""}</span>}
                </div>
                <div className="mt-auto grid grid-cols-3 gap-2">
                  <Button variant="success" size="sm" onClick={() => setAct({ b, d: "approved" })}><Check /> Approve</Button>
                  <Button variant="outline" size="sm" onClick={() => setAct({ b, d: "waitlisted" })}><Clock /> Waitlist</Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setAct({ b, d: "rejected" })}><X /> Reject</Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Dialog open={!!act} onOpenChange={(o) => { if (!o) { setAct(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{act?.d === "waitlisted" ? "Add to waiting list" : act?.d?.replace("ed", "e")} request</DialogTitle>
            <DialogDescription>{isOverride ? "This differs from the suggested decision. Your reason is logged and shown to the applicant." : "The applicant will see this reason in their notifications."}</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={needReason ? "Reason (required)" : "Reason (optional)"} aria-label="Reason" />
          <DialogFooter><Button onClick={submit}>Confirm</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!ib} onOpenChange={(o) => !o && setInspect(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{iu?.name}</SheetTitle><SheetDescription>{iu?.dept} · {iu?.kind}</SheetDescription></SheetHeader>
          {ib && iu && (
            <div className="space-y-5 px-4 pb-6">
              <div className="flex items-center gap-2">{iu.verified === "verified" ? <VerifiedBadge /> : <StatusBadge status="pending" />}<span className="text-sm text-muted-foreground">Skills: {iu.skills.join(", ") || "none listed"}</span></div>
              <div className="grid place-items-center"><FairGauge factors={iu.factors} /></div>
              <FactorBars factors={iu.factors} />
              <div>
                <h4 className="mb-2 text-sm font-semibold">Recent bookings</h4>
                <ul className="space-y-1.5 text-sm">
                  {bookings.filter((x) => x.userId === iu.id && x.id !== ib.id).slice(0, 5).map((x) => (
                    <li key={x.id} className="flex justify-between rounded-lg border px-3 py-2"><span>{resources.find((r) => r.id === x.resourceId)?.name} · {x.date}</span><StatusBadge status={x.status} /></li>
                  ))}
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full"><Link to="/fair-share">How the score works</Link></Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

