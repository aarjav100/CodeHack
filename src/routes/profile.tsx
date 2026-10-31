import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/data/types";
import { Award, Lock, Unlock, HandHeart, Pencil, LogOut, CheckCircle2, QrCode, Plus, Clock, RotateCcw, Sparkles } from "lucide-react";
import { Field } from "@/components/shared";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp, useMe } from "@/store/app";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS } from "@/types/auth";
import type { RoleId } from "@/types/auth";
import { AddRoleModal } from "@/components/AddRoleModal";
import { getRoleIcon } from "@/components/RoleSwitcher";
import { ROLE_HOME, ROLE_LABEL } from "@/components/AppShell";
import { toast } from "sonner";
import { fairScore } from "@/lib/logic";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Civic Passport & Credentials — CampusSphare" },
      { name: "description", content: "Your verified student passport, Fair-Share standing, digital NFC keys and certified safety badges." },
      { property: "og:title", content: "Civic Passport — CampusSphare" },
      { property: "og:description", content: "Campus verified identity and skills passport." }
    ]
  }),
  component: Profile,
});

function EditProfileDialog() {
  const me = useMe();
  const updateMe = useApp((s) => s.updateMe);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [dept, setDept] = useState(me.dept ?? "");
  const [enrollment, setEnrollment] = useState(me.enrollment ?? "");

  const handleOpen = (val: boolean) => {
    if (val) {
      setName(me.name);
      setEmail(me.email);
      setDept(me.dept ?? "");
      setEnrollment(me.enrollment ?? "");
    }
    setOpen(val);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateMe({
      name: name.trim(),
      email: email.trim(),
      dept: dept.trim() || undefined,
      enrollment: enrollment.trim() || undefined,
    });
    toast.success("Profile credentials updated successfully!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-500" />
          <span>Edit Details</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Edit Civic Profile</DialogTitle>
          <DialogDescription className="text-slate-500">
            Update your academic citizen name and department records.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Field label="Full Name" htmlFor="profile-name">
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" />
          </Field>
          <Field label="Campus Email" htmlFor="profile-email">
            <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
          </Field>
          <Field label="Department / Program" htmlFor="profile-dept">
            <Input id="profile-dept" placeholder="e.g. B.Tech Computer Science" value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-xl" />
          </Field>
          <Field label="Enrollment / Citizen ID" htmlFor="profile-enr">
            <Input id="profile-enr" placeholder="e.g. IN-EDU-2024-8849" value={enrollment} onChange={(e) => setEnrollment(e.target.value)} className="rounded-xl" />
          </Field>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Profile() {
  const me = useMe();
  const resources = useApp((s) => s.resources);
  const weights = useApp((s) => s.weights);
  const setPriority = useApp((s) => s.setPriority);
  const setRole = useApp((s) => s.setRole);
  const logout = useApp((s) => s.logout);
  const nav = useNavigate();

  const currentUser = useAuthStore((s) => s.currentUser);
  const activeRole = useAuthStore((s) => s.activeRole);
  const switchRole = useAuthStore((s) => s.switchRole);
  const reRequestRole = useAuthStore((s) => s.reRequestRole);
  const authSignOut = useAuthStore((s) => s.signOut);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  const skillRes = resources.filter((r) => r.requirements.some((q) => q.kind === "skill"));
  const score = fairScore(me.factors, weights);

  const handleLogout = () => {
    authSignOut();
    logout();
    toast.success("Signed out successfully");
    nav({ to: "/login" });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Vitals Bar */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Metric 1 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[22px]">badge</span>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Passport Standing</div>
                <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  Verified Citizen
                  <span className="text-xs font-semibold text-emerald-600">• Active</span>
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            {/* Metric 2 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-[22px]">trending_up</span>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Fair-Share Standing</div>
                <div className="text-base font-bold text-emerald-600">
                  {score} / 100 <span className="text-xs text-slate-500 font-normal">(Top 4% on Campus)</span>
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            {/* Metric 3 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <span className="material-symbols-outlined text-[22px]">key</span>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Active Digital Keys</div>
                <div className="text-base font-bold text-slate-900">2 Physical · 4 Mobile Pass</div>
              </div>
            </div>
          </div>
          {/* Fairness Guarantee Badge */}
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">balance</span>
            <span>Fair Campus Allocation: Guaranteed</span>
          </div>
        </div>
      </section>

      {/* SECTION 1: STUDENT PASSPORT CARD & FAIR-SHARE SCORE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Friendly Student Passport Identity Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          {/* Gentle ambient accent background */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Card Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Student Identity Pass</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    Verified Student
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{me.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{me.dept || "Dept. of Autonomous Systems & Computing"}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[24px]">contactless</span>
              </div>
            </div>

            {/* Center Digital Chip / QR Section */}
            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              <div className="w-20 h-20 bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center group-hover:border-blue-300 transition-colors">
                {/* SVG QR representation */}
                <svg className="w-full h-full text-blue-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect height="6" rx="1" width="6" x="2" y="2"></rect>
                  <rect height="6" rx="1" width="6" x="16" y="2"></rect>
                  <rect height="6" rx="1" width="6" x="2" y="16"></rect>
                  <path d="M10 2h4v4h-4z"></path>
                  <path d="M10 10h4v4h-4z"></path>
                  <path d="M2 10h4v4H2z"></path>
                  <path d="M16 10h2v2h-2z"></path>
                  <path d="M20 14h2v2h-2z"></path>
                  <path d="M14 16v4h2"></path>
                  <path d="M18 18h4v4h-4z"></path>
                  <path d="M10 18h2v4h-2z"></path>
                </svg>
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">CITIZEN ID</span>
                  <span className="font-bold text-slate-800">{me.enrollment || "IN-EDU-2024-8849"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">ACCESS PERMIT</span>
                  <span className="font-semibold text-slate-700">Labs + Fab Suite + B9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">COMMUNITY HOURS</span>
                  <span className="font-bold text-amber-700">{me.hours} Hours Logged</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>NFC &amp; Smart Gate Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Actions */}
          <div className="relative z-10 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="material-symbols-outlined text-[16px] text-blue-600">verified_user</span>
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <EditProfileDialog />
              <button
                type="button"
                onClick={() => toast.success("Pass export PDF downloaded")}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">share</span>
                <span>Export</span>
              </button>
              <button
                type="button"
                onClick={() => toast.success("Digital keys synced with mobile gate pass")}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fair-Share Score & Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Section Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fair Allocation Model</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">Top 4% on Campus</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Your Fair-Share Score: {score} / 100</h3>
                <p className="text-xs text-slate-500 mt-0.5">Earn priority scheduling by maintaining equipment and sharing campus spaces responsibly.</p>
              </div>
              <div className="text-right pl-3 shrink-0">
                <div className="text-2xl font-extrabold text-blue-600 tracking-tight">
                  {score}<span className="text-xs font-normal text-slate-400">/100</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +3.2 pts this sprint
                </span>
              </div>
            </div>

            {/* Score Progress Visualizer Bar */}
            <div className="my-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Current Standing: Sovereign Tier</span>
                <span className="font-medium text-blue-600">7 points to Master Fellow (Tier 0)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex p-0.5">
                <div className="bg-blue-600 h-full rounded-l-full" style={{ width: "36%" }}></div>
                <div className="bg-emerald-500 h-full" style={{ width: "28%" }}></div>
                <div className="bg-teal-400 h-full" style={{ width: "24%" }}></div>
                <div className="bg-indigo-400 h-full rounded-r-full" style={{ width: "12%" }}></div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                <span>Standard (40)</span>
                <span>Active (65)</span>
                <span className="text-blue-600 font-bold">You ({score})</span>
                <span>Master Fellow (95)</span>
              </div>
            </div>

            {/* Easy-Earn Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">On-Time Room Checkout</div>
                    <div className="text-[11px] text-slate-500">100% clean desk rate</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">+30 Pts</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                    <span className="material-symbols-outlined text-[18px]">school</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hosted Peer Lab Session</div>
                    <div className="text-[11px] text-slate-500">2 Linux workshops led</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">+25 Pts</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                    <span className="material-symbols-outlined text-[18px]">event_available</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Zero Cancellations</div>
                    <div className="text-[11px] text-slate-500">Perfect attendance streak</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">+20 Pts</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Peer &amp; Mentor Reviews</div>
                    <div className="text-[11px] text-slate-500">14 positive endorsements</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">+13 Pts</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
            <span>Need advice on maintaining score?</span>
            <Link to="/fair-share" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Read Fair-Share Guide <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: VERIFIED SAFETY BADGES & UNLOCKED CAMPUS PERKS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verified Safety Protocols & Badges (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Credential Registry</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {me.skills.length || 4} Active Certifications
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Verified Safety Badges</h3>
                <p className="text-xs text-slate-500 mt-0.5">Faculty-certified badges granting direct digital door unlocks.</p>
              </div>
              <span className="material-symbols-outlined text-[24px] text-blue-600">verified</span>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">biotech</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Bio-Safety Level 1</span>
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Cleared for microbiology bench &amp; autoclave access.</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    ID: BSL1-9042
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">air</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Cleanroom Protocol</span>
                    <span className="material-symbols-outlined text-[15px] text-blue-600">check_circle</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">ISO Class 6 garmenting &amp; particulate protocols passed.</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                    ID: CR-8821
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Laser Cutter Certified</span>
                    <span className="material-symbols-outlined text-[15px] text-amber-700">check_circle</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">CO2 optics alignment, focal length and exhaust extraction.</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                    ID: LC-4019
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">High-Voltage Fab</span>
                    <span className="material-symbols-outlined text-[15px] text-purple-600">check_circle</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Authorized for test rigs, three-phase power &amp; battery ovens.</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                    ID: HV-5501
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Want to certify on new university equipment?</span>
            <Link to="/discover" className="text-blue-600 font-semibold hover:underline">
              Browse Free Safety Workshops
            </Link>
          </div>
        </div>

        {/* Unlocked Spaces & Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">door_open</span>
              Spaces Unlocked by Your Credentials
            </h3>
            <ul className="space-y-2">
              {skillRes.map((r) => {
                const req = r.requirements.find((q) => q.kind === "skill")!;
                const ok = me.skills.includes(req.skill!);
                return (
                  <li key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50">
                    <Link to="/resources/$id" params={{ id: r.id }} className="font-semibold text-slate-800 hover:text-blue-600 hover:underline">
                      {r.name}
                    </Link>
                    <span className={`inline-flex items-center gap-1 font-medium ${ok ? "text-emerald-700" : "text-slate-400"}`}>
                      {ok ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      {req.skill}
                    </span>
                  </li>
                );
              })}
            </ul>

            {me.role === "user" && (
              <label className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50">
                <span className="text-xs">
                  <span className="font-semibold text-slate-800 block">Study priority assistance need?</span>
                  <span className="text-[11px] text-slate-500">
                    Provides priority at the Study Center. Kept confidential with campus management.
                  </span>
                </span>
                <Switch checked={!!me.priorityNeed} onCheckedChange={setPriority} aria-label="Self-declare study priority need" />
              </label>
            )}

            {/* Multi-Role Personas Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Account Roles ({currentUser?.roles.length || 1})
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Switch persona instantly without logging out
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddRoleOpen(true)}
                  className="rounded-xl text-xs h-7 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Role
                </Button>
              </div>

              {/* Roles List */}
              <div className="space-y-1.5">
                {currentUser?.roles.map((r) => {
                  const cfg = ROLE_CONFIGS[r.role];
                  const isCurrent = r.role === activeRole;
                  const isActive = r.status === "active";
                  const isPending = r.status === "pending";
                  const isRejected = r.status === "rejected";

                  return (
                    <div
                      key={r.role}
                      onClick={() => {
                        if (isActive && !isCurrent) {
                          switchRole(r.role);
                          toast.success(`Switched active persona to ${cfg.label}`);
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isCurrent
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20 font-semibold"
                          : isActive
                          ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer"
                          : "border-slate-200 bg-slate-50/50 opacity-80 cursor-default"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: cfg.colorToken.hex + "15",
                            borderColor: cfg.colorToken.hex + "30",
                            color: cfg.colorToken.hex,
                          }}
                        >
                          {getRoleIcon(r.role, "h-3.5 w-3.5")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span>{cfg.label}</span>
                            {isCurrent && (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2">
                                Active Now
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {cfg.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 ml-2">
                        {isActive && !isCurrent && (
                          <span className="text-[11px] font-bold text-primary hover:underline">
                            Switch
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" /> Awaiting Review
                          </span>
                        )}
                        {isRejected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              reRequestRole(r.role);
                              toast.success(`Re-submitted request for ${cfg.label}`);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full hover:bg-rose-100"
                          >
                            <RotateCcw className="h-2.5 w-2.5" /> Re-apply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs"
                  onClick={() => nav({ to: "/login" })}
                >
                  Switch Account
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Role Modal */}
      <AddRoleModal open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen} />
    </div>
  );
}


