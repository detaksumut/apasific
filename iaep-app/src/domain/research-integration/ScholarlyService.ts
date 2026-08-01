import { ProviderCapability, ProviderCategory, ProviderType } from './ProviderCapabilities';

export interface ScholarlyService {
  id: string;
  name: string;
  providerType: ProviderType; // Expected to be SERVICE
  parentProviderId?: string;
  category: ProviderCategory;
  capabilities: ProviderCapability[];
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  createdAt: Date;
  updatedAt: Date;
}
