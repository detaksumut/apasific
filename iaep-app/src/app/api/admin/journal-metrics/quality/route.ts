import { NextResponse } from 'next/server';
import { JournalMetricsService } from '@/services/metrics/JournalMetricsService';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const journalId = url.searchParams.get('journalId');

  if (!journalId) {
    return NextResponse.json({ error: 'journalId query parameter wajib diisi.' }, { status: 400 });
  }

  try {
    const qls = await JournalMetricsService.getQualityMetrics(journalId);
    return NextResponse.json({
      success: true,
      journal_id: journalId,
      quality: qls
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
