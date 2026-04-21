import { MockProviderRepository } from '../data/mock/MockProviderRepository';
import { MockAppointmentRepository } from '../data/mock/MockAppointmentRepository';

// In a real application, these would be real API repositories based on env variables
export const providerRepository = new MockProviderRepository();
export const appointmentRepository = new MockAppointmentRepository();
