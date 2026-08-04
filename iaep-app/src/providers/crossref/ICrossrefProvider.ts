// src/providers/crossref/ICrossrefProvider.ts

/**
 * Formal Crossref provider contract.
 *
 * Exposes the Crossref capability set for DOI registration and metadata
 * deposit. All external communication is routed through
 * ProviderRuntimeManager. No direct HTTP calls are permitted.
 *
 * Environment-driven behavior:
 *   - CROSSREF_MODE=production  -> real API only; credentials required; fail-closed.
 *   - CROSSREF_MODE=sandbox     -> sandbox/test endpoint allowed (explicit config).
 */
export interface ICrossrefProvider {
  /**
   * Declares the capabilities this provider supports
   * (aligned with CrossrefCapability).
   */
  getCapabilities(): string[];

  /**
   * Deposits an XML payload to Crossref to register a Publisher DOI.
   * @param xmlPayload the Crossref DOI batch XML string
   * @param targetDoi the DOI being registered
   * @returns response data + SHA-256 hash of the payload
   */
  depositXML(xmlPayload: string, targetDoi: string): Promise<{ data: any; hash: string }>;

  /**
   * Updates metadata for an existing Crossref DOI.
   * @param doi the DOI to update
   * @param xmlPayload the updated Crossref DOI batch XML string
   * @returns response data + SHA-256 hash of the payload
   */
  updateMetadata(doi: string, xmlPayload: string): Promise<{ data: any; hash: string }>;

  /**
   * Returns the configured Crossref DOI prefix.
   */
  getPrefix(): string;
}
