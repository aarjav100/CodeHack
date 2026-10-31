import { createFileRoute, Link } from "@tanstack/react-router";
import { FACTOR_LABELS, FactorBars, FairGauge } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import type { FairFactors } from "@/data/types";
import { fairScore } from "@/lib/logic";

export const Route = createFileRoute("/fair-share")({
  head: () => ({
    meta: [
      { title: "Civic Fair-Share Allocation System — CampusSphare" },
      { name: "description", content: "Learn how university resources are shared fairly through explainable priority scoring, peer reliability and off-peak incentives." },
      { property: "og:title", content: "Fair-Share Score — CampusSphare" },
      { property: "og:description", content: "Transparent, explainable campus allocation." }
    ]
  }),
  component: Fair,
});

function Fair() {
  const me = useMe();
  const w = useApp((s) => s.weights);
  const score = fairScore(me.factors, w);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Civic Commons Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fair-Share Allocation Model</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent, explainable resource distribution. When slots are contested, priority is determined by community reliability, not speed.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200/80 px-4 py-3 rounded-2xl text-right shrink-0">
          <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">Your Standing</div>
          <div className="text-2xl font-black text-blue-700">{score}<span className="text-xs font-normal text-slate-400">/100</span></div>
          <span className="text-[11px] font-semibold text-emerald-600">Sovereign Citizen Tier</span>
        </div>
      </div>

      {/* Tier Visual Progress Ladder */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wide">Campus Allocation Tiers</span>
          <span className="text-blue-600 font-semibold">{score >= 90 ? "Maximum Priority" : `${95 - score} points to Master Fellow (Tier 0)`}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex p-0.5 border border-slate-200">
          <div className="bg-blue-600 h-full rounded-l-full transition-all" style={{ width: `${score}%` }}></div>
          <div className="bg-slate-200 h-full flex-1"></div>
        </div>
        <div className="grid grid-cols-4 text-center text-xs pt-1">
          <div className="border-r border-slate-100 pr-2">
            <div className="font-bold text-slate-800">Standard Tier</div>
            <div className="text-[11px] text-slate-400">0 – 50 Pts</div>
          </div>
          <div className="border-r border-slate-100 px-2">
            <div className="font-bold text-slate-800">Active Maker</div>
            <div className="text-[11px] text-slate-400">51 – 75 Pts</div>
          </div>
          <div className="border-r border-slate-100 px-2">
            <div className="font-bold text-blue-700">Sovereign Tier (You)</div>
            <div className="text-[11px] text-blue-600 font-semibold">76 – 94 Pts</div>
          </div>
          <div className="pl-2">
            <div className="font-bold text-emerald-700">Master Fellow</div>
            <div className="text-[11px] text-emerald-600">95+ Pts</div>
          </div>
        </div>
      </section>

      {/* Primary Score Breakdown & Gauge */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Gauge & Metrics (5 Cols) */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Your Telemetry Gauge</h2>
            <p className="text-xs text-slate-500 mb-4">Calculated in real-time across your past 12 campus bookings.</p>
            <div className="flex justify-center py-4">
              <FairGauge factors={me.factors} size={220} />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
            <span>Points adjust dynamically upon checkout inspection and returns.</span>
          </div>
        </section>

        {/* Right Factor Weights (7 Cols) */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Factor Composition</h2>
            <p className="text-xs text-slate-500 mb-4">Weights are university-wide constants set by student-faculty consensus.</p>
            <FactorBars factors={me.factors} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block">Decentralized &amp; Audited</span>
              <span className="text-slate-500 text-[11px] mt-0.5 block">Every manager override logs written justification to public audit logs.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block">Zero Pay-to-Play</span>
              <span className="text-slate-500 text-[11px] mt-0.5 block">Money cannot purchase priority. Points reflect campus care and equipment stewardship.</span>
            </div>
          </div>
        </section>
      </div>

      {/* Ways to Earn Points */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Civic Contribution Breakdown</h3>
        <p className="text-xs text-slate-500 mb-4">Easy ways to elevate your standing and secure high-demand spaces.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div className="text-xs font-bold text-slate-900">On-Time Checkout</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Check in promptly and leave clean workstations for the next student group.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 w-fit">
              +30 Pts
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Lead a Peer Workshop</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Host study sessions or mentor junior students on open equipment.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 w-fit">
              +25 Pts
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">event_available</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Zero Ghost Bookings</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Cancel in advance if plans change so other citizens can claim the room.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 w-fit">
              +20 Pts
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">energy_savings_leaf</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Off-Peak Utilization</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Reserve spaces during 13:00–16:00 low traffic windows to ease campus demand.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 w-fit">
              +10 Pts per session
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}


