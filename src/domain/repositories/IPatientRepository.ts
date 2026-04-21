import type { Patient } from "../models/Patient.ts";

export interface IPatientRepository {
  getPatientById(id: string): Promise<Patient | null>;
  updatePatientProfile(id: string, data: Partial<Patient>): Promise<Patient>;
}
