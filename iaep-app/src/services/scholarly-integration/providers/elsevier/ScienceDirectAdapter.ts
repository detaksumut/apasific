import { IProviderAdapter } from '../../contracts/IProviderAdapter';
import { ProviderCapability } from '../../../../domain/research-integration/ProviderCapabilities';

export class ScienceDirectAdapter implements IProviderAdapter {
  
  public getProviderIdentity(): string {
    return 'ELSEVIER_SCIENCEDIRECT';
  }

  public getVersion(): string {
    return '1.0.0';
  }

  public getCapabilities(): ProviderCapability[] {
    return [
      ProviderCapability.DISCOVERY,
      ProviderCapability.PUBLICATION_METADATA
    ];
  }

  public async authenticate(): Promise<boolean> {
    throw new Error('NotImplementedError: Capability not implemented in Phase C.1');
  }

  public async executeCapability(capability: ProviderCapability, payload: unknown): Promise<unknown> {
    throw new Error('NotImplementedError: Capability not implemented in Phase C.1');
  }

  public async healthCheck(): Promise<boolean> {
    throw new Error('NotImplementedError: Capability not implemented in Phase C.1');
  }

  public async getLastSyncStatus(): Promise<unknown> {
    throw new Error('NotImplementedError: Capability not implemented in Phase C.1');
  }

  public async connect(): Promise<void> {
    throw new Error('NotImplementedError: Capability not implemented in Phase C.1');
  }

  public async disconnect(): Promise<void> {
    throw new Error('NotImplementedError: Capability not implemented in Phase C.1');
  }
}
