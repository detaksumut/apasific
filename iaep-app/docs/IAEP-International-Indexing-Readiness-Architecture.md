# IAEP International Indexing & Research Intelligence Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: International Indexing & Research Intelligence Layer

---

## 1. Overview & Architecture Context
Lapisan Kecerdasan Riset & Indeksasi Internasional (*International Indexing & Research Intelligence*) bertanggung jawab atas validasi dan penyebaran identitas kepengarangan global, agregasi data sitasi beruntun waktu (*time-series citation tracking*), serta analitik lanjut tren penelitian ilmiah menggunakan model AI.

```
+-------------------------------------------------------------+
|               International Indexing Layer                  |
+-------------------------------------------------------------+
      |                       |                        |
      v                       v                        v
[ORCID / Identifier DB]  [Citation Time-Series]  [Research Intelligence AI]
- Scopus Author ID       - h-index history       - Literature mapping
- ResearcherID           - Multi-source adapter  - Research gap detection
```

---

## 2. ORCID & Author Identifiers Integration
Data identitas pengarang dikelola secara granular pada tabel `author_identifiers` untuk mendukung interoperabilitas dengan pangkalan data ilmiah dunia:
* `identifier_type`: Menyimpan `'ORCID'`, `'SCOPUS_AUTHOR_ID'`, atau `'RESEARCHER_ID'`.
* `verified_at`: Penanda waktu verifikasi otentikasi.
* **Metadata DOI Crossref:** XML Crossref menyertakan tag `<ORCID>https://orcid.org/XXXX-XXXX-XXXX-XXXX</ORCID>` secara otomatis untuk kontributor yang memiliki ID terverifikasi di database.

---

## 3. Time-Series Citation & Author Metrics History
Perkembangan ilmiah membutuhkan visualisasi pertumbuhan dari waktu ke waktu:
* **`article_citations_tracker`:** Menyimpan riwayat pertumbuhan kutipan naskah sebagai data runtun waktu (time-series) dengan indeks pencarian `(submission_id, source, checked_at)`.
* **`author_metrics_history`:** Merekam jejak riwayat peningkatan *h-index*, *i10-index*, dan *total_citations* milik akademisi dari tahun ke tahun untuk visualisasi grafik di halaman profil.

---

## 4. Multi Citation Provider Adapter
Integrasi penarikan data sitasi diselimuti oleh pola adapter `CitationProvider` untuk mempermudah penambahan atau pengalihan penyedia data sitasi eksternal:
* `CrossrefProviderAdapter`: Menarik data sitasi via Crossref Works API.
* `OpenCitationProviderAdapter`: Menarik data sitasi via COCI API.
* `ScopusProviderAdapter` (future): Menarik data sitasi melalui Elsevier API.

---

## 5. Research Intelligence AI Engine
Mengintegrasikan model AI asisten untuk membantu editor mendeteksi kualitas naskah:
* **Literature Mapping:** Mengelompokkan naskah ke dalam klaster keilmuan (*Research Cluster*) berdasarkan abstrak dan kata kunci.
* **Research Gap Detection:** Menganalisis batasan penelitian sebelumnya dan mengidentifikasi area kosong (*missing area*) yang potensial dikembangkan.
* **Trend Analysis:** Memetakan topik riset yang sedang mengalami kenaikan popularitas (*rising trends*) dari database publikasi jurnal.
