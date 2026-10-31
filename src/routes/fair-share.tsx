import { createFileRoute, Link } from "@tanstack/react-router";
import { FACTOR_LABELS, FactorBars, FairGauge } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import type { FairFactors } from "@/data/types";
import { fairScore } from "@/lib/logic";
import { toast } from "sonner";
import {
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingDown,
  Sparkles,
  Award,
  BookOpen,
  HeartHandshake
} from "lucide-react";

export const Route = createFileRoute("/fair-share")({
  head: () => ({
    meta: [
      { title: "Civic Fair-Share Allocation System — CampusSphare" },
      { name: "description", content: "Learn how university resources are shared fairly through explainable priority scoring, peer reliability, user capability, urgency, need, and on-time checkout." },
      { property: "og:title", content: "Fair-Share Score — CampusSphare" },
      { property: "og:description", content: "Transparent, explainable campus allocation." }
    ]
  }),
  component: Fair,
});

function Fair() {
  const me = useMe();
  const w = useApp((s) => s.weights);
  const penalizeLateCheckout = useApp((s) => s.penalizeLateCheckout);
  const resetFairScore = useApp((s) => s.resetFairScore);
  const score = fairScore(me.factors, w);

  const penalties = me.factors.penalties || 0;
  const isPristine = score === 100 && penalties === 0;

  const handleSimulateLate = (minutes: number, points: number) => {
    penalizeLateCheckout(me.id, points, `Simulated ${minutes}m late checkout`);
    toast.error(`Late checkout applied: -${points} pts penalty!`, {
      description: `Fair score decreased from ${score}% to ${Math.max(0, score - points)}%.`,
    });
  };

  const handleResetBaseline = () => {
    resetFairScore(me.id);
    toast.success("Fair score restored to initial 100% baseline!", {
      description: "Clean record verified. All factors reset to maximum standing.",
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Civic Commons Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fair-Share Allocation Model</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Fair distribution based on <strong>Capability, Urgency, Need, Skills, and Punctuality</strong>. Every user starts at <strong>100%</strong>, and late checkouts decrease standing.
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 px-5 py-3 rounded-2xl text-right shrink-0">
          <div className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">Your Standing</div>
          <div className="text-3xl font-black text-blue-700 dark:text-blue-400">
            {score}<span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <span className={`text-[11px] font-bold ${score >= 90 ? "text-emerald-600" : score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
            {score === 100 ? "★ Pristine 100% Standing" : score >= 85 ? "Sovereign Tier" : score >= 65 ? "Active Maker Tier" : "Needs Punctual Recovery"}
          </span>
        </div>
      </div>

      {/* Initial 100% Baseline & Late Checkout Rule Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300/60 dark:border-emerald-800/60 rounded-2xl p-4.5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Initial 100% Fair Baseline</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Default Baseline</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Every student and citizen starts with an <strong>initial Fair-Share score of 100%</strong>. No one is penalized before they book. Everyone receives equal access from day one.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent border border-amber-300/60 dark:border-amber-800/60 rounded-2xl p-4.5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Late Checkout Decreases Score</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">Live Deduction</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              If a user is <strong>late to checkout or return equipment</strong> past their reserved window, their score immediately starts decreasing. Returning on time restores trust.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Simulation & Test Lab */}
      <section className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Interactive Simulator: Test Late Checkout</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">Test How Late Checkouts Decrease Your Score</h2>
            <p className="text-xs text-slate-400">
              Trigger simulated late returns to see live factor degradation, or restore to 100% pristine baseline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Current Fair Score</span>
              <span className={`text-2xl font-black ${score >= 90 ? "text-emerald-400" : score >= 70 ? "text-blue-400" : "text-amber-400"}`}>
                {score}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleSimulateLate(15, 5)}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">15m Late Return</span>
              <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-md">−5 pts</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Minor delay past scheduled slot end.</p>
          </button>

          <button
            type="button"
            onClick={() => handleSimulateLate(30, 10)}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">30m Late Return</span>
              <span className="text-xs font-extrabold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded-md">−10 pts</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Moderate delay affecting the next booked student.</p>
          </button>

          <button
            type="button"
            onClick={() => handleSimulateLate(60, 20)}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">60m Overdue Return</span>
              <span className="text-xs font-extrabold text-rose-500 bg-rose-950 border border-rose-700 px-2 py-0.5 rounded-md">−20 pts</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Severe delay and reliability downgrade.</p>
          </button>

          <button
            type="button"
            onClick={handleResetBaseline}
            className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Reset to 100% Baseline</span>
              <RotateCcw className="w-4 h-4 text-white" />
            </div>
            <p className="text-[11px] text-indigo-100 mt-1">Clear all penalties & restore pristine standing.</p>
          </button>
        </div>

        {penalties > 0 && (
          <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Active Late Checkout Penalties: <strong>−{penalties} points</strong> recorded against your profile.</span>
            </div>
            <button
              type="button"
              onClick={handleResetBaseline}
              className="text-white bg-rose-800 hover:bg-rose-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Reset to 100%
            </button>
          </div>
        )}
      </section>

      {/* Tier Visual Progress Ladder */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wide">Campus Allocation Tiers</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{score >= 90 ? "Maximum Priority Guaranteed" : `${95 - score} points to Master Fellow (Tier 0)`}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex p-0.5 border border-slate-200 dark:border-slate-700">
          <div className="bg-blue-600 h-full rounded-l-full transition-all" style={{ width: `${score}%` }}></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-full flex-1"></div>
        </div>
        <div className="grid grid-cols-4 text-center text-xs pt-1">
          <div className="border-r border-slate-100 dark:border-slate-800 pr-2">
            <div className="font-bold text-slate-800 dark:text-slate-200">Standard Tier</div>
            <div className="text-[11px] text-slate-400">0 – 50 Pts</div>
          </div>
          <div className="border-r border-slate-100 dark:border-slate-800 px-2">
            <div className="font-bold text-slate-800 dark:text-slate-200">Active Maker</div>
            <div className="text-[11px] text-slate-400">51 – 75 Pts</div>
          </div>
          <div className="border-r border-slate-100 dark:border-slate-800 px-2">
            <div className="font-bold text-blue-700 dark:text-blue-400">Sovereign Tier</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">76 – 94 Pts</div>
          </div>
          <div className="pl-2">
            <div className="font-bold text-emerald-700 dark:text-emerald-400">Master Fellow (100%)</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">95 – 100 Pts</div>
          </div>
        </div>
      </section>

      {/* Primary Score Breakdown & Gauge */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Gauge & Metrics (5 Cols) */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Your Telemetry Gauge</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Calculated in real-time from capability, urgency, need, skills, and return punctuality.</p>
            <div className="flex justify-center py-4">
              <FairGauge factors={me.factors} size={220} />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
            <span>Points adjust dynamically upon checkout inspection and returns.</span>
          </div>
        </section>

        {/* Right Factor Weights (7 Cols) */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">6 Core Factor Composition</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Weighted consensus formula designed to guarantee fairness across campus.</p>
            <FactorBars factors={me.factors} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Decentralized &amp; Audited</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 block">Every manager override logs written justification to public audit logs.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Zero Pay-to-Play</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 block">Money cannot purchase priority. Points reflect campus care and equipment stewardship.</span>
            </div>
          </div>
        </section>
      </div>

      {/* 6 Key Pillars Explained */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">How the 6 Fair-Share Factors Work</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Transparent criteria ensuring labs and spaces go to those who need them most.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-2">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">1. User Capability &amp; Bandwidth</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Ensures shared resources are not monopolized by high-frequency users. Fresh applicants get priority.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 w-fit">
              Weight: 30%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">2. Urgency Level</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Time-sensitive requests with imminent submission deadlines receive an urgency bump during scheduling.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 w-fit">
              Weight: 20%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-2">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">3. Priority Need</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Coursework, capstones, community programs, and flagged priority research rank higher than casual usage.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 w-fit">
              Weight: 20%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">4. Certified Skills</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Safety badges and equipment certifications prove safe operation, minimizing downtime and damage risks.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 w-fit">
              Weight: 15%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">5. On-Time Reliability</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Punctual arrivals, clean workstations, and zero no-shows protect your reputation score.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 w-fit">
              Weight: 15%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center mb-2">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">6. Late Checkout Penalties</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Holding rooms or benches past the scheduled slot immediately decreases your score until punctual returns restore it.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800 w-fit">
              Deductions: Up to −50 pts
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}


