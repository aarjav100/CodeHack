import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, CheckCircle2, Timer, Gavel, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Booking, Contest, FairFactors, Weights } from "@/data/types";
import { factorPoints, toMin } from "@/lib/contest";
import { FACTOR_LABELS } from "./shared";

export function useNow(ms = 1000) {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    setT(Date.now());
    const i = setInterval(() => setT(Date.now()), ms);
    return () => clearInterval(i);
  }, [ms]);
  return t;
}

export function timeLeft(iso: string, now: number) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "closing…";
  const h = Math.floor(ms / 36e5), m = Math.floor((ms % 36e5) / 6e4), s = Math.floor((ms % 6e4) / 1e3);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

export function Countdown({ iso, className }: { iso: string; className?: string }) {
  const now = useNow();
  return <span className={cn("tabular-nums", className)} aria-live="off">{now === null ? "…" : timeLeft(iso, now)}</span>;
}

/** Available | In demand (n) + Decision in … | Awaiting decision | Decided */
export function DemandBadge({ contest, className }: { contest?: Contest; className?: string }) {
  if (!contest) return <span className={cn("inline-flex items-center gap-1 rounded-full border border-st-approved/30 bg-st-approved/12 px-2.5 py-0.5 text-xs font-semibold text-st-approved", className)}><CheckCircle2 className="h-3.5 w-3.5" aria-hidden />Available</span>;
  const n = contest.requestIds.length;
  if (contest.status === "decided") return <span className={cn("inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground", className)}><Gavel className="h-3.5 w-3.5" aria-hidden />Decided</span>;
  if (contest.status === "closed") return <span className={cn("inline-flex items-center gap-1 rounded-full border border-st-pending/30 bg-st-pending/12 px-2.5 py-0.5 text-xs font-semibold text-st-pending", className)}><Gavel className="h-3.5 w-3.5" aria-hidden />Awaiting decision · {n} request{n > 1 ? "s" : ""}</span>;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <span className="bg-contested inline-flex items-center gap-1 rounded-full border border-amber/40 px-2.5 py-0.5 text-xs font-bold text-foreground"><Flame className="h-3.5 w-3.5 text-amber" aria-hidden />In demand ({n})</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-st-waitlisted/12 px-2.5 py-0.5 text-xs font-semibold text-st-waitlisted"><Timer className="h-3.5 w-3.5" aria-hidden />Decision in <Countdown iso={contest.windowClosesAt} /></span>
    </span>
  );
}

export function RecommendedBadge() {
  return <span className="inline-flex items-center gap-1 rounded-full border border-teal/30 bg-teal/12 px-2.5 py-0.5 text-xs font-semibold text-teal"><Star className="h-3.5 w-3.5 fill-current" aria-hidden />Recommended</span>;
}

export const FACTOR_COLORS: Record<keyof FairFactors, string> = {
  lowUsage: "bg-chart-1", waiting: "bg-chart-2", purpose: "bg-chart-3", skill: "bg-chart-5", reliability: "bg-st-approved", penalties: "bg-st-rejected",
};

/** Horizontal stacked bar of factor points; penalties shown as a negative segment to the left. */
export function ScoreStack({ factors, w, label }: { factors: FairFactors; w: Weights; label: string }) {
  const p = factorPoints(factors, w);
  const keys = (Object.keys(p) as (keyof FairFactors)[]).filter((k) => k !== "penalties");
  const total = Math.max(0, Math.round(keys.reduce((a, k) => a + p[k], 0) + p.penalties));
  const desc = keys.map((k) => `${FACTOR_LABELS[k].label} ${Math.round(p[k])}`).join(", ") + `, penalties ${Math.round(p.penalties)}. Total ${total}.`;
  return (
    <div role="img" aria-label={`${label}: ${desc}`} className="flex items-center gap-1">
      <div className="flex h-5 w-16 justify-end">{p.penalties < 0 && <div className="h-5 rounded-l bg-st-rejected bar-grow" style={{ width: `${Math.min(100, -p.penalties * 4)}%` }} title={`Penalties ${Math.round(p.penalties)}`} />}</div>
      <div className="flex h-5 flex-1 overflow-hidden rounded-r bg-muted">
        {keys.map((k) => <div key={k} className={cn("h-5 bar-grow", FACTOR_COLORS[k])} style={{ width: `${p[k]}%` }} title={`${FACTOR_LABELS[k].label}: ${Math.round(p[k])}`} />)}
      </div>
    </div>
  );
}

export function FactorLegend() {
  return (
    <ul className="flex flex-wrap gap-3 text-xs" aria-label="Chart legend">
      {(Object.keys(FACTOR_COLORS) as (keyof FairFactors)[]).map((k) => <li key={k} className="inline-flex items-center gap-1.5"><span className={cn("h-3 w-3 rounded-sm", FACTOR_COLORS[k])} aria-hidden />{FACTOR_LABELS[k].label}{k === "penalties" ? " (−)" : ""}</li>)}
    </ul>
  );
}

/** Timeline bar showing how each request overlaps within the contest slot. */
export function OverlapBar({ contest, requests, labels }: { contest: Contest; requests: Booking[]; labels: string[] }) {
  const s0 = toMin(contest.start) - 60, s1 = toMin(contest.end) + 60;
  const span = s1 - s0;
  const hours = [];
  for (let m = Math.ceil(s0 / 60) * 60; m <= s1; m += 60) hours.push(m);
  return (
    <div className="space-y-2" aria-label="Overlap of requested times">
      <div className="relative h-4 text-[10px] text-muted-foreground">
        {hours.map((m) => <span key={m} className="absolute -translate-x-1/2" style={{ left: `${((m - s0) / span) * 100}%` }}>{String(m / 60).padStart(2, "0")}:00</span>)}
      </div>
      {requests.map((r, i) => {
        const a = toMin(r.start), b = a + r.duration * 60;
        return (
          <div key={r.id} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-xs font-medium">{labels[i]}</span>
            <div className="relative h-6 flex-1 rounded-lg bg-muted">
              <div className={cn("absolute inset-y-0 flex items-center rounded-lg px-2 text-[11px] font-semibold text-primary-foreground", i % 2 ? "bg-st-waitlisted" : "bg-primary")} style={{ left: `${((a - s0) / span) * 100}%`, width: `${((b - a) / span) * 100}%` }}>{r.start}–{`${String(Math.floor(b / 60)).padStart(2, "0")}:${String(b % 60).padStart(2, "0")}`}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ContestLink({ c, children }: { c: Contest; children?: React.ReactNode }) {
  return <Link to="/contests/$id" params={{ id: c.id }} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Users className="h-4 w-4" />{children ?? "View contest"}</Link>;
}
