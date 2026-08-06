import { NextResponse } from 'next/server';
import { JournalMetricsService } from '@/services/metrics/JournalMetricsService';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const journalId = url.searchParams.get('journalId');

  if (!journalId) {
    return NextResponse.json({ error: 'journalId query parameter wajib diisi.' }, { status: 400 });
  }

  try {
    const ops = await JournalMetricsService.getOperationalMetrics(journalId);
    const qls = await JournalMetricsService.getQualityMetrics(journalId);
    const health = await JournalMetricsService.getJournalHealthScore(journalId);

    return NextResponse.json({
      success: true,
      journal_id: journalId,
      health_score: health.score,
      health_breakdown: health.breakdown,
      overview: {
        total_submissions: ops.total_submissions,
        published_count: ops.published_count,
        acceptance_rate: ops.acceptance_rate,
        avg_review_days: ops.avg_review_days,
        total_citations: qls.total_citations,
        warnings: [...ops.warnings, ...qls.warnings]
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
