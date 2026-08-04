/**
 * Domain: Kosakata status & stage siklus hidup Submission (SSOT).
 *
 * Semua nilai string di sini adalah nilai riil yang dipakai di database dan UI
 * produksi — jangan mengubah nilai string-nya tanpa migrasi data, karena UI
 * (filter daftar, badge, tombol tahap) bergantung pada string persis ini.
 *
 * Alur normal:
 *   queued/Submitted/pending → Awaiting Reviewers → Under Review →
 *   Reviewed / Needs Revision / Revision Required → (revisi: Revision Submitted
 *   → Revision Under Review → Reviewed) → Accepted → Assigned to Layout →
 *   Assigned to Cover → Assigned to Publish → Pending Supervisor →
 *   Production Completed → Published
 *
 * Status terminal (tidak boleh berpindah lagi kecuali override admin):
 *   Published / published / Rejected / Declined
 */

export const SUBMISSION_STATUS = {
    // ── Intake (antrian submisi baru) ──
    QUEUED: 'queued',
    SUBMITTED: 'Submitted',
    SUBMITTED_LEGACY: 'submitted',
    PENDING: 'pending',

    // ── Screening ──
    AWAITING_REVIEWERS: 'Awaiting Reviewers',

    // ── Review ──
    UNDER_REVIEW: 'Under Review',
    REVIEWED: 'Reviewed',
    NEEDS_REVISION: 'Needs Revision',
    REVISION_REQUIRED: 'Revision Required', // varian dari UI MakeDecisionAction
    REVISION_SUBMITTED: 'Revision Submitted',
    REVISION_UNDER_REVIEW: 'Revision Under Review',

    // ── Keputusan editorial ──
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',   // varian dari UI MakeDecisionAction
    DECLINED: 'Declined',   // varian dari recordEditorialDecision
    DESK_REJECT: 'Desk Reject', // desk rejection dari drawer Incoming (IncomingActionButtons)

    // ── Copyediting ──
    ASSIGNED_TO_LAYOUT: 'Assigned to Layout',
    IN_LAYOUT: 'In Layout',
    ASSIGNED_TO_COVER: 'Assigned to Cover',

    // ── Produksi ──
    ASSIGNED_TO_PUBLISH: 'Assigned to Publish',
    ASSIGNED_TO_PUBLISHER: 'Assigned to Publisher', // varian legacy pada filter dashboard
    PENDING_SUPERVISOR: 'Pending Supervisor',
    PRODUCTION_COMPLETED: 'Production Completed',

    // ── Terbit ──
    PUBLISHED: 'Published',
    PUBLISHED_LEGACY: 'published',
} as const;

/** Seluruh nilai status submission yang dikenal sistem. */
export const SUBMISSION_STATUS_VALUES: readonly string[] = Object.values(SUBMISSION_STATUS);

/**
 * Bobot kemajuan (progress level) per status.
 * Semakin tinggi level, semakin maju posisi naskah dalam pipeline.
 * Fase: 1 = intake, 2–4 = review, 5 = keputusan editorial,
 *       6 = copyediting/produksi, 7 = produksi selesai, 8 = terbit.
 */
export const STATUS_LEVELS: Record<string, number> = {
    // Intake
    [SUBMISSION_STATUS.QUEUED]: 1,
    [SUBMISSION_STATUS.SUBMITTED]: 1,
    [SUBMISSION_STATUS.SUBMITTED_LEGACY]: 1,
    [SUBMISSION_STATUS.PENDING]: 1,

    // Screening & Review
    [SUBMISSION_STATUS.AWAITING_REVIEWERS]: 2,
    [SUBMISSION_STATUS.UNDER_REVIEW]: 3,
    [SUBMISSION_STATUS.REVIEWED]: 4,
    [SUBMISSION_STATUS.NEEDS_REVISION]: 4,
    [SUBMISSION_STATUS.REVISION_REQUIRED]: 4,
    [SUBMISSION_STATUS.REVISION_SUBMITTED]: 4,
    [SUBMISSION_STATUS.REVISION_UNDER_REVIEW]: 4,

    // Keputusan editorial
    [SUBMISSION_STATUS.ACCEPTED]: 5,
    [SUBMISSION_STATUS.REJECTED]: 5,
    [SUBMISSION_STATUS.DECLINED]: 5,
    [SUBMISSION_STATUS.DESK_REJECT]: 5,
    'Copyediting': 5, // legacy: stage yang pernah tersimpan sebagai status

    // Copyediting & Produksi (satu plateau — bebas bergerak di dalamnya)
    [SUBMISSION_STATUS.ASSIGNED_TO_LAYOUT]: 6,
    [SUBMISSION_STATUS.IN_LAYOUT]: 6,
    [SUBMISSION_STATUS.ASSIGNED_TO_COVER]: 6,
    [SUBMISSION_STATUS.ASSIGNED_TO_PUBLISH]: 6,
    [SUBMISSION_STATUS.ASSIGNED_TO_PUBLISHER]: 6,
    [SUBMISSION_STATUS.PENDING_SUPERVISOR]: 6,
    'Production': 6, // legacy: stage yang pernah tersimpan sebagai status

    // Selesai produksi & terbit
    [SUBMISSION_STATUS.PRODUCTION_COMPLETED]: 7,
    [SUBMISSION_STATUS.PUBLISHED]: 8,
    [SUBMISSION_STATUS.PUBLISHED_LEGACY]: 8,
};

/**
 * Status terminal — naskah tidak boleh berpindah status lagi
 * (kecuali override eksplisit admin melalui lifecycle service).
 */
export const TERMINAL_SUBMISSION_STATUSES: readonly string[] = [
    SUBMISSION_STATUS.REJECTED,
    SUBMISSION_STATUS.DECLINED,
    SUBMISSION_STATUS.DESK_REJECT,
    SUBMISSION_STATUS.PUBLISHED,
    SUBMISSION_STATUS.PUBLISHED_LEGACY,
];

/** Nilai stage (tahap besar) submission yang dikenal sistem. */
export const SUBMISSION_STAGE = {
    REVIEW: 'Review',
    COPYEDITING: 'Copyediting',
    PRODUCTION: 'Production',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
} as const;

export const SUBMISSION_STAGE_VALUES: readonly string[] = Object.values(SUBMISSION_STAGE);

/** Apakah nilai status dikenal oleh domain? */
export function isKnownSubmissionStatus(status: string | null | undefined): boolean {
    if (!status) return false;
    return SUBMISSION_STATUS_VALUES.includes(status);
}

/** Apakah status bersifat terminal (terbit / ditolak)? */
export function isTerminalSubmissionStatus(status: string | null | undefined): boolean {
    if (!status) return false;
    return TERMINAL_SUBMISSION_STATUSES.includes(status);
}

/** Apakah nilai stage dikenal oleh domain? */
export function isKnownSubmissionStage(stage: string | null | undefined): boolean {
    if (!stage) return false;
    return SUBMISSION_STAGE_VALUES.includes(stage);
}

