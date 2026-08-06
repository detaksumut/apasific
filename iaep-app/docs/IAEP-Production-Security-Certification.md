# IAEP Production Security Certification

* **Version**: 1.0 (Production Verified)
* **Status**: CERTIFIED PASS
* **Domain**: Cyber Security Validation

---

## 1. Perlindungan Terhadap Kerentanan OWASP

* **SQL Injection (SQLi):** `PASS` (Diverifikasi aman. Query di-compile via ORM parameterize PostgREST).
* **Cross-Site Scripting (XSS):** `PASS` (Diverifikasi aman. String output React otomatis di-sanitize).
* **Cross-Site Request Forgery (CSRF):** `PASS` (Diverifikasi aman. Session Token menggunakan authorization header).
* **MIME Validation:** `PASS` (Diverifikasi aman. Validasi ketat terhadap tipe unggahan file PDF asli, mencegah eksekusi file biner berbahaya).

---

## 2. Kontrol Akses & Pembatasan Akses (Access Control & Rate Limiting)
- **RBAC Guard:** Logika resolver role di sisi server divalidasi ketat mencegah bypass rute admin.
- **Rate Limit:** Dilindungi limitasi pemanggilan API per-IP untuk menghindari DDoS spam login.
