import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { 
  Compass, 
  X, 
  Users, 
  FastForward, 
  Armchair, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Ticket
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import type { Role } from "@/data/types";

export function DemoGuide() {
  const [open, setOpen] = useState(false);
  const setRole = useApp((s) => s.setRole);
  const { seedDemoContest, fastForward } = useApp();
  const nav = useNavigate();

  const handleStartFlow = (path: string) => {
    setRole("user");
    setOpen(false);
    nav({ to: path as any });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-12 rounded-full px-5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold shadow-xl flex items-center gap-2 border border-white/20 transition-transform active:scale-95"
        aria-label="Open demo guide"
      >
        <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
        <span>Cinema Booking Demo</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <SheetTitle>Cinema Booking Demo Guide</SheetTitle>
            </div>
            <SheetDescription>
              Test both booking modes designed to be completed in 3 taps and under 20 seconds.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 space-y-6 px-1 pb-6">
            {/* Quick 1-Tap Launcher Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleStartFlow("/book/comp-lab-4")}
                className="w-full p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-left transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Armchair className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Flow 1: Book a Seat in Computer Lab 4
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mode 1 · Cinema layout · 3 taps · &lt; 20s
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleStartFlow("/book/seminar-a")}
                className="w-full p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-left transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Flow 2: Book Seminar Hall A for a Class
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mode 2 · Show-time timeline · Capacity check
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Flow 1 Step-by-Step */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Armchair className="w-4 h-4" />
                <span>Mode 1 Walkthrough (Computer Lab 4)</span>
              </h3>
              <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Open <strong>Computer Lab 4</strong> and pick today's <strong>11-1 · 24 free</strong> slot.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Tap seat <strong>C4</strong> (or tap <em>"Pick the best seat for me"</em>).</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>Tap <strong>Send request</strong> in the sticky bottom bar to view your ticket with QR code!</span>
                </li>
              </ol>
            </div>

            {/* Flow 2 Step-by-Step */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Mode 2 Walkthrough (Seminar Hall A)</span>
              </h3>
              <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Open <strong>Seminar Hall A</strong> timeline view.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Tap the <strong>Afternoon (2-6)</strong> preset block or drag hours 14:00 to 17:00.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>Type event name, check attendees bar against capacity (200), and submit!</span>
                </li>
              </ol>
            </div>

            {/* Owner & Contest Test Tools */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Administrative & Competing Slot Controls
              </div>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const cid = seedDemoContest();
                    toast.success("Competing requests generated for Seminar Hall A");
                    setOpen(false);
                    nav({ to: "/contests/$id", params: { id: cid } });
                  }}
                  className="justify-start gap-2 text-xs rounded-xl"
                >
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Seed 2-Person Competing Contest</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fastForward();
                    toast.success("Fair-Share scoring calculated — decision ready");
                  }}
                  className="justify-start gap-2 text-xs rounded-xl"
                >
                  <FastForward className="w-4 h-4 text-indigo-500" />
                  <span>Fast-Forward Request Window (Scores Lock)</span>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 text-xs rounded-xl"
                >
                  <Link to="/resources/new" onClick={() => setOpen(false)}>
                    <span>Open Owner Seat Layout Editor</span>
                  </Link>
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              All state updates live in local store. Re-open guide anytime.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
