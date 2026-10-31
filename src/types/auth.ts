export type RoleId =
  | "student"
  | "customer"
  | "volunteer"
  | "owner"
  | "speaker"
  | "health_partner"
  | "organisation"
  | "manager"
  | "admin";

export type RoleCategory = "self_service" | "approval_required" | "admin_assigned";

export type RoleStatus = "active" | "pending" | "rejected";

export interface RoleDetails {
  reason?: string;
  profession?: string;
  topic?: string;
  organisationName?: string;
  servicesOffered?: string;
  [key: string]: any;
}

export interface UserRoleRecord {
  role: RoleId;
  status: RoleStatus;
  requestedAt: string;
  approvedAt?: string;
  details?: RoleDetails;
  rejectionReason?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  roles: UserRoleRecord[];
  activeRole: RoleId;
  lastActiveRole?: RoleId;
  rememberChoice?: boolean;
  dept?: string;
  enrollment?: string;
  phone?: string;
  verified?: "none" | "pending" | "verified";
  createdAt: string;
}

export interface RoleConfig {
  id: RoleId;
  label: string;
  shortLabel: string;
  category: RoleCategory;
  description: string;
  homeRoute: string;
  iconName: string;
  colorToken: {
    primary: string;
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    hex: string;
  };
  allowedRoutes: string[];
}

export const ROLE_CONFIGS: Record<RoleId, RoleConfig> = {
  student: {
    id: "student",
    label: "Student",
    shortLabel: "Student",
    category: "self_service",
    description: "Browse & book campus spaces, labs, equipment and join student programs.",
    homeRoute: "/discover",
    iconName: "school",
    colorToken: {
      primary: "bg-indigo-600",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-100",
      badgeText: "text-indigo-700",
      hex: "#4f46e5",
    },
    allowedRoutes: ["/", "/discover", "/resources", "/book", "/bookings", "/profile", "/fair-share", "/demand", "/programs", "/calendar", "/study", "/checkin", "/return", "/verify", "/notifications"],
  },
  customer: {
    id: "customer",
    label: "Customer / Community",
    shortLabel: "Customer",
    category: "self_service",
    description: "Citizen attending public campus initiatives, open workshops and community care.",
    homeRoute: "/discover",
    iconName: "group",
    colorToken: {
      primary: "bg-sky-500",
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
      badgeBg: "bg-sky-100",
      badgeText: "text-sky-700",
      hex: "#0284c7",
    },
    allowedRoutes: ["/", "/discover", "/resources", "/programs", "/events", "/bookings", "/profile", "/helpdesk", "/health", "/notifications"],
  },
  volunteer: {
    id: "volunteer",
    label: "Volunteer",
    shortLabel: "Volunteer",
    category: "self_service",
    description: "Assist events, guide attendees, supervise check-ins and log civic hours.",
    homeRoute: "/volunteer",
    iconName: "volunteer_activism",
    colorToken: {
      primary: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-800",
      hex: "#d97706",
    },
    allowedRoutes: ["/", "/volunteer", "/discover", "/programs", "/checkin", "/profile", "/notifications"],
  },
  owner: {
    id: "owner",
    label: "Space / Equipment Owner",
    shortLabel: "Owner",
    category: "approval_required",
    description: "List labs, halls, laser cutters, audit inventory and manage house rules.",
    homeRoute: "/owner",
    iconName: "warehouse",
    colorToken: {
      primary: "bg-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-800",
      hex: "#059669",
    },
    allowedRoutes: ["/", "/owner", "/resources", "/resources/new", "/approvals", "/audit", "/profile", "/notifications"],
  },
  speaker: {
    id: "speaker",
    label: "Speaker / Guest Lecturer",
    shortLabel: "Speaker",
    category: "approval_required",
    description: "Receive keynote invitations, host symposiums and run academic seminars.",
    homeRoute: "/partner",
    iconName: "record_voice_over",
    colorToken: {
      primary: "bg-rose-500",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      badgeBg: "bg-rose-100",
      badgeText: "text-rose-700",
      hex: "#e11d48",
    },
    allowedRoutes: ["/", "/partner", "/programs", "/speakers", "/profile", "/notifications"],
  },
  health_partner: {
    id: "health_partner",
    label: "Health Camp Partner",
    shortLabel: "Health Partner",
    category: "approval_required",
    description: "Coordinate medical checkup camps, blood drives and wellness screenings.",
    homeRoute: "/partner",
    iconName: "medical_services",
    colorToken: {
      primary: "bg-pink-600",
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
      badgeBg: "bg-pink-100",
      badgeText: "text-pink-700",
      hex: "#db2777",
    },
    allowedRoutes: ["/", "/partner", "/health", "/programs", "/profile", "/notifications"],
  },
  organisation: {
    id: "organisation",
    label: "Organisation (NGO / Club / Partner)",
    shortLabel: "Organisation",
    category: "approval_required",
    description: "Sponsor university hackathons, career drives and student initiatives.",
    homeRoute: "/partner",
    iconName: "apartment",
    colorToken: {
      primary: "bg-purple-600",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-700",
      hex: "#7c3aed",
    },
    allowedRoutes: ["/", "/partner", "/partners", "/programs", "/profile", "/notifications"],
  },
  manager: {
    id: "manager",
    label: "Campus Manager",
    shortLabel: "Manager",
    category: "admin_assigned",
    description: "Oversee university facility quotas, dispute resolution and department queues.",
    homeRoute: "/approvals",
    iconName: "shield_person",
    colorToken: {
      primary: "bg-teal-600",
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      badgeBg: "bg-teal-100",
      badgeText: "text-teal-700",
      hex: "#0d9488",
    },
    allowedRoutes: ["/", "/approvals", "/demand", "/audit", "/discover", "/profile", "/notifications"],
  },
  admin: {
    id: "admin",
    label: "System Administrator",
    shortLabel: "Admin",
    category: "admin_assigned",
    description: "Manage institution policies, approve role credentials and inspect audit trails.",
    homeRoute: "/admin",
    iconName: "admin_panel_settings",
    colorToken: {
      primary: "bg-slate-700",
      bg: "bg-slate-100",
      text: "text-slate-800",
      border: "border-slate-300",
      badgeBg: "bg-slate-200",
      badgeText: "text-slate-800",
      hex: "#334155",
    },
    allowedRoutes: ["/", "/admin", "/admin/role-requests", "/approvals", "/audit", "/discover", "/profile", "/notifications"],
  },
};

export const SELF_SERVICE_ROLES: RoleId[] = ["student", "customer", "volunteer"];
export const APPROVAL_REQUIRED_ROLES: RoleId[] = ["owner", "speaker", "health_partner", "organisation"];
export const ADMIN_ASSIGNED_ROLES: RoleId[] = ["manager", "admin"];
