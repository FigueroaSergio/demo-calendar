export interface Provider {
  id: string;
  name: string;
  specialty: string;
  location: string;
  languages: string[];
  experienceYears: number;
  gender: string;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  slotConfig?: SlotConfig;
  isActive?: boolean;
}

export interface BreakPeriod {
  label: string; // e.g. "Lunch"
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface DaySchedule {
  enabled: boolean;
  workStart: string; // HH:mm
  workEnd: string; // HH:mm
  breaks: BreakPeriod[];
}

export interface SlotConfig {
  slotDurationMinutes: number; // e.g. 15, 20, 30, 45, 60
  bufferMinutes: number; // gap between slots
  maxPatientsPerSlot: number; // overbooking control
  schedule: Record<string, DaySchedule>; // 'MON' | 'TUE' | ... | 'SUN'
  advancedBookingDays: number; // how many days ahead patients can book
  minNoticeHours: number; // minimum notice to book
  autoConfirm: boolean;
}

export interface ProviderAvailability {
  providerId: string;
  date: string; // YYYY-MM-DD
  slots: string[]; // HH:mm
}

export interface CreateProviderDTO {
  name: string;
  specialty: string;
  location: string;
  languages: string[];
  experienceYears: number;
  gender: string;
  avatarUrl: string;
  slotConfig?: SlotConfig;
}

export interface UpdateProviderDTO extends Partial<CreateProviderDTO> {
  isActive?: boolean;
}
export const DEFAULT_SLOT_CONFIG: SlotConfig = {
  slotDurationMinutes: 30,
  bufferMinutes: 5,
  maxPatientsPerSlot: 1,
  advancedBookingDays: 30,
  minNoticeHours: 2,
  autoConfirm: false,
  schedule: {
    MON: {
      enabled: true,
      workStart: "08:00",
      workEnd: "17:00",
      breaks: [{ label: "Lunch", start: "12:00", end: "13:00" }],
    },
    TUE: {
      enabled: true,
      workStart: "08:00",
      workEnd: "17:00",
      breaks: [{ label: "Lunch", start: "12:00", end: "13:00" }],
    },
    WED: {
      enabled: true,
      workStart: "08:00",
      workEnd: "17:00",
      breaks: [{ label: "Lunch", start: "12:00", end: "13:00" }],
    },
    THU: {
      enabled: true,
      workStart: "08:00",
      workEnd: "17:00",
      breaks: [{ label: "Lunch", start: "12:00", end: "13:00" }],
    },
    FRI: {
      enabled: true,
      workStart: "08:00",
      workEnd: "16:00",
      breaks: [{ label: "Lunch", start: "12:00", end: "13:00" }],
    },
    SAT: { enabled: false, workStart: "09:00", workEnd: "13:00", breaks: [] },
    SUN: { enabled: false, workStart: "09:00", workEnd: "13:00", breaks: [] },
  },
};

export const getSlotsByDay = (
  targetDate: Date,
  config: SlotConfig,
  providerId: string,
): ProviderAvailability => {
  const daysMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dayName = daysMap[targetDate.getDay()];
  const dayConfig = config.schedule[dayName];

  const response: ProviderAvailability = {
    providerId,
    date: targetDate.toISOString().split("T")[0],
    slots: [],
  };
  const now = new Date();

  // 1. Setup "Start of Day" for comparison to allow today
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfTarget = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  // Check if date is in the past OR beyond advanced booking days
  const diffDays = Math.ceil(
    (startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  );
  console.log(diffDays);

  if (
    !dayConfig?.enabled ||
    diffDays < 0 ||
    diffDays > config.advancedBookingDays
  ) {
    return response;
  }

  const getMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const workStart = getMins(dayConfig.workStart);
  const workEnd = getMins(dayConfig.workEnd);

  // 2. Minimum Notice Logic
  // If target is today, we must start counting from "Now + Notice"
  // If target is in the future, we just care about workStart
  let earliestAllowedMins = 0;
  if (startOfTarget.getTime() === startOfToday.getTime()) {
    const currentMins = now.getHours() * 60 + now.getMinutes();
    earliestAllowedMins = currentMins + config.minNoticeHours * 60;
  }

  let currentTime = workStart;

  while (currentTime + config.slotDurationMinutes <= workEnd) {
    const slotStart = currentTime;
    const slotEnd = currentTime + config.slotDurationMinutes;

    // Check against breaks
    const isInBreak = dayConfig.breaks.some((b: any) => {
      const bStart = getMins(b.start);
      const bEnd = getMins(b.end);
      return slotStart < bEnd && slotEnd > bStart;
    });

    // Valid if: Not in break AND is after the notice period
    if (!isInBreak && slotStart >= earliestAllowedMins) {
      const hh = Math.floor(slotStart / 60)
        .toString()
        .padStart(2, "0");
      const mm = (slotStart % 60).toString().padStart(2, "0");
      response.slots.push(`${hh}:${mm}`);
    }

    // Advance by duration + buffer
    currentTime += config.slotDurationMinutes + config.bufferMinutes;
  }

  return response;
};
