# IAEP Code Cleanup Plan

* **Version**: 1.0 (RC-1 Audit)
* **Status**: FROZEN (Audit Only)
* **Domain**: Code Quality & Refactoring

---

## 1. Daftar Berkas & Komponen Tidak Terpakai (Candidate for Deletion)
Berdasarkan hasil audit struktural kode sumber, berkas berikut diidentifikasi tidak memiliki dependensi aktif dan direkomendasikan untuk dihapus pasca rilis stabil:

- **Komponen Presentasi Cadangan:**
  - `src/components/ui/unused-dropdown.tsx` (Digantikan oleh Dropdown modular terpusat).
- **Service Obsolete:**
  - `src/services/metrics/OldEditorialIntelligence.ts` (Seluruh metrik telah dimigrasikan ke kelas baru).
- **Berkas Migrasi SQL Yatim Piatu:**
  - `supabase/migrations/20260701000000_temp_test_setup.sql` (Hanya digunakan saat inisiasi mockup awal).

---

## 2. Tindakan Selanjutnya (Post Release Stabil)
Pembersihan akan dijadwalkan pada Sprint pemeliharaan berikutnya setelah Release Candidate 1 dideploy secara resmi.
