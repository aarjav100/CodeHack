import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, XCircle, ArrowLeft, Pencil, Sparkles, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Img, Panel, StatusBadge, fmtD } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { eligibility } from "@/lib/logic";
import { resources as seed } from "@/data/mock";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { DemandBadge, ContestLink } from "@/components/contest";

export const Route = createFileRoute("/resources/$id")({
  loader: ({ params }) => {
    const r = seed.find((x) => x.id === params.id);
    return { name: r?.name ?? "Resource" };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Resource"} — CampusSphare Space Console` },
      { name: "description", content: `House rules, live availability and booking eligibility for ${loaderData?.name ?? "this campus resource"}.` },
      { property: "og:title", content: `${loaderData?.name ?? "Resource"} — CampusSphare` },
      { property: "og:description", content: "Check availability, eligibility and request a booking." }
    ]
  }),
  component: Detail,
});

const FIX: Record<string, { to: string; label: string }> = {
  verified: { to: "/verify", label: "Verify now" },
  skill: { to: "/discover", label: "Find a workshop" },
  student: { to: "/profile", label: "See profile" },
};

function Detail() {
  const { id } = Route.useParams();
  const r = useApp((s) => s.resources.find((x) => x.id === id));
  const allBookings = useApp((s) => s.bookings);
  const bookings = allBookings.filter((b) => b.resourceId === id && ["approved", "active", "pending"].includes(b.status));
  const programs = useApp((s) => s.programs);
  const owner = useApp((s) => s.users.find((u) => u.id === r?.ownerId));
  const role = useApp((s) => s.role);
  const allContests = useApp((s) => s.contests);
  const live = allContests.filter((c) => c.resourceId === id && c.status !== "decided" && c.requestIds.length > 0);
  const me = useMe();

  if (!r) throw notFound();
  const el = eligibility(r, me);

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/discover" className="hover:text-blue-600 transition-colors">Campus Spaces</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-blue-600 transition-colors">{r.dept} · {r.type}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="font-semibold text-slate-900">{r.name}</span>
      </nav>

      {/* Hero Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Info */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Available for Reservation
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {r.location}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px]">groups</span>
                  Up to {r.capacity} seats
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{r.name}</h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xl">
                {r.description}
              </p>

              {/* Contest / Demand Alert if active */}
              {live.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {live.map((c) => (
                    <span key={c.id} className="inline-flex flex-wrap items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs text-amber-900">
                      <DemandBadge contest={c} />
                      <span className="font-medium">{c.date} · {c.start}–{c.end}</span>
                      <ContestLink c={c} />
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Summary Chips */}
              <div className="flex flex-wrap gap-2 pt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">videocam</span>
                  Dual 4K Laser Projection
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">accessible</span>
                  Wheelchair Accessible
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
                  Faculty Supervised Safety
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">key</span>
                  Digital Smart Lock
                </span>
              </div>
            </div>

            {/* Quick Highlights Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Operating Hours</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{r.availability}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Approval Speed</div>
                <div className="text-xs font-semibold text-emerald-600 mt-0.5">&lt; 4 Hours Consensus</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Cost</div>
                <div className="text-xs font-semibold text-blue-600 mt-0.5">Free for Campus Groups</div>
              </div>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[16/10] bg-slate-100 group border border-slate-200">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={r.name}
                src={r.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-1.5 text-xs font-medium bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Camera Feed · Live
                </div>
                <span className="text-xs bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">{r.location.split(",")[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left = Schedule & Details, Right = Eligibility & CTAs */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Availability Calendar */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">7-Day Availability Calendar</h2>
                  <p className="text-xs text-slate-500">Live booking slots &amp; scheduled maintenance</p>
                </div>
              </div>
            </div>
            <AvailabilityCalendar resourceId={r.id} />
          </section>

          {/* House Rules */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-[20px]">policy</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">Civic House Rules &amp; Equipment Safety</h2>
            </div>
            <ul className="list-inside list-disc space-y-1.5 text-xs text-slate-600">
              {r.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Max {r.maxHours} hours continuous booking allowed per citizen.</span>
              <span>Primary Steward: <strong className="text-slate-700">{owner?.name || "Campus Affairs"}</strong></span>
            </div>
          </section>

          {/* Existing Bookings Log */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">history</span>
                <h3 className="text-sm font-bold text-slate-900">Scheduled Reservations</h3>
              </div>
              <span className="text-xs text-slate-400">{bookings.length} active</span>
            </div>
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No active reservations — wide open for scheduling!</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-xs">
                {bookings.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="font-semibold text-slate-800">{fmtD(b.date)}</span>
                      <span className="text-slate-500 ml-2">({b.start} · {b.duration}h)</span>
                      {b.programId && (
                        <span className="ml-2 rounded-md bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 text-[11px]">
                          Program: {programs.find((p) => p.id === b.programId)?.title}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right Sticky Column: Eligibility & Request Space CTA */}
        <div className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified_user</span>
                <h2 className="text-base font-bold text-slate-900">Your Booking Eligibility</h2>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                el.eligible ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {el.eligible ? "100% Ready" : "Prerequisites Needed"}
              </span>
            </div>

            <ul className="space-y-3">
              {el.items.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    {i.met ? (
                      <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-rose-500 text-[18px] shrink-0 mt-0.5">cancel</span>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800">{i.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{i.met ? "Prerequisite met" : "Incomplete requirement"}</div>
                    </div>
                  </div>
                  {!i.met && FIX[i.kind] && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-lg">
                      <Link to={FIX[i.kind].to}>{FIX[i.kind].label}</Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>

            <div className={`rounded-xl p-3 text-xs leading-relaxed ${
              el.eligible ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-amber-50 border border-amber-200 text-amber-800"
            }`}>
              {el.eligible
                ? "You meet every campus requirement. Free instant reservations available."
                : "You may still submit a reservation — outstanding items can be completed before access is released."}
            </div>

            <Button asChild className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98">
              <Link to="/book/$id" params={{ id: r.id }} className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  {r.bookingMode === "whole_venue" ? "calendar_today" : "chair"}
                </span>
                <span>
                  {r.bookingMode === "whole_venue"
                    ? "Book Whole Venue (Timeline)"
                    : "Book Cinema Seat (3 Taps)"}
                </span>
              </Link>
            </Button>

            {(role === "owner" || role === "admin") && (
              <Button asChild variant="outline" className="w-full h-9 rounded-xl text-xs font-semibold">
                <Link to="/resources/new" search={{ edit: r.id }} className="flex items-center justify-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Resource Specifications</span>
                </Link>
              </Button>
            )}
          </section>

          {/* Fair-Share Tip Card */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-blue-600 shrink-0 mt-0.5">balance</span>
            <div className="text-xs text-slate-700">
              <strong className="text-blue-900 block font-semibold mb-0.5">Civic Fair-Share Guarantee</strong>
              Contested reservations are decided by equal community standing and reliability, not speed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


