import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { RoleCardSelect } from "@/components/auth/RoleCardSelect";
import { ROLE_CONFIGS, SELF_SERVICE_ROLES, APPROVAL_REQUIRED_ROLES } from "@/types/auth";
import type { RoleId, RoleDetails } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Sparkles, CheckCircle2, Clock, ArrowRight, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export function SignupPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);

  // Form Fields (Minimal as per specifications)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<RoleId[]>(["student"]);
  const [startAs, setStartAs] = useState<RoleId>("student");

  // Additional details map for approval-required roles
  const [detailsMap, setDetailsMap] = useState<Partial<Record<RoleId, RoleDetails>>>({});

  // Loading & Success Dialog State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successUser, setSuccessUser] = useState<any | null>(null);

  // Available roles for user selection
  const selectableRoles: RoleId[] = [...SELF_SERVICE_ROLES, ...APPROVAL_REQUIRED_ROLES];

  const toggleRole = (roleId: RoleId) => {
    setSelectedRoles((prev) => {
      let next: RoleId[];
      if (prev.includes(roleId)) {
        if (prev.length === 1) {
          toast.warning("At least one role must be selected");
          return prev;
        }
        next = prev.filter((r) => r !== roleId);
      } else {
        next = [...prev, roleId];
      }

      // Update startAs if current startAs was removed, default to first instant role
      if (!next.includes(startAs)) {
        const firstInstant = next.find((r) => SELF_SERVICE_ROLES.includes(r)) || next[0];
        setStartAs(firstInstant);
      }
      return next;
    });
  };

  // Determine if only approval-required roles are ticked
  const hasInstantRole = selectedRoles.some((r) => SELF_SERVICE_ROLES.includes(r));
  const hasApprovalRole = selectedRoles.some((r) => APPROVAL_REQUIRED_ROLES.includes(r));

  // Password validation: min 8 chars, at least 1 letter, at least 1 number
  const isPasswordValid =
    password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid academic or professional email");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password must be at least 8 characters with a letter and a number");
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = signUp({
        name: fullName.trim(),
        email: email.trim(),
        password,
        selectedRoles,
        startAs,
        detailsMap,
      });

      if (!result.success) {
        toast.error(result.error || "Sign up failed");
        setIsSubmitting(false);
        return;
      }

      // Display the post-signup success breakdown dialog
      setSuccessUser(result.user);
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToDashboard = () => {
    if (!successUser) return;
    const activeRole = successUser.activeRole as RoleId;
    const targetRoute = ROLE_CONFIGS[activeRole]?.homeRoute || "/discover";
    toast.success(`Welcome to CampusSphare, ${successUser.name}!`);
    navigate({ to: targetRoute as any });
  };

  return (
    <AuthLayout
      title="Create your unified account"
      subtitle="One email unlocks verified access to campus labs, civic spaces, volunteer programs, and community initiatives."
    >
      <div className="w-full max-w-xl mx-auto py-8 px-4 sm:px-6">
        {/* Mobile Header Branding */}
        <div className="lg:hidden text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="CampusSphare Logo" className="h-8 w-8 rounded-lg" />
            <span className="font-extrabold text-lg text-slate-900">CampusSphare</span>
          </Link>
          <p className="text-xs text-slate-500">Civic Commons &amp; Shared Campus Architecture</p>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 1: Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullname" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Full Name
            </Label>
            <div className="relative">
              <Input
                id="fullname"
                type="text"
                placeholder="e.g. Asha Verma or Dr. Anil Mehta"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11 rounded-xl text-sm pl-10 border-slate-200 bg-white dark:bg-slate-900/60"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Field 2: Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. name@campus.edu or organisation@org.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl text-sm border-slate-200 bg-white dark:bg-slate-900/60"
            />
            <p className="text-[11px] text-muted-foreground">
              One person = one email. You can add or switch roles at any time.
            </p>
          </div>

          {/* Field 3: Password with strength meter and show/hide toggle */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters with letter & number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl text-sm pr-10 border-slate-200 bg-white dark:bg-slate-900/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Live Password Strength Meter */}
            <PasswordStrength password={password} />
          </div>

          {/* Field 4: MULTI-SELECT role cards */}
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                I want to use CampusSphare as (choose one or more)
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Select your intended campus capacities. Instant roles are active right away; approval roles are verified by campus administrators.
              </p>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectableRoles.map((roleId) => (
                <RoleCardSelect
                  key={roleId}
                  roleId={roleId}
                  selected={selectedRoles.includes(roleId)}
                  onToggle={toggleRole}
                />
              ))}
            </div>

            {/* Info note when approval-required role is chosen */}
            {hasApprovalRole && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <p>
                    <span className="font-bold">Approval Note:</span> Approval-required roles will be activated after admin verification.
                    {!hasInstantRole && (
                      <span className="block mt-1 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                        Since only approval-required roles were selected, you will start in a limited &ldquo;Customer&rdquo; guest mode until reviewed.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Field 5: "Start as" selector (Only appears when more than one role is ticked) */}
          {selectedRoles.length > 1 && (
            <div className="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
              <Label htmlFor="startAs" className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Start as (initial active role)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                You can switch between any of your active roles immediately at any time.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {selectedRoles.map((r) => {
                  const cfg = ROLE_CONFIGS[r];
                  const isSelected = startAs === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setStartAs(r)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-primary bg-white text-primary shadow-xs ring-2 ring-primary/20 dark:bg-slate-900"
                          : "border-slate-200 bg-white/70 hover:bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.colorToken.hex }} />
                      <span className="truncate">{cfg.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !isPasswordValid || !email || !fullName}
            className="w-full h-11 rounded-2xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating your account...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Complete Registration <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to the CampusSphare Civic Commons Charter &amp; Fair-Share Guidelines.
          </p>
        </form>
      </div>

      {/* Post-Signup Success Screen Dialog */}
      <Dialog open={!!successUser} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center sm:text-left">
            <div className="mx-auto sm:mx-0 mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Account Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Your CampusSphare account is active for <strong>{successUser?.email}</strong>. Here is the status of your requested roles:
            </DialogDescription>
          </DialogHeader>

          {/* Roles Breakdown */}
          <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {successUser?.roles.map((r: any) => {
              const cfg = ROLE_CONFIGS[r.role as RoleId];
              const isActive = r.status === "active";
              return (
                <div
                  key={r.role}
                  className={`flex items-center justify-between p-3 rounded-2xl border ${
                    isActive
                      ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                      : "border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: cfg.colorToken.hex + "20", color: cfg.colorToken.hex }}
                    >
                      {cfg.shortLabel.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {cfg.label}
                        {r.role === successUser.activeRole && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.2 text-[10px] font-bold text-primary">
                            Starting Role
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{cfg.description}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 flex items-center gap-1"
                    }`}
                  >
                    {isActive ? (
                      "Active"
                    ) : (
                      <>
                        <Clock className="h-3 w-3" /> Pending Approval
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button
              onClick={handleProceedToDashboard}
              className="w-full rounded-2xl h-11 text-sm font-bold bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
              Continue to {ROLE_CONFIGS[successUser?.activeRole as RoleId]?.label} Dashboard{" "}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
