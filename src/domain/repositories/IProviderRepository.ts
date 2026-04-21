import type { Provider, ProviderAvailability, CreateProviderDTO } from "../models/Provider.ts";

export interface IProviderRepository {
  getAllProviders(): Promise<Provider[]>;
  getProviderById(id: string): Promise<Provider | null>;
  searchProviders(query: string, specialty?: string): Promise<Provider[]>;
  getAvailability(
    providerId: string,
    dateStart: string,
    dateEnd: string,
  ): Promise<ProviderAvailability[]>;
  createProvider(dto: CreateProviderDTO): Promise<Provider>;
  updateAvailability(providerId: string, availability: ProviderAvailability[]): Promise<void>;
}

