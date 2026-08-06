# IAEP Enterprise Consolidation Audit Report

* **Version**: 1.0
* **Status**: FROZEN (Audit Only)
* **Domain**: Architecture Consolidation Layer

---

## 1. Route Status Matrix

Daftar rute aktif di folder `src/app/` beserta klasifikasi status tindakannya:

| Route Path | Status | Action Recommendation |
| :--- | :--- | :--- |
| `/auth/login` | `ACTIVE` | `KEEP` (Rute login publik utama). |
| `/dashboard/admin` | `ACTIVE` | `KEEP` (Dasbor induk administrator). |
| `/dashboard/editor` | `ACTIVE` | `KEEP` (Dasbor induk editor). |
| `/dashboard/reviews` | `ACTIVE` | `KEEP` (Rute dasbor reviewer). |
| `/dashboard/admin/journal-metrics` | `ACTIVE` | `CANDIDATE_FOR_TAB` (Gabung ke tab Analytics di Dasbor Admin). |
| `/dashboard/admin/accreditation` | `ACTIVE` | `CANDIDATE_FOR_TAB` (Gabung ke tab Readiness di Dasbor Admin). |
| `/dashboard/admin/indexing-readiness` | `ACTIVE` | `CANDIDATE_FOR_TAB` (Gabung ke tab Readiness di Dasbor Admin). |

---

## 2. Dashboard Status Matrix

Pemetaan dasbor aktif beserta penanggung jawab (*Owner*) dan rekomendasi migrasinya:

| Dashboard | Owner | Recommendation |
| :--- | :--- | :--- |
| Admin Dashboard | Super Admin | `KEEP` (Dasbor utama tata kelola sistem). |
| Editor Dashboard | Editor | `KEEP` (Dasbor penugasan naskah). |
| Reviewer Dashboard | Reviewer | `KEEP` (Halaman pengerjaan peer-review). |
| Author Dashboard | Author | `KEEP` (Halaman monitoring naskah penulis). |
| Journal Metrics Dashboard | Admin | `MERGE_AS_TAB` (Konsolidasikan ke Admin tab Analytics). |
| Editorial Intelligence Dashboard | Editor | `MERGE_AS_TAB` (Konsolidasikan ke Editor tab Analytics). |
