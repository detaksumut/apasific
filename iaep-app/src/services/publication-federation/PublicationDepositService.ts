// src/services/publication-federation/PublicationDepositService.ts

import { ZenodoProvider } from '@/providers/zenodo/ZenodoProvider';
import { ZenodoMapper, ApasificPublicationMetadata } from '@/providers/zenodo/ZenodoMapper';
import { ZenodoAdapter } from '@/providers/zenodo/ZenodoAdapter';
import { ExternalPublicationLifecycle, ExternalPublicationState } from '@/domain/external-evidence/ExternalPublicationLifecycle';
import { PublicationFederationEventType, PublicationFederationEvent } from '@/domain/external-evidence/PublicationFederationEvents';
import { createClient } from '@supabase/supabase-js';
import { ZenodoVerificationService } from './providers/ZenodoVerificationService';
import { OpenAIREVerificationService } from './providers/OpenAIREVerificationService';
import { DoiLifecycleEngine } from '@/domain/publication/DoiLifecycle';

export class PublicationDepositService {
  private zenodoProvider: ZenodoProvider;
  private supabase: any; // Ideally typed with SupabaseClient

  constructor() {
    // In a real implementation, ProviderRuntimeManager would wrap this provider
    this.zenodoProvider = new ZenodoProvider();
    
    // Initialize supabase client (assume environment variables are set)
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  public async depositToZenodo(publicationId: string, metadata: ApasificPublicationMetadata, fileBuffer: Buffer, filename: string): Promise<string> {
    const lifecycle = new ExternalPublicationLifecycle(ExternalPublicationState.DRAFT);
    
    try {
      lifecycle.transitionTo(ExternalPublicationState.READY_FOR_DEPOSIT);

      // 1. Create Deposit
      const zenodoMetadata = ZenodoMapper.mapToZenodoMetadata(metadata);
      const depositResult = await this.zenodoProvider.createDeposit(zenodoMetadata);
      const depositId = depositResult.data.id.toString();
      
      lifecycle.transitionTo(ExternalPublicationState.DEPOSIT_CREATED);
      this.emitEvent(PublicationFederationEventType.ZENODO_DEPOSIT_CREATED, publicationId, depositId);

      // 2. Upload File
      await this.zenodoProvider.uploadFile(depositId, filename, fileBuffer);
      
      lifecycle.transitionTo(ExternalPublicationState.FILE_UPLOADED);
      this.emitEvent(PublicationFederationEventType.ZENODO_FILE_UPLOADED, publicationId, depositId);

      // 3. Publish Record
      const publishResult = await this.zenodoProvider.publishRecord(depositId);
      
      lifecycle.transitionTo(ExternalPublicationState.PUBLISHED_EXTERNAL);
      
      // 4. Extract Evidence Snapshot and transition to VERIFIED
      const snapshot = ZenodoAdapter.adaptResponseToSnapshot(publicationId, publishResult.data, publishResult.hash);
      if (snapshot.doi) {
        lifecycle.transitionTo(ExternalPublicationState.DOI_VERIFIED);
        this.emitEvent(PublicationFederationEventType.ZENODO_DOI_ASSIGNED, publicationId, depositId, { doi: snapshot.doi });
      }

      // 5. Store in Database
      await this.storeEvidence(publicationId, snapshot, publishResult.data, publishResult.hash, lifecycle.getState());

      return snapshot.doi || 'DOI Pending';

    } catch (error) {
      console.error(`Error depositing publication ${publicationId} to Zenodo:`, error);
      throw error;
    }
  }

  public async verifyAndRefreshIndexStatus(publicationId: string): Promise<any> {
    try {
      // 1. Get current index_status and identifiers from Supabase
      const { data: sub, error: subError } = await this.supabase
        .from('submissions')
        .select('doi, zenodo_id, index_status')
        .eq('id', publicationId)
        .single();

      if (subError || !sub) throw new Error(subError?.message || "Submission not found");

      const currentStatus = sub.index_status || {
        overall: { visibility: "NOT_STARTED", last_checked: null }
      };

      const doiVal = sub.doi || '';
      const zenodoRecordId = sub.zenodo_id || '';

      // 2. Trigger Verifiers
      const zenodoVerifier = new ZenodoVerificationService();
      const openaireVerifier = new OpenAIREVerificationService();

      let zenodoStatus = "pending";
      let openaireStatus = "pending";

      if (zenodoRecordId) {
        const zenodoRes = await zenodoVerifier.verify(zenodoRecordId);
        zenodoStatus = zenodoRes.status === 'DISCOVERED' ? 'indexed' : 'pending';
      }

      if (doiVal) {
        const openaireRes = await openaireVerifier.verify(doiVal);
        openaireStatus = openaireRes.status === 'DISCOVERED' ? 'discovered' : 'pending';
      }

      // 3. Determine Overall Visibility Status
      let overallVisibility: any = "NOT_STARTED";
      if (zenodoStatus === "indexed" && openaireStatus === "discovered") {
        overallVisibility = "VISIBLE";
      } else if (zenodoStatus === "indexed" || openaireStatus === "discovered") {
        overallVisibility = "PARTIAL";
      } else if (zenodoRecordId || doiVal) {
        overallVisibility = "PROCESSING";
      }

      // PRESERVATION (Critical Data Preservation Rule): start from the
      // existing index_status so additive keys (e.g. doiLifecycle) and any
      // previously verified provider sections are never wiped. Keys are only
      // overwritten when a fresh verified value exists.
      const updatedStatus: any = {
        ...currentStatus,
        overall: {
          visibility: overallVisibility,
          last_checked: new Date().toISOString()
        }
      };

      if (doiVal) {
        updatedStatus.doi = {
          value: doiVal,
          provider: "zenodo",
          verified_at: currentStatus.doi?.verified_at || new Date().toISOString()
        };
      }

      if (zenodoRecordId) {
        updatedStatus.zenodo = {
          status: zenodoStatus,
          record_id: zenodoRecordId,
          checked_at: new Date().toISOString()
        };
      }

      updatedStatus.openaire = {
        status: openaireStatus,
        checked_at: openaireStatus === 'discovered' ? new Date().toISOString() : null
      };

      updatedStatus.googleScholar = currentStatus.googleScholar || {
        status: "pending",
        last_checked: null
      };

      // Target #4 — DOI lifecycle: advance to INDEXED when visibility is
      // confirmed. Forward-only; invalid lifecycle payloads are preserved
      // untouched (fail-safe, never destructive).
      if (overallVisibility === "VISIBLE" && updatedStatus.doiLifecycle) {
        try {
          const lifecycle = DoiLifecycleEngine.fromRaw(updatedStatus.doiLifecycle);
          if (lifecycle && lifecycle.currentStage !== 'INDEXED') {
            updatedStatus.doiLifecycle = DoiLifecycleEngine.advance(
              lifecycle,
              'INDEXED',
              'Visibility confirmed VISIBLE (Zenodo + OpenAIRE)'
            );
          }
        } catch {
          // Preserve record as-is.
        }
      }

      // 4. Persist to Database
      await this.supabase
        .from('submissions')
        .update({ index_status: updatedStatus })
        .eq('id', publicationId);

      return updatedStatus;
    } catch (error) {
      console.error(`Error verifying index status for publication ${publicationId}:`, error);
      throw error;
    }
  }

  private emitEvent(type: PublicationFederationEventType, publicationId: string, externalRecordId: string, payload?: any) {
    const event: PublicationFederationEvent = {
      type,
      publicationId,
      externalRecordId,
      timestamp: new Date(),
      payload
    };
    // Future OpenAIRE/OpenAlex subscriber integration point
    console.log(`[EVENT] ${type} emitted for publication ${publicationId}`);
  }

  private async storeEvidence(publicationId: string, snapshot: any, rawPayload: any, hash: string, status: string) {
    // 1. Store the lightweight external record
    const { data: record, error: recordError } = await this.supabase
      .from('external_publication_records')
      .upsert({
        id: snapshot.id,
        publication_id: publicationId,
        provider: snapshot.provider,
        external_id: snapshot.providerEntityId,
        doi: snapshot.doi,
        url: snapshot.externalUrl,
        status: status,
        verified_at: snapshot.verifiedAt
      }, { onConflict: 'publication_id, provider' })
      .select()
      .single();

    if (recordError) throw recordError;

    // 2. Store the heavy immutable payload separately
    const { error: payloadError } = await this.supabase
      .from('external_evidence_payloads')
      .insert({
        external_record_id: record.id,
        payload_json: rawPayload,
        payload_hash: hash
      });

    if (payloadError) throw payloadError;

    // 3. Update active publication metadata in submissions table
    await this.supabase
      .from('submissions')
      .update({
        doi: snapshot.doi,
        zenodo_id: snapshot.providerEntityId,
        index_status: {
          overall: {
            visibility: "PARTIAL",
            last_checked: new Date().toISOString()
          },
          doi: {
            value: snapshot.doi || '',
            provider: "zenodo",
            verified_at: new Date().toISOString()
          },
          zenodo: {
            status: "indexed",
            record_id: snapshot.providerEntityId || '',
            checked_at: new Date().toISOString()
          },
          openaire: {
            status: "pending",
            checked_at: null
          },
          googleScholar: {
            status: "pending",
            last_checked: null
          }
        }
      })
      .eq('id', publicationId);
  }
}
