import { IProviderAdapter } from '../contracts/IProviderAdapter';
import { ProviderCapability } from '../../../domain/research-integration/ProviderCapabilities';

/**
 * Layer 2: Provider Runtime Manager
 * 
 * The orchestration layer that acts as the ultimate Capability Gatekeeper.
 * Bounded Contexts MUST use this manager to interact with the scholarly ecosystem.
 */
export class ProviderRuntimeManager {
  private adapters: Map<string, IProviderAdapter> = new Map();

  constructor() {
    // In a production DI container, this would dynamically load registered adapters
  }

  /**
   * Registers a loaded adapter into the runtime.
   */
  public registerAdapter(providerCode: string, adapter: IProviderAdapter): void {
    this.adapters.set(providerCode, adapter);
  }

  /**
   * Resolves an adapter by its identity code.
   */
  public resolveProvider(providerCode: string): IProviderAdapter {
    const adapter = this.adapters.get(providerCode);
    if (!adapter) {
      throw new Error(`Provider resolution failed: No adapter registered for ${providerCode}`);
    }
    return adapter;
  }

  /**
   * Validates capability against the registry and executes it via the resolved adapter.
   */
  public async executeCapability(providerCode: string, capability: ProviderCapability, payload: unknown): Promise<unknown> {
    const adapter = this.resolveProvider(providerCode);

    // Step 1: Capability Validation
    // In production, this should also check against the 'provider_capabilities' database registry
    const supportedCapabilities = adapter.getCapabilities();
    
    if (!supportedCapabilities.includes(capability)) {
      throw new Error(`Capability execution rejected: Provider ${providerCode} does not support ${capability}`);
    }

    // Step 2: Capability Execution
    // Safely delegates to the authorized adapter
    return await adapter.executeCapability(capability, payload);
  }

  /**
   * Performs a health sweep across all registered ecosystem providers.
   */
  public async checkEcosystemHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    for (const [code, adapter] of this.adapters.entries()) {
      try {
        healthStatus[code] = await adapter.healthCheck();
      } catch (error) {
        healthStatus[code] = false;
      }
    }
    return healthStatus;
  }
}

// Singleton instance for DI usage
export const providerRuntime = new ProviderRuntimeManager();
