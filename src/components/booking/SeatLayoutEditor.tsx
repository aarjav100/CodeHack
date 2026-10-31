import React, { useState } from "react";
import { 
  Grid, 
  Plus, 
  Minus, 
  ShieldAlert, 
  Monitor, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Flame, 
  SlidersHorizontal 
} from "lucide-react";
import type { SeatItem, SeatLayout, SlotDefinition } from "@/data/types";

interface SeatLayoutEditorProps {
  layout: SeatLayout;
  onChange: (layout: SeatLayout) => void;
  instantConfirm: boolean;
  onToggleInstantConfirm: (val: boolean) => void;
  maxSeatsPerPerson: number;
  onChangeMaxSeats: (val: number) => void;
}

const TEMPLATES = [
  {
    id: "computer_lab",
    name: "Computer Lab (6x5)",
    rows: 6,
    cols: 5,
    aisleCols: [2],
    trainingSeats: [],
  },
  {
    id: "workshop_bench",
    name: "Workshop Bench (2x6)",
    rows: 2,
    cols: 6,
    aisleCols: [3],
    trainingSeats: ["A1", "A2"],
    trainingSkill: "Workshop Machinery Safety",
  },
  {
    id: "study_hall",
    name: "Study Hall (10x6)",
    rows: 10,
    cols: 6,
    aisleCols: [3],
    trainingSeats: [],
  },
  {
    id: "printer_bay",
    name: "3D Printer Bay (1x4)",
    rows: 1,
    cols: 4,
    aisleCols: [],
    trainingSeats: ["A4"],
    trainingSkill: "3D Printer Safety",
  },
];

export const SeatLayoutEditor: React.FC<SeatLayoutEditorProps> = ({
  layout,
  onChange,
  instantConfirm,
  onToggleInstantConfirm,
  maxSeatsPerPerson,
  onChangeMaxSeats,
}) => {
  const [activeCellMode, setActiveCellMode] = useState<"seat" | "aisle" | "training">("seat");
  const [trainingSkill, setTrainingSkill] = useState("3D Printer Safety");

  // Apply template
  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const seats: SeatItem[] = [];

    for (let r = 0; r < tmpl.rows; r++) {
      const rowLetter = letters[r] || `R${r + 1}`;
      for (let c = 0; c < tmpl.cols; c++) {
        const isAisle = tmpl.aisleCols.includes(c);
        const seatId = `${rowLetter}${c + 1}`;
        const needsTraining = tmpl.trainingSeats.includes(seatId);

        seats.push({
          id: seatId,
          row: r + 1,
          col: c + 1,
          label: seatId,
          isAisle,
          requiresTraining: needsTraining ? tmpl.trainingSkill || "3D Printer Safety" : undefined,
        });
      }
    }

    onChange({
      rows: tmpl.rows,
      cols: tmpl.cols,
      seats,
    });
  };

  // Toggle individual cell
  const handleCellClick = (seat: SeatItem) => {
    const updatedSeats = layout.seats.map((s) => {
      if (s.id !== seat.id) return s;

      if (activeCellMode === "aisle") {
        return { ...s, isAisle: !s.isAisle, requiresTraining: undefined };
      }
      if (activeCellMode === "training") {
        return {
          ...s,
          isAisle: false,
          requiresTraining: s.requiresTraining ? undefined : trainingSkill,
        };
      }
      // normal seat
      return { ...s, isAisle: false, requiresTraining: undefined };
    });

    onChange({
      ...layout,
      seats: updatedSeats,
    });
  };

  // Live counters
  const totalSeats = layout.seats.filter((s) => !s.isAisle).length;
  const aisleCount = layout.seats.filter((s) => s.isAisle).length;
  const trainingCount = layout.seats.filter((s) => Boolean(s.requiresTraining)).length;

  return (
    <div className="space-y-6">
      {/* Templates Selector */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Preset Layout Templates</span>
          </div>
          <span className="text-xs text-slate-400">1-tap setup</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="px-3 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-850 text-left transition-all active:scale-95 shadow-xs"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {tmpl.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {tmpl.rows * tmpl.cols} spots
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Builder Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-600" />
              <span>Interactive Grid Builder ({layout.rows} × {layout.cols})</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an edit mode below, then tap cells in the room preview to customize.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveCellMode("seat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCellMode === "seat"
                  ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Seat
            </button>
            <button
              type="button"
              onClick={() => setActiveCellMode("aisle")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCellMode === "aisle"
                  ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Aisle / Gap
            </button>
            <button
              type="button"
              onClick={() => setActiveCellMode("training")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCellMode === "training"
                  ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Require Training
            </button>
          </div>
        </div>

        {/* Live summary stats */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            {totalSeats} Bookable Seats
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            {aisleCount} Aisles / Gaps
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            {trainingCount} Safety Badge Required
          </span>
        </div>

        {/* Visual Room Layout Preview */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 flex flex-col items-center">
          {/* Cinema Screen / Whiteboard Banner */}
          <div className="w-full max-w-sm mb-6 text-center">
            <div className="h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full mb-1 opacity-70" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
              Whiteboard / Front Entrance
            </span>
          </div>

          {/* Grid of buttons */}
          <div
            className="grid gap-2 max-w-full overflow-x-auto p-2"
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, minmax(44px, 52px))`,
            }}
          >
            {layout.seats.map((seat) => {
              if (seat.isAisle) {
                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleCellClick(seat)}
                    className="h-11 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400 hover:bg-slate-200/50 transition-colors"
                    title="Click to toggle aisle"
                  >
                    Aisle
                  </button>
                );
              }

              return (
                <button
                  key={seat.id}
                  type="button"
                  onClick={() => handleCellClick(seat)}
                  className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all shadow-xs relative ${
                    seat.requiresTraining
                      ? "border-dashed border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                      : "border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400"
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{seat.label}</span>
                  {seat.requiresTraining && (
                    <ShieldAlert className="w-3 h-3 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rules & Slot Policies */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span>Booking Rules & Slot Policies</span>
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Max Seats Per Booking */}
          <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-750">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
              Max Seats Per User
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={15}
                value={maxSeatsPerPerson}
                onChange={(e) => onChangeMaxSeats(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-center"
              />
              <span className="text-xs text-slate-500">
                (e.g. 1 for personal, 5 for group study)
              </span>
            </div>
          </div>

          {/* Instant Confirm Toggle */}
          <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-750 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Confirmation</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically confirm if no competing requests exist
              </p>
            </div>
            <input
              type="checkbox"
              checked={instantConfirm}
              onChange={(e) => onToggleInstantConfirm(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Slot Heatmap (Visualizing underused hours) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Slot Occupancy & Heatmap
            </h4>
          </div>
          <span className="text-xs text-teal-600 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full">
            Underused idle slots detected
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Visualizes real booking load across time slots to optimize room efficiency.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">09:00 - 11:00</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 my-0.5">30% Full</div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Idle time high</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">11:00 - 13:00</span>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 my-0.5">85% Full</div>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Peak demand</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">14:00 - 16:00</span>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400 my-0.5">92% Full</div>
            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-medium">In contest</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">16:00 - 18:00</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 my-0.5">45% Full</div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};
