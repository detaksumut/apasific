# IAEP Publication Ecosystem Architecture

* **Version**: 1.0
* **Status**: ENTERPRISE BLUEPRINT
* **Domain**: Parent Architecture Document

---

## 1. Enterprise Blueprint Overview
IAEP Publication Ecosystem adalah rancangan arsitektur terintegrasi yang mengatur seluruh siklus hidup artikel ilmiah—mulai dari pendaftaran identitas, penyerahan naskah, peninjauan sejawat buta ganda (*double-blind*), asisten kecerdasan buatan (AI), hingga distribusi publikasi dan pengindeksan global.

```
                    IAEP PUBLICATION ECOSYSTEM

                          Identity Core
                                |
                                v
                      Submission Management
                                |
                                v
                       Double Blind Review
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
           AI Reviewer Assistant       Human Reviewer
                    |                       |
                    +-----------+-----------+
                                |
                                v
                       Editorial Decision
                                |
                                v
                        Publication Engine
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
            Federation Layer        Indexing Layer
             - Crossref DOI          - Google Scholar
             - Zenodo                - DOAJ Ready
             - OAI-PMH Feed          - SINTA Ready
```

---

## 2. Governance Matrix (Matriks Tata Kelola Enterprise)
Setiap lapisan arsitektur IAEP dikendalikan oleh kebijakan tata kelola yang ketat untuk menjamin keamanan, kepatuhan, dan reputasi ilmiah platform:

| Lapisan Sistem | Kebijakan Tata Kelola (Governance Policy) |
| :--- | :--- |
| **Identity Core** | Pengendalian otorisasi berbasis peran (RBAC) dan perlindungan data profil pengguna. |
| **Submission** | Aliran kontrol status naskah yang terisolasi per-aktor. |
| **Review** | Kepatuhan mutlak *Double-Blind Policy* (anonymization naskah dari metadata identitas penulis). |
| **AI Assistant** | Asisten analitik non-blocker (tanpa wewenang menyetujui atau menolak naskah secara mandiri). |
| **Publication** | Validasi integritas data (`PublicationMetadataValidator`) dan resolusi tanggal terbit resmi (`published_at`). |
| **Federation** | Perlindungan idempotensi (anti DOI ganda), penguncian konkuren (concurrency lock), dan batasan coba ulang (retry limit 5x). |
| **Indexing** | Penyediaan format data patuh standard (Dublin Core meta tags, JSON-LD Periodical, DOAJ XML, SINTA JSON, OpenAIRE). |

---

## 3. Langkah Tahap Selanjutnya: Journal Accreditation & International Indexing Readiness
Setelah lapisan federasi dan visibilitas pengindeksan selesai diimplementasikan, platform IAEP akan naik ke lapisan berikutnya untuk mempersiapkan akreditasi internasional:
1. **ISSN/eISSN Management:** Modul pengelolaan mandiri nomor ISSN cetak dan elektronik pada masing-benar jurnal.
2. **Editorial Board Governance:** Halaman struktur dan penugasan formal dewan redaksi jurnal secara transparan.
3. **Publication Ethics (COPE):** Halaman deklarasi kepatuhan etika publikasi standard *Committee on Publication Ethics* (COPE) yang tersemat pada metadata ekspor naskah.
4. **Reviewer Management:** Pelacakan statistik beban kerja reviewer, pencegahan konflik kepentingan (*conflict of interest*), dan pelacakan batas waktu ulasan.
5. **Journal Quality Metrics:** Penghitungan statistik jumlah views, downloads, sitasi eksternal (Crossref, Scopus, OpenCitations) secara real-time.
6. **Scopus/WoS Readiness:** Penyelarasan struktur referensi naskah agar lolos uji kelayakan indeksasi Scopus/Web of Science.
