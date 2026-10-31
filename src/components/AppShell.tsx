import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Compass,
  CalendarDays,
  LayoutGrid,
  BookOpen,
  Gauge,
  User,
  Building2,
  Inbox,
  Plus,
  Flame,
  Shield,
  HeartPulse,
  Scale,
  Search,
  Mic,
  ScrollText,
  HandHeart,
  ShieldCheck,
  CheckCircle2,
  Users,
  Ticket,
} from "lucide-react";
import { useApp, useMe } from "@/store/app";
import { useAuthStore } from "@/store/authStore";
import { ROLE_CONFIGS } from "@/types/auth";
import type { RoleId } from "@/types/auth";
import type { Role } from "@/data/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { PendingRoleBanner } from "@/components/auth/PendingRoleBanner";
import { DemoGuide } from "./DemoGuide";
import { SeatBookingGuideModal } from "@/components/booking/SeatBookingGuideModal";

export const ROLE_LABEL: Record<Role, string> = {
  user: "Student / Citizen",
  owner: "Owner",
  manager: "Manager",
  volunteer: "Volunteer",
  partner: "Partner / Speaker",
  admin: "Admin",
};

export const ROLE_HOME: Record<Role, string> = {
  user: "/discover",
  owner: "/owner",
  manager: "/approvals",
  volunteer: "/volunteer",
  partner: "/partner",
  admin: "/admin",
};

// Map RoleId to legacy store Role
const ROLE_ID_TO_LEGACY: Record<RoleId, Role> = {
  student: "user",
  customer: "user",
  volunteer: "volunteer",
  owner: "owner",
  speaker: "partner",
  health_partner: "partner",
  organisation: "partner",
  manager: "manager",
  admin: "admin",
};

function Sidebar({ onNav }: { onNav?: () => void }) {
  const legacyRole = useApp((s) => s.role);
  const me = useMe();
  const bookings = useApp((s) => s.bookings);
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Get auth store state
  const currentUser = useAuthStore((s) => s.currentUser);
  const activeRole = useAuthStore((s) => s.activeRole);
  const users = useAuthStore((s) => s.users);
  const activeRoleConfig = ROLE_CONFIGS[activeRole];

  const activeCount = bookings.filter(
    (b) => b.userId === me.id && ["pending", "approved", "active"].includes(b.status)
  ).length;
  const pendingApprovalsCount = bookings.filter((b) => b.status === "pending").length;

  // Pending role requests across users (for Admin/Manager view)
  const pendingRoleRequestsCount = users.flatMap((u) => u.roles).filter((r) => r.status === "pending").length;

  // Determine navigation items dynamically according to ACTIVE role
  const getNavSections = () => {
    switch (activeRole) {
      case "owner":
        return [
          {
            title: "Space Stewardship",
            items: [
              { to: "/owner", label: "Owner Dashboard", icon: Building2 },
              { to: "/resources/new", label: "List Space / Equipment", icon: Plus },
              { to: "/resources", label: "Inventory & Rules", icon: Compass },
              { to: "/approvals", label: "Review Booking Requests", icon: Inbox, badge: pendingApprovalsCount ? `${pendingApprovalsCount} pending` : undefined },
            ],
          },
          {
            title: "Governance & Transparency",
            items: [
              { to: "/audit", label: "Steward Audit Logs", icon: ScrollText },
              { to: "/profile", label: "Owner Credentials", icon: User },
            ],
          },
        ];

      case "volunteer":
        return [
          {
            title: "Volunteer Operations",
            items: [
              { to: "/volunteer", label: "Volunteer Portal", icon: HandHeart },
              { to: "/checkin", label: "Access Check-in Station", icon: CheckCircle2 },
              { to: "/programs", label: "Community Programs", icon: LayoutGrid },
              { to: "/discover", label: "Campus Spaces", icon: Compass },
            ],
          },
          {
            title: "Civic Profile",
            items: [
              { to: "/profile", label: "Hours & Civic Passport", icon: User },
              { to: "/audit", label: "Community Transparency", icon: ScrollText },
            ],
          },
        ];

      case "speaker":
      case "health_partner":
      case "organisation":
        return [
          {
            title: "Partner & Guest Hub",
            items: [
              { to: "/partner", label: "Partner Dashboard", icon: Users },
              { to: "/programs", label: "Campus Initiatives", icon: LayoutGrid },
              { to: "/health", label: "Health & Care Camps", icon: HeartPulse },
              { to: "/discover", label: "Browse Campus Venues", icon: Compass },
            ],
          },
          {
            title: "Institutional Records",
            items: [
              { to: "/profile", label: "Partner Credentials", icon: User },
              { to: "/audit", label: "Governance Log", icon: ScrollText },
            ],
          },
        ];

      case "manager":
        return [
          {
            title: "Manager Oversight",
            items: [
              { to: "/approvals", label: "Approvals Inbox", icon: Inbox, badge: pendingApprovalsCount ? `${pendingApprovalsCount} pending` : undefined },
              { to: "/demand", label: "Demand & Contests", icon: Flame },
              { to: "/fair-share", label: "Fair-Share Matrix", icon: Gauge },
              { to: "/discover", label: "Campus Directory", icon: Compass },
            ],
          },
          {
            title: "Institution Records",
            items: [
              { to: "/audit", label: "Campus Audit Log", icon: ScrollText },
              { to: "/profile", label: "Manager Profile", icon: User },
            ],
          },
        ];

      case "admin":
        return [
          {
            title: "System Administration",
            items: [
              { to: "/admin", label: "Administration Hub", icon: Shield },
              {
                to: "/admin/role-requests",
                label: "Role Access Requests",
                icon: ShieldCheck,
                badge: pendingRoleRequestsCount ? `${pendingRoleRequestsCount} pending` : undefined,
              },
              { to: "/approvals", label: "Approvals Inbox", icon: Inbox, badge: pendingApprovalsCount ? `${pendingApprovalsCount} pending` : undefined },
              { to: "/audit", label: "Audit & Transparency", icon: ScrollText },
            ],
          },
          {
            title: "Campus Directory",
            items: [
              { to: "/discover", label: "Discover Spaces", icon: Compass },
              { to: "/demand", label: "Live Contests & Demand", icon: Flame },
              { to: "/profile", label: "System Credentials", icon: User },
            ],
          },
        ];

      case "customer":
        return [
          {
            title: "Community Member Access",
            items: [
              { to: "/discover", label: "Discover Public Spaces", icon: Compass },
              { to: "/programs", label: "Community Programs", icon: LayoutGrid },
              { to: "/health", label: "Health Camps", icon: HeartPulse },
              { to: "/bookings", label: "My Reservations", icon: CalendarDays, badge: activeCount ? `${activeCount} active` : undefined },
            ],
          },
          {
            title: "Account & Standing",
            items: [
              { to: "/profile", label: "Citizen Passport", icon: User },
              { to: "/fair-share", label: "Fair-Share Guidelines", icon: Scale },
            ],
          },
        ];

      case "student":
      default:
        return [
          {
            title: "Campus Spaces",
            items: [
              { to: "/discover", label: "Discover Spaces", icon: Compass },
              { to: "/bookings", label: "My Bookings", icon: CalendarDays, badge: activeCount ? `${activeCount} active` : undefined },
              { to: "/programs", label: "Community Programs", icon: LayoutGrid },
              { to: "/profile", label: "Civic Passport", icon: User },
            ],
          },
          {
            title: "Community Care & Governance",
            items: [
              { to: "/approvals", label: "Shared Approvals", icon: Inbox, badge: pendingApprovalsCount ? `${pendingApprovalsCount} pending` : undefined },
              { to: "/demand", label: "Live Demand & Contests", icon: Flame },
              { to: "/study", label: "Free Study Center", icon: BookOpen },
              { to: "/health", label: "Health Camps", icon: HeartPulse },
              { to: "/fair-share", label: "Fair-Share Matrix", icon: Gauge },
              { to: "/audit", label: "Audit & Transparency", icon: ScrollText },
            ],
          },
        ];
    }
  };

  const navSections = getNavSections();
  const userName = currentUser?.name || me.name;
  const userAvatar = currentUser?.avatar || me.avatar;

  return (
    <div className="flex h-full flex-col justify-between py-2">
      <div className="space-y-6">
        {/* User Profile Card with Active Role Badge */}
        <Link
          to="/profile"
          onClick={onNav}
          className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm hover:border-primary/40 hover:bg-muted/50 transition-all"
        >
          <img
            src={userAvatar}
            alt={userName}
            className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover ring-2 ring-primary/20"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-sm text-foreground">{userName}</div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: activeRoleConfig.colorToken.hex }}
              />
              <span className="font-bold" style={{ color: activeRoleConfig.colorToken.hex }}>
                Acting as {activeRoleConfig.shortLabel}
              </span>
            </div>
          </div>
        </Link>

        {/* Dynamic Navigation Sections */}
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {sec.title}
            </div>
            <nav className="space-y-1">
              {sec.items.map((i) => {
                const active = path === i.to || (i.to !== "/" && path.startsWith(i.to + "/"));
                return (
                  <Link
                    key={i.to}
                    to={i.to}
                    onClick={onNav}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <i.icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{i.label}</span>
                    {i.badge && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                        {i.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Friendly Fairness Badge Card */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 mb-1.5 text-blue-900 dark:text-blue-300">
          <Scale className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wide">Fair-Share Campus</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Equal access for all students. Switch persona anytime with{" "}
          <kbd className="font-mono bg-white dark:bg-slate-900 px-1 py-0.2 rounded border text-[10px]">
            Alt+R
          </kbd>
        </p>
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-blue-200/50 dark:border-blue-900/50">
          <span className="text-muted-foreground font-medium">Active Capacity:</span>
          <span
            className="rounded-md px-2 py-0.5 font-bold"
            style={{
              backgroundColor: activeRoleConfig.colorToken.hex + "20",
              color: activeRoleConfig.colorToken.hex,
            }}
          >
            {activeRoleConfig.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { dark, toggleDark, setRole } = useApp();
  const me = useMe();
  const unread = useApp((s) => s.notifications.filter((n) => n.userId === me.id && !n.read).length);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const nav = useNavigate();

  // Auth store state
  const currentUser = useAuthStore((s) => s.currentUser);
  const activeRole = useAuthStore((s) => s.activeRole);
  const activeRoleConfig = ROLE_CONFIGS[activeRole];

  // Sync active role with legacy store so sub-components stay in sync
  useEffect(() => {
    const legacyRole = ROLE_ID_TO_LEGACY[activeRole];
    if (legacyRole) {
      setRole(legacyRole);
    }
  }, [activeRole, setRole]);

  const bare = path === "/" || path === "/login" || path === "/signup";

  const isSeatBookingGuideOpen = useAuthStore((s) => s.isSeatBookingGuideOpen);
  const openSeatBookingGuide = useAuthStore((s) => s.openSeatBookingGuide);

  // Automatically trigger How to Book a Seat guide on user's first login
  useEffect(() => {
    if (!bare && currentUser && typeof window !== "undefined") {
      const seen =
        localStorage.getItem(`campussphere_seen_seat_guide_${currentUser.id}`) ||
        localStorage.getItem("campussphere_seen_seat_guide_global");
      if (!seen) {
        const timer = setTimeout(() => {
          openSeatBookingGuide();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [bare, currentUser?.id, openSeatBookingGuide]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      nav({ to: "/discover" });
    }
  };

  const userName = currentUser?.name || me.name;
  const userAvatar = currentUser?.avatar || me.avatar;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background text-foreground antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Role Accent Top Bar: Visual indicator of current active role */}
      <div
        className="h-1 w-full transition-colors duration-300"
        style={{ backgroundColor: activeRoleConfig.colorToken.hex }}
      />

      {/* Modern Civic Header */}
      <header className="sticky top-0 z-40 h-16 border-b bg-white/95 backdrop-blur-md dark:bg-background/95">
        <div className="mx-auto flex h-full max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {!bare && (
              <button
                className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted lg:hidden"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
              <img
                src="/logo.png"
                alt="CampusSphare Logo"
                className="h-9 w-9 rounded-xl object-contain shadow-sm"
              />
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">
                  CampusSphare
                </span>
                <span className="hidden sm:inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Civic Commons
                </span>
              </div>
            </Link>
          </div>

          {/* Center Search Bar */}
          {!bare && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search labs, halls, equipment or workshops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-10 pr-4 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-900/60 dark:focus:bg-slate-900"
                />
              </div>
            </form>
          )}

          {/* Right Action Icons & User Controls */}
          <div className="flex items-center gap-2">
            {/* Campus Spaces Open Badge */}
            <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Spaces: Open</span>
            </div>

            {/* Quick Action: How to Book Guide Trigger */}
            {!bare && (
              <button
                type="button"
                onClick={openSeatBookingGuide}
                className="hidden lg:inline-flex items-center gap-1.5 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 px-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="View How to Book a Seat in 3 Taps"
              >
                <Ticket className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>How to Book</span>
              </button>
            )}

            {/* Quick Action: New Request */}
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex h-9 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Link to="/discover">
                <Plus className="mr-1 h-3.5 w-3.5" /> New Request
              </Link>
            </Button>

            {/* ROLE SWITCHER: Centerpiece Multi-Role Header Pill */}
            {!bare && <RoleSwitcher />}

            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-muted"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Alerts / Notifications */}
            {!bare && (
              <Link
                to="/notifications"
                className="relative grid h-9 w-9 place-items-center rounded-xl hover:bg-muted"
                aria-label={`Notifications, ${unread} unread`}
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile Chip */}
            {!bare && (
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-muted"
                aria-label={`Your profile: ${userName}`}
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-8 w-8 rounded-full bg-muted object-cover ring-1 ring-primary/20"
                />
                <span className="hidden text-xs font-semibold sm:inline">{userName}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      {bare ? (
        <main id="main">{children}</main>
      ) : (
        <div className="mx-auto flex max-w-[1360px] gap-6 px-4 py-6 sm:px-6">
          <aside className="sticky top-20 hidden h-[calc(100vh-6.5rem)] w-64 shrink-0 overflow-y-auto lg:block">
            <Sidebar />
          </aside>
          <main id="main" className="min-w-0 flex-1 pb-24">
            {/* Pending Role Banner automatically warns user of pending/rejected roles or guest mode */}
            <PendingRoleBanner />
            {children}
          </main>
        </div>
      )}

      {/* Mobile Sidebar Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div
            className="absolute inset-0 bg-foreground/40 animate-in fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-card p-4 shadow-lift animate-in slide-in-from-left duration-200">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="CampusSphare Logo" className="h-7 w-7 rounded-lg object-contain" />
                <span className="font-display font-bold text-base">CampusSphare</span>
              </div>
              <button
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Mobile Role Switcher */}
            <div className="mb-4 pb-3 border-b">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Current Persona
              </p>
              <RoleSwitcher className="w-full justify-between" />
            </div>
            <Sidebar onNav={() => setOpen(false)} />
          </div>
        </div>
      )}

      <DemoGuide />
      <SeatBookingGuideModal />
    </div>
  );
}
