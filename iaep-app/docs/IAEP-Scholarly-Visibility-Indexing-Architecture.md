# IAEP Scholarly Visibility & Indexing Architecture (v1.1 Additive)

* **Version**: 1.1 (Additive Architecture Blueprint)
* **Status**: APPROVED FOR DESIGN
* **Domain**: Federation Monitoring

---

## 1. Skema Pengamatan Transaksi (Federation Observability)
Peningkatan visibilitas pada IAEP v1.1 ditangani melalui **Scheduler State Observer Pattern**:
Sistem membaca status record dari tabel `publication_queues` Supabase tanpa memodifikasi log transaksi:

* **Crossref Deposit status:** `WAITING`, `SUBMITTED`, `ACCEPTED`, `FAILED`, `RETRY_REQUIRED`.
* **Zenodo Deposit status:** `PENDING_DEPOSIT`, `SUCCESSFUL_DEPOSIT`, `FAILED_DEPOSIT`.

---

## 2. Struktur Adapter Observabilitas (Read-Only Adapter)
```
  [Supabase DB: publication_queues] ──> [Observer API Client] ──> [Executive Monitor UI]
```
Mekanisme ini memastikan tidak ada interferensi penulisan data yang dapat memicu kegagalan fungsionalitas baseline rilis v1.0.
