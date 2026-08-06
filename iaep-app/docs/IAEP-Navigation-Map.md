# IAEP Navigation Map & Structure Consolidation

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Navigation & Architecture Consolidation

---

## 1. Peta Konsolidasi Dashboard (Dashboard Menu Map)
Untuk menghindari penyebaran rute dashboard baru (*dashboard sprawl*), seluruh modul analitik dan kesiapan indeksasi disatukan ke dalam tab atau section di bawah dasbor induk yang bersangkutan.

```
Dashboard Admin (/dashboard/admin)
  ├── Analytics (Tab)
  │     ├── Overview
  │     ├── Journal Metrics [IAEP-07D]
  │     └── Editorial Intelligence [IAEP-08B]
  └── Accreditation & Indexing (Tab)
        ├── SINTA Readiness [Accreditation]
        ├── DOAJ Readiness
        └── Scopus & WoS Readiness
```

```
Dashboard Editor (/dashboard/editor)
  ├── Overview (Tab)
  ├── Submissions (Tab)
  └── Reviewers & Editorial Intelligence (Tab)
```

```
Dashboard Reviewer (/dashboard/reviewer)
  └── Profile & Academic Recognition [IAEP-08A] (Tab)
```

---

## 2. Status Pemetaan Rute Fisik Proyek (Route Map Consolidation)

| Modul | Posisi Baru (Consolidated) | Status Kode |
| :--- | :--- | :--- |
| **Journal Metrics** | Tab *Analytics* di Dasbor Admin | Terkonsolidasi |
| **Editorial Intelligence** | Tab *Analytics* di Dasbor Admin & Editor | Terkonsolidasi |
| **Reviewer Recognition** | Tab *Profile* di Dasbor Reviewer | Terkonsolidasi |
| **Research Intelligence** | Integrasi di panel detail naskah | Terkonsolidasi |
| **Scopus/WoS Readiness** | Tab *Accreditation/Indexing* di Dasbor Admin | Terkonsolidasi |
| **Publisher Intelligence** | *Ditarik (Tidak diimplementasikan terpisah)* | Dibatalkan |
