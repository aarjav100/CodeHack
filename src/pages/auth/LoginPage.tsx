import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ContinueAsModal } from "@/components/auth/ContinueAsModal";
import { ROLE_CONFIGS } from "@/types/auth";
import type { RoleId } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  User,
  GraduationCap,
  Building2,
  HandHeart,
  Shield,
  HelpCircle,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const isContinueAsOpen = useAuthStore((s) => s.isContinueAsOpen);

  const [email, setEmail] = useState("multi@campus.edu");
  const [password, setPassword] = useState("Password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collapsible demo accounts panel
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  // Forgot password dialog
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please provide both email and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = signIn(email.trim(), password, rememberChoice);

      if (!res.success) {
        // Friendly generic error that does not reveal whether the email exists
        toast.error("Invalid credentials", {
          description: "Please check your email and password, or use one of the demo accounts below.",
        });
        setIsSubmitting(false);
        return;
      }

      // If user has multiple active roles and hasn't remembered choice, ContinueAsModal opens automatically
      if (res.requiresRoleChoice) {
        // ContinueAsModal is controlled by Zustand store (isContinueAsOpen)
        setIsSubmitting(false);
        return;
      }

      // Single active role or remembered choice -> Direct redirect
      const targetUser = res.user;
      if (targetUser) {
        const activeRole = targetUser.activeRole;
        const targetRoute = ROLE_CONFIGS[activeRole]?.homeRoute || "/discover";
        toast.success(`Welcome back, ${targetUser.name}!`, {
          description: `Logged in as ${ROLE_CONFIGS[activeRole].label}`,
        });
        navigate({ to: targetRoute as any });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (accEmail: string, accPass: string, label: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    toast.info(`Filled credentials for ${label}`);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your registered email");
      return;
    }
    toast.success("Password reset instructions dispatched", {
      description: "If an account exists for this address, a reset link has been sent.",
    });
    setIsForgotPassOpen(false);
    setForgotEmail("");
  };

  return (
    <AuthLayout
      title="Welcome to CampusSphare"
      subtitle="The Civic Commons operating system for higher education spaces, equipment, and community programs."
    >
      <div className="w-full max-w-lg mx-auto py-8 px-4 sm:px-6">
        {/* Mobile Header Branding */}
        <div className="lg:hidden text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="CampusSphare Logo" className="h-8 w-8 rounded-lg" />
            <span className="font-extrabold text-lg text-slate-900">CampusSphare</span>
          </Link>
          <p className="text-xs text-slate-500">Unified Multi-Role Campus Architecture</p>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Don't have an account yet?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Collapsible Demo Accounts Panel */}
        <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowDemoPanel(!showDemoPanel)}
            className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-indigo-950 dark:text-indigo-200 hover:bg-indigo-100/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Instant Demo Accounts (Click to Auto-fill)</span>
            </div>
            {showDemoPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDemoPanel && (
            <div className="p-3.5 pt-0 space-y-2 border-t border-indigo-100 dark:border-indigo-900/30">
              <p className="text-[11px] text-muted-foreground mb-2">
                Test the multi-role switcher, admin approvals, or single-role experience instantly:
              </p>

              {/* Demo Account 1: Single Role */}
              <button
                type="button"
                onClick={() =>
                  handleFillDemo("student@campus.edu", "Password123", "Single-Role Student")
                }
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-indigo-100 bg-white dark:border-indigo-900/40 dark:bg-card hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Single-Role User (Aarav)
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      student@campus.edu &bull; Role: Student only
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  Fill credentials &rarr;
                </span>
              </button>

              {/* Demo Account 2: Multi-Role (Student + Owner + Volunteer, Speaker Pending) */}
              <button
                type="button"
                onClick={() =>
                  handleFillDemo(
                    "multi@campus.edu",
                    "Password123",
                    "Multi-Role (Student + Owner + Volunteer)"
                  )
                }
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 bg-white dark:border-indigo-800 dark:bg-card hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group ring-1 ring-indigo-500/10"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Multi-Role User (Aarjav)
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2">
                        Key Demo
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      multi@campus.edu &bull; Student + Owner + Volunteer (Speaker pending)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  Fill credentials &rarr;
                </span>
              </button>

              {/* Demo Account 3: Admin */}
              <button
                type="button"
                onClick={() =>
                  handleFillDemo("admin@campus.edu", "Password123", "System Administrator")
                }
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-card hover:border-slate-400 dark:hover:border-slate-600 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Admin / Manager (Prof. Mehta)
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      admin@campus.edu &bull; Approvals &amp; Role Requests Portal
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:underline">
                  Fill credentials &rarr;
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Email Address
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="e.g. multi@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl text-sm border-slate-200 bg-white dark:bg-slate-900/60"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="login-password"
                className="text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                Password
              </Label>
              <button
                type="button"
                onClick={() => setIsForgotPassOpen(true)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl text-sm pr-10 border-slate-200 bg-white dark:bg-slate-900/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-2xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-[0.99] mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Sign In <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Reset Password</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your email address and we will dispatch a reset link to your inbox.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-xs font-bold">
                Email Address
              </Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="name@campus.edu"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsForgotPassOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Send Reset Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Continue As Modal for multi-role accounts */}
      <ContinueAsModal />
    </AuthLayout>
  );
}
