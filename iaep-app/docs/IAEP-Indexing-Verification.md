# IAEP Indexing & Metadata Verification

* **Version**: 1.0 (RC-1 Verified)
* **Status**: VERIFIED PASS
* **Domain**: Scholarly Visibility & Indexing

---

## 1. Google Scholar Meta-Tags
Halaman publikasi artikel di `/article/[id]` memuat tag meta ilmiah standard:
- `citation_title`
- `citation_author`
- `citation_publication_date`
- `citation_pdf_url`

---

## 2. DOAJ & SINTA Export Feeds
- **OAI-PMH Feed (`/api/oai`):** Mengembalikan payload Dublin Core valid.
- **DOAJ XML Export (`/api/indexing/doaj`):** Skema format XML DOAJ terkonfirmasi lolos validasi DTD.
- **SINTA JSON Export (`/api/indexing/sinta`):** Payload JSON berisi metrik sitasi dan data penulis lolos uji skema.
