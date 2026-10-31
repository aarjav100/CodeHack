import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Clock, Inbox, Sparkles, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState, FactorBars, FairGauge, Img, StatusBadge, VerifiedBadge, fmtD } from "@/components/shared";
import { useApp } from "@/store/app";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS } from "@/types/auth";
import { eligibility, fairScore, findConflicts } from "@/lib/logic";
import { endOf } from "@/lib/contest";
import type { Booking } from "@/data/types";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Governance & Approvals Inbox — CampusSphare" },
      { name: "description", content: "Review student booking requests with explainable Fair-Share insights, conflict detection and safety verifications." },
      { property: "og:title", content: "Governance Inbox — CampusSphare" },
      { property: "og:description", content: "Fair peer review and approvals." }
    ]
  }),
  component: Approvals,
});

type Decision = "approved" | "rejected" | "waitlisted";
const REC_TO: Record<Booking["recommendation"], Decision> = { approve: "approved", waitlist: "waitlisted", reject: "rejected" };

function Approvals() {
  const { bookings, resources, users, weights, role, me, decide, seedApprovals } = useApp();
  const self = me();
  const currentUser = useAuthStore((s) => s.currentUser);
  const activeRole = useAuthStore((s) => s.activeRole);
  const canReviewRequest = useAuthStore((s) => s.canReviewRequest);

  const [inspect, setInspect] = useState<string | null>(null);
  const [act, setAct] = useState<{ b: Booking; d: Decision } | null>(null);
  const [reason, setReason] = useState("");
  const [filterTab, setFilterTab] = useState<"pending" | "needs_review" | "faculty" | "history">("pending");

  const pendingList = useMemo(() => {
    const ids = role === "owner" ? resources.filter((r) => r.ownerId === self.id).map((r) => r.id) : resources.map((r) => r.id);
    return bookings.filter((b) => b.status === "pending" && !b.contestId && ids.includes(b.resourceId));
  }, [bookings, resources, role, self.id]);

  const historyList = useMemo(() => {
    return bookings.filter((b) => b.status !== "pending").slice(0, 10);
  }, [bookings]);

  if (!["owner", "manager", "admin"].includes(role)) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[28px]">gavel</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Governance &amp; Approvals Inbox</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          The approvals inbox is reserved for space stewards, department managers, and campus administrators. Switch your role using the top bar selector to review requests.
        </p>
      </div>
    );
  }

  const isOverride = act ? REC_TO[act.b.recommendation] !== act.d : false;
  const needReason = act ? act.d === "rejected" || isOverride : false;

  const submit = () => {
    if (!act) return;

    // Conflict-of-interest check: Owner cannot review their own student requests
    if (currentUser) {
      const conflict = canReviewRequest(act.b.userId);
      if (!conflict.allowed) {
        toast.error("Conflict of interest: You can't review a request you made yourself.");
        return;
      }
    }

    if (needReason && reason.trim().length < 5) {
      toast.error("Please provide a brief justification (at least 5 characters)");
      return;
    }

    const roleName = ROLE_CONFIGS[activeRole]?.label || role;
    const actorLabel = `${currentUser ? currentUser.name : self.name} (as ${roleName})`;
    decide(act.b.id, act.d, reason.trim() || `Approved by ${actorLabel}: meets criteria and passed verification.`);
    toast.success(`Request ${act.d}${isOverride ? " (override recorded)" : ""}`);
    setAct(null);
    setReason("");
  };

  const handleApproveSafeBatch = () => {
    const safeOnes = pendingList.filter((b) => b.recommendation === "approve");
    if (safeOnes.length === 0) {
      toast.info("No auto-approvable requests pending in this queue");
      return;
    }
    safeOnes.forEach((b) => decide(b.id, "approved", "Fast-track approved via batch consensus"));
    toast.success(`Approved ${safeOnes.length} pre-cleared safe requests!`);
  };

  const ib = inspect ? bookings.find((b) => b.id === inspect) : null;
  const iu = ib ? users.find((u) => u.id === ib.userId) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Friendly Page Title and Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Campus Governance &amp; Community Care</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Approvals &amp; Requests Inbox
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {pendingList.length} Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fair, transparent peer review and automatic safety checks for university maker resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success(`${seedApprovals()} sample requests loaded into inbox`)}
            className="rounded-xl text-xs font-semibold gap-1.5 h-9"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Load Test Requests</span>
          </Button>
          <button
            onClick={handleApproveSafeBatch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            <span>Approve Safe Requests</span>
          </button>
        </div>
      </div>

      {/* Human-Friendly Metric & Vitals Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingList.length}</span>
            <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
              {pendingList.filter((b) => b.recommendation === "approve").length} pre-cleared
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Fast-track score &gt; 80 eligible</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Auto-Approved Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">18</span>
            <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              82% instant pass
            </span>
          </div>
          <div className="mt-2.5 text-xs text-slate-500">
            <span>All safety prerequisites verified</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Avg. Decision Time</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">24<span className="text-sm font-semibold text-slate-500">m</span></span>
            <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              -18m faster
            </span>
          </div>
          <div className="mt-2.5 text-xs text-slate-500">
            <span>Meeting campus governance SLA</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Requires Special Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[18px]">flag</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">1</span>
            <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
              Safety orientation
            </span>
          </div>
          <div className="mt-2.5 text-xs text-slate-500">
            <span>Quick waiver available in detail view</span>
          </div>
        </div>
      </section>

      {/* Primary Workspace Layout (2-Column Bento Split) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Decision Stream & Filter Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Clean Category Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilterTab("pending")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  filterTab === "pending"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>Pending Requests</span>
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  filterTab === "pending" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {pendingList.length}
                </span>
              </button>
              <button
                onClick={() => setFilterTab("needs_review")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  filterTab === "needs_review"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>Needs Verification</span>
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                  {pendingList.filter((b) => b.recommendation === "reject").length || 1}
                </span>
              </button>
              <button
                onClick={() => setFilterTab("faculty")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  filterTab === "faculty"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>Faculty Supervised</span>
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">1</span>
              </button>
              <button
                onClick={() => setFilterTab("history")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  filterTab === "history"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>Decision History</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pr-1">
              <span>Sort: Fair-Share Score</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">tune</span>
            </div>
          </div>

          {/* Decision Queue Cards */}
          {filterTab === "history" ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm divide-y divide-slate-100">
              <h3 className="text-sm font-bold text-slate-900 pb-3">Recently Decided Requests</h3>
              {historyList.map((b) => {
                const u = users.find((x) => x.id === b.userId);
                const r = resources.find((x) => x.id === b.resourceId);
                return (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{r?.name}</span>
                      <span className="text-slate-500 ml-2">by {u?.name} ({fmtD(b.date)} {b.start})</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">“{b.purpose}”</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                );
              })}
            </div>
          ) : pendingList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Inbox Zero — All caught up!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No requests currently require your review. Click "Load Test Requests" to simulate incoming student bookings.
              </p>
            </div>
          ) : (
            pendingList.map((b) => {
              const u = users.find((x) => x.id === b.userId)!;
              const r = resources.find((x) => x.id === b.resourceId)!;
              const score = fairScore(u.factors, weights);
              const el = eligibility(r, u);
              const conflicts = findConflicts(b, bookings);

              return (
                <article
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col gap-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          alt={r.name}
                          className="w-full h-full object-cover"
                          src={r.image}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {r.dept}
                          </span>
                          <span>•</span>
                          <span>Request #{b.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900">{r.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                          <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                          <span>{fmtD(b.date)} · {b.start} – {endOf(b)}</span>
                          <span className="text-slate-300">/</span>
                          <button
                            type="button"
                            onClick={() => setInspect(b.id)}
                            className="text-blue-600 font-semibold hover:underline"
                          >
                            {u.name}
                          </button>
                          <span className="text-slate-400">({u.dept || u.kind})</span>
                        </div>
                      </div>
                    </div>

                    {/* Citizen Fair-Share Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Fair-Share:</span>
                        <span className="text-sm font-bold text-slate-900">{score}/100</span>
                      </div>
                      <span className={`mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        score >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {score >= 80 ? "Trusted Maker" : "Standard Standing"}
                      </span>
                    </div>
                  </div>

                  {/* Purpose Box */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0 mt-0.5">format_quote</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 font-semibold">Stated Purpose: </strong>
                      “{b.purpose}”
                    </p>
                  </div>

                  {/* Check Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2.5">
                      {conflicts.length === 0 ? (
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
                      )}
                      <div>
                        <div className="text-[11px] font-medium text-slate-400">Schedule Conflict</div>
                        <div className="text-xs font-bold text-slate-800">
                          {conflicts.length === 0 ? "Clear (0 Overlaps)" : `${conflicts.length} Overlaps`}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2.5">
                      {el.eligible ? (
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">shield</span>
                      ) : (
                        <span className="material-symbols-outlined text-amber-600 text-[20px]">flag</span>
                      )}
                      <div>
                        <div className="text-[11px] font-medium text-slate-400">Safety Eligibility</div>
                        <div className="text-xs font-bold text-slate-800">
                          {el.eligible ? "Prerequisites Met" : "Prerequisites Incomplete"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-blue-600 text-[20px]">task_alt</span>
                      <div>
                        <div className="text-[11px] font-medium text-slate-400">Recommendation</div>
                        <div className="text-xs font-bold text-blue-700 capitalize">
                          {b.recommendation === "approve" ? "Eligible for Instant Pass" : `${b.recommendation} suggested`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  {(() => {
                    const isSelfRequest = currentUser
                      ? !canReviewRequest(b.userId).allowed
                      : b.userId === self.id;

                    return (
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Digital Smart Lock key ready to dispatch</span>
                        </div>
                        {isSelfRequest ? (
                          <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/90 px-3.5 py-1.5 text-xs font-bold text-amber-900 shadow-xs">
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>You can&apos;t review a request you made yourself.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAct({ b, d: "waitlisted" })}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Waitlist
                            </button>
                            <button
                              onClick={() => setAct({ b, d: "rejected" })}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => setAct({ b, d: "approved" })}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                              <span>Approve &amp; Issue Access</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </article>
              );
            })
          )}
        </div>

        {/* Right Column: Capacity & Clean Activity Feed (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Campus Capacity & Quota Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campus Capacity</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Normal Operations
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Makerspace Electrical Load</span>
                  <span className="font-bold text-slate-900">32% in use (Healthy)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "32%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Bio-Chamber HVAC Power</span>
                  <span className="font-bold text-amber-700">84% reserved</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "84%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Faculty On-Duty Coverage</span>
                  <span className="font-bold text-emerald-700">94% active</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "94%" }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Next allocation cycle</span>
              <span className="font-semibold text-slate-700">Today at 6:00 PM</span>
            </div>
          </div>

          {/* Clean Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">history</span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Activity</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Updates
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Smart Key #402</span>
                  <span>12:41 PM</span>
                </div>
                <p className="text-xs text-slate-800 leading-snug">
                  Checkout completed: Clean Room C workstation released back to student pool.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="material-symbols-outlined text-[13px] text-emerald-600">check</span>
                  <span>Equipment cleaned &amp; verified</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">Seminar Hall A</span>
                  <span>12:38 PM</span>
                </div>
                <p className="text-xs text-slate-800 leading-snug">
                  Space confirmed for <strong className="text-slate-900">Debate Union</strong> after peer consensus.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="material-symbols-outlined text-[13px] text-blue-600">groups</span>
                  <span>Quorum threshold reached</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Laser Cutter B</span>
                  <span>11:55 AM</span>
                </div>
                <p className="text-xs text-slate-800 leading-snug">
                  Safety certificate verified for Aarjav Jain. Priority access cleared.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="material-symbols-outlined text-[13px] text-purple-600">badge</span>
                  <span>ISO-9002 compliance passed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Dialog */}
      <Dialog open={!!act} onOpenChange={(o) => { if (!o) { setAct(null); setReason(""); } }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize text-slate-900">
              {act?.d === "waitlisted" ? "Add to waiting list" : act?.d?.replace("ed", "e")} request
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {isOverride
                ? "This differs from the automated recommendation. Your rationale will be recorded in the civic audit ledger."
                : "The applicant will receive an instant notification with this decision note."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={needReason ? "Enter rationale (required)" : "Reason (optional)"}
            className="rounded-xl border-slate-200"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAct(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={submit} className="rounded-xl bg-blue-600 hover:bg-blue-700">Confirm Decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Profile Sheet */}
      <Sheet open={!!ib} onOpenChange={(o) => !o && setInspect(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{iu?.name}</SheetTitle>
            <SheetDescription>{iu?.dept} · {iu?.kind}</SheetDescription>
          </SheetHeader>
          {ib && iu && (
            <div className="space-y-5 px-4 pb-6">
              <div className="flex items-center gap-2">
                {iu.verified === "verified" ? <VerifiedBadge /> : <StatusBadge status="pending" />}
                <span className="text-sm text-muted-foreground">Skills: {iu.skills.join(", ") || "none listed"}</span>
              </div>
              <div className="grid place-items-center">
                <FairGauge factors={iu.factors} />
              </div>
              <FactorBars factors={iu.factors} />
              <div>
                <h4 className="mb-2 text-sm font-semibold">Recent bookings</h4>
                <ul className="space-y-1.5 text-sm">
                  {bookings.filter((x) => x.userId === iu.id && x.id !== ib.id).slice(0, 5).map((x) => (
                    <li key={x.id} className="flex justify-between rounded-lg border px-3 py-2">
                      <span>{resources.find((r) => r.id === x.resourceId)?.name} · {x.date}</span>
                      <StatusBadge status={x.status} />
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link to="/fair-share">How the score works</Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}


