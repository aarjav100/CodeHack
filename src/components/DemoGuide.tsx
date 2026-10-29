import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Compass, X, Users, FastForward } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import type { Role } from "@/data/types";

const SPACE: { text: string; to: string; role: Role }[] = [
  { text: "As Student, open Discover and pick Seminar Hall A", to: "/resources/seminar-a", role: "user" },
  { text: "Check “Am I eligible?” then tap Request booking and submit", to: "/book/seminar-a", role: "user" },
  { text: "Finish identity verification (any 6-digit OTP, e.g. 123456)", to: "/verify", role: "user" },
  { text: "Switch to Admin → Approvals inbox → Approve with a reason", to: "/approvals", role: "admin" },
  { text: "Switch back to Student → Notifications shows why", to: "/notifications", role: "user" },
  { text: "My bookings → Check in → then Return (see differences)", to: "/bookings", role: "user" },
  { text: "Open the booking timeline or report an incident", to: "/bookings", role: "user" },
];
const CONTEST: { text: string; to: string; role: Role }[] = [
  { text: "Open Seminar Hall A — see “In demand (2)” and the striped calendar slot", to: "/resources/seminar-a", role: "user" },
  { text: "Open Live demand to see every contested slot", to: "/demand", role: "user" },
  { text: "Tap “Fast-forward to window close” below", to: "/demand", role: "admin" },
  { text: "As Admin, review the Seminar Hall A contest and confirm", to: "/contests/ct1", role: "admin" },
  { text: "Check the audit log (filter: Contest)", to: "/audit", role: "admin" },
];
const PROGRAM: { text: string; to: string; role: Role }[] = [
  { text: "As Student, open Programs hub", to: "/programs", role: "user" },
  { text: "Pick “Your First Tech Job” → RSVP, ask a question", to: "/events/c1", role: "user" },
  { text: "Or book a seat at the Study Center seat map", to: "/study", role: "user" },
  { text: "Or get a health camp token", to: "/health/h1", role: "user" },
];

export function DemoGuide() {
  const [open, setOpen] = useState(false);
  const setRole = useApp((s) => s.setRole);
  const { seedDemoContest, fastForward } = useApp();
  const nav = useNavigate();
  const Step = ({ s, i }: { s: (typeof SPACE)[number]; i: number }) => (
    <li>
      <Link to={s.to} onClick={() => { setRole(s.role); setOpen(false); }} className="flex gap-3 rounded-xl p-2.5 text-sm hover:bg-muted">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
        <span>{s.text}</span>
      </Link>
    </li>
  );
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="amber" className="fixed bottom-5 right-5 z-40 h-12 rounded-full px-5 shadow-lift" aria-label="Open demo guide">
        <Compass className="h-5 w-5" /> Demo guide
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Demo guide</SheetTitle>
            <SheetDescription>Tap a step — the role switches for you.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-6 px-4 pb-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Space journey (≈3 min)</h3>
              <ol className="space-y-1">{SPACE.map((s, i) => <Step key={i} s={s} i={i} />)}</ol>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Competing requests (≈2 min)</h3>
              <ol className="mb-3 space-y-1">{CONTEST.map((s, i) => <Step key={i} s={s} i={i} />)}</ol>
              <div className="grid gap-2">
                <Button variant="outline" onClick={() => { const cid = seedDemoContest(); toast.success("Asha and Ravi requested Seminar Hall A"); setOpen(false); nav({ to: "/contests/$id", params: { id: cid } }); }}><Users /> Create a 2-person contest</Button>
                <Button variant="teal" onClick={() => { fastForward(); toast.success("All request windows closed — scores locked"); }}><FastForward /> Fast-forward to window close</Button>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Register for a program (≈1 min)</h3>
              <ol className="space-y-1">{PROGRAM.map((s, i) => <Step key={i} s={s} i={i} />)}</ol>
            </div>
            <p className="text-xs text-muted-foreground">All data is fictional and resets on reload.</p>
          </div>
        </SheetContent>
      </Sheet>
      <span className="hidden"><X /></span>
    </>
  );
}
