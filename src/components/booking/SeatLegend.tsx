import React from "react";
import { Check, Lock, Clock, Wrench, Shield, Calendar, Plus } from "lucide-react";

export function SeatLegend() {
  const items = [
    {
      state: "available",
      label: "Available",
      icon: Plus,
      color: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300",
      description: "Ready to book in 1 tap",
    },
    {
      state: "selected",
      label: "Selected by you",
      icon: Check,
      color: "border-indigo-600 bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30",
      description: "In your active selection",
    },
    {
      state: "requested",
      label: "Requested (in demand)",
      icon: Clock,
      color: "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.15)_50%,transparent_75%,transparent)] bg-[length:8px_8px]",
      description: "Competing requests · Fair-Share queue",
    },
    {
      state: "booked",
      label: "Booked",
      icon: Lock,
      color: "border-slate-300 bg-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 cursor-not-allowed",
      description: "Reserved by another student",
    },
    {
      state: "maintenance",
      label: "Maintenance",
      icon: Wrench,
      color: "border-slate-300 bg-slate-100 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 bg-[repeating-linear-gradient(45deg,#cbd5e1,#cbd5e1_2px,transparent_2px,transparent_6px)]",
      description: "Under hardware calibration",
    },
    {
      state: "locked",
      label: "Training required",
      icon: Shield,
      color: "border-dashed border-rose-400 bg-rose-50/70 text-rose-700 dark:bg-rose-950/30 dark:border-rose-700 dark:text-rose-300",
      description: "Tap to view free safety workshop",
    },
    {
      state: "event_reserved",
      label: "Reserved for class/event",
      icon: Calendar,
      color: "border-purple-300 bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300",
      description: "Reserved for university program",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-sm dark:border-slate-800 dark:bg-card/80">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
        Seat States &amp; Visual Legend (Icons + Colors + Patterns)
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.state}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              title={item.description}
            >
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-bold transition-all ${item.color}`}
              >
                <Icon className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
