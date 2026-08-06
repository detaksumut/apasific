# IAEP Navigation Consolidation Plan

* **Version**: 1.0
* **Status**: FROZEN (Plan Only)
* **Domain**: Navigation Mapping

---

## 1. Peta Navigasi (Current vs Recommended Navigation)

```
[CURRENT PATHS]
  ├── /dashboard/admin
  ├── /dashboard/admin/journal-metrics (Separate page)
  └── /dashboard/admin/accreditation (Separate page)

[RECOMMENDED TARGET PATHS]
  └── /dashboard/admin
        ├── Tab 1: Overview
        ├── Tab 2: Analytics (Journal Metrics & Editorial Intel integrated)
        └── Tab 3: Readiness (SINTA, DOAJ, Scopus Readiness integrated)
```

---

## 2. Analisis Dampak Migrasi (Impact Analysis)
* **Dampak Halaman:** Mengurangi beban loading peramban karena Editor-in-Chief dan Administrator tidak perlu berpindah-pindah rute URL yang berbeda.
* **Dampak Kode:** Rute-rute lama (seperti `/dashboard/admin/journal-metrics`) akan tetap dibiarkan aktif (*deprecated state*) selama masa transisi sebelum nanti dihapus sepenuhnya setelah integrasi tab tuntas.
