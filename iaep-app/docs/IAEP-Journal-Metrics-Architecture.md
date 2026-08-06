# IAEP Journal Metrics Dashboard Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Journal Metrics & Quality Layer

---

## 1. Overview & Architecture Context
Lapisan Metrik Jurnal (*Journal Metrics Layer*) mengadopsi prinsip **Read-Only** untuk menyajikan gambaran kinerja operasional, integrasi metadata, dan penyerapan sitasi secara berkala tanpa memodifikasi daur hidup naskah.

```
+-------------------------------------------------------------+
|                     Journal Metrics Layer                   |
+-------------------------------------------------------------+
      |                                               |
      v                                               v
[Operational Metrics]                          [Quality Metrics]
- Submission volume                            - DOI / Zenodo coverage
- Acceptance & Rejection rates                 - Citation count
- Peer-review speed                            - Metadata completeness
```

---

## 2. Segregasi Data Metrik
Metrik dipisahkan secara tegas ke dalam dua klaster besar:
1. **Operational Metrics:** Mengukur kecepatan alur kerja redaksi dan beban peninjau (Total Submissions, Acceptance/Rejection Rate, Avg Review Duration, Active Reviewers).
2. **Quality Metrics:** Mengukur kepatuhan metadata ilmiah dan pencapaian eksternal (DOI Coverage, Zenodo coverage, Metadata Completeness, Citation Count).

---

## 3. Warning & Warning Level Engine
Dasbor menggunakan mesin evaluasi otomatis untuk memberikan peringatan dini (*Warning Engine*) kepada Editor:
* **Review Time:**
  * `WARNING` jika rata-rata durasi review melampaui 30 hari.
  * `CRITICAL` jika melampaui 45 hari.
* **Reviewer Response Rate:**
  * `NEEDS ACTION` jika rasio penugasan selesai di bawah 60%.
  * `CRITICAL` jika di bawah 45%.
* **DOI Coverage:**
  * `NEEDS ACTION` jika di bawah 80%.

---

## 4. Rencana Pengembangan Masa Depan (Future Extension Roadmap)
Dasbor metrik dikelompokkan dalam modul-modul sub-tampilan (Overview, Operations, Publication, Indexing, Quality) yang siap diekspansi untuk mendukung dasbor Scopus/WoS Readiness di sprint berikutnya.
