import React from "react";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS } from "@/types/auth";
import { Clock, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function PendingRoleBanner() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const activeRole = useAuthStore((s) => s.activeRole);

  if (!currentUser) return null;

  const pendingRoles = currentUser.roles.filter((r) => r.status === "pending");
  const rejectedRoles = currentUser.roles.filter((r) => r.status === "rejected");
  const isGuestCustomer =
    activeRole === "customer" &&
    currentUser.roles.some((r) => r.role === "customer" && r.details?.isTemporaryGuest);

  if (pendingRoles.length === 0 && rejectedRoles.length === 0 && !isGuestCustomer) {
    return null;
  }

  return (
    <div className="mb-6 space-y-2">
      {/* Temporary Guest Customer Banner */}
      {isGuestCustomer && (
        <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-sky-50/50 p-4 shadow-sm dark:border-sky-900/60 dark:from-sky-950/40 dark:via-background dark:to-sky-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-600 dark:bg-sky-500/25 dark:text-sky-300">
                <Clock className="h-4 w-4 animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-sky-950 dark:text-sky-100 flex items-center gap-2">
                  Temporary Community Guest Mode Active
                  <span className="rounded-full bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                    Awaiting Admin Approval
                  </span>
                </h4>
                <p className="text-xs text-sky-800/80 dark:text-sky-300/80 mt-0.5">
                  You requested approval-required roles (
                  {pendingRoles.map((p) => ROLE_CONFIGS[p.role].label).join(", ")}
                  ). You can explore public campus spaces as a Community Member while the admin reviews your credentials.
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 shrink-0"
            >
              View verification status <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Standard Pending Role Banner when user has other active roles */}
      {!isGuestCustomer && pendingRoles.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/25">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                <span className="font-bold">Pending Review:</span> Your request for{" "}
                <span className="font-semibold underline decoration-amber-400 decoration-2">
                  {pendingRoles.map((p) => ROLE_CONFIGS[p.role].label).join(", ")}
                </span>{" "}
                is awaiting institutional administrator approval. You can use your active roles in the meantime.
              </p>
            </div>
            <Link
              to="/profile"
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0"
            >
              Check Details
            </Link>
          </div>
        </div>
      )}

      {/* Rejected Roles Notice */}
      {rejectedRoles.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/25">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <p className="text-xs text-rose-900 dark:text-rose-200 font-medium">
                <span className="font-bold">Role Update:</span> Your request for{" "}
                <span className="font-semibold">
                  {rejectedRoles.map((r) => ROLE_CONFIGS[r.role].label).join(", ")}
                </span>{" "}
                was declined: &ldquo;{rejectedRoles[0].rejectionReason || "Credentials require re-submission"}&rdquo;.
              </p>
            </div>
            <Link
              to="/profile"
              className="text-xs font-bold text-rose-800 dark:text-rose-300 hover:underline shrink-0"
            >
              Update &amp; Re-apply
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
