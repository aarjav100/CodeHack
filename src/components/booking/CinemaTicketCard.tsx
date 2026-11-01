import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  QrCode, 
  MapPin, 
  Calendar, 
  Building2, 
  Monitor, 
  Printer, 
  Cpu, 
  Share2, 
  ChevronRight,
  Sparkles,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import type { Booking, Resource } from "@/data/types";

interface CinemaTicketCardProps {
  booking: Booking;
  resource?: Resource;
  onCancel: (bookingId: string) => void;
  onExtend: (bookingId: string, hours: number) => void;
  onCheckIn?: (bookingId: string) => void;
}

export const CinemaTicketCard: React.FC<CinemaTicketCardProps> = ({
  booking,
  resource,
  onCancel,
  onExtend,
  onCheckIn,
}) => {
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [extendHours, setExtendHours] = useState(1);

  const isConfirmed = booking.status === "approved";
  const isPending = booking.status === "pending";
  const isWaitlisted = booking.status === "waitlisted";
  const isRejected = booking.status === "rejected";
  const isCancelled = booking.status === "cancelled";

  // Pick resource icon
  const getResourceIcon = () => {
    if (!resource) return <Building2 className="w-5 h-5 text-indigo-600" />;
    if (resource.id.includes("computer") || resource.type === "lab") {
      return <Monitor className="w-5 h-5 text-indigo-600" />;
    }
    if (resource.id.includes("printer")) {
      return <Printer className="w-5 h-5 text-teal-600" />;
    }
    if (resource.id.includes("electronic")) {
      return <Cpu className="w-5 h-5 text-amber-600" />;
    }
    return <Building2 className="w-5 h-5 text-indigo-600" />;
  };

  // Status Chip
  const renderStatusChip = () => {
    if (isConfirmed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Confirmed
        </span>
      );
    }
    if (isWaitlisted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300/50">
          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          Waitlist #{booking.waitPos ?? 1}
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/50">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          Not Approved
        </span>
      );
    }
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50">
          Cancelled
        </span>
      );
    }
    if (booking.contestId) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/50">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          In Demand
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        Manager Review
      </span>
    );
  };

  const ticketCode = booking.ticketCode || `CS-${booking.id.toUpperCase()}`;
  const seatsList = booking.seats && booking.seats.length > 0 ? booking.seats.join(", ") : null;

  return (
    <>
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
        {/* Top Decorative Cinema Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-teal-500 to-indigo-600" />

        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Main Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getResourceIcon()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {resource?.name || "Campus Facility"}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    <span>{resource?.location || "Main Campus"}</span>
                  </div>
                </div>
              </div>
              {renderStatusChip()}
            </div>

            {/* Cinema Seat / Venue Big Highlight Box */}
            <div className="bg-slate-50 dark:bg-slate-850/80 rounded-2xl p-3.5 border border-slate-250 dark:border-slate-750 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {booking.bookingMode === "whole_venue" || booking.isWholeLab ? "Venue Space" : "Allocated Station / Seat"}
                </div>
                <div className="text-lg font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  {booking.isWholeLab ? (
                    <span>Entire Lab Reserved</span>
                  ) : seatsList ? (
                    <span>Seat {seatsList}</span>
                  ) : booking.eventName ? (
                    <span>{booking.eventName}</span>
                  ) : (
                    <span>Whole Venue</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Date & Time
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{booking.date} · {booking.start}</span>
                  <span className="text-slate-400">({booking.duration}h)</span>
                </div>
              </div>
            </div>

            {/* Plain-Language Reason / Status note */}
            {(booking.reason || booking.purpose) && (
              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-150 dark:border-indigo-900/40 rounded-xl p-2.5 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Reason: </span>
                  {booking.purposeCategory && (
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300 mr-1">
                      [{booking.purposeCategory}]
                    </span>
                  )}
                  <span>{booking.reason || booking.purpose}</span>
                </div>
              </div>
            )}

            {/* Waitlist offer countdown banner if present */}
            {booking.offerExpires && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Slot Freed Up! You're #1 on waitlist.</span>
                  </div>
                  <div className="text-[11px] text-amber-800/80 mt-0.5">
                    Offer valid for next 2 hours.
                  </div>
                </div>
                <button
                  onClick={() => alert("Offer accepted! Your booking is now confirmed.")}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  Accept Offer
                </button>
              </div>
            )}
          </div>

          {/* Ticket Perforation Notch Divider (Cinema aesthetic) */}
          <div className="hidden md:flex flex-col items-center justify-center relative px-2">
            <div className="w-[1px] h-28 border-r-2 border-dashed border-slate-300 dark:border-slate-700" />
          </div>

          {/* Right Ticket Stub: QR Code & 3 Clear Action Buttons */}
          <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 dark:border-slate-800 min-w-[190px]">
            {/* QR Mock */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-250 dark:border-slate-700 p-1.5 flex flex-col items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <QrCode className="w-14 h-14 text-slate-800 dark:text-slate-200" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 mt-1 uppercase">
                {ticketCode}
              </span>
            </div>

            {/* 3 Cinema Action Buttons */}
            <div className="flex flex-col gap-2 w-full max-w-[150px]">
              {/* Button 1: Check In */}
              {isConfirmed && !booking.checkin && (
                <Link
                  to="/checkin/$id"
                  params={{ id: booking.id }}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm text-center flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Check In</span>
                </Link>
              )}

              {/* Already Checked in status */}
              {booking.checkin && !booking.ret && (
                <Link
                  to="/return/$id"
                  params={{ id: booking.id }}
                  className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return</span>
                </Link>
              )}

              {/* Button 2: Extend */}
              {isConfirmed && !isCancelled && !booking.ret && (
                <button
                  type="button"
                  onClick={() => setShowExtendModal(true)}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Extend (+1h)</span>
                </button>
              )}

              {/* Button 3: Cancel */}
              {!isCancelled && !booking.ret && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-1.5 px-3 border border-slate-250 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-900 rounded-xl text-xs font-medium text-center transition-all"
                >
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Cancel this booking?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Cancelling will instantly free this seat and offer it to the next person on the waiting list.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  onCancel(booking.id);
                  setShowCancelModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Booking Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Extend Booking Time
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Choose additional time if the subsequent slot has no competing booking.
              </p>
            </div>
            <div className="flex justify-center gap-2 py-2">
              {[1, 2].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => setExtendHours(hrs)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                    extendHours === hrs
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  +{hrs} Hour{hrs > 1 ? "s" : ""}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onExtend(booking.id, extendHours);
                  setShowExtendModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
              >
                Confirm Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
