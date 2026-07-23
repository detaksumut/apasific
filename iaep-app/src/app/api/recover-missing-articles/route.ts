import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const dynamic = 'force-dynamic';

// Mapping Scope Zenodo → kode jurnal APASIFIC
function detectJournalCode(keywords: string[]): string {
  const kwStr = keywords.join(' ').toLowerCase();
  
  // 1. Cari tag "Scope: ..." secara eksplisit (format standar APASIFIC di Zenodo)
  const scopeMatch = kwStr.match(/scope:\s*([^,;]+)/i);
  if (scopeMatch) {
    const scope = scopeMatch[1].trim().toLowerCase();
    if (scope.includes('akuntansi') || scope.includes('audit') || scope.includes('perpajakan') || scope.includes('accounting')) return 'AJAF';
    if (scope.includes('pelatihan') || scope.includes('pendampingan') || scope.includes('pengabdian') || scope.includes('pkm') || scope.includes('masyarakat') || scope.includes('community')) return 'AJCS';
    if (scope.includes('komputer') || scope.includes('teknologi informasi') || scope.includes('computer') || scope.includes('information technology')) return 'AJITE';
    if (scope.includes('lingkungan') || scope.includes('keberlanjutan') || scope.includes('environment') || scope.includes('sustainability')) return 'AJES';
    if (scope.includes('hukum') || scope.includes('law') || scope.includes('legal')) return 'AJLG';
    if (scope.includes('pertanian') || scope.includes('kehutanan') || scope.includes('perikanan') || scope.includes('agriculture')) return 'AJAFR';
    if (scope.includes('kesehatan') || scope.includes('health') || scope.includes('medis') || scope.includes('kedokteran')) return 'AJHS';
  }

  // 2. Fallback: deteksi dari seluruh keyword text
  if (kwStr.includes('akuntansi') || kwStr.includes('audit') || kwStr.includes('perpajakan') || kwStr.includes('fiscal autonomy') || kwStr.includes('non-compliance') || kwStr.includes('accounting')) return 'AJAF';
  if (kwStr.includes('pelatihan') || kwStr.includes('pendampingan') || kwStr.includes('pengabdian') || kwStr.includes('pkm') || kwStr.includes('community service') || kwStr.includes('masyarakat') || kwStr.includes('felda') || kwStr.includes('msme')) return 'AJCS';
  if (kwStr.includes('komputer') || kwStr.includes('teknologi informasi') || kwStr.includes('computer science') || kwStr.includes('information technology') || kwStr.includes('sistem informasi')) return 'AJITE';
  if (kwStr.includes('lingkungan') || kwStr.includes('keberlanjutan') || kwStr.includes('environment') || kwStr.includes('sustainability')) return 'AJES';
  if (kwStr.includes('hukum') || kwStr.includes('law') || kwStr.includes('legal')) return 'AJLG';
  if (kwStr.includes('pertanian') || kwStr.includes('kehutanan') || kwStr.includes('perikanan') || kwStr.includes('agriculture')) return 'AJAFR';
  if (kwStr.includes('kesehatan') || kwStr.includes('health') || kwStr.includes('kedokteran')) return 'AJHS';
  
  return 'AJCS'; // default
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zenodoId = searchParams.get('zenodoId');
  const overrideJournal = searchParams.get('journal') || null; // override manual jika perlu

  if (!zenodoId) {
    return NextResponse.json({ error: 'Parameter zenodoId diperlukan. Contoh: ?zenodoId=21486466' }, { status: 400 });
  }

  const doi = `10.5281/zenodo.${zenodoId}`;
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Fetch metadata dari Zenodo API
  let title = '';
  let abstract = '';
  let authors: any[] = [];
  let keywords: string[] = [];
  let publishedDate = new Date().toISOString();
  let detectedJournalCode = 'AJCS';

  try {
    const res = await fetch(`https://zenodo.org/api/records/${zenodoId}`, {
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      const rec = await res.json();
      title = rec.metadata?.title || rec.title || '';
      abstract = rec.metadata?.description || '';
      keywords = rec.metadata?.keywords || [];
      authors = (rec.metadata?.creators || []).map((c: any) => ({
        full_name: c.name || c.full_name || 'Unknown',
        orcid: c.orcid || '',
        affiliation: c.affiliation || ''
      }));
      publishedDate = rec.metadata?.publication_date
        ? new Date(rec.metadata.publication_date).toISOString()
        : new Date().toISOString();

      // Deteksi jurnal dari keywords Zenodo (Scope: ...)
      detectedJournalCode = overrideJournal || detectJournalCode(keywords);
    }
  } catch (e: any) {
    return NextResponse.json({ error: `Gagal fetch Zenodo: ${e.message}` }, { status: 500 });
  }

  // 2. Cari journal_id berdasarkan kode jurnal yang terdeteksi
  const { data: journals } = await sb
    .from('journals')
    .select('id, name')
    .ilike('name', `%${detectedJournalCode}%`)
    .limit(1);
  const journalId = journals?.[0]?.id || null;
  const journalName = journals?.[0]?.name || detectedJournalCode;

  // 3. Cek apakah artikel sudah ada (by zenodo_id atau doi)
  const { data: byZenodo } = await sb.from('submissions').select('id, title, status, stage, doi, zenodo_id, journal_id').eq('zenodo_id', zenodoId);
  const { data: byDoi } = await sb.from('submissions').select('id, title, status, stage, doi, zenodo_id, journal_id').eq('doi', doi);

  const existing = (byZenodo && byZenodo.length > 0) ? byZenodo[0]
    : (byDoi && byDoi.length > 0 ? byDoi[0] : null);

  if (existing) {
    // Update: pastikan status Published DAN journal_id benar
    const updates: any = { status: 'Published', stage: 'Published', doi, zenodo_id: zenodoId };
    if (journalId && existing.journal_id !== journalId) {
      updates.journal_id = journalId;
    }
    const { error: updateErr } = await sb.from('submissions').update(updates).eq('id', existing.id);

    return NextResponse.json({
      found: true,
      action: 'updated',
      id: existing.id,
      title: existing.title || title,
      status: 'Published',
      doi,
      zenodo_id: zenodoId,
      journal_code: detectedJournalCode,
      journal_name: journalName,
      journal_id_updated: journalId !== existing.journal_id,
      error: updateErr?.message || null,
      message: `✅ Artikel ada di Supabase. Journal: ${journalName}. ${updateErr ? 'Ada error: ' + updateErr.message : 'Status dan journal_id diperbaiki.'}`
    });
  }

  // 4. Insert artikel baru
  const newId = randomUUID();
  const abstractForDb = authors.length > 0
    ? JSON.stringify({ abstract_en: abstract, authors, keywords: keywords.join(', '), doi })
    : abstract;

  const { data: inserted, error } = await sb.from('submissions').insert({
    id: newId,
    title,
    abstract: abstractForDb,
    status: 'Published',
    stage: 'Published',
    journal_id: journalId,
    doi,
    zenodo_id: zenodoId,
    created_at: publishedDate,
    updated_at: new Date().toISOString(),
  }).select('id, title').single();

  return NextResponse.json({
    found: false,
    action: error ? 'insert_error' : 'inserted',
    id: inserted?.id,
    title,
    doi,
    zenodo_id: zenodoId,
    journal_code: detectedJournalCode,
    journal_name: journalName,
    keywords_detected: keywords,
    error: error?.message || null,
    message: error
      ? `❌ Gagal insert: ${error.message}`
      : `✅ Artikel ditambahkan ke Supabase. Journal: ${journalName}.`
  });
}
