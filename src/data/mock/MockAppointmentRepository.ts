import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import type {
  Appointment,
  CreateAppointmentDTO,
  AppointmentStatus,
} from "../../domain/models/Appointment";
import { delay } from "../utils";

// Singleton mock state to persist across mock calls
let mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "patient1",
    providerId: "p1",
    date: "2026-04-21",
    time: "10:00",
    status: "CONFIRMED",
    type: "INITIAL_CONSULTATION",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class MockAppointmentRepository implements IAppointmentRepository {
  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    await delay(400);
    return mockAppointments.filter((a) => a.patientId === patientId);
  }

  async getAppointmentsByProvider(
    providerId: string,
    date?: string,
  ): Promise<Appointment[]> {
    await delay(400);
    return mockAppointments.filter(
      (a) => a.providerId === providerId && (!date || a.date === date),
    );
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    await delay(300);
    return mockAppointments.find((a) => a.id === id) || null;
  }

  async bookAppointment(dto: CreateAppointmentDTO): Promise<Appointment> {
    await delay(800);
    const newAppt: Appointment = {
      ...dto,
      id: Math.random().toString(36).substring(7),
      status: "CONFIRMED", // Auto-confirming for mock
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAppointments.push(newAppt);
    return newAppt;
  }

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    await delay(500);
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Appointment not found");

    mockAppointments[index] = {
      ...mockAppointments[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    return mockAppointments[index];
  }

  async rescheduleAppointment(
    id: string,
    date: string,
    time: string,
  ): Promise<Appointment> {
    await delay(500);
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Appointment not found");

    mockAppointments[index] = {
      ...mockAppointments[index],
      date,
      time,
      updatedAt: new Date().toISOString(),
    };
    return mockAppointments[index];
  }

  async cancelAppointment(id: string, reason?: string): Promise<boolean> {
    await delay(600);
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) return false;

    mockAppointments[index].status = "CANCELLED";
    mockAppointments[index].notes =
      (mockAppointments[index].notes || "") +
      (reason ? `\nCancel reason: ${reason}` : "");
    return true;
  }
}
