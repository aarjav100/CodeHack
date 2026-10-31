import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Armchair, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  Zap,
  Grid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, PageHeader, Panel, PhotoDrop } from "@/components/shared";
import { useApp } from "@/store/app";
import type { BookingMode, Requirement, Resource, SeatLayout } from "@/data/types";
import { SeatLayoutEditor } from "@/components/booking/SeatLayoutEditor";
import { createComputerLabLayout, DEFAULT_SLOTS } from "@/data/cinemaMock";

export const Route = createFileRoute("/resources/new")({
  validateSearch: z.object({ edit: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "List a Resource — CampusSphare" },
      { name: "description", content: "Add a cinema-style lab, workshop, or seminar hall with visual seat editor." },
    ],
  }),
  component: NewResource,
});

const REQS: Requirement[] = [
  { id: "r-ver", label: "Identity verified", kind: "verified" },
  { id: "r-stu", label: "Enrolled college student", kind: "student" },
  { id: "r-safe", label: "Lab Safety badge", kind: "skill", skill: "Lab Safety" },
  { id: "r-cb", label: "Computer Basics badge", kind: "skill", skill: "Computer Basics" },
  { id: "r-cam", label: "Camera Handling badge", kind: "skill", skill: "Camera Handling" },
  { id: "r-3d", label: "3D Printer Safety badge", kind: "skill", skill: "3D Printer Safety" },
];

function NewResource() {
  const { edit } = Route.useSearch();
  const existing = useApp((s) => s.resources.find((r) => r.id === edit));
  const { addResource, updateResource } = useApp();
  const nav = useNavigate();

  // Mode state
  const [bookingMode, setBookingMode] = useState<BookingMode>(
    existing?.bookingMode || (existing?.type === "hall" ? "whole_venue" : "seats")
  );

  // Seat Layout State
  const [seatLayout, setSeatLayout] = useState<SeatLayout>(
    existing?.seatLayout || createComputerLabLayout(6, 5)
  );

  const [instantConfirm, setInstantConfirm] = useState<boolean>(
    existing?.instantConfirm ?? true
  );

  const [maxSeats, setMaxSeats] = useState<number>(
    existing?.rules?.maxSeatsPerBooking ?? 5
  );

  const [f, setF] = useState({
    name: existing?.name ?? "",
    type: existing?.type ?? "lab",
    dept: existing?.dept ?? "",
    location: existing?.location ?? "",
    capacity: String(existing?.capacity ?? 30),
    description: existing?.description ?? "",
    rules: Array.isArray(existing?.rules) ? existing?.rules.join("\n") : "",
    availability: existing?.availability ?? "Mon–Sat, 9:00 AM – 6:00 PM",
    maxHours: String(existing?.maxHours ?? 3),
    checklist: existing?.checklist.join("\n") ?? "Station cleaned\nEquipment powered down\nNo personal items left",
  });

  const [reqs, setReqs] = useState<string[]>(existing?.requirements.map((r) => r.id) ?? ["r-ver"]);
  const [windowHours, setWindowHours] = useState(String(existing?.windowHours ?? 24));
  const [anonymous, setAnonymous] = useState(Boolean(existing?.anonymous));
  const [firstCome, setFirstCome] = useState(existing?.firstComeIfAlone ?? true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [err, setErr] = useState<Record<string, string>>({});

  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const save = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = "Name needs at least 3 characters";
    if (!f.location.trim()) e.location = "Where is it located?";
    if (!(Number(f.capacity) > 0)) e.capacity = "Capacity must be at least 1";
    if (f.description.trim().length < 15) e.description = "Describe it in at least 15 characters";
    setErr(e);
    if (Object.keys(e).length) return;

    const data: Omit<Resource, "id" | "ownerId"> = {
      name: f.name,
      type: f.type as Resource["type"],
      dept: f.dept || "Campus Facilities",
      location: f.location,
      capacity: bookingMode === "seats" ? seatLayout.seats.filter((s) => !s.isAisle).length : Number(f.capacity),
      image: photos[0] ?? existing?.image ?? "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=70",
      description: f.description,
      rules: {
        maxSeatsPerBooking: maxSeats,
        allowWholeLabBooking: true,
      },
      availability: f.availability,
      maxHours: Number(f.maxHours) || 3,
      checklist: f.checklist.split("\n").filter(Boolean).length ? f.checklist.split("\n").filter(Boolean) : ["Space clean", "Equipment working"],
      requirements: REQS.filter((r) => reqs.includes(r.id)),
      windowHours: Number(windowHours),
      anonymous,
      firstComeIfAlone: firstCome,
      bookingMode,
      seatLayout: bookingMode === "seats" ? seatLayout : undefined,
      instantConfirm,
      slots: DEFAULT_SLOTS,
    };

    if (existing) {
      updateResource(existing.id, data);
      toast.success("Resource updated successfully!");
      nav({ to: "/resources/$id", params: { id: existing.id } });
    } else {
      const id = addResource(data);
      toast.success("New resource listed!", {
        description: `Configured in ${bookingMode === "seats" ? "Cinema Seat" : "Whole-Venue"} mode.`,
      });
      nav({ to: "/resources/$id", params: { id } });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <PageHeader
        title={existing ? `Edit ${existing.name}` : "Add Campus Resource"}
        subtitle="Configure cinema-style seating or whole-venue time blocks for students and faculty."
      />

      {/* 1. VISUAL MODE PICKER */}
      <Panel title="Step 1: Choose Booking Experience Mode">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Mode 1: Seats */}
          <button
            type="button"
            onClick={() => {
              setBookingMode("seats");
              setF({ ...f, type: "lab" });
            }}
            className={`p-5 rounded-2xl border text-left transition-all relative ${
              bookingMode === "seats"
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20"
                : "border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400"
            }`}
          >
            {bookingMode === "seats" && (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 absolute top-4 right-4" />
            )}
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-3">
              <Armchair className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mode 1: Seat / Station Booking
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              "Cinema Style" visual room layout. Students pick individual computers, benches, or 3D printers with live free counters.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Includes Visual Seat Editor</span>
            </div>
          </button>

          {/* Mode 2: Whole Venue */}
          <button
            type="button"
            onClick={() => {
              setBookingMode("whole_venue");
              setF({ ...f, type: "hall" });
            }}
            className={`p-5 rounded-2xl border text-left transition-all relative ${
              bookingMode === "whole_venue"
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20"
                : "border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400"
            }`}
          >
            {bookingMode === "whole_venue" && (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 absolute top-4 right-4" />
            )}
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mode 2: Whole-Venue Booking
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              "Show-Time Timeline" grid for seminar halls, auditoriums, and entire classrooms booked for classes and events.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Presets & Capacity Tracking</span>
            </div>
          </button>
        </div>
      </Panel>

      {/* 2. MODE-SPECIFIC EDITOR */}
      {bookingMode === "seats" && (
        <Panel title="Step 2: Room Layout & Station Setup">
          <SeatLayoutEditor
            layout={seatLayout}
            onChange={setSeatLayout}
            instantConfirm={instantConfirm}
            onToggleInstantConfirm={setInstantConfirm}
            maxSeatsPerPerson={maxSeats}
            onChangeMaxSeats={setMaxSeats}
          />
        </Panel>
      )}

      {/* 3. BASIC DETAILS */}
      <Panel title="Step 3: Basic Details & Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Resource Name" error={err.name} htmlFor="n">
            <Input id="n" placeholder="e.g. Computer Lab 4, Electronics Lab" value={f.name} onChange={up("name")} />
          </Field>
          <Field label="Category Type">
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as Resource["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["lab", "hall", "classroom", "equipment"].map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Managing Department" htmlFor="dp">
            <Input id="dp" placeholder="e.g. Computer Science, Mechanical Eng." value={f.dept} onChange={up("dept")} />
          </Field>
          <Field label="Campus Location" error={err.location} htmlFor="lc">
            <Input id="lc" placeholder="e.g. Tech Block A, Floor 2" value={f.location} onChange={up("location")} />
          </Field>
          {bookingMode === "whole_venue" && (
            <Field label="Total Venue Capacity" error={err.capacity} htmlFor="cp">
              <Input id="cp" type="number" value={f.capacity} onChange={up("capacity")} />
            </Field>
          )}
          <Field label="Max Hours Per Booking" htmlFor="mh">
            <Input id="mh" type="number" value={f.maxHours} onChange={up("maxHours")} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description" error={err.description} htmlFor="ds">
            <Textarea
              id="ds"
              rows={3}
              placeholder="Provide key details, available equipment, and who can use this space..."
              value={f.description}
              onChange={up("description")}
            />
          </Field>
        </div>
      </Panel>

      {/* 4. OPERATING RULES & REQS */}
      <Panel title="Operating Rules & Safety Certification">
        <div className="space-y-4">
          <Field label="Open Hours & Availability" htmlFor="av">
            <Input id="av" value={f.availability} onChange={up("availability")} />
          </Field>
          <Field label="Room Rules (one per line)" htmlFor="ru">
            <Textarea id="ru" rows={3} value={f.rules} onChange={up("rules")} />
          </Field>
          <div className="pt-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Prerequisite Eligibility Requirements
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {REQS.map((r) => (
                <label key={r.id} className="flex items-center gap-2 rounded-xl border p-3 text-xs bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800">
                  <Checkbox
                    checked={reqs.includes(r.id)}
                    onCheckedChange={(c) => setReqs(c ? [...reqs, r.id] : reqs.filter((x) => x !== r.id))}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* 5. REQUEST WINDOW & COMPETING POLICIES */}
      <Panel title="Competing Requests & Window Settings">
        <div className="space-y-4">
          <Field label="Request Collection Window" hint="How long requests are collected before Fair-Share scores lock.">
            <Select value={windowHours} onValueChange={setWindowHours}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["6", "12", "24", "48"].map((h) => (
                  <SelectItem key={h} value={h}>{h} hours (standard)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <label className="flex items-center justify-between gap-3 rounded-xl border p-3 text-xs bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Instant Confirm (No Competition)</span>
              <span className="block text-slate-500 text-[11px] mt-0.5">
                Automatically confirm bookings if no competing request is in demand for the slot.
              </span>
            </div>
            <Switch checked={instantConfirm} onCheckedChange={setInstantConfirm} />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border p-3 text-xs bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Anonymous Applicants</span>
              <span className="block text-slate-500 text-[11px] mt-0.5">
                Publicly show "Anonymous applicant" to avoid social pressure or bias.
              </span>
            </div>
            <Switch checked={anonymous} onCheckedChange={setAnonymous} />
          </label>
        </div>
      </Panel>

      {/* Submit Button */}
      <Button
        size="lg"
        className="w-full py-4 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20"
        onClick={save}
      >
        {existing ? "Save Resource Changes" : "Publish Resource & Activate Booking Mode"}
      </Button>
    </div>
  );
}
