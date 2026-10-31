import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useApp } from "@/store/app";
import { ConditionForm } from "@/components/ConditionForm";
import { EmptyState } from "@/components/shared";
import { endOf, toMin } from "@/lib/contest";
import { format } from "date-fns";

export const Route = createFileRoute("/return/$id")({
  head: () => ({
    meta: [
      { title: "Return & Checkout — CampusSphare" },
      { name: "description", content: "Compare condition checklist and complete checkout. On-time returns protect your 100% Fair-Share score." },
      { property: "og:title", content: "Return & Checkout — CampusSphare" },
      { property: "og:description", content: "Return checklist with punctuality inspection." },
    ],
  }),
  component: Return,
});

function Return() {
  const { id } = Route.useParams();
  const b = useApp((s) => s.bookings.find((x) => x.id === id));
  const r = useApp((s) => s.resources.find((x) => x.id === b?.resourceId));
  const ret = useApp((s) => s.returnItem);
  const nav = useNavigate();

  const [simulatedLateness, setSimulatedLateness] = useState<number>(0);

  if (!b || !r) {
    return <EmptyState title="Booking not found" action={<Link to="/bookings" className="text-primary underline">My bookings</Link>} />;
  }

  // Calculate scheduled end time
  const scheduledEnd = endOf(b);
  const nowTime = new Date();
  const isToday = b.date === format(nowTime, "yyyy-MM-dd");
  const endMinutes = toMin(b.start) + b.duration * 60;
  const currentMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();
  const naturalLateMinutes = isToday && currentMinutes > endMinutes + 5 ? currentMinutes - endMinutes : 0;
  const effectiveLateMinutes = simulatedLateness > 0 ? simulatedLateness : naturalLateMinutes;
  const isLate = effectiveLateMinutes > 0;
  const penaltyPoints = isLate ? Math.min(50, Math.max(5, Math.ceil(effectiveLateMinutes / 15) * 5)) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-16">
      <Link to="/bookings" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to My Bookings
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Checkout &amp; Return</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{r.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scheduled: {b.start} – {scheduledEnd}</span>
          </div>
        </div>

        {/* Punctuality Status Banner */}
        {isLate ? (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300 block">
                Late Checkout Detected: {effectiveLateMinutes} minutes overdue
              </span>
              <p className="text-rose-700 dark:text-rose-400 mt-0.5">
                Returning past scheduled end time ({scheduledEnd}) will deduct <strong>−{penaltyPoints} points</strong> from your Fair-Share score.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                On-Time Checkout Window Active
              </span>
              <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                Returning on time preserves your <strong>100% Fair-Share score</strong> and maintains priority booking status for future sessions.
              </p>
            </div>
          </div>
        )}

        {/* Demo Simulator Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">Test Checkout Timing:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSimulatedLateness(0)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                simulatedLateness === 0 ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              On-Time (100% Score)
            </button>
            <button
              type="button"
              onClick={() => setSimulatedLateness(20)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                simulatedLateness === 20 ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              20m Late (−10 pts)
            </button>
            <button
              type="button"
              onClick={() => setSimulatedLateness(45)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                simulatedLateness === 45 ? "bg-rose-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              45m Late (−15 pts)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Facility Condition Inspection</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verify workstation and safety checklist before handing over to the next student.
          </p>
        </div>

        <ConditionForm
          checklist={r.checklist}
          before={b.checkin?.items}
          cta={isLate ? `Confirm Return (${penaltyPoints > 0 ? `-${penaltyPoints} pts penalty` : ""})` : "Confirm On-Time Return"}
          onSubmit={(items, notes, photos) => {
            ret(b.id, items, notes, photos, effectiveLateMinutes > 0 ? effectiveLateMinutes : undefined);
            const changed = items.filter((x) => !x.ok && (b.checkin?.items.find((p) => p.item === x.item)?.ok ?? true));
            if (isLate) {
              toast.error(`Late checkout recorded (−${penaltyPoints} pts penalty)!`, {
                description: `Returned ${effectiveLateMinutes} mins late. Fair-Share score decreased.`,
              });
            } else if (changed.length) {
              toast.warning("Return recorded with noted issues");
            } else {
              toast.success("Returned on time! 100% Fair-Share score preserved.");
            }
            nav({ to: "/bookings" });
          }}
        />
      </div>
    </div>
  );
}

