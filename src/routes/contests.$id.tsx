import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BellPlus, Scale, ShieldCheck, ShieldAlert, AlertTriangle, Info, CheckCircle2, XCircle, Hourglass, FastForward, MessageSquareMore, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EmptyState, FactorBars, FairGauge, Field, Panel, StatusBadge, Timeline, fmtD, fmtDT } from "@/components/shared";
import { Countdown, DemandBadge, FactorLegend, OverlapBar, RecommendedBadge, ScoreStack } from "@/components/contest";
import { useApp, useMe } from "@/store/app";
import { displayName, explainResult, rankContest } from "@/lib/contest";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contests/$id")({
  head: () => ({ meta: [{ title: "Competing requests — CampusSphare" }, { name: "description", content: "See who wants this slot, how it will be decided and the result." }, { property: "og:title", content: "Contest — CampusSphare" }, { property: "og:description", content: "Fair, transparent slot decisions." }] }),
  component: ContestPage,
});

const ord = (n: number) => `${n}${["th", "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? "th"}`;

function ContestPage() {
  const { id } = Route.useParams();
  const st = useApp();
  const me = useMe();
  const c = st.contests.find((x) => x.id === id);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [pick, setPick] = useState("");
  const [reason, setReason] = useState("");
  if (!c) return <EmptyState title="Contest not found" action={<Link to="/demand" className="text-primary underline">Live demand</Link>} />;
  const res = st.resources.find((r) => r.id === c.resourceId)!;
  const reqs = c.requestIds.map((rid) => st.bookings.find((b) => b.id === rid)!).filter(Boolean).sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
  const staff = ["owner", "manager", "admin"].includes(st.role);
  const mine = reqs.find((b) => b.userId === me.id);
  const label = (uid: string, i: number) => (staff ? st.users.find((u) => u.id === uid)!.name : mine ? (uid === me.id ? "You" : `Applicant ${i + 1}`) : displayName(st.users.find((u) => u.id === uid), res.anonymous));
  const ranking = c.ranking ?? rankContest(c, st.bookings, st.users, res, st.weights);
  const ranked = ranking.filter((r) => r.rank);
  const myEntry = mine && ranking.find((r) => r.bookingId === mine.id);
  const recommended = c.recommendedId;
  const audit = st.audit.filter((a) => a.action.startsWith("contest") && (a.target === res.name || a.detail.includes(c.id) || a.target === c.id)).sort((a, b) => b.at.localeCompare(a.at));
  const icon = { approved: CheckCircle2, rejected: XCircle, waitlisted: Hourglass } as const;

  return (
    <div>
      <Link to="/demand" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Live demand</Link>
      <div className="mb-6 rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Competing requests</div>
            <h1 className="text-2xl font-bold">{res.name}</h1>
            <p className="text-muted-foreground">{fmtD(c.date)} · {c.start}–{c.end} · {reqs.length} request{reqs.length !== 1 ? "s" : ""}</p>
            <div className="mt-2"><DemandBadge contest={c} /></div>
          </div>
          {c.status === "open" && (
            <div className="rounded-2xl bg-contested p-4 text-center">
              <div className="text-xs font-medium">Window closes in</div>
              <div className="font-display text-2xl font-bold"><Countdown iso={c.windowClosesAt} /></div>
              <div className="text-xs text-muted-foreground" suppressHydrationWarning>{fmtDT(c.windowClosesAt)}</div>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {c.status === "open" && !mine && st.role === "user" && <Button asChild variant="hero"><Link to="/book/$id" params={{ id: res.id }}>Request this slot too</Link></Button>}
          {c.status === "open" && !mine && <Button variant="outline" onClick={() => { st.watch(c.id); toast.success("We'll notify you if it frees up"); }} disabled={(st.watchers[c.id] ?? []).includes(me.id)}><BellPlus /> {(st.watchers[c.id] ?? []).includes(me.id) ? "Watching" : "Notify me if it frees up"}</Button>}
          {c.status === "open" && mine && <Button variant="outline" onClick={() => { st.withdraw(mine.id); toast("Request withdrawn"); }}>Withdraw my request</Button>}
          {c.status === "open" && <Button variant="ghost" onClick={() => { st.closeWindow(c.id); toast.success("Window closed — scores locked"); }}><FastForward /> Fast-forward to window close</Button>}
        </div>
      </div>

      {c.status === "decided" && myEntry && mine && (
        <Panel className={cn("mb-6 border-2", mine.status === "approved" ? "border-st-approved/40" : mine.status === "waitlisted" ? "border-st-waitlisted/40" : "border-st-rejected/40")} title={<span className="inline-flex items-center gap-2">{(() => { const I = icon[mine.status as keyof typeof icon] ?? Info; return <I className="h-5 w-5" />; })()} Your result: <StatusBadge status={mine.status} /></span>}>
          <h3 className="mb-2 text-sm font-semibold">Why this happened</h3>
          <ol className="list-inside list-decimal space-y-1.5 text-sm">{explainResult(c, myEntry, st.weights).map((s, i) => <li key={i}>{s}</li>)}{mine.status === "waitlisted" && <li>You are {ord(mine.waitPos ?? 1)} on the waiting list. If the winner cancels, you get an offer to accept within 2 hours.</li>}{mine.status === "rejected" && myEntry.missing && <li>To fix it: <Link to="/resources/$id" params={{ id: res.id }} className="text-primary underline">see the requirements</Link>.</li>}</ol>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="Requests in the order they arrived">
            {reqs.length === 0 ? <p className="text-sm text-muted-foreground">All applicants withdrew.</p> : (
              <>
                <ol className="space-y-3">
                  {reqs.map((b, i) => (
                    <li key={b.id} className={cn("flex flex-wrap items-center gap-2 rounded-xl border p-3", b.userId === me.id && "border-primary/40 bg-primary/5")}>
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                      <span className="font-medium">{label(b.userId, i)}</span>
                      {b.purposeCategory && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{b.purposeCategory}</span>}
                      <span className="text-xs text-muted-foreground">{b.start} · {b.duration}h · requested <span suppressHydrationWarning>{fmtDT(b.createdAt ?? b.timeline[0].at)}</span></span>
                      {c.status === "decided" && <StatusBadge status={b.status} className="ml-auto" />}
                    </li>
                  ))}
                </ol>
                <div className="mt-5"><OverlapBar contest={c} requests={reqs} labels={reqs.map((b, i) => label(b.userId, i))} /></div>
              </>
            )}
          </Panel>

          {staff && (
            <Panel title="Score comparison" action={c.status !== "open" ? <span className="text-xs text-muted-foreground">Scores locked at window close</span> : <span className="text-xs text-muted-foreground">Live preview — locks at close</span>}>
              <FactorLegend />
              <div className="mt-4 space-y-3">
                {ranking.map((r) => {
                  const u = st.users.find((x) => x.id === r.userId)!;
                  return (
                    <div key={r.bookingId}>
                      <div className="mb-1 flex items-center gap-2 text-sm"><span className="font-medium">{u.name}</span><span className="text-muted-foreground">{r.eligible ? `#${r.rank} · ${r.score}` : "Not ranked"}</span>{r.bookingId === recommended && <RecommendedBadge />}</div>
                      {r.eligible ? <ScoreStack factors={r.factors} w={st.weights} label={u.name} /> : <div className="rounded-lg bg-st-rejected/10 px-2 py-1 text-xs text-st-rejected">Hard gate: {r.missing}</div>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Rank</th><th>Name</th><th>Eligibility</th><th>Verification</th><th>Score</th><th>Action</th></tr></thead>
                  <tbody>
                    {ranking.map((r) => {
                      const u = st.users.find((x) => x.id === r.userId)!;
                      const action = !r.eligible ? "Reject" : r.bookingId === recommended || (!recommended && r.rank === 1) ? "Approve" : "Waitlist";
                      return (
                        <tr key={r.bookingId} className="border-b last:border-0">
                          <td className="py-2 font-semibold">{r.rank ?? "–"}</td>
                          <td>{u.name}<div className="text-xs text-muted-foreground">{u.dept}</div></td>
                          <td>{r.eligible ? <span className="inline-flex items-center gap-1 text-st-approved"><CheckCircle2 className="h-4 w-4" />Eligible</span> : <span className="inline-flex items-center gap-1 text-st-rejected"><XCircle className="h-4 w-4" />{r.missing}</span>}</td>
                          <td>{u.verified === "verified" ? <span className="inline-flex items-center gap-1 text-st-approved"><ShieldCheck className="h-4 w-4" />Verified</span> : <span className="inline-flex items-center gap-1 text-st-pending"><ShieldAlert className="h-4 w-4" />{u.verified}</span>}</td>
                          <td className="font-semibold">{r.eligible ? r.score : "—"}</td>
                          <td>{action}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {c.status === "closed" && (
                <div className="mt-5 space-y-3 border-t pt-4">
                  {c.escalated ? <p className="flex items-center gap-2 rounded-xl bg-st-rejected/10 p-3 text-sm text-st-rejected"><Siren className="h-4 w-4" />Escalated to admin.</p> : <p className="flex items-center gap-2 rounded-xl bg-st-pending/10 p-3 text-sm"><AlertTriangle className="h-4 w-4 text-st-pending" />Reminder: applicants are waiting. Please decide within 24 hours of the window closing.</p>}
                  {c.infoRequested && <p className="text-sm text-muted-foreground">More information was requested from applicants.</p>}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="teal" disabled={!recommended} onClick={() => { st.confirmContest(c.id, recommended!); toast.success("Result published to all applicants"); }}><CheckCircle2 /> Confirm recommendation</Button>
                    <Button variant="outline" onClick={() => { setPick(""); setReason(""); setOverrideOpen(true); }}><Scale /> Override</Button>
                    <Button variant="ghost" onClick={() => { st.requestInfo(c.id); toast("Applicants asked for more info"); }}><MessageSquareMore /> Request more information</Button>
                    {!c.escalated && <Button variant="ghost" onClick={() => { st.escalate(c.id); toast("Escalated to admin"); }}><Siren /> Escalate to admin</Button>}
                  </div>
                </div>
              )}
              {c.status === "decided" && <p className="mt-4 text-sm text-muted-foreground">Decided by {st.users.find((u) => u.id === c.decidedBy)?.name}{c.override ? ` (override: “${c.override}”)` : " — recommendation confirmed"}.{c.skipped?.length ? ` ${c.skipped.length} recommended applicant(s) skipped for becoming ineligible.` : ""}</p>}
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          {mine && myEntry && (
            <Panel title="Your position">
              <div className="flex justify-center"><FairGauge factors={myEntry.factors} /></div>
              <p className="mt-2 text-center font-semibold">{myEntry.eligible ? `You are ${ord(myEntry.rank!)} of ${ranked.length}` : "Not ranked"}{c.status === "open" && myEntry.eligible && <span className="block text-xs font-normal text-muted-foreground">if the window closed right now</span>}</p>
              {!myEntry.eligible && <p className="mt-1 text-center text-sm text-st-rejected">Missing: {myEntry.missing}</p>}
              <div className="mt-4"><FactorBars factors={myEntry.factors} /></div>
              <p className="mt-3 text-xs text-muted-foreground">Other applicants' scores are private. <Link to="/fair-share" className="text-primary underline">How to improve</Link></p>
            </Panel>
          )}
          <Panel title={<span className="inline-flex items-center gap-2"><Info className="h-4 w-4" />How this will be decided</span>}>
            <ol className="list-inside list-decimal space-y-1.5 text-sm">
              <li>It's <strong>not</strong> first-come-first-served. Everyone who asks before the window closes is treated equally.</li>
              <li>First, hard rules: you must be eligible (verified, trained) and under the weekly limit of {st.weights.maxBookingsPerWeek} bookings. If not, you're told exactly what's missing.</li>
              <li>Eligible requests are ranked by Fair-Share Score: low recent usage (30), waiting time (20), purpose need (20), skills (15), reliability (15), minus confirmed penalties.</li>
              <li>Equal scores? The earlier request wins.</li>
              <li>Scores are locked when the window closes. A manager confirms, and any override needs a written, logged reason.</li>
              <li>Everyone else is waitlisted in order. If the winner cancels, #1 gets 2 hours to accept.</li>
            </ol>
          </Panel>
          {st.role === "admin" && <Panel title="Audit trail">{audit.length ? <Timeline events={audit.map((a) => ({ at: a.at, actor: a.actorId === "system" ? "System" : st.users.find((u) => u.id === a.actorId)?.name ?? a.actorId, text: `${a.action}: ${a.detail}` }))} /> : <p className="text-sm text-muted-foreground">No entries yet.</p>}</Panel>}
        </div>
      </div>

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Override recommendation</DialogTitle><DialogDescription>Overrides are logged permanently in the audit log and explained to every applicant.</DialogDescription></DialogHeader>
          <RadioGroup value={pick} onValueChange={setPick} aria-label="Choose winner">
            {ranking.filter((r) => r.eligible && r.bookingId !== recommended).map((r) => <label key={r.bookingId} className="flex items-center gap-2 rounded-xl border p-3 text-sm"><RadioGroupItem value={r.bookingId} />{st.users.find((u) => u.id === r.userId)?.name} · #{r.rank} · {r.score}</label>)}
          </RadioGroup>
          <Field label="Reason (required)" error={reason && reason.trim().length < 10 ? "Write at least 10 characters" : undefined}><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Inter-college event with external guests already confirmed" /></Field>
          <DialogFooter><Button disabled={!pick || reason.trim().length < 10} onClick={() => { st.confirmContest(c.id, pick, reason.trim()); setOverrideOpen(false); toast.success("Override applied and logged"); }}>Apply override</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

