import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell, Moon, Sun, Languages, Menu, X, Compass, CalendarDays, LayoutGrid, BookOpen, GraduationCap,
  Landmark, Gauge, ListOrdered, User, Building2, Inbox, PlusCircle, AlertTriangle, ScrollText,
  BarChart3, HandHeart, Flame, Handshake, Shield, Mic, HeartPulse, Wrench, Sparkles, Headset, ClipboardList,
} from "lucide-react";
import { useApp, useMe } from "@/store/app";
import type { Role } from "@/data/types";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoGuide } from "./DemoGuide";
import { VerifiedBadge } from "./shared";

type Item = { to: string; label: string; icon: typeof Compass };
export const ROLE_LABEL: Record<Role, string> = {
  user: "Student / Citizen", owner: "Owner", manager: "Manager", volunteer: "Volunteer", partner: "Partner / Speaker", admin: "Admin",
};

const NAV: Record<Role, Item[]> = {
  user: [
    { to: "/discover", label: "Discover spaces", icon: Compass },
    { to: "/bookings", label: "My bookings", icon: ClipboardList },
    { to: "/programs", label: "Programs", icon: LayoutGrid },
    { to: "/study", label: "Study Center", icon: BookOpen },
    { to: "/health", label: "Health camps", icon: HeartPulse },
    { to: "/fair-share", label: "Fair-Share Score", icon: Gauge },
    { to: "/waitlists", label: "Waiting lists", icon: ListOrdered },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/profile", label: "Profile & passport", icon: User },
  ],
  owner: [
    { to: "/owner", label: "Owner dashboard", icon: Building2 },
    { to: "/approvals", label: "Approvals inbox", icon: Inbox },
    { to: "/resources/new", label: "List a resource", icon: PlusCircle },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/waitlists", label: "Waiting lists", icon: ListOrdered },
    { to: "/audit", label: "Audit log", icon: ScrollText },
  ],
  manager: [
    { to: "/approvals", label: "Approvals inbox", icon: Inbox },
    { to: "/programs", label: "Programs", icon: LayoutGrid },
    { to: "/programs/new", label: "Create program", icon: PlusCircle },
    { to: "/speakers", label: "Speakers & invites", icon: Mic },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/waitlists", label: "Waiting lists", icon: ListOrdered },
    { to: "/audit", label: "Audit log", icon: ScrollText },
  ],
  volunteer: [
    { to: "/volunteer", label: "Volunteer dashboard", icon: HandHeart },
    { to: "/study", label: "Study Center & doubts", icon: BookOpen },
    { to: "/helpdesk", label: "Help desk console", icon: Headset },
    { to: "/workshops", label: "Workshops", icon: Wrench },
    { to: "/programs", label: "Programs", icon: LayoutGrid },
    { to: "/profile", label: "Profile", icon: User },
  ],
  partner: [
    { to: "/partner", label: "Partner dashboard", icon: Handshake },
    { to: "/health", label: "Health camps", icon: HeartPulse },
    { to: "/speakers", label: "Speaker directory", icon: Mic },
    { to: "/partners", label: "Partner organisations", icon: Building2 },
    { to: "/programs", label: "Programs", icon: LayoutGrid },
  ],
  admin: [
    { to: "/admin", label: "Admin console", icon: Shield },
    { to: "/impact", label: "Impact dashboard", icon: BarChart3 },
    { to: "/approvals", label: "Approvals inbox", icon: Inbox },
    { to: "/partners", label: "Partner organisations", icon: Building2 },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/audit", label: "Audit log", icon: ScrollText },
    { to: "/discover", label: "All resources", icon: Compass },
  ],
};

export const ROLE_HOME: Record<Role, string> = {
  user: "/discover", owner: "/owner", manager: "/approvals", volunteer: "/volunteer", partner: "/partner", admin: "/admin",
};

function Sidebar({ onNav }: { onNav?: () => void }) {
  const role = useApp((s) => s.role);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Section navigation" className="space-y-1">
      <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{ROLE_LABEL[role]}</div>
      {NAV[role].map((i) => {
        const active = path === i.to || (i.to !== "/" && path.startsWith(i.to + "/"));
        return (
          <Link key={i.to} to={i.to} onClick={onNav} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-muted")}>
            <i.icon className="h-4.5 w-4.5" aria-hidden />
            {i.label}
          </Link>
        );
      })}
      <div className="mt-4 border-t pt-4">
        {[{ to: "/demand", label: "Live demand", icon: Flame }, { to: "/notifications", label: "Notifications", icon: Bell }, { to: "/impact", label: "Community impact", icon: Sparkles }, { to: "/partners", label: "Partners", icon: Handshake }]
          .filter((x) => !NAV[role].some((n) => n.to === x.to))
          .map((i) => (
            <Link key={i.to} to={i.to} onClick={onNav} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", path === i.to ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-muted")}>
              <i.icon className="h-4.5 w-4.5" aria-hidden />{i.label}
            </Link>
          ))}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, dark, toggleDark, lang, setLang } = useApp();
  const me = useMe();
  const unread = useApp((s) => s.notifications.filter((n) => n.userId === me.id && !n.read).length);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const bare = path === "/" || path === "/login";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4">
          {!bare && (
            <button className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-primary-foreground"><Sparkles className="h-4.5 w-4.5" /></span>
            <span className="hidden sm:inline">CampusSphere</span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="h-10 w-[150px] rounded-xl text-xs sm:w-[190px] sm:text-sm" aria-label="Switch demo role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABEL) as Role[]).filter((r) => r !== "manager" && r !== "volunteer").map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
              </SelectContent>
            </Select>
            <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="flex h-10 items-center gap-1 rounded-xl px-2.5 text-sm font-medium hover:bg-muted" aria-label={`Language: ${lang === "en" ? "English" : "Hindi"}. Switch language`}>
              <Languages className="h-4.5 w-4.5" /><span className="hidden sm:inline">{lang === "en" ? "EN" : "हिं"}</span>
            </button>
            <button onClick={toggleDark} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <Link to="/notifications" className="relative grid h-10 w-10 place-items-center rounded-xl hover:bg-muted" aria-label={`Notifications, ${unread} unread`}>
              <Bell className="h-4.5 w-4.5" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber px-1 text-[10px] font-bold text-amber-foreground">{unread}</span>}
            </Link>
            <Link to="/profile" className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-muted" aria-label={`Your profile: ${me.name}`}>
              <img src={me.avatar} alt={me.name} className="h-8 w-8 rounded-full bg-muted object-cover" />
              <span className="hidden text-sm font-medium sm:inline">{me.name}</span>
              {me.verified === "verified" && <VerifiedBadge />}
            </Link>
          </div>
        </div>
        {lang === "hi" && <div className="border-t bg-amber/15 px-4 py-1 text-center text-xs">हिंदी अनुवाद जल्द — Hindi translation preview: the interface stays in English for this demo.</div>}
      </header>

      {bare ? (
        <main id="main">{children}</main>
      ) : (
        <div className="mx-auto flex max-w-[1280px] gap-6 px-4 py-6">
          <aside className="sticky top-22 hidden h-[calc(100vh-7rem)] w-60 shrink-0 overflow-y-auto lg:block">
            <Sidebar />
          </aside>
          <main id="main" className="min-w-0 flex-1 pb-24">{children}</main>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-foreground/40 animate-in fade-in" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-sidebar p-4 shadow-lift animate-in slide-in-from-left duration-200">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</span>
              <button aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <Link to="/profile" onClick={() => setOpen(false)} className="mb-4 flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm hover:bg-muted">
              <img src={me.avatar} alt={me.name} className="h-10 w-10 rounded-full bg-muted object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-sm truncate">{me.name} {me.verified === "verified" && <VerifiedBadge />}</div>
                <div className="text-xs text-muted-foreground truncate">{me.email}</div>
              </div>
            </Link>
            <Sidebar onNav={() => setOpen(false)} />
          </div>
        </div>
      )}
      <DemoGuide />
    </div>
  );
}
