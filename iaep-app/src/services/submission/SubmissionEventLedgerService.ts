// src/services/submission/SubmissionEventLedgerService.ts
import { createClient } from '@/utils/supabase/server';
import { 
  SubmissionEventType, 
  SubmissionEventRecord, 
  PublicationMetadataVersion 
} from '@/domain/submission/SubmissionEventLedger';

export class SubmissionEventLedgerService {
  /**
   * Appends an immutable event to the submission event ledger.
   * Hard DB trigger blocks any UPDATE or DELETE on this ledger.
   */
  public static async recordEvent(params: {
    submissionId: string;
    eventType: SubmissionEventType;
    eventPayload?: Record<string, any>;
    actorId?: string;
    actorRole?: string;
  }): Promise<{ success: boolean; event?: SubmissionEventRecord; error?: string }> {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const insertData = {
      submission_id: params.submissionId,
      event_type: params.eventType,
      event_payload: params.eventPayload || {},
      actor_id: params.actorId || null,
      actor_role: params.actorRole || 'system',
      created_at: now
    };

    const { data, error } = await supabase
      .from('submission_events')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      event: {
        id: data.id,
        submissionId: data.submission_id,
        eventType: data.event_type as SubmissionEventType,
        eventPayload: data.event_payload || {},
        actorId: data.actor_id,
        actorRole: data.actor_role,
        createdAt: data.created_at
      }
    };
  }

  /**
   * Retrieves the full immutable historical timeline of a submission.
   */
  public static async getEventTimeline(submissionId: string): Promise<SubmissionEventRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('submission_events')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      submissionId: row.submission_id,
      eventType: row.event_type as SubmissionEventType,
      eventPayload: row.event_payload || {},
      actorId: row.actor_id,
      actorRole: row.actor_role,
      createdAt: row.created_at
    }));
  }

  /**
   * Gets the immutable first submission timestamp for a manuscript.
   */
  public static async getOriginalSubmittedAt(submissionId: string): Promise<string | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('submission_events')
      .select('created_at')
      .eq('submission_id', submissionId)
      .eq('event_type', 'SUBMISSION_CREATED')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data.created_at;
  }

  /**
   * Records a new publication metadata version using the Superseded Model.
   * Marks previous version as superseded without modifying historical event timestamps.
   */
  public static async publishOrUpdateMetadataVersion(params: {
    submissionId: string;
    versionNumber: string; // e.g. "1.0", "1.1"
    volume?: string;
    issue?: string;
    edition?: string;
    pageRange?: string;
    doi?: string;
    changeReason?: string;
    actorId?: string;
  }): Promise<{ success: boolean; version?: PublicationMetadataVersion; error?: string }> {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // 1. Fetch current active version if any
    const { data: currentVersion } = await supabase
      .from('publication_metadata_versions')
      .select('*')
      .eq('submission_id', params.submissionId)
      .eq('is_current', true)
      .maybeSingle();

    // 2. If existing active version, mark it as superseded
    if (currentVersion) {
      await supabase
        .from('publication_metadata_versions')
        .update({
          is_current: false,
          superseded_at: now
        })
        .eq('id', currentVersion.id);
    }

    // 3. Insert new version
    const insertPayload = {
      submission_id: params.submissionId,
      version_number: params.versionNumber,
      volume: params.volume || null,
      issue: params.issue || null,
      edition: params.edition || null,
      page_range: params.pageRange || null,
      doi: params.doi || null,
      is_current: true,
      change_reason: params.changeReason || (currentVersion ? 'Metadata Revision' : 'Initial Publication'),
      previous_payload: currentVersion ? {
        volume: currentVersion.volume,
        issue: currentVersion.issue,
        edition: currentVersion.edition,
        page_range: currentVersion.page_range,
        doi: currentVersion.doi,
        version: currentVersion.version_number
      } : {},
      actor_id: params.actorId || null,
      created_at: now
    };

    const { data: newVersion, error } = await supabase
      .from('publication_metadata_versions')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 4. Record corresponding event in the immutable ledger
    await this.recordEvent({
      submissionId: params.submissionId,
      eventType: currentVersion ? 'CORRECTION_ISSUED' : 'PUBLISHED',
      eventPayload: {
        version: params.versionNumber,
        changeReason: params.changeReason,
        metadataSnapshot: {
          volume: params.volume,
          issue: params.issue,
          edition: params.edition,
          doi: params.doi
        }
      },
      actorId: params.actorId,
      actorRole: 'editor'
    });

    return {
      success: true,
      version: {
        id: newVersion.id,
        submissionId: newVersion.submission_id,
        versionNumber: newVersion.version_number,
        volume: newVersion.volume,
        issue: newVersion.issue,
        edition: newVersion.edition,
        pageRange: newVersion.page_range,
        doi: newVersion.doi,
        isCurrent: newVersion.is_current,
        supersededAt: newVersion.superseded_at,
        changeReason: newVersion.change_reason,
        previousPayload: newVersion.previous_payload,
        actorId: newVersion.actor_id,
        createdAt: newVersion.created_at
      }
    };
  }

  /**
   * Retrieves all metadata versions for an article (complete historical version chain).
   */
  public static async getMetadataVersions(submissionId: string): Promise<PublicationMetadataVersion[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('publication_metadata_versions')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      submissionId: row.submission_id,
      versionNumber: row.version_number,
      volume: row.volume,
      issue: row.issue,
      edition: row.edition,
      pageRange: row.page_range,
      doi: row.doi,
      isCurrent: row.is_current,
      supersededAt: row.superseded_at,
      changeReason: row.change_reason,
      previousPayload: row.previous_payload,
      actorId: row.actor_id,
      createdAt: row.created_at
    }));
  }
}
