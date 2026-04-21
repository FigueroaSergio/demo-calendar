import type { Provider, ProviderAvailability, CreateProviderDTO, UpdateProviderDTO } from "../models/Provider.ts";

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
  updateProvider(id: string, dto: UpdateProviderDTO): Promise<Provider>;
  deleteProvider(id: string): Promise<void>;
  updateAvailability(providerId: string, availability: ProviderAvailability[]): Promise<void>;
}
