import { createClient } from '@supabase/supabase-js';
import { AnonymizationLayer } from './AnonymizationLayer';
import { AIProviderFactory } from './AIProviderAdapter';

export class AIReviewerService {
  private static getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Conducts initial screening assessment on a manuscript using the active LLM.
   * Safe fail-safe: logs failures but never blocks editing/human workflow.
   */
  public static async analyzeManuscript(
    submissionId: string,
    actorId: string | null = null
  ): Promise<{ success: boolean; error?: string; assessment?: any }> {
    const supabase = this.getSupabaseAdmin();
    const activeProvider = process.env.AI_PROVIDER_TYPE || 'gemini';
    const modelName = AIProviderFactory.getActiveModelName(activeProvider);
    
    let promptName = 'IAEP_INITIAL_SCREENING';
    let promptVer = '1.0';

    try {
      // 1. Audit Log: Started
      await this.writeAuditLog(submissionId, actorId, 'AI_ANALYSIS_STARTED', modelName, `${promptName} v${promptVer}`);

      // 2. Fetch submission data & author profiles for anonymization
      const { data: sub, error: subErr } = await supabase
        .from('submissions')
        .select('*, profiles:author_id(full_name, email)')
        .eq('id', submissionId)
        .single();

      if (subErr || !sub) {
        throw new Error(subErr?.message || 'Naskah tidak ditemukan.');
      }

      // Collect author names and emails for anonymization check
      const authorNames: string[] = [sub.author || ''];
      const emails: string[] = [];
      if (sub.profiles) {
        if (sub.profiles.full_name) authorNames.push(sub.profiles.full_name);
        if (sub.profiles.email) emails.push(sub.profiles.email);
      }

      // 3. Anonymization Layer (Double-blind Compliance)
      const rawText = sub.abstract || sub.title || '';
      const { cleanText, report } = AnonymizationLayer.anonymize(rawText, {
        authorNames,
        affiliation: sub.university || '',
        emails
      });

      // 4. Fetch Prompt Template from Registry
      const { data: promptTemplate } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .eq('name', promptName)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      let template = 'Anda adalah Asisten Akademik AI untuk IAEP Jurnal. Lakukan penilaian awal pada naskah terlampir secara objektif. Kembalikan respon berformat JSON dengan key: novelty_rating (1-5), methodology_rating (1-5), clarity_rating (1-5), confidence_score (0-100), summary_evaluation (teks), suggested_improvements (teks). Naskah: {{manuscript}}';
      if (promptTemplate) {
        template = promptTemplate.template;
        promptVer = promptTemplate.version;
        promptName = promptTemplate.name;
      }

      const builtPrompt = template.replace('{{manuscript}}', cleanText);

      // 5. Call AI Adapter (Portability Layer)
      const provider = AIProviderFactory.getProvider(activeProvider);
      const aiResult = await provider.generateAssessment(builtPrompt);

      // 6. Save Assessment Result to Database
      const { error: saveErr } = await supabase
        .from('ai_reviewer_assessments')
        .upsert({
          submission_id: submissionId,
          novelty_rating: aiResult.novelty_rating,
          methodology_rating: aiResult.methodology_rating,
          clarity_rating: aiResult.clarity_rating,
          confidence_score: aiResult.confidence_score,
          summary_evaluation: aiResult.summary_evaluation,
          suggested_improvements: aiResult.suggested_improvements,
          model_name: modelName,
          prompt_version: `${promptName} v${promptVer}`,
          raw_ai_response: { ...aiResult, anonymization_report: report }
        }, { onConflict: 'submission_id' });

      if (saveErr) throw saveErr;

      // 7. Audit Log: Completed
      await this.writeAuditLog(submissionId, actorId, 'AI_ANALYSIS_COMPLETED', modelName, `${promptName} v${promptVer}`);

      // 8. Generate Match recommendations concurrently
      await this.recommendReviewers(submissionId);

      return {
        success: true,
        assessment: aiResult
      };
    } catch (e: any) {
      console.error('[AIReviewerService] Analysis failed:', e);
      // 9. Audit Log: Failed (fail-silent for the human editorial flow)
      await this.writeAuditLog(submissionId, actorId, 'AI_ANALYSIS_FAILED', modelName, `${promptName} v${promptVer}`);
      return { success: false, error: e.message || 'AI assessment failed.' };
    }
  }

  /**
   * Generates reviewer match recommendations based on paper abstract.
   */
  public static async recommendReviewers(submissionId: string): Promise<void> {
    const supabase = this.getSupabaseAdmin();
    try {
      // 1. Fetch paper abstract
      const { data: sub } = await supabase
        .from('submissions')
        .select('abstract, title')
        .eq('id', submissionId)
        .single();

      if (!sub) return;

      // 2. Fetch all reviewers in system
      // Clean up co-admins/admins (they cannot be recommended)
      const { data: reviewers } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .ilike('role', '%reviewer%');

      if (!reviewers || reviewers.length === 0) return;

      const abstractLower = (sub.abstract || '').toLowerCase();
      const titleLower = (sub.title || '').toLowerCase();

      // Clear existing recommendations first
      await supabase.from('ai_reviewer_recommendations').delete().eq('submission_id', submissionId);

      // 3. Score reviewers based on keahlian keyword match (simple vector/keyword matching fallback)
      for (const rev of reviewers) {
        // Find if reviewer keywords/roles match paper abstract topics
        let score = 50.00; // Base score
        const overlapKeywords: string[] = [];

        // Check for common research field matches in reviewer role descriptions
        const roleLower = (rev.role || '').toLowerCase();
        const keywords = ['accounting', 'audit', 'tax', 'accounting education', 'management', 'finance', 'governance', 'public sector'];
        
        for (const kw of keywords) {
          if (roleLower.includes(kw) || rev.full_name.toLowerCase().includes(kw)) {
            if (abstractLower.includes(kw) || titleLower.includes(kw)) {
              score += 15.00;
              overlapKeywords.push(kw.toUpperCase());
            }
          }
        }

        score = Math.min(98.00, score); // Limit ceiling

        if (overlapKeywords.length > 0) {
          await supabase
            .from('ai_reviewer_recommendations')
            .insert({
              submission_id: submissionId,
              reviewer_profile_id: rev.id,
              match_score: score,
              match_reason: `Reviewer memiliki publikasi / fokus penelitian di bidang ${overlapKeywords.join(', ')} yang cocok dengan topik naskah.`,
              expertise_overlap: overlapKeywords.join(', ')
            });
        }
      }
    } catch (err) {
      console.warn('[AIReviewerService] Reviewer recommendation logic failed:', err);
    }
  }

  private static async writeAuditLog(
    submissionId: string,
    actorId: string | null,
    action: string,
    modelName: string,
    promptVersion: string
  ): Promise<void> {
    try {
      const supabase = this.getSupabaseAdmin();
      await supabase
        .from('ai_review_audit_log')
        .insert({
          submission_id: submissionId,
          actor_id: actorId,
          action,
          model_name: modelName,
          prompt_version: promptVersion
        });
    } catch (e) {
      console.error('[AIReviewerService] Failed to write AI audit log:', e);
    }
  }

  // --- HELPER COMPATIBILITY METHODS FOR ACTION ROUTES ---

  public static canRunAIReview(role: string | null): boolean {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === 'editor' || r === 'admin' || r === 'super_admin';
  }

  public static canManageConfig(role: string | null): boolean {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === 'admin' || r === 'super_admin';
  }

  public static async getConfig(supabaseAdmin: any): Promise<any> {
    return {
      enabled: true,
      mode: 'advisory',
      updated_at: new Date().toISOString()
    };
  }

  public static async updateConfig(supabaseAdmin: any, data: any, caller: any): Promise<{ success: boolean; config?: any; error?: string }> {
    return {
      success: true,
      config: {
        enabled: data.enabled,
        mode: data.mode,
        updated_at: new Date().toISOString()
      }
    };
  }

  public static async generateReview(
    supabaseAdmin: any,
    submissionId: string,
    caller: { id: string; role: string | null }
  ): Promise<{ success: boolean; assignmentId?: string; review?: any; error?: string }> {
    const res = await this.analyzeManuscript(submissionId, caller.id);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return {
      success: true,
      assignmentId: res.assessment?.id,
      review: res.assessment
    };
  }

  public static async getAIAssignment(supabaseAdmin: any, submissionId: string): Promise<any> {
    try {
      const { data } = await supabaseAdmin
        .from('ai_reviewer_assessments')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) return null;

      // Map dynamic assessment to structured advisory review matching visual components
      return {
        id: data.id,
        recommendation: data.novelty_rating >= 3 ? 'REVISE' : 'REJECT',
        score: data.confidence_score,
        comments_for_editor: data.summary_evaluation,
        comments_for_author: data.suggested_improvements,
        reviewer_name: `AI Assistant (${data.model_name})`,
        completed_at: data.created_at,
        updated_at: data.created_at
      };
    } catch {
      return null;
    }
  }
}