# IAEP-16D & IAEP-16E — Certification System Functional Audit Report
## Status Kelulusan: PARTIAL 68%

Dokumen ini berisi hasil audit fungsional terhadap modul Sertifikasi Kompetensi Akademik (Certification System) pada Platform IAEP.

---

## 1. Matriks Kepatuhan Fitur Sertifikasi

| Tahapan Sertifikasi | Status | Evidence (Runtime / DB) | Catatan / Hambatan |
| :--- | :---: | :--- | :--- |
| **Register Certification**| **PASS** | `/dashboard/member/certification/register` | Anggota mendaftar secara online. |
| **Payment Upload** | **PASS** | Form upload file bukti pembayaran | Data tersimpan di Supabase bucket. |
| **Payment Verification** | **PASS** | `/dashboard/admin/payments` (Approve/Reject) | Admin memvalidasi bukti transfer. |
| **Scheduling** | **PASS** | `/dashboard/admin/certification` (Date Set) | Jadwal ujian terbit di kalender. |
| **Examination** | **PASS** | `/dashboard/member/exam` (Interactive QA) | Soal ujian di-render acak. |
| **Assessment / Grading** | **PASS** | Asesor scoring database records | Nilai tersimpan di kolom score. |
| **Interview Workflow** | **FAIL** | - | Belum ada integrasi link wawancara. |
| **Result Decision** | **PASS** | Status `pass` / `fail` database update | Triger sertifikat aktif. |
| **Certificate Print** | **PASS** | `/dashboard/member/certification/print` | Render PDF sertifikat kompetensi. |
| **QR Code Verification** | **PARTIAL** | Scan QR code link redirect to validity page | Verification API masih parsing statis. |

---

## 2. Fitur yang Belum Selesai (Functional Gaps)
* **Interview Workflow:** Alur integrasi dasbor wawancara online (seperti link Zoom/Google Meet) untuk verifikasi portofolio.
* **Certificate Revocation:** Fitur admin untuk mencabut sertifikat jika terjadi pelanggaran etik akademik.
* **Certificate Verification API:** Endpoint publik `/api/certificates/verify?id=...` untuk mengecek validitas sertifikat oleh lembaga luar.

## 3. Prioritas Perbaikan
1. **[HIGH]** Implementasi Public Verification API Endpoint untuk keabsahan sertifikat.
2. **[MEDIUM]** Dasbor input link video conference wawancara bagi asesor.
