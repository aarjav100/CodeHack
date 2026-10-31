import { useEffect, useRef, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import {
  BookOpen, Briefcase, Wrench, HeartPulse, Landmark, CheckCircle2, Clock, Hourglass, XCircle,
  PlayCircle, CircleCheckBig, Ban, ShieldCheck, Upload, X, ImageOff, Inbox, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, FairFactors } from "@/data/types";
import { useApp } from "@/store/app";
import { fairScore } from "@/lib/logic";

export const CATS: Record<Category, { label: string; icon: LucideIcon; text: string; bg: string; ring: string; to: string; blurb: string }> = {
  study: { label: "Free Study Center", icon: BookOpen, text: "text-cat-study", bg: "bg-cat-study/10", ring: "border-cat-study/30", to: "/study", blurb: "Book a quiet seat, ask doubts" },
  career: { label: "Career & Motivation", icon: Briefcase, text: "text-cat-career", bg: "bg-cat-career/10", ring: "border-cat-career/30", to: "/speakers", blurb: "Talks by people who've done it" },
  workshop: { label: "Skill Workshops", icon: Wrench, text: "text-cat-workshop", bg: "bg-cat-workshop/10", ring: "border-cat-workshop/30", to: "/workshops", blurb: "Free, certificate courses" },
  health: { label: "Health Camps", icon: HeartPulse, text: "text-cat-health", bg: "bg-cat-health/10", ring: "border-cat-health/30", to: "/health", blurb: "Free checkups, private & safe" },
  scheme: { label: "Scheme Help Desk", icon: Landmark, text: "text-cat-scheme", bg: "bg-cat-scheme/10", ring: "border-cat-scheme/30", to: "/programs", blurb: "Find scholarships & schemes" },
};

const ST: Record<string, { cls: string; icon: LucideIcon; label: string }> = {
  approved: { cls: "bg-st-approved/12 text-st-approved border-st-approved/30", icon: CheckCircle2, label: "Approved" },
  pending: { cls: "bg-st-pending/12 text-st-pending border-st-pending/30", icon: Clock, label: "Pending" },
  waitlisted: { cls: "bg-st-waitlisted/12 text-st-waitlisted border-st-waitlisted/30", icon: Hourglass, label: "Waitlisted" },
  rejected: { cls: "bg-st-rejected/12 text-st-rejected border-st-rejected/30", icon: XCircle, label: "Rejected" },
  active: { cls: "bg-st-active/12 text-st-active border-st-active/30", icon: PlayCircle, label: "Active" },
  completed: { cls: "bg-st-completed/12 text-st-completed border-st-completed/30", icon: CircleCheckBig, label: "Completed" },
  cancelled: { cls: "bg-st-completed/12 text-st-completed border-st-completed/30", icon: Ban, label: "Cancelled" },
  open: { cls: "bg-st-rejected/12 text-st-rejected border-st-rejected/30", icon: XCircle, label: "Open" },
  reviewing: { cls: "bg-st-pending/12 text-st-pending border-st-pending/30", icon: Clock, label: "Reviewing" },
  resolved: { cls: "bg-st-approved/12 text-st-approved border-st-approved/30", icon: CheckCircle2, label: "Resolved" },
  waiting: { cls: "bg-st-pending/12 text-st-pending border-st-pending/30", icon: Clock, label: "Waiting" },
  helping: { cls: "bg-st-active/12 text-st-active border-st-active/30", icon: PlayCircle, label: "Being helped" },
  served: { cls: "bg-st-approved/12 text-st-approved border-st-approved/30", icon: CheckCircle2, label: "Served" },
  sent: { cls: "bg-st-pending/12 text-st-pending border-st-pending/30", icon: Clock, label: "Awaiting reply" },
  accepted: { cls: "bg-st-approved/12 text-st-approved border-st-approved/30", icon: CheckCircle2, label: "Accepted" },
  declined: { cls: "bg-st-rejected/12 text-st-rejected border-st-rejected/30", icon: XCircle, label: "Declined" },
  reschedule: { cls: "bg-st-waitlisted/12 text-st-waitlisted border-st-waitlisted/30", icon: Hourglass, label: "New time suggested" },
  upcoming: { cls: "bg-st-active/12 text-st-active border-st-active/30", icon: Clock, label: "Upcoming" },
  done: { cls: "bg-st-completed/12 text-st-completed border-st-completed/30", icon: CircleCheckBig, label: "Done" },
  verified: { cls: "bg-st-approved/12 text-st-approved border-st-approved/30", icon: ShieldCheck, label: "Verified" },
  none: { cls: "bg-muted text-muted-foreground border-border", icon: ShieldCheck, label: "Not verified" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = ST[status] ?? ST.pending;
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", s.cls, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {status === "pending" && s.label === "Pending" ? "Pending" : s.label}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-st-approved/12 px-2 py-0.5 text-xs font-semibold text-st-approved" title="Identity verified">
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Verified
    </span>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: string; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</div>}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className, title, action }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-soft", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Counter({ value, suffix = "", duration = 1200 }: { value: number; suffix?: string; duration?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setV(value);
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{v.toLocaleString("en-IN")}{suffix}</>;
}

export function StatCard({ label, value, icon: Icon, tone = "text-primary bg-primary/10", suffix, hint }: { label: string; value: number; icon: LucideIcon; tone?: string; suffix?: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", tone)}><Icon className="h-4.5 w-4.5" aria-hidden /></span>
      </div>
      <div className="mt-2 font-display text-2xl font-bold"><Counter value={value} suffix={suffix} /></div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, body, action }: { icon?: LucideIcon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
      <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-7 w-7" aria-hidden /></span>
      <h3 className="font-semibold">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
    </div>
  );
}

/** Simulates a short load so lists show skeleton → content */
export function useFakeLoad(ms = 350) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

export function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (err) return <div className={cn("grid place-items-center bg-brand text-primary-foreground", className)} role="img" aria-label={alt}><ImageOff className="h-8 w-8 opacity-70" /></div>;
  return <img src={src} alt={alt} className={cn("object-cover", className)} loading="lazy" onError={() => setErr(true)} />;
}

export function Timeline({ events }: { events: { at: string; actor: string; text: string }[] }) {
  return (
    <ol className="relative ml-2 border-l pl-5">
      {events.map((e, i) => (
        <li key={i} className="mb-4 last:mb-0">
          <span className="absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary" aria-hidden />
          <div className="text-sm font-medium">{e.text}</div>
          <div className="text-xs text-muted-foreground">{e.actor} · {fmtDT(e.at)}</div>
        </li>
      ))}
    </ol>
  );
}

export const fmtDT = (iso: string) => format(parseISO(iso), "d MMM, h:mm a");
export const fmtD = (ymd: string) => format(parseISO(ymd), "EEE, d MMM");

export function PhotoDrop({ value, onChange, label = "Drop photos here or click to upload", max = 4 }: { value: string[]; onChange: (v: string[]) => void; label?: string; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const add = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, max - value.length).map((f) => URL.createObjectURL(f));
    onChange([...value, ...urls]);
  };
  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        className={cn("flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm text-muted-foreground transition-colors", over ? "border-primary bg-primary/5" : "hover:border-primary/50")}
      >
        <Upload className="h-6 w-6" aria-hidden />
        {label}
        <span className="text-xs">PNG or JPG, up to {max}</span>
      </button>
      <input ref={ref} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => add(e.target.files)} aria-label={label} />
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((u, i) => (
            <div key={u} className="relative">
              <img src={u} alt={`Upload ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => onChange(value.filter((x) => x !== u))} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-foreground text-background"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FairGauge({ factors, size = 160 }: { factors: FairFactors; size?: number }) {
  const w = useApp((s) => s.weights);
  const score = fairScore(factors, w);
  const r = size / 2 - 12;
  const c = Math.PI * r;
  const tone = score >= 70 ? "var(--st-approved)" : score >= 45 ? "var(--st-pending)" : "var(--st-rejected)";
  return (
    <div className="relative" style={{ width: size, height: size / 2 + 20 }} role="img" aria-label={`Fair-Share Score ${score} out of 100`}>
      <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
        <path d={`M12 ${size / 2} A ${r} ${r} 0 0 1 ${size - 12} ${size / 2}`} fill="none" stroke="var(--muted)" strokeWidth="12" strokeLinecap="round" />
        <path d={`M12 ${size / 2} A ${r} ${r} 0 0 1 ${size - 12} ${size / 2}`} fill="none" stroke={tone} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset 600ms ease" }} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-display text-3xl font-bold leading-none">{score}</div>
        <div className="text-xs text-muted-foreground">of 100</div>
      </div>
    </div>
  );
}

export const FACTOR_LABELS: Record<string, { label: string; help: string }> = {
  capability: { label: "User Capability", help: "Demonstrated user capacity, track record and fair bandwidth." },
  urgency: { label: "Urgency Level", help: "Time-sensitivity of current project, deadline or emergency need." },
  need: { label: "Priority Need", help: "Academic requirement, capstone research or verified community need." },
  skill: { label: "Skills & Training", help: "Verified safety badges, lab certifications and proficiency badges." },
  reliability: { label: "On-Time Reliability", help: "Punctuality record for timely check-in and checkout." },
  penalties: { label: "Late Checkout Penalties", help: "Deductions for returning past scheduled slot end time." },
  lowUsage: { label: "Low recent usage", help: "You haven't used many shared resources lately." },
  waiting: { label: "Waiting time", help: "How long you've been waiting or were waitlisted before." },
  purpose: { label: "Purpose", help: "Learning, community or coursework purposes score higher." },
};

export function FactorBars({ factors }: { factors: FairFactors }) {
  const displayFactors = [
    {
      key: "capability",
      label: "User Capability",
      value: factors.capability ?? factors.lowUsage ?? 100,
      isPenalty: false,
      desc: "User capacity & bandwidth",
    },
    {
      key: "urgency",
      label: "Urgency Level",
      value: factors.urgency ?? factors.waiting ?? 100,
      isPenalty: false,
      desc: "Time sensitivity of booking",
    },
    {
      key: "need",
      label: "Priority Need",
      value: factors.need ?? factors.purpose ?? 100,
      isPenalty: false,
      desc: "Academic & project need",
    },
    {
      key: "skill",
      label: "Skills & Badges",
      value: factors.skill ?? 100,
      isPenalty: false,
      desc: "Verified lab certifications",
    },
    {
      key: "reliability",
      label: "On-Time Reliability",
      value: factors.reliability ?? 100,
      isPenalty: false,
      desc: "Punctual check-in & checkout history",
    },
    {
      key: "penalties",
      label: "Late Checkout Penalties",
      value: factors.penalties ?? 0,
      isPenalty: true,
      desc: "Deductions from delayed returns",
    },
  ];

  return (
    <ul className="space-y-3">
      {displayFactors.map((item) => (
        <li key={item.key}>
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
              <span className="text-slate-400 block text-[11px]">{item.desc}</span>
            </div>
            <span
              className={cn(
                "font-bold text-xs px-2 py-0.5 rounded-md",
                item.isPenalty
                  ? item.value > 0
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              )}
            >
              {item.isPenalty ? (item.value > 0 ? `−${item.value} pts` : "0 (Clean)") : `${item.value}%`}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                item.isPenalty
                  ? "bg-rose-500"
                  : item.value >= 80
                  ? "bg-blue-600"
                  : item.value >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
              )}
              style={{ width: `${Math.min(100, item.value)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Field({ label, error, children, hint, htmlFor }: { label: string; error?: string; children: ReactNode; hint?: string; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
