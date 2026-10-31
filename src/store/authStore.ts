import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, RoleId, UserRoleRecord, RoleDetails } from "@/types/auth";
import { ROLE_CONFIGS, SELF_SERVICE_ROLES } from "@/types/auth";

export interface PendingRoleRequestItem {
  userId: string;
  userName: string;
  userEmail: string;
  role: RoleId;
  requestedAt: string;
  details?: RoleDetails;
}

export interface AuthState {
  users: AuthUser[];
  currentUser: AuthUser | null;
  activeRole: RoleId;
  isContinueAsOpen: boolean;
  pendingLoginUser: AuthUser | null;

  // Actions
  signUp: (payload: {
    name: string;
    email: string;
    password: string;
    selectedRoles: RoleId[];
    startAs?: RoleId;
    detailsMap?: Partial<Record<RoleId, RoleDetails>>;
  }) => { success: boolean; error?: string; user?: AuthUser; activeRolesCount: number; pendingRolesCount: number };

  signIn: (
    email: string,
    password: string,
    rememberChoice?: boolean
  ) => { success: boolean; error?: string; requiresRoleChoice?: boolean; user?: AuthUser };

  confirmContinueAs: (roleId: RoleId, rememberChoice: boolean) => void;
  dismissContinueAs: () => void;

  signOut: () => void;

  switchRole: (roleId: RoleId) => { success: boolean; newHomeRoute: string; error?: string };

  addRole: (
    roleId: RoleId,
    details?: RoleDetails
  ) => { success: boolean; status: "active" | "pending"; error?: string };

  removeRole: (roleId: RoleId) => { success: boolean; error?: string; fallbackRole?: RoleId };

  reRequestRole: (
    roleId: RoleId,
    details?: RoleDetails
  ) => { success: boolean; error?: string };

  // Admin actions
  approveRoleRequest: (userId: string, roleId: RoleId) => { success: boolean; error?: string };
  rejectRoleRequest: (userId: string, roleId: RoleId, reason: string) => { success: boolean; error?: string };

  // Permission & conflict helpers
  hasPermission: (permission: string, context?: { resourceOwnerId?: string; bookingUserId?: string }) => boolean;
  canReviewRequest: (bookingUserId: string) => { allowed: boolean; reason?: string };

  // Selectors
  getActiveRoles: () => UserRoleRecord[];
  getPendingRoles: () => UserRoleRecord[];
  getRejectedRoles: () => UserRoleRecord[];
  getAllPendingRequests: () => PendingRoleRequestItem[];
}

// 3 Default Demo Accounts as specified in requirements
const DEMO_USERS: AuthUser[] = [
  {
    id: "user-single",
    name: "Aarav Sharma",
    email: "student@campus.edu",
    passwordHash: "Password123",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    dept: "Computer Science & Engineering",
    enrollment: "CS-2023-4412",
    verified: "verified",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    activeRole: "student",
    lastActiveRole: "student",
    rememberChoice: true,
    roles: [
      {
        role: "student",
        status: "active",
        requestedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "user-multi",
    name: "Aarjav Jain",
    email: "multi@campus.edu",
    passwordHash: "Password123",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzWVNobO3iTk9RktHSZOLdFxV23PlNu5cF5GZgDuxODyPEZJgyogZW_mbKkF1RYZoDxQTIIBTYAy3uX_uxS1aNKACgB6aacpKRtVBsPEdr44IgHm0pwhKONu1XikdATZ1lTPW9MsyOj0INdWBzK5LOv9V4ilm63UGLEnzwuo-t722OAL3o6Ys3UAx6CkzdpfsjOBCEsdCiRdoTyr5_WobvmGilFoEj34C0DPT8He49",
    dept: "Autonomous Systems & Robotics",
    enrollment: "IN-EDU-2024-8849",
    verified: "verified",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    activeRole: "student",
    lastActiveRole: "student",
    rememberChoice: false,
    roles: [
      {
        role: "student",
        status: "active",
        requestedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      },
      {
        role: "owner",
        status: "active",
        requestedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 19 * 86400000).toISOString(),
        details: {
          reason: "Faculty-certified steward for Engineering Bay 08 & Electronics Bench 304.",
          organisationName: "Robotics & Embedded Systems Lab",
        },
      },
      {
        role: "volunteer",
        status: "active",
        requestedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        role: "speaker",
        status: "pending",
        requestedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        details: {
          profession: "Autonomous Drone Robotics Lead",
          topic: "Real-time edge telemetry and payload drop navigation algorithms.",
          reason: "Invited to present student session for TechFest 2026.",
        },
      },
    ],
  },
  {
    id: "user-admin",
    name: "Dr. Anil Mehta (Admin)",
    email: "admin@campus.edu",
    passwordHash: "Password123",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    dept: "Dean of Academic Infrastructure & Civic Governance",
    enrollment: "FAC-ADM-001",
    verified: "verified",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    activeRole: "admin",
    lastActiveRole: "admin",
    rememberChoice: true,
    roles: [
      {
        role: "admin",
        status: "active",
        requestedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      },
      {
        role: "manager",
        status: "active",
        requestedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      },
      {
        role: "student",
        status: "active",
        requestedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      },
    ],
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: DEMO_USERS,
      currentUser: DEMO_USERS[1], // Default logged-in as Aarjav Jain (multi-role user)
      activeRole: "student",
      isContinueAsOpen: false,
      pendingLoginUser: null,

      signUp: ({ name, email, password, selectedRoles, startAs, detailsMap = {} }) => {
        const users = get().users;
        const normalizedEmail = email.trim().toLowerCase();

        // Email uniqueness check
        if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
          return {
            success: false,
            error: "This email already has an account. Log in and use Add another role instead.",
            activeRolesCount: 0,
            pendingRolesCount: 0,
          };
        }

        const roleRecords: UserRoleRecord[] = [];
        let hasInstantRole = false;

        selectedRoles.forEach((r) => {
          const isInstant = SELF_SERVICE_ROLES.includes(r);
          if (isInstant) hasInstantRole = true;

          roleRecords.push({
            role: r,
            status: isInstant ? "active" : "pending",
            requestedAt: new Date().toISOString(),
            approvedAt: isInstant ? new Date().toISOString() : undefined,
            details: detailsMap[r],
          });
        });

        // Rule: If user ticked ONLY approval-required roles, start in limited "customer" guest mode until approved
        if (!hasInstantRole) {
          roleRecords.unshift({
            role: "customer",
            status: "active",
            requestedAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
            details: { reason: "Temporary Guest Citizen Mode while credentials await admin review." },
          });
        }

        const activeRoles = roleRecords.filter((r) => r.status === "active").map((r) => r.role);
        const resolvedActiveRole = startAs && activeRoles.includes(startAs) ? startAs : activeRoles[0];

        const newUser: AuthUser = {
          id: `user-${Date.now()}`,
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: password, // In production this would be hashed; structured for clean Supabase Auth migration
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5`,
          verified: "pending",
          createdAt: new Date().toISOString(),
          roles: roleRecords,
          activeRole: resolvedActiveRole,
          lastActiveRole: resolvedActiveRole,
          rememberChoice: false,
        };

        const updatedUsers = [newUser, ...users];
        set({
          users: updatedUsers,
          currentUser: newUser,
          activeRole: resolvedActiveRole,
        });

        return {
          success: true,
          user: newUser,
          activeRolesCount: activeRoles.length,
          pendingRolesCount: roleRecords.filter((r) => r.status === "pending").length,
        };
      },

      signIn: (email, password, rememberChoice = false) => {
        const users = get().users;
        const normalized = email.trim().toLowerCase();
        const user = users.find((u) => u.email.toLowerCase() === normalized);

        // Friendly error that does NOT reveal whether email exists
        if (!user || user.passwordHash !== password) {
          return {
            success: false,
            error: "Invalid email or password. Please verify your credentials.",
          };
        }

        const activeRoles = user.roles.filter((r) => r.status === "active").map((r) => r.role);

        // If user has more than one active role and hasn't chosen "remember my choice", show ContinueAs chooser
        if (activeRoles.length > 1 && !user.rememberChoice && !rememberChoice) {
          set({
            pendingLoginUser: user,
            isContinueAsOpen: true,
          });
          return {
            success: true,
            requiresRoleChoice: true,
            user,
          };
        }

        // Open last used active role, or fallback to first available
        const preferredRole =
          user.lastActiveRole && activeRoles.includes(user.lastActiveRole)
            ? user.lastActiveRole
            : activeRoles[0] || "customer";

        const updatedUser = {
          ...user,
          activeRole: preferredRole,
          lastActiveRole: preferredRole,
          rememberChoice: rememberChoice || user.rememberChoice,
        };

        const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));

        set({
          users: updatedUsers,
          currentUser: updatedUser,
          activeRole: preferredRole,
          isContinueAsOpen: false,
          pendingLoginUser: null,
        });

        return {
          success: true,
          requiresRoleChoice: false,
          user: updatedUser,
        };
      },

      confirmContinueAs: (roleId, rememberChoice) => {
        const pending = get().pendingLoginUser;
        if (!pending) return;

        const updated = {
          ...pending,
          activeRole: roleId,
          lastActiveRole: roleId,
          rememberChoice,
        };

        const updatedUsers = get().users.map((u) => (u.id === pending.id ? updated : u));

        set({
          users: updatedUsers,
          currentUser: updated,
          activeRole: roleId,
          isContinueAsOpen: false,
          pendingLoginUser: null,
        });
      },

      dismissContinueAs: () => {
        set({ isContinueAsOpen: false, pendingLoginUser: null });
      },

      signOut: () => {
        set({
          currentUser: null,
          isContinueAsOpen: false,
          pendingLoginUser: null,
        });
      },

      switchRole: (roleId) => {
        const user = get().currentUser;
        if (!user) {
          return { success: false, newHomeRoute: "/login", error: "Not logged in" };
        }

        const target = user.roles.find((r) => r.role === roleId);
        if (!target) {
          return { success: false, newHomeRoute: "/discover", error: "Role not in user account" };
        }

        if (target.status !== "active") {
          return {
            success: false,
            newHomeRoute: "/discover",
            error: target.status === "pending" ? "Role is pending approval" : "Role was declined by admin",
          };
        }

        const updatedUser = {
          ...user,
          activeRole: roleId,
          lastActiveRole: roleId,
        };

        const updatedUsers = get().users.map((u) => (u.id === user.id ? updatedUser : u));
        const newHomeRoute = ROLE_CONFIGS[roleId]?.homeRoute || "/discover";

        set({
          users: updatedUsers,
          currentUser: updatedUser,
          activeRole: roleId,
        });

        return { success: true, newHomeRoute };
      },

      addRole: (roleId, details) => {
        const user = get().currentUser;
        if (!user) return { success: false, status: "pending", error: "Not authenticated" };

        const existing = user.roles.find((r) => r.role === roleId);
        if (existing) {
          if (existing.status === "active") {
            return { success: false, status: "active", error: "Role is already active on your account" };
          }
          if (existing.status === "pending") {
            return { success: false, status: "pending", error: "Role is already pending administrator approval" };
          }
        }

        const isInstant = SELF_SERVICE_ROLES.includes(roleId);
        const newRecord: UserRoleRecord = {
          role: roleId,
          status: isInstant ? "active" : "pending",
          requestedAt: new Date().toISOString(),
          approvedAt: isInstant ? new Date().toISOString() : undefined,
          details,
        };

        const updatedRoles = [...user.roles.filter((r) => r.role !== roleId), newRecord];
        const updatedUser = {
          ...user,
          roles: updatedRoles,
          activeRole: isInstant ? roleId : user.activeRole,
          lastActiveRole: isInstant ? roleId : user.lastActiveRole,
        };

        const updatedUsers = get().users.map((u) => (u.id === user.id ? updatedUser : u));

        set({
          users: updatedUsers,
          currentUser: updatedUser,
          activeRole: updatedUser.activeRole,
        });

        return {
          success: true,
          status: newRecord.status,
        };
      },

      removeRole: (roleId) => {
        const user = get().currentUser;
        if (!user) return { success: false, error: "Not authenticated" };

        const activeRoles = user.roles.filter((r) => r.status === "active");
        if (activeRoles.length <= 1 && user.roles.some((r) => r.role === roleId && r.status === "active")) {
          return {
            success: false,
            error: "You must keep at least one active role on your account.",
          };
        }

        const filtered = user.roles.filter((r) => r.role !== roleId);
        let fallbackRole: RoleId | undefined = undefined;

        let newActive = user.activeRole;
        if (user.activeRole === roleId) {
          const remainingActive = filtered.filter((r) => r.status === "active");
          newActive = remainingActive[0]?.role || "customer";
          fallbackRole = newActive;
        }

        const updatedUser = {
          ...user,
          roles: filtered,
          activeRole: newActive,
          lastActiveRole: newActive,
        };

        const updatedUsers = get().users.map((u) => (u.id === user.id ? updatedUser : u));

        set({
          users: updatedUsers,
          currentUser: updatedUser,
          activeRole: newActive,
        });

        return { success: true, fallbackRole };
      },

      reRequestRole: (roleId, details) => {
        return get().addRole(roleId, details);
      },

      approveRoleRequest: (userId, roleId) => {
        const users = get().users;
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return { success: false, error: "User not found" };

        const updatedRoles = targetUser.roles.map((r) =>
          r.role === roleId
            ? { ...r, status: "active" as const, approvedAt: new Date().toISOString() }
            : r
        );

        const updatedUser = {
          ...targetUser,
          roles: updatedRoles,
        };

        const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));

        const isCurrent = get().currentUser?.id === userId;

        set({
          users: updatedUsers,
          currentUser: isCurrent ? updatedUser : get().currentUser,
        });

        return { success: true };
      },

      rejectRoleRequest: (userId, roleId, reason) => {
        const users = get().users;
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return { success: false, error: "User not found" };

        const updatedRoles = targetUser.roles.map((r) =>
          r.role === roleId
            ? { ...r, status: "rejected" as const, rejectionReason: reason || "Does not meet department safety prerequisites." }
            : r
        );

        // If the user's active role got rejected, automatically fall back to their next active role
        let newActive = targetUser.activeRole;
        if (targetUser.activeRole === roleId) {
          const remainingActive = updatedRoles.filter((r) => r.status === "active");
          newActive = remainingActive[0]?.role || "customer";
        }

        const updatedUser = {
          ...targetUser,
          roles: updatedRoles,
          activeRole: newActive,
          lastActiveRole: newActive,
        };

        const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
        const isCurrent = get().currentUser?.id === userId;

        set({
          users: updatedUsers,
          currentUser: isCurrent ? updatedUser : get().currentUser,
          activeRole: isCurrent ? newActive : get().activeRole,
        });

        return { success: true };
      },

      hasPermission: (permission, context) => {
        const active = get().activeRole;
        const user = get().currentUser;
        if (!user) return false;

        // Admin override
        if (active === "admin") return true;

        // Conflict of interest guard:
        // If owner or manager, cannot review their own requests!
        if (context?.bookingUserId && context.bookingUserId === user.id) {
          if (permission.includes("approve") || permission.includes("review") || permission.includes("decide")) {
            return false;
          }
        }

        if (permission === "manage_spaces") return active === "owner" || active === "manager" || active === "admin";
        if (permission === "review_bookings") return active === "owner" || active === "manager" || active === "admin";
        if (permission === "admin_role_requests") return active === "admin";

        return true;
      },

      canReviewRequest: (bookingUserId) => {
        const user = get().currentUser;
        if (!user) return { allowed: false, reason: "Must be logged in to review requests." };

        if (bookingUserId === user.id) {
          return {
            allowed: false,
            reason: "Conflict of interest: You can't review or approve a booking request you made yourself.",
          };
        }

        return { allowed: true };
      },

      getActiveRoles: () => {
        const user = get().currentUser;
        if (!user) return [];
        return user.roles.filter((r) => r.status === "active");
      },

      getPendingRoles: () => {
        const user = get().currentUser;
        if (!user) return [];
        return user.roles.filter((r) => r.status === "pending");
      },

      getRejectedRoles: () => {
        const user = get().currentUser;
        if (!user) return [];
        return user.roles.filter((r) => r.status === "rejected");
      },

      getAllPendingRequests: () => {
        const users = get().users;
        const requests: PendingRoleRequestItem[] = [];

        users.forEach((u) => {
          u.roles.forEach((r) => {
            if (r.status === "pending") {
              requests.push({
                userId: u.id,
                userName: u.name,
                userEmail: u.email,
                role: r.role,
                requestedAt: r.requestedAt,
                details: r.details,
              });
            }
          });
        });

        return requests.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
      },
    }),
    {
      name: "campussphere_auth_v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
