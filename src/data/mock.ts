import { addDays, format, addHours, startOfDay } from "date-fns";
import type {
  User, Resource, Booking, Incident, Program, Speaker, Question, Invite, Seat, SeatBooking,
  Volunteer, Doubt, Enrollment, Token, Scheme, HelpAppt, Shift, PartnerOrg, Notification,
  AuditEntry, Weights, BookingStatus, Contest,
} from "./types";
import {
  createComputerLabLayout,
  create3DPrinterLayout,
  createElectronicsLayout,
  createStudyHallLayout,
  DEFAULT_SLOTS,
  STUDY_SLOTS,
} from "./cinemaMock";

export const TODAY = startOfDay(new Date());
export const d = (n: number) => format(addDays(TODAY, n), "yyyy-MM-dd");
export const ts = (hours: number) => addHours(TODAY, hours).toISOString();
const av = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e0e7ff,ccfbf1,fef3c7`;
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

export const DEMO_USER: Record<string, string> = {
  user: "u1", owner: "u6", manager: "u8", volunteer: "u10", partner: "u12", admin: "u14",
};

const F = (a: number, b: number, c: number, s: number, r: number, p: number) => ({
  lowUsage: a, waiting: b, purpose: c, skill: s, reliability: r, penalties: p,
});

export const users: User[] = [
  { id: "u1", name: "Aarav Sharma", role: "user", email: "aarav.s@stxavier.edu.in", kind: "student", dept: "B.Sc. Physics", enrollment: "SXC22PHY041", verified: "none", skills: [], hours: 0, avatar: av("Aarav"), factors: F(90, 40, 75, 30, 85, 0) },
  { id: "u2", name: "Meera Iyer", role: "user", email: "meera.iyer@gmail.com", kind: "citizen", verified: "verified", skills: ["Computer Basics"], hours: 0, avatar: av("Meera"), factors: F(70, 60, 80, 50, 90, 0) },
  { id: "u3", name: "Rohan Das", role: "user", email: "rohan.d@stxavier.edu.in", kind: "student", dept: "B.Tech ECE", enrollment: "SXC21ECE007", verified: "verified", skills: ["Lab Safety", "Electronics Basics"], hours: 4, avatar: av("Rohan"), factors: F(40, 30, 85, 90, 70, 10) },
  { id: "u4", name: "Fatima Khan", role: "user", email: "fatima.k@stxavier.edu.in", kind: "student", dept: "B.Sc. Chemistry", enrollment: "SXC23CHE019", verified: "pending", skills: ["Lab Safety"], hours: 0, avatar: av("Fatima"), factors: F(95, 70, 90, 60, 80, 0), priorityNeed: true },
  { id: "u5", name: "Kabir Singh", role: "user", email: "kabir.s@stxavier.edu.in", kind: "student", dept: "BMM Media", enrollment: "SXC22BMM033", verified: "verified", skills: ["Camera Handling"], hours: 2, avatar: av("Kabir"), factors: F(55, 20, 60, 80, 60, 25) },
  { id: "u6", name: "Dr. Anil Mehta", role: "owner", email: "anil.mehta@stxavier.edu.in", kind: "staff", dept: "Chemistry (HoD)", verified: "verified", skills: [], hours: 0, avatar: av("Anil"), factors: F(50, 50, 50, 50, 50, 0) },
  { id: "u7", name: "Prof. Sunita Rao", role: "owner", email: "sunita.rao@stxavier.edu.in", kind: "staff", dept: "Media & Engineering", verified: "verified", skills: [], hours: 0, avatar: av("Sunita"), factors: F(50, 50, 50, 50, 50, 0) },
  { id: "u8", name: "Vikram Nair", role: "manager", email: "vikram.nair@stxavier.edu.in", kind: "staff", dept: "Events Office", verified: "verified", skills: [], hours: 0, avatar: av("Vikram"), factors: F(50, 50, 50, 50, 50, 0) },
  { id: "u9", name: "Priya Menon", role: "manager", email: "priya.menon@stxavier.edu.in", kind: "staff", dept: "Lab Assistant", verified: "verified", skills: [], hours: 0, avatar: av("Priya"), factors: F(50, 50, 50, 50, 50, 0) },
  { id: "u10", name: "Neha Joshi", role: "volunteer", email: "neha.j@stxavier.edu.in", kind: "student", dept: "M.Sc. Maths", verified: "verified", skills: ["Computer Basics"], hours: 46, avatar: av("Neha"), factors: F(60, 40, 70, 70, 95, 0) },
  { id: "u11", name: "Arjun Patel", role: "volunteer", email: "arjun.p@gmail.com", kind: "citizen", verified: "verified", skills: [], hours: 28, avatar: av("Arjun"), factors: F(60, 40, 70, 60, 90, 0) },
  { id: "u12", name: "Dr. Kavita Bose", role: "partner", email: "kavita@sevahospital.org", kind: "citizen", dept: "Seva Community Hospital", verified: "verified", skills: [], hours: 12, avatar: av("Kavita"), factors: F(50, 50, 50, 50, 50, 0) },
  { id: "u13", name: "Sameer Qureshi", role: "partner", email: "sameer@brightbyte.io", kind: "citizen", dept: "BrightByte Labs", verified: "verified", skills: [], hours: 6, avatar: av("Sameer"), factors: F(50, 50, 50, 50, 50, 0) },
  { id: "u14", name: "Lakshmi Pillai", role: "admin", email: "registrar@stxavier.edu.in", kind: "staff", dept: "Administration", verified: "verified", skills: [], hours: 0, avatar: av("Lakshmi"), factors: F(50, 50, 50, 50, 50, 0) },
  { id: "u16", name: "Asha Verma", role: "user", email: "asha.v@stxavier.edu.in", kind: "student", dept: "Computer Science", enrollment: "SXC22CSE014", verified: "verified", skills: ["Computer Basics"], hours: 0, avatar: av("Asha"), factors: F(95, 60, 90, 70, 90, 0) },
  { id: "u17", name: "Ravi Kulkarni", role: "user", email: "ravi.k@stxavier.edu.in", kind: "student", dept: "Mechanical", enrollment: "SXC21MEC022", verified: "verified", skills: ["Lab Safety"], hours: 0, avatar: av("Ravi"), factors: F(25, 30, 60, 75, 60, 8) },
  { id: "u15", name: "Ishaan Gupta", role: "user", email: "ishaan.g@stxavier.edu.in", kind: "student", dept: "B.Com", enrollment: "SXC23COM052", verified: "verified", skills: ["Computer Basics"], hours: 0, avatar: av("Ishaan"), factors: F(80, 55, 65, 50, 75, 5) },
];

const R = (id: string, label: string, kind: "verified" | "student" | "skill" | "age18", skill?: string) => ({ id, label, kind, skill });
const verifiedReq = R("r-ver", "Identity verified", "verified");

export const resources: Resource[] = [
  // 1. Computer Lab 4: Mode 1 (Seats) - 30 seats, 6x5, 4 slots/day
  {
    id: "comp-lab-4",
    name: "Computer Lab 4",
    type: "lab",
    dept: "Computer Science",
    location: "IT Block, 3rd floor",
    capacity: 30,
    bookingMode: "seat",
    seatLayout: createComputerLabLayout(),
    slots: DEFAULT_SLOTS,
    maxSeatsPerBooking: 5,
    image: u("photo-1517694712202-14dd9538aa97"),
    description: "30 high-speed developer workstations with coding environments, dual monitors and gigabit LAN. Fast-track cinema style seat booking.",
    rules: ["No food or unsealed drinks", "Save files to network drive or USB", "Log out before leaving"],
    requirements: [verifiedReq, R("r-cb", "Computer Basics badge", "skill", "Computer Basics")],
    availability: "Daily, 9 AM – 6 PM",
    ownerId: "u6",
    maxHours: 4,
    checklist: ["Workstation boots", "Peripherals connected", "Desk clean and sanitized"],
  },

  // 2. 3D Printer Bay: Mode 1 (Seats / Equipment Stations) - 4 printers
  {
    id: "printer-3d",
    name: "3D Printer Bay",
    type: "equipment",
    dept: "Mechanical",
    location: "Innovation Hub, Ground Floor",
    capacity: 4,
    bookingMode: "seat",
    seatLayout: create3DPrinterLayout(),
    slots: DEFAULT_SLOTS,
    maxSeatsPerBooking: 1,
    image: u("photo-1631541909061-71e349d1f203"),
    description: "Four precision FDM 3D printers with PLA, PETG and high-temp industrial nozzles. Requires safety certification on high-temp unit.",
    rules: ["Max 4 hours print run per reservation", "Check bed adhesion before walking away", "Report filament jams"],
    requirements: [verifiedReq, R("r-stu", "Enrolled college student", "student")],
    availability: "Mon–Fri, 9 AM – 6 PM",
    ownerId: "u7",
    maxHours: 4,
    checklist: ["Nozzle clean and clear", "Print bed leveled", "Spool intact and fed"],
  },

  // 3. Electronics Lab: Mode 1 (Seats / Benches) - 12 benches
  {
    id: "electronics",
    name: "Electronics Lab",
    type: "lab",
    dept: "ECE",
    location: "Engineering Block, 1st floor",
    capacity: 12,
    bookingMode: "seat",
    seatLayout: createElectronicsLayout(),
    slots: DEFAULT_SLOTS,
    maxSeatsPerBooking: 2,
    image: u("photo-1518770660439-4636190af475"),
    description: "12 high-grade electronics workstations equipped with digital oscilloscopes, function generators, DC supplies and fume-extracted soldering.",
    rules: ["Switch off soldering irons immediately", "Return all discrete components to designated bins", "Wear ESD wristbands"],
    requirements: [verifiedReq, R("r-elb", "Electronics Basics badge", "skill", "Electronics Basics")],
    availability: "Mon–Fri, 9 AM – 6 PM",
    ownerId: "u6",
    maxHours: 3,
    checklist: ["Soldering irons powered off", "Scopes calibrated", "Tools organized"],
  },

  // 4. Seminar Hall A: Mode 2 (Whole-Venue) - 200 capacity
  {
    id: "seminar-a",
    name: "Seminar Hall A",
    type: "hall",
    dept: "Administration",
    location: "Main Building, Ground floor",
    capacity: 200,
    bookingMode: "venue",
    instantConfirm: false,
    image: u("photo-1505373877841-8d25f7d46678"),
    description: "Air-conditioned 200-seat acoustic amphitheatre with dual 4K laser projectors, wireless microphones, and lecture capture facilities.",
    rules: ["Leave hall in clean tiered configuration", "Sound system operated via podium tablet", "No catering inside hall"],
    requirements: [verifiedReq],
    availability: "Daily, 9 AM – 9 PM",
    ownerId: "u7",
    maxHours: 6,
    checklist: ["Projector power off", "Podium locked", "Seats undamaged", "Trash cleared"],
  },

  // 5. Main Auditorium: Mode 2 (Whole-Venue) - 500 capacity, Instant Confirm ON
  {
    id: "auditorium",
    name: "Main Auditorium",
    type: "hall",
    dept: "Administration",
    location: "Central Campus Plaza",
    capacity: 500,
    bookingMode: "venue",
    instantConfirm: true,
    image: u("photo-1503095396549-807759245b35"),
    description: "Flagship 500-seat auditorium with professional theatrical lighting, dual green rooms, and orchestra pit. Instant confirmation for certified faculty.",
    rules: ["Requires 48-hour cancellation notice", "Fire exits must remain completely unblocked", "No open flames"],
    requirements: [verifiedReq, R("r-18", "Applicant is 18+", "age18")],
    availability: "Weekends & Evenings, 9 AM – 9 PM",
    ownerId: "u7",
    maxHours: 8,
    checklist: ["Stage washed", "Rigging secured", "Emergency exits clear", "Audio racks off"],
  },

  // Other Campus Spaces
  {
    id: "study-hall",
    name: "Study Center Hall",
    type: "hall",
    dept: "Library",
    location: "Library Annex, Block C",
    capacity: 60,
    bookingMode: "seat",
    seatLayout: createStudyHallLayout(),
    slots: STUDY_SLOTS,
    maxSeatsPerBooking: 1,
    image: u("photo-1521587760476-6c12a4b040da"),
    description: "60 individual study cubicles with power sockets, noise-dampening dividers and high-speed Wi-Fi.",
    rules: ["Strict silence policy", "Do not reserve seats for unattended friends"],
    requirements: [verifiedReq],
    availability: "Daily, 7 AM – 9 PM",
    ownerId: "u6",
    maxHours: 4,
    checklist: ["Desk clean", "Chair aligned", "Trash disposed"],
  },
  {
    id: "chem-lab-2",
    name: "Chemistry Lab 2",
    type: "lab",
    dept: "Chemistry",
    location: "Science Block, 2nd floor",
    capacity: 30,
    bookingMode: "seat",
    slots: DEFAULT_SLOTS,
    image: u("photo-1532094349884-543bc11b234d"),
    description: "Fully equipped wet lab with 15 workbenches, fume hoods and safety showers.",
    rules: ["Lab coat and goggles mandatory", "No food or drink"],
    requirements: [verifiedReq, R("r-stu", "Enrolled college student", "student"), R("r-safe", "Lab Safety badge", "skill", "Lab Safety")],
    availability: "Mon–Sat, 2 PM – 6 PM",
    ownerId: "u6",
    maxHours: 3,
    checklist: ["Fume hoods working", "Glassware intact", "Benches clean"],
  },
  {
    id: "laser",
    name: "Laser Cutter Bay",
    type: "equipment",
    dept: "Mechanical",
    location: "Innovation Hub",
    capacity: 2,
    bookingMode: "seat",
    slots: DEFAULT_SLOTS,
    image: u("photo-1581092160562-40aa08e78837"),
    description: "40W CO2 laser cutter for wood, acrylic and card. Supervised use only.",
    rules: ["Never leave running unattended", "Approved materials only"],
    requirements: [verifiedReq, R("r-safe", "Lab Safety badge", "skill", "Lab Safety")],
    availability: "Tue & Thu, 11 AM – 4 PM",
    ownerId: "u7",
    maxHours: 2,
    checklist: ["Lens clean", "Exhaust working", "Bed clear"],
  },
  {
    id: "podcast",
    name: "Podcast Studio",
    type: "classroom",
    dept: "Media Studies",
    location: "Media Lab, Room 12",
    capacity: 4,
    bookingMode: "seat",
    slots: DEFAULT_SLOTS,
    image: u("photo-1590602847861-f357a9332bbc"),
    description: "Soundproofed booth with 4 broadcast microphones, audio interface and monitor headphones.",
    rules: ["Headphones must be returned to rack", "No drinks near sound board"],
    requirements: [verifiedReq],
    availability: "Mon–Sat, 11 AM – 7 PM",
    ownerId: "u7",
    maxHours: 2,
    checklist: ["4 mics working", "Mixer powered off"],
  },
  {
    id: "drone",
    name: "Drone Arena",
    type: "lab",
    dept: "Engineering",
    location: "Sports Complex",
    capacity: 10,
    bookingMode: "venue",
    image: u("photo-1473968512647-3e447244af8f"),
    description: "Netted indoor arena for autonomous drone testing and robotics flight maneuvers.",
    rules: ["Propeller guards mandatory", "Max 2 drones active simultaneously"],
    requirements: [verifiedReq, R("r-stu", "Enrolled college student", "student")],
    availability: "Sat, 10 AM – 4 PM",
    ownerId: "u7",
    maxHours: 2,
    checklist: ["Nets intact", "Floor clear", "Chargers off"],
  },
];

export const speakers: Speaker[] = [
  { id: "sp1", name: "Sameer Qureshi", profession: "Software Engineer", org: "BrightByte Labs", topics: ["Getting your first tech job", "Open source"], languages: ["English", "Hindi"], availability: "Weekends", photo: av("Sameer"), userId: "u13" },
  { id: "sp2", name: "Dr. Kavita Bose", profession: "Doctor", org: "Seva Community Hospital", topics: ["Careers in medicine", "Student wellbeing"], languages: ["English", "Bengali"], availability: "1st Saturday", photo: av("Kavita"), userId: "u12" },
  { id: "sp3", name: "Rajesh Kulkarni (IAS, retd.)", profession: "Government Officer", org: "Former District Collector", topics: ["Cracking UPSC", "Public service"], languages: ["Hindi", "Marathi", "English"], availability: "Monthly", photo: av("Rajesh") },
  { id: "sp4", name: "Ananya Reddy", profession: "Entrepreneur", org: "GreenCart Foods", topics: ["Starting small", "Rural startups"], languages: ["English", "Telugu"], availability: "Evenings", photo: av("Ananya") },
  { id: "sp5", name: "Pooja Verma", profession: "Successful Student", org: "AIR 112, JEE Advanced", topics: ["Study routines", "Beating exam stress"], languages: ["Hindi", "English"], availability: "Weekends", photo: av("Pooja") },
  { id: "sp6", name: "Thomas George", profession: "Industry Professional", org: "Tata Steel (Plant Head)", topics: ["Core engineering careers", "Leadership"], languages: ["English"], availability: "Quarterly", photo: av("Thomas") },
];

const base = (p: Partial<Program> & Pick<Program, "id" | "category" | "title" | "date" | "resourceId">): Program => ({
  description: "", start: "10:00", duration: 2, seats: 60, registered: [], waitlist: [], language: "English", mode: "offline", ...p,
});

export const programs: Program[] = [
  base({ id: "study", category: "study", title: "Free Study Center", description: "A calm, free place to study every day, with volunteers to help with doubts.", date: d(0), start: "07:00", duration: 14, resourceId: "study-hall", seats: 60, language: "Bilingual" }),
  base({ id: "c1", category: "career", title: "Your First Tech Job: A Roadmap", description: "A software engineer shares how to go from zero to a first job in tech — skills, portfolios and interviews.", date: d(2), start: "11:00", resourceId: "seminar-a", seats: 120, registered: ["u3", "u15", "u5"], speakerId: "sp1", agenda: ["11:00 Welcome", "11:10 The roadmap", "11:50 Portfolio walkthrough", "12:20 Q&A"], language: "Bilingual", resources: ["Slides: Tech roadmap (PDF)", "Free learning links list"] }),
  base({ id: "c2", category: "career", title: "Careers in Medicine Beyond MBBS", description: "Nursing, pharmacy, lab technology, public health — paths in healthcare explained by a practising doctor.", date: d(5), start: "15:00", resourceId: "seminar-a", seats: 4, registered: ["u3", "u4", "u5", "u15"], waitlist: ["u2"], speakerId: "sp2", agenda: ["15:00 Paths in healthcare", "15:40 Entrance exams", "16:10 Q&A"] }),
  base({ id: "c3", category: "career", title: "Cracking UPSC: Honest Advice", description: "A retired IAS officer on preparation strategy, optional subjects and staying motivated.", date: d(8), start: "10:00", resourceId: "auditorium", seats: 400, registered: ["u2", "u4"], speakerId: "sp3", language: "Hindi", agenda: ["10:00 Talk", "11:00 Q&A"] }),
  base({ id: "c4", category: "career", title: "Starting Small: Rural Startup Stories", description: "Building a food business from a village kitchen to 3 states.", date: d(12), start: "17:00", resourceId: "seminar-a", seats: 120, speakerId: "sp4", mode: "online", agenda: ["17:00 Story", "17:45 Q&A"] }),
  base({ id: "c5", category: "career", title: "Study Routines That Actually Work", description: "A JEE top-rank student on daily routines, revision and handling stress.", date: d(-6), start: "16:00", resourceId: "seminar-a", seats: 120, registered: ["u1", "u3", "u15"], speakerId: "sp5", language: "Hindi", agenda: ["16:00 Talk", "16:45 Q&A"], resources: ["Recording (52 min)", "Sample weekly timetable (PDF)"] }),
  base({ id: "c6", category: "career", title: "Core Engineering Careers", description: "What working in a steel plant, power or manufacturing really looks like.", date: d(15), start: "14:00", resourceId: "auditorium", seats: 300, speakerId: "sp6", agenda: ["14:00 Talk", "15:00 Q&A"] }),
  base({ id: "w1", category: "workshop", title: "Computer Basics", topic: "Coding and computer basics", description: "Typing, files, internet safety, email and online forms. Completing it unlocks Computer Lab 4.", date: d(1), start: "16:00", resourceId: "comp-lab-4", seats: 30, level: "Beginner", sessions: 4, instructor: "Neha Joshi", prerequisites: [], badge: "Computer Basics", unlocks: "comp-lab-4", registered: ["u2"], language: "Bilingual" }),
  base({ id: "w2", category: "workshop", title: "AI Tools for Everyday Work", topic: "AI and technology", description: "Use free AI tools safely for writing, research and learning.", date: d(4), start: "16:00", resourceId: "comp-lab-4", seats: 30, level: "Intermediate", sessions: 3, instructor: "Sameer Qureshi", prerequisites: ["Computer Basics"], badge: "AI Literacy" }),
  base({ id: "w3", category: "workshop", title: "Spoken English Confidence", topic: "English speaking", description: "Practise everyday conversation in a friendly group.", date: d(3), start: "10:00", resourceId: "podcast", seats: 12, level: "Beginner", sessions: 6, instructor: "Arjun Patel", prerequisites: [], badge: "Spoken English", language: "Bilingual" }),
  base({ id: "w4", category: "workshop", title: "Resume Building Clinic", topic: "Resume building", description: "Write a one-page resume that gets read. Bring your details.", date: d(6), start: "14:00", resourceId: "seminar-a", seats: 40, level: "Beginner", sessions: 2, instructor: "Priya Menon", prerequisites: [], badge: "Resume Ready" }),
  base({ id: "w5", category: "workshop", title: "Interview Preparation", topic: "Interview preparation", description: "Common questions, body language and two mock rounds.", date: d(9), start: "14:00", resourceId: "seminar-a", seats: 30, level: "Intermediate", sessions: 3, instructor: "Vikram Nair", prerequisites: ["Resume Ready"], badge: "Interview Ready" }),
  base({ id: "w6", category: "workshop", title: "Communication Skills", topic: "Communication skills", description: "Listening, presenting and teamwork through games and role-play.", date: d(-10), start: "11:00", resourceId: "seminar-a", seats: 40, level: "Beginner", sessions: 4, instructor: "Neha Joshi", prerequisites: [], badge: "Communicator", registered: ["u1", "u3"] }),
  base({ id: "h1", category: "health", title: "Community Health Check Camp", organiser: "Seva Community Hospital", partnerOrgId: "o1", description: "Free basic checkups and screening for students, staff and neighbours.", date: d(3), start: "09:00", duration: 6, resourceId: "auditorium", seats: 300, registered: ["u2", "u3", "u4", "u5", "u15"], services: [
    { id: "s-basic", name: "Basic checkup", checklist: ["Bring any old prescriptions"], minutes: 6 },
    { id: "s-bp", name: "Blood pressure & diabetes screening", checklist: ["Fast for 8–10 hours before (water is fine)", "Bring previous sugar reports if any"], minutes: 5 },
    { id: "s-mh", name: "Mental health awareness", checklist: ["No preparation needed"], minutes: 20, anonymous: true },
    { id: "s-nut", name: "Nutrition session", checklist: ["Optional: note what you ate yesterday"], minutes: 15 },
    { id: "s-talk", name: "Health awareness talk", checklist: ["No preparation needed"], minutes: 30 },
  ] }),
  base({ id: "h2", category: "health", title: "Eye & Dental Screening Day", organiser: "Lions Club Seva Trust", partnerOrgId: "o3", description: "Vision and dental checkups with referrals to partner clinics.", date: d(17), start: "09:00", duration: 5, resourceId: "seminar-a", seats: 150, services: [
    { id: "s-basic", name: "Basic checkup", checklist: ["Bring spectacles if you use them"], minutes: 6 },
    { id: "s-talk", name: "Health awareness talk", checklist: ["No preparation needed"], minutes: 30 },
  ] }),
  base({ id: "h3", category: "health", title: "Women's Wellness Camp", organiser: "Seva Community Hospital", partnerOrgId: "o1", description: "Anaemia screening, nutrition and a confidential mental health session.", date: d(-14), start: "10:00", duration: 4, resourceId: "seminar-a", seats: 120, services: [
    { id: "s-bp", name: "Blood pressure & diabetes screening", checklist: ["Fast for 8–10 hours"], minutes: 5 },
    { id: "s-mh", name: "Mental health awareness", checklist: ["No preparation needed"], minutes: 20, anonymous: true },
  ] }),
  base({ id: "g1", category: "scheme", title: "Government Scheme Help Desk", description: "Volunteers help you find and apply for scholarships and government schemes.", date: d(0), start: "10:00", duration: 6, resourceId: "podcast", seats: 30, language: "Bilingual" }),
];

export const questions: Question[] = [
  { id: "q1", programId: "c1", userId: "u3", text: "Do I need a CS degree to get a software job?", votes: ["u5", "u15"], selected: true },
  { id: "q2", programId: "c1", userId: "u15", text: "How many projects should a beginner portfolio have?", votes: ["u3"], selected: false },
  { id: "q3", programId: "c1", userId: "u5", text: "Is it okay to learn in Hindi first?", votes: [], selected: false },
];

export const invites: Invite[] = [
  { id: "i1", speakerId: "sp2", title: "Careers in Medicine Beyond MBBS", date: d(5), status: "accepted" },
  { id: "i2", speakerId: "sp2", title: "Student Wellbeing Talk", date: d(20), status: "sent" },
  { id: "i3", speakerId: "sp1", title: "AI Tools for Everyday Work (guest session)", date: d(4), status: "sent" },
];

const rows = ["A", "B", "C", "D", "E", "F"];
export const seats: Seat[] = rows.flatMap((row, ri) =>
  Array.from({ length: 10 }, (_, i) => ({
    id: `${row}${i + 1}`, row,
    zone: (ri < 2 ? "quiet" : ri > 3 ? "group" : "general") as Seat["zone"],
    reserved: (row === "C" && i < 2) || (row === "A" && i === 0),
  })),
);

export const SLOTS = ["Morning (7–11)", "Afternoon (12–4)", "Evening (5–9)", "Weekend (9–5)"];
export const EXAMS = ["UPSC", "SSC", "JEE", "NEET", "GATE", "Bank", "Other"];
export const SUBJECTS = ["Maths", "Physics", "English", "Reasoning", "General Studies", "Coding"];

const busySeats = ["A2", "A3", "A5", "B1", "B4", "B7", "C4", "C5", "C9", "D1", "D2", "D6", "D8", "E1", "E2", "E3", "F5", "F6", "B9", "A8", "C7", "D10"];
export const seatBookings: SeatBooking[] = busySeats.map((s, i) => ({
  id: `sb${i}`, seatId: s, userId: ["u3", "u4", "u5", "u15", "u2"][i % 5], date: d(0), slot: SLOTS[i % 3], exam: EXAMS[i % 7], priority: i === 3, checkedIn: i % 2 === 0,
}));
seatBookings.push({ id: "sbx1", seatId: "B2", userId: "u1", date: d(-2), slot: SLOTS[0], exam: "GATE", priority: false, checkedIn: true });
seatBookings.push({ id: "sbx2", seatId: "B2", userId: "u1", date: d(-5), slot: SLOTS[0], exam: "GATE", priority: false, checkedIn: true });

export const volunteers: Volunteer[] = [
  { id: "v1", name: "Neha Joshi", subjects: ["Maths", "Reasoning"], onDuty: true, userId: "u10" },
  { id: "v2", name: "Arjun Patel", subjects: ["English", "General Studies"], onDuty: true, userId: "u11" },
  { id: "v3", name: "Sana Sheikh", subjects: ["Physics", "Maths"], onDuty: true },
  { id: "v4", name: "Dev Malhotra", subjects: ["Coding"], onDuty: false },
  { id: "v5", name: "Ritika Ghosh", subjects: ["General Studies", "English"], onDuty: true },
  { id: "v6", name: "Manoj Yadav", subjects: ["Reasoning", "Maths"], onDuty: false },
  { id: "v7", name: "Aisha Rahman", subjects: ["Physics"], onDuty: false },
  { id: "v8", name: "Karan Bedi", subjects: ["Coding", "Maths"], onDuty: true },
];

export const doubts: Doubt[] = [
  { id: "dq1", userId: "u4", name: "Fatima K.", subject: "Physics", topic: "Rotational motion numericals", status: "helping", volunteerId: "v3" },
  { id: "dq2", userId: "u15", name: "Ishaan G.", subject: "Reasoning", topic: "Blood relation puzzles", status: "waiting" },
  { id: "dq3", userId: "u5", name: "Kabir S.", subject: "English", topic: "Essay structure", status: "resolved", volunteerId: "v2" },
];

export const enrollments: Enrollment[] = [
  { programId: "w6", userId: "u1", attended: 3 },
  { programId: "w6", userId: "u3", attended: 4 },
  { programId: "w1", userId: "u2", attended: 4 },
];

export const tokens: Token[] = [
  { id: "t1", campId: "h1", serviceId: "s-basic", userId: "u3", number: 1, slot: "09:00", anonymous: false },
  { id: "t2", campId: "h1", serviceId: "s-bp", userId: "u2", number: 2, slot: "09:06", anonymous: false },
  { id: "t3", campId: "h1", serviceId: "s-mh", userId: "u4", number: 3, slot: "09:12", anonymous: true },
  { id: "t4", campId: "h1", serviceId: "s-basic", userId: "u5", number: 4, slot: "09:18", anonymous: false },
];

export const schemes: Scheme[] = [
  { id: "sc1", name: "National Merit Scholarship (fictional)", benefit: "₹12,000 per year for college studies", eligibility: "Students in college with 60%+ marks and family income below ₹2.5 lakh.", minAge: 17, maxAge: 25, education: ["Class 12", "Undergraduate"], categories: ["General", "OBC", "SC", "ST", "EWS"], incomeMax: 250000, purposes: ["scholarship"], documents: ["Marksheet", "Income certificate", "Aadhaar card", "Bank passbook", "College ID"], deadline: d(6), steps: ["Register on the scholarship portal", "Fill personal and bank details", "Upload documents", "Submit and print acknowledgement", "College verifies your application"], faqs: [{ q: "Can I apply every year?", a: "Yes, you must renew each year with your new marksheet." }, { q: "Is there an application fee?", a: "No. Never pay anyone to apply." }] },
  { id: "sc2", name: "Post-Matric Scholarship for SC/ST (fictional)", benefit: "Full tuition plus monthly allowance", eligibility: "SC/ST students after Class 10 with family income below ₹2.5 lakh.", minAge: 15, maxAge: 30, education: ["Class 10", "Class 12", "Undergraduate", "Postgraduate"], categories: ["SC", "ST"], incomeMax: 250000, purposes: ["scholarship"], documents: ["Caste certificate", "Income certificate", "Marksheet", "Aadhaar card", "Bank passbook"], deadline: d(21), steps: ["Get caste and income certificates", "Apply on state portal", "Submit to college", "Track status online"], faqs: [{ q: "Do hostel students get more?", a: "Yes, the allowance is higher for hostel residents." }] },
  { id: "sc3", name: "Skill India Training Program (fictional)", benefit: "Free 3-month job skills course with certificate", eligibility: "Anyone aged 18–35 looking to learn a trade or job skill.", minAge: 18, maxAge: 35, education: ["Below Class 10", "Class 10", "Class 12", "Undergraduate"], categories: ["General", "OBC", "SC", "ST", "EWS"], incomeMax: 9999999, purposes: ["skill"], documents: ["Aadhaar card", "Passport photo", "Bank passbook"], deadline: d(30), steps: ["Choose a course and centre", "Register with Aadhaar", "Attend training", "Pass assessment and get certificate"], faqs: [{ q: "Is there a stipend?", a: "Some courses offer travel support." }] },
  { id: "sc4", name: "Young Women in STEM Grant (fictional)", benefit: "₹25,000 one-time grant + mentoring", eligibility: "Women in science, engineering or maths degrees.", minAge: 17, maxAge: 28, education: ["Undergraduate", "Postgraduate"], categories: ["General", "OBC", "SC", "ST", "EWS"], incomeMax: 800000, purposes: ["scholarship"], documents: ["College ID", "Marksheet", "Statement of purpose", "Aadhaar card"], deadline: d(4), steps: ["Write a 300-word statement", "Get recommendation from a teacher", "Apply online"], faqs: [{ q: "Can first-year students apply?", a: "Yes." }] },
  { id: "sc5", name: "Rozgar Employment Guarantee Info (fictional)", benefit: "Up to 100 days of paid work per year", eligibility: "Adults in rural households willing to do unskilled work.", minAge: 18, maxAge: 65, education: ["Below Class 10", "Class 10", "Class 12", "Undergraduate"], categories: ["General", "OBC", "SC", "ST", "EWS"], incomeMax: 300000, purposes: ["employment"], documents: ["Aadhaar card", "Job card application", "Bank passbook", "Passport photo"], deadline: d(60), steps: ["Apply at gram panchayat", "Get job card", "Request work in writing", "Work within 15 days"], faqs: [{ q: "What if work is not given?", a: "You may be eligible for an unemployment allowance." }] },
  { id: "sc6", name: "Apprenticeship Stipend Scheme (fictional)", benefit: "₹8,000/month stipend during apprenticeship", eligibility: "Graduates and diploma holders aged 18–30.", minAge: 18, maxAge: 30, education: ["Undergraduate", "Postgraduate"], categories: ["General", "OBC", "SC", "ST", "EWS"], incomeMax: 9999999, purposes: ["employment", "skill"], documents: ["Degree certificate", "Aadhaar card", "Bank passbook"], deadline: d(14), steps: ["Register on apprenticeship portal", "Apply to listed companies", "Sign contract"], faqs: [{ q: "Is the stipend taxable?", a: "Generally no, for stipends below the limit." }] },
  { id: "sc7", name: "State Free Laptop Scheme (fictional)", benefit: "Free laptop for meritorious students", eligibility: "Class 12 pass with 75%+ from state board.", minAge: 16, maxAge: 22, education: ["Class 12", "Undergraduate"], categories: ["General", "OBC", "SC", "ST", "EWS"], incomeMax: 600000, purposes: ["scholarship"], documents: ["Class 12 marksheet", "Domicile certificate", "Aadhaar card"], deadline: d(2), steps: ["College forwards merit list", "Verify documents", "Collect laptop at distribution camp"], faqs: [{ q: "Do I apply myself?", a: "No, your college sends the list. Check that your name is on it." }] },
  { id: "sc8", name: "Minority Pre-Matric Scholarship (fictional)", benefit: "₹5,000 per year for school students", eligibility: "Minority community students in Class 1–10.", minAge: 6, maxAge: 17, education: ["Below Class 10", "Class 10"], categories: ["Minority"], incomeMax: 100000, purposes: ["scholarship"], documents: ["Self-declaration of community", "Income certificate", "School ID", "Bank passbook"], deadline: d(25), steps: ["Apply on national scholarship portal", "School verifies", "Amount credited to bank"], faqs: [{ q: "Can parents apply for the child?", a: "Yes, with the child's details." }] },
];

export const helpAppts: HelpAppt[] = [
  { id: "ha1", userId: "u2", name: "Meera Iyer", topic: "Skill programs", date: d(0), slot: "10:00", status: "served", notes: "Interested in tailoring course", summary: "Suggested Skill India Training. Bring Aadhaar + photo to the centre." },
  { id: "ha2", userId: "u4", name: "Fatima Khan", topic: "Scholarship", date: d(0), slot: "10:30", status: "waiting" },
  { id: "ha3", userId: "u15", name: "Ishaan Gupta", topic: "Employment", date: d(0), slot: "11:00", status: "waiting" },
  { id: "ha4", userId: "u5", name: "Kabir Singh", topic: "Education scheme", date: d(0), slot: "11:30", status: "waiting" },
];

export const shifts: Shift[] = [
  { id: "sh1", userId: "u10", programId: "study", date: d(0), hours: 4, role: "Doubt desk – Maths", status: "upcoming" },
  { id: "sh2", userId: "u10", programId: "h1", date: d(3), hours: 6, role: "Registration desk", status: "upcoming" },
  { id: "sh3", userId: "u10", programId: "w6", date: d(-10), hours: 3, role: "Instructor", status: "done" },
  { id: "sh4", userId: "u11", programId: "g1", date: d(0), hours: 3, role: "Help desk", status: "upcoming" },
  { id: "sh5", userId: "u11", programId: "h1", date: d(3), hours: 6, role: "Token counter", status: "upcoming" },
];

export const partnerOrgs: PartnerOrg[] = [
  { id: "o1", name: "Seva Community Hospital", type: "Hospital", city: "Pune", verified: true, focus: "Primary care, screening camps" },
  { id: "o2", name: "BrightByte Labs", type: "Company", city: "Bengaluru", verified: true, focus: "Tech mentoring, AI workshops" },
  { id: "o3", name: "Lions Club Seva Trust", type: "NGO", city: "Pune", verified: true, focus: "Eye and dental care" },
  { id: "o4", name: "Saksham Youth Foundation", type: "NGO", city: "Nashik", verified: false, focus: "Career guidance for rural youth" },
  { id: "o5", name: "District Employment Office", type: "Government", city: "Pune", verified: true, focus: "Scheme awareness, job fairs" },
  { id: "o6", name: "GreenCart Foods", type: "Company", city: "Hyderabad", verified: false, focus: "Entrepreneurship talks" },
];

const statuses: BookingStatus[] = ["approved", "pending", "completed", "waitlisted", "rejected", "active", "pending", "approved", "completed", "cancelled"];
const purposes = ["Science club experiment", "Robotics team practice", "Short film shoot", "Debate society meeting", "Final year project prototype", "Podcast episode recording", "NSS planning meeting", "Hackathon prep", "Photography club walk", "Coding club session"];
const resIds = ["chem-lab-2", "seminar-a", "printer-3d", "dslr", "electronics", "podcast", "robotics", "laser", "drone", "vr", "comp-lab-4", "seminar-a"];
const bookers = ["u3", "u4", "u5", "u15", "u2"];

export const bookings: Booking[] = Array.from({ length: 21 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const dayOff = status === "completed" ? -(i + 2) : status === "active" ? 0 : (i % 9) + 1;
  const userId = bookers[i % bookers.length];
  const resourceId = resIds[i % resIds.length];
  const tl = [{ at: ts(-48 + i), actor: "Applicant", text: "Request submitted" }];
  if (status !== "pending") tl.push({ at: ts(-40 + i), actor: "Vikram Nair (Manager)", text: `Marked ${status}` });
  return {
    id: `b${i + 1}`, resourceId, userId, date: d(dayOff), start: ["10:00", "14:00", "16:00"][i % 3], duration: 2,
    purpose: purposes[i % purposes.length], attachments: i % 3 === 0 ? ["club-letter.pdf"] : [], status,
    recommendation: (i % 4 === 3 ? "waitlist" : "approve") as Booking["recommendation"],
    reason: status === "rejected" ? "The lab needs a Lab Safety badge. Complete the free safety workshop and apply again." : status === "waitlisted" ? "Another group with a higher Fair-Share Score requested the same slot. You are next in line." : status === "approved" || status === "active" || status === "completed" ? "You meet all requirements and the slot was free." : undefined,
    waitPos: status === "waitlisted" ? (i % 3) + 1 : undefined,
    checkin: status === "active" || status === "completed" ? { items: [], notes: "All fine at pickup", photos: [], at: ts(-2) } : undefined,
    timeline: tl,
  } as Booking;
});
// Program reservations (auto-booked through Part 1 logic)
programs.filter((p) => p.id !== "study" && p.id !== "g1").forEach((p, i) => {
  if (bookings.length >= 25) return;
  bookings.push({ id: `bp${i}`, resourceId: p.resourceId, userId: "u8", date: p.date, start: p.start, duration: p.duration, purpose: `Program: ${p.title}`, attachments: [], status: "approved", recommendation: "approve", programId: p.id, reason: "Reserved automatically for a community program.", timeline: [{ at: ts(-72), actor: "System", text: `Reserved for program "${p.title}"` }] });
});
// Deliberate conflict: a student booking overlapping the career session c1 in Seminar Hall A
bookings.push({ id: "b-conf", resourceId: "seminar-a", userId: "u5", date: d(2), start: "11:30", duration: 2, purpose: "Film club screening", attachments: [], status: "pending", recommendation: "waitlist", timeline: [{ at: ts(-5), actor: "Applicant", text: "Request submitted" }] });

// Seed Specific Mock Bookings as requested for Cinema Seats and Venue Timeline
// Computer Lab 4: 5 seats booked, 3 requested, for today's 11:00-13:00 slot
const bookedSeatsLab4 = ["A1", "A2", "B4", "C3", "E5"];
bookedSeatsLab4.forEach((sId, idx) => {
  bookings.push({
    id: `b-cl4-booked-${sId}`,
    resourceId: "comp-lab-4",
    userId: ["u2", "u3", "u4", "u5", "u15"][idx % 5],
    date: d(0),
    start: "11:00",
    duration: 2,
    purpose: "Autonomous systems software development & data modeling",
    attachments: [],
    status: "approved",
    recommendation: "approve",
    bookingMode: "seat",
    seats: [sId],
    ticketCode: `TKT-CS4-${sId}-8942`,
    timeline: [{ at: ts(-12), actor: "Applicant", text: "Selected seat and confirmed" }],
  });
});

const requestedSeatsLab4 = ["B2", "C4", "D1"];
requestedSeatsLab4.forEach((sId, idx) => {
  bookings.push({
    id: `b-cl4-req-${sId}`,
    resourceId: "comp-lab-4",
    userId: ["u16", "u17", "u4"][idx % 3],
    date: d(0),
    start: "11:00",
    duration: 2,
    purpose: "Final year capstone engineering project simulation",
    attachments: [],
    status: "pending",
    recommendation: "approve",
    bookingMode: "seat",
    seats: [sId],
    ticketCode: `TKT-CS4-${sId}-PEND`,
    timeline: [{ at: ts(-2), actor: "Applicant", text: "Submitted request for seat" }],
  });
});

// Seminar Hall A (Mode 2): One class booked Tuesday 10-12, one request in demand Saturday 10-13
bookings.push(
  {
    id: "b-sem-class-tue",
    resourceId: "seminar-a",
    userId: "u7",
    date: d(1), // Tuesday
    start: "10:00",
    duration: 2,
    purpose: "CS301 Advanced Distributed Systems Lecture",
    eventName: "Advanced Operating Systems Lecture",
    expectedAttendees: 65,
    attachments: [],
    status: "approved",
    recommendation: "approve",
    bookingMode: "venue",
    ticketCode: "TKT-SEM-VNU-0129",
    timeline: [{ at: ts(-48), actor: "Prof. Sunita Rao", text: "Class scheduled by department" }],
  },
  {
    id: "b-sem-dem-sat",
    resourceId: "seminar-a",
    userId: "u5",
    date: d(5), // Saturday
    start: "10:00",
    duration: 3,
    purpose: "Inter-College Robotics Workshop & Hackathon Showcase",
    eventName: "Robotics Club Showcase",
    expectedAttendees: 90,
    attachments: [],
    status: "pending",
    recommendation: "approve",
    bookingMode: "venue",
    ticketCode: "TKT-SEM-VNU-PEND",
    timeline: [{ at: ts(-6), actor: "Kabir Singh", text: "Submitted request for whole venue" }],
  }
);

export const incidents: Incident[] = [
  { id: "inc1", bookingId: "b3", resourceId: "printer-3d", reporterId: "u5", kind: "damage", severity: "medium", description: "Print nozzle clogged after a PETG print; bed has a small scratch.", photos: [], status: "reviewing", at: ts(-30) },
  { id: "inc2", resourceId: "dslr", reporterId: "u9", kind: "delay", severity: "low", description: "DSLR kit returned 5 hours late.", photos: [], status: "resolved", resolution: "Reminder sent; small reliability penalty applied.", at: ts(-90) },
  { id: "inc3", resourceId: "chem-lab-2", reporterId: "u6", kind: "safety", severity: "high", description: "Fume hood 3 alarm triggered during practical.", photos: [], status: "open", at: ts(-8) },
  { id: "inc4", resourceId: "seminar-a", reporterId: "u8", kind: "damage", severity: "low", description: "Two chairs with broken armrests after event.", photos: [], status: "resolved", resolution: "Chairs repaired by maintenance.", at: ts(-200) },
  { id: "inc5", resourceId: "vr", reporterId: "u3", kind: "damage", severity: "medium", description: "Left controller strap torn.", photos: [], status: "open", at: ts(-20) },
  { id: "inc6", resourceId: "robotics", reporterId: "u9", kind: "other", severity: "low", description: "Kit #4 missing two servo screws.", photos: [], status: "reviewing", at: ts(-50) },
];

export const notifications: Notification[] = [
  { id: "n1", userId: "u1", type: "reminder", title: "Workshop in 1 hour", body: "Communication Skills — session 4 starts at 11:00 in Seminar Hall A.", at: ts(-1), read: false, link: "/programs" },
  { id: "n2", userId: "u1", type: "waitlist", title: "A seat opened for you!", body: "Careers in Medicine has a free seat. Accept within 2 hours or it goes to the next person.", at: ts(-0.5), read: false, link: "/events/c2", expiresAt: addHours(new Date(), 2).toISOString() },
  { id: "n3", userId: "u1", type: "info", title: "Welcome to CampusSphare", body: "Verify your identity once to book spaces and equipment.", at: ts(-30), read: true, link: "/verify" },
  { id: "n4", userId: "u3", type: "approval", title: "Booking approved", body: "Chemistry Lab 2 is yours. See you there!", at: ts(-10), read: false },
  { id: "n5", userId: "u5", type: "overdue", title: "DSLR Kit overdue", body: "Please return the DSLR Kit to the Media Lab store today.", at: ts(-3), read: false },
  { id: "n6", userId: "u8", type: "info", title: "3 requests waiting", body: "New booking requests need your review.", at: ts(-2), read: false, link: "/approvals" },
  { id: "n7", userId: "u12", type: "info", title: "New speaker invitation", body: "You've been invited to give a Student Wellbeing Talk.", at: ts(-6), read: false, link: "/partner" },
  { id: "n8", userId: "u10", type: "reminder", title: "Shift today", body: "Doubt desk – Maths at the Study Center.", at: ts(-4), read: false, link: "/volunteer" },
  { id: "n9", userId: "u1", type: "cancellation", title: "Drone Arena slot cancelled", body: "Saturday's arena session was cancelled due to maintenance. No penalty applies.", at: ts(-50), read: true },
];

export const audit: AuditEntry[] = [
  { id: "a1", at: ts(-72), actorId: "system", role: "system", action: "program.reserve", target: "Seminar Hall A", detail: "Reserved for 'Your First Tech Job'" },
  { id: "a2", at: ts(-48), actorId: "u3", role: "user", action: "booking.create", target: "Chemistry Lab 2", detail: "Science club experiment" },
  { id: "a3", at: ts(-40), actorId: "u8", role: "manager", action: "booking.approve", target: "Chemistry Lab 2", detail: "Meets all requirements" },
  { id: "a4", at: ts(-39), actorId: "u8", role: "manager", action: "booking.reject", target: "Laser Cutter", detail: "Missing Lab Safety badge" },
  { id: "a5", at: ts(-30), actorId: "u5", role: "user", action: "incident.report", target: "3D Printer Bay", detail: "Damage – medium" },
  { id: "a6", at: ts(-20), actorId: "u14", role: "admin", action: "user.verify", target: "Rohan Das", detail: "ID card checked" },
  { id: "a7", at: ts(-12), actorId: "u6", role: "owner", action: "resource.update", target: "Electronics Lab", detail: "Availability changed" },
  { id: "a8", at: ts(-6), actorId: "u8", role: "manager", action: "invite.send", target: "Dr. Kavita Bose", detail: "Student Wellbeing Talk" },
  { id: "a9", at: ts(-3), actorId: "u10", role: "volunteer", action: "helpdesk.serve", target: "Appointment ha1", detail: "Marked served" },
  { id: "a10", at: ts(-2), actorId: "u2", role: "user", action: "health.token", target: "Community Health Check Camp", detail: "Token issued (service details withheld)" },
];

export const defaultWeights: Weights = {
  lowUsage: 30, waiting: 20, purpose: 20, skill: 15, reliability: 15, penalties: 100, maxStudyPerWeek: 3, maxBookingHours: 3, maxBookingsPerWeek: 3,
};

// ---------- Competing requests seed ----------
const now0 = new Date();
const inH = (h: number) => new Date(now0.getTime() + h * 36e5).toISOString();
const mk = (id: string, resourceId: string, userId: string, date: string, start: string, duration: number, purpose: string, purposeCategory: string, contestId: string, createdAt: string): Booking => ({
  id, resourceId, userId, date, start, duration, purpose, purposeCategory, attachments: [], status: "pending", recommendation: "approve", contestId, createdAt,
  timeline: [{ at: createdAt, actor: "Applicant", text: "Request submitted" }, { at: createdAt, actor: "System", text: "Joined the competing-request window" }],
});
bookings.push(
  mk("bc1", "seminar-a", "u16", d(4), "10:00", 3, "Final-year course project demo day for 40 classmates", "Course project", "ct1", inH(-20)),
  mk("bc2", "seminar-a", "u17", d(4), "11:00", 3, "Mechanical club inter-college robotics meet", "Club event", "ct1", inH(-18)),
  mk("bc3", "drone", "u3", d(5), "10:00", 2, "Drone club practice for national contest", "Club event", "ct2", inH(-10)),
  mk("bc4", "drone", "u5", d(5), "11:00", 2, "Aerial shots for short film", "Course project", "ct2", inH(-9)),
  mk("bc5", "drone", "u2", d(5), "10:30", 2, "Learning to fly for community survey work", "Personal learning", "ct2", inH(-8)),
  mk("bc6", "printer-3d", "u15", d(2), "14:00", 3, "Prototype phone stand for entrepreneurship class", "Course project", "ct3", inH(-2)),
);
export const contests: Contest[] = [
  { id: "ct1", resourceId: "seminar-a", date: d(4), start: "10:00", end: "14:00", createdAt: inH(-20), windowClosesAt: inH(3.33), status: "open", requestIds: ["bc1", "bc2"] },
  { id: "ct2", resourceId: "drone", date: d(5), start: "10:00", end: "13:00", createdAt: inH(-10), windowClosesAt: inH(0.8), status: "open", requestIds: ["bc3", "bc4", "bc5"] },
  { id: "ct3", resourceId: "printer-3d", date: d(2), start: "14:00", end: "17:00", createdAt: inH(-2), windowClosesAt: inH(6), status: "open", requestIds: ["bc6"] },
];
notifications.push(
  { id: "nc1", userId: "u3", type: "info", title: "Window closing soon", body: "The Drone Arena request window closes in under 1 hour. 3 requests are competing.", at: inH(-0.2), read: false, link: "/contests/ct2" },
);
audit.unshift(
  { id: "ac1", at: inH(-20), actorId: "u16", role: "user", action: "contest.request", target: "Seminar Hall A", detail: "Request created; window opened (24h)" },
  { id: "ac2", at: inH(-18), actorId: "system", role: "system", action: "contest.formed", target: "Seminar Hall A", detail: "2 overlapping requests grouped into contest ct1" },
  { id: "ac3", at: inH(-8), actorId: "system", role: "system", action: "contest.joined", target: "Drone Arena", detail: "3rd request joined contest ct2" },
);
