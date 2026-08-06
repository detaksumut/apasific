// src/services/publication-federation/PublicationFederationOrchestrator.ts
//
// Consolidated Publication Federation Orchestrator (Target #4).
//
// Single workflow boundary that completes the publication-to-external
// scholarly ecosystem pipeline with normalized metadata, DOI lifecycle
// tracking, indexing status, and provider integration:
//
//   Zenodo    — repository deposit        (via PublicationDepositService)
//   Crossref  — DOI metadata registration (via CrossrefFederationService)
//   DataCite  — artifact DOI registration (via DataCiteFederationService)
//   ORCID     — author identity/work sync (via ORCIDProvider)
//   OpenAIRE  — discovery/indexing probe  (via OpenAIREDiscoveryService)
//
// All external HTTP is routed through ProviderRuntimeManager inside each
// provider. The orchestrator never performs direct provider HTTP calls
// except internal-asset file downloads and read-only Zenodo DOI recovery.
//
// CRITICAL DATA PRESERVATION RULE (governing):
//   1. Detect existing DOI (submissions.doi).
//   2. Detect existing Zenodo record (submissions.zenodo_id).
//   3. Preserve existing identifiers — never regenerate, never duplicate.
//   4. Skip duplicate deposit for already-deposited publications.
// Existing published articles remain the source of truth; this workflow
// applies only to new publications, future deposits, and future DOI
// registration (ADD -> CONNECT -> VERIFY -> DEPRECATE later).

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { PublicationDepositService } from './PublicationDepositService';
import { CrossrefFederationService } from './CrossrefFederationService';
import { DataCiteFederationService } from './DataCiteFederationService';
import { OpenAIREDiscoveryService } from './OpenAIREDiscoveryService';
import { ORCIDProvider } from '@/providers/orcid/ORCIDProvider';
import { ProviderRuntimeManager } from '@/providers/core/ProviderRuntimeManager';
import { ExternalEvidenceStore } from '@/domain/external-evidence/ExternalEvidenceStore';
import { ExternalEvidenceSnapshot } from '@/domain/external-evidence/ExternalEvidenceSnapshot';
import { PublicationFederationEventType } from '@/domain/external-evidence/PublicationFederationEvents';
import {
  PublicationMetadataNormalizer,
  NormalizedPublicationMetadata,
  PublicationNormalizeInput
} from './PublicationMetadataNormalizer';
import { DoiLifecycleEngine, DoiLifecycleRecord } from '@/domain/publication/DoiLifecycle';

export type FederationProviderName = 'zenodo' | 'crossref' | 'datacite' | 'orcid' | 'openaire';
export type FederationProviderStatus = 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface FederationProviderOutcome {
  provider: FederationProviderName;
  status: FederationProviderStatus;
  reason?: string;
  identifier?: string;
  checkedAt: string;
}

export interface PublicationFederationOutcome {
  submissionId: string;
  success: boolean;
  doi: string | null;
  zenodoId: string | null;
  zenodoUrl?: string;
  preserved: { doi: boolean; zenodo: boolean };
  skippedDeposit: boolean;
  lifecycle: DoiLifecycleRecord;
  providers: FederationProviderOutcome[];
  error?: string;
}

export interface FederationProcessOptions {
  volume?: string;
  issue?: string;
  authorName?: string;
  articleUrl?: string;
  /** Optional author ORCID OAuth access token — required for work push. */
  orcidAccessToken?: string;
}

interface FederationContext {
  submissionId: string;
  sub: any;
  normalized: NormalizedPublicationMetadata;
  doi: string | null;
  zenodoId: string | null;
  existingDoi?: string;
  existingZenodo?: string;
  lifecycle: DoiLifecycleRecord;
  currentStatus: any;
  providers: FederationProviderOutcome[];
}

export class PublicationFederationOrchestrator {
  private readonly supabase: SupabaseClient;
  private readonly depositService: PublicationDepositService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    this.depositService = new PublicationDepositService();
  }

  /**
   * Consolidated publication federation pipeline. Preservation-first:
   * existing DOI/Zenodo records are detected up front, preserved, and
   * duplicate deposits are skipped.
   */
  /**
   * Consolidated publication federation pipeline. Preservation-first:
   * existing DOI/Zenodo records are detected up front, preserved, and
   * duplicate deposits are skipped.
   */
  public async processPublication(
    submissionId: string,
    options: FederationProcessOptions = {},
    auditOptions: { actionType?: string; actorId?: string | null } = {}
  ): Promise<PublicationFederationOutcome> {
    const runId = randomUUID();
    const actorId = auditOptions.actorId || null;
    const actionType = auditOptions.actionType || 'INITIAL_PUBLICATION';
    
    // 1. Acquire Concurrency Lock (with 5-minute timeout recovery)
    const lockAcquired = await this.acquireLock(submissionId, actorId, runId);
    if (!lockAcquired.success) {
      return {
        submissionId,
        success: false,
        doi: null,
        zenodoId: null,
        preserved: { doi: false, zenodo: false },
        skippedDeposit: false,
        lifecycle: DoiLifecycleEngine.initialize('PUBLISHED', `Lock failed: ${lockAcquired.error}`),
        providers: [],
        error: lockAcquired.error
      };
    }

    let ctx: FederationContext | null = null;
    try {
      const loaded = await this.loadContext(submissionId, options);
      if ('outcome' in loaded) {
        await this.writeAuditTrail(submissionId, actorId, runId, actionType, 'FAILED', { error: loaded.outcome.error });
        return loaded.outcome;
      }
      ctx = loaded;

      // 2. Initialize provider registry records if missing
      await this.initRegistry(submissionId);

      // Step 1 — Repository deposit (Zenodo) via PublicationDepositService.
      const runZenodo = await this.shouldExecuteProvider(submissionId, 'zenodo');
      if (runZenodo.execute) {
        await this.updateRegistryStatus(submissionId, 'zenodo', 'PROCESSING', { attemptIncrement: 1 });
        await this.stepRepositoryDeposit(ctx);
        const outcome = ctx.providers.find(p => p.provider === 'zenodo');
        if (outcome) {
          const status = outcome.status === 'COMPLETED' ? 'COMPLETED' : (outcome.status === 'SKIPPED' ? 'SKIPPED' : 'FAILED');
          await this.updateRegistryStatus(submissionId, 'zenodo', status, {
            identifier: ctx.zenodoId || undefined,
            errorMessage: outcome.reason
          });
        }
      } else {
        ctx.providers.push({
          provider: 'zenodo',
          status: runZenodo.status === 'COMPLETED' ? 'SKIPPED' : (runZenodo.status as any || 'SKIPPED'),
          reason: `Registry status is ${runZenodo.status} — skipped execution.`,
          identifier: ctx.zenodoId || undefined,
          checkedAt: new Date().toISOString()
        });
      }

      // Step 2 — Metadata registration (Crossref).
      const runCrossref = await this.shouldExecuteProvider(submissionId, 'crossref');
      if (runCrossref.execute) {
        await this.updateRegistryStatus(submissionId, 'crossref', 'PROCESSING', { attemptIncrement: 1 });
        await this.stepMetadataRegistration(ctx);
        const outcome = ctx.providers.find(p => p.provider === 'crossref');
        if (outcome) {
          const status = outcome.status === 'COMPLETED' ? 'COMPLETED' : (outcome.status === 'SKIPPED' ? 'SKIPPED' : 'FAILED');
          await this.updateRegistryStatus(submissionId, 'crossref', status, {
            identifier: ctx.doi || undefined,
            errorMessage: outcome.reason
          });
        }
      } else {
        ctx.providers.push({
          provider: 'crossref',
          status: runCrossref.status === 'COMPLETED' ? 'SKIPPED' : (runCrossref.status as any || 'SKIPPED'),
          reason: `Registry status is ${runCrossref.status} — skipped execution.`,
          identifier: ctx.doi || undefined,
          checkedAt: new Date().toISOString()
        });
      }

      // Step 3 — ORCID identity verification / work synchronization.
      const runOrcid = await this.shouldExecuteProvider(submissionId, 'orcid');
      if (runOrcid.execute) {
        await this.updateRegistryStatus(submissionId, 'orcid', 'PROCESSING', { attemptIncrement: 1 });
        await this.stepOrcid(ctx, options);
        const outcome = ctx.providers.find(p => p.provider === 'orcid');
        if (outcome) {
          const status = outcome.status === 'COMPLETED' ? 'COMPLETED' : (outcome.status === 'SKIPPED' ? 'SKIPPED' : 'FAILED');
          await this.updateRegistryStatus(submissionId, 'orcid', status, {
            errorMessage: outcome.reason
          });
        }
      } else {
        ctx.providers.push({
          provider: 'orcid',
          status: runOrcid.status === 'COMPLETED' ? 'SKIPPED' : (runOrcid.status as any || 'SKIPPED'),
          reason: `Registry status is ${runOrcid.status} — skipped execution.`,
          checkedAt: new Date().toISOString()
        });
      }

      // Step 4 — Indexing queue (OpenAIRE discovery probe).
      const runOpenAire = await this.shouldExecuteProvider(submissionId, 'openaire');
      if (runOpenAire.execute) {
        await this.updateRegistryStatus(submissionId, 'openaire', 'PROCESSING', { attemptIncrement: 1 });
        await this.stepIndexingQueue(ctx);
        const outcome = ctx.providers.find(p => p.provider === 'openaire');
        if (outcome) {
          const status = outcome.status === 'COMPLETED' ? 'COMPLETED' : (outcome.status === 'SKIPPED' ? 'SKIPPED' : 'FAILED');
          await this.updateRegistryStatus(submissionId, 'openaire', status, {
            errorMessage: outcome.reason
          });
        }
      } else {
        ctx.providers.push({
          provider: 'openaire',
          status: runOpenAire.status === 'COMPLETED' ? 'SKIPPED' : (runOpenAire.status as any || 'SKIPPED'),
          reason: `Registry status is ${runOpenAire.status} — skipped execution.`,
          checkedAt: new Date().toISOString()
        });
      }

      const finalOutcome = await this.finalize(ctx, { success: true });
      
      // Determine overall run outcome
      const hasFailed = ctx.providers.some(p => p.status === 'FAILED');
      const hasSuccess = ctx.providers.some(p => p.status === 'COMPLETED' || p.status === 'SKIPPED');
      const finalStatus = hasFailed ? (hasSuccess ? 'PARTIAL_SUCCESS' : 'FAILED') : 'SUCCESS';
      
      await this.writeAuditTrail(submissionId, actorId, runId, actionType, finalStatus, { providers: ctx.providers });
      return finalOutcome;

    } catch (e: any) {
      console.error('[Orchestrator] Run error:', e);
      await this.writeAuditTrail(submissionId, actorId, runId, actionType, 'FAILED', { error: e.message });
      
      return {
        submissionId,
        success: false,
        doi: ctx?.doi || null,
        zenodoId: ctx?.zenodoId || null,
        preserved: { doi: Boolean(ctx?.existingDoi), zenodo: Boolean(ctx?.existingZenodo) },
        skippedDeposit: false,
        lifecycle: ctx?.lifecycle || DoiLifecycleEngine.initialize('PUBLISHED', `Error: ${e.message}`),
        providers: ctx?.providers || [],
        error: e.message
      };
    } finally {
      // 3. Release Concurrency Lock
      await this.releaseLock(submissionId);
    }
  }

  /**
   * Tries to acquire the concurrency lock for a submission.
   * If a stale lock (> 5 mins) is found, it releases it and logs a LOCK_TIMEOUT_RECOVERY.
   */
  private async acquireLock(submissionId: string, actorId: string | null, runId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: sub } = await this.supabase
        .from('submissions')
        .select('federation_lock_at, federation_lock_owner')
        .eq('id', submissionId)
        .single();

      if (sub && sub.federation_lock_at) {
        const lockTime = new Date(sub.federation_lock_at).getTime();
        const now = Date.now();
        const diffMins = (now - lockTime) / (1000 * 60);

        if (diffMins > 5) {
          // Stale lock recovery
          await this.writeAuditTrail(submissionId, actorId, runId, 'LOCK_TIMEOUT_RECOVERY', 'SUCCESS', {
            previous_owner: sub.federation_lock_owner,
            locked_at: sub.federation_lock_at
          });
          await this.releaseLock(submissionId);
        } else {
          return { success: false, error: 'Proses federasi sedang berjalan oleh editor lain.' };
        }
      }

      // Set lock
      const { error: lockErr } = await this.supabase
        .from('submissions')
        .update({
          federation_lock_at: new Date().toISOString(),
          federation_lock_owner: actorId
        })
        .eq('id', submissionId);

      if (lockErr) throw lockErr;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: `Gagal acquire lock: ${err.message}` };
    }
  }

  private async releaseLock(submissionId: string): Promise<void> {
    try {
      await this.supabase
        .from('submissions')
        .update({
          federation_lock_at: null,
          federation_lock_owner: null
        })
        .eq('id', submissionId);
    } catch (e) {
      console.error('[Orchestrator] Release lock failed:', e);
    }
  }

  private async writeAuditTrail(
    submissionId: string,
    actorId: string | null,
    runId: string,
    actionType: string,
    outcome: string,
    details: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('federation_audit_trail')
        .insert({
          submission_id: submissionId,
          actor_id: actorId,
          run_id: runId,
          action_type: actionType,
          outcome,
          details
        });
    } catch (e) {
      console.error('[Orchestrator] Write audit trail failed:', e);
    }
  }

  private async initRegistry(submissionId: string): Promise<void> {
    const providers = ['zenodo', 'crossref', 'orcid', 'openaire'];
    for (const p of providers) {
      try {
        const { data } = await this.supabase
          .from('publication_provider_registry')
          .select('status')
          .eq('submission_id', submissionId)
          .eq('provider_name', p)
          .maybeSingle();

        if (!data) {
          await this.supabase
            .from('publication_provider_registry')
            .insert({
              submission_id: submissionId,
              provider_name: p,
              status: 'PENDING'
            });
        }
      } catch (e) {
        console.error(`[Orchestrator] Init registry for ${p} failed:`, e);
      }
    }
  }

  private async shouldExecuteProvider(submissionId: string, provider: string): Promise<{ execute: boolean; status?: string }> {
    try {
      const { data } = await this.supabase
        .from('publication_provider_registry')
        .select('*')
        .eq('submission_id', submissionId)
        .eq('provider_name', provider)
        .single();

      if (!data) return { execute: true };
      
      const status = data.status;
      if (status === 'COMPLETED' || status === 'SKIPPED' || status === 'PROCESSING') {
        return { execute: false, status };
      }

      if (status === 'FAILED_PERMANENT' || data.attempt_count >= 5) {
        if (status !== 'FAILED_PERMANENT') {
          await this.updateRegistryStatus(submissionId, provider, 'FAILED_PERMANENT', {
            errorMessage: 'Batas maksimum percobaan rilis eksternal (5x) terlampaui.'
          });
        }
        return { execute: false, status: 'FAILED_PERMANENT' };
      }

      return { execute: true, status };
    } catch {
      return { execute: true };
    }
  }

  private async updateRegistryStatus(
    submissionId: string,
    provider: string,
    status: string,
    options: { attemptIncrement?: number; identifier?: string; errorMessage?: string } = {}
  ): Promise<void> {
    try {
      const updateData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (options.attemptIncrement) {
        const { data: current } = await this.supabase
          .from('publication_provider_registry')
          .select('attempt_count')
          .eq('submission_id', submissionId)
          .eq('provider_name', provider)
          .single();
        
        const count = (current?.attempt_count || 0) + options.attemptIncrement;
        updateData.attempt_count = count;
        updateData.last_attempt_at = new Date().toISOString();
        
        // Auto convert to permanent failure if limit exceeded
        if (count >= 5 && status === 'FAILED') {
          updateData.status = 'FAILED_PERMANENT';
          updateData.error_message = options.errorMessage || 'Batas maksimum percobaan rilis eksternal (5x) terlampaui.';
        }
      }

      if (options.identifier) {
        updateData.external_identifier = options.identifier;
      }
      if (options.errorMessage && updateData.status !== 'FAILED_PERMANENT') {
        updateData.error_message = options.errorMessage;
      }

      await this.supabase
        .from('publication_provider_registry')
        .update(updateData)
        .eq('submission_id', submissionId)
        .eq('provider_name', provider);
    } catch (e) {
      console.error(`[Orchestrator] Update registry for ${provider} failed:`, e);
    }
  }

  /**
   * Loads the publication context and applies the preservation rule before
   * any federation step:
   *   1. Detect existing DOI.  2. Detect existing Zenodo record.
   *   3. Preserve identifiers. 4. Skip duplicate deposit.
   * Returns either a ready FederationContext or a terminal failure outcome.
   */
  private async loadContext(
    submissionId: string,
    options: FederationProcessOptions
  ): Promise<FederationContext | { outcome: PublicationFederationOutcome }> {
    const abort = (error: string): { outcome: PublicationFederationOutcome } => ({
      outcome: {
        submissionId,
        success: false,
        doi: null,
        zenodoId: null,
        preserved: { doi: false, zenodo: false },
        skippedDeposit: false,
        lifecycle: DoiLifecycleEngine.initialize('PUBLISHED', `Federation aborted: ${error}`),
        providers: [],
        error
      }
    });

    const { data: sub, error: loadError } = await this.supabase
      .from('submissions')
      .select('*, journals:journal_id(name), profiles:author_id(full_name)')
      .eq('id', submissionId)
      .single();

    if (loadError || !sub) {
      return abort(loadError?.message || 'Publication not found');
    }

    // Only published, assigned to publish, or production completed articles enter the federation workflow.
    const status = String(sub.status || '').toLowerCase();
    const allowedStatuses = ['published', 'assigned to publish', 'production completed'];
    if (!allowedStatuses.includes(status)) {
      return abort(`Only published or ready-to-publish articles can be federated (current status: ${sub.status || 'unknown'}).`);
    }

    // ── Preservation detection ──────────────────────────────────────────────
    const existingDoi = PublicationMetadataNormalizer.normalizeDoi(sub.doi);
    const existingZenodo = sub.zenodo_id ? String(sub.zenodo_id).trim() : undefined;

    let doi: string | null = existingDoi || null;
    let zenodoId: string | null = existingZenodo || null;

    // Read-only DOI recovery when a Zenodo record exists but the DOI column
    // is empty (preservation of the original identifier — never regenerated).
    if (zenodoId && !doi) {
      doi = await this.recoverDoiFromZenodo(zenodoId);
      if (doi) {
        await this.supabase.from('submissions').update({ doi }).eq('id', submissionId);
      }
    }

    // ── Normalized metadata ─────────────────────────────────────────────────
    const { resolvePublicationDateString } = await import('@/services/publication/PublicationDateResolver');

    const normalizeInput: PublicationNormalizeInput = {
      title: sub.title,
      abstract: sub.abstract,
      keywords: sub.keywords,
      authorName: options.authorName || sub.author || sub.profiles?.full_name,
      affiliation: sub.university,
      orcid: sub.orcid,
      doi: sub.doi,
      zenodoId: sub.zenodo_id,
      journalName: sub.journals?.name,
      issn: sub.issn,
      volume: options.volume || sub.volume,
      issue: options.issue || sub.issue,
      publicationDate: resolvePublicationDateString(sub),
      articleUrl: options.articleUrl
    };

    let normalized: NormalizedPublicationMetadata;
    try {
      normalized = PublicationMetadataNormalizer.normalize(normalizeInput);
    } catch (e: any) {
      return abort(e?.message || 'Metadata normalization failed');
    }

    // ── DOI lifecycle initialization (preserving any existing record) ───────
    const currentStatus: any = sub.index_status || {
      overall: { visibility: 'NOT_STARTED', last_checked: null }
    };
    let lifecycle = DoiLifecycleEngine.fromRaw(currentStatus.doiLifecycle);
    if (!lifecycle) {
      lifecycle =
        doi || zenodoId
          ? DoiLifecycleEngine.backfillFromExistingIdentifiers({
              doi,
              zenodoId,
              publishedAt: resolvePublicationDateString(sub)
            })
          : DoiLifecycleEngine.initialize('PUBLISHED', 'Consolidated federation workflow started');
    }

    return {
      submissionId,
      sub,
      normalized,
      doi,
      zenodoId,
      existingDoi,
      existingZenodo,
      lifecycle,
      currentStatus,
      providers: []
    };
  }

  /**
   * Step 1 — Zenodo repository deposit through PublicationDepositService.
   * Preservation: when an existing DOI or Zenodo record is detected the
   * deposit is skipped entirely (no duplicate deposits, ever).
   */
  private async stepRepositoryDeposit(ctx: FederationContext): Promise<void> {
    const providers = ctx.providers;
    const now = new Date().toISOString();

    if (ctx.doi || ctx.zenodoId) {
      const reason = ctx.existingZenodo
        ? `Existing Zenodo record ${ctx.zenodoId} preserved — duplicate deposit skipped.`
        : `Existing DOI ${ctx.doi} preserved — duplicate deposit skipped.`;
      providers.push({
        provider: 'zenodo',
        status: 'SKIPPED',
        reason,
        identifier: ctx.zenodoId || ctx.doi || undefined,
        checkedAt: now
      });
      this.emitEvent(
        PublicationFederationEventType.EXISTING_IDENTIFIERS_PRESERVED,
        ctx.submissionId,
        ctx.zenodoId || ctx.doi || '',
        { doi: ctx.doi, zenodoId: ctx.zenodoId }
      );
      return;
    }

    // New publication — consolidated deposit flow.
    const fileUrl = ctx.sub.file_url_galley || ctx.sub.file_url;
    if (!fileUrl) {
      providers.push({
        provider: 'zenodo',
        status: 'FAILED',
        reason: 'No galley/manuscript file available for deposit.',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    ctx.lifecycle = this.safeAdvance(ctx.lifecycle, 'DEPOSIT_REQUEST', 'Deposit requested via consolidated workflow');

    let fileBuffer: Buffer;
    let filename: string;
    try {
      const downloaded = await this.downloadFile(fileUrl);
      fileBuffer = downloaded.buffer;
      filename = downloaded.filename;
    } catch (e: any) {
      providers.push({
        provider: 'zenodo',
        status: 'FAILED',
        reason: `File download failed: ${e?.message || e}`,
        checkedAt: new Date().toISOString()
      });
      return;
    }

    try {
      const apasificMeta = PublicationMetadataNormalizer.toApasificPublicationMetadata(ctx.normalized);
      const depositedDoi = await this.depositService.depositToZenodo(
        ctx.submissionId,
        apasificMeta,
        fileBuffer,
        filename
      );

      if (depositedDoi && depositedDoi !== 'DOI Pending') {
        ctx.doi = depositedDoi;
      }

      // Reload identifiers persisted by PublicationDepositService.storeEvidence
      // and rebase the lifecycle onto the freshest persisted copy.
      const { data: reloaded } = await this.supabase
        .from('submissions')
        .select('doi, zenodo_id, index_status')
        .eq('id', ctx.submissionId)
        .single();
      if (reloaded) {
        ctx.doi = PublicationMetadataNormalizer.normalizeDoi(reloaded.doi) || ctx.doi;
        ctx.zenodoId = reloaded.zenodo_id ? String(reloaded.zenodo_id).trim() : ctx.zenodoId;
        const reloadedLifecycle = DoiLifecycleEngine.fromRaw(reloaded.index_status?.doiLifecycle);
        if (reloadedLifecycle) ctx.lifecycle = reloadedLifecycle;
      }

      ctx.lifecycle = this.safeAdvance(
        ctx.lifecycle,
        'REPOSITORY_DEPOSIT',
        'Zenodo deposit created, file uploaded, record published',
        'zenodo'
      );
      if (ctx.doi) {
        ctx.lifecycle = this.safeAdvance(ctx.lifecycle, 'DOI_RECEIVED', `DOI ${ctx.doi} received`, 'zenodo');
      }

      providers.push({
        provider: 'zenodo',
        status: 'COMPLETED',
        identifier: ctx.zenodoId || undefined,
        reason: ctx.doi ? `Deposit published; DOI ${ctx.doi}` : 'Deposit published; DOI pending',
        checkedAt: new Date().toISOString()
      });
    } catch (e: any) {
      providers.push({
        provider: 'zenodo',
        status: 'FAILED',
        reason: e?.message || 'Zenodo deposit failed',
        checkedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Step 2 — Crossref DOI metadata registration (best-effort, fail-closed).
   * Uses the preserved/existing DOI; never generates or overwrites a DOI.
   * Skipped honestly when credentials or ISSN are not configured.
   */
  private async stepMetadataRegistration(ctx: FederationContext): Promise<void> {
    const providers = ctx.providers;

    if (!ctx.doi) {
      providers.push({
        provider: 'crossref',
        status: 'SKIPPED',
        reason: 'No DOI available for metadata registration.',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    ctx.lifecycle = this.safeAdvance(
      ctx.lifecycle,
      'METADATA_REGISTRATION',
      'Metadata registration stage entered',
      'crossref'
    );

    const crossrefConfigured = Boolean(process.env.CROSSREF_API_KEY || process.env.CROSSREF_LOGIN_ID);

    if (!ctx.normalized.journal.issn) {
      providers.push({
        provider: 'crossref',
        status: 'SKIPPED',
        reason: 'Journal ISSN not configured — Crossref deposit requires an ISSN.',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    if (!crossrefConfigured) {
      providers.push({
        provider: 'crossref',
        status: 'SKIPPED',
        reason: 'Crossref credentials not configured (CROSSREF_API_KEY / CROSSREF_LOGIN_ID).',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    try {
      const crossrefService = new CrossrefFederationService();
      const crossrefMeta = PublicationMetadataNormalizer.toCrossrefDepositMetadata(ctx.normalized, ctx.doi);
      const registeredDoi = await crossrefService.publishArticleDOI(ctx.submissionId, crossrefMeta);
      providers.push({
        provider: 'crossref',
        status: 'COMPLETED',
        identifier: registeredDoi,
        reason: 'Metadata deposit queued at Crossref.',
        checkedAt: new Date().toISOString()
      });
      this.emitEvent(
        PublicationFederationEventType.CROSSREF_METADATA_REGISTERED,
        ctx.submissionId,
        registeredDoi
      );
    } catch (e: any) {
      providers.push({
        provider: 'crossref',
        status: 'FAILED',
        identifier: ctx.doi,
        reason: e?.message || 'Crossref deposit failed',
        checkedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Step 3 — ORCID integration. Identity verification uses the public API
   * (read-only). Pushing a work to an author's ORCID record requires the
   * author's OAuth access token; when no token is available the step is
   * reported honestly as SKIPPED (no fabricated synchronizations).
   */
  private async stepOrcid(ctx: FederationContext, options: FederationProcessOptions): Promise<void> {
    const providers = ctx.providers;
    const orcidId = ctx.normalized.orcid;

    if (!orcidId) {
      providers.push({
        provider: 'orcid',
        status: 'SKIPPED',
        reason: 'No valid ORCID iD on the publication.',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    if (!process.env.ORCID_CLIENT_ID) {
      providers.push({
        provider: 'orcid',
        status: 'SKIPPED',
        identifier: orcidId,
        reason: 'ORCID not configured (ORCID_CLIENT_ID missing); author iD recorded on metadata.',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    try {
      const orcidProvider = new ORCIDProvider();
      const profile = await orcidProvider.verifyIdentity(orcidId);

      if (options.orcidAccessToken && ctx.doi) {
        const workData = PublicationMetadataNormalizer.toOrcidWork(ctx.normalized, ctx.doi);
        const { data, hash } = await orcidProvider.pushWorkToProfile(
          orcidId,
          options.orcidAccessToken,
          workData
        );

        // Persist ORCID work-push evidence via the centralized evidence store.
        // Fail-closed: if evidence cannot be recorded, report the step failed.
        try {
          const snapshot: ExternalEvidenceSnapshot = {
            id: randomUUID(),
            provider: 'ORCID',
            providerEntityId: orcidId,
            apasificIdentityId: ctx.sub.author_id || undefined,
            evidenceType: 'PUBLICATION',
            payloadHash: hash,
            payload: { work: workData, response: data },
            verifiedAt: new Date(),
            sourceTimestamp: new Date()
          };
          await new ExternalEvidenceStore().persistExternalRecord(snapshot);
        } catch (evidenceError: any) {
          providers.push({
            provider: 'orcid',
            status: 'FAILED',
            identifier: orcidId,
            reason: `ORCID work pushed but evidence persistence failed: ${evidenceError?.message || evidenceError}`,
            checkedAt: new Date().toISOString()
          });
          return;
        }

        providers.push({
          provider: 'orcid',
          status: 'COMPLETED',
          identifier: orcidId,
          reason: 'Work pushed to ORCID profile and evidence persisted.',
          checkedAt: new Date().toISOString()
        });
        this.emitEvent(
          PublicationFederationEventType.ORCID_WORK_SYNCHRONIZED,
          ctx.submissionId,
          orcidId,
          { hash }
        );
      } else {
        const displayName = profile.creditName || profile.givenName || orcidId;
        providers.push({
          provider: 'orcid',
          status: 'SKIPPED',
          identifier: orcidId,
          reason: `ORCID identity verified (${displayName}); work push deferred — author OAuth access token not persisted.`,
          checkedAt: new Date().toISOString()
        });
      }
    } catch (e: any) {
      providers.push({
        provider: 'orcid',
        status: 'FAILED',
        identifier: orcidId,
        reason: e?.message || 'ORCID verification failed',
        checkedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Step 4 — OpenAIRE discovery/indexing probe (best-effort). Advances the
   * DOI lifecycle to INDEXED only when the real graph query confirms
   * discoverability (no fabricated indexing claims).
   */
  private async stepIndexingQueue(ctx: FederationContext): Promise<void> {
    const providers = ctx.providers;

    if (!ctx.doi) {
      providers.push({
        provider: 'openaire',
        status: 'SKIPPED',
        reason: 'No DOI available for discovery probe.',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    ctx.lifecycle = this.safeAdvance(
      ctx.lifecycle,
      'INDEXING_QUEUE',
      'OpenAIRE discovery probe queued',
      'openaire'
    );

    try {
      const openaireService = new OpenAIREDiscoveryService();
      const discovered = await openaireService.discoverPublication(ctx.submissionId, ctx.doi);

      providers.push({
        provider: 'openaire',
        status: discovered ? 'COMPLETED' : 'SKIPPED',
        identifier: ctx.doi,
        reason: discovered
          ? 'Discovered in OpenAIRE research graph.'
          : 'Not yet discovered in OpenAIRE — remains in indexing queue.',
        checkedAt: new Date().toISOString()
      });
      this.emitEvent(
        PublicationFederationEventType.OPENAIRE_DISCOVERY_CHECKED,
        ctx.submissionId,
        ctx.doi,
        { discovered }
      );

      if (discovered) {
        ctx.lifecycle = this.safeAdvance(
          ctx.lifecycle,
          'INDEXED',
          'Discovered in OpenAIRE research graph',
          'openaire'
        );
      }
    } catch (e: any) {
      providers.push({
        provider: 'openaire',
        status: 'FAILED',
        identifier: ctx.doi,
        reason: e?.message || 'OpenAIRE discovery probe failed',
        checkedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Finalizes a processing run: merges the DOI lifecycle and provider
   * outcomes into index_status (preservation-safe merge, never wiping
   * existing keys) and fills missing identifiers on the submissions row.
   */
  private async finalize(
    ctx: FederationContext,
    flags: { success: boolean; error?: string }
  ): Promise<PublicationFederationOutcome> {
    await this.persistIndexStatus(ctx.submissionId, {
      doi: ctx.doi,
      zenodoId: ctx.zenodoId,
      lifecycle: ctx.lifecycle
    });

    // Fill-only identifier confirmation (never overwrites preserved values).
    const identityUpdate: Record<string, any> = {};
    if (ctx.doi && ctx.doi !== ctx.existingDoi && !ctx.sub.doi) {
      identityUpdate.doi = ctx.doi;
    }
    if (ctx.zenodoId && ctx.zenodoId !== ctx.existingZenodo && !ctx.sub.zenodo_id) {
      identityUpdate.zenodo_id = ctx.zenodoId;
    }
    if (Object.keys(identityUpdate).length > 0) {
      await this.supabase
        .from('submissions')
        .update(identityUpdate)
        .eq('id', ctx.submissionId);
    }

    return {
      submissionId: ctx.submissionId,
      success: flags.success,
      doi: ctx.doi,
      zenodoId: ctx.zenodoId,
      zenodoUrl: ctx.zenodoId ? this.zenodoRecordUrl(ctx.zenodoId) : undefined,
      preserved: { doi: Boolean(ctx.existingDoi), zenodo: Boolean(ctx.existingZenodo) },
      skippedDeposit: Boolean(ctx.existingDoi || ctx.existingZenodo),
      lifecycle: ctx.lifecycle,
      providers: ctx.providers,
      error: flags.error
    };
  }

  /**
   * Refreshes indexing status for an existing publication using the
   * verification services (Zenodo + OpenAIRE) without touching deposits.
   * Preservation-safe: never rewrites identifiers or deposits.
   */
  public async refreshIndexing(submissionId: string): Promise<{
    success: boolean;
    indexStatus?: any;
    doi?: string;
    zenodoId?: string;
    zenodoUrl?: string;
    error?: string;
  }> {
    try {
      // 1. Read current identifiers (preserved as source of truth).
      const { data: sub, error: loadError } = await this.supabase
        .from('submissions')
        .select('doi, zenodo_id, status')
        .eq('id', submissionId)
        .single();

      if (loadError || !sub) {
        return { success: false, error: loadError?.message || 'Publication not found' };
      }

      const doi = PublicationMetadataNormalizer.normalizeDoi(sub.doi);
      const zenodoId = sub.zenodo_id ? String(sub.zenodo_id).trim() : undefined;

      if (!doi && !zenodoId) {
        return {
          success: false,
          error: 'Publication has no DOI or Zenodo record yet — run the consolidated deposit first.'
        };
      }

      // 2. Verify and refresh index status (preservation-safe merge inside).
      const indexStatus = await this.depositService.verifyAndRefreshIndexStatus(submissionId);

      // 3. If a Zenodo record exists but no DOI was stored, recover it
      //    (read-only recovery of the original identifier — never regenerate).
      let resolvedDoi = doi;
      if (!resolvedDoi && zenodoId) {
        const recovered = await this.recoverDoiFromZenodo(zenodoId);
        if (recovered) {
          resolvedDoi = recovered;
          await this.supabase.from('submissions').update({ doi: recovered }).eq('id', submissionId);
        }
      }

      return {
        success: true,
        indexStatus,
        doi: resolvedDoi || undefined,
        zenodoId,
        zenodoUrl: zenodoId ? this.zenodoRecordUrl(zenodoId) : undefined
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Indexing status refresh failed' };
    }
  }

  /**
   * Registers a supplementary artifact DOI via DataCite, linked to the
   * publication's preserved DOI. Requires the publication to already hold a
   * DOI (preservation: the related DOI is never created or modified here).
   */
  public async registerArtifact(
    submissionId: string,
    artifact: { artifactUrl: string; title?: string; resourceType?: 'Dataset' | 'Software' | 'Model' | 'Other' }
  ): Promise<{ success: boolean; artifactDoi?: string; error?: string }> {
    try {
      const { data: sub, error: loadError } = await this.supabase
        .from('submissions')
        .select('*, journals:journal_id(name)')
        .eq('id', submissionId)
        .single();

      if (loadError || !sub) {
        return { success: false, error: loadError?.message || 'Publication not found' };
      }

      const publicationDoi = PublicationMetadataNormalizer.normalizeDoi(sub.doi);
      if (!publicationDoi) {
        return {
          success: false,
          error: 'Publication has no DOI yet — artifact DOIs link to an existing publication DOI.'
        };
      }

      if (!artifact.artifactUrl) {
        return { success: false, error: 'artifactUrl is required.' };
      }

      if (!process.env.DATACITE_API_TOKEN) {
        return { success: false, error: 'DataCite is not configured (DATACITE_API_TOKEN missing).' };
      }

      const normalized = PublicationMetadataNormalizer.normalize({
        title: sub.title,
        abstract: sub.abstract,
        keywords: sub.keywords,
        authorName: sub.author || undefined,
        orcid: sub.orcid,
        doi: sub.doi,
        journalName: sub.journals?.name,
        issn: sub.issn,
        volume: sub.volume,
        issue: sub.issue,
        publicationDate: sub.published_at || sub.updated_at || sub.created_at
      });

      const artifactMeta = PublicationMetadataNormalizer.toDataCiteArtifactMetadata(normalized, {
        artifactUrl: artifact.artifactUrl,
        relatedPublicationDoi: publicationDoi,
        resourceType: artifact.resourceType,
        title: artifact.title
      });

      const dataciteService = new DataCiteFederationService();
      const artifactDoi = await dataciteService.registerArtifact(submissionId, artifactMeta);

      this.emitEvent(PublicationFederationEventType.DATACITE_ARTIFACT_REGISTERED, submissionId, artifactDoi || '', {
        publicationDoi,
        artifactUrl: artifact.artifactUrl
      });

      return { success: true, artifactDoi: artifactDoi || undefined };
    } catch (e: any) {
      return { success: false, error: e?.message || 'DataCite artifact registration failed' };
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Persistence-safe merge of DOI lifecycle + identifiers into
   * submissions.index_status. Existing keys are preserved; visibility is
   * only ever upgraded (never downgraded) by this merge.
   */
  private async persistIndexStatus(
    submissionId: string,
    args: { doi: string | null; zenodoId: string | null; lifecycle: DoiLifecycleRecord }
  ): Promise<void> {
    const nowIso = new Date().toISOString();

    const { data: current } = await this.supabase
      .from('submissions')
      .select('index_status')
      .eq('id', submissionId)
      .single();

    const currentStatus: any = current?.index_status || {
      overall: { visibility: 'NOT_STARTED', last_checked: null }
    };

    const merged: any = { ...currentStatus, doiLifecycle: args.lifecycle };

    if (args.doi && currentStatus.doi?.value !== args.doi) {
      merged.doi = {
        value: args.doi,
        provider: 'zenodo',
        verified_at: nowIso
      };
    }

    if (args.zenodoId && currentStatus.zenodo?.record_id !== args.zenodoId) {
      merged.zenodo = {
        status: 'pending',
        record_id: args.zenodoId,
        checked_at: nowIso
      };
    }

    // Visibility only moves upward from this merge.
    const rank: Record<string, number> = {
      NOT_STARTED: 0,
      PROCESSING: 1,
      PARTIAL: 2,
      FAILED: 2,
      VISIBLE: 3
    };
    const currentVisibility = String(currentStatus.overall?.visibility || 'NOT_STARTED');
    const hasIdentifiers = Boolean(args.doi || args.zenodoId);
    const nextVisibility =
      hasIdentifiers && (rank[currentVisibility] ?? 0) < rank.PROCESSING ? 'PROCESSING' : currentVisibility;
    merged.overall = { visibility: nextVisibility, last_checked: nowIso };

    await this.supabase
      .from('submissions')
      .update({ index_status: merged })
      .eq('id', submissionId);
  }

  /**
   * Advances the DOI lifecycle forward-only; never throws on invalid moves
   * (fail-safe: preserves the existing record instead of corrupting it).
   */
  private safeAdvance(
    record: DoiLifecycleRecord,
    stage: Parameters<typeof DoiLifecycleEngine.advance>[1],
    detail?: string,
    provider?: string
  ): DoiLifecycleRecord {
    try {
      if (!DoiLifecycleEngine.canAdvance(record, stage)) return record;
      return DoiLifecycleEngine.advance(record, stage, detail, provider);
    } catch {
      return record;
    }
  }

  /** Emits a federation event (future: OpenAIRE/OpenAlex subscribers). */
  private emitEvent(
    type: PublicationFederationEventType,
    publicationId: string,
    externalRecordId: string,
    payload?: any
  ): void {
    console.log(`[FEDERATION-EVENT] ${type} publication=${publicationId} record=${externalRecordId}`, payload || '');
  }

  /**
   * Downloads an internal asset (manuscript/galley from storage) as a
   * Buffer. This is an internal file fetch, not an external provider call,
   * so it is a direct fetch (parity with the legacy deposit route).
   */
  private async downloadFile(fileUrl: string): Promise<{ buffer: Buffer; filename: string }> {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`File download failed with status ${response.status} for ${fileUrl}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    let filename = 'manuscript.pdf';
    try {
      const pathname = new URL(fileUrl).pathname;
      const last = decodeURIComponent(pathname.split('/').pop() || '');
      if (last) filename = last;
    } catch {
      // keep default filename
    }
    return { buffer: Buffer.from(arrayBuffer), filename };
  }

  /**
   * Read-only recovery of the ORIGINAL DOI from an existing Zenodo record.
   * Preservation rule: this never generates a new DOI — it only reads back
   * the identifier Zenodo already assigned to the preserved record.
   */
  private async recoverDoiFromZenodo(zenodoId: string): Promise<string | null> {
    try {
      const environment = process.env.ZENODO_ENVIRONMENT || 'sandbox';
      const apiUrl = environment === 'production' ? 'https://zenodo.org/api' : 'https://sandbox.zenodo.org/api';
      const apiToken = process.env.ZENODO_API_TOKEN || process.env.NEXT_PUBLIC_ZENODO_API_TOKEN || '';

      const data = await ProviderRuntimeManager.executeRequest(
        'ZENODO',
        `${apiUrl}/records/${encodeURIComponent(zenodoId)}`,
        {
          method: 'GET',
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
          timeoutMs: 15000,
          retryAttempts: 2,
          retryDelayMs: 400
        }
      );

      const rawDoi = data?.doi || data?.metadata?.doi || data?.pids?.doi?.identifier;
      return PublicationMetadataNormalizer.normalizeDoi(rawDoi) || null;
    } catch {
      return null;
    }
  }

  /** Builds the public record URL for a Zenodo record ID. */
  private zenodoRecordUrl(zenodoId: string): string {
    const environment = process.env.ZENODO_ENVIRONMENT || 'sandbox';
    const host = environment === 'production' ? 'https://zenodo.org' : 'https://sandbox.zenodo.org';
    return `${host}/records/${encodeURIComponent(zenodoId)}`;
  }
}






