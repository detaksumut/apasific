import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  WebhookPayload,
  MIRROR_TABLE_MAP,
  toFirestoreDocument,
  toFirestoreId,
  isRetryableError,
  shouldApplyUpdate,
} from '@/services/FirebaseMirrorMapper';

export const dynamic = 'force-dynamic';

// Supabase client untuk logging mirror_log (best effort)
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Tulis log ke tabel mirror_log di Supabase.
 * Ini adalah proses best-effort dan tidak memblokir eksekusi utama.
 */
async function writeMirrorLog(logData: {
  table_name: string;
  record_id: string;
  event_type: string;
  status: 'success' | 'failed' | 'retry' | 'skipped';
  duration_ms: number;
  error?: string;
  version: string;
}) {
  try {
    sb.from('mirror_log').insert([logData]).then(({ error }) => {
      if (error) console.error('[MirrorLog] Gagal menulis log:', error);
    });
  } catch (err) {
    console.error('[MirrorLog] Gagal menulis log (exception):', err);
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let version = 'v1';

  try {
    // 1. Verifikasi Secret (Keamanan Endpoint)
    const secret = req.headers.get('x-webhook-secret');
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Version Header (Mendukung evolusi webhook di masa depan)
    version = req.headers.get('x-mirror-version') || 'v1';

    // 3. Parse Payload
    const payload = (await req.json()) as WebhookPayload;
    if (!payload || !payload.table || !payload.type) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { table, type, record, old_record } = payload;
    
    // Cek apakah tabel ini termasuk yang di-mirror
    const collectionName = MIRROR_TABLE_MAP[table];
    if (!collectionName) {
      return NextResponse.json({ success: true, message: 'Table not mirrored' });
    }

    // Tentukan record mana yang aktif (record baru untuk INSERT/UPDATE, old_record untuk DELETE)
    const activeRecord = record || old_record;
    if (!activeRecord || !activeRecord.id) {
       return NextResponse.json({ error: 'No record ID found' }, { status: 400 });
    }

    const docId = toFirestoreId(activeRecord.id);
    
    // Lazy load Firestore agar tidak memberatkan boot time
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const docRef = db.collection(collectionName).doc(docId);

    // 4. Staleness Check (khusus UPDATE)
    if (type === 'UPDATE') {
       try {
           const currentDoc = await docRef.get();
           if (currentDoc.exists) {
               const firestoreData = currentDoc.data();
               const firestoreUpdatedAt = firestoreData?.updated_at;
               const incomingUpdatedAt = activeRecord.updated_at;
               
               if (!shouldApplyUpdate(firestoreUpdatedAt, incomingUpdatedAt)) {
                   const durationMs = Date.now() - startTime;
                   writeMirrorLog({
                       table_name: table,
                       record_id: docId,
                       event_type: type,
                       status: 'skipped',
                       duration_ms: durationMs,
                       error: 'Stale update ignored',
                       version
                   });
                   return NextResponse.json({ success: true, message: 'Stale update ignored' });
               }
           }
       } catch (err) {
           console.warn('[Mirror] Staleness check gagal, melanjutkan operasi mirror...', err);
       }
    }

    // 5. Eksekusi dengan Exponential Backoff Retry (hanya untuk transient errors)
    let lastError: any = null;
    let attempt = 0;
    const maxRetries = 4; // Total 5 kali percobaan (0, 1, 2, 3, 4)
    let success = false;

    while (attempt <= maxRetries && !success) {
      try {
        if (type === 'DELETE') {
           // Mapping DELETE
           await docRef.delete();
        } else {
           // Mapping INSERT atau UPDATE
           // Konversi data via Mapper (mempertahankan timestamp native, dsb)
           const firestoreData = toFirestoreDocument(table, activeRecord);
           
           // Idempotent write: selalu gunakan set() dengan merge: true
           // Jangan pernah gunakan collection.add()
           await docRef.set(firestoreData, { merge: true });
        }
        success = true;
      } catch (err: any) {
        lastError = err;
        
        // Jika error permanent (bukan transient) atau sudah mencapai batas max, hentikan retry
        if (!isRetryableError(err) || attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff: 500ms, 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt) * 500;
        await new Promise(r => setTimeout(r, delayMs));
        attempt++;
      }
    }

    const durationMs = Date.now() - startTime;

    // 6. Logging Akhir & Respons
    if (success) {
        writeMirrorLog({
            table_name: table,
            record_id: docId,
            event_type: type,
            status: 'success',
            duration_ms: durationMs,
            version
        });
        return NextResponse.json({ success: true, attempts: attempt + 1 });
    } else {
        writeMirrorLog({
            table_name: table,
            record_id: docId,
            event_type: type,
            status: 'failed',
            duration_ms: durationMs,
            error: lastError?.message || String(lastError),
            version
        });
        return NextResponse.json({ success: false, error: lastError?.message }, { status: 500 });
    }

  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    writeMirrorLog({
        table_name: 'unknown',
        record_id: 'unknown',
        event_type: 'unknown',
        status: 'failed',
        duration_ms: durationMs,
        error: error?.message || String(error),
        version
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
