# IAEP Production Transition & Go-Live Plan

* **Version**: 1.0 (Operational Guideline)
* **Status**: APPROVED
* **Domain**: Release Management & Operations

---

## 1. Production Release Tagging Protocol
Sebelum mempublikasikan kode ke server produksi, wajib menandai status kode Release Candidate 2 untuk kemudahan rollback:

```bash
# Tandai Release Candidate 2
git tag -a v1.0.0-rc2 -m "IAEP Release Candidate 2"
git push origin v1.0.0-rc2

# Setelah Production Acceptance Test (PAT) Lolos di Server Produksi
git tag -a v1.0.0 -m "IAEP Production Release"
git push origin v1.0.0
```

---

## 2. Production Deployment Checklist
Lakukan migrasi infrastruktur dengan panduan checklist berikut:

* [ ] **Supabase Production:** Gunakan instance Supabase terpisah khusus produksi (bukan sandbox/dev). Jalankan migrasi schema SQL.
* [ ] **Environment Variables:** Setel semua key production untuk:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Credentials resmi DOI, SMTP Mail Server, Zenodo API, dan Crossref API.
* [ ] **SSL & Domain Mapping:** Pastikan domain `apasific.com` terhubung melalui HTTPS SSL terenkripsi (Vercel / VPS proxy).
* [ ] **Automated Backup:** Jadwalkan backup harian otomatis (*Daily Database Backup*) dan backup storage mingguan.

---

## 3. Production Acceptance Test (PAT) Scenario
Segera setelah deployment pertama selesai, lakukan uji verifikasi pada server live menggunakan akun dummy khusus:

1. **User Onboarding:** Uji pendaftaran user baru (Author) -> aktivasi email -> login.
2. **Editorial Flow:** Author melakukan submit artikel -> Editor login -> assign Reviewer -> isi review -> keputusan editor (Accept).
3. **Federation Check:** Pindahkan artikel ke tahap Production -> cek apakah DOI terekspor ke XML Crossref dengan format valid -> unduh PDF artikel.
4. **Endpoint Feed:** Akses `/api/oai` untuk memastikan payload Dublin Core termuat dengan benar secara live.

---

## 4. Soft Launch & Monitoring Strategy
- **Tahap Awal (Soft Launch 2-4 minggu):** Batasi akses hanya untuk **1 Publisher, 2-3 Jurnal, 10-20 Reviewer**, dan beberapa editor.
- **Monitoring:** Pantau performa response time melalui dashboard analytics, awasi antrian DOI/Zenodo queue, dan amati error logs untuk menangani anomali performa secara responsif.
