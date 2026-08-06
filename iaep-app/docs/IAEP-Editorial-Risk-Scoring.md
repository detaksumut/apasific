# IAEP Editorial Risk Scoring Framework

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Editorial Risk Analytics

---

## 1. Parameter & Pembobotan Detail
Sistem menghitung tingkat risiko keterlambatan operasional (*Editorial Risk Score*) dari skala `0 - 100` untuk setiap naskah aktif:
* **Manuscript Age (30%):** Hari sejak diserahkan (lebih dari 30 hari tanpa perubahan status memicu pertambahan skor risiko).
* **Review Overdue (30%):** Keterlambatan pengembalian review naskah oleh penilai sejawat melampaui deadline 14 hari.
* **Reminded Count (20%):** Jumlah notifikasi pengingat WhatsApp yang telah dikirim ke reviewer.
* **Reviewer Conflict Flag (20%):** Deteksi bendera konflik kepentingan.

---

## 2. Klasifikasi Tingkat Bahaya (Risk Classification)
* **0 - 30 (LOW):** Naskah dalam batas waktu wajar operasional.
* **31 - 60 (MEDIUM):** Ulasan reviewer mendekati batas deadline atau editor butuh menugaskan reviewer cadangan.
* **61 - 85 (HIGH):** Keterlambatan ulasan melebihi 7 hari. Direkomendasikan melakukan re-assign reviewer baru.
* **86 - 100 (CRITICAL):** Hambatan fatal (overdue berkali-kali). Membutuhkan tindakan eskalasi manual oleh Editor-in-Chief.
