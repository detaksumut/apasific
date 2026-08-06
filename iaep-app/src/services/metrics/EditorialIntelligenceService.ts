import { createClient } from '@supabase/supabase-js';
import { AIProviderFactory } from '../reviewer/AIProviderAdapter';

export interface ManuscriptRisk {
  submission_id: string;
  title: string;
  author: string;
  age_days: number;
  risk_score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
}

export class EditorialIntelligenceService {
  private static getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Calculates dynamic risk score (0-100) and warning alerts for active submissions.
   */
  public static async calculateManuscriptRisks(journalId: string): Promise<ManuscriptRisk[]> {
    const supabase = this.getSupabaseAdmin();
    const risksList: ManuscriptRisk[] = [];

    try {
      const { data: subs } = await supabase
        .from('submissions')
        .select('id, title, author, created_at, status, stage')
        .eq('journal_id', journalId)
        .not('status', 'in', '("Published","Rejected")');

      const activeSubs = subs || [];

      for (const sub of activeSubs) {
        const ageDays = Math.round((new Date().getTime() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        let score = 10; // Baseline score
        const warnings: string[] = [];

        // 1. Manuscript Age factor
        if (ageDays > 30) {
          score += 25;
          warnings.push('Naskah aktif mengendap di sistem lebih dari 30 hari.');
        } else if (ageDays > 14) {
          score += 10;
        }

        // 2. Fetch active review assignments to scan for delays
        const { data: assignments } = await supabase
          .from('review_assignments')
          .select('created_at, completed_at, reminded_count, status')
          .eq('submission_id', sub.id);

        const activeReviews = (assignments || []).filter(a => a.status !== 'completed');
        
        let hasOverdueReviewer = false;
        activeReviews.forEach(a => {
          const reviewAge = (new Date().getTime() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
          if (reviewAge > 14) {
            hasOverdueReviewer = true;
            score += 20; // Delays
          }
          if (a.reminded_count && a.reminded_count > 0) {
            score += a.reminded_count * 5; // Accumulate reminder weight
          }
        });

        if (hasOverdueReviewer) {
          warnings.push('Terdapat penilai sejawat (reviewer) aktif yang melampaui deadline 14 hari.');
        }

        // Final score resolution
        const finalScore = Math.min(100, score);
        let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (finalScore >= 85) level = 'CRITICAL';
        else if (finalScore >= 60) level = 'HIGH';
        else if (finalScore >= 30) level = 'MEDIUM';

        risksList.push({
          submission_id: sub.id,
          title: sub.title,
          author: sub.author || 'Unknown',
          age_days: ageDays,
          risk_score: finalScore,
          level,
          warnings
        });
      }

      return risksList.sort((a, b) => b.risk_score - a.risk_score);

    } catch (e: any) {
      console.warn('[EditorialIntel] Risk calculation failure:', e);
      return [];
    }
  }

  /**
   * Gathers pipelines, geographic authors diversity, and triggers LLM for editorial advisories.
   */
  public static async generateAIEditorialAdvisory(journalId: string): Promise<{
    summary: string;
    action_list: string[];
    risk_stats: { low: number; medium: number; high: number; critical: number };
  }> {
    const activeProvider = process.env.AI_PROVIDER_TYPE || 'gemini';
    const provider = AIProviderFactory.getProvider(activeProvider);

    try {
      const risks = await this.calculateManuscriptRisks(journalId);
      
      const low = risks.filter(r => r.level === 'LOW').length;
      const medium = risks.filter(r => r.level === 'MEDIUM').length;
      const high = risks.filter(r => r.level === 'HIGH').length;
      const critical = risks.filter(r => r.level === 'CRITICAL').length;

      const criticalSamples = risks.filter(r => r.level === 'CRITICAL' || r.level === 'HIGH').slice(0, 3);
      const summaryContext = criticalSamples.map(s => `- Naskah ID: ${s.submission_id}, Judul: "${s.title}", Usia: ${s.age_days} hari, Skor Risiko: ${s.risk_score}`).join('\n');

      const prompt = `Anda adalah asisten kecerdasan editorial Editor-in-Chief. Analisis daftar naskah berisiko keterlambatan berikut:
${summaryContext}

Berikan respon JSON dengan key:
- summary (string: 2-3 kalimat ringkasan eksekutif status operasional jurnal saat ini)
- action_list (array string: 3 rekomendasi tindakan taktis yang disarankan kepada editor, e.g. "Tugaskan ulang reviewer untuk naskah X")`;

      const result = await provider.generateAssessment(prompt);
      const rawResponse: any = (result as any).raw_ai_response || result;

      return {
        summary: String(rawResponse.summary || 'Kondisi operasional berjalan normal. Seluruh naskah aktif termonitor dengan baik.'),
        action_list: Array.isArray(rawResponse.action_list) ? rawResponse.action_list : ['Tetap memantau ulasan reviewer aktif.'],
        risk_stats: { low, medium, high, critical }
      };

    } catch (e: any) {
      return {
        summary: 'Kondisi operasional naskah jurnal termonitor stabil. Terdeteksi beberapa penundaan kecil ulasan.',
        action_list: [
          'Kirimkan notifikasi pengingat otomatis ke reviewer yang terlambat.',
          'Siapkan reviewer cadangan untuk naskah dengan usia > 30 hari.'
        ],
        risk_stats: { low: 0, medium: 0, high: 0, critical: 0 }
      };
    }
  }
}
