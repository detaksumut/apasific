/**
 * ReviewerMatchingService — Reviewer Intelligence Matching System (Target #2).
 *
 * Gerbang tunggal untuk menghasilkan daftar kandidat reviewer yang
 * diperingkat (ranked) bagi sebuah submission. Layanan ini bersifat
 * READ-ONLY: ia tidak pernah menugaskan reviewer. Keputusan penugasan
 * tetap berada di tangan Editor melalui `assignReviewer` (editor.ts).
 *
 * Sifat desain:
 * - Deterministik & offline (tanpa panggilan AI/embedding), sehingga
 *   dapat diuji tanpa infrastruktur eksternal. Jalur vektor
 *   (`ExpertDiscoveryEngine`) dibiarkan terpisah sebagai sinyal masa depan.
 * - Skor mengikuti prioritas bisnis:
 *     1. expertise match (judul/abstrak/keywords vs kosakata keahlian)
 *     2. academic field / division match (bidang reviewer vs jurnal)
 *     3. current workload (jumlah penugasan aktif)
 *     4. previous assignments (riwayat selesai/ditolak)
 * - Conflict-of-interest (konflik kepentingan) dideteksi dan kandidat
 *   yang berkonflik diberi penalti berat + penanda eksplisit, tetapi
 *   TIDAK dihapus — Editor tetap pemutus akhir.
 *
 * Kontrak output per kandidat (wajib):
 *   { reviewerId, expertiseScore, availabilityScore, workloadScore,
 *     conflictCheck, totalScore }
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Input sinyal dari naskah yang akan dicarikan reviewer. */
export interface SubmissionMatchInput {
    submissionId?: string;
    title: string;
    abstract?: string;
    keywords?: string[];
    /** Label divisi akademik (mis. "Ilmu Komputer & Teknologi Informasi"). */
    academicDivision?: string;
    /** Token kosakata divisi/jurnal untuk field matching. */
    divisionTokens?: string[];
    /** Metadata tambahan (journalName, journalSlug, publicationType, ...). */
    metadata?: Record<string, unknown>;
}

/** Entri pool kandidat reviewer (gabungan profiles + system_settings). */
export interface ReviewerPoolEntry {
    id?: string | null;
    email?: string | null;
    full_name?: string | null;
    name?: string | null;
    role?: string | null;
    status?: string | null;
    availability?: string | null;
    academic_field?: string | null;
    field?: string | null;
    discipline?: string | null;
    expertise?: string | string[] | null;
    expertise_area?: string | null;
    keywords?: string | string[] | null;
    interests?: string | string[] | null;
    university?: string | null;
    affiliation?: string | null;
    institution?: string | null;
    country?: string | null;
    [key: string]: unknown;
}

/** Statistik penugasan seorang reviewer. */
export interface ReviewerAssignmentStats {
    active: number;
    completed: number;
    rejected: number;
    total: number;
}

/** Hasil pemeriksaan konflik kepentingan. */
export interface ConflictCheckResult {
    hasConflict: boolean;
    reasons: string[];
}

/** Hasil skor satu kandidat reviewer. */
export interface ReviewerMatchResult {
    reviewerId: string;
    fullName: string;
    email: string | null;
    academicField: string | null;
    university: string | null;
    country: string | null;
    /** 0–100: gabungan keyword-overlap + kecocokan bidang/divisi. */
    expertiseScore: number;
    /** 0–100: ketersediaan (status + riwayat penolakan). */
    availabilityScore: number;
    /** 0–100: semakin tinggi semakin ringan beban kerjanya. */
    workloadScore: number;
    /** true = terdeteksi konflik kepentingan. */
    conflictCheck: ConflictCheckResult;
    /** 0–100: skor akhir terbobot (dipenalti bila konflik). */
    totalScore: number;
    matchedTerms: string[];
    reasons: string[];
    activeAssignments: number;
    completedAssignments: number;
    rank: number;
}

export interface MatchingWeights {
    expertise: number;
    availability: number;
    workload: number;
}

export interface MatchingOptions {
    /** Jumlah kandidat teratas yang dikembalikan (default 10). */
    limit?: number;
    weights?: Partial<MatchingWeights>;
}

export interface RecommendationResult {
    success: boolean;
    error?: string;
    submissionId?: string;
    academicDivision?: string;
    poolSize?: number;
    recommendations?: ReviewerMatchResult[];
}

export interface SubmissionAuthorRef {
    id?: string | null;
    email?: string | null;
    full_name?: string | null;
    university?: string | null;
    affiliation?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Konfigurasi skor
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
    expertise: 0.5,
    availability: 0.2,
    workload: 0.3,
};

/** Status penugasan yang dihitung sebagai beban kerja aktif. */
export const ACTIVE_ASSIGNMENT_STATUSES = [
    'pending',
    'accepted',
    'under_review',
    'revision_pending',
    'revisions_pending',
];

/** Skor maksimum kandidat berkonflik (tetap ditampilkan, diberi penanda). */
const CONFLICT_SCORE_CAP = 5;

/** Penalti beban kerja per penugasan aktif. */
const WORKLOAD_PENALTY_PER_ACTIVE = 25;
/** Bonus pengalaman per review selesai (maksimum). */
const EXPERIENCE_BONUS_PER_COMPLETED = 2;
const EXPERIENCE_BONUS_MAX = 10;
/** Penalti maksimum akibat riwayat penolakan. */
const REJECTION_PENALTY_MAX = 40;

// ─────────────────────────────────────────────────────────────────────────────
// Stopwords (EN + ID) — kata generik yang tidak membawa sinyal keahlian
// ─────────────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set<string>([
    // English function words
    'the', 'a', 'an', 'of', 'in', 'on', 'for', 'to', 'and', 'or', 'with', 'by',
    'from', 'at', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'this', 'that', 'these', 'those', 'it', 'its', 'into', 'over', 'under',
    'between', 'among', 'using', 'use', 'used', 'based', 'via', 'per',
    'their', 'his', 'her', 'our', 'your', 'they', 'them', 'she', 'you',
    'not', 'yes', 'can', 'may', 'might', 'will', 'would', 'should', 'could',
    'has', 'have', 'had', 'does', 'did', 'more', 'most', 'less', 'least',
    'very', 'much', 'many', 'some', 'any', 'all', 'each', 'every', 'other',
    'such', 'than', 'then', 'when', 'where', 'which', 'who', 'whom', 'what',
    'how', 'why', 'about', 'against', 'after', 'before', 'during', 'while',
    'through', 'towards', 'toward', 'within', 'without', 'upon', 'across',
    'around', 'along', 'also', 'however', 'therefore', 'thus', 'hence',
    'both', 'either', 'neither', 'here', 'there', 'because', 'although',
    'several', 'various', 'new', 'one', 'two', 'three', 'first', 'second',
    // Generic publication vocabulary (EN)
    'study', 'studies', 'research', 'researcher', 'paper', 'article',
    'journal', 'international', 'national', 'global', 'regional', 'case',
    'approach', 'analysis', 'evaluation', 'assessment', 'implementation',
    'development', 'impact', 'effect', 'effects', 'role',
    // Indonesian function words
    'yang', 'dan', 'atau', 'dari', 'ke', 'di', 'pada', 'dengan', 'untuk',
    'dalam', 'oleh', 'adalah', 'merupakan', 'ini', 'itu', 'tersebut',
    'serta', 'juga', 'tidak', 'bukan', 'agar', 'dapat', 'akan', 'sudah',
    'telah', 'antara', 'terhadap', 'sebagai', 'secara', 'suatu', 'sebuah',
    'para', 'kami', 'mereka', 'dia', 'saya', 'anda', 'yaitu', 'yakni',
    'karena', 'sehingga', 'maka', 'namun', 'tetapi', 'jika', 'apabila',
    'tentang', 'bagi', 'hingga', 'sampai', 'seperti', 'bahwa', 'lebih',
    'paling', 'setiap', 'semua', 'beberapa', 'banyak', 'sedikit', 'saat',
    'ketika', 'masih', 'pernah', 'harus', 'perlu', 'bila', 'pun', 'nya',
    // Kata generik publikasi (ID)
    'penelitian', 'studi', 'jurnal', 'artikel', 'kajian', 'makalah',
    'publikasi', 'ilmiah', 'nasional', 'internasional',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Katalog divisi akademik per jurnal
// Sumber scope: katalog resmi jurnal APASIFIC (lihat api/clean-journals).
// Slug jurnal → label divisi + token kosakata untuk field matching.
// Jurnal multidisiplin (IAEP) tidak memberi boost divisi khusus.
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalDivisionInfo {
    division: string;
    tokens: string[];
}

export const JOURNAL_DIVISION_CATALOG: Record<string, JournalDivisionInfo> = {
    iaep: { division: 'Multidisiplin', tokens: [] },
    rjrakp: {
        division: 'Akuntansi & Keuangan Publik',
        tokens: ['akuntansi', 'accounting', 'audit', 'auditing', 'pajak', 'perpajakan', 'tax', 'keuangan', 'finance', 'anggaran', 'fiskal', 'publik'],
    },
    ajaf: {
        division: 'Akuntansi, Audit & Perpajakan',
        tokens: ['akuntansi', 'accounting', 'audit', 'auditing', 'pajak', 'perpajakan', 'tax', 'keuangan', 'finance', 'governansi'],
    },
    ajed: {
        division: 'Ekonomi Pembangunan & Keuangan',
        tokens: ['ekonomi', 'economics', 'pembangunan', 'keuangan', 'finance', 'moneter', 'kebijakan', 'ketenagakerjaan'],
    },
    ajep: {
        division: 'Pendidikan',
        tokens: ['pendidikan', 'education', 'kurikulum', 'pembelajaran', 'edukasi', 'sekolah', 'guru', 'dosen'],
    },
    ajce: {
        division: 'Teknik Sipil, Mesin & Elektro',
        tokens: ['teknik', 'sipil', 'mesin', 'elektro', 'civil', 'mechanical', 'electrical', 'engineering', 'infrastruktur', 'material', 'energi', 'terbarukan'],
    },
    ajafr: {
        division: 'Pertanian, Kehutanan & Perikanan',
        tokens: ['pertanian', 'agrikultur', 'agriculture', 'kehutanan', 'forestry', 'perikanan', 'fisheries', 'agroteknologi', 'agribisnis', 'pangan', 'food'],
    },
    ajadm: {
        division: 'Seni, Desain & Media Kreatif',
        tokens: ['seni', 'desain', 'design', 'media', 'kreatif', 'creative', 'visual', 'pertunjukan'],
    },
    ajir: {
        division: 'Ilmu Politik & Hubungan Internasional',
        tokens: ['politik', 'political', 'hubungan', 'internasional', 'international', 'diplomasi', 'keamanan', 'demokrasi', 'kebijakan'],
    },
    ajcs: {
        division: 'Pengabdian Kepada Masyarakat (PKM)',
        tokens: ['pengabdian', 'masyarakat', 'community', 'service', 'pemberdayaan', 'sosial', 'pelatihan', 'pendampingan'],
    },
    ajba: {
        division: 'Manajemen, Bisnis dan Administrasi',
        tokens: ['manajemen', 'management', 'bisnis', 'business', 'administrasi', 'administration', 'pemasaran', 'marketing', 'sumber', 'daya', 'manusia', 'kewirausahaan', 'entrepreneurship', 'organisasi'],
    },
    ajls: {
        division: 'Ilmu Hukum & Hak Asasi Manusia',
        tokens: ['hukum', 'law', 'perdata', 'pidana', 'tata', 'negara', 'internasional', 'sosiologi', 'hak', 'asasi', 'manusia', 'ham', 'legal'],
    },
    ajph: {
        division: 'Kedokteran, Kesehatan Masyarakat & Keperawatan',
        tokens: ['kedokteran', 'medicine', 'kesehatan', 'health', 'keperawatan', 'nursing', 'epidemiologi', 'klinis', 'medis'],
    },
    ajite: {
        division: 'Ilmu Komputer & Teknologi Informasi',
        tokens: ['komputer', 'computer', 'teknologi', 'informasi', 'information', 'technology', 'informatika', 'kecerdasan', 'buatan', 'artificial', 'intelligence', 'perangkat', 'lunak', 'software', 'siber', 'cyber', 'jaringan', 'network', 'data'],
    },
    ajssh: {
        division: 'Sosiologi & Ilmu Pengetahuan Budaya',
        tokens: ['sosiologi', 'sociology', 'antropologi', 'anthropology', 'sejarah', 'history', 'komunikasi', 'communication', 'filsafat', 'philosophy', 'budaya', 'cultural'],
    },
    ajes: {
        division: 'Ilmu Lingkungan & Keberlanjutan',
        tokens: ['lingkungan', 'environment', 'keberlanjutan', 'sustainability', 'iklim', 'climate', 'konservasi', 'amdal', 'ekologi'],
    },
    ajthm: {
        division: 'Pariwisata & Manajemen Perhotelan',
        tokens: ['pariwisata', 'tourism', 'perhotelan', 'hospitality', 'ekowisata', 'gastronomi', 'hotel'],
    },
    ajis: {
        division: 'Disiplin Ilmu Agama dan Peradaban Islam',
        tokens: ['islam', 'islamic', 'agama', 'religion', 'peradaban', 'syariah', 'sharia', 'tafsir', 'hadis', 'quran'],
    },
};

/**
 * Resolve divisi akademik dari identitas jurnal (slug atau nama).
 * Fallback: nama jurnal di-token-kan sebagai sinyal divisi lemah.
 */
export function resolveJournalDivision(journal: { name?: string | null; slug?: string | null } | null | undefined): JournalDivisionInfo & { source: string } {
    const slug = (journal?.slug || '').toLowerCase().trim();
    if (slug && JOURNAL_DIVISION_CATALOG[slug]) {
        return { ...JOURNAL_DIVISION_CATALOG[slug], source: 'catalog' };
    }
    const name = (journal?.name || '').trim();
    if (name) {
        // Pola "AJAF - ..." atau "AJITE (...)" → cocokkan prefix abbreviasi katalog
        const prefix = name.split(/[\s(–-]/)[0].toLowerCase();
        if (prefix && JOURNAL_DIVISION_CATALOG[prefix]) {
            return { ...JOURNAL_DIVISION_CATALOG[prefix], source: 'catalog' };
        }
        return {
            division: name,
            tokens: tokenize(name).filter(t => t !== 'apasific'),
            source: 'name-fallback',
        };
    }
    return { division: '', tokens: [], source: 'none' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitas teks (deterministik, tanpa dependensi eksternal)
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeText(value: string | null | undefined): string {
    return (value || '').toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\s-]/gi, ' ');
}

export function tokenize(value: string | null | undefined): string[] {
    return normalizeText(value)
        .split(/[\s-]+/)
        .map(t => t.trim())
        .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

/** Pecah daftar keyword berbentuk string ("a, b; c") atau array menjadi array bersih. */
export function splitKeywordList(value: string | string[] | null | undefined): string[] {
    if (!value) return [];
    const parts = Array.isArray(value)
        ? value.flatMap(v => String(v).split(/[,;]/))
        : String(value).split(/[,;]/);
    const out: string[] = [];
    for (const p of parts) {
        const clean = p.trim();
        if (clean) out.push(clean);
    }
    return Array.from(new Set(out.map(k => k.toLowerCase())));
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
    return Math.round(value * 10) / 10;
}

function normalizeAffiliation(value: string | null | undefined): string {
    return normalizeText(value).replace(/\s+/g, ' ').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Ekstraksi input dari baris submission
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abstrak submission dapat tersimpan sebagai JSON envelope:
 * { abstract_en, abstract_id, authors, keywords, ... } atau teks polos.
 */
export function parseAbstractEnvelope(raw: string | null | undefined): {
    abstractText: string;
    keywords: string[];
    authors: string[];
    publicationType: string | null;
} {
    const result = { abstractText: '', keywords: [] as string[], authors: [] as string[], publicationType: null as string | null };
    const text = (raw || '').trim();
    if (!text) return result;

    let parsed: Record<string, unknown> | null = null;
    if (text.startsWith('{')) {
        try {
            const obj = JSON.parse(text);
            if (obj && typeof obj === 'object') parsed = obj as Record<string, unknown>;
        } catch {
            parsed = null; // bukan JSON valid → perlakukan sebagai teks polos
        }
    }

    if (!parsed) {
        result.abstractText = text;
        return result;
    }

    const pickString = (v: unknown): string => (typeof v === 'string' ? v : '');
    result.abstractText =
        pickString(parsed.abstract_en) ||
        pickString(parsed.abstract_id) ||
        pickString(parsed.abstract) ||
        text;
    result.keywords = splitKeywordList(parsed.keywords as string | string[] | undefined);
    if (Array.isArray(parsed.authors)) {
        result.authors = parsed.authors
            .map((a) => {
                if (typeof a === 'string') return a;
                if (a && typeof a === 'object') {
                    const rec = a as Record<string, unknown>;
                    return pickString(rec.name) || pickString(rec.full_name);
                }
                return '';
            })
            .filter(Boolean);
    }
    result.publicationType = pickString(parsed.publicationType) || null;
    return result;
}

/**
 * Bangun `SubmissionMatchInput` dari baris tabel submissions + relasi jurnal.
 * Baris minimal: { id?, title, abstract, keywords, journals?: { name, slug } }
 */
export function extractSubmissionMatchInput(
    submission: Record<string, unknown> | null | undefined,
    journal?: { name?: string | null; slug?: string | null } | null
): SubmissionMatchInput {
    if (!submission) {
        return { title: '', abstract: '', keywords: [], academicDivision: '', divisionTokens: [], metadata: {} };
    }

    const envelope = parseAbstractEnvelope(
        typeof submission.abstract === 'string' ? (submission.abstract as string) : ''
    );

    // Keywords: gabungan kolom keywords + keywords dari envelope abstrak
    const columnKeywords = splitKeywordList(
        (submission.keywords as string | string[] | undefined) ?? ''
    );
    const keywords = Array.from(new Set([...columnKeywords, ...envelope.keywords]));

    const divisionInfo = resolveJournalDivision(journal ?? null);

    return {
        submissionId: typeof submission.id === 'string' ? (submission.id as string) : undefined,
        title: typeof submission.title === 'string' ? (submission.title as string) : '',
        abstract: envelope.abstractText,
        keywords,
        academicDivision: divisionInfo.division,
        divisionTokens: divisionInfo.tokens,
        metadata: {
            journalName: journal?.name ?? null,
            journalSlug: journal?.slug ?? null,
            publicationType: envelope.publicationType,
            divisionSource: divisionInfo.source,
            envelopeAuthors: envelope.authors,
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Agregasi statistik penugasan
// ─────────────────────────────────────────────────────────────────────────────

export interface AssignmentRecord {
    submission_id?: string | null;
    reviewer_id?: string | null;
    reviewer_email?: string | null;
    status?: string | null;
}

/**
 * Agregasi statistik penugasan per reviewer. Kunci map: reviewer_id DAN
 * email (lowercase) menunjuk ke objek yang sama, sehingga lookup dapat
 * dilakukan lewat salah satu kunci.
 */
export function aggregateAssignmentStats(assignments: AssignmentRecord[]): Record<string, ReviewerAssignmentStats> {
    const map: Record<string, ReviewerAssignmentStats> = {};

    const ensure = (key: string): ReviewerAssignmentStats => {
        const k = key.toLowerCase();
        if (!map[k]) map[k] = { active: 0, completed: 0, rejected: 0, total: 0 };
        return map[k];
    };

    for (const a of assignments || []) {
        const status = (a.status || '').toLowerCase();
        let stat: ReviewerAssignmentStats | null = null;

        if (a.reviewer_id && a.reviewer_email) {
            // Kedua kunci harus menunjuk objek statistik yang sama
            const idKey = a.reviewer_id.toLowerCase();
            const emailKey = a.reviewer_email.toLowerCase();
            if (!map[idKey] && !map[emailKey]) {
                map[idKey] = { active: 0, completed: 0, rejected: 0, total: 0 };
                map[emailKey] = map[idKey];
            } else if (!map[idKey]) {
                map[idKey] = map[emailKey];
            } else if (!map[emailKey]) {
                map[emailKey] = map[idKey];
            }
            stat = map[idKey];
        } else if (a.reviewer_id) {
            stat = ensure(a.reviewer_id);
        } else if (a.reviewer_email) {
            stat = ensure(a.reviewer_email);
        }
        if (!stat) continue;

        stat.total += 1;
        if (ACTIVE_ASSIGNMENT_STATUSES.includes(status)) stat.active += 1;
        else if (status === 'completed' || status === 'done') stat.completed += 1;
        else if (status === 'rejected' || status === 'declined') stat.rejected += 1;
    }

    return map;
}

/** Ambil stats via reviewer id lalu fallback ke email. */
export function lookupAssignmentStats(
    map: Record<string, ReviewerAssignmentStats>,
    reviewerId: string | null | undefined,
    reviewerEmail: string | null | undefined
): ReviewerAssignmentStats {
    if (reviewerId && map[reviewerId.toLowerCase()]) return map[reviewerId.toLowerCase()];
    if (reviewerEmail && map[reviewerEmail.toLowerCase()]) return map[reviewerEmail.toLowerCase()];
    return { active: 0, completed: 0, rejected: 0, total: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Kosakata keahlian reviewer
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewerVocabulary {
    /** Set token keahlian gabungan. */
    tokens: Set<string>;
    /** Teks mentah gabungan (lowercase) untuk phrase containment check. */
    rawText: string;
    /** Token yang berasal dari kolom bidang ilmu / discipline. */
    fieldTokens: string[];
}

/** Kumpulkan seluruh sinyal keahlian seorang reviewer dari berbagai bentuk field. */
export function collectReviewerVocabulary(reviewer: ReviewerPoolEntry): ReviewerVocabulary {
    const textParts: string[] = [];
    const fieldParts: string[] = [];

    const pushField = (v: unknown) => {
        if (typeof v === 'string' && v.trim()) {
            fieldParts.push(v);
            textParts.push(v);
        } else if (Array.isArray(v)) {
            for (const item of v) {
                if (typeof item === 'string' && item.trim()) {
                    fieldParts.push(item);
                    textParts.push(item);
                }
            }
        }
    };

    pushField(reviewer.academic_field);
    pushField(reviewer.field);
    pushField(reviewer.discipline);
    pushField(reviewer.expertise_area);
    pushField(reviewer.expertise);
    pushField(reviewer.keywords);
    pushField(reviewer.interests);

    const rawText = normalizeText(textParts.join(' ')).replace(/\s+/g, ' ').trim();
    const tokens = new Set<string>(tokenize(textParts.join(' ')));
    const fieldTokens = tokenize(fieldParts.join(' '));

    return { tokens, rawText, fieldTokens };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pemeriksaan konflik kepentingan
// ─────────────────────────────────────────────────────────────────────────────

export function checkConflictOfInterest(
    reviewer: ReviewerPoolEntry,
    author: SubmissionAuthorRef | null | undefined,
    assignedKeys: Set<string>
): ConflictCheckResult {
    const reasons: string[] = [];

    const reviewerId = (reviewer.id || '').toString().toLowerCase();
    const reviewerEmail = (reviewer.email || '').toString().toLowerCase().trim();
    const authorId = (author?.id || '').toString().toLowerCase();
    const authorEmail = (author?.email || '').toString().toLowerCase().trim();

    if (authorId && reviewerId && reviewerId === authorId) {
        reasons.push('Reviewer adalah penulis naskah ini');
    }
    if (authorEmail && reviewerEmail && reviewerEmail === authorEmail) {
        reasons.push('Email reviewer sama dengan email penulis');
    }

    // Kesamaan institusi (containment dua arah pada teks ternormalisasi)
    const reviewerInstitution = normalizeAffiliation(
        reviewer.university || reviewer.affiliation || reviewer.institution
    );
    const authorInstitution = normalizeAffiliation(author?.university || author?.affiliation);
    if (reviewerInstitution.length > 6 && authorInstitution.length > 6) {
        if (reviewerInstitution.includes(authorInstitution) || authorInstitution.includes(reviewerInstitution)) {
            reasons.push(`Satu institusi dengan penulis (${author?.university || author?.affiliation || 'institusi sama'})`);
        }
    }

    if ((reviewerId && assignedKeys.has(reviewerId)) || (reviewerEmail && assignedKeys.has(reviewerEmail))) {
        reasons.push('Sudah ditugaskan pada naskah ini');
    }

    return { hasConflict: reasons.length > 0, reasons };
}

// ─────────────────────────────────────────────────────────────────────────────
// Skor kandidat
// ─────────────────────────────────────────────────────────────────────────────

export interface ManuscriptSignal {
    titleTokens: string[];
    keywordTokens: string[];
    keywordPhrases: string[];
    abstractTokens: string[];
    divisionTokens: string[];
    /** token → bobot (untuk ranking matchedTerms). */
    tokenWeights: Map<string, number>;
}

const MAX_ABSTRACT_TOKENS = 300;

/** Ekstrak token sinyal dari input naskah. */
export function buildManuscriptSignal(input: SubmissionMatchInput): ManuscriptSignal {
    const titleTokens = tokenize(input.title);
    const keywordPhrases = (input.keywords || []).map(k => k.toLowerCase().trim()).filter(Boolean);
    const keywordTokens = Array.from(new Set(keywordPhrases.flatMap(p => tokenize(p))));
    const abstractTokens = tokenize(input.abstract).slice(0, MAX_ABSTRACT_TOKENS);
    const divisionTokens = (input.divisionTokens || []).slice();

    const tokenWeights = new Map<string, number>();
    const add = (tokens: string[], weight: number) => {
        for (const t of tokens) tokenWeights.set(t, (tokenWeights.get(t) || 0) + weight);
    };
    add(titleTokens, 3);
    add(keywordTokens, 5);
    add(divisionTokens, 2);
    add(abstractTokens, 1);

    return { titleTokens, keywordTokens, keywordPhrases, abstractTokens, divisionTokens, tokenWeights };
}

function overlapRatio(manuscriptTokens: string[], vocab: Set<string>): number {
    if (!manuscriptTokens.length) return 0;
    let hits = 0;
    const seen = new Set<string>();
    for (const t of manuscriptTokens) {
        if (seen.has(t)) continue;
        seen.add(t);
        if (vocab.has(t)) hits += 1;
    }
    return hits / seen.size;
}

interface SubScores {
    expertiseScore: number;
    availabilityScore: number;
    workloadScore: number;
    fieldMatchFactor: number;
    matchedTerms: string[];
}

/** Hitung seluruh sub-skor untuk satu kandidat terhadap satu naskah. */
export function computeSubScores(
    signal: ManuscriptSignal,
    reviewer: ReviewerPoolEntry,
    stats: ReviewerAssignmentStats
): SubScores {
    const vocabInfo = collectReviewerVocabulary(reviewer);
    const vocab = vocabInfo.tokens;

    // ── 1. Expertise match: overlap token naskah vs kosakata reviewer ──
    const titleRatio = overlapRatio(signal.titleTokens, vocab);
    const keywordRatio = overlapRatio(signal.keywordTokens, vocab);
    const abstractRatio = overlapRatio(signal.abstractTokens, vocab);
    const overlapScore = 0.45 * titleRatio + 0.30 * keywordRatio + 0.25 * abstractRatio;

    // ── 2. Academic field / division match ──
    // a) frasa keyword naskah muncul utuh di teks bidang reviewer
    let phraseHit = false;
    for (const phrase of signal.keywordPhrases) {
        if (phrase.length >= 4 && vocabInfo.rawText.includes(phrase)) { phraseHit = true; break; }
    }
    // b) token divisi jurnal hadir di bidang reviewer
    const divisionRatio = overlapRatio(signal.divisionTokens, vocab);
    // c) proporsi token bidang reviewer yang relevan dengan naskah
    const manuscriptSet = new Set<string>([
        ...signal.titleTokens,
        ...signal.keywordTokens,
        ...signal.divisionTokens,
    ]);
    const fieldSignalRatio = vocabInfo.fieldTokens.length
        ? overlapRatio(vocabInfo.fieldTokens, manuscriptSet)
        : 0;
    const fieldMatchFactor = clamp(Math.max(phraseHit ? 1 : 0, divisionRatio, fieldSignalRatio), 0, 1);

    const expertiseScore = clamp(Math.round(100 * (0.6 * overlapScore + 0.4 * fieldMatchFactor)), 0, 100);

    // ── 3. Availability: status + riwayat penolakan ──
    let availabilityScore = 100;
    const status = (reviewer.status || '').toLowerCase();
    const availabilityFlag = (reviewer.availability || '').toLowerCase();
    if (status === 'inactive' || status === 'non_active' || status === 'nonactive' || availabilityFlag === 'unavailable') {
        availabilityScore = 0;
    } else if (stats.total > 0 && stats.rejected > 0) {
        const penalty = Math.round(REJECTION_PENALTY_MAX * (stats.rejected / stats.total));
        availabilityScore = clamp(100 - penalty, 0, 100);
    }

    // ── 4. Workload + pengalaman ──
    const workloadBase = Math.max(0, 100 - WORKLOAD_PENALTY_PER_ACTIVE * stats.active);
    const experienceBonus = Math.min(EXPERIENCE_BONUS_MAX, EXPERIENCE_BONUS_PER_COMPLETED * stats.completed);
    const workloadScore = clamp(workloadBase + experienceBonus, 0, 100);

    // matchedTerms: token naskah yang ditemukan di kosakata reviewer, diurutkan berdasarkan bobot
    const matched = Array.from(signal.tokenWeights.entries())
        .filter(([t]) => vocab.has(t))
        .sort((a, b) => b[1] - a[1])
        .map(([t]) => t)
        .slice(0, 8);

    return { expertiseScore, availabilityScore, workloadScore, fieldMatchFactor, matchedTerms: matched };
}

/**
 * Skor + peringkat seluruh kandidat reviewer untuk satu naskah.
 * Kandidat berkonflik TETAP dikembalikan (dipenalti + ditandai),
 * karena keputusan akhir ada di tangan Editor.
 */
export function scoreReviewerCandidates(
    input: SubmissionMatchInput,
    reviewers: ReviewerPoolEntry[],
    statsByReviewer: Record<string, ReviewerAssignmentStats>,
    assignedReviewers: Array<{ reviewer_id?: string | null; reviewer_email?: string | null }>,
    author: SubmissionAuthorRef | null | undefined,
    options?: MatchingOptions
): ReviewerMatchResult[] {
    const weights: MatchingWeights = { ...DEFAULT_MATCHING_WEIGHTS, ...(options?.weights || {}) };
    const signal = buildManuscriptSignal(input);

    // Kunci kandidat yang sudah ditugaskan pada naskah ini
    const assignedKeys = new Set<string>();
    for (const a of assignedReviewers || []) {
        if (a.reviewer_id) assignedKeys.add(String(a.reviewer_id).toLowerCase());
        if (a.reviewer_email) assignedKeys.add(String(a.reviewer_email).toLowerCase().trim());
    }

    const results: ReviewerMatchResult[] = [];
    for (const reviewer of reviewers || []) {
        const reviewerId = reviewer.id != null ? String(reviewer.id) : '';
        const email = reviewer.email != null ? String(reviewer.email) : null;
        const fullName = String(reviewer.full_name || reviewer.name || email || 'Unknown Reviewer');
        const stats = lookupAssignmentStats(statsByReviewer, reviewerId || null, email);
        const sub = computeSubScores(signal, reviewer, stats);
        const conflictCheck = checkConflictOfInterest(reviewer, author, assignedKeys);

        let totalScore =
            weights.expertise * sub.expertiseScore +
            weights.availability * sub.availabilityScore +
            weights.workload * sub.workloadScore;
        if (conflictCheck.hasConflict) totalScore = Math.min(totalScore, CONFLICT_SCORE_CAP);
        totalScore = round1(totalScore);

        const academicField =
            (typeof reviewer.academic_field === 'string' && reviewer.academic_field) ||
            (typeof reviewer.field === 'string' && reviewer.field) ||
            (typeof reviewer.discipline === 'string' && reviewer.discipline) ||
            (typeof reviewer.expertise_area === 'string' && reviewer.expertise_area) ||
            (typeof reviewer.expertise === 'string' && reviewer.expertise) ||
            null;

        const reasons: string[] = [];
        if (conflictCheck.hasConflict) {
            for (const r of conflictCheck.reasons) reasons.push(`Konflik: ${r}`);
        }
        if (sub.expertiseScore >= 60 && sub.matchedTerms.length) {
            reasons.push(`Kecocokan keahlian kuat (${sub.matchedTerms.slice(0, 3).join(', ')})`);
        } else if (sub.matchedTerms.length) {
            reasons.push(`Beberapa istilah cocok (${sub.matchedTerms.slice(0, 3).join(', ')})`);
        }
        if (sub.fieldMatchFactor >= 0.99) reasons.push('Bidang keahlian sesuai fokus jurnal');
        if (stats.active === 0) reasons.push('Tidak ada beban review aktif');
        else reasons.push(`${stats.active} penugasan aktif berjalan`);
        if (stats.completed >= 3) reasons.push(`Berpengalaman (${stats.completed} review selesai)`);

        results.push({
            reviewerId: reviewerId || `email:${email}`,
            fullName,
            email,
            academicField: academicField ? String(academicField) : null,
            university: reviewer.university ? String(reviewer.university) : (reviewer.affiliation ? String(reviewer.affiliation) : null),
            country: reviewer.country ? String(reviewer.country) : null,
            expertiseScore: sub.expertiseScore,
            availabilityScore: sub.availabilityScore,
            workloadScore: sub.workloadScore,
            conflictCheck,
            totalScore,
            matchedTerms: sub.matchedTerms,
            reasons,
            activeAssignments: stats.active,
            completedAssignments: stats.completed,
            rank: 0,
        });
    }

    // Ranking: non-konflik dulu, totalScore ↓, expertiseScore ↓, nama ↑
    results.sort((a, b) => {
        if (a.conflictCheck.hasConflict !== b.conflictCheck.hasConflict) {
            return a.conflictCheck.hasConflict ? 1 : -1;
        }
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.expertiseScore !== a.expertiseScore) return b.expertiseScore - a.expertiseScore;
        return a.fullName.localeCompare(b.fullName);
    });

    results.forEach((r, i) => { r.rank = i + 1; });

    const limit = options?.limit && options.limit > 0 ? options.limit : undefined;
    return limit ? results.slice(0, limit) : results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Orkestrasi data (READ-ONLY)
// ─────────────────────────────────────────────────────────────────────────────

export class ReviewerMatchingService {
    /**
     * Bangun pool kandidat reviewer. Sumber data disamakan dengan
     * `getActiveReviewers` (editor.ts) agar kandidat yang direkomendasikan
     * selalu merupakan reviewer yang bisa dipilih manual oleh Editor:
     *   1. Tabel `profiles` dengan role mengandung "reviewer"
     *   2. `system_settings` keys apasific_registered_users/registered_users
     * Admin/co-admin dikecualikan; dedup berdasarkan email.
     *
     * @param supabaseAdmin Klien Supabase (service role) — hanya SELECT.
     */
    static async loadReviewerPool(supabaseAdmin: any): Promise<ReviewerPoolEntry[]> {
        let reviewers: ReviewerPoolEntry[] = [];

        // 1. Tabel profiles
        try {
            const { data: profiles, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .ilike('role', '%reviewer%');
            if (!profileError && Array.isArray(profiles)) {
                reviewers = profiles as ReviewerPoolEntry[];
            }
        } catch { /* lanjut dengan system_settings */ }

        // 2. system_settings (registered users JSON)
        try {
            const { data: settings, error: settingsError } = await supabaseAdmin
                .from('system_settings')
                .select('value')
                .in('key', ['apasific_registered_users', 'registered_users']);

            if (!settingsError && Array.isArray(settings) && settings.length > 0) {
                let allUsers: ReviewerPoolEntry[] = [];
                for (const s of settings) {
                    try {
                        const parsed = Array.isArray((s as any).value)
                            ? (s as any).value
                            : JSON.parse((s as any).value as string);
                        if (Array.isArray(parsed)) allUsers = allUsers.concat(parsed as ReviewerPoolEntry[]);
                    } catch { /* skip blob rusak */ }
                }
                const sysReviewers = allUsers.filter(u => {
                    const role = (u.role || '').toString().toLowerCase();
                    return role.includes('reviewer');
                });
                for (const sr of sysReviewers) {
                    const dup = reviewers.find(r =>
                        ((r.email || '') as string).toLowerCase() === ((sr.email || '') as string).toLowerCase()
                    );
                    if (!dup) reviewers.push(sr);
                }
            }
        } catch { /* abaikan — pool tetap dari profiles */ }

        // Kecualikan admin/co-admin (samakan dengan getActiveReviewers)
        reviewers = reviewers.filter(r => {
            const roleLower = (r.role || '').toString().toLowerCase();
            const isAdmin = roleLower.includes('admin') && roleLower !== 'co-admin' && roleLower !== 'co_admin';
            return !isAdmin;
        });

        return reviewers;
    }

    /**
     * Hitung rekomendasi reviewer untuk satu submission (READ-ONLY).
     * Tidak pernah menulis/menugaskan apa pun — hasilnya murni saran
     * peringkat untuk ditampilkan kepada Editor.
     *
     * @param supabaseAdmin Klien Supabase (service role) — hanya SELECT.
     * @param submissionId UUID submission.
     * @param options limit & weights opsional.
     */
    static async recommendForSubmission(
        supabaseAdmin: any,
        submissionId: string,
        options?: MatchingOptions
    ): Promise<RecommendationResult> {
        try {
            if (!supabaseAdmin || !submissionId) {
                return { success: false, error: 'Parameter tidak valid' };
            }

            // 1. Submission + jurnal relasi
            const { data: row, error: subError } = await supabaseAdmin
                .from('submissions')
                .select('id,title,abstract,keywords,author_id,submitter_email,submitter_name,journal_id,journals(name,slug)')
                .eq('id', submissionId)
                .maybeSingle();
            if (subError || !row) {
                return { success: false, error: 'Submission tidak ditemukan' };
            }

            const journal = (row as any).journals || null;
            const input = extractSubmissionMatchInput(row as Record<string, unknown>, journal);

            // 2. Profil penulis untuk pemeriksaan konflik kepentingan
            let author: SubmissionAuthorRef | null = {
                id: (row as any).author_id || null,
                email: (row as any).submitter_email || null,
                full_name: (row as any).submitter_name || null,
            };
            if (author.id) {
                try {
                    const { data: profileRow } = await supabaseAdmin
                        .from('profiles')
                        .select('*')
                        .eq('id', author.id)
                        .maybeSingle();
                    if (profileRow) {
                        const p = profileRow as Record<string, unknown>;
                        if (typeof p.email === 'string') author.email = p.email;
                        if (typeof p.full_name === 'string') author.full_name = p.full_name;
                        if (typeof p.university === 'string') author.university = p.university;
                        if (typeof p.affiliation === 'string') author.affiliation = p.affiliation;
                    }
                } catch { /* COI tetap jalan dengan submitter info */ }
            }

            // 3. Pool kandidat reviewer
            const pool = await ReviewerMatchingService.loadReviewerPool(supabaseAdmin);
            if (!pool.length) {
                return {
                    success: true,
                    submissionId,
                    academicDivision: input.academicDivision,
                    poolSize: 0,
                    recommendations: [],
                };
            }

            // 4. Penugasan: statistik beban kerja + penugasan pada naskah ini
            let assignments: AssignmentRecord[] = [];
            try {
                const { data: assignmentRows, error: assignmentError } = await supabaseAdmin
                    .from('review_assignments')
                    .select('submission_id,reviewer_id,reviewer_email,status');
                if (!assignmentError && Array.isArray(assignmentRows)) {
                    assignments = assignmentRows as AssignmentRecord[];
                }
            } catch { /* statistik tetap kosong → workload netral */ }

            const statsByReviewer = aggregateAssignmentStats(assignments);
            const assignedToSubmission = assignments.filter(a => a.submission_id === submissionId);

            // 5. Skor + peringkat
            const recommendations = scoreReviewerCandidates(
                input,
                pool,
                statsByReviewer,
                assignedToSubmission,
                author,
                options
            );

            return {
                success: true,
                submissionId,
                academicDivision: input.academicDivision,
                poolSize: pool.length,
                recommendations,
            };
        } catch (err: any) {
            return { success: false, error: err?.message || 'Gagal menghitung rekomendasi reviewer' };
        }
    }
}
