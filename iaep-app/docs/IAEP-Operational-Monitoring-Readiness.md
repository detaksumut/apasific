# IAEP Operational Monitoring Readiness

* **Version**: 1.0 (Monitoring Verified)
* **Status**: PASS
* **Domain**: Operational Metrics

---

## 1. Daftar Metrik Pemantauan Aktif (Fase D)
Berikut adalah daftar kesiapan infrastruktur monitoring operasional platform:

- **Login Success & Failure Rate:** Dipantau via log Supabase Auth API.
- **OAI-PMH Availability:** Verifikasi uptime berkala ke endpoint `/api/oai` (target ketersediaan `99.9%`).
- **Federation Queue Status:** Terintegrasi pada monitoring status log antrian ekspor DOI/Zenodo.
- **Reviewer Turnaround Time:** Dihitung secara dinamis berdasarkan data tanggal penugasan & tanggal review diselesaikan.
