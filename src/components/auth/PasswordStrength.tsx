import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const criteria = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "Contains letters", met: hasLetter },
    { label: "Contains numbers", met: hasNumber },
  ];

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasLetter) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;
  if (password.length >= 12) score += 1;

  const strength =
    password.length === 0
      ? { label: "", color: "bg-slate-200", text: "text-slate-400", width: "0%" }
      : score <= 2
      ? { label: "Weak", color: "bg-rose-500", text: "text-rose-600", width: "33%" }
      : score <= 3
      ? { label: "Fair", color: "bg-amber-500", text: "text-amber-600", width: "66%" }
      : { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600", width: "100%" };

  if (password.length === 0) return null;

  return (
    <div className="space-y-2 pt-1 animate-fadeIn">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Password Strength:</span>
        <span className={`font-bold ${strength.text}`}>{strength.label}</span>
      </div>

      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
          style={{ width: strength.width }}
        ></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-500 pt-0.5">
        {criteria.map((c) => (
          <div key={c.label} className="flex items-center gap-1">
            {c.met ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            )}
            <span className={c.met ? "text-slate-700 font-medium" : "text-slate-400"}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
