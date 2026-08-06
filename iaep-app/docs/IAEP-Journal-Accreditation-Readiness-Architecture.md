# IAEP Journal Accreditation & Indexing Readiness Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Accreditation & Governance Layer

---

## 1. Overview & Architecture Context
Lapisan Tata Kelola Jurnal (*Journal Governance*) bertanggung jawab atas kelayakan mutu administratif dan proses review platform IAEP guna menembus standard akreditasi SINTA nasional (Kementerian Dikbudristek) dan indeksasi internasional bereputasi tinggi (Scopus/Web of Science).

```
+-------------------------------------------------------------+
|               Journal Accreditation Readiness               |
+-------------------------------------------------------------+
      |                       |                        |
      v                       v                        v
[COI Prevention Engine]  [Editorial Board Entity] [Journal Metrics]
- Email domain check     - International bias      - Citation aggregate
- Institution overlap    - Role tracking           - Acceptance rates
```

---

## 2. Bounded Context: Editorial Board Entity
Untuk mendeteksi diversifikasi dewan redaksi (salah satu poin penilaian krusial Scopus), dewan redaksi dikelola secara dinamis dalam tabel `editorial_board_members` (tidak sekadar teks statis):
* Peran terstruktur: `Editor-in-Chief`, `Managing Editor`, `Associate Editor`, `Editorial Board Member`.
* Parameter audit: Afiliasi, negara (*country*), nomor ORCID, tanggal penunjukan, dan masa jabatan aktif.

---

## 3. Tata Kelola Kebijakan Jurnal (COPE Policies)
Seluruh kebijakan operasional disimpan secara modular pada tabel `journal_policies` untuk verifikasi publik:
* `plagiarism_policy`: Standar pencegahan plagiarisme (Turnitin).
* `conflict_of_interest`: Aturan bias peninjauan.
* `authorship_policy`: Deklarasi kontribusi penulis.
* `data_availability`: Transparansi akses data riset.
* `correction_retraction`: Prosedur ralat dan pencabutan naskah.

---

## 4. Conflict of Interest (COI) Prevention Engine
Mesin penyaring konflik kepentingan bekerja secara otomatis saat editor memilih reviewer kandidat:
* **Same Institution:** Membandingkan universitas penulis dan reviewer.
* **Same Email Domain:** Mencegah domain surel instansi yang sama (misal `@univ-x.ac.id` dengan `@univ-x.ac.id`).
* **Recent Collaboration:** Memindai sejarah naskah bersama di database.

Jika terdeteksi kecocokan, sistem akan memberikan label `BLOCK_ASSIGNMENT` untuk menghindari bias.

---

## 5. Reviewer Performance Scoring Model
Menghitung reputasi keandalan reviewer manusia secara kuantitatif:
$$Score = (40\% \times Timeliness) + (30\% \times Review Quality) + (20\% \times Editor Rating) + (10\% \times Completion Rate)$$

---

## 6. Journal Metrics Engine
Dasbor Kesiapan Akreditasi `/dashboard/admin/accreditation` menghitung skor kesiapan jurnal secara waktu nyata berdasarkan:
* Ketersediaan EISSN/PISSN aktif.
* Jumlah sebaran negara dewan redaksi (*International Editorial Board Diversity*).
* Kelengkapan dokumen kebijakan standar COPE.
* Kecepatan rata-rata proses peer-review naskah.
