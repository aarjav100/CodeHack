import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS } from "@/types/auth";
import type { RoleId, UserRoleRecord } from "@/types/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  HandHeart,
  Building2,
  Mic,
  HeartPulse,
  Briefcase,
  ShieldCheck,
  Shield,
  ChevronDown,
  Check,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AddRoleModal } from "./AddRoleModal";
import { cn } from "@/lib/utils";

// Map role icon to Lucide component
export function getRoleIcon(roleId: RoleId, className = "h-4 w-4") {
  switch (roleId) {
    case "student":
      return <GraduationCap className={className} />;
    case "customer":
      return <Users className={className} />;
    case "volunteer":
      return <HandHeart className={className} />;
    case "owner":
      return <Building2 className={className} />;
    case "speaker":
      return <Mic className={className} />;
    case "health_partner":
      return <HeartPulse className={className} />;
    case "organisation":
      return <Briefcase className={className} />;
    case "manager":
      return <ShieldCheck className={className} />;
    case "admin":
      return <Shield className={className} />;
    default:
      return <Users className={className} />;
  }
}

interface RoleSwitcherProps {
  variant?: "pill" | "compact" | "full";
  className?: string;
}

export function RoleSwitcher({ variant = "pill", className }: RoleSwitcherProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const activeRole = useAuthStore((s) => s.activeRole);
  const switchRole = useAuthStore((s) => s.switchRole);
  const removeRole = useAuthStore((s) => s.removeRole);
  const reRequestRole = useAuthStore((s) => s.reRequestRole);

  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  const [isOpen, setIsOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState<RoleId | null>(null);

  // Global Keyboard Shortcut: Alt+R toggles switcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!currentUser) {
    return (
      <Button asChild size="sm" variant="outline" className="h-9 rounded-xl text-xs font-semibold">
        <a href="/login">Sign In</a>
      </Button>
    );
  }

  const activeRoleConfig = ROLE_CONFIGS[activeRole];
  const userRoles = currentUser.roles;
  const activeRoles = userRoles.filter((r) => r.status === "active");
  const pendingRoles = userRoles.filter((r) => r.status === "pending");
  const rejectedRoles = userRoles.filter((r) => r.status === "rejected");

  const handleRoleSwitch = (newRole: RoleId) => {
    if (newRole === activeRole) {
      setIsOpen(false);
      return;
    }

    // Check if form on the page is dirty (via window.__isFormDirty convention or prompt)
    const isFormDirty = (window as any).__isFormDirty;
    if (isFormDirty) {
      const confirmDiscard = window.confirm("You have unsaved changes. Discard changes and switch roles?");
      if (!confirmDiscard) {
        setIsOpen(false);
        return;
      }
      (window as any).__isFormDirty = false;
    }

    const startTime = performance.now();
    const result = switchRole(newRole);
    const duration = Math.round(performance.now() - startTime);

    if (result.success) {
      setIsOpen(false);
      toast.success(`Switched to ${ROLE_CONFIGS[newRole].label}`, {
        description: `Active role changed in ${duration}ms`,
        icon: getRoleIcon(newRole, "h-4 w-4 text-primary"),
      });

      // Keep user on the current page if permitted, otherwise redirect to new role home
      const newRoleConfig = ROLE_CONFIGS[newRole];
      const isCurrentPathAllowed = newRoleConfig.allowedRoutes.some((pattern) => {
        if (pattern === currentPath) return true;
        if (pattern !== "/" && currentPath.startsWith(pattern)) return true;
        return false;
      });

      if (!isCurrentPathAllowed) {
        navigate({ to: newRoleConfig.homeRoute as any });
      }
    } else {
      toast.error(result.error || "Could not switch role");
    }
  };

  const handleConfirmRemoveRole = () => {
    if (!roleToRemove) return;
    const res = removeRole(roleToRemove);
    if (res.success) {
      toast.success(`Removed ${ROLE_CONFIGS[roleToRemove].label} role from your account`);
      if (res.fallbackRole) {
        toast.info(`Switched active role to ${ROLE_CONFIGS[res.fallbackRole].label}`);
        navigate({ to: ROLE_CONFIGS[res.fallbackRole].homeRoute as any });
      }
    } else {
      toast.error(res.error || "Failed to remove role");
    }
    setRoleToRemove(null);
  };

  const handleReRequest = (roleId: RoleId) => {
    const res = reRequestRole(roleId);
    if (res.success) {
      toast.success(`Re-submitted request for ${ROLE_CONFIGS[roleId].label}`);
    } else {
      toast.error(res.error || "Failed to re-submit request");
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group relative flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-semibold shadow-xs transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]",
              activeRoleConfig.colorToken.bg,
              activeRoleConfig.colorToken.border,
              activeRoleConfig.colorToken.text,
              "hover:shadow-sm",
              className
            )}
            aria-label={`Current role: ${activeRoleConfig.label}. Press Alt+R to switch`}
            title="Press Alt+R to switch role"
          >
            {/* Live Role Dot */}
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeRoleConfig.colorToken.hex }}
              aria-hidden="true"
            />

            {/* Icon */}
            <span className="shrink-0">{getRoleIcon(activeRole, "h-3.5 w-3.5")}</span>

            {/* Label */}
            <span className="truncate max-w-[110px] sm:max-w-none font-bold">
              {activeRoleConfig.shortLabel}
            </span>

            {/* Total Active Roles Counter Pill (if user has > 1 role) */}
            {activeRoles.length > 1 && (
              <span className="hidden sm:inline-flex items-center justify-center rounded-full bg-white/70 dark:bg-black/30 px-1.5 py-0.2 text-[10px] font-bold">
                {activeRoles.length}
              </span>
            )}

            <ChevronDown className="h-3.5 w-3.5 text-current opacity-70 group-hover:opacity-100 transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 rounded-2xl p-2 shadow-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card animate-in fade-in-80 zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-2">
            <div>
              <DropdownMenuLabel className="p-0 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Switch Active Role
              </DropdownMenuLabel>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Actions are attributed to your active role
              </p>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-800 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              Alt+R
            </kbd>
          </div>

          <DropdownMenuSeparator className="my-1" />

          {/* ACTIVE ROLES LIST */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Roles ({activeRoles.length})
            </div>

            {activeRoles.map((r) => {
              const cfg = ROLE_CONFIGS[r.role];
              const isCurrent = r.role === activeRole;

              return (
                <div
                  key={r.role}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer",
                    isCurrent
                      ? "bg-slate-100 font-bold text-slate-950 dark:bg-slate-800/80 dark:text-white"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                  )}
                  onClick={() => handleRoleSwitch(r.role)}
                  role="menuitem"
                  aria-current={isCurrent ? "true" : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-lg border",
                        cfg.colorToken.bg,
                        cfg.colorToken.border,
                        cfg.colorToken.text
                      )}
                    >
                      {getRoleIcon(r.role, "h-3.5 w-3.5")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{cfg.label}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[11px] font-normal text-muted-foreground">
                        {cfg.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {isCurrent ? (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        Switch
                      </span>
                    )}

                    {/* Allow removing role if user has more than 1 role */}
                    {activeRoles.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoleToRemove(r.role);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                        title="Remove role from account"
                        aria-label={`Remove ${cfg.label} role`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PENDING APPROVAL ROLES */}
          {pendingRoles.length > 0 && (
            <div className="mt-2 space-y-1">
              <DropdownMenuSeparator className="my-1" />
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pending Approval ({pendingRoles.length})
              </div>

              {pendingRoles.map((r) => {
                const cfg = ROLE_CONFIGS[r.role];
                return (
                  <div
                    key={r.role}
                    className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 opacity-90 cursor-not-allowed"
                    title="Awaiting institutional administrator approval"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        {getRoleIcon(r.role, "h-3.5 w-3.5")}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{cfg.label}</div>
                        <p className="text-[10px] text-amber-700/80 dark:text-amber-400">
                          Awaiting Admin review
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-200/70 dark:bg-amber-900/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 shrink-0">
                      Pending
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* REJECTED ROLES */}
          {rejectedRoles.length > 0 && (
            <div className="mt-2 space-y-1">
              <DropdownMenuSeparator className="my-1" />
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Needs Re-submission ({rejectedRoles.length})
              </div>

              {rejectedRoles.map((r) => {
                const cfg = ROLE_CONFIGS[r.role];
                return (
                  <div
                    key={r.role}
                    className="flex flex-col gap-1 rounded-xl px-2.5 py-2 text-xs bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-rose-950 dark:text-rose-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold">
                        {getRoleIcon(r.role, "h-3.5 w-3.5 text-rose-600")}
                        <span>{cfg.label}</span>
                      </div>
                      <button
                        onClick={() => handleReRequest(r.role)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-800 dark:text-rose-400 underline"
                      >
                        <RotateCcw className="h-2.5 w-2.5" /> Request again
                      </button>
                    </div>
                    {r.rejectionReason && (
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 italic">
                        &ldquo;{r.rejectionReason}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <DropdownMenuSeparator className="my-1" />

          {/* ADD ANOTHER ROLE ACTION */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsAddRoleOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add another role to account</span>
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog for Role Removal */}
      <Dialog open={!!roleToRemove} onOpenChange={(open) => !open && setRoleToRemove(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Remove Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the{" "}
              <span className="font-bold text-foreground">
                {roleToRemove ? ROLE_CONFIGS[roleToRemove].label : ""}
              </span>{" "}
              role from your account? You can always request it again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setRoleToRemove(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemoveRole} className="rounded-xl">
              Confirm Removal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Role Modal */}
      <AddRoleModal open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen} />
    </>
  );
}
