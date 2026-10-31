import React, { useState } from "react";
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  FileText,
  Sparkles
} from "lucide-react";
import type { Resource, User } from "@/data/types";

interface VenueBookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  user: User;
  selectedDate: string;
  selectedRange: { start: string; end: string };
  durationHours: number;
  competingRequestsCount?: number;
  onSubmit: (data: {
    eventName: string;
    expectedAttendees: number;
    purposeCategory: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

const PURPOSE_OPTIONS = [
  "Class",
  "Workshop",
  "Seminar",
  "Club event",
  "Community program",
  "Meeting",
];

export const VenueBookingSheet: React.FC<VenueBookingSheetProps> = ({
  isOpen,
  onClose,
  resource,
  user,
  selectedDate,
  selectedRange,
  durationHours,
  competingRequestsCount = 0,
  onSubmit,
  isLoading = false,
}) => {
  const [eventName, setEventName] = useState("");
  const [attendees, setAttendees] = useState(30);
  const [purposeCategory, setPurposeCategory] = useState("Class");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const capacity = resource.capacity ?? 200;
  const isOverCapacity = attendees > capacity;
  const isInstant = resource.instantConfirm && competingRequestsCount === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;
    onSubmit({
      eventName: eventName.trim(),
      expectedAttendees: attendees,
      purposeCategory,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-250 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-850/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Whole-Venue Booking
              </h2>
              <p className="text-xs text-slate-500">
                {resource.name} · {selectedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Slot summary pill */}
          <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-850/60 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-semibold">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{selectedRange.start} – {selectedRange.end} ({durationHours} hr{durationHours > 1 ? "s" : ""})</span>
            </div>
            {isInstant ? (
              <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[11px]">
                <Zap className="w-3 h-3" /> Instant Confirm
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">Manager review</span>
            )}
          </div>

          {/* Competing request note */}
          {competingRequestsCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{competingRequestsCount} other request(s) for this slot.</span>
                <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80 text-[11px]">
                  Decided by Fair-Share score, not who clicks first. You can still submit your request.
                </p>
              </div>
            </div>
          )}

          {/* Field 1: Event Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Event or Class Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. AI & Robotics Guest Lecture, CSE 301 Lab Demo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Field 2: Expected Attendees + Capacity Indicator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Expected Attendees <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Capacity: <strong className="text-indigo-600 dark:text-indigo-400">{capacity}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={capacity * 2}
                value={attendees}
                onChange={(e) => setAttendees(parseInt(e.target.value) || 0)}
                className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex-1">
                {/* Visual bar */}
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isOverCapacity
                        ? "bg-rose-500"
                        : attendees > capacity * 0.8
                        ? "bg-amber-500"
                        : "bg-teal-500"
                    }`}
                    style={{ width: `${Math.min(100, (attendees / capacity) * 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>Capacity {capacity}</span>
                  <span className={isOverCapacity ? "text-rose-600 font-bold" : "font-medium"}>
                    Your event: {attendees}
                  </span>
                </div>
              </div>
            </div>

            {isOverCapacity && (
              <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Attendance exceeds venue capacity of {capacity}. Please reduce count or request approval.</span>
              </div>
            )}
          </div>

          {/* Field 3: Purpose Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Purpose Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PURPOSE_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPurposeCategory(cat)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                    purposeCategory === cat
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Field 4: Optional Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Special Setup or Equipment Note (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need podium microphone, HDMI projector, and 4 extra chairs."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pre-filled Profile Details Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750 rounded-xl p-3 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pre-filled Applicant Profile
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${user.name}`}
                  alt=""
                  className="w-7 h-7 rounded-full bg-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {user.dept || "Campus Member"} · {user.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200/50">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{user.verified === "verified" ? "Verified" : "Pending ID"}</span>
              </div>
            </div>
          </div>

          {/* Quota nudge */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Quota status: <strong className="text-slate-700 dark:text-slate-300">You've used 2 of 3 bookings this week</strong>.
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !eventName.trim()}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <span>Submitting request...</span>
              ) : isInstant ? (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Confirm Booking Instantly</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Send Booking Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
