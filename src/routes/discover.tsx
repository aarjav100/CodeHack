import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Users, MapPin, SearchX, CheckCircle2, Lock, Scale, Building2,
  Clock, Sparkles, ShieldCheck, ArrowRight, Zap, Check, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, Img, ListSkeleton } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { eligibility } from "@/lib/logic";
import { DemandBadge } from "@/components/contest";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover spaces & equipment — CampusSphare" },
      { name: "description", content: "Search labs, halls, classrooms and equipment you can request with fair-share allocation." },
      { property: "og:title", content: "Discover spaces — CampusSphare" },
      { property: "og:description", content: "Search labs, halls and equipment." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const resources = useApp((s) => s.resources);
  const contests = useApp((s) => s.contests);
  const me = useMe();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [minCap, setMinCap] = useState("0");

  const list = useMemo(
    () =>
      resources.filter(
        (r) =>
          (type === "all" || r.type === type) &&
          r.capacity >= Number(minCap) &&
          (!q || `${r.name} ${r.dept} ${r.description} ${r.location}`.toLowerCase().includes(q.toLowerCase())) &&
          (!onlyEligible || eligibility(r, me).eligible)
      ),
    [resources, q, type, onlyEligible, minCap, me]
  );

  return (
    <div className="space-y-6">
      {/* Human Friendly Metric & Vitals Bar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Metric 1 */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Available Today</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {resources.length - 2} <span className="text-xs font-normal text-slate-500">of {resources.length} spaces</span>
                </div>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

            {/* Metric 2 */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Instant Booking</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Open for Booking</div>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 md:block" />

            {/* Metric 3 */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Digital Access</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Quick Check-in Ready</div>
              </div>
            </div>
          </div>

          {/* Fairness Guarantee Badge */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Fair Campus Allocation: Guaranteed</span>
          </div>
        </div>
      </section>

      {/* Clean Tactile Category Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0" id="resource-tabs">
            {[
              { id: "all", label: `All Spaces (${resources.length})` },
              { id: "lab", label: `Study & Labs (${resources.filter((r) => r.type === "lab").length})` },
              { id: "hall", label: `Halls & Stages (${resources.filter((r) => r.type === "hall").length})` },
              { id: "equipment", label: `Equipment & Bays (${resources.filter((r) => r.type === "equipment").length})` },
              { id: "classroom", label: `Classrooms & Studios (${resources.filter((r) => r.type === "classroom").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setType(tab.id)}
                className={cn(
                  "whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                  type === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Availability & Search Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px] flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search spaces or equipment..."
                className="h-8.5 rounded-xl border-slate-200 pl-8.5 text-xs dark:border-slate-800"
              />
            </div>

            <Select value={minCap} onValueChange={setMinCap}>
              <SelectTrigger className="h-8.5 w-32 rounded-xl text-xs dark:border-slate-800" aria-label="Capacity">
                <SelectValue placeholder="Capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any capacity</SelectItem>
                <SelectItem value="10">10+ people</SelectItem>
                <SelectItem value="30">30+ people</SelectItem>
                <SelectItem value="100">100+ people</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={() => setOnlyEligible(!onlyEligible)}
              className={cn(
                "flex h-8.5 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors",
                onlyEligible
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-card dark:text-slate-300"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Eligible for me</span>
            </button>
          </div>
        </div>
      </section>

      {/* Bento Resource Grid */}
      {list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No spaces found"
          body="Try clearing your search query or loosening the filters."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setType("all");
                setOnlyEligible(false);
                setMinCap("0");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((r, index) => {
            const el = eligibility(r, me);
            const unmet = el.items.filter((i) => !i.met).length;
            const liveContest = contests.find((c) => c.resourceId === r.id && c.status !== "decided" && c.requestIds.length > 0);

            return (
              <article
                key={r.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-card hover:border-slate-300 hover:shadow-md transition-all dark:border-slate-800 dark:bg-card dark:hover:border-slate-700"
              >
                <div>
                  {/* Top Row Status Badges */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                      {r.dept} · {r.type.toUpperCase()}
                    </span>

                    {liveContest ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <Zap className="h-3 w-3 text-amber-600 animate-bounce" /> Contested slot
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available Now
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative mb-4 h-44 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Img
                      src={r.image}
                      alt={r.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-white/95 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm dark:bg-slate-900/90 dark:text-slate-200">
                      <MapPin className="mr-1 inline h-3 w-3 text-slate-500" />
                      {r.location}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                    {r.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed dark:text-slate-400">
                    {r.description}
                  </p>

                  {/* Key Spec Badges Box with Next free slot & free seats chip */}
                  <div className="mt-3.5 space-y-2">
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800/80 dark:bg-slate-900/50">
                      <div>
                        <span className="block text-[10px] font-medium text-slate-400 uppercase">Capacity</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.capacity} {r.bookingMode === "whole_venue" ? "People" : "Seats"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-medium text-slate-400 uppercase">Mode</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {r.bookingMode === "whole_venue" ? "Timeline" : "Cinema"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-medium text-slate-400 uppercase">Booking</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {r.instantConfirm ? "Instant" : "Fast-Review"}
                        </span>
                      </div>
                    </div>

                    {/* Live Cinema Chips: Next Free Slot & Free Today */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                        <Check className="w-3 h-3" />
                        {r.bookingMode === "whole_venue" ? "Hall open today" : `${r.id === "comp-lab-4" ? "24" : Math.max(2, r.capacity - 5)} seats free today`}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                        <Clock className="w-3 h-3" />
                        Next free: 11:00
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
                  <div className="text-xs">
                    {unmet === 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> All criteria met
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                        <Lock className="h-3.5 w-3.5" /> {unmet} criteria needed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="h-8.5 rounded-xl text-xs">
                      <Link to="/resources/$id" params={{ id: r.id }}>
                        Details
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="h-8.5 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
                      <Link to="/book/$id" params={{ id: r.id }}>
                        Book Space
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

