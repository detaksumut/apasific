// src/domain/external-evidence/ExternalEvidenceStore.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ExternalEvidenceSnapshot } from './ExternalEvidenceSnapshot';
import { DiscoveryEvidenceSnapshot } from './DiscoveryEvidenceSnapshot';

/**
 * ExternalEvidenceStore centralizes persistence of external provider evidence.
 *
 * Responsibilities:
 *   - Persist ExternalEvidenceSnapshot records (external_publication_records
 *     + external_evidence_payloads) for successful provider interactions.
 *   - Persist DiscoveryEvidenceSnapshot records (external_discovery_records)
 *     for discovery/harvesting evidence.
 *   - Provide a single auditable write path. Providers never write to the
 *     database directly; orchestration services must use this store.
 *
 * Fail-closed: if snapshot persistence fails, the error propagates so the
 * caller knows evidence was not durably recorded.
 */
export class ExternalEvidenceStore {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  /**
   * Persists a generic ExternalEvidenceSnapshot (PUBLISHER_DOI, DATASET,
   * IDENTITY, CITATION, etc.) to external_publication_records and
   * external_evidence_payloads.
   */
  public async persistExternalRecord(snapshot: ExternalEvidenceSnapshot): Promise<void> {
    const doi = (snapshot.payload?.doi as string) || (snapshot.payload?.data?.doi as string) || null;
    const url = (snapshot.payload?.url as string) || (snapshot.payload?.externalUrl as string) || null;

    const { data: record, error: recordError } = await this.supabase
      .from('external_publication_records')
      .upsert({
        id: snapshot.id,
        publication_id: snapshot.apasificIdentityId,
        provider: snapshot.provider,
        external_id: snapshot.providerEntityId,
        doi,
        url,
        status: snapshot.verifiedAt ? 'VERIFIED' : 'PENDING',
        verified_at: snapshot.verifiedAt?.toISOString() || null
      }, { onConflict: 'publication_id, provider' })
      .select()
      .single();

    if (recordError) {
      throw new Error(`ExternalEvidenceStore: failed to persist record for ${snapshot.provider}: ${recordError.message}`);
    }

    const { error: payloadError } = await this.supabase
      .from('external_evidence_payloads')
      .insert({
        external_record_id: record.id,
        payload_json: snapshot.payload,
        payload_hash: snapshot.payloadHash
      });

    if (payloadError) {
      throw new Error(`ExternalEvidenceStore: failed to persist payload hash for ${snapshot.provider}: ${payloadError.message}`);
    }
  }

  /**
   * Persists a DiscoveryEvidenceSnapshot (OpenAIRE/OpenAlex discovery and
   * indexing evidence) to external_discovery_records.
   */
  public async persistDiscoveryRecord(snapshot: DiscoveryEvidenceSnapshot): Promise<void> {
    const { error: recordError } = await this.supabase
      .from('external_discovery_records')
      .upsert({
        id: snapshot.id,
        publication_id: snapshot.publicationId,
        provider: snapshot.provider,
        external_identifier: snapshot.externalIdentifier,
        status: snapshot.status,
        metadata_hash: snapshot.metadataHash,
        discovered_at: snapshot.discoveredAt?.toISOString() || new Date().toISOString(),
        verified_at: snapshot.verifiedAt?.toISOString() || null,
        payload_json: snapshot.payload || null
      }, { onConflict: 'publication_id, provider' });

    if (recordError) {
      throw new Error(`ExternalEvidenceStore: failed to persist discovery record for ${snapshot.provider}: ${recordError.message}`);
    }
  }
}

