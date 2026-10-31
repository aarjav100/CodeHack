import { create } from "zustand";
import * as M from "@/data/mock";
import type {
  AuditEntry, Booking, ConditionItem, HelpAppt, Incident, Notification, Program, Resource, Role,
  SeatBooking, User, Weights, Invite, Contest,
} from "@/data/types";
import { endOf, rankContest, explainResult, toMin, fromMin } from "@/lib/contest";
import { eligibility, fairScore, findConflicts, recommend } from "@/lib/logic";

let n = 1000;
const id = (p: string) => `${p}${++n}`;
const now = () => new Date().toISOString();

const getInitialUserId = (): string => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("campussphere_current_user_id");
      if (stored) return stored;
    } catch {}
  }
  return M.DEMO_USER["user"];
};

const getInitialLoggedInId = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("campussphere_logged_in_user_id");
    } catch {}
  }
  return null;
};

const getInitialUsers = (): User[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("campussphere_custom_users");
      if (stored) {
        const custom: User[] = JSON.parse(stored);
        const customIds = new Set(custom.map((u) => u.id));
        const normalizedCustom = custom.map((u) => ({
          ...u,
          factors: {
            capability: u.factors?.capability ?? u.factors?.lowUsage ?? 100,
            urgency: u.factors?.urgency ?? u.factors?.waiting ?? 100,
            need: u.factors?.need ?? u.factors?.purpose ?? 100,
            skill: u.factors?.skill ?? 100,
            reliability: u.factors?.reliability ?? 100,
            penalties: u.factors?.penalties ?? 0,
            lowUsage: u.factors?.lowUsage ?? u.factors?.capability ?? 100,
            waiting: u.factors?.waiting ?? u.factors?.urgency ?? 100,
            purpose: u.factors?.purpose ?? u.factors?.need ?? 100,
          },
        }));
        return [...normalizedCustom, ...M.users.filter((u) => !customIds.has(u.id))];
      }
    } catch {}
  }
  return M.users;
};

interface State {
  role: Role;
  dark: boolean;
  lang: "en" | "hi";
  currentUserId: string;
  loggedInUserId: string | null;
  users: User[];
  resources: Resource[];
  bookings: Booking[];
  incidents: Incident[];
  programs: Program[];
  speakers: typeof M.speakers;
  questions: typeof M.questions;
  invites: Invite[];
  seats: typeof M.seats;
  seatBookings: SeatBooking[];
  volunteers: typeof M.volunteers;
  doubts: typeof M.doubts;
  enrollments: typeof M.enrollments;
  tokens: typeof M.tokens;
  nowServing: Record<string, number>;
  schemes: typeof M.schemes;
  helpAppts: HelpAppt[];
  shifts: typeof M.shifts;
  partnerOrgs: typeof M.partnerOrgs;
  notifications: Notification[];
  audit: AuditEntry[];
  feedback: { programId: string; userId: string; rating: number; comment: string }[];
  weights: Weights;
  mockSlots: { id: string; kind: "Mock interview" | "Resume review"; date: string; time: string; volunteer: string; userId?: string }[];

  setRole: (r: Role) => void;
  toggleDark: () => void;
  setLang: (l: "en" | "hi") => void;
  me: () => User;
  setCurrentUser: (userId: string) => void;
  signUp: (data: { name: string; email: string; role: Role; kind?: "student" | "citizen" | "staff"; dept?: string }) => User;
  loginUser: (email: string) => User | undefined;
  logout: () => void;
  updateMe: (data: Partial<User>) => void;
  log: (action: string, target: string, detail: string) => void;
  notify: (userId: string, n: Omit<Notification, "id" | "userId" | "at" | "read">) => void;
  markRead: (id?: string) => void;

  addResource: (r: Omit<Resource, "id" | "ownerId">) => string;
  updateResource: (id: string, r: Partial<Resource>) => void;
  createBooking: (b: Pick<Booking, "resourceId" | "date" | "start" | "duration" | "purpose" | "attachments"> & { purposeCategory?: string }) => string;
  contests: Contest[];
  closeWindow: (cid: string) => void;
  fastForward: () => void;
  confirmContest: (cid: string, winnerBookingId: string, override?: string) => void;
  withdraw: (bid: string) => void;
  acceptOffer: (bid: string) => void;
  declineOffer: (bid: string) => void;
  seedDemoContest: () => string;
  seedApprovals: () => number;
  escalate: (cid: string) => void;
  requestInfo: (cid: string) => void;
  watch: (cid: string) => void;
  watchers: Record<string, string[]>;
  decide: (bookingId: string, decision: "approved" | "rejected" | "waitlisted", reason: string) => void;
  cancelBooking: (id: string) => void;
  verify: (status: "verified" | "pending", info: { email?: string; enrollment?: string }) => void;
  adminVerify: (userId: string, ok: boolean) => void;
  checkIn: (bookingId: string, items: ConditionItem[], notes: string, photos: string[]) => void;
  returnItem: (bookingId: string, items: ConditionItem[], notes: string, photos: string[], simulatedLateMinutes?: number) => void;
  penalizeLateCheckout: (userId: string, penaltyPoints: number, reason?: string) => void;
  resetFairScore: (userId?: string) => void;
  reportIncident: (i: Omit<Incident, "id" | "status" | "at" | "reporterId">) => void;
  reviewIncident: (id: string, status: Incident["status"], resolution: string) => void;

  register: (programId: string) => "registered" | "waitlisted" | "already";
  unregister: (programId: string) => void;
  createProgram: (p: Omit<Program, "id" | "registered" | "waitlist">) => string;
  askQuestion: (programId: string, text: string) => void;
  upvote: (qid: string) => void;
  selectQuestion: (qid: string) => void;
  submitFeedback: (programId: string, rating: number, comment: string) => void;
  respondInvite: (id: string, status: Invite["status"], note?: string) => void;
  sendInvite: (speakerId: string, title: string, date: string) => void;

  bookSeat: (sb: Omit<SeatBooking, "id" | "userId" | "checkedIn">) => { ok: boolean; msg: string };
  checkInSeat: (id: string) => void;
  setPriority: (v: boolean) => void;
  askDoubt: (subject: string, topic: string) => void;
  updateDoubt: (id: string, status: "waiting" | "helping" | "resolved", volunteerId?: string) => void;
  toggleDuty: (vid: string) => void;

  markAttendance: (programId: string, userId: string) => void;
  bookMockSlot: (id: string) => void;

  getToken: (campId: string, serviceId: string, anonymous: boolean) => number;
  advanceServing: (campId: string) => void;

  bookHelp: (topic: string, date: string, slot: string) => void;
  serveHelp: (id: string, notes: string, summary: string) => void;

  signupShift: (programId: string, role: string, hours: number, date: string) => void;
  completeShift: (id: string) => void;
  setWeights: (w: Partial<Weights>) => void;
  setUserRole: (uid: string, role: Role) => void;

  bookCinemaSeat: (data: {
    resourceId: string;
    date: string;
    slotId: string;
    seatIds: string[];
    purpose?: string;
    purposeCategory?: string;
    isWholeLab?: boolean;
    groupSize?: number;
  }) => { booking: Booking; isInstant: boolean };

  bookCinemaVenue: (data: {
    resourceId: string;
    date: string;
    start: string;
    end: string;
    eventName: string;
    expectedAttendees: number;
    purposeCategory: string;
    notes?: string;
  }) => { booking: Booking; isInstant: boolean };

  extendBooking: (bookingId: string, hours: number) => void;
  completeTraining: (skillName: string) => void;
}

export const useApp = create<State>((set, get) => ({
  role: "user",
  dark: false,
  lang: "en",
  currentUserId: getInitialUserId(),
  loggedInUserId: getInitialLoggedInId(),
  users: getInitialUsers(),
  resources: M.resources,
  bookings: M.bookings,
  incidents: M.incidents,
  programs: M.programs,
  speakers: M.speakers,
  questions: M.questions,
  invites: M.invites,
  seats: M.seats,
  seatBookings: M.seatBookings,
  volunteers: M.volunteers,
  doubts: M.doubts,
  enrollments: M.enrollments,
  tokens: M.tokens,
  nowServing: { h1: 2, h2: 0, h3: 0 },
  schemes: M.schemes,
  helpAppts: M.helpAppts,
  shifts: M.shifts,
  partnerOrgs: M.partnerOrgs,
  notifications: M.notifications,
  audit: M.audit,
  feedback: [],
  weights: M.defaultWeights,
  contests: M.contests,
  watchers: {},
  mockSlots: [
    { id: "ms1", kind: "Mock interview", date: M.d(1), time: "15:00", volunteer: "Neha Joshi" },
    { id: "ms2", kind: "Mock interview", date: M.d(2), time: "16:00", volunteer: "Vikram Nair", userId: "u3" },
    { id: "ms3", kind: "Resume review", date: M.d(1), time: "11:00", volunteer: "Arjun Patel" },
    { id: "ms4", kind: "Resume review", date: M.d(3), time: "12:00", volunteer: "Priya Menon" },
  ],

  setRole: (role) => {
    set((s) => {
      const current = s.users.find((u) => u.id === s.currentUserId);
      if (current && current.role === role) {
        return { role };
      }
      if (s.loggedInUserId) {
        const logged = s.users.find((u) => u.id === s.loggedInUserId);
        if (logged && logged.role === role) {
          return { role, currentUserId: logged.id };
        }
      }
      const demoId = M.DEMO_USER[role] ?? s.users[0]?.id;
      return { role, currentUserId: demoId };
    });
  },
  toggleDark: () => set((s) => ({ dark: !s.dark })),
  setLang: (lang) => set({ lang }),
  me: () => {
    const s = get();
    if (s.currentUserId) {
      const current = s.users.find((u) => u.id === s.currentUserId);
      if (current && (current.role === s.role || !s.role)) {
        return current;
      }
    }
    if (s.loggedInUserId) {
      const logged = s.users.find((u) => u.id === s.loggedInUserId);
      if (logged && logged.role === s.role) {
        return logged;
      }
    }
    return s.users.find((u) => u.id === M.DEMO_USER[s.role]) ?? s.users[0];
  },
  setCurrentUser: (uid) => {
    const s = get();
    const u = s.users.find((x) => x.id === uid);
    if (u) {
      set({ currentUserId: uid, loggedInUserId: uid, role: u.role });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("campussphere_current_user_id", uid);
          localStorage.setItem("campussphere_logged_in_user_id", uid);
        } catch {}
      }
    }
  },
  signUp: (data) => {
    const uid = id("u");
    const nameSeed = encodeURIComponent(data.name.trim());
    const newUser: User = {
      id: uid,
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      kind: data.kind ?? (data.role === "user" ? "student" : "citizen"),
      dept: data.dept ?? (data.role === "user" ? "Student" : undefined),
      verified: "none",
      skills: [],
      hours: 0,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${nameSeed}&backgroundColor=e0e7ff,ccfbf1,fef3c7`,
      factors: {
        capability: 100,
        urgency: 100,
        need: 100,
        skill: 100,
        reliability: 100,
        penalties: 0,
        lowUsage: 100,
        waiting: 100,
        purpose: 100,
      },
    };
    const nextUsers = [newUser, ...get().users];
    set({
      users: nextUsers,
      currentUserId: uid,
      loggedInUserId: uid,
      role: newUser.role,
    });
    get().log("user.signup", newUser.name, `New ${newUser.kind} account registered`);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("campussphere_current_user_id", uid);
        localStorage.setItem("campussphere_logged_in_user_id", uid);
        const custom = nextUsers.filter((u) => !M.users.some((mu) => mu.id === u.id));
        localStorage.setItem("campussphere_custom_users", JSON.stringify(custom));
      } catch {}
    }
    return newUser;
  },
  loginUser: (email) => {
    const s = get();
    const user = s.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      set({ currentUserId: user.id, loggedInUserId: user.id, role: user.role });
      get().log("user.login", user.name, "Signed in");
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("campussphere_current_user_id", user.id);
          localStorage.setItem("campussphere_logged_in_user_id", user.id);
        } catch {}
      }
      return user;
    }
    return undefined;
  },
  logout: () => {
    const defaultUser = M.DEMO_USER["user"];
    set({ loggedInUserId: null, currentUserId: defaultUser, role: "user" });
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("campussphere_current_user_id");
        localStorage.removeItem("campussphere_logged_in_user_id");
      } catch {}
    }
    get().log("user.logout", "System", "Signed out");
  },
  updateMe: (data) => {
    const me = get().me();
    const updatedName = data.name ? data.name.trim() : me.name;
    const updatedAvatar = data.name && !data.avatar ? `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(updatedName)}&backgroundColor=e0e7ff,ccfbf1,fef3c7` : (data.avatar ?? me.avatar);
    const updatedUsers = get().users.map((u) => (u.id === me.id ? { ...u, ...data, name: updatedName, avatar: updatedAvatar } : u));
    set({ users: updatedUsers });
    get().log("user.update", updatedName, "Profile updated");
    if (typeof window !== "undefined") {
      try {
        const custom = updatedUsers.filter((u) => !M.users.some((mu) => mu.id === u.id));
        localStorage.setItem("campussphere_custom_users", JSON.stringify(custom));
      } catch {}
    }
  },
  log: (action, target, detail) => {
    const me = get().me();
    set((s) => ({ audit: [{ id: id("a"), at: now(), actorId: me.id, role: me.role, action, target, detail }, ...s.audit] }));
  },
  notify: (userId, nn) =>
    set((s) => ({ notifications: [{ id: id("n"), userId, at: now(), read: false, ...nn }, ...s.notifications] })),
  markRead: (nid) => {
    const me = get().me();
    set((s) => ({ notifications: s.notifications.map((x) => (x.userId === me.id && (!nid || x.id === nid) ? { ...x, read: true } : x)) }));
  },

  addResource: (r) => {
    const rid = id("res");
    const me = get().me();
    set((s) => ({ resources: [{ ...r, id: rid, ownerId: me.id }, ...s.resources] }));
    get().log("resource.create", r.name, `Listed ${r.type}`);
    return rid;
  },
  updateResource: (rid, r) => {
    set((s) => ({ resources: s.resources.map((x) => (x.id === rid ? { ...x, ...r } : x)) }));
    get().log("resource.update", r.name ?? rid, "Details edited");
  },
  createBooking: (b) => {
    const s = get();
    const me = s.me();
    const res = s.resources.find((r) => r.id === b.resourceId)!;
    const bid = id("b");
    const at = now();
    const draft: Booking = { ...b, id: bid, userId: me.id, status: "pending", recommendation: "approve", createdAt: at, timeline: [{ at, actor: me.name, text: "Request submitted" }] };
    const conflicts = findConflicts(draft, s.bookings);
    draft.recommendation = recommend(fairScore(me.factors, s.weights), eligibility(res, me).eligible || me.verified !== "verified", conflicts);
    // Competing-request grouping: join an open contest on the same resource whose slot overlaps.
    const end = endOf(b);
    const open = s.contests.find((c) => c.status === "open" && c.resourceId === b.resourceId && c.date === b.date && toMin(b.start) < toMin(c.end) && toMin(c.start) < toMin(end));
    let contests = s.contests;
    if (open) {
      draft.contestId = open.id;
      const count = open.requestIds.length + 1;
      contests = contests.map((c) => (c.id === open.id ? { ...c, requestIds: [...c.requestIds, bid], start: fromMin(Math.min(toMin(c.start), toMin(b.start))), end: fromMin(Math.max(toMin(c.end), toMin(end))) } : c));
      draft.timeline.push({ at, actor: "System", text: `Joined contest — now ${count} requests for this slot` });
      set({ bookings: [draft, ...s.bookings], contests });
      s.log(count === 2 ? "contest.formed" : "contest.joined", res.name, `${count} overlapping requests in contest ${open.id}`);
      open.requestIds.forEach((rid) => {
        const other = s.bookings.find((x) => x.id === rid);
        if (other) s.notify(other.userId, { type: "info", title: count === 2 ? "Your slot is now contested" : "New competitor added", body: `${res.name} on ${b.date}: ${count} requests now. Priority is decided by Fair-Share Score, not by who clicked first.`, link: `/contests/${open.id}` });
      });
      s.notify(me.id, { type: "info", title: "You joined a contest", body: `${count} people want ${res.name} for this slot. Decision when the window closes.`, link: `/contests/${open.id}` });
    } else {
      const cid = id("ct");
      draft.contestId = cid;
      contests = [...contests, { id: cid, resourceId: b.resourceId, date: b.date, start: b.start, end, createdAt: at, windowClosesAt: new Date(Date.now() + (res.windowHours ?? 24) * 36e5).toISOString(), status: "open", requestIds: [bid] }];
      draft.timeline.push({ at, actor: "System", text: `Request window opened (${res.windowHours ?? 24}h)` });
      set({ bookings: [draft, ...s.bookings], contests });
      s.log("contest.request", res.name, `Request created; window opened (${res.windowHours ?? 24}h)`);
    }
    s.notify("u8", { type: "info", title: "New booking request", body: `${me.name} requested ${res.name} on ${b.date}.`, link: "/demand" });
    return bid;
  },
  closeWindow: (cid) => {
    const s = get();
    const c = s.contests.find((x) => x.id === cid);
    if (!c || c.status !== "open") return;
    const res = s.resources.find((r) => r.id === c.resourceId)!;
    const ranking = rankContest(c, s.bookings, s.users, res, s.weights);
    const rec = ranking.find((r) => r.rank === 1);
    set({ contests: s.contests.map((x) => (x.id === cid ? { ...x, status: "closed", ranking, recommendedId: rec?.bookingId, windowClosesAt: x.windowClosesAt < now() ? x.windowClosesAt : now() } : x)) });
    const at = { at: now(), actor: "System" };
    set((st) => ({ bookings: st.bookings.map((b) => (c.requestIds.includes(b.id) ? { ...b, timeline: [...b.timeline, { ...at, text: "Window closed — scores locked" }] } : b)) }));
    s.log("contest.window_closed", res.name, `${ranking.length} request(s); scores locked`);
    if (ranking.length > 1) {
      s.log("contest.scored", res.name, ranking.map((r) => `#${r.rank ?? "–"}`).join(", ") + " (scores visible to staff only)");
      s.log("contest.recommended", res.name, rec ? `Top eligible request ${rec.bookingId} recommended` : "No eligible request");
    } else s.log("contest.single", res.name, res.firstComeIfAlone === false ? "Single request — still ranked" : "Single request — sent to normal approval");
    ranking.forEach((r) => s.notify(r.userId, { type: "info", title: "Request window closed", body: `${res.name}: the manager will now confirm the result.`, link: `/contests/${cid}` }));
    s.notify("u8", { type: "info", title: "Contest ready for review", body: `${res.name} — ${ranking.length} request(s) ranked.`, link: `/contests/${cid}` });
  },
  fastForward: () => {
    get().contests.filter((c) => c.status === "open").forEach((c) => get().closeWindow(c.id));
  },
  confirmContest: (cid, winnerBookingId, override) => {
    const s = get();
    const me = s.me();
    const c = s.contests.find((x) => x.id === cid)!;
    const res = s.resources.find((r) => r.id === c.resourceId)!;
    let ranking = c.ranking ?? [];
    let winner = winnerBookingId;
    const skipped: string[] = [];
    if (!override) {
      // Re-check hard gates at confirmation: skip a winner who became ineligible or over quota.
      const fresh = rankContest(c, s.bookings, s.users, res, s.weights);
      for (const r of ranking.filter((x) => x.rank).sort((a, b) => a.rank! - b.rank!)) {
        const now2 = fresh.find((f) => f.bookingId === r.bookingId);
        if (now2?.eligible) { winner = r.bookingId; break; }
        skipped.push(r.bookingId);
        ranking = ranking.map((x) => (x.bookingId === r.bookingId ? { ...x, eligible: false, rank: undefined, missing: now2?.missing ?? "No longer eligible" } : x));
        s.log("contest.skip", res.name, `Recommended ${r.bookingId} became ineligible (${now2?.missing}); next applicant recommended`);
      }
    }
    const decided: Contest = { ...c, ranking, status: "decided", winnerId: winner, override, decidedBy: me.id, decidedAt: now(), skipped };
    let pos = 0;
    const order = ranking.filter((r) => r.eligible && r.bookingId !== winner).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
    const updates: Record<string, Partial<Booking>> = {};
    ranking.forEach((r) => {
      const why = explainResult(decided, r, s.weights).join(" ");
      if (r.bookingId === winner) updates[r.bookingId] = { status: "approved", reason: why };
      else if (!r.eligible) updates[r.bookingId] = { status: "rejected", reason: why };
      else {
        pos = order.findIndex((o) => o.bookingId === r.bookingId) + 1;
        updates[r.bookingId] = { status: "waitlisted", waitPos: pos, reason: `${why} You are #${pos} on the waiting list. If the slot frees up you'll get an offer to accept within 2 hours.` };
      }
    });
    set({
      contests: s.contests.map((x) => (x.id === cid ? decided : x)),
      bookings: s.bookings.map((b) => (updates[b.id] ? { ...b, ...updates[b.id], timeline: [...b.timeline, { at: now(), actor: `${me.name} (${me.role})`, text: `Result: ${updates[b.id].status}${override ? " (manager override)" : ""}` }] } : b)),
    });
    s.log(override ? "contest.override" : "contest.confirmed", res.name, override ? `Chose ${winner} over recommendation: ${override}` : `Confirmed recommendation ${winner}`);
    ranking.forEach((r) => {
      const st = updates[r.bookingId].status;
      s.notify(r.userId, { type: st === "waitlisted" ? "waitlist" : "approval", title: `Result published: ${res.name}`, body: st === "approved" ? "You got the slot!" : st === "waitlisted" ? `You're #${updates[r.bookingId].waitPos} on the waiting list.` : "Your request was not approved. See why.", link: `/contests/${cid}` });
    });
  },
  withdraw: (bid) => {
    const s = get();
    const b = s.bookings.find((x) => x.id === bid)!;
    const c = s.contests.find((x) => x.id === b.contestId && x.status === "open");
    s.cancelBooking(bid);
    if (c) {
      const left = c.requestIds.filter((r) => r !== bid);
      set((st) => ({ contests: st.contests.map((x) => (x.id === c.id ? { ...x, requestIds: left } : x)) }));
      s.log("contest.withdraw", s.resources.find((r) => r.id === c.resourceId)!.name, `Applicant withdrew; ${left.length} request(s) left`);
      left.forEach((rid) => { const o = s.bookings.find((x) => x.id === rid); if (o) s.notify(o.userId, { type: "info", title: "An applicant withdrew", body: `${left.length} request(s) now compete for this slot.`, link: `/contests/${c.id}` }); });
    }
  },
  acceptOffer: (bid) => {
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === bid ? { ...b, status: "approved", offerExpires: undefined, waitPos: undefined, reason: "You accepted a waiting-list offer after the slot was freed.", timeline: [...b.timeline, { at: now(), actor: "Applicant", text: "Accepted waiting-list offer" }] } : b)) }));
    get().log("contest.offer_accepted", bid, "Waitlist offer accepted");
  },
  declineOffer: (bid) => {
    const b = get().bookings.find((x) => x.id === bid)!;
    set((s) => ({ bookings: s.bookings.map((x) => (x.id === bid ? { ...x, status: "cancelled", offerExpires: undefined, timeline: [...x.timeline, { at: now(), actor: "Applicant", text: "Declined waiting-list offer" }] } : x)) }));
    get().log("contest.offer_declined", bid, "Waitlist offer declined");
    offerNext(b.contestId);
  },
  seedDemoContest: () => {
    const s = get();
    const role = s.role;
    const date = M.d(6);
    set({ role: "user" });
    // Use Asha (A) then Ravi (B) as requesters
    const asUser = (uid: string, start: string) => {
      const keep = M.DEMO_USER.user;
      M.DEMO_USER.user = uid;
      const bid = get().createBooking({ resourceId: "seminar-a", date, start, duration: 3, purpose: uid === "u16" ? "Course project showcase for the CS department" : "Mechanical club workshop", purposeCategory: uid === "u16" ? "Course project" : "Club event", attachments: [] });
      M.DEMO_USER.user = keep;
      return bid;
    };
    const b1 = asUser("u16", "10:00");
    asUser("u17", "12:00");
    set({ role });
    return get().bookings.find((b) => b.id === b1)!.contestId!;
  },
  escalate: (cid) => {
    set((s) => ({ contests: s.contests.map((c) => (c.id === cid ? { ...c, escalated: true } : c)) }));
    get().log("contest.escalated", cid, "Escalated to admin — manager did not act in time");
    get().notify("u14", { type: "info", title: "Contest escalated", body: "A contest is waiting for a decision.", link: `/contests/${cid}` });
  },
  requestInfo: (cid) => {
    const c = get().contests.find((x) => x.id === cid)!;
    set((s) => ({ contests: s.contests.map((x) => (x.id === cid ? { ...x, infoRequested: true } : x)) }));
    get().log("contest.info_requested", cid, "Manager asked applicants for more information");
    c.requestIds.forEach((rid) => { const b = get().bookings.find((x) => x.id === rid); if (b) get().notify(b.userId, { type: "info", title: "More information requested", body: "The manager asked for more details about your purpose. Reply at the help desk or by email.", link: `/contests/${cid}` }); });
  },
  watch: (cid) => {
    const me = get().me();
    set((s) => ({ watchers: { ...s.watchers, [cid]: [...new Set([...(s.watchers[cid] ?? []), me.id])] } }));
    get().log("contest.watch", cid, "Joined 'notify me if it frees up' list");
  },
  decide: (bid, decision, reason) => {
    const s = get();
    const me = s.me();
    const b = s.bookings.find((x) => x.id === bid)!;
    const res = s.resources.find((r) => r.id === b.resourceId)!;
    const override =
      (decision === "approved" && b.recommendation !== "approve") ||
      (decision === "rejected" && b.recommendation !== "reject") ||
      (decision === "waitlisted" && b.recommendation !== "waitlist");
    const waitPos = decision === "waitlisted" ? s.bookings.filter((x) => x.resourceId === b.resourceId && x.status === "waitlisted").length + 1 : undefined;
    set({
      bookings: s.bookings.map((x) =>
        x.id === bid ? { ...x, status: decision, reason, override, waitPos, timeline: [...x.timeline, { at: now(), actor: `${me.name} (${me.role})`, text: `Marked ${decision}${override ? " (override)" : ""}: ${reason}` }] } : x,
      ),
    });
    s.log(`booking.${decision}`, res.name, reason + (override ? " [override]" : ""));
    const titles = { approved: "Booking approved", rejected: "Booking not approved", waitlisted: "You're on the waiting list" };
    s.notify(b.userId, { type: decision === "waitlisted" ? "waitlist" : "approval", title: `${titles[decision]}: ${res.name}`, body: reason, link: "/bookings" });
  },
  cancelBooking: (bid) => {
    const wasWinner = get().bookings.find((x) => x.id === bid);
    if (wasWinner?.status === "approved" && wasWinner.contestId) setTimeout(() => offerNext(wasWinner.contestId), 0);
    set((s) => ({ bookings: s.bookings.map((x) => (x.id === bid ? { ...x, status: "cancelled", timeline: [...x.timeline, { at: now(), actor: "Applicant", text: "Cancelled by applicant" }] } : x)) }));
    get().log("booking.cancel", bid, "Cancelled by applicant");
  },
  verify: (status, info) => {
    const me = get().me();
    const updatedUsers = get().users.map((u) => (u.id === me.id ? { ...u, verified: status, enrollment: info.enrollment ?? u.enrollment, email: info.email ?? u.email } : u));
    set({ users: updatedUsers });
    get().log("user.verify", me.name, status === "verified" ? "Auto-verified via college email + OTP" : "Sent for manual review");
    if (typeof window !== "undefined") {
      try {
        const custom = updatedUsers.filter((u) => !M.users.some((mu) => mu.id === u.id));
        localStorage.setItem("campussphere_custom_users", JSON.stringify(custom));
      } catch {}
    }
  },
  adminVerify: (uid, ok) => {
    const u = get().users.find((x) => x.id === uid)!;
    set((s) => ({ users: s.users.map((x) => (x.id === uid ? { ...x, verified: ok ? "verified" : "none" } : x)) }));
    get().log(ok ? "user.verify" : "user.verify_reject", u.name, ok ? "ID checked manually" : "ID unclear, asked to resubmit");
    get().notify(uid, { type: "info", title: ok ? "You're verified" : "Verification needs another try", body: ok ? "You can now book spaces." : "Your ID photo was unclear. Please upload again.", link: "/verify" });
  },
  checkIn: (bid, items, notes, photos) => {
    set((s) => ({ bookings: s.bookings.map((x) => (x.id === bid ? { ...x, status: "active", checkin: { items, notes, photos, at: now() }, timeline: [...x.timeline, { at: now(), actor: "Applicant", text: `Checked in (${items.filter((i) => !i.ok).length} issues noted)` }] } : x)) }));
    get().log("booking.checkin", bid, "Condition checklist recorded");
  },
  penalizeLateCheckout: (userId, penaltyPoints, reason) => {
    const s = get();
    const user = s.users.find((u) => u.id === userId);
    if (!user) return;
    const oldScore = fairScore(user.factors, s.weights);
    const updatedUsers = s.users.map((u) => {
      if (u.id !== userId) return u;
      const currentPen = u.factors.penalties || 0;
      const currentRel = u.factors.reliability ?? 100;
      return {
        ...u,
        factors: {
          ...u.factors,
          penalties: currentPen + penaltyPoints,
          reliability: Math.max(20, currentRel - Math.round(penaltyPoints * 0.4)),
        },
      };
    });
    set({ users: updatedUsers });
    const nextUser = updatedUsers.find((u) => u.id === userId)!;
    const newScore = fairScore(nextUser.factors, s.weights);
    const detail = reason ?? `${penaltyPoints} penalty points for late checkout`;
    s.log("fair_score.late_penalty", user.name, `${detail} (Score: ${oldScore}% → ${newScore}%)`);
    s.notify(userId, {
      type: "info",
      title: "Fair-Share Score Decreased",
      body: `Late checkout recorded (-${penaltyPoints} pts). Your Fair-Share score decreased from ${oldScore}% to ${newScore}%. Punctual checkouts protect access for all students.`,
      link: "/fair-share",
    });
    if (typeof window !== "undefined") {
      try {
        const custom = updatedUsers.filter((u) => !M.users.some((mu) => mu.id === u.id));
        localStorage.setItem("campussphere_custom_users", JSON.stringify(custom));
      } catch {}
    }
  },

  resetFairScore: (userId) => {
    const s = get();
    const targetId = userId ?? s.me().id;
    const user = s.users.find((u) => u.id === targetId);
    const updatedUsers = s.users.map((u) => {
      if (u.id !== targetId) return u;
      return {
        ...u,
        factors: {
          capability: 100,
          urgency: 100,
          need: 100,
          skill: 100,
          reliability: 100,
          penalties: 0,
          lowUsage: 100,
          waiting: 100,
          purpose: 100,
        },
      };
    });
    set({ users: updatedUsers });
    s.log("fair_score.reset", user?.name ?? targetId, "Fair-Share score reset to initial 100% baseline");
    if (typeof window !== "undefined") {
      try {
        const custom = updatedUsers.filter((u) => !M.users.some((mu) => mu.id === u.id));
        localStorage.setItem("campussphere_custom_users", JSON.stringify(custom));
      } catch {}
    }
  },

  returnItem: (bid, items, notes, photos, simulatedLateMinutes) => {
    const s = get();
    const b = s.bookings.find((x) => x.id === bid);
    let lateMinutes = simulatedLateMinutes ?? 0;
    if (b && simulatedLateMinutes === undefined) {
      try {
        const [sh, sm] = b.start.split(":").map(Number);
        const endMin = sh * 60 + sm + b.duration * 60;
        const nowTime = new Date();
        const curDate = `${nowTime.getFullYear()}-${String(nowTime.getMonth() + 1).padStart(2, "0")}-${String(nowTime.getDate()).padStart(2, "0")}`;
        if (b.date === curDate) {
          const currentMin = nowTime.getHours() * 60 + nowTime.getMinutes();
          if (currentMin > endMin + 5) {
            lateMinutes = currentMin - endMin;
          }
        }
      } catch {}
    }

    const penaltyPoints = lateMinutes > 0 ? Math.min(50, Math.max(5, Math.ceil(lateMinutes / 15) * 5)) : 0;
    const timelineText = lateMinutes > 0
      ? `Returned and checked out (${lateMinutes}m late, -${penaltyPoints} pts Fair Score penalty)`
      : "Returned and checked out on time (100% clean return)";

    set((state) => ({
      bookings: state.bookings.map((x) =>
        x.id === bid
          ? {
              ...x,
              status: "completed",
              ret: { items, notes, photos, at: now() },
              timeline: [...x.timeline, { at: now(), actor: "Applicant", text: timelineText }],
            }
          : x
      ),
    }));

    get().log("booking.return", bid, timelineText);

    if (b && penaltyPoints > 0) {
      get().penalizeLateCheckout(b.userId, penaltyPoints, `${lateMinutes}m late checkout`);
    }
  },
  reportIncident: (i) => {
    const me = get().me();
    set((s) => ({ incidents: [{ ...i, id: id("inc"), reporterId: me.id, status: "open", at: now() }, ...s.incidents] }));
    if (i.bookingId) set((s) => ({ bookings: s.bookings.map((x) => (x.id === i.bookingId ? { ...x, timeline: [...x.timeline, { at: now(), actor: me.name, text: `Incident reported (${i.kind}, ${i.severity})` }] } : x)) }));
    get().log("incident.report", i.resourceId, `${i.kind} – ${i.severity}`);
    get().notify("u9", { type: "info", title: "New incident report", body: i.description.slice(0, 80), link: "/owner" });
  },
  reviewIncident: (iid, status, resolution) => {
    set((s) => ({ incidents: s.incidents.map((x) => (x.id === iid ? { ...x, status, resolution } : x)) }));
    get().log("incident.review", iid, `${status}: ${resolution}`);
  },

  register: (pid) => {
    const s = get();
    const me = s.me();
    const p = s.programs.find((x) => x.id === pid)!;
    if (p.registered.includes(me.id) || p.waitlist.includes(me.id)) return "already";
    const full = p.registered.length >= p.seats;
    set({ programs: s.programs.map((x) => (x.id === pid ? (full ? { ...x, waitlist: [...x.waitlist, me.id] } : { ...x, registered: [...x.registered, me.id] }) : x)) });
    if (p.category === "workshop" && !full) set((st) => ({ enrollments: [...st.enrollments, { programId: pid, userId: me.id, attended: 0 }] }));
    s.log(full ? "program.waitlist" : "program.register", p.title, p.category === "health" ? "Registered (details withheld)" : "");
    s.notify(me.id, { type: full ? "waitlist" : "reminder", title: full ? `Waitlisted: ${p.title}` : `Registered: ${p.title}`, body: full ? `You are #${p.waitlist.length + 1} on the waiting list. We'll alert you if a seat opens.` : `See you on ${p.date} at ${p.start}.` });
    return full ? "waitlisted" : "registered";
  },
  unregister: (pid) => {
    const me = get().me();
    set((s) => ({ programs: s.programs.map((x) => (x.id === pid ? { ...x, registered: x.registered.filter((u) => u !== me.id), waitlist: x.waitlist.filter((u) => u !== me.id) } : x)), enrollments: s.enrollments.filter((e) => !(e.programId === pid && e.userId === me.id)) }));
    get().log("program.unregister", pid, "");
  },
  seedApprovals: () => {
    const s = get();
    const at = now();
    const picks = [
      { u: "u2", r: "chem-lab-2", d: 2, t: "14:00", h: 2, p: "Titration practice for semester practical exam", c: "Exam preparation" },
      { u: "u3", r: "seminar-a", d: 3, t: "10:00", h: 2, p: "Coding club weekly meetup and talk", c: "Club event" },
      { u: "u4", r: "auditorium", d: 4, t: "11:00", h: 3, p: "Community awareness drive on digital safety", c: "Community event" },
    ];
    const made: Booking[] = picks.map((x) => {
      const u = s.users.find((y) => y.id === x.u) ?? s.users[0];
      const res = s.resources.find((y) => y.id === x.r) ?? s.resources[0];
      const draft: Booking = { id: id("b"), resourceId: res.id, userId: u.id, date: M.d(x.d), start: x.t, duration: x.h, purpose: x.p, purposeCategory: x.c, attachments: [], status: "pending", recommendation: "approve", createdAt: at, timeline: [{ at, actor: u.name, text: "Request submitted" }] };
      draft.recommendation = recommend(fairScore(u.factors, s.weights), eligibility(res, u).eligible, findConflicts(draft, s.bookings));
      return draft;
    });
    set({ bookings: [...made, ...s.bookings] });
    s.log("demo.seed", "Approvals", `${made.length} sample requests added`);
    return made.length;
  },
  createProgram: (p) => {
    const s = get();
    const pid = id("p");
    set({
      programs: [...s.programs, { ...p, id: pid, registered: [], waitlist: [] }],
      bookings: [{ id: id("bp"), resourceId: p.resourceId, userId: s.me().id, date: p.date, start: p.start, duration: p.duration, purpose: `Program: ${p.title}`, attachments: [], status: "approved", recommendation: "approve", programId: pid, reason: "Reserved automatically for a community program.", timeline: [{ at: now(), actor: "System", text: `Reserved for program "${p.title}"` }] }, ...s.bookings],
    });
    s.log("program.create", p.title, `Space reserved: ${p.resourceId}`);
    return pid;
  },
  askQuestion: (pid, text) => {
    const me = get().me();
    set((s) => ({ questions: [...s.questions, { id: id("q"), programId: pid, userId: me.id, text, votes: [], selected: false }] }));
  },
  upvote: (qid) => {
    const me = get().me();
    set((s) => ({ questions: s.questions.map((q) => (q.id === qid ? { ...q, votes: q.votes.includes(me.id) ? q.votes.filter((v) => v !== me.id) : [...q.votes, me.id] } : q)) }));
  },
  selectQuestion: (qid) => set((s) => ({ questions: s.questions.map((q) => (q.id === qid ? { ...q, selected: !q.selected } : q)) })),
  submitFeedback: (pid, rating, comment) => {
    const me = get().me();
    set((s) => ({ feedback: [...s.feedback.filter((f) => !(f.programId === pid && f.userId === me.id)), { programId: pid, userId: me.id, rating, comment }] }));
    get().log("program.feedback", pid, `${rating} stars`);
  },
  respondInvite: (iid, status, note) => {
    set((s) => ({ invites: s.invites.map((i) => (i.id === iid ? { ...i, status, note } : i)) }));
    get().log("invite.respond", iid, status + (note ? `: ${note}` : ""));
    get().notify("u8", { type: "info", title: `Speaker ${status === "reschedule" ? "suggested another time" : status}`, body: note ?? "", link: "/speakers" });
  },
  sendInvite: (speakerId, title, date) => {
    set((s) => ({ invites: [{ id: id("i"), speakerId, title, date, status: "sent" }, ...s.invites] }));
    const sp = get().speakers.find((x) => x.id === speakerId);
    if (sp?.userId) get().notify(sp.userId, { type: "info", title: "New speaker invitation", body: title, link: "/partner" });
    get().log("invite.send", sp?.name ?? speakerId, title);
  },

  bookSeat: (sb) => {
    const s = get();
    const me = s.me();
    const taken = s.seatBookings.some((x) => x.seatId === sb.seatId && x.date === sb.date && x.slot === sb.slot);
    if (taken) return { ok: false, msg: "That seat was just taken. Please pick another." };
    const weekCount = s.seatBookings.filter((x) => x.userId === me.id && Math.abs(new Date(x.date).getTime() - new Date(sb.date).getTime()) < 7 * 864e5).length;
    if (weekCount >= s.weights.maxStudyPerWeek) return { ok: false, msg: `Fair use limit: max ${s.weights.maxStudyPerWeek} sessions per week so everyone gets a chance.` };
    set({ seatBookings: [...s.seatBookings, { ...sb, id: id("sb"), userId: me.id, checkedIn: false }] });
    s.log("study.seat", `Seat ${sb.seatId}`, `${sb.date} ${sb.slot}`);
    return { ok: true, msg: "Seat booked" };
  },
  checkInSeat: (sid) => set((s) => ({ seatBookings: s.seatBookings.map((x) => (x.id === sid ? { ...x, checkedIn: true } : x)) })),
  setPriority: (v) => {
    const me = get().me();
    set((s) => ({ users: s.users.map((u) => (u.id === me.id ? { ...u, priorityNeed: v } : u)) }));
  },
  askDoubt: (subject, topic) => {
    const me = get().me();
    set((s) => ({ doubts: [...s.doubts, { id: id("dq"), userId: me.id, name: me.name.split(" ")[0] + " " + me.name.split(" ")[1]?.[0] + ".", subject, topic, status: "waiting" }] }));
  },
  updateDoubt: (did, status, volunteerId) => set((s) => ({ doubts: s.doubts.map((x) => (x.id === did ? { ...x, status, volunteerId: volunteerId ?? x.volunteerId } : x)) })),
  toggleDuty: (vid) => set((s) => ({ volunteers: s.volunteers.map((v) => (v.id === vid ? { ...v, onDuty: !v.onDuty } : v)) })),

  markAttendance: (pid, uid) => {
    const s = get();
    const p = s.programs.find((x) => x.id === pid)!;
    const enr = s.enrollments.map((e) => (e.programId === pid && e.userId === uid ? { ...e, attended: Math.min(p.sessions ?? 1, e.attended + 1) } : e));
    const e = enr.find((x) => x.programId === pid && x.userId === uid)!;
    let users = s.users;
    if (p.badge && e.attended / (p.sessions ?? 1) >= 0.75) {
      users = users.map((u) => (u.id === uid && !u.skills.includes(p.badge!) ? { ...u, skills: [...u.skills, p.badge!] } : u));
      if (!s.users.find((u) => u.id === uid)!.skills.includes(p.badge)) {
        s.notify(uid, { type: "info", title: `Badge earned: ${p.badge}`, body: p.unlocks ? `This unlocks ${s.resources.find((r) => r.id === p.unlocks)?.name}.` : "Added to your skills passport.", link: "/profile" });
      }
    }
    set({ enrollments: enr, users });
  },
  bookMockSlot: (sid) => {
    const me = get().me();
    set((s) => ({ mockSlots: s.mockSlots.map((m) => (m.id === sid ? { ...m, userId: m.userId === me.id ? undefined : me.id } : m)) }));
  },

  getToken: (campId, serviceId, anonymous) => {
    const s = get();
    const me = s.me();
    const num = s.tokens.filter((t) => t.campId === campId).length + 1;
    const mins = (num - 1) * 6;
    const slot = `${String(9 + Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    set({ tokens: [...s.tokens, { id: id("t"), campId, serviceId, userId: me.id, number: num, slot, anonymous }] });
    s.log("health.token", s.programs.find((p) => p.id === campId)!.title, "Token issued (service details withheld)");
    return num;
  },
  advanceServing: (campId) => set((s) => ({ nowServing: { ...s.nowServing, [campId]: Math.min((s.nowServing[campId] ?? 0) + 1, s.tokens.filter((t) => t.campId === campId).length) } })),

  bookHelp: (topic, date, slot) => {
    const me = get().me();
    set((s) => ({ helpAppts: [...s.helpAppts, { id: id("ha"), userId: me.id, name: me.name, topic, date, slot, status: "waiting" }] }));
    get().log("helpdesk.book", topic, `${date} ${slot}`);
  },
  serveHelp: (hid, notes, summary) => {
    const a = get().helpAppts.find((x) => x.id === hid)!;
    set((s) => ({ helpAppts: s.helpAppts.map((x) => (x.id === hid ? { ...x, status: "served", notes, summary } : x)) }));
    get().log("helpdesk.serve", `Appointment ${hid}`, "Marked served");
    if (summary) get().notify(a.userId, { type: "info", title: "Help desk summary", body: summary, link: "/notifications" });
  },

  signupShift: (pid, role, hours, date) => {
    const me = get().me();
    set((s) => ({ shifts: [...s.shifts, { id: id("sh"), userId: me.id, programId: pid, date, hours, role, status: "upcoming" }] }));
    get().log("volunteer.signup", pid, role);
  },
  completeShift: (sid) => {
    const sh = get().shifts.find((x) => x.id === sid)!;
    set((s) => ({ shifts: s.shifts.map((x) => (x.id === sid ? { ...x, status: "done" } : x)), users: s.users.map((u) => (u.id === sh.userId ? { ...u, hours: u.hours + sh.hours } : u)) }));
    get().log("volunteer.hours", sid, `${sh.hours}h logged`);
  },
  setWeights: (w) => {
    set((s) => ({ weights: { ...s.weights, ...w } }));
  },
  setUserRole: (uid, role) => {
    set((s) => ({ users: s.users.map((u) => (u.id === uid ? { ...u, role } : u)) }));
    get().log("user.role", uid, `Role set to ${role}`);
  },

  bookCinemaSeat: (data) => {
    const s = get();
    const me = s.me();
    const res = s.resources.find((r) => r.id === data.resourceId)!;
    const bid = id("b");
    const at = now();
    
    // Find slot definition
    const slot = res.slots?.find((sl) => sl.id === data.slotId) || { start: "11:00", end: "13:00", duration: 2, label: "11:00 - 13:00" };
    
    // Check competing requests on these seats
    const competing = s.bookings.filter(
      (b) => b.resourceId === data.resourceId && b.date === data.date && b.start === slot.start &&
      (b.status === "pending" || b.status === "waitlisted") &&
      b.seats?.some((st) => data.seatIds.includes(st))
    );

    const isInstant = Boolean(res.instantConfirm && competing.length === 0);
    const status = isInstant ? "approved" : "pending";
    const ticketCode = `CS-${data.resourceId.slice(0, 4).toUpperCase()}-${data.seatIds[0] || "ST"}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: bid,
      resourceId: data.resourceId,
      userId: me.id,
      date: data.date,
      start: slot.start,
      duration: slot.duration,
      purpose: data.purpose || `Seat Booking for ${data.seatIds.join(", ")}`,
      purposeCategory: data.purposeCategory || "Study & Research",
      attachments: [],
      status,
      recommendation: "approve",
      createdAt: at,
      bookingMode: "seats",
      seats: data.seatIds,
      isWholeLab: data.isWholeLab,
      groupSize: data.groupSize || data.seatIds.length,
      ticketCode,
      timeline: [
        { at, actor: me.name, text: isInstant ? "Confirmed instantly" : "Seat booking request submitted" }
      ],
    };

    set({ bookings: [newBooking, ...s.bookings] });
    s.log(
      isInstant ? "booking.seat_confirmed" : "booking.seat_requested",
      res.name,
      `${data.seatIds.join(", ")} on ${data.date} (${slot.start}) - ${isInstant ? "Instant Confirm" : "Queued"}`
    );

    s.notify(me.id, {
      type: "approval",
      title: isInstant ? `Confirmed: ${res.name}` : `Request Sent: ${res.name}`,
      body: `Seat ${data.seatIds.join(", ")} on ${data.date} at ${slot.start}. Ticket: ${ticketCode}`,
      link: "/bookings",
    });

    return { booking: newBooking, isInstant };
  },

  bookCinemaVenue: (data) => {
    const s = get();
    const me = s.me();
    const res = s.resources.find((r) => r.id === data.resourceId)!;
    const bid = id("b");
    const at = now();
    const startMin = toMin(data.start);
    const endMin = toMin(data.end);
    const duration = Math.max(1, Math.round((endMin - startMin) / 60));

    // Competing requests check
    const competing = s.bookings.filter(
      (b) => b.resourceId === data.resourceId && b.date === data.date &&
      (b.status === "pending" || b.status === "waitlisted") &&
      startMin < toMin(b.start) + b.duration * 60 && endMin > toMin(b.start)
    );

    const isInstant = Boolean(res.instantConfirm && competing.length === 0);
    const status = isInstant ? "approved" : "pending";
    const ticketCode = `CS-${data.resourceId.slice(0, 4).toUpperCase()}-VN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: bid,
      resourceId: data.resourceId,
      userId: me.id,
      date: data.date,
      start: data.start,
      duration,
      purpose: data.eventName,
      purposeCategory: data.purposeCategory,
      attachments: [],
      status,
      recommendation: "approve",
      createdAt: at,
      bookingMode: "whole_venue",
      eventName: data.eventName,
      expectedAttendees: data.expectedAttendees,
      ticketCode,
      timeline: [
        { at, actor: me.name, text: isInstant ? "Confirmed instantly" : "Venue booking request submitted" }
      ],
    };

    set({ bookings: [newBooking, ...s.bookings] });
    s.log(
      isInstant ? "booking.venue_confirmed" : "booking.venue_requested",
      res.name,
      `${data.eventName} on ${data.date} (${data.start}-${data.end}) - ${isInstant ? "Instant Confirm" : "Queued"}`
    );

    s.notify(me.id, {
      type: "approval",
      title: isInstant ? `Confirmed: ${res.name}` : `Request Sent: ${res.name}`,
      body: `${data.eventName} on ${data.date} (${data.start} to ${data.end}). Ticket: ${ticketCode}`,
      link: "/bookings",
    });

    return { booking: newBooking, isInstant };
  },

  extendBooking: (bid, hours) => {
    const s = get();
    const me = s.me();
    const b = s.bookings.find((x) => x.id === bid);
    if (!b) return;
    const newDuration = b.duration + hours;
    set({
      bookings: s.bookings.map((x) =>
        x.id === bid
          ? {
              ...x,
              duration: newDuration,
              extendedHours: (x.extendedHours || 0) + hours,
              timeline: [...x.timeline, { at: now(), actor: me.name, text: `Extended booking by +${hours} hour(s)` }],
            }
          : x
      ),
    });
    s.log("booking.extended", bid, `Extended by ${hours}h (total: ${newDuration}h)`);
    s.notify(me.id, {
      type: "info",
      title: "Booking Extended",
      body: `Your booking was extended by ${hours} hour(s).`,
      link: "/bookings",
    });
  },

  completeTraining: (skillName) => {
    const me = get().me();
    const updatedUsers = get().users.map((u) =>
      u.id === me.id ? { ...u, skills: [...new Set([...(u.skills || []), skillName])] } : u
    );
    set({ users: updatedUsers });
    get().log("user.training", me.name, `Completed training certification: ${skillName}`);
    get().notify(me.id, {
      type: "info",
      title: "Training Certified! 🎓",
      body: `You are now certified in "${skillName}". Equipment is unlocked!`,
      link: "/discover",
    });
  },
}));

function offerNext(cid?: string) {
  if (!cid) return;
  const s = useApp.getState();
  const next = s.bookings.filter((b) => b.contestId === cid && b.status === "waitlisted" && !b.offerExpires).sort((a, b) => (a.waitPos ?? 99) - (b.waitPos ?? 99))[0];
  const res = s.resources.find((r) => r.id === s.contests.find((c) => c.id === cid)?.resourceId);
  const exp = new Date(Date.now() + 2 * 36e5).toISOString();
  if (next) {
    useApp.setState({ bookings: s.bookings.map((b) => (b.id === next.id ? { ...b, offerExpires: exp, timeline: [...b.timeline, { at: now(), actor: "System", text: "Waiting-list offer sent (2 hours to accept)" }] } : b)) });
    s.notify(next.userId, { type: "waitlist", title: `The slot freed up: ${res?.name}`, body: "You're first on the waiting list. Accept within 2 hours or it goes to the next person.", link: "/bookings", expiresAt: exp });
    s.log("contest.offer_sent", res?.name ?? cid, `Offer sent to waitlist #${next.waitPos}`);
  }
  (s.watchers[cid] ?? []).forEach((u) => s.notify(u, { type: "info", title: "A slot you watched changed", body: `${res?.name}: check the latest status.`, link: `/contests/${cid}` }));
}

export const useMe = () =>
  useApp((s) => {
    if (s.currentUserId) {
      const current = s.users.find((u) => u.id === s.currentUserId);
      if (current && (current.role === s.role || !s.role)) {
        return current;
      }
    }
    if (s.loggedInUserId) {
      const logged = s.users.find((u) => u.id === s.loggedInUserId);
      if (logged && logged.role === s.role) {
        return logged;
      }
    }
    return s.users.find((u) => u.id === M.DEMO_USER[s.role]) ?? s.users[0];
  });
