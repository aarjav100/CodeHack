import React, { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS } from "@/types/auth";
import type { RoleId } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight, ArrowLeft, PlusCircle, CheckCircle2 } from "lucide-react";
import { AddRoleModal } from "@/components/AddRoleModal";
import { toast } from "sonner";

interface RoleRouteGuardProps {
  allowedRoles: RoleId[];
  children: React.ReactNode;
}

export function RoleRouteGuard({ allowedRoles, children }: RoleRouteGuardProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const activeRole = useAuthStore((s) => s.activeRole);
  const switchRole = useAuthStore((s) => s.switchRole);
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // If no user is logged in, show access prompt or login link
  if (!currentUser) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-lg flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Please log in to your CampusSphare account to access this page.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button asChild className="rounded-xl">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  // If the active role is allowed, render children directly
  if (allowedRoles.includes(activeRole)) {
    return <>{children}</>;
  }

  // Find if the user holds other active roles that ARE allowed
  const eligibleActiveRoles = currentUser.roles.filter(
    (r) => r.status === "active" && allowedRoles.includes(r.role)
  );

  const pendingEligibleRoles = currentUser.roles.filter(
    (r) => r.status === "pending" && allowedRoles.includes(r.role)
  );

  const activeRoleConfig = ROLE_CONFIGS[activeRole];

  const handleInstantSwitch = (roleId: RoleId) => {
    const res = switchRole(roleId);
    if (res.success) {
      toast.success(`Switched to ${ROLE_CONFIGS[roleId].label}`);
    }
  };

  return (
    <div className="mx-auto my-12 max-w-xl rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-lift dark:border-slate-800 dark:bg-card">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 ring-8 ring-indigo-50/50 dark:ring-indigo-950/20">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3 border bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        Acting as <span className="font-bold underline">{activeRoleConfig.label}</span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Switch role to view this page
      </h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        This area requires one of the following roles:{" "}
        <span className="font-semibold text-foreground">
          {allowedRoles.map((r) => ROLE_CONFIGS[r].label).join(", ")}
        </span>
        .
      </p>

      {/* Case 1: User holds eligible active roles -> One-click Switch */}
      {eligibleActiveRoles.length > 0 && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-left dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Switch to an authorized role in your account:
          </p>
          <div className="mt-3 space-y-2">
            {eligibleActiveRoles.map((r) => {
              const cfg = ROLE_CONFIGS[r.role];
              return (
                <button
                  key={r.role}
                  onClick={() => handleInstantSwitch(r.role)}
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-white p-3 text-left shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-emerald-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{cfg.label}</div>
                      <div className="text-xs text-muted-foreground">{cfg.description}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    Switch &amp; View <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Case 2: User has a pending role that would grant access */}
      {eligibleActiveRoles.length === 0 && pendingEligibleRoles.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left dark:border-amber-900/50 dark:bg-amber-950/20">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Pending Approval:
          </p>
          <p className="mt-1 text-xs text-amber-900 dark:text-amber-200">
            You requested{" "}
            <span className="font-bold">
              {pendingEligibleRoles.map((p) => ROLE_CONFIGS[p.role].label).join(", ")}
            </span>
            , which is currently awaiting verification from an administrator.
          </p>
        </div>
      )}

      {/* Case 3: User doesn't have the role at all -> Request / Add role */}
      {eligibleActiveRoles.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-xs text-muted-foreground mb-3">
            Don't have the required role yet? You can request it for your account without logging out:
          </p>
          <Button
            onClick={() => setIsAddRoleOpen(true)}
            variant="outline"
            className="w-full rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" /> Request Required Role
          </Button>
        </div>
      )}

      {/* Fallback navigation */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: activeRoleConfig.homeRoute as any })}
          className="rounded-xl text-xs"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to {activeRoleConfig.label} Home
        </Button>
      </div>

      <AddRoleModal open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen} />
    </div>
  );
}
