# IAEP Production Monitoring Guide

* **Version**: 1.0 (Production Verified)
* **Status**: PASS
* **Domain**: Systems Monitoring

---

## 1. Pemantauan Antrian & Integrasi (Federation Monitoring)
Redaksi dan Admin dapat memantau antrian sinkronisasi data eksternal melalui dasbor admin:

- **Antrian DOI & Zenodo:** Memantau tabel `publication_queues` di Supabase. Status error pengiriman memicu peringatan otomatis di admin panel.
- **Monitoring Storage:** Batas pemakaian storage naskah diatur minimal menyisakan `20%` kapasitas kosong sebelum peringatan otomatis terkirim.

---

## 2. Analisis Performa & Response Time
- **API Latency:** Dipantau melalui logger edge middleware (target latency `/api/*` di bawah `500ms`).
- **AI Token Utilization:** Memantau kuota pemakaian Gemini API key agar terhindar dari limitasi rate limit runtime.
