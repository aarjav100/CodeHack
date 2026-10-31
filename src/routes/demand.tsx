import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmptyState, Img, ListSkeleton, fmtD, useFakeLoad } from "@/components/shared";
import { DemandBadge } from "@/components/contest";
import { useApp } from "@/store/app";
import { displayName } from "@/lib/contest";
import { toast } from "sonner";

export const Route = createFileRoute("/demand")({
  head: () => ({
    meta: [
      { title: "Live Campus Demand Matrix — CampusSphare" },
      { name: "description", content: "Real-time occupancy across makerspaces, biological chambers and contested reservations sorted by Fair-Share adjudication." },
      { property: "og:title", content: "Demand Matrix — CampusSphare" },
      { property: "og:description", content: "Live university demand matrix and contested slots." }
    ]
  }),
  component: Demand,
});

function Demand() {
  const { contests, resources, bookings, users, role, seedDemoContest } = useApp();
  const loading = useFakeLoad();
  const [type, setType] = useState("all");
  const [bld, setBld] = useState("all");
  const [date, setDate] = useState("");
  const [show, setShow] = useState("active");
  const [zoneFilter, setZoneFilter] = useState("all");

  const buildings = [...new Set(resources.map((r) => r.location.split(",")[0]))];
  const list = contests
    .filter((c) => (show === "all" || (show === "active" ? c.status !== "decided" : c.status === "decided")) && c.requestIds.length > 0)
    .filter((c) => {
      const r = resources.find((x) => x.id === c.resourceId)!;
      return (type === "all" || r?.type === type) && (bld === "all" || r?.location.startsWith(bld)) && (!date || c.date === date);
    })
    .sort((a, b) => a.windowClosesAt.localeCompare(b.windowClosesAt));

  const zones = [
    {
      id: "A-01",
      name: "Science & Bio Block",
      sub: "Cleanrooms & Centrifuges",
      cat: "academic",
      occupancy: "142 / 160",
      pct: 89,
      status: "busy",
      tag: "Busy · 89%",
      btn: "Join Standby Queue",
      icon: "biotech",
      note: "Free in ~45 mins",
    },
    {
      id: "D-04",
      name: "Design Studios",
      sub: "CAD Rigs & 3D Printers",
      cat: "fabrication",
      occupancy: "22 / 80 (28%)",
      pct: 28,
      status: "open",
      tag: "Open Now · Low Traffic",
      btn: "Instant Unlock Key",
      icon: "precision_manufacturing",
      note: "Bonus Eligible (+10 pts)",
      bonus: true,
    },
    {
      id: "AUD-00",
      name: "Town Hall Auditorium",
      sub: "Civic Assembly & Keynotes",
      cat: "recreation",
      occupancy: "270 / 500 seated",
      pct: 54,
      status: "moderate",
      tag: "Moderate · Event Ongoing",
      btn: "View Live Feed",
      icon: "theater_comedy",
      note: "Open Student Q&A",
    },
    {
      id: "S-09",
      name: "Sports Arena",
      sub: "Badminton, Squash, Yoga",
      cat: "recreation",
      occupancy: "18 / 150 (12%)",
      pct: 12,
      status: "open",
      tag: "Open · Free Courts",
      btn: "Reserve Court",
      icon: "sports_tennis",
      note: "Free slots wide open",
    },
    {
      id: "M-03",
      name: "Media Labs",
      sub: "Acoustic Audio & Video Rigs",
      cat: "fabrication",
      occupancy: "9 / 12 studios",
      pct: 76,
      status: "busy",
      tag: "Busy · 76%",
      btn: "Schedule Slot",
      icon: "mic",
      note: "Studio B opens at 17:30",
    },
  ];

  const filteredZones = zones.filter((z) => zoneFilter === "all" || z.cat === zoneFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* SECTION 1: LIVE CAMPUS DEMAND & SATURATION MATRIX */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Campus Telemetry</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                48/48 Smart Gate Sensors Active
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Campus Demand Matrix</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real-time occupancy across university maker blocks, scientific chambers, and athletic grounds.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl text-xs">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">energy_savings_leaf</span>
              <span className="text-emerald-900 font-medium">
                Tip: Book off-peak (13:00 – 16:00) to earn <strong className="text-emerald-700">+10 bonus Fair-Share points</strong>
              </span>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setZoneFilter("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  zoneFilter === "all" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Zones
              </button>
              <button
                type="button"
                onClick={() => setZoneFilter("academic")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  zoneFilter === "academic" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Academic
              </button>
              <button
                type="button"
                onClick={() => setZoneFilter("fabrication")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  zoneFilter === "fabrication" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Fabrication
              </button>
              <button
                type="button"
                onClick={() => setZoneFilter("recreation")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  zoneFilter === "recreation" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Recreation
              </button>
            </div>
          </div>
        </div>

        {/* 5 Friendly Zone Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredZones.map((z) => (
            <div
              key={z.id}
              className="bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400">ZONE {z.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${
                    z.status === "busy"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : z.status === "moderate"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      z.status === "busy" ? "bg-rose-500" : z.status === "moderate" ? "bg-amber-500" : "bg-emerald-500"
                    }`}></span>
                    {z.tag}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{z.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{z.sub}</p>

                <div className="my-3 space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Occupancy</span>
                    <span className="font-bold text-slate-800">{z.occupancy}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        z.pct > 80 ? "bg-rose-500" : z.pct > 50 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${z.pct}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-[13px] text-blue-600">{z.icon}</span>
                    <span>{z.note}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success(`Action registered for Zone ${z.id} (${z.name})`)}
                className={`w-full py-2 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  z.bonus
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {z.bonus ? "bolt" : "lock_clock"}
                </span>
                <span>{z.btn}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Hourly Dispatch Histogram */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px]">insights</span>
              <span>Demand Forecast (Today)</span>
            </div>
            <h5 className="text-sm font-bold text-slate-900">Optimal Windows: Afternoon Cycles</h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Peak student congestion occurs between 11:00 and 13:00. Booking blue bar intervals guarantees instant admission and off-peak credit rewards.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Optimal (Bonus Window)
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-slate-300"></span> Peak Saturation
              </div>
            </div>
          </div>

          {/* Interactive Chart Bars */}
          <div className="w-full lg:w-2/3 flex flex-col justify-end">
            <div className="h-28 w-full flex items-end gap-2 px-1 pb-1">
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-blue-300 group-hover:bg-blue-600 transition-all rounded-t-md" style={{ height: "25%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">25%</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-blue-300 group-hover:bg-blue-600 transition-all rounded-t-md" style={{ height: "38%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">38%</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-slate-300 group-hover:bg-slate-400 transition-all rounded-t-md" style={{ height: "60%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">60%</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-amber-400 group-hover:bg-amber-500 transition-all rounded-t-md" style={{ height: "78%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">78%</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-rose-400 group-hover:bg-rose-500 transition-all rounded-t-md" style={{ height: "88%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">88% Peak</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all rounded-t-md" style={{ height: "35%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">35% (+10 Pts)</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-blue-600 group-hover:bg-blue-700 transition-all rounded-t-md" style={{ height: "30%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">30% (+10 Pts)</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all rounded-t-md" style={{ height: "42%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">42% (+10 Pts)</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-slate-300 group-hover:bg-slate-400 transition-all rounded-t-md" style={{ height: "65%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">65%</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-blue-400 group-hover:bg-blue-600 transition-all rounded-t-md" style={{ height: "48%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">48%</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all rounded-t-md" style={{ height: "32%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">32%</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all rounded-t-md" style={{ height: "22%" }}></div>
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">22%</div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-1.5 px-1 border-t border-slate-200">
              <span>08:00</span>
              <span>10:00</span>
              <span>12:00</span>
              <span className="text-blue-600 font-bold">14:00 (Bonus Window)</span>
              <span>16:00</span>
              <span>18:00</span>
              <span>20:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CONTESTED SLOTS & FAIR ADJUDICATION */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Fair Adjudication Engine</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                {list.length} Contested Windows
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Multi-Applicant Contested Slots</h2>
            <p className="text-xs text-slate-500">
              When multiple students request the same slot, priority is resolved by Fair-Share community standing at the countdown window.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              seedDemoContest();
              toast.success("Sample 2-person contested window created!");
            }}
            className="rounded-xl text-xs gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" />
            <span>Create Sample Contest</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Select value={show} onValueChange={setShow}>
            <SelectTrigger className="w-36 rounded-xl text-xs" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Open &amp; Reviewing</SelectItem>
              <SelectItem value="decided">Decided</SelectItem>
              <SelectItem value="all">All Contests</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36 rounded-xl text-xs" aria-label="Type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["all", "lab", "hall", "classroom", "equipment"].map((t) => (
                <SelectItem key={t} value={t}>{t === "all" ? "All types" : t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={bld} onValueChange={setBld}>
            <SelectTrigger className="w-48 rounded-xl text-xs" aria-label="Building">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {buildings.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40 rounded-xl text-xs"
            aria-label="Date"
          />
        </div>

        {/* Contests List */}
        {loading ? (
          <ListSkeleton />
        ) : list.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
            <span className="material-symbols-outlined text-amber-500 text-[28px] mb-2">done_all</span>
            <h4 className="text-sm font-bold text-slate-800">No Contested Slots Right Now</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All space requests currently have unique time blocks with zero schedule overlaps.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 pt-2">
            {list.map((c) => {
              const r = resources.find((x) => x.id === c.resourceId)!;
              const reqs = c.requestIds.map((id) => bookings.find((b) => b.id === id)!).filter(Boolean);
              return (
                <li
                  key={c.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 sm:flex-row sm:items-center transition-all"
                >
                  <Img src={r.image} alt={r.name} className="h-20 w-full rounded-xl sm:w-28 object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-500">{fmtD(c.date)} · {c.start}–{c.end}</div>
                    <div className="mt-1.5"><DemandBadge contest={c} /></div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {reqs.map((b) => (
                        <span key={b.id} className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs font-semibold">
                          {displayName(users.find((u) => u.id === b.userId), r.anonymous)} · {b.purposeCategory ?? "Other"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {c.status === "open" && role === "user" && (
                      <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
                        <Link to="/book/$id" params={{ id: r.id }}>Apply for Slot</Link>
                      </Button>
                    )}
                    <Button asChild size="sm" className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700">
                      <Link to="/contests/$id" params={{ id: c.id }}>
                        {["owner", "manager", "admin"].includes(role) && c.status === "closed" ? "Adjudicate" : "View Details"}
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}


