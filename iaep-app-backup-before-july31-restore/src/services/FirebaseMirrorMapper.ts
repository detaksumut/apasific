/**
 * FirebaseMirrorMapper — Sprint 0
 *
 * Utility class untuk memetakan tipe data antara Supabase (PostgreSQL)
 * dan Firebase Firestore. Semua keputusan mapping didokumentasikan secara
 * eksplisit agar perilaku konsisten dan dapat diaudit.
 *
 * Keputusan arsitektur (disetujui 28 Juli 2026):
 * - Timestamp: Firestore native Timestamp (bukan ISO string) agar query
 *   waktu Firestore berfungsi dengan benar.
 * - NULL policy: field null dikirim EKSPLISIT sebagai null ke Firestore
 *   (TIDAK di-skip) agar field lama tidak tertinggal sebagai data usang.
 * - Mirror hanya 3 koleksi: submissions, review_assignments, submission_history.
 * - Retry hanya untuk transient error (timeout, 503, dsb), bukan 400/401/permission denied.
 * - updated_at staleness check: event lama tidak menimpa data baru di Firestore.
 */

import { Timestamp } from 'firebase-admin/firestore';

// ============================================================
// KONSTANTA
// ============================================================

/**
 * Pemetaan tabel Supabase → koleksi Firestore.
 * HANYA 3 tabel yang di-mirror. Tabel lain (profiles, certificates, dll.) diabaikan.
 */
export const MIRROR_TABLE_MAP: Record<string, string> = {
  submissions:        'submissions',
  review_assignments: 'review_assignments',
  submission_history: 'submission_history',
};

/**
 * HTTP status code yang termasuk transient error (layak di-retry).
 */
const TRANSIENT_HTTP_CODES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Kata kunci dalam pesan error yang mengindikasikan transient error.
 */
const TRANSIENT_ERROR_KEYWORDS = [
  'timeout',
  'connection reset',
  'network error',
  'econnreset',
  'econnrefused',
  'socket hang up',
  'quota exceeded',
  'unavailable',
  'deadline exceeded',
];

/**
 * Kata kunci yang mengindikasikan permanent error.
 * Error ini TIDAK di-retry karena retry tidak akan mengubah hasilnya.
 */
const PERMANENT_ERROR_KEYWORDS = [
  'permission denied',
  'not found',
  'invalid argument',
  'already exists',
  'unauthenticated',
  'payload too large',
];

/**
 * Field timestamp yang perlu dikonversi ke Firestore Timestamp.
 */
const TIMESTAMP_FIELDS = new Set([
  'created_at', 'updated_at', 'assigned_at', 'completed_at',
  'deadline', 'issued_at', 'deleted_at',
]);

/**
 * Field UUID yang disimpan sebagai string lowercase di Firestore.
 */
const UUID_FIELDS = new Set([
  'id', 'author_id', 'reviewer_id', 'submission_id',
  'journal_id', 'editor_id', 'actor_id', 'user_id', 'reference_id',
]);

// ============================================================
// FUNGSI MAPPING
// ============================================================

/**
 * Konversi UUID Supabase ke string ID Firestore.
 */
export function toFirestoreId(supabaseId: string): string {
  if (!supabaseId) throw new Error('toFirestoreId: ID tidak boleh kosong');
  return supabaseId.toLowerCase().trim();
}

/**
 * Konversi timestamp PostgreSQL ke Firestore native Timestamp.
 *
 * Menggunakan Firestore Timestamp (bukan ISO string) agar query
 * berbasis waktu Firestore (.where('updated_at', '>', ..)) berfungsi.
 *
 * @returns Firestore Timestamp jika valid, null jika tidak ada nilai.
 */
export function toFirestoreTimestamp(
  pgTimestamp: string | null | undefined
): Timestamp | null {
  if (!pgTimestamp) return null;
  try {
    const date = new Date(pgTimestamp);
    if (isNaN(date.getTime())) return null;
    return Timestamp.fromDate(date);
  } catch {
    return null;
  }
}

/**
 * Petakan nama tabel Supabase ke nama koleksi Firestore.
 *
 * @returns Nama koleksi Firestore, atau null jika tabel tidak di-mirror.
 */
export function getFirestoreCollection(supabaseTable: string): string | null {
  return MIRROR_TABLE_MAP[supabaseTable] ?? null;
}

/**
 * Konversi record Supabase (PostgreSQL row) ke dokumen Firestore.
 *
 * Aturan konversi:
 * 1. Timestamp fields → Firestore Timestamp (native)
 * 2. UUID fields → string lowercase
 * 3. NULL fields → dikirim eksplisit sebagai null (TIDAK di-skip)
 *    Alasan: jika di-skip, field lama di Firestore tidak akan terhapus
 *    ketika nilainya dikosongkan di Supabase (data usang / stale).
 * 4. JSONB fields → di-parse jika berupa JSON string
 * 5. Boolean/number → langsung
 */
export function toFirestoreDocument(
  supabaseTable: string,
  record: Record<string, any>
): Record<string, any> {
  if (!record || typeof record !== 'object') {
    throw new Error(`toFirestoreDocument: record tidak valid untuk tabel '${supabaseTable}'`);
  }

  const doc: Record<string, any> = {};

  for (const [key, value] of Object.entries(record)) {
    // 1. Konversi timestamp fields ke Firestore Timestamp
    if (TIMESTAMP_FIELDS.has(key)) {
      doc[key] = toFirestoreTimestamp(value); // bisa null — ini disengaja
      continue;
    }

    // 2. UUID fields: simpan sebagai string lowercase, null jika tidak ada
    if (UUID_FIELDS.has(key)) {
      doc[key] = value ? String(value).toLowerCase() : null;
      continue;
    }

    // 3. JSONB: coba parse jika berupa JSON string
    if (
      typeof value === 'string' &&
      (value.trim().startsWith('{') || value.trim().startsWith('['))
    ) {
      try {
        doc[key] = JSON.parse(value);
        continue;
      } catch {
        // Bukan JSON valid, simpan sebagai string biasa
      }
    }

    // 4. Semua field lain:
    //    - null → simpan sebagai null (eksplisit, bukan di-skip)
    //    - undefined → simpan sebagai null (eksplisit)
    //    - nilai lain → simpan langsung
    doc[key] = value ?? null;
  }

  // Tambahkan metadata mirror untuk observability
  doc._mirrored_at = Timestamp.now();
  doc._mirror_source = 'supabase';
  doc._mirror_table = supabaseTable;

  return doc;
}

// ============================================================
// ERROR CLASSIFICATION
// ============================================================

/**
 * Tentukan apakah sebuah error layak untuk di-retry.
 *
 * Hanya transient error yang di-retry.
 * Permanent error (400, 401, 403, permission denied, dll.) TIDAK di-retry.
 *
 * @returns true jika transient (layak retry), false jika permanent.
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const message = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase();

  // Cek permanent keywords DULU (prioritas lebih tinggi)
  for (const keyword of PERMANENT_ERROR_KEYWORDS) {
    if (message.includes(keyword)) return false;
  }

  // Cek HTTP status code
  const httpError = error as any;
  const code = httpError?.status ?? httpError?.statusCode ?? httpError?.code;
  if (typeof code === 'number') {
    // 400-499 (kecuali 408 dan 429) = permanent
    if (code >= 400 && code < 500 && !TRANSIENT_HTTP_CODES.has(code)) {
      return false;
    }
    // 408, 429, 500-504 = transient
    if (TRANSIENT_HTTP_CODES.has(code)) return true;
  }

  // Cek transient keywords
  for (const keyword of TRANSIENT_ERROR_KEYWORDS) {
    if (message.includes(keyword)) return true;
  }

  // Default: anggap transient untuk error yang tidak dikenal
  // (lebih aman retry daripada melewatkan mirror tanpa jejak)
  return true;
}

// ============================================================
// STALENESS CHECK
// ============================================================

/**
 * Periksa apakah event webhook layak diterapkan ke Firestore.
 *
 * Mencegah race condition: event yang datang tidak berurutan (out-of-order)
 * tidak boleh menimpa data yang lebih baru di Firestore.
 *
 * Contoh yang dicegah:
 *   UPDATE jam 10:01 → Firestore diupdate ✅
 *   UPDATE jam 10:00 → datang terlambat → DIABAIKAN ✅
 *
 * @param firestoreUpdatedAt - Nilai updated_at dokumen Firestore saat ini
 * @param incomingUpdatedAt  - Nilai updated_at dari payload webhook
 * @returns true jika event harus diterapkan, false jika harus diabaikan
 */
export function shouldApplyUpdate(
  firestoreUpdatedAt: Timestamp | null | undefined,
  incomingUpdatedAt: string | null | undefined
): boolean {
  // Dokumen baru (belum ada di Firestore): selalu terapkan
  if (!firestoreUpdatedAt) return true;

  // Tidak ada updated_at di payload: terapkan (defensive)
  if (!incomingUpdatedAt) return true;

  try {
    const incomingDate = new Date(incomingUpdatedAt);
    const firestoreDate = firestoreUpdatedAt.toDate();

    if (isNaN(incomingDate.getTime())) return true; // parse gagal: terapkan

    // Abaikan jika payload lebih lama dari yang sudah ada di Firestore
    return incomingDate >= firestoreDate;
  } catch {
    return true; // parsing gagal: terapkan (defensive)
  }
}

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type WebhookEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface WebhookPayload {
  type: WebhookEventType;
  table: string;
  schema: string;
  record: Record<string, any> | null;
  old_record: Record<string, any> | null;
}

export interface MirrorResult {
  success: boolean;
  collection: string;
  documentId: string;
  event: WebhookEventType;
  durationMs: number;
  skipped?: boolean;
  skipReason?: string;
  error?: string;
  retries?: number;
}
