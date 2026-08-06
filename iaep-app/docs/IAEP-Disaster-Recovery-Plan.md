# IAEP Disaster Recovery & Backup Plan

* **Version**: 1.0 (Production Verified)
* **Status**: PASS
* **Domain**: Backup & Recovery

---

## 1. Parameter Batas Toleransi (RTO & RPO)
- **Recovery Time Objective (RTO):** `< 4 Jam` (Batas waktu pemulihan sistem pasca gangguan total).
- **Recovery Point Objective (RPO):** `< 24 Jam` (Batas maksimal data hilang pasca insiden).

---

## 2. Kebijakan Pencadangan (Backup Retention)
* **Database Backup:** Supabase automated daily backup disimpan selama 30 hari.
* **Storage Backup (PDF & Images):** Sync mingguan (weekly full backup) ke backup cloud storage terpisah.

---

## 3. Prosedur Pemulihan (Restore Procedure)
1. Hentikan trafik dev server / Vercel gateway.
2. Lakukan inisiasi database restore via dashboard manajemen Supabase.
3. Sinkronisasikan file asset PDF dari backup bucket storage ke bucket utama.
4. Lakukan verifikasi fungsionalitas login & pembacaan PDF naskah.
5. Hidupkan kembali gateway trafik publik.
