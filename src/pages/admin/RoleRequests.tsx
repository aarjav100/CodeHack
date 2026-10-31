import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS } from "@/types/auth";
import type { RoleId } from "@/types/auth";
import { RoleRouteGuard } from "@/components/auth/RoleRouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  User,
  AlertCircle,
  Building2,
  Mic,
  HeartPulse,
  Briefcase,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getRoleIcon } from "@/components/RoleSwitcher";

export function RoleRequestsPage() {
  const users = useAuthStore((s) => s.users);
  const approveRoleRequest = useAuthStore((s) => s.approveRoleRequest);
  const rejectRoleRequest = useAuthStore((s) => s.rejectRoleRequest);

  const [activeTab, setActiveTab] = useState<"pending" | "resolved" | "all">("pending");
  const [search, setSearch] = useState("");

  // Reject modal state
  const [rejectItem, setRejectItem] = useState<{ userId: string; roleId: RoleId; userName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Gather all role requests across all users
  const allRequests = users.flatMap((user) =>
    user.roles.map((r) => ({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      dept: user.dept,
      role: r.role,
      status: r.status,
      requestedAt: r.requestedAt,
      approvedAt: r.approvedAt,
      details: r.details,
      rejectionReason: r.rejectionReason,
    }))
  );

  // Filter requests
  const filteredRequests = allRequests.filter((item) => {
    // Tab filter
    if (activeTab === "pending" && item.status !== "pending") return false;
    if (activeTab === "resolved" && item.status === "pending") return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.userName.toLowerCase().includes(q);
      const matchEmail = item.userEmail.toLowerCase().includes(q);
      const matchRole = ROLE_CONFIGS[item.role].label.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }

    return true;
  });

  const pendingCount = allRequests.filter((r) => r.status === "pending").length;

  const handleApprove = (userId: string, roleId: RoleId, userName: string) => {
    const res = approveRoleRequest(userId, roleId);
    if (res.success) {
      toast.success(`Approved ${ROLE_CONFIGS[roleId].label} role for ${userName}`, {
        description: "The role is now immediately active in the user's account switcher.",
      });
    } else {
      toast.error(res.error || "Failed to approve request");
    }
  };

  const handleConfirmReject = () => {
    if (!rejectItem) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for declining this request");
      return;
    }

    const res = rejectRoleRequest(rejectItem.userId, rejectItem.roleId, rejectReason.trim());
    if (res.success) {
      toast.success(`Declined ${ROLE_CONFIGS[rejectItem.roleId].label} for ${rejectItem.userName}`, {
        description: "The user has been notified and can re-submit with revisions.",
      });
      setRejectItem(null);
      setRejectReason("");
    } else {
      toast.error(res.error || "Failed to decline request");
    }
  };

  return (
    <RoleRouteGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Institutional Governance &amp; Credential Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Role Access Requests
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verify credentials and approve multi-role requests for space owners, guest speakers, and partner organisations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <Clock className="h-4 w-4" />
              <span>{pendingCount} Pending Approval</span>
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "pending"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "resolved"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resolved History
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Records
            </button>
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search user, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl text-xs bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Requests Table / Cards */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white/50 dark:bg-slate-900/20">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              All Caught Up!
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              There are no role requests matching this view. When citizens apply for space owner, speaker or partner roles, they will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Requested Role</th>
                    <th className="py-3 px-4">Submitted Credentials &amp; Details</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.map((item, idx) => {
                    const cfg = ROLE_CONFIGS[item.role];
                    const isPending = item.status === "pending";
                    const isApproved = item.status === "active";
                    const isRejected = item.status === "rejected";

                    return (
                      <tr
                        key={`${item.userId}-${item.role}-${idx}`}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        {/* Applicant Column */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.userName}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{item.userEmail}</div>
                          {item.dept && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.dept}</div>
                          )}
                        </td>

                        {/* Requested Role Column */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 font-bold"
                            style={{
                              backgroundColor: cfg.colorToken.hex + "15",
                              borderColor: cfg.colorToken.hex + "30",
                              color: cfg.colorToken.hex,
                            }}
                          >
                            {getRoleIcon(item.role, "h-3.5 w-3.5")}
                            <span>{cfg.label}</span>
                          </div>
                        </td>

                        {/* Details Column */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {item.details ? (
                            <div className="space-y-1">
                              {item.details.organisationName && (
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  Org: {item.details.organisationName}
                                </p>
                              )}
                              {item.details.profession && (
                                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                                  Profession: {item.details.profession}
                                </p>
                              )}
                              {item.details.topic && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                  Topic: {item.details.topic}
                                </p>
                              )}
                              {item.details.servicesOffered && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                  Services: {item.details.servicesOffered}
                                </p>
                              )}
                              {item.details.reason && (
                                <p className="text-[11px] italic text-muted-foreground bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                  &ldquo;{item.details.reason}&rdquo;
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Standard self-request</span>
                          )}
                        </td>

                        {/* Date Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground">
                          {new Date(item.requestedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Status Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-bold">
                              <Clock className="h-3 w-3" /> Pending Review
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                              <CheckCircle2 className="h-3 w-3" /> Approved &amp; Active
                            </span>
                          )}
                          {isRejected && (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 px-2.5 py-0.5 text-[10px] font-bold">
                                <XCircle className="h-3 w-3" /> Declined
                              </span>
                              {item.rejectionReason && (
                                <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-1 max-w-[150px] truncate" title={item.rejectionReason}>
                                  Reason: {item.rejectionReason}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(item.userId, item.role, item.userName)}
                                className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setRejectItem({
                                    userId: item.userId,
                                    roleId: item.role,
                                    userName: item.userName,
                                  })
                                }
                                className="h-8 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 font-semibold text-xs"
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Decline
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              {isApproved ? "Approved" : "Declined"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={!!rejectItem} onOpenChange={(open) => !open && setRejectItem(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader>
              <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Decline Role Request
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Please provide a clear reason for declining {rejectItem?.userName}&apos;s request for{" "}
                <strong>{rejectItem ? ROLE_CONFIGS[rejectItem.roleId].label : ""}</strong>. The applicant will see this explanation and can update their submission.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 mt-2">
              <Label htmlFor="rejectReason" className="text-xs font-bold">
                Rejection Reason (Required)
              </Label>
              <Textarea
                id="rejectReason"
                rows={3}
                placeholder="e.g. Please provide your faculty sponsor certification letter or lab safety certification ID."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setRejectItem(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                className="rounded-xl font-bold"
              >
                Confirm Decline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleRouteGuard>
  );
}
