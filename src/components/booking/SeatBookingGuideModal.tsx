import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import {
  Ticket,
  Armchair,
  CalendarDays,
  QrCode,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Monitor,
  Building2,
  ShieldCheck,
  Check,
} from "lucide-react";

interface StepItem {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: any;
  accentColor: string;
}

const STEPS: StepItem[] = [
  {
    id: 1,
    title: "1. Discover & Pick a Space",
    subtitle: "Computer labs, benches or study halls",
    badge: "Step 1 of 4",
    description: "Browse curated campus facilities. Computer Lab 4, 3D Printer Bays, and Electronics Labs all support cinema-style individual workstation booking.",
    icon: Building2,
    accentColor: "from-blue-600 to-indigo-600",
  },
  {
    id: 2,
    title: "2. Choose Date & Showtime Slot",
    subtitle: "2-hour & 3-hour scheduled sessions",
    badge: "Step 2 of 4",
    description: "Pick today or an upcoming day. Each slot displays real-time vacancy (e.g., 24/30 seats free) so you never walk across campus to a full lab.",
    icon: CalendarDays,
    accentColor: "from-teal-600 to-emerald-600",
  },
  {
    id: 3,
    title: "3. Tap Your Seat (Cinema Style)",
    subtitle: "Interactive visual room layout",
    badge: "Step 3 of 4",
    description: "Look at the room layout with the whiteboard/entrance labeled at the front. Tap any green outlined seat to claim it in 1 tap.",
    icon: Armchair,
    accentColor: "from-indigo-600 to-purple-600",
  },
  {
    id: 4,
    title: "4. Get Digital Cinema Pass",
    subtitle: "Instant confirmation in < 20 seconds",
    badge: "Step 4 of 4",
    description: "Your seat is confirmed immediately! Receive a cinema-style digital pass with a QR code for NFC/Smart turnstile entry. On-time returns keep your Fair Score at 100%.",
    icon: Ticket,
    accentColor: "from-purple-600 to-pink-600",
  },
];

export function SeatBookingGuideModal() {
  const isOpen = useAuthStore((s) => s.isSeatBookingGuideOpen);
  const close = useAuthStore((s) => s.closeSeatBookingGuide);
  const currentUser = useAuthStore((s) => s.currentUser);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [demoSelectedSeat, setDemoSelectedSeat] = useState<string>("B2");
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  if (!isOpen) return null;

  const step = STEPS[currentStep - 1];

  const handleFinish = (targetRoute?: string) => {
    close(dontShowAgain);
    if (targetRoute) {
      navigate({ to: targetRoute as any });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
      <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
        {/* Header Gradient Strip */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${step.accentColor} transition-all duration-500`} />

        <div className="p-6 sm:p-7 space-y-5">
          {/* Top Pill & Title */}
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Welcome to CampusSphare · Seat Booking Guide
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {step.badge}
              </span>
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{step.title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {step.description}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Navigation Progress Indicators */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`group flex flex-col gap-1 text-left cursor-pointer transition-all`}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    s.id === currentStep
                      ? "bg-indigo-600 dark:bg-indigo-400"
                      : s.id < currentStep
                      ? "bg-indigo-300 dark:bg-indigo-800"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold line-clamp-1 ${
                    s.id === currentStep
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400"
                  }`}
                >
                  {s.id}. {s.title.split(".")[1]?.trim() || s.title}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Step Visualizer Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 p-4 sm:p-5">
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Available Spaces Supporting Seat Booking</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">• Live Vacancy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Computer Lab 4</div>
                      <div className="text-[11px] text-slate-500">30 Stations · Dual Display</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                    <img 
                      src="/images/3d-printer-bay.jpg" 
                      alt="3D Printer Bay" 
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-250 dark:border-slate-700 shadow-2xs" 
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">3D Printer Bay</div>
                      <div className="text-[11px] text-slate-500">4 Printers · Prusa MK4</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Each resource has an individual seat layout matching the physical room.</span>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pick a Time Slot (Like Cinema Showtimes)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl border border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-center">
                    <div className="text-xs font-black text-indigo-700 dark:text-indigo-300">09:00 – 11:00</div>
                    <div className="text-[10px] font-bold text-emerald-600 mt-0.5">24 Free</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center opacity-85">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">11:30 – 13:30</div>
                    <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">18 Free</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center opacity-85">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">14:00 – 17:00</div>
                    <div className="text-[10px] font-semibold text-amber-600 mt-0.5">6 Free</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Choose fixed sessions to prevent room conflicts and allow clean turnovers.</span>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3.5">
                {/* Mini Cinema Screen representation */}
                <div className="flex flex-col items-center">
                  <div className="w-4/5 h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full mb-1" />
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Whiteboard &amp; Screen Area
                  </span>
                </div>

                {/* Interactive Mini Seat Grid */}
                <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto py-1">
                  {["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4"].map((seatId) => {
                    const isSelected = demoSelectedSeat === seatId;
                    const isBooked = seatId === "A3" || seatId === "C1";

                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setDemoSelectedSeat(seatId)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isBooked
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 scale-105"
                            : "bg-white dark:bg-slate-900 border-2 border-emerald-500 text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
                        }`}
                      >
                        <Armchair className="w-3.5 h-3.5 mb-0.5" />
                        <span>{seatId}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Seat Legend */}
                <div className="flex items-center justify-center gap-4 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-md border-2 border-emerald-500 bg-white" />
                    <span className="text-slate-600 dark:text-slate-400">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-slate-900 dark:text-white font-bold">Selected ({demoSelectedSeat})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-slate-200 dark:bg-slate-700" />
                    <span className="text-slate-400">Booked</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900 flex flex-col items-center justify-center">
                      <QrCode className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400">PASS #TKT-CS4-B2-9104</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Computer Lab 4 · Seat B2</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">Ready for NFC &amp; Smart Gate</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Confirmed
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    <strong>Fair-Share Standing:</strong> Arrive promptly and check out on time to maintain your initial <strong>100% score</strong>!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Step navigation */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
              ) : null}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : null}
            </div>

            {/* Quick CTA & Dismiss */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleFinish()}
                className="rounded-xl text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Skip
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => handleFinish("/book/comp-lab-4")}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Armchair className="w-3.5 h-3.5" />
                <span>Try Booking a Seat Now</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
