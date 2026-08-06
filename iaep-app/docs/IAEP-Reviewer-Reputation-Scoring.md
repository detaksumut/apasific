# IAEP Reviewer Reputation Scoring Model

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Peer Review Analytics

---

## 1. Formula & Pembobotan Detail
Sistem menghitung reputasi reviewer secara dinamis dengan parameter bobot:
* **Timeliness (40%):** Kecepatan pengerjaan review naskah vs batas waktu penugasan (deadline 14 hari).
* **Review Quality (30%):** Kedalaman dan konstruktivitas komentar (diukur secara objektif melalui detektor panjang kata dan anjuran bukti riset).
* **Editor Rating (20%):** Penilaian kualitatif kepuasan editor terhadap ulasan reviewer.
* **Completion Rate (10%):** Rasio jumlah penugasan yang diselesaikan vs penugasan yang diabaikan/ditolak.

---

## 2. Model Histori Runtun Waktu
Perubahan status dan skor reputasi disimpan secara periodik ke dalam database sebagai histori data (*reputation snapshot history*) untuk memantau grafik perkembangan performa reviewer dari bulan ke bulan.
* Data yang terekam mencakup: `reputation_score`, `recognition_level`, `completed_count`, `average_days_taken`, dan `snapshot_date`.
