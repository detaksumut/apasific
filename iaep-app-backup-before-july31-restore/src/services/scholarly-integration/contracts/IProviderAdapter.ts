import { ProviderCapability } from '../../../domain/research-integration/ProviderCapabilities';

/**
 * Layer 1: Generic Contract for all External Scholarly Providers.
 * 
 * Enforces a standardized enterprise boundary completely decoupled from provider-specific nomenclature.
 * Prevents domain leakage by utilizing strictly typed parameters and `unknown` for payloads.
 */
export interface IProviderAdapter {
  /** Retrieves the unique ecosystem identity code of this provider (e.g., 'ELSEVIER_SSRN') */
  getProviderIdentity(): string;

  /** Retrieves the semver version of this adapter implementation */
  getVersion(): string;

  /** Retrieves the array of capabilities this specific adapter is programmed to handle */
  getCapabilities(): ProviderCapability[];

  /** Authenticates with the external provider (OAuth, API Key validation, etc.) */
  authenticate(): Promise<boolean>;

  /** 
   * Executes a specific capability dynamically.
   * `unknown` is used for payloads to enforce strong validation at the runtime edge 
   * and prevent generic type leakage into the bounded contexts.
   */
  executeCapability(capability: ProviderCapability, payload: unknown): Promise<unknown>;

  /** Validates the current health of the provider integration */
  healthCheck(): Promise<boolean>;

  /** Retrieves the metadata surrounding the last synchronization event */
  getLastSyncStatus(): Promise<unknown>;

  /** Establishes necessary connection pools or streams */
  connect(): Promise<void>;

  /** Gracefully tears down connections */
  disconnect(): Promise<void>;
}
