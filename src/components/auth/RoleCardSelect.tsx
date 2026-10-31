import React from "react";
import { Check } from "lucide-react";
import type { RoleId } from "@/types/auth";
import { ROLE_CONFIGS, SELF_SERVICE_ROLES } from "@/types/auth";

interface RoleCardSelectProps {
  roleId: RoleId;
  selected: boolean;
  onToggle: (roleId: RoleId) => void;
  disabled?: boolean;
}

export function RoleCardSelect({ roleId, selected, onToggle, disabled = false }: RoleCardSelectProps) {
  const config = ROLE_CONFIGS[roleId];
  const isInstant = SELF_SERVICE_ROLES.includes(roleId);

  return (
    <div
      onClick={() => !disabled && onToggle(roleId)}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
        selected
          ? "border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      role="checkbox"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          onToggle(roleId);
        }
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                selected ? config.colorToken.bg + " " + config.colorToken.text : "bg-slate-100 text-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{config.iconName}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 leading-tight block">{config.label}</span>
              <span
                className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isInstant ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-amber-50 text-amber-800 border border-amber-200/60"
                }`}
              >
                {isInstant ? "⚡ Instant" : "⏳ Needs Approval"}
              </span>
            </div>
          </div>

          {/* Checkbox badge */}
          <div
            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
              selected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 group-hover:border-slate-400 bg-white"
            }`}
          >
            {selected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{config.description}</p>
      </div>

      {!isInstant && selected && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-amber-800 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-amber-600">info</span>
          <span>Active after admin verification</span>
        </div>
      )}
    </div>
  );
}
