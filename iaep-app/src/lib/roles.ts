/**
 * Centralized Role Normalization Service (RBAC)
 *
 * Single source of truth for mapping raw role strings (from Supabase
 * profiles, the `user_role` cookie, or Firestore legacy records) to
 * normalized application roles.
 *
 * All login redirects and dashboard access checks MUST go through
 * `normalizeRole()` / `getDashboardPath()` instead of comparing raw
 * role strings — this removes the login/redirect inconsistencies
 * caused by role variants ("super_admin" vs "superadmin", "co-admin"
 * vs "co_admin", "Layout Editor", etc.).
 */

export type NormalizedRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'REVIEWER'
  | 'PRODUCTION';

/** Raw (lowercased) role string → normalized role. */
const ROLE_MAP: Record<string, NormalizedRole> = {
  'super_admin': 'SUPER_ADMIN',
  'superadmin': 'SUPER_ADMIN',
  'admin': 'ADMIN',
  'co_admin': 'ADMIN',
  'co-admin': 'ADMIN',
  'editor': 'EDITOR',
  'reviewer': 'REVIEWER',
  'layout editor': 'PRODUCTION',
  'cover editor': 'PRODUCTION',
  'publish editor': 'PRODUCTION',
  'admin editor': 'PRODUCTION',
};

/**
 * Normalizes a raw role string into a NormalizedRole.
 * Returns null for unknown/empty roles (e.g. "author") — callers must
 * treat null as "no staff dashboard access".
 */
export function normalizeRole(raw: string | null | undefined): NormalizedRole | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  return ROLE_MAP[key] || null;
}

/**
 * Maps production sub-roles to their dedicated dashboard page.
 * Falls back to the supervisor view for "admin editor" or when the
 * raw role is already normalized.
 */
export function getProductionPath(raw: string | null | undefined): string {
  const r = (raw || '').trim().toLowerCase();
  if (r.includes('layout')) return '/dashboard/production/layout';
  if (r.includes('cover')) return '/dashboard/production/cover';
  if (r.includes('publish')) return '/dashboard/production/publish';
  return '/dashboard/production/supervisor';
}

/** True when the raw role is a Co-Admin variant (before ADMIN normalization). */
export function isCoAdminRole(raw: string | null | undefined): boolean {
  const r = (raw || '').trim().toLowerCase();
  return r === 'co_admin' || r === 'co-admin';
}

/**
 * Returns the landing dashboard path for a raw role string,
 * or null when the role has no staff dashboard (e.g. authors).
 *
 * Note: Co-Admins normalize to ADMIN for RBAC purposes, but they land in
 * the dedicated co-admin portal because /dashboard/admin is restricted
 * to full admins by AdminLayout.
 */
export function getDashboardPath(raw: string | null | undefined): string {
  if (isCoAdminRole(raw)) return '/dashboard/co-admin/naskah-masuk';
  switch (normalizeRole(raw)) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/dashboard/admin';
    case 'EDITOR':
      return '/dashboard/editor';
    case 'REVIEWER':
      return '/dashboard/reviews';
    case 'PRODUCTION':
      return getProductionPath(raw);
    default:
      // author and all unknown roles → Author Dashboard
      return '/dashboard';
  }
}

/** True when the raw role normalizes to REVIEWER. */
export function isReviewer(raw: string | null | undefined): boolean {
  return normalizeRole(raw) === 'REVIEWER';
}

/** True when the raw role normalizes to ADMIN or SUPER_ADMIN. */
export function isAdminRole(raw: string | null | undefined): boolean {
  const r = normalizeRole(raw);
  return r === 'ADMIN' || r === 'SUPER_ADMIN';
}
