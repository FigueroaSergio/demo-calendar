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
  label: string;   // e.g. "Lunch"
  start: string;   // HH:mm
  end: string;     // HH:mm
}

export interface DaySchedule {
  enabled: boolean;
  workStart: string;  // HH:mm
  workEnd: string;    // HH:mm
  breaks: BreakPeriod[];
}

export interface SlotConfig {
  slotDurationMinutes: number;      // e.g. 15, 20, 30, 45, 60
  bufferMinutes: number;            // gap between slots
  maxPatientsPerSlot: number;       // overbooking control
  schedule: Record<string, DaySchedule>; // 'MON' | 'TUE' | ... | 'SUN'
  advancedBookingDays: number;      // how many days ahead patients can book
  minNoticeHours: number;           // minimum notice to book
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
    MON: { enabled: true,  workStart: '08:00', workEnd: '17:00', breaks: [{ label: 'Lunch', start: '12:00', end: '13:00' }] },
    TUE: { enabled: true,  workStart: '08:00', workEnd: '17:00', breaks: [{ label: 'Lunch', start: '12:00', end: '13:00' }] },
    WED: { enabled: true,  workStart: '08:00', workEnd: '17:00', breaks: [{ label: 'Lunch', start: '12:00', end: '13:00' }] },
    THU: { enabled: true,  workStart: '08:00', workEnd: '17:00', breaks: [{ label: 'Lunch', start: '12:00', end: '13:00' }] },
    FRI: { enabled: true,  workStart: '08:00', workEnd: '16:00', breaks: [{ label: 'Lunch', start: '12:00', end: '13:00' }] },
    SAT: { enabled: false, workStart: '09:00', workEnd: '13:00', breaks: [] },
    SUN: { enabled: false, workStart: '09:00', workEnd: '13:00', breaks: [] },
  },
};
