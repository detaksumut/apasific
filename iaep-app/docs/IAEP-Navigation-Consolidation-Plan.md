# IAEP Navigation & Dashboard Consolidation Plan

* **Version**: 1.1 (Consolidated & Certified)
* **Status**: FROZEN (Plan Only)
* **Domain**: Navigation & Dashboard Mapping

---

## 1. Dashboard Merge Matrix

| Existing Dashboard | Merge Target | Reason |
| :--- | :--- | :--- |
| **Journal Metrics** | Dashboard Admin -> Tab *Analytics* | Mengkonsolidasikan data volume, acceptance rate, dan health score. |
| **Accreditation Readiness**| Dashboard Admin -> Tab *Readiness* | Menyajikan evaluasi instan pemenuhan syarat akreditasi SINTA. |
| **Editorial Intelligence** | Dashboard Editor -> Tab *Analytics* | Menyajikan asisten AI prioritas tindakan bagi Editor-in-Chief. |
| **Reviewer Recognition** | Dashboard Reviewer -> Tab *Profile* | Menyajikan reputasi, lencana, dan sertifikat terverifikasi. |

---

## 2. Peta Transisi & Kebijakan Rute (No Breaking Route Policy)
Untuk mencegah kegagalan routing link internal bagi user eksisting selama masa migrasi:
* **Fase 1 (Pre-Migration):** Rute dasbor mandiri lama (seperti `/dashboard/admin/journal-metrics`) dibiarkan tetap aktif.
* **Fase 2 (Tab Integration):** Menulis kode komponen tab visual di `/dashboard/admin` dan `/dashboard/editor`.
* **Fase 3 (Clean Up):** Mengubah rute lama menjadi pengalihan otomatis (*301 Redirect*) ke halaman dasbor utama bersangkutan.
