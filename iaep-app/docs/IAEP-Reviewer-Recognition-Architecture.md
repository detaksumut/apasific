# IAEP Reviewer Recognition & Academic Credit Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Peer Review & Academic Recognition

---

## 1. Overview & Architecture Context
Lapisan Rekognisi Reviewer (*Reviewer Recognition Layer*) bertugas menghitung dan mengapresiasi kontribusi akademisi yang bertindak sebagai reviewer ilmiah pada platform IAEP dengan pilar gamifikasi kredensial terverifikasi.

```
+-------------------------------------------------------------+
|                Reviewer Recognition Engines                 |
+-------------------------------------------------------------+
      |               |               |               |
      v               v               v               v
[BadgeEngine]  [CreditEngine]  [Certificate]  [AchievementEngine]
- Bronze        - Lifetime      - Verification - First Review
- Platinum      - Current year  - QR Hash      - Speed Review
```

---

## 2. Segregasi Mesin Evaluasi (Recognition Engines)
Untuk menjamin modularitas dan kepatuhan SOLID, pemrosesan dipisah ke dalam kelas-kelas spesifik:
1. **BadgeEngine:** Mengelompokkan level kontribusi (*Bronze*, *Silver*, *Gold*, *Platinum*).
2. **CreditEngine:** Mengalkulasi akumulasi poin kontribusi riset (*academic credits*) untuk sinkronisasi orcid review credit.
3. **CertificateEngine:** Mengelola pencetakan, hashing pengenal sertifikat terverifikasi (`IAEP-RV-YYYY-XXXXXX`), dan registrasi verifikasi publik.
4. **AchievementEngine:** Memberikan penghargaan gamifikasi (*First Review*, *Fast Reviewer*, *AI Expert Reviewer*).

---

## 3. Reviewer Expertise Matrix & AI Quality Score
* **Expertise Matrix:** Editor disodorkan matriks tingkat kompetensi reviewer berdasarkan kata kunci penelitian abstrak, bukan sekadar riwayat jumlah review.
* **AI Review Quality Score:** Memanfaatkan model kecerdasan buatan untuk mengevaluasi kualitas komentar reviewer manusia (misal: kelengkapan anjuran, keadilan interpretasi, dan kedalaman kajian metodologis).
