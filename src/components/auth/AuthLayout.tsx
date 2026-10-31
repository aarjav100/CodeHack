import React from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Shield, Layers, RefreshCw } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900 font-sans">
      {/* Left Branded Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#3730A3] via-[#1E1B4B] to-[#0D9488] text-white">
        {/* Subtle background glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Logo & App Title */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="CampusSphare Logo"
              className="h-10 w-10 rounded-xl object-contain bg-white/10 p-1 backdrop-blur-md border border-white/20 shadow-md group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xl font-extrabold tracking-tight block">CampusSphare</span>
              <span className="text-[11px] font-semibold text-teal-300 tracking-wide uppercase">Civic Commons OS</span>
            </div>
          </Link>
        </div>

        {/* Center: Stacking/Switching Role Cards Illustration */}
        <div className="relative z-10 my-auto py-8 max-w-md">
          <div className="space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-200">
              <Layers className="h-3.5 w-3.5" />
              <span>Unified Multi-Role Architecture</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
              One account. Every role you play on campus.
            </h1>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Hold multiple verified roles at once — student, equipment steward, volunteer, or speaker. Switch your active persona instantly without re-logging.
            </p>
          </div>

          {/* Animated Role Cards Stacking Visual */}
          <div className="relative h-56 w-full flex items-center justify-center">
            {/* Card 1: Volunteer (Back) */}
            <div className="absolute w-72 p-4 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-300/30 text-white shadow-xl -translate-y-8 scale-90 opacity-60 transition-all duration-700">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-300">volunteer_activism</span>
                  <span className="font-bold">Volunteer Persona</span>
                </div>
                <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-full font-semibold text-amber-200">Instant</span>
              </div>
            </div>

            {/* Card 2: Owner (Middle) */}
            <div className="absolute w-76 p-4 rounded-2xl bg-emerald-500/30 backdrop-blur-md border border-emerald-300/40 text-white shadow-xl -translate-y-4 scale-95 opacity-80 transition-all duration-700">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-300">warehouse</span>
                  <span className="font-bold">Lab Steward / Owner</span>
                </div>
                <span className="text-[10px] bg-emerald-400/20 px-2 py-0.5 rounded-full font-semibold text-emerald-200">Verified</span>
              </div>
            </div>

            {/* Card 3: Student (Front Active) */}
            <div className="absolute w-80 p-4 rounded-2xl bg-white/95 text-slate-900 shadow-2xl border border-white transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">Student Persona</span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Session
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Alt+R to switch
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Fair-Share Score: <strong className="text-indigo-600">88 Pts</strong></span>
                <span className="text-slate-400">ID #IN-8849</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200/80">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-300" />
            <span>Cryptographic Campus ID</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-teal-300" />
            <span>Instant Role Switching (&lt;300ms)</span>
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-12 xl:px-16 overflow-y-auto">
        {/* Mobile Header */}
        <div className="w-full max-w-md lg:hidden mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="CampusSphare Logo" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">CampusSphare</span>
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Civic Commons</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
