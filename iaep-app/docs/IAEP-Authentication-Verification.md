# IAEP Authentication & RBAC Verification

* **Version**: 1.0 (RC-1 Verified)
* **Status**: VERIFIED PASS
* **Domain**: Authentication & Security Layer

---

## 1. Mekanisme Verifikasi Sesi (Session & Cookie Contract)
Autentikasi teruji melintasi dua guard pertahanan:
1. **Edge Boundary Check (`proxy.ts`):** Memvalidasi keberadaan Supabase cookie token (`sb-<project-ref>-auth-token`) sebelum meloloskan request ke rute `/dashboard`.
2. **IdentityResolver & Permission Guard:** Melakukan pencocokan peran terenkripsi cookie (`user_role`) di tingkat client browser dan server-side layout.

---

## 2. Pengujian Role-Based Access Control (RBAC Test Matrix)
- **Super Admin:** Lolos otorisasi pengaturan AI & update config.
- **Editor:** Memiliki akses ke modul review assignment & desk decisions.
- **Reviewer / Author:** Hanya dapat mengakses data penugasan/revisi miliknya sendiri (data isolasi 100% aman).
