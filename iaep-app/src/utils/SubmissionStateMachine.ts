/**
 * SubmissionStateMachine — aturan transisi status naskah.
 *
 * Sumber kebenaran kosakata status/level ada di
 * `src/domain/submission/SubmissionStatus.ts`. Modul ini menyediakan aturan
 * transisi yang dipakai oleh `SubmissionLifecycleService` sebagai satu-satunya
 * gerbang perubahan status naskah.
 */
import {
    STATUS_LEVELS,
    SUBMISSION_STATUS,
    isKnownSubmissionStatus,
    isTerminalSubmissionStatus,
} from '../domain/submission/SubmissionStatus';

export { STATUS_LEVELS };

// Fase review (level 2–4): status di dalam fase ini boleh bergerak bebas
// (misal: reviewer kedua menerima tugas setelah reviewer pertama selesai →
// 'Reviewed' kembali ke 'Under Review', atau reviewer menolak tugas →
// kembali ke 'Awaiting Reviewers').
const REVIEW_PHASE_MIN_LEVEL = 2;
const REVIEW_PHASE_MAX_LEVEL = 4;

export interface TransitionValidation {
    valid: boolean;
    reason?: string;
}

/**
 * Pengecualian downgrade eksplisit (transisi mundur yang sah secara bisnis).
 */
const DOWNGRADE_EXCEPTIONS: {
    to: string;
    maxFromLevel: number;
    fromStatuses?: string[];
}[] = [
    // Koreksi editorial: naskah yang sudah Accepted dapat dikembalikan ke revisi.
    // (Status terminal sudah diblokir lebih dulu, jadi efektif hanya dari 'Accepted'.)
    { to: SUBMISSION_STATUS.NEEDS_REVISION, maxFromLevel: 5 },
    { to: SUBMISSION_STATUS.REVISION_REQUIRED, maxFromLevel: 5 },

    // Production correction:
    // Editor may return a manuscript from Layout to the revision stage.
    // This is intentionally restricted to Assigned to Layout only.
    {
        to: SUBMISSION_STATUS.NEEDS_REVISION,
        maxFromLevel: 6,
        fromStatuses: [SUBMISSION_STATUS.ASSIGNED_TO_LAYOUT],
    },
    {
        to: SUBMISSION_STATUS.REVISION_REQUIRED,
        maxFromLevel: 6,
        fromStatuses: [SUBMISSION_STATUS.ASSIGNED_TO_LAYOUT],
    },
];

/**
 * Mendapatkan bobot kemajuan (progress level) dari suatu status.
 */
export function getStatusLevel(status: string): number {
    if (!status) return 0;
    return STATUS_LEVELS[status] || 0;
}

/**
 * Validasi transisi status dengan hasil + alasan terstruktur.
 *
 * Aturan:
 * 1. Status target harus dikenal domain (mencegah string typo/liar).
 * 2. Perpindahan ke status yang sama selalu diizinkan (no-op).
 * 3. Status terminal (Published/Rejected/Declined) terkunci.
 * 4. Status asal tak dikenal (data legacy) diizinkan — normalisasi progresif.
 * 5. Pergerakan maju atau setara level selalu diizinkan.
 * 6. Di dalam fase review (level 2–4) pergerakan bebas diizinkan.
 * 7. Pengecualian downgrade eksplisit (koreksi editorial).
 */
export function validateTransition(fromStatus: string, toStatus: string): TransitionValidation {
    if (!toStatus || !isKnownSubmissionStatus(toStatus)) {
        return { valid: false, reason: `Status target tidak dikenal: "${toStatus}"` };
    }

    if (fromStatus === toStatus) return { valid: true };

    if (fromStatus && isTerminalSubmissionStatus(fromStatus)) {
        return { valid: false, reason: `Naskah berstatus terminal "${fromStatus}" tidak dapat dipindahkan lagi` };
    }

    const fromLevel = getStatusLevel(fromStatus);
    // Status asal tidak dikenali (data legacy) → izinkan (normalisasi progresif)
    if (fromLevel === 0) return { valid: true };

    const toLevel = getStatusLevel(toStatus);
    // Izinkan pergerakan maju atau setara level
    if (toLevel >= fromLevel) return { valid: true };

    // Pergerakan bebas di dalam fase review
    if (
        fromLevel >= REVIEW_PHASE_MIN_LEVEL && fromLevel <= REVIEW_PHASE_MAX_LEVEL &&
        toLevel >= REVIEW_PHASE_MIN_LEVEL && toLevel <= REVIEW_PHASE_MAX_LEVEL
    ) {
        return { valid: true };
    }

    // Pengecualian downgrade eksplisit
    for (const ex of DOWNGRADE_EXCEPTIONS) {
        const fromAllowed =
            !ex.fromStatuses || ex.fromStatuses.includes(fromStatus);

        if (
            toStatus === ex.to &&
            fromLevel <= ex.maxFromLevel &&
            fromAllowed
        ) {
            return { valid: true };
        }
    }

    return { valid: false, reason: `Transisi status tidak valid: "${fromStatus}" → "${toStatus}"` };
}

/**
 * Validasi apakah naskah boleh berpindah dari status lama ke status baru.
 * Mencegah penurunan status (downgrade) kecuali direset admin secara khusus.
 */
export function canTransition(fromStatus: string, toStatus: string): boolean {
    return validateTransition(fromStatus, toStatus).valid;
}

/**
 * Mengunci DOI agar tidak dapat diubah/dihapus jika sudah terdaftar di database.
 */
export function isDoiImmutable(existingDoi: string | null, newDoi: string | null): boolean {
    if (existingDoi && existingDoi.trim() !== '') {
        // Jika DOI baru kosong atau berbeda, proteksi (tidak boleh ditimpa)
        if (!newDoi || newDoi.trim() === '' || existingDoi.trim() !== newDoi.trim()) {
            return true;
        }
    }
    return false;
}




