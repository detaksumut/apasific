import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const result: any = {
    ajcs_journal_uuid: '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d',
    all_journals_in_supabase: [],
    firestore_summary: {},
    firestore_by_journal: {}
  };

  // 1. Semua jurnal di Supabase + UUID-nya
  try {
    const { data: journals } = await supabase.from('journals').select('id, name, slug').order('slug');
    result.all_journals_in_supabase = journals || [];
  } catch(e: any) {
    result.journal_error = e.message;
  }

  // 2. Semua submission di Firestore, digroup per journal_id
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const snap = await db.collection('submissions').get();

    const byJournalId: Record<string, any[]> = {};
    const statusCount: Record<string, number> = {};
    
    for (const doc of snap.docs) {
      const data = doc.data();
      const jid = data.journal_id || 'NO_JOURNAL_ID';
      const status = data.status || 'NO_STATUS';

      // Count status
      statusCount[status] = (statusCount[status] || 0) + 1;

      // Group by journal_id
      if (!byJournalId[jid]) byJournalId[jid] = [];
      byJournalId[jid].push({
        id: doc.id,
        title: data.title,
        status: data.status,
        stage: data.stage,
        created_at: data.created_at ? data.created_at.toDate() : new Date(),
        journal_id: data.journal_id,
        doi: data.doi || null,
        author_name: data.author_name || data.authorName || 'No Name',
        abstract: data.abstract ? 'Ada' : 'Tidak Ada',
        file_url: data.file_url ? 'Ada' : 'Tidak Ada'
      });
    }

    result.firestore_summary = {
      total_docs: snap.docs.length,
      status_breakdown: statusCount
    };

    // Cross-reference journal_ids dengan Supabase journals
    for (const [jid, articles] of Object.entries(byJournalId)) {
      const matched = result.all_journals_in_supabase.find((j: any) => j.id === jid);
      result.firestore_by_journal[jid] = {
        supabase_journal_name: matched?.name || '❌ ORPHAN (UUID tidak cocok dengan jurnal manapun)',
        supabase_slug: matched?.slug || null,
        article_count: articles.length,
        articles: articles
      };
    }
  } catch(e: any) {
    result.firestore_error = e.message;
  }

  return NextResponse.json(result, { 
    headers: { 'Content-Type': 'application/json' } 
  });
}
