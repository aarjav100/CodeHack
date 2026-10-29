import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/store/app";
import { ConditionForm } from "@/components/ConditionForm";
import { EmptyState } from "@/components/shared";

export const Route = createFileRoute("/return/$id")({
  head: () => ({ meta: [{ title: "Return — CampusSphare" }, { name: "description", content: "Compare the condition with check-in and hand back." }, { property: "og:title", content: "Return — CampusSphare" }, { property: "og:description", content: "Return checklist with differences highlighted." }] }),
  component: Return,
});

function Return() {
  const { id } = Route.useParams();
  const b = useApp((s) => s.bookings.find((x) => x.id === id));
  const r = useApp((s) => s.resources.find((x) => x.id === b?.resourceId));
  const ret = useApp((s) => s.returnItem);
  const nav = useNavigate();
  if (!b || !r) return <EmptyState title="Booking not found" action={<Link to="/bookings" className="text-primary underline">My bookings</Link>} />;
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/bookings" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> My bookings</Link>
      <h1 className="text-2xl font-bold">Return: {r.name}</h1>
      <p className="mb-6 text-muted-foreground">Same checklist as check-in. Items that changed are highlighted in amber.</p>
      <ConditionForm checklist={r.checklist} before={b.checkin?.items} cta="Confirm return"
        onSubmit={(items, notes, photos) => {
          ret(b.id, items, notes, photos);
          const changed = items.filter((x) => !x.ok && (b.checkin?.items.find((p) => p.item === x.item)?.ok ?? true));
          if (changed.length) { toast.warning("Return recorded with new issues"); nav({ to: "/bookings" }); }
          else { toast.success("Returned. Thank you!"); nav({ to: "/bookings" }); }
        }} />
    </div>
  );
}

