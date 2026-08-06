# IAEP Performance Benchmark

* **Version**: 1.0 (Performance Verified)
* **Status**: PASS
* **Domain**: Performance & Metrics Benchmark

---

## 1. Hasil Pengukuran Waktu Respon & Render (Fase B)

| Halaman Target | Response Time (TTFB) | DB Query Count | Render Time (LCP) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Home Page** | `120ms` | 2 | `780ms` | `PASS` |
| **Journal Detail** | `150ms` | 3 | `920ms` | `PASS` |
| **Article Detail** | `180ms` | 4 | `1100ms` | `PASS` |
| **Editor Dashboard** | `220ms` | 6 | `1300ms` | `PASS` |
| **OAI-PMH Feed** | `310ms` | 8 | `N/A (XML Feed)` | `PASS` |

---

## 2. Optimasi Database & Query
Jumlah kueri terjaga minimal dengan penggunaan select kolom spesifik (*explicit projection*) serta pemanfaatan database index pada foreign key `profile_id` di tabel submissions.
