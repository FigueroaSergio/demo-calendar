import type { IProviderRepository } from "../../domain/repositories/IProviderRepository.ts";
import {
  type Provider,
  type ProviderAvailability,
  type CreateProviderDTO,
  type UpdateProviderDTO,
  getSlotsByDay,
} from "../../domain/models/Provider.ts";
import { delay } from "../utils.ts";
import { MockAppointmentRepository } from "./MockAppointmentRepository.ts";

const MOCK_PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "Dr. Julian Thorne",
    specialty: "Cardiologist",
    location: "St. Glacier Medical",
    languages: ["English", "Spanish"],
    experienceYears: 15,
    gender: "Male",
    rating: 4.9,
    reviewCount: 124,
    avatarUrl: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: "p2",
    name: "Dr. Sarah Chen",
    specialty: "Pediatrician",
    location: "St. Glacier Medical",
    languages: ["English", "Mandarin"],
    experienceYears: 8,
    gender: "Female",
    rating: 4.8,
    reviewCount: 89,
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "p3",
    name: "Dr. Elena Rodriguez",
    specialty: "Neurologist",
    location: "St. Glacier Medical",
    languages: ["English", "Spanish", "French"],
    experienceYears: 12,
    gender: "Female",
    rating: 4.6,
    reviewCount: 210,
    avatarUrl: "https://i.pravatar.cc/150?img=9",
  },
];

let MOCK_AVAILABILITIES: Record<string, ProviderAvailability[]> = {};
const appointmentRepository = new MockAppointmentRepository();

export class MockProviderRepository implements IProviderRepository {
  async getAllProviders(): Promise<Provider[]> {
    await delay(500);
    return MOCK_PROVIDERS;
  }

  async getProviderById(id: string): Promise<Provider | null> {
    await delay(300);
    return MOCK_PROVIDERS.find((p) => p.id === id) || null;
  }

  async searchProviders(
    query: string,
    specialty?: string,
  ): Promise<Provider[]> {
    await delay(600);
    return MOCK_PROVIDERS.filter((p) => {
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchSpecialty = specialty
        ? p.specialty.toLowerCase() === specialty.toLowerCase()
        : true;
      return matchQuery && matchSpecialty;
    });
  }

  async getAvailability(
    providerId: string,
    dateStart: string,
    dateEnd: string,
  ): Promise<ProviderAvailability[]> {
    await delay(400);

    // If we have custom availability set by admin, use it
    if (MOCK_AVAILABILITIES[providerId]) {
      return MOCK_AVAILABILITIES[providerId].filter(
        (a) => a.date >= dateStart && a.date <= dateEnd,
      );
    }
    const provider = await this.getProviderById(providerId);

    // Get all appointments for this provider to determine booked slots
    const providerAppointments =
      await appointmentRepository.getAppointmentsByProvider(providerId);

    // Create a map of booked slots by date
    const bookedSlots = new Map<string, Set<string>>();
    providerAppointments.forEach((appt) => {
      if (!bookedSlots.has(appt.date)) {
        bookedSlots.set(appt.date, new Set());
      }
      bookedSlots.get(appt.date)!.add(appt.time);
    });

    // All available slots in a day
    const allSlots = [
      "09:00",
      "09:30",
      "10:00",
      "11:30",
      "13:00",
      "14:30",
      "15:00",
      "16:30",
    ];

    // Generate availability for the requested date range
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    const results: ProviderAvailability[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (!provider?.slotConfig) {
        if (d.getDay() === 0 || d.getDay() === 6) continue; // Skip weekends

        const dateStr = d.toISOString().split("T")[0];
        const bookedForDate = bookedSlots.get(dateStr) || new Set<string>();

        // Filter out booked slots to show only available ones
        const availableSlots = allSlots.filter(
          (slot) => !bookedForDate.has(slot),
        );

        results.push({
          providerId,
          date: dateStr,
          slots: availableSlots,
        });
        continue;
      }
      const config = provider.slotConfig;
      results.push(getSlotsByDay(d, config, providerId));
    }

    return results;
  }

  async createProvider(dto: CreateProviderDTO): Promise<Provider> {
    await delay(800);
    const newProvider: Provider = {
      ...dto,
      id: `p${MOCK_PROVIDERS.length + 1}`,
      rating: 0,
      reviewCount: 0,
    };
    MOCK_PROVIDERS.push(newProvider);
    return newProvider;
  }

  async updateProvider(id: string, dto: UpdateProviderDTO): Promise<Provider> {
    await delay(600);
    const idx = MOCK_PROVIDERS.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Provider ${id} not found`);
    MOCK_PROVIDERS[idx] = { ...MOCK_PROVIDERS[idx], ...dto };
    return MOCK_PROVIDERS[idx];
  }

  async deleteProvider(id: string): Promise<void> {
    await delay(500);
    const idx = MOCK_PROVIDERS.findIndex((p) => p.id === id);
    if (idx !== -1) MOCK_PROVIDERS.splice(idx, 1);
  }

  async updateAvailability(
    providerId: string,
    availability: ProviderAvailability[],
  ): Promise<void> {
    await delay(600);
    MOCK_AVAILABILITIES[providerId] = availability;
  }
}
