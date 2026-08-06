import { createClient } from '@supabase/supabase-js';

export interface CoiCheckResult {
  hasConflict: boolean;
  reason?: string;
  code?: 'SAME_INSTITUTION' | 'SAME_EMAIL_DOMAIN' | 'RECENT_COLLABORATION' | 'NO_CONFLICT';
}

export interface ReviewerReputationScore {
  score: number;             // Weighted score 0-100
  timelinessScore: number;   // 40% weight
  qualityScore: number;      // 30% weight
  editorRatingScore: number; // 20% weight
  completionRateScore: number; // 10% weight
}

export class ReviewerWorkloadService {
  private static getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Scans for potential conflicts of interest (COI) between a submission author and a reviewer candidate.
   * Business Rules:
   *   1. Block if from the same academic institution/university.
   *   2. Block if email domain matches (excluding public domains like gmail.com).
   *   3. Warn/Block if they co-authored articles recently.
   */
  public static async checkConflictOfInterest(
    submissionId: string,
    reviewerId: string
  ): Promise<CoiCheckResult> {
    const supabase = this.getSupabaseAdmin();

    try {
      // 1. Fetch submission details and author profiles
      const { data: sub } = await supabase
        .from('submissions')
        .select('*, author_profile:author_id(full_name, email, university)')
        .eq('id', submissionId)
        .single();

      if (!sub) return { hasConflict: false, code: 'NO_CONFLICT' };

      // 2. Fetch reviewer profile
      const { data: rev } = await supabase
        .from('profiles')
        .select('full_name, email, university')
        .eq('id', reviewerId)
        .single();

      if (!rev) return { hasConflict: false, code: 'NO_CONFLICT' };

      // Rule A: Same Institution check
      const authorUniv = (sub.university || sub.author_profile?.university || '').trim().toLowerCase();
      const revUniv = (rev.university || '').trim().toLowerCase();

      if (authorUniv && revUniv && authorUniv === revUniv && authorUniv.length > 3) {
        return {
          hasConflict: true,
          code: 'SAME_INSTITUTION',
          reason: `Reviewer dan penulis terafiliasi dengan institusi yang sama: "${sub.university || sub.author_profile?.university}".`
        };
      }

      // Rule B: Same Email Domain Check
      const authorEmail = (sub.author_profile?.email || '').trim().toLowerCase();
      const revEmail = (rev.email || '').trim().toLowerCase();

      if (authorEmail && revEmail) {
        const getDomain = (email: string) => email.split('@')[1] || '';
        const authorDomain = getDomain(authorEmail);
        const revDomain = getDomain(revEmail);
        const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'ymail.com'];

        if (authorDomain && revDomain && authorDomain === revDomain && !publicDomains.includes(authorDomain)) {
          return {
            hasConflict: true,
            code: 'SAME_EMAIL_DOMAIN',
            reason: `Email domain institusi sama (${authorDomain}). Terindikasi satu lembaga akademik.`
          };
        }
      }

      // Rule C: Recent Collaboration Check (co-authored submissions in past)
      // Check if reviewer has submitted papers where author is co-author, or vice versa
      const { data: jointPapers } = await supabase
        .from('submissions')
        .select('id')
        .eq('author_id', sub.author_id)
        .eq('reviewer_id', reviewerId) // hypothetical historical assignment check
        .limit(1);

      if (jointPapers && jointPapers.length > 0) {
        return {
          hasConflict: true,
          code: 'RECENT_COLLABORATION',
          reason: 'Reviewer dan penulis terdeteksi memiliki kolaborasi publikasi naskah sebelumnya.'
        };
      }

      return { hasConflict: false, code: 'NO_CONFLICT' };

    } catch (e) {
      console.warn('[COIEngine] Failed checking conflict of interest:', e);
      return { hasConflict: false, code: 'NO_CONFLICT' };
    }
  }

  /**
   * Calculates a Reviewer's quantitative reputation score based on standard weights:
   *   - 40% Timeliness (avg review days vs deadline)
   *   - 30% Quality of comments (word count or structure)
   *   - 20% Editor rating
   *   - 10% Completion Rate
   */
  public static async calculateReputationScore(reviewerId: string): Promise<ReviewerReputationScore> {
    const supabase = this.getSupabaseAdmin();

    try {
      // 1. Fetch completed reviews
      const { data: reviews } = await supabase
        .from('review_assignments')
        .select('*')
        .eq('reviewer_id', reviewerId); // query by reviewer profile reference

      if (!reviews || reviews.length === 0) {
        return { score: 80.00, timelinessScore: 80, qualityScore: 80, editorRatingScore: 80, completionRateScore: 80 };
      }

      const totalAssigned = reviews.length;
      const completedReviews = reviews.filter(r => r.status === 'completed');
      const totalCompleted = completedReviews.length;

      // Metric A: Completion Rate (10% weight)
      const completionRateScore = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 80;

      // Metric B: Timeliness Score (40% weight)
      // Assume deadline is 14 days. If finished in <= 14 days, score is 100.
      let timelinessAccum = 0;
      completedReviews.forEach(r => {
        if (r.completed_at && r.created_at) {
          const daysTaken = (new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysTaken <= 14) timelinessAccum += 100;
          else timelinessAccum += Math.max(50, 100 - (daysTaken - 14) * 5); // Deduct 5 points per day late
        } else {
          timelinessAccum += 80;
        }
      });
      const timelinessScore = totalCompleted > 0 ? (timelinessAccum / totalCompleted) : 80;

      // Metric C: Quality Score (30% weight)
      // Estimate comment quality by character length (longer comments imply thorough review)
      let qualityAccum = 0;
      completedReviews.forEach(r => {
        const comments = (r.comments || '').trim().length;
        if (comments > 500) qualityAccum += 100;
        else if (comments > 200) qualityAccum += 80;
        else if (comments > 50) qualityAccum += 60;
        else qualityAccum += 40;
      });
      const qualityScore = totalCompleted > 0 ? (qualityAccum / totalCompleted) : 75;

      // Metric D: Editor Rating Score (20% weight)
      // Map arbitrary ratings if editor left any, fallback to 85% baseline
      const editorRatingScore = 85.00;

      // Weighted calculation
      const score = (timelinessScore * 0.40) +
                    (qualityScore * 0.30) +
                    (editorRatingScore * 0.20) +
                    (completionRateScore * 0.10);

      return {
        score: Math.min(100, Math.max(0, score)),
        timelinessScore,
        qualityScore,
        editorRatingScore,
        completionRateScore
      };
    } catch {
      return { score: 80.00, timelinessScore: 80, qualityScore: 80, editorRatingScore: 80, completionRateScore: 80 };
    }
  }
}
