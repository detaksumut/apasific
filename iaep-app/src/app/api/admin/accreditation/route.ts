import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: journals } = await supabase.from('journals').select('*');
    if (!journals || journals.length === 0) {
      return NextResponse.json({ success: true, journals: [] });
    }

    const readinessReport = [];

    for (const journal of journals) {
      // 1. Check Editorial Board Diversity
      const { data: board } = await supabase
        .from('editorial_board_members')
        .select('*')
        .eq('journal_id', journal.id)
        .eq('status', 'active');
      
      const boardCount = board?.length || 0;
      const uniqueCountries = new Set((board || []).map(b => b.country));
      const hasInternationalBoard = uniqueCountries.size >= 2; // Acc accreditation criteria

      // 2. Check Policies complete status
      const { data: policies } = await supabase
        .from('journal_policies')
        .select('policy_type')
        .eq('journal_id', journal.id);
      
      const activePolicies = (policies || []).map(p => p.policy_type);
      const requiredPolicies = ['plagiarism', 'conflict_of_interest', 'peer_review', 'authorship'];
      const hasEthics = requiredPolicies.every(p => activePolicies.includes(p));

      // 3. Count published papers with DOI
      const { data: submissions } = await supabase
        .from('submissions')
        .select('doi, status')
        .eq('journal_id', journal.id);

      const totalPublished = (submissions || []).filter(s => s.status === 'Published').length;
      const publishedWithDoi = (submissions || []).filter(s => s.status === 'Published' && s.doi).length;
      const doiPercentage = totalPublished > 0 ? (publishedWithDoi / totalPublished) * 100 : 0;

      // 4. Calculate Readiness score (0 - 100)
      let score = 0;
      if (journal.issn || journal.eissn) score += 20; // 20% ISSN
      if (boardCount >= 3) score += 20;                // 20% Editorial Board minimum
      if (hasInternationalBoard) score += 10;          // 10% Board diversity
      if (hasEthics) score += 20;                      // 20% Complete Ethics Policies
      if (doiPercentage >= 80) score += 20;            // 20% DOI coverage
      if (journal.subject_areas && journal.subject_areas.length > 0) score += 10; // 10% Scope declaration

      readinessReport.push({
        journal_id: journal.id,
        journal_name: journal.name,
        readiness_score: score,
        accreditation_tier: score >= 90 ? 'SINTA 1 / Scopus Ready' : (score >= 75 ? 'SINTA 2 / Staging' : (score >= 60 ? 'SINTA 3-4' : 'Accreditation Pending')),
        metrics: {
          issn_registered: Boolean(journal.issn || journal.eissn),
          editorial_board_count: boardCount,
          international_board_diversity: uniqueCountries.size,
          ethics_policy_complete: hasEthics,
          doi_coverage_percentage: Math.round(doiPercentage),
          scope_areas: journal.subject_areas || []
        }
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      scope: 'JOURNAL_ACCREDITATION_READINESS',
      reports: readinessReport
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
