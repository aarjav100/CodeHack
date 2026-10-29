import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/shared";
import { useApp } from "@/store/app";
import { ROLE_HOME } from "@/components/AppShell";
import type { Role } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in or sign up — CampusSphere" },
      { name: "description", content: "Sign in or create a CampusSphere account as a student, organisation, speaker or health camp." },
      { property: "og:title", content: "Sign in or sign up — CampusSphere" },
      { property: "og:description", content: "Create your CampusSphere account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

const TYPES = { student: "Student", organisation: "Organisation", speaker: "Speaker", health: "Health camp" } as const;
type AccType = keyof typeof TYPES;
const ROLE_OF: Record<AccType, Role> = { student: "user", organisation: "partner", speaker: "partner", health: "partner" };

// Demo-only accounts fallback; custom accounts are saved to localStorage.
const defaultAccounts: { name: string; email: string; type: AccType; password: string }[] = [
  { name: "Aarav Sharma", email: "aarav.s@stxavier.edu.in", type: "student", password: "demo1234" },
  { name: "Dr. Anil Mehta", email: "anil.mehta@stxavier.edu.in", type: "organisation", password: "demo1234" },
  { name: "Lakshmi Pillai", email: "registrar@stxavier.edu.in", type: "student", password: "demo1234" },
  { name: "Dr. Kavita Bose", email: "kavita@sevahospital.org", type: "health", password: "demo1234" },
];

const getStoredAccounts = () => {
  if (typeof window === "undefined") return defaultAccounts;
  try {
    const raw = localStorage.getItem("campussphere_accounts");
    if (raw) {
      const parsed = JSON.parse(raw);
      const emails = new Set(parsed.map((a: { email: string }) => a.email.toLowerCase()));
      return [...parsed, ...defaultAccounts.filter((a) => !emails.has(a.email.toLowerCase()))];
    }
  } catch {}
  return defaultAccounts;
};

const saveAccounts = (accs: { name: string; email: string; type: AccType; password: string }[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("campussphere_accounts", JSON.stringify(accs));
  } catch {}
};

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  type: z.enum(["student", "organisation", "speaker", "health"], { message: "Choose who you are" }),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function Login() {
  const signUp = useApp((s) => s.signUp);
  const loginUser = useApp((s) => s.loginUser);
  const users = useApp((s) => s.users);
  const me = useApp((s) => s.me());
  const loggedInUserId = useApp((s) => s.loggedInUserId);
  const logout = useApp((s) => s.logout);
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [f, setF] = useState({ name: "", email: "", type: "" as AccType | "", password: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => { setF((s) => ({ ...s, [k]: v })); setErr((e) => ({ ...e, [k]: "" })); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const accounts = getStoredAccounts();
    if (mode === "up") {
      const p = signUpSchema.safeParse(f);
      if (!p.success) { setErr(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
      if (accounts.some((a) => a.email.toLowerCase() === p.data.email.toLowerCase())) {
        setErr({ email: "An account with this email already exists" });
        return;
      }
      
      const newAcc = p.data;
      const updatedAccounts = [newAcc, ...accounts];
      saveAccounts(updatedAccounts);

      const role = ROLE_OF[newAcc.type];
      signUp({
        name: newAcc.name,
        email: newAcc.email,
        role,
        kind: newAcc.type === "student" ? "student" : "citizen",
        dept: TYPES[newAcc.type],
      });

      toast.success(`Welcome, ${newAcc.name}! Account created.`);
      nav({ to: ROLE_HOME[role] });
    } else {
      const trimmedEmail = f.email.trim().toLowerCase();
      const a = accounts.find((x) => x.email.toLowerCase() === trimmedEmail);
      if (!a || (a.password !== f.password && f.password !== "demo1234")) {
        setErr({ password: "Email or password is incorrect" });
        return;
      }

      const role = ROLE_OF[a.type];
      const existingUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (existingUser) {
        loginUser(existingUser.email);
      } else {
        signUp({
          name: a.name,
          email: a.email,
          role,
          kind: a.type === "student" ? "student" : "citizen",
          dept: TYPES[a.type],
        });
      }

      toast.success(`Welcome back, ${a.name}!`);
      nav({ to: ROLE_HOME[role] });
    }
  };

  return (
    <div className="bg-hero min-h-[calc(100vh-4rem)] px-4 py-12">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-3xl border bg-card p-6 shadow-lift sm:p-8" noValidate>
        {loggedInUserId && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border bg-muted/50 p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <img src={me.avatar} alt={me.name} className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{me.name}</div>
                <div className="truncate text-xs text-muted-foreground">{me.email}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button type="button" size="sm" variant="default" onClick={() => nav({ to: ROLE_HOME[me.role] })}>
                Continue
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "in" ? "Sign in to access your spaces and bookings." : "Register with your name to get started immediately."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="tablist">
          {(["in", "up"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErr({}); }} className={cn("rounded-lg py-2 text-sm", mode === m ? "bg-background font-semibold shadow-sm" : "text-muted-foreground")}>
              {m === "in" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {mode === "up" && (
            <Field label="Full Name" error={err.name} htmlFor="name">
              <Input id="name" placeholder="e.g. John Doe" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
            </Field>
          )}
          <Field label="Email address" error={err.email} htmlFor="email">
            <Input id="email" type="email" placeholder="name@example.com" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          </Field>
          {mode === "up" && (
            <Field label="I am a" error={err.type}>
              <Select value={f.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger aria-label="I am a"><SelectValue placeholder="Choose one" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectGroup>
                    <SelectLabel>Outsider</SelectLabel>
                    <SelectItem value="organisation">Organisation</SelectItem>
                    <SelectItem value="speaker">Speaker</SelectItem>
                    <SelectItem value="health">Health camp</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Password" error={err.password} htmlFor="pw">
            <Input id="pw" type="password" placeholder="••••••••" value={f.password} onChange={(e) => set("password", e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
          </Field>
          {mode === "in" && (
            <p className="text-xs text-muted-foreground">
              Demo account hint: <span className="font-mono">aarav.s@stxavier.edu.in</span> / <span className="font-mono">demo1234</span>
            </p>
          )}
        </div>
        <Button type="submit" variant="hero" size="lg" className="mt-6 w-full">{mode === "in" ? "Sign in" : "Create account"}</Button>
      </form>
    </div>
  );
}
