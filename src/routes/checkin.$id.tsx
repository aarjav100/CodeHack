import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/store/app";
import { ConditionForm } from "@/components/ConditionForm";
import { EmptyState, fmtD } from "@/components/shared";

export const Route = createFileRoute("/checkin/$id")({
  head: () => ({ meta: [{ title: "Check in — CampusSphere" }, { name: "description", content: "Record the condition of the space before you start." }, { property: "og:title", content: "Check in — CampusSphere" }, { property: "og:description", content: "Condition checklist at check-in." }] }),
  component: CheckIn,
});

function CheckIn() {
  const { id } = Route.useParams();
  const b = useApp((s) => s.bookings.find((x) => x.id === id));
  const r = useApp((s) => s.resources.find((x) => x.id === b?.resourceId));
  const checkIn = useApp((s) => s.checkIn);
  const nav = useNavigate();
  if (!b || !r) return <EmptyState title="Booking not found" action={<Link to="/bookings" className="text-primary underline">My bookings</Link>} />;
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/bookings" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> My bookings</Link>
      <h1 className="text-2xl font-bold">Check in: {r.name}</h1>
      <p className="mb-6 text-muted-foreground">{fmtD(b.date)} · {b.start}. Mark anything that's not right <em>before</em> you start — it protects you.</p>
      <ConditionForm checklist={r.checklist} cta="Confirm check-in" onSubmit={(items, notes, photos) => { checkIn(b.id, items, notes, photos); toast.success("Checked in. Enjoy!"); nav({ to: "/bookings" }); }} />
    </div>
  );
}
