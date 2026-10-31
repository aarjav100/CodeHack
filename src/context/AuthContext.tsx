import React, { createContext, useContext, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser, RoleId, UserRoleRecord, RoleDetails } from "@/types/auth";
import { ROLE_CONFIGS } from "@/types/auth";

export interface AuthContextType {
  user: AuthUser | null;
  activeRole: RoleId;
  roles: UserRoleRecord[];
  activeRoles: UserRoleRecord[];
  pendingRoles: UserRoleRecord[];
  rejectedRoles: UserRoleRecord[];
  activeRoleConfig: typeof ROLE_CONFIGS[RoleId];
  isAuthenticated: boolean;

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

  signOut: () => void;

  switchRole: (roleId: RoleId) => { success: boolean; newHomeRoute: string; error?: string };

  addRole: (
    roleId: RoleId,
    details?: RoleDetails
  ) => { success: boolean; status: "active" | "pending"; error?: string };

  removeRole: (roleId: RoleId) => { success: boolean; error?: string; fallbackRole?: RoleId };

  reRequestRole: (roleId: RoleId, details?: RoleDetails) => { success: boolean; error?: string };

  hasPermission: (permission: string, context?: { resourceOwnerId?: string; bookingUserId?: string }) => boolean;
  canReviewRequest: (bookingUserId: string) => { allowed: boolean; reason?: string };

  approveRoleRequest: (userId: string, roleId: RoleId) => { success: boolean; error?: string };
  rejectRoleRequest: (userId: string, roleId: RoleId, reason: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  const user = store.currentUser;
  const activeRole = store.activeRole;

  const activeRoles = useMemo(() => {
    return user ? user.roles.filter((r) => r.status === "active") : [];
  }, [user]);

  const pendingRoles = useMemo(() => {
    return user ? user.roles.filter((r) => r.status === "pending") : [];
  }, [user]);

  const rejectedRoles = useMemo(() => {
    return user ? user.roles.filter((r) => r.status === "rejected") : [];
  }, [user]);

  const activeRoleConfig = ROLE_CONFIGS[activeRole] || ROLE_CONFIGS["student"];

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      activeRole,
      roles: user?.roles ?? [],
      activeRoles,
      pendingRoles,
      rejectedRoles,
      activeRoleConfig,
      isAuthenticated: !!user,
      signUp: store.signUp,
      signIn: store.signIn,
      signOut: store.signOut,
      switchRole: store.switchRole,
      addRole: store.addRole,
      removeRole: store.removeRole,
      reRequestRole: store.reRequestRole,
      hasPermission: store.hasPermission,
      canReviewRequest: store.canReviewRequest,
      approveRoleRequest: store.approveRoleRequest,
      rejectRoleRequest: store.rejectRoleRequest,
    }),
    [user, activeRole, activeRoles, pendingRoles, rejectedRoles, activeRoleConfig, store]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
