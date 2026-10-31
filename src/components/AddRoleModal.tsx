import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS, SELF_SERVICE_ROLES, APPROVAL_REQUIRED_ROLES } from "@/types/auth";
import type { RoleId, RoleDetails } from "@/types/auth";
import { Plus, Check, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AddRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRoleModal({ open, onOpenChange }: AddRoleModalProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const addRole = useAuthStore((s) => s.addRole);

  const existingRoleIds = new Set(currentUser?.roles.map((r) => r.role) ?? []);
  const availableRoles = [...SELF_SERVICE_ROLES, ...APPROVAL_REQUIRED_ROLES].filter(
    (roleId) => !existingRoleIds.has(roleId)
  );

  const [selectedRole, setSelectedRole] = useState<RoleId | null>(availableRoles[0] || null);
  const [details, setDetails] = useState<RoleDetails>({
    reason: "",
    profession: "",
    topic: "",
    organisationName: "",
    servicesOffered: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInstant = selectedRole ? SELF_SERVICE_ROLES.includes(selectedRole) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (!isInstant && !details.reason?.trim()) {
      toast.error("Please provide a short reason for requesting this role");
      return;
    }

    if (selectedRole === "organisation" && !details.organisationName?.trim()) {
      toast.error("Please enter your organisation name");
      return;
    }

    if (selectedRole === "speaker" && (!details.profession?.trim() || !details.topic?.trim())) {
      toast.error("Please specify your profession and keynote topic");
      return;
    }

    if (selectedRole === "health_partner" && (!details.organisationName?.trim() || !details.servicesOffered?.trim())) {
      toast.error("Please provide health organisation and services offered");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = addRole(selectedRole, details);
      setIsSubmitting(false);

      if (res.success) {
        if (res.status === "active") {
          toast.success(`Role "${ROLE_CONFIGS[selectedRole].label}" activated immediately!`);
        } else {
          toast.info(`Request for "${ROLE_CONFIGS[selectedRole].label}" submitted for administrator review.`);
        }
        onOpenChange(false);
        // Reset
        setDetails({
          reason: "",
          profession: "",
          topic: "",
          organisationName: "",
          servicesOffered: "",
        });
      } else {
        toast.error(res.error || "Failed to add role");
      }
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Account Credentials</span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">Add Another Role</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Expand your account capabilities with an additional verified campus persona.
          </DialogDescription>
        </DialogHeader>

        {availableRoles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            You have already added all available community and campus roles to your account.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Role to Add</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {availableRoles.map((roleId) => {
                  const config = ROLE_CONFIGS[roleId];
                  const instant = SELF_SERVICE_ROLES.includes(roleId);
                  const isChosen = selectedRole === roleId;

                  return (
                    <div
                      key={roleId}
                      onClick={() => setSelectedRole(roleId)}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        isChosen
                          ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/30"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          config.colorToken.bg + " " + config.colorToken.text
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{config.iconName}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">{config.shortLabel}</span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              instant ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {instant ? "Instant" : "Approval"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{config.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic fields for approval-required roles */}
            {selectedRole && !isInstant && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Admin Approval Required Details</span>
                </div>

                {selectedRole === "organisation" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Organisation / NGO Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Clean Energy Youth Forum / TechCorp India"
                      value={details.organisationName}
                      onChange={(e) => setDetails({ ...details, organisationName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {selectedRole === "speaker" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Profession / Affiliation *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lead Robotics Engineer"
                        value={details.profession}
                        onChange={(e) => setDetails({ ...details, profession: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Keynote / Topic *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Autonomous AI Navigation"
                        value={details.topic}
                        onChange={(e) => setDetails({ ...details, topic: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === "health_partner" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Healthcare Organisation *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Seva Community Hospital"
                        value={details.organisationName}
                        onChange={(e) => setDetails({ ...details, organisationName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Services Offered *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eye screening, Blood donation"
                        value={details.servicesOffered}
                        onChange={(e) => setDetails({ ...details, servicesOffered: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Short Justification / Reason *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Briefly state why you are requesting this role..."
                    value={details.reason}
                    onChange={(e) => setDetails({ ...details, reason: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedRole}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isInstant ? "Activate Role Now" : "Submit Request to Admin"}</span>
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
