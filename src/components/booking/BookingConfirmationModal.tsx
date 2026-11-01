import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  QrCode, 
  ArrowRight, 
  Calendar, 
  Building2, 
  Ticket, 
  ShieldCheck,
  Share2
} from "lucide-react";
import type { Resource, Booking } from "@/data/types";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  resource: Resource | null;
  isInstant: boolean;
  competingCount?: number;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  booking,
  resource,
  isInstant,
  competingCount = 0,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !booking || !resource) return null;

  const ticketCode = booking.ticketCode || `CS-${booking.id.toUpperCase()}`;
  const seatsList = booking.seats && booking.seats.length > 0 ? booking.seats.join(", ") : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center p-6 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Animated Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
          {isInstant ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="w-9 h-9" />
            </div>
          )}
        </div>

        {/* Title & Plain-Language Status */}
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isInstant ? "Seat Confirmed Instantly!" : "Request Sent Successfully"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto">
            {isInstant
              ? "Your cinema-style ticket is ready. Check-in opens 15 minutes before your time slot."
              : competingCount > 1
              ? `${competingCount} requests in this slot. Will be evaluated fairly by Fair-Share score when the window closes.`
              : "A manager will confirm your request shortly. You will be notified immediately."}
          </p>
        </div>

        {/* Ticket Mock Preview Card */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-850 dark:to-indigo-950/30 rounded-2xl border border-indigo-150 dark:border-indigo-900/50 p-4 text-left shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-750 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {resource.name}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              {ticketCode}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {booking.bookingMode === "whole_venue" || booking.isWholeLab ? "Venue Reserved" : "Seat Allocated"}
              </div>
              <div className="text-base font-black text-indigo-900 dark:text-indigo-200 mt-0.5">
                {booking.isWholeLab ? (
                  "Entire Lab"
                ) : seatsList ? (
                  `Seat ${seatsList}`
                ) : (
                  booking.eventName || "Whole Venue"
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{booking.date} · {booking.start} ({booking.duration}h)</span>
              </div>
            </div>

            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-250 dark:border-slate-700 flex items-center justify-center shadow-inner">
              <QrCode className="w-12 h-12 text-slate-800 dark:text-slate-200" />
            </div>
          </div>

          {/* Reason / Purpose display on ticket */}
          {(booking.purpose || booking.reason) && (
            <div className="mt-3 pt-2.5 border-t border-dashed border-slate-250 dark:border-slate-750 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Reason for Booking
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-2">
                {booking.purposeCategory ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">
                    [{booking.purposeCategory}]
                  </span>
                ) : null}
                {booking.purpose || booking.reason}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate({ to: "/bookings" });
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <Ticket className="w-4 h-4" />
            <span>View Ticket in My Bookings</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => {
              onClose();
              navigate({ to: "/discover" });
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Explore More Spaces
          </button>
        </div>

      </div>
    </div>
  );
};
