import { describe, expect, it } from "vitest";
import { rankContest } from "@/lib/contest";
import { fairScore } from "@/lib/logic";
import { bookings, contests, resources, users, defaultWeights } from "@/data/mock";

const res = (id: string) => resources.find((r) => r.id === id)!;

describe("Competing requests", () => {
  it("score weights are 30/20/20/15/15", () => {
    const w = defaultWeights;
    expect([w.lowUsage, w.waiting, w.purpose, w.skill, w.reliability]).toEqual([30, 20, 20, 15, 15]);
  });

  it("ranks Asha above Ravi on Seminar Hall A", () => {
    const r = rankContest(contests.find((c) => c.id === "ct1")!, bookings, users, res("seminar-a"), defaultWeights);
    expect(r[0].userId).toBe("u16");
    expect(r[1].userId).toBe("u17");
  });

  it("never ranks an ineligible applicant and names the missing requirement", () => {
    const r = rankContest(contests.find((c) => c.id === "ct2")!, bookings, users, res("drone"), defaultWeights);
    const meera = r.find((e) => e.userId === "u2")!;
    expect(meera.eligible).toBe(false);
    expect(meera.rank).toBeUndefined();
    expect(meera.missing).toBe("Enrolled college student");
  });

  it("breaks equal scores by earliest request time", () => {
    const c = { ...contests[0], requestIds: ["x1", "x2"] };
    const base = bookings.find((b) => b.id === "bc1")!;
    const bs = [
      { ...base, id: "x1", userId: "u16", createdAt: "2026-01-02T00:00:00Z" },
      { ...base, id: "x2", userId: "u16", createdAt: "2026-01-01T00:00:00Z" },
    ];
    const r = rankContest(c, bs, users, res("seminar-a"), defaultWeights);
    expect(r[0].bookingId).toBe("x2");
  });

  it("rejects an applicant over the weekly quota", () => {
    const base = bookings.find((b) => b.id === "bc1")!;
    const approved = [1, 2, 3].map((i) => ({ ...base, id: `q${i}`, status: "approved" as const, contestId: undefined }));
    const r = rankContest({ ...contests[0], requestIds: ["bc1"] }, [...approved, base], users, res("seminar-a"), defaultWeights);
    expect(r[0].eligible).toBe(false);
    expect(r[0].missing).toContain("Weekly quota");
  });

  it("subtracts penalties from the score", () => {
    const f = { lowUsage: 50, waiting: 50, purpose: 50, skill: 50, reliability: 50, penalties: 10 };
    expect(fairScore(f, defaultWeights)).toBe(40);
  });
});
