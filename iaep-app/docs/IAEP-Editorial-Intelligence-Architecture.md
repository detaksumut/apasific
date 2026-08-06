# IAEP Editorial Intelligence Dashboard Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Editorial Intelligence & Decision Support Layer

---

## 1. Overview & Architecture Context
Lapisan Kecerdasan Editorial (*Editorial Intelligence Layer*) menyajikan dasbor penunjang keputusan (*decision support*) bagi Editor-in-Chief untuk mengidentifikasi hambatan kinerja peninjauan, memprediksi penerimaan naskah, dan menganalisis risiko operasional secara dinamis.

```
+-------------------------------------------------------------+
|                Editorial Intelligence Layer                 |
+-------------------------------------------------------------+
      |               |               |               |
      v               v               v               v
[Pipeline Heat] [Risk Scoring] [AI Advisory]  [Alerts Panel]
- Submissions   - Low/Medium    - Reassign     - Overdue logs
- Revision      - Critical      - Escalation   - DOI failures
```

---

## 2. Tata Kelola Pengambilan Keputusan (Decision Governance)
* **Read-Only Advisory Rule:** Modul AI murni menyajikan saran prioritas tindakan (*AI Decision Support*) dan kalkulasi tingkat bahaya naskah. AI dilarang keras mengubah status daur hidup naskah, mengganti penilai sejawat, atau merilis publikasi secara otomatis tanpa persetujuan manual Editor-in-Chief.
* **Integrasi Internasionalisasi:** Dasbor memetakan sebaran geografis penulis (*Country Diversity*) dan institusi asal (*Top Institutions*) untuk melacak target diversifikasi Scopus/WoS.
