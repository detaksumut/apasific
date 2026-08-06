# IAEP Scholarly Visibility & Indexing Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Scholarly Visibility Layer

---

## 1. Overview & Architecture Context
Visibilitas ilmiah (*scholarly visibility*) adalah lapisan teratas dari platform IAEP yang bertanggung jawab untuk menyebarluaskan metadata publikasi kepada mesin pencari akademik global dan nasional secara terprogram dan patuh standar metadata.

```
+-------------------------------------------------------------+
|                  IAEP Jurnal Core Engine                    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                Scholarly Visibility Layer                   |
+-------------------------------------------------------------+
     |                       |                        |
     v                       v                        v
[Google Scholar]     [DOAJ XML Export]       [SINTA Export API]
(Dublin Core tags)  (Journal/Article XML)   (Readiness Export)
```

---

## 2. Metadata Governance
Visibilitas yang tinggi membutuhkan integritas data. Semua metadata yang didistribusikan harus divalidasi oleh `PublicationMetadataValidator` terpusat untuk meminimalisir kesalahan indeksasi.

---

## 3. Google Scholar & Dublin Core Metadata Layer
Google Scholar crawler mengekstrak informasi bibliografi naskah melalui Dublin Core meta tags yang disuntikkan secara dinamis di `document.head` detail naskah publik:
* `citation_title`: Judul artikel ilmiah.
* `citation_author`: Nama lengkap masing-masing penulis secara terpisah.
* `citation_publication_date`: Tanggal terbit resmi (`YYYY-MM-DD`).
* `citation_journal_title`: Nama periodik jurnal.
* `citation_volume` & `citation_issue`: Volume dan edisi terbit.
* `citation_pdf_url`: Tautan berkas galley PDF naskah.
* `citation_doi` & `dc.identifier`: Pengenal DOI naskah.
* `citation_abstract` & `citation_keywords`: Abstrak dan kata kunci pencarian.
* `citation_language`: Bahasa artikel (default: `'eng'`).

---

## 4. Schema.org ScholarlyArticle JSON-LD
Meningkatkan penemuan artikel pada mesin pencari konvensional (SEO Google/Bing).
* Menghubungkan naskah secara formal dengan periodik induk jurnal (`isPartOf` -> `Periodical`).
* Menyediakan data terstruktur terstandardisasi Schema.org untuk agregasi data metadata otomatis.

---

## 5. DOAJ Export Architecture
Modul ekspor terstruktur `/api/indexing/doaj` menghasilkan XML yang menggabungkan:
1. **Journal Level Metadata:** ISSN, EISSN, Publisher, Country, subjek riset, editorial policy, lisensi (CC BY 4.0), dan peer-review policy.
2. **Article Level Metadata:** Judul, abstrak, penulis (disertai ORCID & afiliasi), kata kunci, DOI, dan URL teks lengkap.

---

## 6. SINTA Readiness Export
Menyediakan endpoint JSON `/api/indexing/sinta` sebagai basis data kesiapan akreditasi SINTA nasional.
* Menyajikan ringkasan kelayakan data artikel dan penanda jika terdapat kolom kritis yang belum dilengkapi (misal DOI kosong, volume/issue tidak terisi).

---

## 7. OpenAIRE OAI-PMH Compliance
Menyelaraskan feed OAI-PMH lokal dengan pedoman OpenAIRE Literature v4.0:
* Tag `<dc:rights>` berisi lisensi akses terbuka (`info:eu-repo/semantics/openAccess`).
* Tag `<dc:license>` berisi deklarasi hak cipta (`CC BY 4.0`).
* Tag `<dc:relation>` berisi relasi DOI (`info:eu-repo/semantics/altIdentifier/doi/*` dan `doi:*`).

---

## 8. Publication Metadata Validator
Modul `PublicationMetadataValidator` mengadopsi prinsip pertahanan berlapis. Sebelum ekspor dilakukan ke pihak luar, validator akan mengembalikan status:
* `READY_FOR_INDEXING`: Naskah telah memenuhi semua aspek data primer.
* `NOT_READY_FOR_INDEXING`: Naskah ditolak dari daftar ekspor dan memicu peringatan (*errors/warnings*) karena kehilangan parameter wajib seperti abstrak, penulis, DOI, volume, atau edisi.

---

## 9. ORCID Readiness
Semua data penulis terdaftar dihubungkan secara dinamis menggunakan struktur data terstruktur pengenal ORCID (`0000-0000-0000-0000`) untuk validasi identitas terintegrasi secara global.

---

## 10. Indexing Security Rules
* Ekspor feed DOAJ dan SINTA terlindung dari eksploitasi beban server dengan implementasi caching `Cache-Control` (maksimal 1 jam).
* Data naskah yang belum berstatus `'Published'` diblokir dari proses indeksasi apa pun.

---

## 11. Langkah Persiapan Scopus/WoS (Future Scopus/WoS Preparation)
* **Metadata Uniformity:** Memastikan seluruh sitasi rujukan naskah dikonstruksi secara seragam.
* **Ethics Transparency:** Menyediakan link langsung kebijakan etika publikasi di setiap data ekspor artikel.
