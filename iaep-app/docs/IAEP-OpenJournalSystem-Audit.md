# IAEP-16D & IAEP-16E — Open Journal System Functional Audit Report
## Status Kelulusan: PASS 81%

Dokumen ini berisi hasil audit fungsional terhadap modul publikasi naskah ilmiah (Open Journal System / OJS) pada Platform IAEP.

---

## 1. Matriks Kepatuhan Siklus Hidup Jurnal

| Tahapan Lifecycle | Status | Evidence (Runtime / DB) | Catatan / Hambatan |
| :--- | :---: | :--- | :--- |
| **Submit Manuscript** | **PASS** | `/submissions/new` (Insert PDF) | Penulis berhasil mengunggah naskah. |
| **AI Screening** | **PASS** | AI Assistant analysis output dashboard | Evaluasi otomatis keselarasan topik. |
| **Editor Assignment** | **PASS** | `/dashboard/editor` (Assign Reviewers) | Editor menugaskan minimal 2 reviewer. |
| **Reviewer Assignment**| **PASS** | `/dashboard/reviewer` (Accept Assignment)| Reviewer menerima notifikasi tugas. |
| **Double Blind Review**| **PASS** | Reviewer scoring submission DB rows | Identitas penulis dan peninjau disembunyikan. |
| **Revision Upload** | **PASS** | Penulis upload revisi naskah | Berkas versi baru tersimpan. |
| **Acceptance** | **PASS** | Status `accepted` update trigger LOA | LOA terbit otomatis untuk diunduh. |
| **Copyediting** | **PARTIAL** | DB metadata editor update, no live diff tool | Proses edit teks masih manual offline. |
| **Production Queue** | **PARTIAL** | Layout design check, no automated layouting | Antrian layouting masih manual. |
| **DOI registration** | **PASS** | Crossref REST API JSON response | Pendaftaran DOI berhasil. |
| **Zenodo Deposit** | **PASS** | Zenodo JSON REST API payload response | Deposit otomatis berhasil dilakukan. |

---

## 2. Fitur yang Belum Selesai (Functional Gaps)
* **Production Queue:** Fitur visualisasi antrian layouting jurnal bagi tim produksi.
* **Copyediting Workflow:** Integrasi text editor inline (seperti TinyMCE/CKEditor) untuk mempermudah perbaikan salah tik langsung di web.
* **XML JATS Export:** Ekspor naskah final menjadi format XML JATS standar untuk indeksasi Pubmed/Scopus secara otomatis.

## 3. Prioritas Perbaikan
1. **[HIGH]** Implementasi XML JATS Export Generator untuk memudahkan metadata indexing eksternal.
2. **[MEDIUM]** Integrasi inline text editor untuk proses copyediting naskah.
