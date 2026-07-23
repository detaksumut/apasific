import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 menit timeout untuk sync besar

// Konversi Firebase UID / Firestore doc ID ke format UUID untuk Supabase
function toUuid(id: string): string {
  if (!id) return '';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
  const hex = Buffer.from(id).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function toTimestamp(val: any): string {
  if (!val) return new Date().toISOString();
  if (val.toDate) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const report: Record<string, any> = {
    started_at: new Date().toISOString(),
    collections: {}
  };

  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();

    // ================================================================
    // 1. SYNC PROFILES / USERS
    // Firestore 'users' collection + Firebase Auth users → Supabase: profiles
    // ================================================================
    try {
      // 1a. Coba dari Firestore 'users' collection
      const snap = await db.collection('users').get();
      let synced = 0, skipped = 0;
      const errors: string[] = [];
      const syncedIds = new Set<string>();

      for (const doc of snap.docs) {
        const d = doc.data();
        const uid = toUuid(doc.id);
        if (!uid) { skipped++; continue; }

        const { error } = await sb.from('profiles').upsert({
          id: uid,
          full_name: d.full_name || d.name || d.displayName || 'Unknown',
          email: d.email || null,
          role: d.role || 'author',
          phone: d.phone || d.phone_number || null,
          university: d.university || d.institution || null,
          country: d.country || null,
          updated_at: toTimestamp(d.updated_at),
        }, { onConflict: 'id', ignoreDuplicates: false });

        if (error) { errors.push(`[${doc.id}] ${error.message}`); skipped++; }
        else { synced++; syncedIds.add(uid); }
      }

      // 1b. Ambil dari system_settings apasific_registered_users (fallback)
      try {
        const { data: setting } = await sb.from('system_settings').select('value').eq('key', 'apasific_registered_users').single();
        if (setting?.value) {
          const users = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
          for (const u of (users as any[])) {
            if (!u.email) continue;
            const uid = u.id ? toUuid(u.id) : toUuid(u.email);
            if (syncedIds.has(uid)) continue;

            const { error } = await sb.from('profiles').upsert({
              id: uid,
              full_name: u.full_name || u.name || u.email.split('@')[0],
              email: u.email,
              role: u.role || 'author',
              phone: u.phone_number || u.phone || null,
              university: u.university || null,
              country: u.country || null,
            }, { onConflict: 'id', ignoreDuplicates: false });

            if (!error) { synced++; syncedIds.add(uid); }
          }
        }
      } catch(e2) { /* system_settings mungkin tidak ada */ }

      report.collections.profiles = { total_firestore: snap.docs.length, total_synced: synced, skipped, errors: errors.slice(0,5) };
    } catch (e: any) {
      report.collections.profiles = { error: e.message };
    }

    // ================================================================
    // 2. SYNC SUBMISSIONS (Firestore: submissions → Supabase: submissions)
    // ================================================================
    try {
      const snap = await db.collection('submissions').get();
      let synced = 0, skipped = 0;
      const errors: string[] = [];

      for (const doc of snap.docs) {
        const d = doc.data();
        const id = toUuid(doc.id);
        const journalId = d.journal_id && isValidUuid(d.journal_id) ? d.journal_id : null;
        const authorId = d.author_id ? toUuid(d.author_id) : null;

        const upsertData: any = {
          id,
          title: d.title || 'Untitled',
          abstract: d.abstract || null,
          status: d.status || 'queued',
          stage: d.stage || null,
          journal_id: journalId,
          doi: d.doi || null,
          created_at: toTimestamp(d.created_at),
          updated_at: toTimestamp(d.updated_at),
          // PERBAIKAN: Jangan isi author_id untuk hindari FK constraint
          // author_id akan di-update manual setelah profiles sync
        };
        if (d.file_url) upsertData.file_url = d.file_url;
        if (d.file_url_galley) upsertData.file_url_galley = d.file_url_galley;
        if (d.cover_file_url) upsertData.cover_file_url = d.cover_file_url;
        if (d.revised_file_url) upsertData.revised_file_url = d.revised_file_url;
        if (d.volume) upsertData.volume = d.volume;
        if (d.issue) upsertData.issue = d.issue;
        if (d.issn) upsertData.issn = d.issn;
        if (d.zenodo_id) upsertData.zenodo_id = String(d.zenodo_id);
        // Simpan firebase author_id original sebagai phone (sementara untuk referensi)
        if (d.author_id && !upsertData.phone) upsertData.phone = d.author_id;

        const { error } = await sb.from('submissions').upsert(upsertData, { onConflict: 'id', ignoreDuplicates: false });
        if (error) { errors.push(`[${doc.id}] ${error.message}`); skipped++; }
        else synced++;
      }
      report.collections.submissions = { total_firestore: snap.docs.length, synced, skipped, errors: errors.slice(0,5) };
    } catch (e: any) {
      report.collections.submissions = { error: e.message };
    }

    // ================================================================
    // 3. SYNC REVIEWS (Firestore: reviews → Supabase: review_assignments)
    // ================================================================
    try {
      const snap = await db.collection('reviews').get();
      let synced = 0, skipped = 0;
      const errors: string[] = [];

      for (const doc of snap.docs) {
        const d = doc.data();
        const id = toUuid(doc.id);
        const submissionId = d.submission_id ? toUuid(d.submission_id) : null;
        const reviewerId = d.reviewer_id ? toUuid(d.reviewer_id) : null;

        const upsertData: any = {
          id,
          submission_id: submissionId,
          reviewer_id: reviewerId,
          status: d.status || 'pending',
          recommendation: d.recommendation || null,
          comments: d.comments || d.review_comments || null,
          created_at: toTimestamp(d.created_at),
          updated_at: toTimestamp(d.updated_at),
        };
        if (d.reviewer_email) upsertData.reviewer_email = d.reviewer_email;
        if (d.reviewer_name) upsertData.reviewer_name = d.reviewer_name;
        if (d.due_date) upsertData.due_date = toTimestamp(d.due_date);

        const { error } = await sb.from('review_assignments').upsert(upsertData, { onConflict: 'id', ignoreDuplicates: false });
        if (error) { errors.push(`[${doc.id}] ${error.message}`); skipped++; }
        else synced++;
      }
      report.collections.reviews = { total_firestore: snap.docs.length, synced, skipped, errors: errors.slice(0,5) };
    } catch (e: any) {
      report.collections.reviews = { error: e.message };
    }

    // ================================================================
    // 4. SYNC CERTIFICATES (Firestore: certificates → Supabase: certificates)
    // ================================================================
    try {
      const snap = await db.collection('certificates').get();
      let synced = 0, skipped = 0;
      const errors: string[] = [];

      // Cek dulu apakah tabel certificates ada
      const { error: tableCheck } = await sb.from('certificates').select('id').limit(1);
      if (tableCheck && tableCheck.message?.includes('does not exist')) {
        report.collections.certificates = {
          total_firestore: snap.docs.length,
          synced: 0,
          skipped: snap.docs.length,
          note: 'Tabel certificates belum ada di Supabase. Buat dulu via SQL Editor.',
          sql_to_run: `CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY,
  reference_id uuid,
  user_id uuid,
  type text,
  recipient_name text,
  title text,
  edition text,
  doi text,
  file_url text,
  issued_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);`
        };
      } else {
        for (const doc of snap.docs) {
          const d = doc.data();
          const id = toUuid(doc.id);
          const userId = d.user_id ? toUuid(d.user_id) : null;
          const refId = d.reference_id ? toUuid(d.reference_id) : null;

          const upsertData: any = {
            id,
            reference_id: refId,
            type: d.type || d.cert_type || 'reviewer',
            recipient_name: d.recipient_name || d.name || null,
            title: d.title || d.paper_title || null,
            edition: d.edition || d.issue_volume || null,
            issued_at: toTimestamp(d.issued_at || d.created_at),
            created_at: toTimestamp(d.created_at),
          };
          if (userId && isValidUuid(userId)) upsertData.user_id = userId;
          if (d.file_url) upsertData.file_url = d.file_url;
          if (d.doi) upsertData.doi = d.doi;

          const { error } = await sb.from('certificates').upsert(upsertData, { onConflict: 'id', ignoreDuplicates: false });
          if (error) { errors.push(`[${doc.id}] ${error.message}`); skipped++; }
          else synced++;
        }
        report.collections.certificates = { total_firestore: snap.docs.length, synced, skipped, errors: errors.slice(0,5) };
      }
    } catch (e: any) {
      report.collections.certificates = { error: e.message };
    }

    report.finished_at = new Date().toISOString();
    report.success = true;

    return NextResponse.json(report);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, report }, { status: 500 });
  }
}
