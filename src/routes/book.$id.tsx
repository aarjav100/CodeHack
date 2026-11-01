import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Zap, 
  GraduationCap, 
  X, 
  MapPin, 
  Info,
  Calendar,
  Lock,
  ChevronRight,
  Armchair
} from "lucide-react";
import { useApp, useMe } from "@/store/app";
import { d } from "@/data/mock";
import { DateSlotPicker } from "@/components/booking/DateSlotPicker";
import { SeatMap } from "@/components/booking/SeatMap";
import { StickyBookingBar } from "@/components/booking/StickyBookingBar";
import { VenueTimeline } from "@/components/booking/VenueTimeline";
import { VenueBookingSheet } from "@/components/booking/VenueBookingSheet";
import { BookingConfirmationModal } from "@/components/booking/BookingConfirmationModal";
import { SeatReasonModal } from "@/components/booking/SeatReasonModal";
import type { Booking, Resource, SlotDefinition } from "@/data/types";
import { 
  resolveSeatStatus, 
  DEFAULT_SLOTS, 
  createDefaultLayoutForCapacity 
} from "@/data/cinemaMock";

export const Route = createFileRoute("/book/$id")({
  head: () => ({
    meta: [
      { title: "Book Cinema Style — CampusSphare" },
      { name: "description", content: "Book university labs, stations and venues in 3 taps and under 20 seconds." },
    ],
  }),
  component: CinemaBookPage,
});

function CinemaBookPage() {
  const { id } = Route.useParams();
  const resource = useApp((s) => s.resources.find((x) => x.id === id));
  const bookings = useApp((s) => s.bookings);
  const bookSeat = useApp((s) => s.bookCinemaSeat);
  const bookVenue = useApp((s) => s.bookCinemaVenue);
  const completeTraining = useApp((s) => s.completeTraining);
  const verify = useApp((s) => s.verify);
  const me = useMe();
  const navigate = useNavigate();

  // Mode 1 (Seats) vs Mode 2 (Whole Venue)
  // Normalized: if resource has seatLayout, is lab/equipment, or bookingMode is 'seat'/'seats'
  const isSeatBooking = Boolean(
    resource?.bookingMode === "seat" ||
    resource?.bookingMode === "seats" ||
    resource?.seatLayout ||
    resource?.type === "lab" ||
    resource?.type === "equipment"
  );
  const mode: "seats" | "whole_venue" = isSeatBooking ? "seats" : "whole_venue";

  // Effective slots
  const effectiveSlots = useMemo<SlotDefinition[]>(() => {
    if (resource?.slots && resource.slots.length > 0) return resource.slots;
    return DEFAULT_SLOTS;
  }, [resource]);

  // Effective layout for seats
  const effectiveLayout = useMemo(() => {
    if (resource?.seatLayout && resource.seatLayout.seats && resource.seatLayout.seats.length > 0) {
      return resource.seatLayout;
    }
    if (isSeatBooking && resource) {
      return createDefaultLayoutForCapacity(resource.capacity || 20);
    }
    return null;
  }, [resource, isSeatBooking]);

  const resourceWithLayout = useMemo(() => {
    if (!resource) return null;
    return {
      ...resource,
      seatLayout: effectiveLayout || resource.seatLayout,
      slots: effectiveSlots,
    };
  }, [resource, effectiveLayout, effectiveSlots]);

  // State: Date & Slot
  const [selectedDate, setSelectedDate] = useState<string>(d(0)); // today
  const [selectedSlot, setSelectedSlot] = useState<SlotDefinition>(() => {
    return (resource?.slots && resource.slots[1]) || DEFAULT_SLOTS[1] || DEFAULT_SLOTS[0];
  });
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isWholeLab, setIsWholeLab] = useState(false);

  // Mode 2 State
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>({
    start: "14:00",
    end: "17:00",
  });
  const [isVenueSheetOpen, setIsVenueSheetOpen] = useState(false);

  // Confirmation & Inline Modals
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isInstantConfirmed, setIsInstantConfirmed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [trainingToUnlock, setTrainingToUnlock] = useState<string | null>(null);

  // If resource not found
  if (!resource) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Resource not found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">The lab or hall you're looking for does not exist or has been moved.</p>
        <Link
          to="/discover"
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
        >
          Return to Discover
        </Link>
      </div>
    );
  }

  // Calculate live availability map for all slots (Slot chip counters)
  const slotAvailabilityMap = useMemo(() => {
    if (!effectiveLayout) return {};
    const total = effectiveLayout.seats.filter((s) => !s.isAisle).length;
    const map: Record<string, { free: number; total: number }> = {};

    effectiveSlots.forEach((slot) => {
      let free = 0;
      effectiveLayout.seats.forEach((seat) => {
        if (seat.isAisle) return;
        const status = resolveSeatStatus(
          seat,
          resource,
          selectedDate,
          slot,
          me,
          [],
          bookings
        );
        if (status.state === "available") {
          free++;
        }
      });
      map[slot.id] = { free, total };
    });

    return map;
  }, [effectiveLayout, effectiveSlots, resource, selectedDate, me, bookings]);

  // Check competing requests for the selected slot / range
  const competingRequestsCount = useMemo(() => {
    if (mode === "seats") {
      const activeBookings = bookings.filter(
        (b) => b.resourceId === resource.id && b.date === selectedDate && b.start === selectedSlot.start &&
        (b.status === "pending" || b.status === "waitlisted")
      );
      return activeBookings.length;
    } else if (selectedRange) {
      const activeBookings = bookings.filter(
        (b) => b.resourceId === resource.id && b.date === selectedDate &&
        (b.status === "pending" || b.status === "waitlisted")
      );
      return activeBookings.length;
    }
    return 0;
  }, [bookings, resource.id, selectedDate, selectedSlot.start, selectedRange, mode]);

  // Handle Mode 1: Submit Seat Request - Prompts for Reason of booking
  const handleSeatSubmit = () => {
    if (selectedSeats.length === 0 && !isWholeLab) {
      toast.error("Please pick at least one seat first!");
      return;
    }

    // Check verification banner gate
    if (me.verified === "none") {
      setShowVerifyModal(true);
      return;
    }

    // Prompt user for reason and purpose
    setIsReasonModalOpen(true);
  };

  const handleConfirmSeatReason = (reasonData: { purpose: string; purposeCategory: string }) => {
    try {
      const { booking, isInstant } = bookSeat({
        resourceId: resource.id,
        date: selectedDate,
        slotId: selectedSlot.id,
        seatIds: selectedSeats,
        isWholeLab,
        groupSize: selectedSeats.length,
        purpose: reasonData.purpose,
        purposeCategory: reasonData.purposeCategory,
      });

      setIsReasonModalOpen(false);
      setConfirmedBooking(booking);
      setIsInstantConfirmed(isInstant);
      setShowConfirmation(true);
      toast.success(isInstant ? "Seat Confirmed Instantly!" : "Request Sent for Manager Review!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to book seat");
    }
  };

  // Handle Mode 2: Submit Venue Request
  const handleVenueSubmit = (formData: {
    eventName: string;
    expectedAttendees: number;
    purposeCategory: string;
    notes?: string;
  }) => {
    if (!selectedRange) {
      toast.error("Please pick a time range first!");
      return;
    }

    if (me.verified === "none") {
      setShowVerifyModal(true);
      return;
    }

    try {
      const { booking, isInstant } = bookVenue({
        resourceId: resource.id,
        date: selectedDate,
        start: selectedRange.start,
        end: selectedRange.end,
        eventName: formData.eventName,
        expectedAttendees: formData.expectedAttendees,
        purposeCategory: formData.purposeCategory,
        notes: formData.notes,
      });

      setIsVenueSheetOpen(false);
      setConfirmedBooking(booking);
      setIsInstantConfirmed(isInstant);
      setShowConfirmation(true);
      toast.success(isInstant ? "Venue Reserved Instantly!" : "Venue Request Submitted!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to book venue");
    }
  };

  // Inline Verification Handler
  const handleVerifyNow = () => {
    verify("verified", { email: me.email, enrollment: me.enrollment || "CS-2024-910" });
    setShowVerifyModal(false);
    toast.success("Identity Verified!", {
      description: "College credentials verified. You can now book immediately.",
    });
  };

  // Inline Training Unlock Handler
  const handleUnlockTraining = (skillName: string) => {
    completeTraining(skillName);
    setTrainingToUnlock(null);
    toast.success(`Certified in ${skillName}!`, {
      description: "Station is now unlocked and available for selection.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 pb-36">
      {/* Top Navigation & Resource Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/discover"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Back to Discover"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            {resource.image && (
              <img
                src={resource.image}
                alt={resource.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-750 shadow-2xs shrink-0 hidden sm:block"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {resource.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 flex items-center gap-1">
                  {mode === "seats" ? (
                    <>
                      <Armchair className="w-3 h-3 text-indigo-600" />
                      <span>Cinema Seat Booking</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3 h-3 text-teal-600" />
                      <span>Whole Venue Booking</span>
                    </>
                  )}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{resource.location}</span>
                <span>•</span>
                <span>{resource.dept || "Campus Facilities"}</span>
                {resource.instantConfirm && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                      <Zap className="w-3 h-3 fill-emerald-500" /> Instant Confirm
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>3 Taps &bull; Under 20s</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Verification Friendly Banner if unverified */}
        {me.verified === "none" && (
          <div className="bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-teal-950/40 dark:to-indigo-950/40 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Campus Identity Verification
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  You can browse and select seats now. Verify in 1 minute to confirm your booking.
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs self-start sm:self-auto transition-transform active:scale-95"
            >
              Verify Now (1 min)
            </button>
          </div>
        )}

        {/* Competing Requests Fair-Share Note */}
        {competingRequestsCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">
                {competingRequestsCount} {competingRequestsCount === 1 ? "person has" : "people have"} requested this slot.
              </span>{" "}
              Priority is decided by the <strong>Fair-Share Score</strong> (low usage, academic purpose, reliability), not by who clicked first. You can still submit your request!
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 1: SEAT / STATION BOOKING ("CINEMA STYLE")               */}
        {/* ============================================================== */}
        {mode === "seats" && (
          <div className="space-y-6">
            {/* 1. Date & Time Slot Strip */}
            <DateSlotPicker
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedSeats([]); // reset selection on date change
              }}
              slots={effectiveSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => {
                setSelectedSlot(slot);
                setSelectedSeats([]); // reset selection on slot change
              }}
              slotAvailabilityMap={slotAvailabilityMap}
            />

            {/* 2. Visual Cinema Seat Layout */}
            {resourceWithLayout && (
              <SeatMap
                resource={resourceWithLayout}
                dateStr={selectedDate}
                selectedSlot={selectedSlot}
                currentUser={me}
                bookings={bookings}
                selectedSeats={selectedSeats}
                onToggleSeat={(seatId) => {
                  if (selectedSeats.includes(seatId)) {
                    setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
                  } else {
                    const maxAllowed = resource.rules?.maxSeatsPerBooking ?? 5;
                    if (selectedSeats.length >= maxAllowed) {
                      toast.warning(`Maximum ${maxAllowed} seats per booking rule for this lab.`);
                      return;
                    }
                    setSelectedSeats([...selectedSeats, seatId]);
                    toast.success(`Seat ${seatId} selected`);
                  }
                }}
                onSelectMultipleSeats={(seatIds) => {
                  setSelectedSeats(seatIds);
                  toast.success(`Selected ${seatIds.length} adjacent group seats: ${seatIds.join(", ")}`);
                }}
                isWholeLab={isWholeLab}
                onToggleWholeLab={(val) => {
                  setIsWholeLab(val);
                  if (val && effectiveLayout) {
                    const allFree = effectiveLayout.seats
                      .filter((s) => !s.isAisle)
                      .map((s) => s.id);
                    setSelectedSeats(allFree);
                    toast.success("All lab stations selected for whole-lab reservation");
                  } else {
                    setSelectedSeats([]);
                  }
                }}
                maxSeatsPerBooking={resource.rules?.maxSeatsPerBooking ?? 5}
              />
            )}

            {/* 3. Sticky Bottom Action Bar */}
            <StickyBookingBar
              selectedSeats={selectedSeats}
              dateStr={selectedDate}
              slotLabel={selectedSlot.label}
              resourceName={resource.name}
              isInstantConfirm={Boolean(resource.instantConfirm)}
              weeklyUsedCount={2}
              weeklyMaxQuota={3}
              onSendRequest={handleSeatSubmit}
              isWholeLab={isWholeLab}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: WHOLE-VENUE BOOKING ("SHOW-TIME TIMELINE GRID")        */}
        {/* ============================================================== */}
        {mode === "whole_venue" && (
          <div className="space-y-6">
            <VenueTimeline
              resource={resource}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedRange(null);
              }}
              bookings={bookings}
              selectedRange={selectedRange}
              onSelectRange={setSelectedRange}
              onContinue={() => setIsVenueSheetOpen(true)}
            />

            {/* Bottom Sheet for Venue Event Form */}
            {selectedRange && (
              <VenueBookingSheet
                isOpen={isVenueSheetOpen}
                onClose={() => setIsVenueSheetOpen(false)}
                resource={resource}
                user={me}
                selectedDate={selectedDate}
                selectedRange={selectedRange}
                durationHours={
                  (parseInt(selectedRange.end) - parseInt(selectedRange.start)) || 1
                }
                competingRequestsCount={competingRequestsCount}
                onSubmit={handleVenueSubmit}
              />
            )}

            {/* Sticky bar for Mode 2 when range is picked */}
            {selectedRange && !isVenueSheetOpen && (
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{selectedDate}</span>
                      <span className="text-indigo-600">·</span>
                      <span>{selectedRange.start} – {selectedRange.end}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Venue Capacity: {resource.capacity ?? 200} people · Quota: 2/3 used
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVenueSheetOpen(true)}
                    className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>Enter Event Details & Book</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        booking={confirmedBooking}
        resource={resource}
        isInstant={isInstantConfirmed}
        competingCount={competingRequestsCount}
      />

      {/* Reason for Booking Seat Modal */}
      <SeatReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        resourceName={resource.name}
        dateStr={selectedDate}
        slotLabel={selectedSlot.label || `${selectedSlot.start} - ${selectedSlot.end}`}
        selectedSeats={selectedSeats}
        isWholeLab={isWholeLab}
        isInstantConfirm={Boolean(resource.instantConfirm && competingRequestsCount === 0)}
        competingRequestsCount={competingRequestsCount}
        onSubmit={handleConfirmSeatReason}
      />

      {/* Inline Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verify Campus Identity
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Link your college ID or campus email to confirm bookings instantly.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-left space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{me.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrollment ID</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{me.enrollment || "STU-2024-819"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Later
              </button>
              <button
                onClick={handleVerifyNow}
                className="flex-1 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Verify Instantly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Safety Training Modal */}
      {trainingToUnlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Equipment Safety Training
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                To prevent equipment damage, <strong>{trainingToUnlock}</strong> certification is required for this station.
              </p>
            </div>

            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl p-3 text-xs text-indigo-900 dark:text-indigo-200 text-left space-y-1 border border-indigo-150 dark:border-indigo-900/50">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>3-minute micro-module</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Covers emergency shutoff, filament loading, and bed level calibration.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTrainingToUnlock(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => handleUnlockTraining(trainingToUnlock)}
                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Complete & Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
