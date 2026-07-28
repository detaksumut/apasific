import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFirestore } from '@/utils/firebase/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getMd5Checksum(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

export async function GET() {
  const logs: string[] = [];
  try {
    const brainDir = 'C:\\Users\\BI News\\.gemini\\antigravity-ide\\brain\\80e2537b-5cca-4a9f-82cf-137796fe194a';
    
    // Ensure brain directory exists (it should, but safety first)
    if (!fs.existsSync(brainDir)) {
      fs.mkdirSync(brainDir, { recursive: true });
    }

    const db = getFirestore();
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ==========================================
    // FASE 1A: BACKUP DATA
    // ==========================================
    logs.push("Memulai pencadangan data...");

    // 1. Backup Firestore Submissions
    const fsSnap = await db.collection('submissions').get();
    const fsSubmissions: any[] = [];
    fsSnap.forEach(doc => {
      fsSubmissions.push({ id: doc.id, ...doc.data() });
    });
    
    const fsBackupPath = path.join(brainDir, 'firestore_backup.json');
    const fsBackupStr = JSON.stringify(fsSubmissions, null, 2);
    fs.writeFileSync(fsBackupPath, fsBackupStr, 'utf8');
    const fsChecksum = getMd5Checksum(fsBackupStr);

    // 2. Backup Supabase Submissions
    const { data: sbSubmissions, error: sbErr } = await supabaseAdmin
      .from('submissions')
      .select('*');

    if (sbErr) throw sbErr;

    const sbBackupPath = path.join(brainDir, 'supabase_backup.json');
    const sbBackupStr = JSON.stringify(sbSubmissions, null, 2);
    fs.writeFileSync(sbBackupPath, sbBackupStr, 'utf8');
    const sbChecksum = getMd5Checksum(sbBackupStr);

    // 3. Tulis Manifest Backup
    const manifestPath = path.join(brainDir, 'backup_manifest.json');
    const manifest = {
      timestamp: new Date().toISOString(),
      firestore: {
        records: fsSubmissions.length,
        checksum: fsChecksum,
        path: fsBackupPath
      },
      supabase: {
        records: sbSubmissions ? sbSubmissions.length : 0,
        checksum: sbChecksum,
        path: sbBackupPath
      }
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    logs.push("Backup selesai ditulis ke folder artifacts.");

    // ==========================================
    // FASE 1B: ANALISIS KANDIDAT PEMBERSIHAN
    // ==========================================
    logs.push("Memulai pemindaian relasi naskah kosong...");

    const candidates = [];

    for (const doc of fsSubmissions) {
      const title = (doc.title || '').trim();
      const status = doc.status || 'unknown';

      // Kriteria Kandidat: Judul kosong, null, atau 'Untitled'
      if (!title || title.toLowerCase() === 'untitled') {
        const id = doc.id;

        // 1. Hitung Reviewer Assignments di Supabase
        const { count: sbReviewCount, error: revErr } = await supabaseAdmin
          .from('review_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('submission_id', id);

        // 2. Hitung Submission History di Supabase
        const { count: sbHistoryCount, error: histErr } = await supabaseAdmin
          .from('submission_history')
          .select('*', { count: 'exact', head: true })
          .eq('submission_id', id);

        // 3. Hitung Certificates di Supabase
        const { count: sbCertCount, error: certErr } = await supabaseAdmin
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('reference_id', id); // reference_id adalah kolom relasi naskah

        // 4. Cek keberadaan di Supabase
        const existsInSupa = (sbSubmissions || []).some(s => s.id === id);

        // Rekomendasi tindakan:
        // Jika tidak memiliki review, history, dan certificate, tandai DELETE CANDIDATE.
        // Jika ada relasi aktif, tandai KEEP (harus dipulihkan).
        const totalRelations = (sbReviewCount || 0) + (sbHistoryCount || 0) + (sbCertCount || 0);
        const recommendation = totalRelations === 0 ? 'DELETE CANDIDATE' : 'KEEP (Memiliki Relasi Aktif)';

        candidates.push({
          submissionId: id,
          firestoreId: id,
          supabaseId: existsInSupa ? id : 'TIDAK ADA',
          status,
          reviewerCount: sbReviewCount || 0,
          historyCount: sbHistoryCount || 0,
          certificateCount: sbCertCount || 0,
          recommendation
        });
      }
    }

    // Tulis Laporan Kandidat dalam format Markdown
    const reportPath = path.join(brainDir, 'candidate_report.md');
    let reportMd = `# Laporan Kandidat Pembersihan Data Dummy (Enriched Candidate Report)

Laporan ini mencantumkan seluruh naskah ber-judul kosong/"Untitled" di Firestore beserta analisis relasi aktifnya di database Supabase.

> [!IMPORTANT]
> **Petunjuk Tindakan:**
> *   **DELETE CANDIDATE:** Naskah dummy murni tanpa relasi apa pun. Aman untuk dihapus.
> *   **KEEP:** Naskah memiliki catatan review, riwayat, atau sertifikat aktif. **TIDAK BOLEH** dihapus. Statusnya harus di-lock dan metadatanya dipulihkan dari Zenodo pada Fase 4.

## Daftar Kandidat Penyelidikan

| No | ID Naskah | Status Firestore | Review Count | History Count | Cert Count | Ada di Supabase? | Rekomendasi Tindakan |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
`;

    candidates.forEach((c, idx) => {
      const isSupa = c.supabaseId !== 'TIDAK ADA' ? 'Ya' : 'Tidak';
      const recLabel = c.recommendation === 'DELETE CANDIDATE' 
        ? `🔴 **${c.recommendation}**` 
        : `🟢 **${c.recommendation}**`;

      reportMd += `| ${idx + 1} | \`${c.submissionId}\` | ${c.status} | ${c.reviewerCount} | ${c.historyCount} | ${c.certificateCount} | ${isSupa} | ${recLabel} |\n`;
    });

    reportMd += `\n\n---\n*Laporan dibuat otomatis pada: ${new Date().toISOString()}*`;
    
    fs.writeFileSync(reportPath, reportMd, 'utf8');
    logs.push(`Laporan kandidat berhasil ditulis ke ${reportPath}`);

    return NextResponse.json({
      success: true,
      manifest,
      total_candidates: candidates.length,
      logs
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      logs
    }, { status: 500 });
  }
}
