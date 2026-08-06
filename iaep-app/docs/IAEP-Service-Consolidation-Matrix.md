# IAEP Service Consolidation Matrix

* **Version**: 1.0
* **Status**: FROZEN (Audit Only)
* **Domain**: Service Logic Consolidation

---

## 1. Service Inventory & Recommendation Matrix

Daftar file logic service di bawah folder `src/services/` beserta status utilisasi dan rekomendasi penggabungannya:

| Service Name | Used | Duplicate | Recommendation |
| :--- | :--- | :--- | :--- |
| `JournalMetricsService` | Yes | No | `KEEP` (Fokus pada metrik operasional dasar). |
| `JournalHealthCalculator` | Yes | No | `KEEP` (Strategy pattern runner kesehatan jurnal). |
| `ReviewerWorkloadService` | Yes | No | `KEEP` (Scoring reputasi reviewer dan cek COI). |
| `ReviewerRecognitionService`| Yes | No | `KEEP` (Lencana Bronze-Platinum & sertifikat). |
| `CitationIntelligenceService`| Yes | No | `KEEP` (Pelacak runtun waktu H-Index). |
| `ResearchIntelligenceService`| Yes | No | `KEEP` (AI literature mapping & research gap). |
| `EditorialIntelligenceService`| Yes | No | `MERGE` (Gabung ke core Analytics/Metrics Engine). |

---

## 2. Batasan Audit
Sesuai batasan *Read-Only Audit*, tidak dilakukan penghapusan kode program orisinil atau merge service fisik selama sprint ini berjalan. Matrix ini murni bertindak sebagai pedoman arah pengembangan sprint berikutnya.
