# IAEP-16D & IAEP-16E — Functional Gap Analysis Report
## Ringkasan Kesenjangan Fungsional & Rencana Perbaikan

Dokumen ini merangkum analisis celah fungsional (functional gaps) dan prioritas release stable Platform IAEP berdasarkan audit runtime nyata.

---

## 1. Ringkasan Kesenjangan Fungsional (Functional Gaps Summary)

### A. Membership (PASS 92%)
* **Gaps:** Pembayaran online terintegrasi untuk perpanjangan (Renewal) keanggotaan dan log riwayat keanggotaan (Membership History).
* **Prioritas:** Medium (Perpanjangan manual melalui konfirmasi admin masih memadai untuk rilis awal).

### B. Certification (PARTIAL 68%)
* **Gaps:** Integrasi tautan wawancara online (Interview Workflow) dan verifikasi API sertifikat kompetensi eksternal.
* **Prioritas:** High (Penting untuk validitas sertifikat di mata institusi luar).

### C. Open Journal System (PASS 81%)
* **Gaps:** Integrasi copyediting editor inline dan ekspor XML JATS untuk indeksasi otomatis.
* **Prioritas:** High (Dibutuhkan untuk mempermudah operasional pengelola jurnal).

---

## 2. Peta Jalan Perbaikan Rilis Mendatang (Stable Release Roadmap)

```mermaid
gantt
    title Roadmap Perbaikan Gaps IAEP Stable Release
    dateFormat  YYYY-MM-DD
    section High Priority
    Public Certificate Verify API    :active, 2026-08-10, 5d
    XML JATS Export Engine           : 2026-08-15, 7d
    section Medium Priority
    Renewal Payment Gateway          : 2026-08-22, 10d
    Interview Room Integration       : 2026-09-01, 5d
```
