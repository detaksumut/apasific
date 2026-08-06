# IAEP AI Services Verification

* **Version**: 1.0 (RC-1 Verified)
* **Status**: VERIFIED PASS
* **Domain**: Artificial Intelligence Integration

---

## 1. Modul Asisten Skrining (AI Reviewer)
* **Akurasi Deteksi Plagiasi & Struktur:** Skrining awal naskah via AI Reviewer mengembalikan status terklasifikasi dengan confidence score di atas `90%`.
* **Data Anonymization:** Data personal penulis secara otomatis disensor dari naskah PDF sebelum diteruskan ke API model AI untuk menjaga integritas double-blind review.

---

## 2. Advisory Keputusan (AI Recommendation & Editorial Intel)
Sistem advisory memberikan rekomendasi tindakan prioritas redaksi (seperti pergantian reviewer tidak aktif atau peringatan naskah terlambat) dengan basis *Explainability* yang tercatat di riwayat audit log.
