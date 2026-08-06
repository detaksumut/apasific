# IAEP-19A — Scholarly Ecosystem Live Monitoring

Dokumen ini memetakan status antrian, sinkronisasi, dan crawling eksternal untuk rilis go-live produksi.

---

## 1. Status Antrian & Sinkronisasi
* **DOI Queue:** 0 Pending. Semua naskah issue pertama siap dikirim ke Crossref begitu prefix aktif.
* **Zenodo Preservation Queue:** 0 Pending. Semua naskah telah sukses terdeposit di Zenodo Preservation Server.
* **OAI-PMH Endpoints:** `/api/oai` aktif dan merespon request metadata format oai_dc secara runtime.

## 2. Google Scholar Crawl Status
* **robots.txt:** `PASS` (Mengizinkan pengindeksan direktori `/article/*`).
* **sitemap.xml:** `PASS` (Memuat daftar rute artikel dinamis secara otomatis).
* **Metadata Tags (Google Scholar):** Dublin Core (`citation_title`, `citation_author`, `citation_pdf_url`) tersemat dengan sempurna di tingkat header HTML halaman detail naskah.

**STATUS EKOSISTEM: STABLE & MONITORING ACTIVE**
