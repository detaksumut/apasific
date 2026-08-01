import { ProviderType, ProviderCategory } from './ProviderCapabilities';
import { ScholarlyService } from './ScholarlyService';

export interface ScholarlyProviderFamily {
  id: string;
  name: string;
  providerType: ProviderType; // Expected to be ECOSYSTEM
  category: ProviderCategory;
  services: ScholarlyService[]; // Nested services belonging to this ecosystem
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  createdAt: Date;
  updatedAt: Date;
}
