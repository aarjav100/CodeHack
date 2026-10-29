import type { Booking, FairFactors, Requirement, Resource, User, Weights } from "@/data/types";

export function fairScore(f: FairFactors, w: Weights) {
  const total = w.lowUsage + w.waiting + w.purpose + w.skill + w.reliability || 1;
  const raw =
    (f.lowUsage * w.lowUsage + f.waiting * w.waiting + f.purpose * w.purpose + f.skill * w.skill + f.reliability * w.reliability) / total;
  const penalty = (f.penalties * w.penalties) / 100;
  return Math.max(0, Math.min(100, Math.round(raw - penalty)));
}

export function checkReq(req: Requirement, user: User): boolean {
  switch (req.kind) {
    case "verified":
      return user.verified === "verified";
    case "student":
      return user.kind === "student";
    case "skill":
      return !!req.skill && user.skills.includes(req.skill);
    case "age18":
      return true;
  }
}

export function eligibility(resource: Resource, user: User) {
  const items = resource.requirements.map((r) => ({ ...r, met: checkReq(r, user) }));
  return { items, eligible: items.every((i) => i.met) };
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export function overlaps(a: Pick<Booking, "date" | "start" | "duration" | "resourceId">, b: Pick<Booking, "date" | "start" | "duration" | "resourceId">) {
  if (a.resourceId !== b.resourceId || a.date !== b.date) return false;
  const a1 = toMin(a.start), a2 = a1 + a.duration * 60;
  const b1 = toMin(b.start), b2 = b1 + b.duration * 60;
  return a1 < b2 && b1 < a2;
}

export function findConflicts(b: Booking, all: Booking[]) {
  return all.filter(
    (o) => o.id !== b.id && ["approved", "active", "pending"].includes(o.status) && overlaps(b, o),
  );
}

export function recommend(score: number, eligible: boolean, conflicts: Booking[]): Booking["recommendation"] {
  if (!eligible) return "reject";
  if (conflicts.some((c) => c.status === "approved" || c.status === "active" || c.programId)) return "waitlist";
  return score >= 45 ? "approve" : "waitlist";
}

export function explain(status: string, reason?: string) {
  const base: Record<string, string> = {
    approved: "Good news — your request was approved.",
    rejected: "Your request was not approved this time.",
    waitlisted: "You are on the waiting list.",
    pending: "Your request is being reviewed by the space manager.",
    active: "You have checked in. Enjoy the space!",
    completed: "This booking is complete. Thank you for returning everything.",
    cancelled: "This booking was cancelled.",
  };
  return `${base[status] ?? ""}${reason ? ` Why: ${reason}` : ""}`;
}
