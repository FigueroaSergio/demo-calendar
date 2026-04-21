export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type AppointmentType = 'INITIAL_CONSULTATION' | 'FOLLOW_UP' | 'URGENT' | 'LAB_RESULTS';

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDTO {
  patientId: string;
  providerId: string;
  date: string;
  time: string;
  type: AppointmentType;
  notes?: string;
}
