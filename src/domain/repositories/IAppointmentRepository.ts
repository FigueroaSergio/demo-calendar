import type {
  Appointment,
  CreateAppointmentDTO,
  AppointmentStatus,
} from "../models/Appointment.ts";

export interface IAppointmentRepository {
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByProvider(
    providerId: string,
    date?: string,
  ): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | null>;

  bookAppointment(dto: CreateAppointmentDTO): Promise<Appointment>;
  updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment>;
  rescheduleAppointment(
    id: string,
    date: string,
    time: string,
  ): Promise<Appointment>;
  cancelAppointment(id: string, reason?: string): Promise<boolean>;
}
