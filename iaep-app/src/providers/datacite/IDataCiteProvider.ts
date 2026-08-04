// src/providers/datacite/IDataCiteProvider.ts

/**
 * Formal DataCite provider contract.
 *
 * Exposes the DataCite DOI registration capability for research artifacts.
 * All external communication is routed through ProviderRuntimeManager.
 * No direct HTTP calls are permitted.
 *
 * Environment-driven behavior:
 *   - DATACITE_MODE=production  -> real API only; credentials required; fail-closed.
 *   - DATACITE_MODE=sandbox     -> sandbox/test endpoint allowed (explicit config).
 */
export interface IDataCiteProvider {
  /**
   * Declares the capabilities this provider supports
   * (aligned with DataCiteCapability).
   */
  getCapabilities(): string[];

  /**
   * Registers a new DOI with DataCite for a research artifact.
   * @param payload the DataCite JSON payload (see DataCiteMapper.mapToDataCitePayload)
   * @returns response data + SHA-256 hash of the payload
   */
  registerArtifactDOI(payload: any): Promise<{ data: any; hash: string }>;

  /**
   * Updates metadata for an existing DataCite DOI.
   * @param doi the DOI to update
   * @param payload the updated DataCite JSON payload
   * @returns response data + SHA-256 hash of the payload
   */
  updateMetadata(doi: string, payload: any): Promise<{ data: any; hash: string }>;

  /**
   * Returns the configured DataCite DOI prefix.
   */
  getPrefix(): string;
}
