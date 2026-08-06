# IAEP Production Acceptance Test (PAT)

* **Version**: 1.0 (Production Verified)
* **Status**: PASS
* **Domain**: End-to-End Functional Test

---

## 1. Hasil Pengujian Siklus Hidup Penerbitan (Lifecycle Test)

| Tahap Skenario | Deskripsi Aksi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| **1. Register Member** | Pembuatan akun author & reviewer baru. | `PASS` | Email verifikasi terkirim. |
| **2. Submit Article** | Pengisian metadata naskah & unggah PDF. | `PASS` | Deteksi format PDF lolos. |
| **3. AI Initial Screening**| Analisis AI Reviewer dan anonymization naskah. | `PASS` | Struktur tervalidasi. |
| **4. Assign Reviewer** | Penugasan reviewer ganda oleh Editor. | `PASS` | Konflik kepentingan (COI) nihil. |
| **5. Decision & Production**| Keputusan redaksi dan unggah PDF layout final. | `PASS` | Integrasi Layout Editor lancar. |
| **6. Zenodo & DOI Export** | Pendaftaran DOI Crossref & deposit ke Zenodo CERN. | `PASS` | API response `201 Created`. |
| **7. OAI Feed Access** | Penarikan payload metadata Dublin Core. | `PASS` | XML schema tervalidasi. |

---

## 2. Kesimpulan PAT
Seluruh pengujian end-to-end berstatus **PASS**. Tidak ditemukan error kritis (*blocker*) pada lingkungan live.
