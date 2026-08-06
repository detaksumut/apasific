# IAEP Go-Live Final Checklist

* **Version**: 1.0 (Production Verified)
* **Status**: PASS
* **Domain**: Release Readiness Checklist

---

## 1. Modul & Fungsionalitas Aplikasi
* [x] **Authentication & Guard:** User login Supabase lancar.
* [x] **Submission System:** Pemuatan berkas naskah PDF & metadata berfungsi.
* [x] **AI Assist Screening:** Evaluasi initial screening AI berjalan normal.
* [x] **Reviewer Badges:** Penganugerahan lencana prestasi terverifikasi.
* [x] **Federation Sync:** Deposit API Zenodo & pendaftaran DOI aman.
* [x] **OAI Feed URL:** Akses Dublin Core XML di `/api/oai` tervalidasi.

---

## 2. Infrastruktur & Backup Kesiapan
* [x] **Daily Backup:** Supabase automated backup aktif.
* [x] **Storage quota:** Sisa kapasitas penyimpanan termonitor.
* [x] **SSL Protection:** HTTPS diaktifkan di proxy domain utama.
