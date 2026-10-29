import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BellOff, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ListSkeleton, PageHeader, fmtDT, useFakeLoad } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — CampusSphare" }, { name: "description", content: "Approvals, reminders, waitlist offers and more." }, { property: "og:title", content: "Notifications — CampusSphare" }, { property: "og:description", content: "Your CampusSphare updates." }] }),
  component: Notifications,
});

function Countdown({ until }: { until: string }) {
  const [left, setLeft] = useState(() => new Date(until).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(new Date(until).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  if (left <= 0) return <span className="text-xs text-st-rejected">Offer expired</span>;
  const h = Math.floor(left / 36e5), m = Math.floor((left % 36e5) / 6e4), s = Math.floor((left % 6e4) / 1e3);
  return <span className="inline-flex items-center gap-1 rounded-full bg-st-waitlisted/12 px-2 py-0.5 text-xs font-semibold text-st-waitlisted"><Timer className="h-3.5 w-3.5" />Accept within {h}h {m}m {s}s</span>;
}

function Notifications() {
  const me = useMe();
  const all = useApp((s) => s.notifications);
  const markRead = useApp((s) => s.markRead);
  const loading = useFakeLoad();
  const list = all.filter((n) => n.userId === me.id);
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Every decision comes with a plain-language reason." actions={<Button variant="outline" onClick={() => markRead()}>Mark all read</Button>} />
      {loading ? <ListSkeleton /> : list.length === 0 ? <EmptyState icon={BellOff} title="You're all caught up" /> : (
        <ul className="space-y-3">
          {list.map((n) => (
            <li key={n.id} className={cn("rounded-2xl border bg-card p-4 shadow-soft", !n.read && "border-primary/40")}>
              <div className="flex flex-wrap items-center gap-2">
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                <span className="font-semibold">{n.title}</span>
                <span className="text-xs capitalize text-muted-foreground">{n.type}</span>
                {n.expiresAt && <Countdown until={n.expiresAt} />}
              </div>
              <p className="mt-1 text-sm">{n.body}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{fmtDT(n.at)}</span>
                <div className="flex gap-2">
                  {n.link && <Button asChild size="sm" variant="outline" onClick={() => markRead(n.id)}><Link to={n.link as "/"}>Open</Link></Button>}
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

