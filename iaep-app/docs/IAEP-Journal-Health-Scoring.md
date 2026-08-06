# IAEP Journal Health Scoring System

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Accreditation & Readiness Analytics

---

## 1. Strategi Pembobotan (Weighting Configuration)
Perhitungan kesehatan jurnal tidak menggunakan nilai statis, melainkan dapat dikonfigurasi (*configurable weight matrix*) untuk mengimbangi standar pengindeks yang dinamis:

```
  Health Score = (W1 * OperationalScore) + (W2 * PublicationScore) + (W3 * IndexingScore)
```

Default konfigurasi bobot awal:
* **W1 (Operational weight):** 40% (Fokus pada kecepatan peninjauan naskah dan response rate reviewer).
* **W2 (Publication weight):** 30% (Keteraturan frekuensi penerbitan triwulanan).
* **W3 (Indexing weight):** 30% (DOI coverage, Zenodo deposit rate, cakupan ORCID penulis).

---

## 2. Implementasi Strategy Pattern
Perhitungan skor mendelegasikan kodenya pada kelas-kelas strategi independen di bawah antarmuka `IHealthScoreStrategy`:

```
                    [IHealthScoreStrategy]
                              ^
            +-----------------+-----------------+
            |                 |                 |
 [OperationalStrategy]  [PublicationStrategy]  [IndexingStrategy]
```

Keuntungan arsitektur ini:
* Memungkinkan penambahan strategi penilaian baru (misalnya `ScopusStrategy` atau `SintaAccreditationStrategy`) di masa depan tanpa mengubah kode orkestrator kalkulator kesehatan utama.
