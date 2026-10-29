import type { Booking, Contest, FairFactors, RankEntry, Resource, User, Weights } from "@/data/types";
import { eligibility, fairScore } from "./logic";

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const endOf = (b: Pick<Booking, "start" | "duration">) => fromMin(toMin(b.start) + b.duration * 60);

export const PURPOSES = ["Course project", "Club event", "Exam preparation", "Research", "Community event", "Personal learning"];

/** Points contributed by each factor (out of the weight), penalties negative. */
export function factorPoints(f: FairFactors, w: Weights) {
  return {
    lowUsage: (f.lowUsage * w.lowUsage) / 100,
    waiting: (f.waiting * w.waiting) / 100,
    purpose: (f.purpose * w.purpose) / 100,
    skill: (f.skill * w.skill) / 100,
    reliability: (f.reliability * w.reliability) / 100,
    penalties: -(f.penalties * w.penalties) / 100,
  };
}

/** Bookings that count toward the weekly quota (approved/active within 7 days of the date). */
export function weeklyCount(userId: string, date: string, bookings: Booking[]) {
  const t = new Date(date).getTime();
  return bookings.filter((b) => b.userId === userId && ["approved", "active"].includes(b.status) && !b.programId && Math.abs(new Date(b.date).getTime() - t) < 7 * 864e5).length;
}

/** Hard gates first, then rank by score; ties broken by earliest request time. */
export function rankContest(c: Contest, bookings: Booking[], users: User[], resource: Resource, w: Weights): RankEntry[] {
  const reqs = c.requestIds.map((id) => bookings.find((b) => b.id === id)!).filter((b) => b && b.status === "pending");
  const entries: RankEntry[] = reqs.map((b) => {
    const u = users.find((x) => x.id === b.userId)!;
    const el = eligibility(resource, u);
    const firstMissing = el.items.find((i) => !i.met);
    const overQuota = weeklyCount(u.id, b.date, bookings) >= w.maxBookingsPerWeek;
    return {
      bookingId: b.id, userId: u.id, factors: { ...u.factors }, score: fairScore(u.factors, w),
      eligible: el.eligible && !overQuota,
      missing: firstMissing ? firstMissing.label : overQuota ? `Weekly quota reached (${w.maxBookingsPerWeek} bookings per week)` : undefined,
      createdAt: b.createdAt ?? b.timeline[0]?.at ?? "",
    };
  });
  const ranked = entries.filter((e) => e.eligible).sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt));
  ranked.forEach((e, i) => (e.rank = i + 1));
  return [...ranked, ...entries.filter((e) => !e.eligible)];
}

export function displayName(u: User | undefined, anonymous?: boolean) {
  if (!u) return "Applicant";
  if (anonymous) return "Anonymous applicant";
  return `${u.name.split(" ")[0]} · ${u.dept ?? (u.kind === "citizen" ? "Community" : "Staff")}`;
}

const LOSS_TEXT: Record<keyof FairFactors, string> = {
  lowUsage: "you used shared resources a lot in the last 30 days",
  waiting: "you have waited less than others recently",
  purpose: "your purpose scored lower on learning/community need",
  skill: "your skill badges match this resource less closely",
  reliability: "your on-time check-in and return history is lower",
  penalties: "of a manager-confirmed penalty (e.g. a late return)",
};

/** Step-by-step plain-language explanation for one applicant. */
export function explainResult(c: Contest, entry: RankEntry, w: Weights): string[] {
  const ranking = c.ranking ?? [];
  const n = ranking.length;
  const steps = [`${n} request${n > 1 ? "s" : ""} competed for this slot.`];
  if (!entry.eligible) {
    steps.push(`Your request could not be ranked because: ${entry.missing}.`, "Ineligible requests are never ranked — this is a hard rule, not a score.");
    return steps;
  }
  const top = ranking.find((r) => r.rank === 1)!;
  const winner = ranking.find((r) => r.bookingId === c.winnerId) ?? top;
  steps.push(`Your score was ${entry.score}. The top score was ${top.score}.`);
  if (entry.bookingId === winner.bookingId) {
    const tie = ranking.some((r) => r.bookingId !== entry.bookingId && r.eligible && r.score === entry.score);
    steps.push(tie ? "Another applicant had the same score — the tie was broken by who requested first, which was you." : "You had the highest eligible score, so the slot is yours.");
  } else {
    const mine = factorPoints(entry.factors, w), theirs = factorPoints(winner.factors, w);
    const gaps = (Object.keys(mine) as (keyof FairFactors)[]).map((k) => ({ k, gap: theirs[k] - mine[k] })).filter((g) => g.gap > 0.5).sort((a, b) => b.gap - a.gap);
    if (gaps[0]) steps.push(`You lost about ${Math.round(gaps[0].gap)} points because ${LOSS_TEXT[gaps[0].k]}.`);
    if (entry.score === winner.score) steps.push("Your scores were equal — the tie was broken by the earliest request time.");
    if (c.override) steps.push(`The manager chose a different applicant than the system recommended. Reason: “${c.override}”.`);
  }
  return steps;
}
