export type Role = "user" | "owner" | "manager" | "volunteer" | "partner" | "admin";
export type VerifyStatus = "none" | "pending" | "verified";
export type BookingStatus =
  | "pending"
  | "approved"
  | "waitlisted"
  | "rejected"
  | "active"
  | "completed"
  | "cancelled";
export type Category = "study" | "career" | "workshop" | "health" | "scheme";

export interface FairFactors {
  lowUsage: number;
  waiting: number;
  purpose: number;
  skill: number;
  reliability: number;
  penalties: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  kind: "student" | "citizen" | "staff";
  dept?: string;
  enrollment?: string;
  verified: VerifyStatus;
  skills: string[];
  hours: number;
  avatar: string;
  factors: FairFactors;
  priorityNeed?: boolean;
}

export type ReqKind = "verified" | "student" | "skill" | "age18";
export interface Requirement {
  id: string;
  label: string;
  kind: ReqKind;
  skill?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: "lab" | "hall" | "classroom" | "equipment";
  dept: string;
  location: string;
  capacity: number;
  image: string;
  description: string;
  rules: string[];
  requirements: Requirement[];
  availability: string;
  ownerId: string;
  maxHours: number;
  checklist: string[];
  windowHours?: number;
  anonymous?: boolean;
  firstComeIfAlone?: boolean;
  maintenance?: boolean;
}

export interface TimelineEvent {
  at: string;
  actor: string;
  text: string;
}

export interface ConditionItem {
  item: string;
  ok: boolean;
  note?: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  date: string;
  start: string;
  duration: number;
  purpose: string;
  attachments: string[];
  status: BookingStatus;
  reason?: string;
  recommendation: "approve" | "waitlist" | "reject";
  override?: boolean;
  programId?: string;
  waitPos?: number;
  contestId?: string;
  purposeCategory?: string;
  createdAt?: string;
  offerExpires?: string;
  checkin?: { items: ConditionItem[]; notes: string; photos: string[]; at: string };
  ret?: { items: ConditionItem[]; notes: string; photos: string[]; at: string };
  timeline: TimelineEvent[];
}

export interface Incident {
  id: string;
  bookingId?: string;
  resourceId: string;
  reporterId: string;
  kind: "damage" | "delay" | "safety" | "other";
  severity: "low" | "medium" | "high";
  description: string;
  photos: string[];
  status: "open" | "reviewing" | "resolved";
  resolution?: string;
  at: string;
}

export interface Program {
  id: string;
  category: Category;
  title: string;
  description: string;
  date: string;
  start: string;
  duration: number;
  resourceId: string;
  seats: number;
  registered: string[];
  waitlist: string[];
  language: "English" | "Hindi" | "Bilingual";
  mode: "offline" | "online";
  speakerId?: string;
  agenda?: string[];
  level?: "Beginner" | "Intermediate";
  sessions?: number;
  prerequisites?: string[];
  instructor?: string;
  badge?: string;
  unlocks?: string;
  topic?: string;
  organiser?: string;
  partnerOrgId?: string;
  services?: { id: string; name: string; checklist: string[]; minutes: number; anonymous?: boolean }[];
  resources?: string[];
}

export interface Speaker {
  id: string;
  name: string;
  profession: string;
  org: string;
  topics: string[];
  languages: string[];
  availability: string;
  photo: string;
  userId?: string;
}

export interface Question {
  id: string;
  programId: string;
  userId: string;
  text: string;
  votes: string[];
  selected: boolean;
}

export interface Invite {
  id: string;
  speakerId: string;
  title: string;
  date: string;
  status: "sent" | "accepted" | "declined" | "reschedule";
  note?: string;
}

export interface Seat {
  id: string;
  row: string;
  zone: "quiet" | "general" | "group";
  reserved?: boolean;
}

export interface SeatBooking {
  id: string;
  seatId: string;
  userId: string;
  date: string;
  slot: string;
  exam: string;
  subject?: string;
  priority: boolean;
  checkedIn: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  subjects: string[];
  onDuty: boolean;
  userId?: string;
}

export interface Doubt {
  id: string;
  userId: string;
  name: string;
  subject: string;
  topic: string;
  status: "waiting" | "helping" | "resolved";
  volunteerId?: string;
}

export interface Enrollment {
  programId: string;
  userId: string;
  attended: number;
}

export interface Token {
  id: string;
  campId: string;
  serviceId: string;
  userId: string;
  number: number;
  slot: string;
  anonymous: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  benefit: string;
  eligibility: string;
  minAge: number;
  maxAge: number;
  education: string[];
  categories: string[];
  incomeMax: number;
  purposes: string[];
  documents: string[];
  deadline: string;
  steps: string[];
  faqs: { q: string; a: string }[];
}

export interface HelpAppt {
  id: string;
  userId: string;
  name: string;
  topic: string;
  date: string;
  slot: string;
  status: "waiting" | "served";
  notes?: string;
  summary?: string;
}

export interface Shift {
  id: string;
  userId: string;
  programId: string;
  date: string;
  hours: number;
  role: string;
  status: "upcoming" | "done";
}

export interface PartnerOrg {
  id: string;
  name: string;
  type: "Hospital" | "NGO" | "Company" | "Government";
  city: string;
  verified: boolean;
  focus: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "approval" | "reminder" | "cancellation" | "overdue" | "waitlist" | "info";
  title: string;
  body: string;
  at: string;
  read: boolean;
  link?: string;
  expiresAt?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  role: Role | "system";
  action: string;
  target: string;
  detail: string;
}

export interface Weights {
  lowUsage: number;
  waiting: number;
  purpose: number;
  skill: number;
  reliability: number;
  penalties: number;
  maxStudyPerWeek: number;
  maxBookingsPerWeek: number;
  maxBookingHours: number;
}

export interface RankEntry {
  bookingId: string;
  userId: string;
  score: number;
  factors: FairFactors;
  eligible: boolean;
  missing?: string;
  rank?: number;
  createdAt: string;
}

export interface Contest {
  id: string;
  resourceId: string;
  date: string;
  start: string;
  end: string;
  createdAt: string;
  windowClosesAt: string;
  status: "open" | "closed" | "decided";
  requestIds: string[];
  ranking?: RankEntry[];
  recommendedId?: string;
  skipped?: string[];
  winnerId?: string;
  override?: string;
  decidedBy?: string;
  decidedAt?: string;
  escalated?: boolean;
  infoRequested?: boolean;
}
