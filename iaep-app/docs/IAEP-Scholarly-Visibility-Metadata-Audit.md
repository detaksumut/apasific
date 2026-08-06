# IAEP Metadata Exposure Audit Architecture (v1.1 Additive)

* **Version**: 1.1 (Additive Architecture Blueprint)
* **Status**: APPROVED FOR DESIGN
* **Domain**: Indexing Readiness Validation

---

## 1. Audit Kesiapan Google Scholar (GS Score Engine)
Modul audit membaca kelengkapan meta tag ilmiah pada URL `/article/[id]` dan mencocokkannya dengan kriteria:
* `citation_title` != null
* `citation_author` != null
* `citation_pdf_url` != null
* `canonical` URL mapping check

---

## 2. Audit Kesiapan OpenAIRE & OAI-PMH (OAI Score Engine)
Melakukan kueri berkala ke endpoint `/api/oai?verb=Identify` untuk memverifikasi kesesuaian:
- Dublin Core XML Namespace mapping.
- Ketersediaan element tag `<dc:creator>`, `<dc:date>`, dan `<dc:identifier>` (DOI).

Sistem menghasilkan skor metrik kesiapan operasional per-jurnal dalam bentuk diagram radar visual pada dasbor eksekutif.
