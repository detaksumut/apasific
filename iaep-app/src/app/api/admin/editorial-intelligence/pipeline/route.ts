import { NextResponse } from 'next/server';
import { EditorialIntelligenceService } from '@/services/metrics/EditorialIntelligenceService';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const journalId = url.searchParams.get('journalId');

  if (!journalId) {
    return NextResponse.json({ error: 'journalId query parameter wajib diisi.' }, { status: 400 });
  }

  try {
    const risks = await EditorialIntelligenceService.calculateManuscriptRisks(journalId);
    const advisory = await EditorialIntelligenceService.generateAIEditorialAdvisory(journalId);

    return NextResponse.json({
      success: true,
      journal_id: journalId,
      advisory,
      risks: risks.slice(0, 10) // Return top 10 most critical/at risk submissions
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
