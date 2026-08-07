export const STATUS_LEVELS: Record<string, number> = {
  'queued': 1,
  'Awaiting Reviewers': 2,
  'Under Review': 3,
  'Reviewed': 4,
  'Needs Revision': 4,
  'Revision Submitted': 4,
  'Accepted': 5,
  'Copyediting': 5,
  'Production': 6,
  'Pending Supervisor': 6,
  'Production Completed': 7,
  'Published': 8,
  'published': 8
};

/**
 * Mendapatkan bobot kemajuan (progress level) dari suatu status.
 */
export function getStatusLevel(status: string): number {
  if (!status) return 0;
  return STATUS_LEVELS[status] || 0;
}

/**
 * Validasi apakah naskah boleh berpindah dari status lama ke status baru.
 * Mencegah penurunan status (downgrade) kecuali direset admin secara khusus.
 */
export function canTransition(fromStatus: string, toStatus: string): boolean {
  const fromLevel = getStatusLevel(fromStatus);
  const toLevel = getStatusLevel(toStatus);

  // Jika status asal tidak dikenali, izinkan
  if (fromLevel === 0) return true;

  // Izinkan perubahan status jika levelnya naik atau setara (misal sesama tingkat review)
  return toLevel >= fromLevel;
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
