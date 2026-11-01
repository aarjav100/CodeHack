import React, { useState } from "react";
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Ticket, 
  Building2, 
  Calendar, 
  Clock, 
  GraduationCap, 
  FlaskConical, 
  BookOpen, 
  Code2, 
  Cpu, 
  Users, 
  ArrowRight,
  ShieldAlert,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeatReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceName: string;
  dateStr: string;
  slotLabel: string;
  selectedSeats: string[];
  isWholeLab?: boolean;
  isInstantConfirm?: boolean;
  competingRequestsCount?: number;
  onSubmit: (data: { purpose: string; purposeCategory: string }) => void;
}

const CATEGORIES = [
  {
    id: "Course Project & Practical",
    label: "Course Project",
    sub: "Lab assignments & coursework",
    icon: GraduationCap,
    badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  {
    id: "Academic Research",
    label: "Research & Thesis",
    sub: "Data analysis & experiments",
    icon: FlaskConical,
    badgeColor: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  },
  {
    id: "Exam Preparation",
    label: "Exam Revision",
    sub: "Practical exam preparation",
    icon: BookOpen,
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  {
    id: "Hackathon & Club Sprint",
    label: "Coding & Club Sprint",
    sub: "Competitions & club projects",
    icon: Code2,
    badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  {
    id: "Personal Skill Learning",
    label: "Skill Learning",
    sub: "Self-paced practice & tutorials",
    icon: Cpu,
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  {
    id: "Group Collaboration",
    label: "Group Study",
    sub: "Team discussion & peer review",
    icon: Users,
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
];

const QUICK_SUGGESTIONS: Record<string, string[]> = {
  "Course Project & Practical": [
    "Completing AI & Machine Learning Lab Assignment 4",
    "Final Year Capstone Project dataset training & simulation",
    "Operating Systems socket programming practicals",
  ],
  "Academic Research": [
    "Simulating high-throughput dataset for thesis paper",
    "Bio-informatics molecular modeling experiment",
    "Robotics sensor calibration & algorithm verification",
  ],
  "Exam Preparation": [
    "Practical lab exam mock revision",
    "Midterm programming assignment prep",
    "Reviewing database query benchmarks for semester exams",
  ],
  "Hackathon & Club Sprint": [
    "Campus Hackathon 2024 full-stack prototype build",
    "Robotics club autonomous rover code sprint",
    "Open source contribution & bug squash sprint",
  ],
  "Personal Skill Learning": [
    "Blender 3D modeling & graphics rendering practice",
    "Rust systems programming self-study",
    "CUDA parallel computing exercises",
  ],
  "Group Collaboration": [
    "Peer code review & architecture sync session",
    "Capstone engineering team weekly working sprint",
    "Competitive coding practice with study group",
  ],
};

export const SeatReasonModal: React.FC<SeatReasonModalProps> = ({
  isOpen,
  onClose,
  resourceName,
  dateStr,
  slotLabel,
  selectedSeats,
  isWholeLab = false,
  isInstantConfirm = false,
  competingRequestsCount = 0,
  onSubmit,
}) => {
  const [category, setCategory] = useState<string>("Course Project & Practical");
  const [purpose, setPurpose] = useState<string>("");

  if (!isOpen) return null;

  const seatsLabel = isWholeLab
    ? "Entire Room / Lab"
    : selectedSeats.length === 1
    ? `Seat ${selectedSeats[0]}`
    : `${selectedSeats.length} Seats: ${selectedSeats.join(", ")}`;

  const currentSuggestions = QUICK_SUGGESTIONS[category] || QUICK_SUGGESTIONS["Course Project & Practical"];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalPurpose = purpose.trim() || currentSuggestions[0] || "Academic coursework & practical project";
    onSubmit({
      purpose: finalPurpose,
      purposeCategory: category,
    });
  };

  const handleSelectSuggestion = (sug: string) => {
    setPurpose(sug);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Reason for Booking Seat
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tell us your task to help prioritize and allocate campus resources fairly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Reservation Summary Chip */}
          <div className="rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-850 dark:to-indigo-950/20 border border-indigo-150 dark:border-indigo-900/50 p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {resourceName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/50 px-1.5 py-0.2 rounded-md">
                    {seatsLabel}
                  </span>
                  <span>•</span>
                  <span>{dateStr} ({slotLabel})</span>
                </div>
              </div>
            </div>

            {isInstantConfirm ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5" /> Instant Confirm
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Fair-Share Review
              </span>
            )}
          </div>

          {/* Competing Note if any */}
          {competingRequestsCount > 0 && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>{competingRequestsCount} competing request(s)</strong> for this slot. Academic reasons boost your Fair-Share evaluation priority!
              </span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Booking Category <span className="text-indigo-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      // Clear or keep purpose
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 shadow-sm ring-1 ring-indigo-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {cat.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Specific Reason Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Describe Your Task / Need <span className="text-indigo-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                1-tap suggestions below
              </span>
            </div>

            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Training computer vision model for Final Year Capstone Project (CS401)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none shadow-xs"
            />

            {/* Quick 1-tap chip suggestions */}
            <div className="mt-2 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Quick 1-Tap Autofill:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors text-left"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="truncate max-w-[280px] sm:max-w-none">{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fair-Share Policy Tip */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-2.5 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              Your reason is shared with the lab administrator and factors into the <strong>Fair-Share</strong> allocation algorithm.
            </span>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit()}
            className={`rounded-xl text-xs font-bold px-5 h-11 shadow-md transition-all active:scale-[0.98] ${
              isInstantConfirm
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isInstantConfirm ? (
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Confirm Instant Booking
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Send Booking Request <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
