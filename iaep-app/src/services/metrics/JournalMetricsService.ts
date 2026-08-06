import { createClient } from '@supabase/supabase-js';
import { JournalHealthCalculator } from './JournalHealthCalculator';

export class JournalMetricsService {
  private static getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Retrieves operational metrics only (speed, volumes, rates)
   */
  public static async getOperationalMetrics(journalId: string): Promise<any> {
    const supabase = this.getSupabaseAdmin();

    try {
      // 1. Total Submissions count
      const { data: subs } = await supabase
        .from('submissions')
        .select('status, created_at, published_at')
        .eq('journal_id', journalId);

      const records = subs || [];
      const total = records.length;
      
      const published = records.filter(r => r.status === 'Published').length;
      const rejected = records.filter(r => r.status === 'Rejected').length;
      
      const acceptanceRate = total > 0 ? (published / total) * 100 : 0;
      const rejectionRate = total > 0 ? (rejected / total) * 100 : 0;

      // 2. Average Review Duration (Fetch review assignments)
      const { data: assignments } = await supabase
        .from('review_assignments')
        .select('created_at, completed_at');

      let totalReviewDays = 0;
      let completedReviewCount = 0;

      (assignments || []).forEach(a => {
        if (a.completed_at && a.created_at) {
          const diff = new Date(a.completed_at).getTime() - new Date(a.created_at).getTime();
          totalReviewDays += diff / (1000 * 60 * 60 * 24);
          completedReviewCount++;
        }
      });

      const avgReviewDays = completedReviewCount > 0 ? totalReviewDays / completedReviewCount : 18; // Default fallback to 18 days

      // Calculate Trends (Current month vs Last month)
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const currentMonthSubs = records.filter(r => r.created_at >= currentMonthStart).length;
      const lastMonthSubs = records.filter(r => r.created_at >= lastMonthStart && r.created_at < currentMonthStart).length;

      let subTrend = 'Stable';
      if (currentMonthSubs > lastMonthSubs) subTrend = `+${Math.round(((currentMonthSubs - lastMonthSubs) / (lastMonthSubs || 1)) * 100)}%`;
      else if (currentMonthSubs < lastMonthSubs) subTrend = `-${Math.round(((lastMonthSubs - currentMonthSubs) / (lastMonthSubs || 1)) * 100)}%`;

      // 3. Count Active Reviewers
      const { data: reviewers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'reviewer');

      // 4. Warning Level Checks (Warning Engine)
      const warnings: string[] = [];
      if (avgReviewDays > 30) warnings.push('REVIEW_TIME_WARNING: Average review duration is above 30 days.');
      if (avgReviewDays > 45) warnings.push('REVIEW_TIME_CRITICAL: Average review duration is above 45 days.');
      if (acceptanceRate > 80) warnings.push('RIGOR_WARNING: Acceptance rate is abnormally high (>80%).');

      return {
        total_submissions: total,
        published_count: published,
        rejected_count: rejected,
        acceptance_rate: Math.round(acceptanceRate),
        rejection_rate: Math.round(rejectionRate),
        avg_review_days: Math.round(avgReviewDays),
        active_reviewers: reviewers?.length || 0,
        submission_trend: subTrend,
        warnings
      };
    } catch (e: any) {
      console.error('[MetricsService] Operations read error:', e);
      return { acceptance_rate: 0, avg_review_days: 18, active_reviewers: 0, warnings: [] };
    }
  }

  /**
   * Retrieves quality metrics only (DOI coverages, citation growth, index status)
   */
  public static async getQualityMetrics(journalId: string): Promise<any> {
    const supabase = this.getSupabaseAdmin();

    try {
      const { data: subs } = await supabase
        .from('submissions')
        .select('id, doi, profiles:author_id(orcid)')
        .eq('journal_id', journalId)
        .eq('status', 'Published');

      const records = subs || [];
      const totalPublished = records.length;

      const withDoi = records.filter(r => r.doi).length;
      const doiPct = totalPublished > 0 ? (withDoi / totalPublished) * 100 : 0;

      const withOrcid = records.filter(r => {
        const profile = r.profiles;
        if (!profile) return false;
        const orcid = Array.isArray(profile) ? profile[0]?.orcid : (profile as any).orcid;
        return Boolean(orcid);
      }).length;
      const orcidPct = totalPublished > 0 ? (withOrcid / totalPublished) * 100 : 0;

      // Zenodo coverage
      const { data: zenodos } = await supabase
        .from('publication_provider_registry')
        .select('id')
        .eq('provider_name', 'zenodo')
        .eq('status', 'COMPLETED');

      const zenodoCount = zenodos?.length || 0;
      const zenodoPct = totalPublished > 0 ? (zenodoCount / totalPublished) * 100 : 0;

      // Citations aggregate
      const { data: citationLogs } = await supabase
        .from('article_citations_tracker')
        .select('citation_count');
      
      const totalCitations = (citationLogs || []).reduce((a, b) => a + b.citation_count, 0);

      // Warning Engine checks
      const warnings: string[] = [];
      if (doiPct < 80) warnings.push('DOI_COVERAGE_NEEDS_ACTION: DOI coverage is below 80%.');
      if (orcidPct < 50) warnings.push('ORCID_COVERAGE_NEEDS_ACTION: ORCID coverage is below 50%.');

      return {
        doi_coverage_percentage: Math.round(doiPct),
        orcid_coverage_percentage: Math.round(orcidPct),
        zenodo_coverage_percentage: Math.min(100, Math.round(zenodoPct)),
        total_citations: totalCitations,
        warnings
      };
    } catch (e: any) {
      console.error('[MetricsService] Quality read error:', e);
      return { doi_coverage_percentage: 0, total_citations: 0, warnings: [] };
    }
  }

  /**
   * Orchestrates health calculations across operations and quality scores
   */
  public static async getJournalHealthScore(journalId: string, customWeights?: any): Promise<any> {
    const ops = await this.getOperationalMetrics(journalId);
    const qls = await this.getQualityMetrics(journalId);

    const calc = new JournalHealthCalculator(customWeights);
    const merged = { ...ops, ...qls };

    return calc.calculateHealthScore(merged);
  }
}
