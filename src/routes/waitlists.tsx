import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel, fmtD } from "@/components/shared";
import { Countdown } from "@/components/contest";
import { useApp } from "@/store/app";
import { fairScore } from "@/lib/logic";
import { endOf } from "@/lib/contest";

export const Route = createFileRoute("/waitlists")({
  head: () => ({ meta: [{ title: "Waiting lists — CampusSphare" }, { name: "description", content: "Your queue positions, timed offers and room queues ranked by Fair-Share Score." }, { property: "og:title", content: "Waiting lists — CampusSphare" }, { property: "og:description", content: "Fair, transparent waiting lists." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Waitlists,
});

function Waitlists() {
  const { bookings, resources, users, weights, role, me, acceptOffer, declineOffer } = useApp();
  const self = me();
  const staff = ["owner", "manager", "admin"].includes(role);
  const waiting = bookings.filter((b) => b.status === "waitlisted");
  const name = (rid: string) => resources.find((r) => r.id === rid)?.name ?? rid;

  if (!staff) {
    const mine = waiting.filter((b) => b.userId === self.id);
    return (
      <div>
        <PageHeader title="Waiting lists" subtitle="If someone cancels, the next person by Fair-Share Score gets a timed offer." />
        {mine.length === 0 ? <EmptyState icon={ListOrdered} title="You're not on any waiting list" action={<Button asChild><Link to="/discover">Find a space</Link></Button>} /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {mine.map((b) => (
              <Panel key={b.id}>
                <p className="font-semibold">{name(b.resourceId)}</p>
                <p className="text-sm text-muted-foreground">{fmtD(b.date)} · {b.start}–{endOf(b)}</p>
                {b.offerExpires ? (
                  <div className="mt-3 rounded-xl bg-st-approved/10 p-3">
                    <p className="text-sm font-semibold">A spot opened up! Respond within <Countdown iso={b.offerExpires} /></p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="success" onClick={() => { acceptOffer(b.id); toast.success("Booking confirmed"); }}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => { declineOffer(b.id); toast("Offer passed to the next person"); }}>Decline</Button>
                    </div>
                  </div>
                ) : <p className="mt-3 text-sm">Position <b className="text-lg">#{b.waitPos ?? 1}</b> in the queue</p>}
              </Panel>
            ))}
          </div>
        )}
      </div>
    );
  }

  const ids = role === "owner" ? resources.filter((r) => r.ownerId === self.id).map((r) => r.id) : resources.map((r) => r.id);
  const groups = ids.map((rid) => ({ rid, list: waiting.filter((b) => b.resourceId === rid).sort((a, b) => fairScore(users.find((u) => u.id === b.userId)!.factors, weights) - fairScore(users.find((u) => u.id === a.userId)!.factors, weights)) })).filter((g) => g.list.length);
  return (
    <div>
      <PageHeader title="Waiting lists" subtitle="Room queues ordered by Fair-Share Score. Offers go out automatically on cancellation." />
      {groups.length === 0 ? <EmptyState icon={ListOrdered} title="No one is waiting" body="Queues appear here when you waitlist requests in the Approvals inbox." /> : (
        <div className="space-y-4">
          {groups.map((g) => (
            <Panel key={g.rid} title={name(g.rid)}>
              <ol className="divide-y">
                {g.list.map((b, i) => {
                  const u = users.find((x) => x.id === b.userId)!;
                  return (
                    <li key={b.id} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-muted font-bold">{i + 1}</span>
                      <span className="flex-1">{u.name}<span className="block text-xs text-muted-foreground">{fmtD(b.date)} · {b.start}–{endOf(b)}</span></span>
                      {b.offerExpires && <span className="rounded-full bg-st-approved/15 px-2 py-0.5 text-xs">Offer out</span>}
                      <span className="tabular-nums font-semibold">{fairScore(u.factors, weights)}</span>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

