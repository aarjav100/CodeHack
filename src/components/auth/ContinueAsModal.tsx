import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS } from "@/types/auth";
import type { RoleId } from "@/types/auth";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function ContinueAsModal() {
  const isOpen = useAuthStore((s) => s.isContinueAsOpen);
  const pendingUser = useAuthStore((s) => s.pendingLoginUser);
  const confirmContinueAs = useAuthStore((s) => s.confirmContinueAs);
  const dismiss = useAuthStore((s) => s.dismissContinueAs);
  const nav = useNavigate();

  const activeRoles = pendingUser ? pendingUser.roles.filter((r) => r.status === "active").map((r) => r.role) : [];
  const defaultSelected = pendingUser?.lastActiveRole && activeRoles.includes(pendingUser.lastActiveRole)
    ? pendingUser.lastActiveRole
    : activeRoles[0] || "student";

  const [selectedRole, setSelectedRole] = useState<RoleId>(defaultSelected);
  const [remember, setRemember] = useState(false);

  if (!pendingUser) return null;

  const handleConfirm = () => {
    confirmContinueAs(selectedRole, remember);
    const homeRoute = ROLE_CONFIGS[selectedRole]?.homeRoute || "/discover";
    nav({ to: homeRoute });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Multi-Role Account</span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Welcome back, {pendingUser.name.split(" ")[0]}!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            You hold {activeRoles.length} active roles on CampusShare. Choose which persona to start as:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 my-3 max-h-[300px] overflow-y-auto pr-1">
          {activeRoles.map((roleId) => {
            const config = ROLE_CONFIGS[roleId];
            const isChosen = selectedRole === roleId;
            return (
              <div
                key={roleId}
                onClick={() => setSelectedRole(roleId)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isChosen
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/20"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      config.colorToken.bg + " " + config.colorToken.text
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{config.iconName}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{config.label}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{config.description}</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isChosen ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                  }`}
                >
                  {isChosen && <Check className="h-3 w-3 stroke-[2.5]" />}
                </div>
              </div>
            );
          })}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none py-1">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
          />
          <span>Remember my choice on this device (you can still switch anytime)</span>
        </label>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continue as {ROLE_CONFIGS[selectedRole]?.shortLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
