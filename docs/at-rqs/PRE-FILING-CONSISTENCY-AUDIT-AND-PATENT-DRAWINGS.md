# AT-RQS™ v1.0 PRE-FILING CONSISTENCY AUDIT & PATENT DRAWINGS SPECIFICATION
## Lock Check Matrix, Reference Numerals Registry, and Formal Technical Drawings (FIG. 1 – FIG. 9)

**Dokumen Analisis:** `AUDIT-DRAW-AT-RQS-2026-V1.0`  
**Status Naskah:** PRE-FILING PROSECUTION HARDENING DRAFT (FROZEN BASELINE v1.0)  
**Yurisdiksi Sasaran:** DJKI Kemenkumham RI & Traktat Kerja Sama Paten (PCT)  
**Target Pengajuan:** September 2026  
**Tanggal Penguncian Audit:** 24 Agustus 2026

---

## 1. PRE-FILING CONSISTENCY & TERM LOCK AUDIT MATRIX

Matriks audit ini memverifikasi bahwa seluruh 14 parameter inti invensi memiliki konsistensi definisi 100% tanpa adanya disparitas antar-dokumen:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                            14-PARAMETER PRE-FILING LOCK MATRIX                               │
├────┬────────────────────────┬─────────────────────────┬────────────────────────┬─────────────┤
│ No │ Parameter Inti Invensi │ Formula Spesifikasi     │ Lokasi Dukungan Klaim  │ Status Lock │
├────┼────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
│ 1  │ N_detected             │ N ∈ {0, 1, 2, 3, 4, 5}   │ Klaim 1, 2, 10         │ 🔒 LOCKED   │
│ 2  │ AECI                   │ 100 × (N_detected / 5)  │ Klaim 1, 2, 10, 11     │ 🔒 LOCKED   │
│ 3  │ CF (Bounded Attenuator)│ 0.85 + 0.15 × (AECI/100)│ Klaim 1, 2, 11         │ 🔒 LOCKED   │
│ 4  │ BWS (Base Weighted)    │ ∑_{i=1}^7 D_i W_i       │ Klaim 1, 2, 7, 8       │ 🔒 LOCKED   │
│ 5  │ AT-RQS (Final Quality) │ BWS × CF                │ Klaim 1, 2, 12         │ 🔒 LOCKED   │
│ 6  │ S_norm, R_norm, C_norm │ (S/10)*100, ((R-1)/4)*..│ Klaim 1, 2, 4, 5, 6, 9 │ 🔒 LOCKED   │
│ 7  │ ARTI (Triangulation)   │ 100 - [ (|S-R|+|S-C|)/2]│ Klaim 1, 2, 13         │ 🔒 LOCKED   │
│ 8  │ AAC (Confidence)       │ 0.50ARTI + 0.30D + 0.20E│ Klaim 1, 2, 14         │ 🔒 LOCKED   │
│ 9  │ D_completeness (6.5a)  │ (∑ I(F_j ≠ ∅) / 8) * 100│ Klaim 1, 2, 14, 15     │ 🔒 LOCKED   │
│ 10 │ E_consistency (6.5b)   │ 100 - [(|S-R|+|S-C|..)/3│ Klaim 1, 2, 14, 16     │ 🔒 LOCKED   │
│ 11 │ AAC ↛ AT-RQS Isolation │ Non-Circular Topologic  │ Klaim 1, 2, 8, 14      │ 🔒 LOCKED   │
│ 12 │ RFC 8785 Serialization │ Canonical JSON Scheme   │ Klaim 1, 2, 17         │ 🔒 LOCKED   │
│ 13 │ SHA-256 Digest         │ Cryptographic Hash 256b │ Klaim 1, 2, 18, 19     │ 🔒 LOCKED   │
│ 14 │ Immutable Ledger ID    │ APS-AT-RQS-<hash>-v1.0  │ Klaim 1, 2, 18, 19, 20 │ 🔒 LOCKED   │
└────┴────────────────────────┴─────────────────────────┴────────────────────────┴─────────────┘
```

---

## 2. REGISTRI NOMOR ACUAN GAMBAR TEKNIK (REFERENCE NUMERALS REGISTRY)

Untuk memenuhi standar formal gambar paten (*Patent Drawing Reference Numerals*), setiap komponen teknis diberikan nomor acuan konsisten yang digunakan pada uraian deskripsi dan gambar:

* **100:** Sistem Komputasi Asesmen Dokumen Penelitian Keseluruhan (FIG. 1)
  - **102:** Modul Penerima Dokumen Digital Masukan
  - **104:** Memori Kerja / Buffer Naskah
  - **106:** Prosesor Komputasi (CPU/NPU)
  - **108:** Media Penyimpan Non-Transitori Permanen
  - **110:** Antarmuka Jaringan / Bus Sistem
* **200:** Sub-Sistem Ekstraksi Tiga Kanal Independen (Tri-Source) (FIG. 2)
  - **202:** Modul Ekstraksi Pertama (Lapisan SCORE — Rubrik Struktural Diskret 0–10)
  - **204:** Modul Ekstraksi Kedua (Lapisan SCREEN — Penapisan Risiko Ordinal 1–5)
  - **206:** Modul Ekstraksi Ketiga (Lapisan CLUE — Ekstraksi Bukti Faktual Substantif)
* **300:** Engine Normalisasi Skala Deterministik Terpadu (FIG. 3)
  - **302:** Unit Normalisasi Skala Diskret ($\text{SCORE}_{\text{norm}}$)
  - **304:** Unit Normalisasi Skala Ordinal ($\text{SCREEN}_{\text{norm}}$)
  - **306:** Unit Agregasi Bobot Bukti Substantif ($\text{CLUE}_{\text{norm}} / \text{CESS}$)
* **400:** Engine Pembobotan Matriks 7 Dimensi Kualitas Substantif (FIG. 4)
  - **402:** Register Bobot Baku 7 Dimensi ($\sum W_i = 1.00$)
  - **404:** Unit Akumulator Base Weighted Score ($\text{BWS}$)
* **500:** Modul Pemeriksa Bukti Struktural & Bounded Attenuation Engine (FIG. 5)
  - **502:** Unit Deteksi 5 Pilar Bukti Struktural Wajib ($N_{\text{detected}}$)
  - **504:** Komputator Indeks Keselarasan Struktural ($\text{AECI}$)
  - **506:** Engine Redaman Terikat Non-Linier ($\text{CF} \in [0.85, 1.00]$)
  - **508:** Pengali Skor Mutu Substantif Akhir ($\text{AT-RQS} = \text{BWS} \times \text{CF}$)
* **600:** Engine Triangulasi & Keyakinan Asesmen Non-Sirkular (FIG. 6)
  - **602:** Komputator Indeks Triangulasi Tiga Kanal ($\text{ARTI}$)
  - **604:** Jalur Data Terisolasi Mutu vs Keyakinan (Non-Circular Barrier)
  - **606:** Komputator Indeks Keyakinan Asesmen ($\text{AAC}$)
* **700:** Modul Validator Skema Deterministik Independen (FIG. 7)
  - **702:** Unit Pemeriksa Kelengkapan Skema Data Statis ($D_{\text{completeness}}$)
  - **704:** Unit Pengukur Divergensi Ekstraksi Lintas-Lapisan ($E_{\text{consistency}}$)
* **800:** Modul Pembuktian Asal-Usul Kriptografis Permanen (FIG. 8)
  - **802:** Unit Kanonisasi Data Standar RFC 8785
  - **804:** Generator Ringkasan Hash Kriptografis SHA-256
  - **806:** Pembangkit Identifier Asesmen Bertanda Waktu (`assessment_id`)
  - **808:** Ledger Penyimpan Snapshot Asesmen Permanen
* **900:** Alur Eksekusi Komputasi Menyeluruh End-to-End (FIG. 9)
  - **902:** Kartu Rekaman Indeks Publikasi Digital (*ASIA Index Record*)

---

## 3. SPESIFIKASI 9 LEMBAR GAMBAR TEKNIK PATEN (FIG. 1 s/d FIG. 9)

Format gambar disusun dalam gaya gambar paten standar (*black-and-white functional block diagrams with reference numerals*):

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 1 — DIAGRAM BLOK ARSITEKTUR SISTEM KOMPUTASI KESELURUHAN
═══════════════════════════════════════════════════════════════════════════════

                       ┌────────────────────────────┐
                       │   102 MODUL PENERIMA       │
                       │   DOKUMEN PENELITIAN       │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │  100 SISTEM KOMPUTASI ASESMEN DOKUMEN PENELITIAN        │
        │                                                         │
        │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐  │
        │  │ 106 PROSESOR   │  │ 104 MEMORI     │  │ 110 BUS   │  │
        │  │ KOMPUTASI      │◄─┼─► KERJA BUFFER │◄─┼─► SISTEM  │  │
        │  │ (CPU / NPU)    │  │ (RAM)          │  │ / NET     │  │
        │  └────────┬───────┘  └────────────────┘  └─────┬─────┘  │
        │           │                                    │        │
        │           ▼                                    ▼        │
        │  ┌───────────────────────────────────────────────────┐  │
        │  │ 200 SUB-SISTEM EKSTRAKSI TIGA KANAL (TRI-SOURCE)  │  │
        │  ├───────────────────────────────────────────────────┤  │
        │  │ 300 ENGINE NORMALISASI SKALA DETERMINISTIK        │  │
        │  ├───────────────────────────────────────────────────┤  │
        │  │ 400 ENGINE PEMBOBOTAN MATRIKS 7 DIMENSI (BWS)     │  │
        │  ├───────────────────────────────────────────────────┤  │
        │  │ 500 MODUL DETEKSI 5 BUKTI & BOUNDED CF ENGINE     │  │
        │  ├───────────────────────────────────────────────────┤  │
        │  │ 600 ENGINE TRIANGULASI & KEYAKINAN NON-SIRKULAR   │  │
        │  ├───────────────────────────────────────────────────┤  │
        │  │ 700 MODUL VALIDATOR SKEMA INDEPENDEN              │  │
        │  ├───────────────────────────────────────────────────┤  │
        │  │ 800 MODUL ASAL-USUL KRIPTOGRAFIS (RFC8785/SHA256) │  │
        │  └────────────────────────┬──────────────────────────┘  │
        │                           │                             │
        │                           ▼                             │
        │  ┌───────────────────────────────────────────────────┐  │
        │  │ 108 MEDIA PENYIMPAN NON-TRANSITORI PERMANEN       │  │
        │  │ (Immutable Assessment Ledger Database)            │  │
        │  └───────────────────────────────────────────────────┘  │
        └─────────────────────────────────────────────────────────┘
```

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 2 — SUB-SISTEM EKSTRAKSI TIGA KANAL INDEPENDEN (TRI-SOURCE)
═══════════════════════════════════════════════════════════════════════════════

                    ┌──────────────────────────────┐
                    │ 102 DOKUMEN NASKAH DIGITAL   │
                    └──────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
  │ 202 LAPISAN  │          │ 204 LAPISAN  │          │ 206 LAPISAN  │
  │ SCORE        │          │ SCREEN       │          │ CLUE         │
  │ (Rubrik      │          │ (Penapisan   │          │ (Bukti       │
  │ Diskret      │          │ Ordinal      │          │ Faktual      │
  │ S1 s/d S8)   │          │ R1 s/d R3)   │          │ C1 s/d C5)   │
  │ Skala 0–10   │          │ Skala 1–5    │          │ Skala Faktual│
  └──────┬───────┘          └──────┬───────┘          └──────┬───────┘
         │                         │                         │
         ▼                         ▼                         ▼
  [Data S1–S8]              [Data R1–R3]              [Data C1–C5]
```

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 3 — ENGINE NORMALISASI SKALA DETERMINISTIK TERPADU
═══════════════════════════════════════════════════════════════════════════════

   [Data S1–S8 (0–10)]       [Data R1–R3 (1–5)]       [Data C1–C5 (Faktual)]
           │                         │                         │
           ▼                         ▼                         ▼
    ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
    │ 302 UNIT     │          │ 304 UNIT     │          │ 306 UNIT     │
    │ NORMALISASI  │          │ NORMALISASI  │          │ NORMALISASI  │
    │ S_norm =     │          │ R_norm =     │          │ C_norm =     │
    │ (S / 10)*100 │          │ ((R-1)/4)*100│          │ CESS (0-100) │
    └──────┬───────┘          └──────┬───────┘          └──────┬───────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     │
                                     ▼
                   ┌───────────────────────────────────┐
                   │ COMMON COMPUTATIONAL DOMAIN       │
                   │ x_norm ∈ [0, 100] (Deterministik) │
                   └───────────────────────────────────┘
```

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 4 — ENGINE PEMBOBOTAN MATRIKS 7 DIMENSI KUALITAS (BWS)
═══════════════════════════════════════════════════════════════════════════════

   Normalized Features (D1, D2, D3, D4, D5, D6, D7)
           │
           ▼
    ┌────────────────────────────────────────────────────────┐
    │ 402 REGISTER BOBOT BAKU 7 DIMENSI (Σ Wi = 1.00)        │
    │ • W1 = 0.18 (Academic Contribution)                   │
    │ • W2 = 0.18 (Procedural Rigor)                        │
    │ • W3 = 0.16 (Analytical Strength)                     │
    │ • W4 = 0.12 (Scholarly Communication)                 │
    │ • W5 = 0.12 (Integrity & Transparency)                │
    │ • W6 = 0.10 (Future Research Value)                   │
    │ • W7 = 0.14 (Impact & Applicability)                  │
    └────────────────────────┬───────────────────────────────┘
                             │
                             ▼
    ┌────────────────────────────────────────────────────────┐
    │ 404 AKUMULATOR BASE WEIGHTED SCORE (BWS)               │
    │ BWS = ∑_{i=1}^{7} ( D_i × W_i )  ∈ [0, 100]            │
    └────────────────────────────────────────────────────────┘
```

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 5 — DETEKSI 5 BUKTI STRUKTURAL & BOUNDED ATTENUATION ENGINE
═══════════════════════════════════════════════════════════════════════════════

                   ┌───────────────────────────────┐
                   │ 102 DOKUMEN NASKAH DIGITAL    │
                   └───────────────┬───────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │ 502 DETEKSI 5 PILAR STRUKTUR  │
                   │ (Tujuan, Metode, Sampel,      │
                   │ Temuan, Batasan Riset)        │
                   │ N_detected ∈ {0, 1, 2, 3, 4, 5}│
                   └───────────────┬───────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │ 504 KOMPUTATOR INDEKS AECI    │
                   │ AECI = 100 × (N_detected / 5) │
                   │ AECI ∈ [0, 100]               │
                   └───────────────┬───────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │ 506 BOUNDED ATTENUATION ENGINE│
                   │ CF = 0.85 + 0.15 × (AECI/100) │
                   │ CF ∈ [0.85, 1.00] (Batas 15%) │
                   └───────────────┬───────────────┘
                                   │
            404 BWS ───────────────┼───────────────┐
                                   ▼               │
                   ┌───────────────────────────┐   │
                   │ 508 PENGALI MUTU AKHIR    │   │
                   │ AT-RQS = BWS × CF         │   │
                   │ AT-RQS_10 = AT-RQS / 10   │   │
                   └───────────────────────────┘   │
                                                   ▼
```

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 6 — TOPOLOGI PEMISAHAN NON-SIRKULAR MUTU VS KEYAKINAN (AAC)
═══════════════════════════════════════════════════════════════════════════════

  S_norm, R_norm, C_norm ───► ┌───────────────────────────────────────────────┐
                              │ 602 KOMPUTATOR INDEKS TRIANGULASI (ARTI)      │
                              │ ARTI = 100 − [ (|S−R| + |S−C|) / 2 ]          │
                              └──────────────────────┬────────────────────────┘
                                                     │
                       ┌─────────────────────────────┴─────────────────────────────┐
                       │                                                           │
                       ▼                                                           │
        ┌──────────────────────────────┐                                           │
        │ 700 SCHEMA VALIDATOR         │                                           │
        │ • D_completeness (6.5a)      │                                           │
        │ • E_consistency (6.5b)       │                                           │
        └──────────────┬───────────────┘                                           │
                       │                                                           │
                       ▼                                                           │
        ┌────────────────────────────────────────────────────────┐                 │
        │ 606 KOMPUTATOR KEYAKINAN ASESMEN (AAC)                 │                 │
        │ AAC = 0.50(ARTI) + 0.30(D_comp) + 0.20(E_cons)         │                 │
        └──────────────────────────────┬─────────────────────────┘                 │
                                       │                                           │
  ═════════════════════════════════════╪═══════════════════════════════════════════╪═════
     604 ISOLASI MUTLAK NON-SIRKULAR   │ (AAC TIDAK MASUK KE FORMULA AT-RQS)       │
  ═════════════════════════════════════╪═══════════════════════════════════════════╪═════
                                       │                                           │
                                       ▼                                           ▼
                       ┌───────────────────────────────┐           ┌───────────────────┐
                       │ AAC % (Confidence Metric)     │           │ AT-RQS Score      │
                       └───────────────────────────────┘           └───────────────────┘
```

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 7 — MODUL VALIDATOR SKEMA DETERMINISTIK INDEPENDEN
═══════════════════════════════════════════════════════════════════════════════

               ┌─────────────────────────────────────────────────┐
               │ EKSTRAKSI TIGA KANAL (SCORE, SCREEN, CLUE)      │
               └────────────────────────┬────────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             │                                                     │
             ▼                                                     ▼
  ┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
  │ 702 UNIT KELENGKAPAN SKEMA STATIS   │   │ 704 UNIT PENGUKUR DIVERGENSI SILANG │
  │ Uji kehadiran 8 field wajib:        │   │ Rata-rata selisih absolut:          │
  │ D_comp = ( ∑_{j=1}^8 I(Fj≠∅) / 8)*100│   │ E_cons = 100 − [(|S−R|+|S−C|+|R−C|)/3│
  └──────────────────┬──────────────────┘   └──────────────────┬──────────────────┘
                     │                                         │
                     └────────────────────┬────────────────────┘
                                          │
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │ Parameter Bebas AI Self-Assessment Bias │
                     └─────────────────────────────────────────┘
```

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 8 — MODUL PEMBUKTIAN ASAL-USUL KRIPTOGRAFIS PERMANEN
═══════════════════════════════════════════════════════════════════════════════

      [Hasil Asesmen: AT-RQS, AECI, ARTI, AAC, D1-D7, Bukti Faktual, Timestamp]
                                     │
                                     ▼
      ┌────────────────────────────────────────────────────────┐
      │ 802 KANONISASI DATA SKEMA RFC 8785                     │
      │ (Canonical JSON Deterministic Representation)          │
      └──────────────────────────────┬─────────────────────────┘
                                     │
                                     ▼
      ┌────────────────────────────────────────────────────────┐
      │ 804 GENERATOR RINGKASAN HASH SHA-256                   │
      │ SHA-256 Digest (256-bit Immutable Signature)           │
      └──────────────────────────────┬─────────────────────────┘
                                     │
                                     ▼
      ┌────────────────────────────────────────────────────────┐
      │ 806 PEMBANGKIT BLOCK IDENTIFIER ASESMEN                │
      │ assessment_id = "APS-AT-RQS-" + hash16 + "-v1.0"       │
      └──────────────────────────────┬─────────────────────────┘
                                     │
                                     ▼
      ┌────────────────────────────────────────────────────────┐
      │ 808 LEDGER DATABASE NON-TRANSITORI PERMANEN            │
      │ (Deteksi Otomatis Modifikasi Retrospektif Tidak Sah)   │
      └────────────────────────────────────────────────────────┘
```

```
═══════════════════════════════════════════════════════════════════════════════
FIG. 9 — DIAGRAM ALIR EKSEKUSI KOMPUTASI MENYELURUH (END-TO-END)
═══════════════════════════════════════════════════════════════════════════════

                       ┌────────────────────────────┐
                       │ 102 INPUT NASKAH DIGITAL   │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │ 200 EKSTRAKSI TRI-SOURCE   │
                       │ (SCORE, SCREEN, CLUE)      │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │ 300 NORMALISASI TERPADU    │
                       │ [0, 100] DETERMINISTIK     │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │ 400 HITUNG BWS (7 DIMENSI) │
                       │ BWS = ∑ Di Wi              │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │ 500 DETEKSI 5 BUKTI & CF   │
                       │ AECI = 100*(N/5)           │
                       │ CF = 0.85 + 0.15*(AECI/100)│
                       │ AT-RQS = BWS × CF          │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │ 600 TRIANGULASI & KEYAKINAN│
                       │ ARTI = 100 - [Divergensi/2]│
                       │ AAC = 0.50ARTI + 0.30D+0.2E│
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │ 800 ASAL-USUL KRIPTOGRAFIS │
                       │ RFC 8785 ──> SHA-256       │
                       │ Lock Immutable Snapshot    │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │ 902 ASIA INDEX RECORD CARD │
                       │ (Penyematan Kartu Digital) │
                       └────────────────────────────┘
```

---

## 4. MATRIKS SILANG KLAIM – DESKRIPSI – GAMBAR (CROSS-REFERENCE MATRIX)

Tabel berikut membuktikan bahwa **seluruh 20 klaim memiliki dukungan penuh (*full support & enablement*)** pada bab deskripsi dan lembar gambar teknik:

| No. Klaim | Ruang Lingkup Klaim | Lokasi Paragraf Deskripsi | Lembar Gambar Pendukung |
| :---: | :--- | :--- | :--- |
| **Klaim 1** | Sistem CII Tri-Source, Bounded CF, Provenance | Bab 6.1 s/d 6.7 | **FIG. 1, FIG. 9** |
| **Klaim 2** | Metode Komputasi Langkah $(a)$–$(h)$ | Bab 6.2 s/d 6.7 | **FIG. 9** |
| **Klaim 3** | Media Penyimpan Terbaca Komputer | Bab 6.1 | **FIG. 1 (108)** |
| **Klaim 4** | Lapisan SCORE (8 Parameter Diskret 0–10) | Bab 6.2 | **FIG. 2 (202)** |
| **Klaim 5** | Lapisan SCREEN (3 Parameter Ordinal 1–5) | Bab 6.2 | **FIG. 2 (204)** |
| **Klaim 6** | Lapisan CLUE (CESS 5 Bobot Bukti) | Bab 6.2, 6.3 | **FIG. 2 (206), FIG. 3 (306)** |
| **Klaim 7** | Matriks 7 Dimensi Kualitas Baku Bobot 100% | Bab 6.4 | **FIG. 4 (402)** |
| **Klaim 8** | Isolasi Meta-Dimensi Keyakinan dari BWS | Bab 6.4, 6.6 | **FIG. 4, FIG. 6 (604)** |
| **Klaim 9** | Normalisasi SCREEN $((R-1)/4) \times 100$ | Bab 6.3 | **FIG. 3 (304)** |
| **Klaim 10**| 5 Pilar Bukti Struktural Wajib $\text{AECI}$ | Bab 6.5 | **FIG. 5 (502, 504)** |
| **Klaim 11**| Batas Redaman $\text{CF} \in [0.850, 1.000]$ | Bab 6.5 | **FIG. 5 (506)** |
| **Klaim 12**| 5 Kategori Tingkat Mutu Resmi | Bab 6.5 | **FIG. 5 (508)** |
| **Klaim 13**| Formula Absolut $\text{ARTI}$ | Bab 6.6 | **FIG. 6 (602)** |
| **Klaim 14**| Formula Pembobotan Keyakinan $\text{AAC}$ | Bab 6.6 | **FIG. 6 (606)** |
| **Klaim 15**| Formula Tertutup $D_{\text{completeness}}$ (6.5a) | Bab 6.6 | **FIG. 7 (702)** |
| **Klaim 16**| Formula Tertutup $E_{\text{consistency}}$ (6.5b) | Bab 6.6 | **FIG. 7 (704)** |
| **Klaim 17**| Standar Kanonisasi JSON RFC 8785 | Bab 6.7 | **FIG. 8 (802)** |
| **Klaim 18**| Pembangkitan Identifier `assessment_id` | Bab 6.7 | **FIG. 8 (806)** |
| **Klaim 19**| Deteksi Otomatis Modifikasi Retrospektif | Bab 6.7 | **FIG. 8 (808)** |
| **Klaim 20**| Penyematan Kartu Digital ASIA Index Record | Bab 6.7 | **FIG. 9 (902)** |

---
*© 2026 Asia Pacific Academician (ASIA) / APASIFIC Academic Division. Dokumen Pre-Filing Prosecution Hardening.*
