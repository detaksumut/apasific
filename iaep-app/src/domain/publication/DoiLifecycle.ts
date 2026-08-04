// src/domain/publication/DoiLifecycle.ts
//
// DOI Lifecycle Tracking (Target #4 — Scholarly Ecosystem Integration).
//
// Tracks the end-to-end publication-to-external-ecosystem workflow stages:
//
//   PUBLISHED              -> article published in the journal (internal)
//   DEPOSIT_REQUEST        -> repository deposit requested (file staged)
//   REPOSITORY_DEPOSIT     -> deposit created + file uploaded to repository (Zenodo)
//   DOI_RECEIVED           -> DOI assigned/confirmed (preserved when pre-existing)
//   METADATA_REGISTRATION  -> metadata registration with scholarly registries (Crossref/ORCID)
//   INDEXING_QUEUE         -> discovery/indexing probes queued (OpenAIRE, etc.)
//   INDEXED                -> publication confirmed discoverable/indexed
//
// The record is persisted inside `submissions.index_status.doiLifecycle`
// (additive — no schema migration required).
//
// CRITICAL DATA PRESERVATION:
//   - The engine only ever ADVANCES stages (forward-only). It never deletes,
//     resets, or rewrites history entries.
//   - `backfillFromExistingIdentifiers` reconstructs a truthful history for
//     articles that already have a DOI / Zenodo record BEFORE this workflow
//     existed, so existing identifiers remain the source of truth.

export const DOI_LIFECYCLE_STAGES = [
  'PUBLISHED',
  'DEPOSIT_REQUEST',
  'REPOSITORY_DEPOSIT',
  'DOI_RECEIVED',
  'METADATA_REGISTRATION',
  'INDEXING_QUEUE',
  'INDEXED'
] as const;

export type DoiLifecycleStage = (typeof DOI_LIFECYCLE_STAGES)[number];

export interface DoiLifecycleHistoryEntry {
  stage: DoiLifecycleStage;
  at: string; // ISO timestamp
  detail?: string;
  provider?: string;
}

export interface DoiLifecycleRecord {
  schemaVersion: '1.0';
  currentStage: DoiLifecycleStage;
  history: DoiLifecycleHistoryEntry[];
}

export class DoiLifecycleEngine {
  /**
   * Position of a stage in the canonical forward order.
   */
  public static stageIndex(stage: DoiLifecycleStage): number {
    return DOI_LIFECYCLE_STAGES.indexOf(stage);
  }

  public static isValidStage(value: unknown): value is DoiLifecycleStage {
    return typeof value === 'string' && (DOI_LIFECYCLE_STAGES as readonly string[]).includes(value);
  }

  /**
   * Creates a new lifecycle record starting at the given stage.
   */
  public static initialize(
    stage: DoiLifecycleStage = 'PUBLISHED',
    detail?: string,
    provider?: string
  ): DoiLifecycleRecord {
    return {
      schemaVersion: '1.0',
      currentStage: stage,
      history: [{ stage, at: new Date().toISOString(), detail, provider }]
    };
  }


  /**
   * Advances the lifecycle to `stage` (forward-only). Returns a NEW record;
   * the input is never mutated. Rejects backward transitions (fail-closed).
   */
  public static advance(
    record: DoiLifecycleRecord,
    stage: DoiLifecycleStage,
    detail?: string,
    provider?: string
  ): DoiLifecycleRecord {
    if (!DoiLifecycleEngine.isValidStage(stage)) {
      throw new Error(`DoiLifecycleEngine: unknown stage '${stage}'`);
    }
    if (!DoiLifecycleEngine.canAdvance(record, stage)) {
      throw new Error(
        `DoiLifecycleEngine: backward transition rejected (${record.currentStage} -> ${stage})`
      );
    }

    // Idempotent re-emit of the current stage: no duplicate history entry.
    if (stage === record.currentStage) {
      return {
        schemaVersion: '1.0',
        currentStage: record.currentStage,
        history: [...record.history]
      };
    }

    return {
      schemaVersion: '1.0',
      currentStage: stage,
      history: [...record.history, { stage, at: new Date().toISOString(), detail, provider }]
    };
  }

  /**
   * Backfills a lifecycle record for an EXISTING publication that already
   * carries identifiers (DOI and/or Zenodo record) from before this
   * workflow existed. Existing identifiers are preserved as source of
   * truth; history entries are explicitly marked as backfilled and no
   * external side effects occur.
   */
  public static backfillFromExistingIdentifiers(input: {
    doi?: string | null;
    zenodoId?: string | null;
    publishedAt?: string | null;
  }): DoiLifecycleRecord {
    const at = input.publishedAt || new Date().toISOString();
    const history: DoiLifecycleHistoryEntry[] = [
      { stage: 'PUBLISHED', at, detail: 'Backfilled from existing publication record' }
    ];

    if (input.zenodoId) {
      history.push({
        stage: 'REPOSITORY_DEPOSIT',
        at,
        detail: `Backfilled from existing Zenodo record ${input.zenodoId}`,
        provider: 'zenodo'
      });
    }

    if (input.doi) {
      history.push({
        stage: 'DOI_RECEIVED',
        at,
        detail: `Backfilled from existing DOI ${input.doi} (preserved, never regenerated)`,
        provider: 'zenodo'
      });
    }

    const currentStage = history[history.length - 1].stage;
    return { schemaVersion: '1.0', currentStage, history };
  }

  /**
   * Normalizes/validates a raw persisted record (defensive). Returns null
   * when the payload is unusable so callers can fall back safely without
   * corrupting existing data.
   */
  public static fromRaw(raw: any): DoiLifecycleRecord | null {
    if (!raw || typeof raw !== 'object') return null;
    if (!DoiLifecycleEngine.isValidStage(raw.currentStage)) return null;
    if (!Array.isArray(raw.history)) return null;

    const history = raw.history
      .filter((entry: any) => entry && DoiLifecycleEngine.isValidStage(entry.stage))
      .map((entry: any) => ({
        stage: entry.stage as DoiLifecycleStage,
        at: typeof entry.at === 'string' ? entry.at : new Date(0).toISOString(),
        detail: typeof entry.detail === 'string' ? entry.detail : undefined,
        provider: typeof entry.provider === 'string' ? entry.provider : undefined
      }));

    return { schemaVersion: '1.0', currentStage: raw.currentStage, history };
  }

  /**
   * Returns true when advancing from the record's current stage to `stage`
   * is a valid forward move. Equal stages are allowed (idempotent re-emit)
   * but produce no new history entry. Backward moves are always rejected.
   */
  public static canAdvance(record: DoiLifecycleRecord, stage: DoiLifecycleStage): boolean {
    if (!record || !DoiLifecycleEngine.isValidStage(record.currentStage)) return false;
    return DoiLifecycleEngine.stageIndex(stage) >= DoiLifecycleEngine.stageIndex(record.currentStage);
  }
}
