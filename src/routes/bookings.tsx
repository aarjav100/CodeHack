import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  CalendarX, 
  History, 
  LogIn, 
  LogOut, 
  AlertTriangle, 
  Info, 
  Ticket, 
  Sparkles,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EmptyState, ListSkeleton, PageHeader, Timeline, useFakeLoad } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { useAuthStore } from "@/store/authStore";
import type { Booking } from "@/data/types";
import { CinemaTicketCard } from "@/components/booking/CinemaTicketCard";
import { toast } from "sonner";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Booking Seat — CampusSphare" },
      { name: "description", content: "View your booked seats, check in with QR code, cancel or extend your lab sessions." },
    ],
  }),
  component: BookingsPage,
});

const TABS: Record<string, Booking["status"][]> = {
  upcoming: ["pending", "approved", "waitlisted", "active"],
  past: ["completed", "rejected", "cancelled"],
};

function BookingsPage() {
  const me = useMe();
  const allBookings = useApp((s) => s.bookings);
  const resources = useApp((s) => s.resources);
  const cancel = useApp((s) => s.cancelBooking);
  const extendBooking = useApp((s) => s.extendBooking);
  const { acceptOffer, declineOffer } = useApp();
  const openSeatBookingGuide = useAuthStore((s) => s.openSeatBookingGuide);

  const [tab, setTab] = useState("upcoming");
  const [selectedBookingForHistory, setSelectedBookingForHistory] = useState<Booking | null>(null);
  const loading = useFakeLoad();

  // Filter bookings for active user
  const userBookings = allBookings.filter((b) => b.userId === me.id);
  const list = userBookings.filter((b) => TABS[tab].includes(b.status));

  const handleCancelBooking = (bookingId: string) => {
    cancel(bookingId);
    toast.success("Booking cancelled", {
      description: "Seat released instantly and offered to the waiting list.",
    });
  };

  const handleExtendBooking = (bookingId: string, hours: number) => {
    extendBooking(bookingId, hours);
    toast.success(`Booking extended by +${hours} hour(s)!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Booking Seat
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your reserved seats and passes for labs, workstations and seminar venues.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={openSeatBookingGuide}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>How to Book</span>
          </button>

          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Seat</span>
          </Link>
        </div>
      </div>

      {/* Waiting List Urgent Offer Notification */}
      {userBookings
        .filter((b) => b.offerExpires && b.status === "waitlisted")
        .map((b) => {
          const res = resources.find((r) => r.id === b.resourceId);
          return (
            <div
              key={b.id}
              role="alert"
              className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    A seat freed up: {res?.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    You're #1 on the waiting list! Accept within <strong>2 hours</strong> before it's offered to the next applicant.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    acceptOffer(b.id);
                    toast.success("Offer accepted! Ticket confirmed.");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Accept & Book
                </button>
                <button
                  onClick={() => {
                    declineOffer(b.id);
                    toast.info("Offer declined and passed to next applicant.");
                  }}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300"
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="upcoming" className="text-xs font-bold px-4 rounded-lg">
              Active & Upcoming ({userBookings.filter((b) => TABS.upcoming.includes(b.status)).length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs font-bold px-4 rounded-lg">
              Past & Cancelled ({userBookings.filter((b) => TABS.past.includes(b.status)).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <span className="text-xs text-slate-400 hidden sm:inline-block">
          Tap ticket to view QR code
        </span>
      </div>

      {/* Loading & Tickets List */}
      {loading ? (
        <ListSkeleton />
      ) : list.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={tab === "upcoming" ? "No upcoming booking seats" : "No past booking seats"}
          body="Pick a computer lab, electronics bench, 3D printer or seminar hall to book in under 20 seconds."
          action={
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
              <Link to="/discover">Discover Spaces</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {list.map((booking) => {
            const resource = resources.find((r) => r.id === booking.resourceId);
            return (
              <div key={booking.id} className="relative">
                <CinemaTicketCard
                  booking={booking}
                  resource={resource}
                  onCancel={handleCancelBooking}
                  onExtend={handleExtendBooking}
                />

                {/* Audit Timeline Trigger Button */}
                <div className="mt-1 text-right">
                  <button
                    onClick={() => setSelectedBookingForHistory(booking)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <History className="w-3 h-3" />
                    <span>View Audit Trail ({booking.timeline?.length || 1} events)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Audit History Sheet Drawer */}
      <Sheet
        open={Boolean(selectedBookingForHistory)}
        onOpenChange={(open) => !open && setSelectedBookingForHistory(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-base font-bold">Ticket Audit Trail</SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Cryptographically timestamped actions: request created, seat selected, confirmed, cancelled, check-in, return.
            </SheetDescription>
          </SheetHeader>
          {selectedBookingForHistory && (
            <div className="px-4 py-4">
              <div className="mb-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  Ticket #{selectedBookingForHistory.ticketCode || selectedBookingForHistory.id}
                </div>
                <div className="text-slate-500 mt-0.5">
                  {selectedBookingForHistory.date} · {selectedBookingForHistory.start}
                </div>
              </div>
              <Timeline events={selectedBookingForHistory.timeline || []} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
