import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/data/types";
import { Award, Lock, Unlock, HandHeart, Pencil, LogOut } from "lucide-react";
import { PageHeader, Panel, StatusBadge, VerifiedBadge, Field } from "@/components/shared";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp, useMe } from "@/store/app";
import { ROLE_HOME, ROLE_LABEL } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile & skills passport — CampusSphare" }, { name: "description", content: "Your verification, badges, community hours and unlocked spaces." }, { property: "og:title", content: "Profile — CampusSphare" }, { property: "og:description", content: "Skills passport and community hours." }] }),
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
    toast.success("Profile updated successfully!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2 h-8 gap-1.5 rounded-lg text-xs">
          <Pencil className="h-3.5 w-3.5" /> Edit details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your display name and academic details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Field label="Full Name" htmlFor="profile-name">
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Email" htmlFor="profile-email">
            <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Department / Role" htmlFor="profile-dept">
            <Input id="profile-dept" placeholder="e.g. B.Tech Computer Science" value={dept} onChange={(e) => setDept(e.target.value)} />
          </Field>
          <Field label="Enrollment ID" htmlFor="profile-enr">
            <Input id="profile-enr" placeholder="e.g. SXC22PHY041" value={enrollment} onChange={(e) => setEnrollment(e.target.value)} />
          </Field>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="hero">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Profile() {
  const me = useMe();
  const resources = useApp((s) => s.resources);
  const setPriority = useApp((s) => s.setPriority);
  const setRole = useApp((s) => s.setRole);
  const logout = useApp((s) => s.logout);
  const nav = useNavigate();
  const roles: Role[] = ["user", "owner", "partner", "admin"];
  const skillRes = resources.filter((r) => r.requirements.some((q) => q.kind === "skill"));

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    nav({ to: "/login" });
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your identity, personal details and verified skills passport." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <Panel>
          <div className="flex items-start gap-4">
            <img src={me.avatar} alt={me.name} className="h-20 w-20 rounded-2xl bg-muted object-cover shadow-sm" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold truncate">{me.name}</h2>
              <div className="text-sm text-muted-foreground">{ROLE_LABEL[me.role]} · {me.dept ?? me.kind}</div>
              <div className="mt-1">{me.verified === "verified" ? <VerifiedBadge /> : <Link to="/verify"><StatusBadge status={me.verified} /></Link>}</div>
              <EditProfileDialog />
            </div>
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{me.email}</dd></div>
            {me.enrollment && <div className="flex justify-between"><dt className="text-muted-foreground">Enrollment</dt><dd className="font-medium">{me.enrollment}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">Community hours</dt><dd className="inline-flex items-center gap-1 font-semibold text-amber-foreground"><HandHeart className="h-4 w-4 text-amber" />{me.hours}h</dd></div>
          </dl>
          {me.role === "user" && (
            <label className="mt-5 flex items-start justify-between gap-3 rounded-xl border p-3">
              <span className="text-sm"><span className="font-medium">No peaceful place to study at home?</span><span className="block text-xs text-muted-foreground">Gives you priority at the Study Center. Only the manager sees this — never shown publicly.</span></span>
              <Switch checked={!!me.priorityNeed} onCheckedChange={setPriority} aria-label="Self-declare study priority need" />
            </label>
          )}
          <div className="mt-5 border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">Switch role view</h3>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <Button key={r} size="sm" variant={me.role === r ? "default" : "outline"} onClick={() => { setRole(r); nav({ to: ROLE_HOME[r] }); }}>{ROLE_LABEL[r]}</Button>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => nav({ to: "/login" })}>Sign in with a different account</Button>
              <Button variant="outline" size="sm" className="w-full justify-center text-destructive hover:bg-destructive/10" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1.5" /> Sign out</Button>
            </div>
          </div>
        </Panel>
        <Panel title="Skills passport">
          {me.skills.length === 0 ? <p className="text-sm text-muted-foreground">No badges yet. <Link to="/discover" className="text-primary underline">Free workshops</Link> earn badges that unlock equipment.</p> : (
            <div className="flex flex-wrap gap-2">{me.skills.map((s) => <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-teal/12 px-3 py-1.5 text-sm font-semibold text-teal"><Award className="h-4 w-4" />{s}</span>)}</div>
          )}
          <h3 className="mb-2 mt-6 text-sm font-semibold">What your badges unlock</h3>
          <ul className="space-y-2">
            {skillRes.map((r) => {
              const req = r.requirements.find((q) => q.kind === "skill")!;
              const ok = me.skills.includes(req.skill!);
              return (
                <li key={r.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <Link to="/resources/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.name}</Link>
                  <span className={ok ? "inline-flex items-center gap-1 text-st-approved" : "inline-flex items-center gap-1 text-muted-foreground"}>{ok ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}{req.skill}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

