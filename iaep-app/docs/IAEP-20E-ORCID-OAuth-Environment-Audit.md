# IAEP-20E - ORCID OAuth Environment & SSO Audit Report

Laporan audit komprehensif terhadap implementasi ORCID OAuth dan mekanisme Single Sign-On (SSO) di platform IAEP sebelum dilakukannya refactoring arsitektural.

---

## 1. Audit Target & Route Identifications

Terdapat 3 komponen utama dalam penanganan ORCID OAuth di platform IAEP saat ini:

### A. Provider Logic: `src/providers/orcid/ORCIDProvider.ts`
- **Tanggung Jawab**: Membangun URL otorisasi, melakukan token exchange server-side, verifikasi identitas personal, pushing metadata publikasi ke profil ORCID, serta enkripsi/dekripsi token sensitif.
- **Dependency**: Bertumpu pada `ProviderRuntimeManager` untuk eksekusi request eksternal.

### B. OAuth Initiation Route: `/api/auth/orcid` (`src/app/api/auth/orcid/route.ts`)
- **Tanggung Jawab**: Membuat state CSRF acak, menyimpannya dalam cookies browser, dan mengalihkan browser pengguna ke authorize endpoint ORCID eksternal.

### C. OAuth Callback Route: `/api/auth/orcid/callback` (`src/app/api/auth/orcid/callback/route.ts`)
- **Tanggung Jawab**: Memverifikasi state CSRF, menukarkan authorization code dengan access token, melakukan query pencocokan profil di Supabase DB, memetakan keputusan penautan identitas (decision matrix), dan mengarahkan pengguna ke halaman registrasi (`/auth/complete-registration`), penautan akun (`/auth/link-orcid`), atau langsung ke dashboard (`/dashboard/member`).

---

## 2. Gap Analysis & Security Vulnerabilities

Audit menemukan celah keamanan dan stabilitas operasional berikut pada implementasi orisinal:

1. **No Fail-Fast Configuration Checks**:
   - Sistem tidak memvalidasi konfigurasi startup secara ketat. Jika variabel environment (`ORCID_CLIENT_ID`, `ORCID_CLIENT_SECRET`) kosong atau mengandung whitespace, server akan tetap mencoba mengalihkan pengguna yang berujung pada error redirect rusak.
2. **Missing Rate Limiting & Circuit Breaker**:
   - Inisiasi OAuth di `/api/auth/orcid` tidak dibatasi rate limit per IP/Session.
   - Tidak ada Circuit Breaker yang melindungi alur masuk jika server ORCID down, yang dapat menyebabkan request terus-menerus membebani server IAEP.
3. **SSO Cookies Hardening Gaps**:
   - Cookies state CSRF dan registration metadata belum di-hardened dengan `SameSite=Lax`, `Secure=true` secara konsisten pada semua browser, dan belum dirotasi secara dinamis.
4. **Callback Idempotency & Session Fixation Protection**:
   - Callback belum dilindungi dari pemanggilan ganda (idempotency checks).
   - Session ID belum diregenerasi secara instan setelah login berhasil, meningkatkan risiko session fixation.
5. **No Structured Health Checks**:
   - Belum tersedia API endpoint terproteksi untuk memeriksa kesehatan modul ORCID secara real-time (`/api/admin/orcid-health`).

---

## 3. Architecture Validation Checklist

Verifikasi pembatasan arsitektur sebelum implementasi:
- [x] **Identity Core**: Tidak ada perubahan skema tabel internal.
- [x] **Authentication Runtime**: Hanya diperluas secara kompatibel.
- [x] **RBAC**: Tidak ada perubahan level otorisasi.
- [x] **Membership & Submission**: Tidak ada modifikasi workflow inti naskah.

**Discovery Audit PASS. Prosedur Refactoring Phase 3 siap dilaksanakan.**
