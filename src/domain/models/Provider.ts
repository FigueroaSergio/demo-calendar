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
}

