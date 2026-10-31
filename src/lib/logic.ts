import type { Booking, FairFactors, Requirement, Resource, User, Weights } from "@/data/types";

export function fairScore(f: FairFactors, w: Weights, overdueMinutes = 0) {
  // Evaluates capability, urgency, need, skills, and reliability
  const cap = f.capability ?? f.lowUsage ?? 100;
  const urg = f.urgency ?? f.waiting ?? 100;
  const need = f.need ?? f.purpose ?? 100;
  const skill = f.skill ?? 100;
  const reliability = f.reliability ?? 100;

  const wCap = w.capability ?? w.lowUsage ?? 20;
  const wUrg = w.urgency ?? w.waiting ?? 20;
  const wNeed = w.need ?? w.purpose ?? 20;
  const wSkill = w.skill ?? 15;
  const wRel = w.reliability ?? 15;

  const total = wCap + wUrg + wNeed + wSkill + wRel || 1;
  const raw = (cap * wCap + urg * wUrg + need * wNeed + skill * wSkill + reliability * wRel) / total;

  // Penalties from late checkouts and infractions
  const recordedPenalty = ((f.penalties || 0) * (w.penalties || 100)) / 100;
  const liveOverduePenalty = overdueMinutes > 5 ? Math.min(50, Math.ceil((overdueMinutes - 5) / 15) * 5) : 0;
  const finalPenalty = recordedPenalty + liveOverduePenalty;

  return Math.max(0, Math.min(100, Math.round(raw - finalPenalty)));
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
