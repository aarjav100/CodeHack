import type { SeatItem, SeatLayout, SlotDefinition, SeatState, Resource, Booking } from "./types";

export const DEFAULT_SLOTS: SlotDefinition[] = [
  { id: "slot-1", start: "09:00", end: "11:00", label: "09:00 – 11:00" },
  { id: "slot-2", start: "11:00", end: "13:00", label: "11:00 – 13:00" },
  { id: "slot-3", start: "14:00", end: "16:00", label: "14:00 – 16:00" },
  { id: "slot-4", start: "16:00", end: "18:00", label: "16:00 – 18:00" },
];

export const STUDY_SLOTS: SlotDefinition[] = [
  { id: "s-morn", start: "07:00", end: "11:00", label: "Morning (07:00 – 11:00)" },
  { id: "s-aft", start: "12:00", end: "16:00", label: "Afternoon (12:00 – 16:00)" },
  { id: "s-eve", start: "17:00", end: "21:00", label: "Evening (17:00 – 21:00)" },
];

// Template 1: Computer Lab 6x5 (30 seats)
export function createComputerLabLayout(): SeatLayout {
  const rows = ["A", "B", "C", "D", "E", "F"];
  const seats: SeatItem[] = [];
  rows.forEach((row) => {
    for (let c = 1; c <= 5; c++) {
      seats.push({
        id: `${row}${c}`,
        row,
        col: c,
        label: `PC ${row}${c}`,
        kind: "seat",
      });
    }
  });

  return {
    rows: 6,
    cols: 5,
    screenLabel: "Whiteboard & Instructor Podium",
    aisles: [3], // aisle gap after col 3
    seats,
    template: "comp-lab-6x5",
  };
}

// Template 2: 3D Printer Bay (4 printers)
export function create3DPrinterLayout(): SeatLayout {
  return {
    rows: 1,
    cols: 4,
    screenLabel: "Filament Storage & Prep Bench",
    seats: [
      { id: "P1", row: "A", col: 1, label: "Ultimaker S5 #1", kind: "printer" },
      { id: "P2", row: "A", col: 2, label: "Prusa MK4 #2", kind: "printer" },
      { id: "P3", row: "A", col: 3, label: "Bambu X1-Carbon #3", kind: "printer" },
      {
        id: "P4",
        row: "A",
        col: 4,
        label: "Industrial High-Temp #4",
        kind: "printer",
        trainingReq: "3D Printer Safety",
      },
    ],
    template: "custom",
  };
}

// Template 3: Electronics Lab (12 benches, 2 rows of 6)
export function createElectronicsLayout(): SeatLayout {
  const rows = ["A", "B"];
  const seats: SeatItem[] = [];
  rows.forEach((row, rIdx) => {
    for (let c = 1; c <= 6; c++) {
      const num = rIdx * 6 + c;
      seats.push({
        id: `B${num < 10 ? "0" + num : num}`,
        row,
        col: c,
        label: `Bench ${num}`,
        kind: "bench",
      });
    }
  });

  return {
    rows: 2,
    cols: 6,
    screenLabel: "Component Library & Safety Shower",
    aisles: [3],
    seats,
    template: "bench-2x6",
  };
}

// Template 4: Study Hall (60 desks, 6 rows of 10)
export function createStudyHallLayout(): SeatLayout {
  const rows = ["A", "B", "C", "D", "E", "F"];
  const seats: SeatItem[] = [];
  rows.forEach((row) => {
    for (let c = 1; c <= 10; c++) {
      seats.push({
        id: `${row}${c}`,
        row,
        col: c,
        label: `Desk ${row}${c}`,
        kind: "seat",
      });
    }
  });

  return {
    rows: 6,
    cols: 10,
    screenLabel: "Silent Study Zone — Main Entrance",
    aisles: [5],
    seats,
    template: "study-10x6",
  };
}

// Fallback: Generic Layout generator for any capacity
export function createDefaultLayoutForCapacity(capacity: number, labelPrefix = "Seat"): SeatLayout {
  const cap = Math.max(1, capacity);
  const cols = cap <= 4 ? cap : cap <= 12 ? 4 : cap <= 24 ? 6 : 6;
  const rowsCount = Math.max(1, Math.ceil(cap / cols));
  const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const seats: SeatItem[] = [];
  let count = 0;
  for (let r = 0; r < rowsCount && count < cap; r++) {
    const row = rowLetters[r] || `R${r + 1}`;
    for (let c = 1; c <= cols && count < cap; c++) {
      count++;
      seats.push({
        id: `${row}${c}`,
        row,
        col: c,
        label: `${labelPrefix} ${row}${c}`,
        kind: "seat",
      });
    }
  }
  return {
    rows: rowsCount,
    cols,
    screenLabel: "Whiteboard & Instructor Screen",
    seats,
    template: "custom",
  };
}

// Algorithm: Pick best single seat (closest to center)
export function pickBestSeat(
  layout: SeatLayout,
  availableSeatIds: string[]
): string | null {
  if (availableSeatIds.length === 0) return null;
  const availSet = new Set(availableSeatIds);
  const midRow = Math.floor(layout.rows / 2);
  const midCol = Math.floor(layout.cols / 2);

  let bestSeat: string | null = null;
  let bestDist = Infinity;

  layout.seats.forEach((s) => {
    if (!availSet.has(s.id)) return;
    const rIdx = s.row.charCodeAt(0) - 65;
    const dist = Math.abs(rIdx - midRow) * 1.5 + Math.abs(s.col - midCol);
    if (dist < bestDist) {
      bestDist = dist;
      bestSeat = s.id;
    }
  });

  return bestSeat || availableSeatIds[0];
}

// Algorithm: Join as group -> find adjacent seats in the same row
export function pickAdjacentSeats(
  layout: SeatLayout,
  availableSeatIds: string[],
  groupSize: number
): string[] {
  if (availableSeatIds.length < groupSize) return [];
  const availSet = new Set(availableSeatIds);

  // Group seats by row
  const rowMap = new Map<string, SeatItem[]>();
  layout.seats.forEach((s) => {
    if (!rowMap.has(s.row)) rowMap.set(s.row, []);
    rowMap.get(s.row)!.push(s);
  });

  // Try finding contiguous block in any row
  for (const [_, seatsInRow] of rowMap.entries()) {
    seatsInRow.sort((a, b) => a.col - b.col);
    for (let i = 0; i <= seatsInRow.length - groupSize; i++) {
      const window = seatsInRow.slice(i, i + groupSize);
      const isConsecutive = window.every(
        (seat, idx, arr) => idx === 0 || seat.col === arr[idx - 1].col + 1
      );
      const allAvail = window.every((seat) => availSet.has(seat.id));
      if (isConsecutive && allAvail) {
        return window.map((s) => s.id);
      }
    }
  }

  // Fallback: pick any groupSize available seats
  return availableSeatIds.slice(0, groupSize);
}

export interface SeatStatusInfo {
  seatId: string;
  state: SeatState;
  requestCount?: number;
  reason?: string;
  eventName?: string;
  trainingRequired?: string;
}

// Seat calculation helper that handles all 7 states cleanly
export function resolveSeatStatus(
  seat: SeatItem,
  resource: Resource,
  date: string,
  slot: SlotDefinition,
  user: { id?: string; skills?: string[] } | null,
  selectedSeats: string[],
  bookings: Booking[],
  maintenanceSeatIds: string[] = ["D4"] // default mock maintenance for PC-D4
): SeatStatusInfo {
  const seatId = seat.id;

  // 1. Selected by you in-flight
  if (selectedSeats.includes(seatId)) {
    return { seatId, state: "selected" };
  }

  // 2. Check if whole venue / whole lab is booked for an event/class during this slot
  const slotStartMin = parseInt(slot.start.split(":")[0]) * 60 + parseInt(slot.start.split(":")[1]);
  const slotEndMin = parseInt(slot.end.split(":")[0]) * 60 + parseInt(slot.end.split(":")[1]);

  const wholeLabBooking = bookings.find((b) => {
    if (b.resourceId !== resource.id || b.date !== date) return false;
    if (!["approved", "active"].includes(b.status)) return false;
    if (!b.isWholeLab && b.seats && b.seats.length > 0) return false; // not whole lab

    const bStartMin = parseInt(b.start.split(":")[0]) * 60 + parseInt(b.start.split(":")[1]);
    const bEndMin = bStartMin + b.duration * 60;
    return slotStartMin < bEndMin && bStartMin < slotEndMin;
  });

  if (wholeLabBooking) {
    return {
      seatId,
      state: "event_reserved",
      eventName: wholeLabBooking.eventName || wholeLabBooking.purpose || "Campus Class / Event",
    };
  }

  // 3. Maintenance check
  if (maintenanceSeatIds.includes(seatId) || resource.maintenance) {
    return {
      seatId,
      state: "maintenance",
      reason: "Scheduled technical maintenance & hardware calibration",
    };
  }

  // 4. Missing required training
  if (seat.trainingReq && user) {
    const hasSkill = user.skills?.includes(seat.trainingReq);
    if (!hasSkill) {
      return {
        seatId,
        state: "locked",
        trainingRequired: seat.trainingReq,
        reason: `Complete ${seat.trainingReq} to unlock`,
      };
    }
  }

  // Find bookings for this resource, date, and overlapping slot time
  const matchingBookings = bookings.filter((b) => {
    if (b.resourceId !== resource.id || b.date !== date) return false;
    if (["rejected", "cancelled"].includes(b.status)) return false;

    const bStartMin = parseInt(b.start.split(":")[0]) * 60 + parseInt(b.start.split(":")[1]);
    const bEndMin = bStartMin + b.duration * 60;
    const timeOverlap = slotStartMin < bEndMin && bStartMin < slotEndMin;
    if (!timeOverlap) return false;

    // Check if this booking explicitly included this seat
    return b.seats?.includes(seatId);
  });

  // 5. Booked (approved or active)
  const confirmedBooking = matchingBookings.find((b) => ["approved", "active"].includes(b.status));
  if (confirmedBooking) {
    return {
      seatId,
      state: "booked",
      reason: `Booked for ${confirmedBooking.purpose || "Academic session"}`,
    };
  }

  // 6. Requested (pending approval or competing requests)
  const pendingRequests = matchingBookings.filter((b) => b.status === "pending");
  if (pendingRequests.length > 0) {
    return {
      seatId,
      state: "requested",
      requestCount: pendingRequests.length,
      reason: `${pendingRequests.length} request${pendingRequests.length > 1 ? "s" : ""} competing under Fair-Share queue`,
    };
  }

  // 7. Available
  return { seatId, state: "available" };
}

