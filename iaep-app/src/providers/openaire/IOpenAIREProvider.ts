// src/providers/openaire/IOpenAIREProvider.ts

import { DiscoveryEvidenceSnapshot } from '../../domain/external-evidence/DiscoveryEvidenceSnapshot';

/**
 * Formal OpenAIRE provider contract.
 *
 * Exposes the OpenAIRE research-graph discovery and verification capability
 * set. All external communication is routed through ProviderRuntimeManager.
 * No direct HTTP calls are permitted.
 *
 * Environment-driven behavior:
 *   - OPENAIRE_MODE=production  -> real API only; fail-closed on missing config.
 *   - OPENAIRE_MODE=sandbox     -> sandbox/test endpoint allowed (explicit config).
 */
export interface IOpenAIREProvider {
  /**
   * Declares the capabilities this provider supports
   * (aligned with OpenAIRECapability).
   */
  getCapabilities(): string[];

  /**
   * Searches the OpenAIRE research graph for a publication using its DOI.
   *
   * Returns the real provider response. No fabricated/mock records are
   * introduced. `isIndexed` reflects the actual graph query result.
   *
   * @param doi the publication DOI to search for
   * @returns real response data + SHA-256 hash + indexing flag
   */
  searchResearchGraphByDOI(doi: string): Promise<{ data: any; hash: string; isIndexed: boolean }>;

  /**
   * Adapts a raw OpenAIRE response into a standardized discovery snapshot.
   * @param publicationId the IAEP publication id
   * @param openaireResponse the raw OpenAIRE graph response
   * @param payloadHash the SHA-256 hash of the response payload
   */
  adaptToDiscoverySnapshot(
    publicationId: string,
    openaireResponse: any,
    payloadHash: string
  ): DiscoveryEvidenceSnapshot;
}
