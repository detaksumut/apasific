/**
 * Centralized Permission Service
 * 
 * Single source of truth for role-based access control.
 * All role checks should reference these constants/helpers — 
 * never hardcode role strings scattered across the codebase.
 */

// ─── Status yang boleh dilihat Co-Admin ────────────────────────────────────
export const CO_ADMIN_ALLOWED_STATUSES = [
  'Submitted',
  'submitted',
  'Pending',
  'pending',
  'Awaiting Reviewers',
  'awaiting reviewers',
  'Reviewer Assigned',
  'reviewer assigned',
  'Under Review',
  'under review',
  'Review Pending',
  'review pending',
];

// ─── Tab yang boleh diakses Co-Admin pada halaman detail naskah ─────────────
export const CO_ADMIN_ALLOWED_TABS = ['submission', 'review'];

// ─── Aksi server yang DILARANG untuk Co-Admin ───────────────────────────────
// Digunakan oleh server actions untuk melakukan pengecekan server-side.
export const CO_ADMIN_BLOCKED_ACTIONS = [
  'recordEditorialDecision',
  'updateDoi',
  'publishToZenodo',
  'uploadGalley',
  'sendToSupervisor',
  'deleteSubmission',
];

// ─── Role Helpers ─────────────────────────────────────────────────────────
export function isCoAdmin(role: string): boolean {
  const r = (role || '').toLowerCase();
  return r === 'co_admin' || r === 'co-admin';
}

export function isEditorOrAbove(role: string): boolean {
  const r = (role || '').toLowerCase();
  return (
    r.includes('editor') ||
    r.includes('admin') ||
    r.includes('supervisor')
  ) && !isCoAdmin(role);
}

export function isAdmin(role: string): boolean {
  const r = (role || '').toLowerCase();
  return (r === 'admin' || r === 'superadmin' || r === 'super_admin') && !isCoAdmin(role);
}

/**
 * Returns true if the given submission status is accessible to a Co-Admin.
 * Use this instead of hardcoding status strings in page components.
 */
export function canCoAdminAccessSubmission(status: string): boolean {
  return CO_ADMIN_ALLOWED_STATUSES.map(s => s.toLowerCase()).includes(
    (status || '').toLowerCase()
  );
}

/**
 * Returns true if the given tab is accessible to a Co-Admin.
 */
export function canCoAdminAccessTab(tab: string): boolean {
  return CO_ADMIN_ALLOWED_TABS.includes((tab || '').toLowerCase());
}
