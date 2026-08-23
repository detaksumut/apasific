# AT-RQS™ v1.0 PRIOR-ART CLAIM CHART & PATENTABILITY MATRIX
## Computer-Implemented Deterministic Multi-Source Evidence Processing & Provenance System for Scholarly Assessment

**Dokumen Analisis:** `PAT-CHART-AT-RQS-2026-V1.0`  
**Klasifikasi Paten Internasional (IPC/CPC):** `G06F 40/20` (Text Processing), `G06N 3/00` (AI/ML Architecture), `G06F 16/30` (Document Information Retrieval), `G06F 21/64` (Data Integrity & Provenance)  
**Yurisdiksi Sasaran:** DJKI Kemenkumham RI (Berdasarkan UU No. 65 Tahun 2024 jo. UU No. 13 Tahun 2016) $\longrightarrow$ Traktat Kerja Sama Paten (PCT/WIPO)  
**Pemohon / Insinyur Invensi:** Asia Pacific Academician (ASIA) / APASIFIC Academic Research Division  
**Tanggal Audit:** 24 Agustus 2026

---

## 1. STRATEGI FRAMING TEKNIS (TECHNICAL ELIGIBILITY & CHARACTER)

### 1.1 Kepatuhan terhadap UU No. 65 Tahun 2024 (Revisi UU Paten Indonesia)
Sesuai Pasal 4 ayat (1) huruf f dan Penjelasannya, program komputer dapat dipatenkan apabila merupakan **Invensi yang Diimplementasikan oleh Komputer (*Computer-Implemented Invention / CII*)** yang menghasilkan penyelesaian masalah teknis dan memiliki karakter/efek teknis nyata.

| ❌ Framing Berisiko Tinggi (Bukan Objek Paten) | ✅ Framing Resmi AT-RQS™ (Patentable CII Architecture) |
|---|---|
| *"Metode matematika atau rumus untuk menghitung skor kualitas artikel ilmiah berbasis pembobotan 7 dimensi..."* | *"Sistem dan metode yang diimplementasikan oleh komputer untuk memproses bukti naskah ilmiah terstruktur dari tiga lapisan analitik independen, menormalisasi data heterogen, menerapkan atenuasi terikat konsistensi struktural, memisahkan keyakinan asesmen dari skor substantif secara non-sirkular, serta membangkitkan catatan pembuktian asal-usul kriptografis permanen."* |

### 1.2 Masalah Teknis, Solusi Teknis, dan Efek Teknis (*Technical Problem-Solution Approach*)
1. **Masalah Teknis 1 (Heterogeneous Scale Conflict):** Ekstraksi bukti dari berbagai model AI menghasilkan skala mentah heterogen (skala 0–10, 1–5, dan entitas teks bebas) yang memicu agregasi komputasi tidak konsisten.  
   $\rightarrow$ **Solusi Teknis:** Pipeline normalisasi deterministik terpadu (*Unified Deterministic Normalization Protocol*) yang memetakan seluruh domain mentah ke skala komputasi terpadu $[0, 100]$.
2. **Masalah Teknis 2 (Structural Evidence Blindness & Distortion):** Naskah dengan pembahasan panjang tetapi kehilangan elemen metodologi inti dapat memperoleh skor tinggi secara tidak proporsional.  
   $\rightarrow$ **Solusi Teknis:** Mekanisme validasi keselarasan struktural bukti ($\text{AECI}$) yang mengendalikan faktor atenuasi terikat ($\text{CF} \in [0.85, 1.00]$) secara langsung terhadap *Base Weighted Score*.
3. **Masalah Teknis 3 (Self-Assessment Bias & Circularity):** Sistem AI konvensional menilai sendiri tingkat keyakinannya, menyebabkan pembengkakan skor kualitas palsu (*hallucinatory confidence inflation*).  
   $\rightarrow$ **Solusi Teknis:** Pemisahan ketat alur data kualitas substantif ($\text{AT-RQS}$) dari keyakinan asesmen ($\text{AAC}$), di mana parameter kelengkapan data ($D_{\text{completeness}}$) dan divergensi ekstraksi ($E_{\text{consistency}}$) dievaluasi oleh *Deterministic Schema Validator* terpisah.
4. **Masalah Teknis 4 (Post-Assessment Tampering & Non-Reproducibility):** Hasil evaluasi digital rentan dimanipulasi secara retrospektif pada basis data.  
   $\rightarrow$ **Solusi Teknis:** Serialisasi Canonical JSON (RFC 8785) $\rightarrow$ Ringkasan Kriptografis SHA-256 $\rightarrow$ *Timestamped Immutable Assessment Block Identifier*.

---

## 2. PRIOR-ART CLAIM CHART & NOVELTY MATRIX

Tabel berikut membandingkan setiap fitur teknis spesifik AT-RQS™ terhadap 6 dokumen paten pembanding (*prior-art families*):

### Daftar Dokumen Pembanding Utama:
* **D1:** `WO2020257780A1` — *Method and system for evaluating product research* (Clinical/Product Research Scoring)
* **D2:** `US20220107973A1` — *Collaborative annotation and artificial intelligence for discussion, evaluation, and recommendation of research papers* (LACE AI System)
* **D3:** `US12118311B1` — *Research replicability assessment* (ML Replicability Prediction)
* **D4:** `WO2026072754A1` — *Dynamic Pairwise Document Evaluation System and Method Using Adaptive Comparative Document Scores* (DPDES)
* **D5:** `CN120337914A/B` — *Intelligent academic-paper evaluation method based on multidimensional vector representation*
* **D6:** `US11275810B2` — *AI-based triple checking method and apparatus*

---

### Master Claim Element Comparison Matrix

| Elemen Fitur Teknis AT-RQS™ | D1 (WO'780) | D2 (US'973) | D3 (US'311) | D4 (WO'754) | D5 (CN'914) | D6 (US'810) | Status Novelty AT-RQS™ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **F1: Tri-Source Evidence Extraction Layer**<br>(Independen: SCORE rubrik diskret 0–10, SCREEN ordinal 1–5, CLUE fakta substantif kuantitatif/keterbatasan) | ❌<br>(Database descriptors) | ❌<br>(User annotation + AI signal) | ❌<br>(Single NLP extraction) | ❌<br>(IDQS + Pairwise comparative) | ❌<br>(Semantic vector embedding) | ⚠️<br>(3 generic data sources) | 🟢 **NOVEL & DISTINCT**<br>(Kombinasi 3 layer analitik terstruktur, ordinal, & faktual) |
| **F2: Unified Deterministic Scale Normalization Protocol**<br>(Konversi $S \to (S/10)\times 100$, $R \to ((R-1)/4)\times 100$, dan $\text{CESS} = \sum w_k c_k$) | ⚠️<br>(Standard linear scaling) | ❌<br>(Dynamic weight tuning) | ❌<br>(Binary/Probabilistic) | ⚠️<br>(Pairwise normalization) | ⚠️<br>(Vector normalization) | ❌<br>(Confidence weighting) | 🟢 **NOVEL IN COMBINATION**<br>(Deterministik lintas domain skala diskret, ordinal & CESS) |
| **F3: 7+1 APASIFIC Matrix Architecture**<br>(7 Dimensi Substantif Tertimbang $\sum W_i = 1.00$ + 1 Meta-Dimensi Non-Tertimbang) | ❌<br>(Single overall score) | ⚠️<br>(Arbitrary signals) | ❌<br>(Replicability score only) | ❌<br>(Comparative score) | ⚠️<br>(Vector features) | ❌<br>(Accuracy index) | 🟢 **NOVEL IN COMBINATION**<br>(Distribusi 7 bobot terkalibrasi + isolasi meta-dimensi) |
| **F4: Structural Evidence Detection ($\text{AECI}$)**<br>(Deteksi wajib 5 elemen struktural IMRAD: Tujuan, Metode, Sampel, Temuan, Batasan $\to 100 \times (N/5)$) | ❌<br>(Keyword standard matching) | ❌<br>(Peer annotation feedback) | ⚠️<br>(Replicability elements) | ❌<br>(Summary quality) | ❌<br>(Vector similarity) | ❌<br>(Entity validation) | 🟢 **NOVEL & DISTINCT**<br>(Formula diskret proporsional murni berbasis 5 pilar) |
| **F5: Bounded Consistency Attenuation Engine ($\text{CF}$)**<br>($\text{CF} = 0.85 + 0.15 \times (\text{AECI}/100)$ membatasi atenuasi maksimal 15% pada $\text{BWS}$) | ❌<br>(Linear penalty) | ❌<br>(Feedback loop) | ❌<br>(Regression weight) | ❌<br>(Pairwise margin) | ❌<br>(Neural loss function) | ❌<br>(Binary threshold) | 🟢 **STRONG INVENTIVE CORE**<br>(Mekanisme umpan-maju redaman terikat $[0.85, 1.00]$) |
| **F6: Research Triangulation Index Engine ($\text{ARTI}$)**<br>($\text{ARTI} = 100 - [(\|S_{\text{norm}}-R_{\text{norm}}\| + \|S_{\text{norm}}-C_{\text{norm}}\|)/2]$) | ❌<br>(Nihil) | ❌<br>(Signal reinforcement) | ❌<br>(Nihil) | ⚠️<br>(Comparative divergence) | ❌<br>(Cosine distance) | ⚠️<br>(Triple agreement check) | 🟢 **NOVEL & DISTINCT**<br>(Formula divergensi absolut 3 kanal independen) |
| **F7: Non-Circular Quality vs Confidence Separation**<br>($\text{AAC} = 0.50\text{ARTI} + 0.30D + 0.20E$ tidak masuk kalkulasi $\text{AT-RQS}$) | ❌<br>(Confidence modifies score) | ❌<br>(Ranking incorporates confidence) | ❌<br>(Probabilistic output) | ❌<br>(Comparative confidence) | ❌<br>(Unified confidence layer) | ❌<br>(Confidence modifies trust) | 🟢 **STRONG INVENTIVE CORE**<br>(Pemisahan mutlak jalur data kualitas vs keyakinan) |
| **F8: Independent Deterministic Schema Validator**<br>(Pengujian $D_{\text{completeness}}$ & $E_{\text{consistency}}$ oleh validator kode terpisah, bebas AI self-assessment) | ❌<br>(AI internal confidence) | ❌<br>(Crowdsourced validation) | ❌<br>(Model internal metric) | ❌<br>(LLM judge) | ❌<br>(Softmax confidence) | ⚠️<br>(External logic checker) | 🟢 **NOVEL & DISTINCT**<br>(Isolasi validator deterministik pencegah halusinasi AI) |
| **F9: Cryptographic Assessment Provenance Ledger**<br>(Serialisasi Canonical JSON RFC 8785 $\to$ SHA-256 Digest $\to$ Timestamped ID Permanen) | ❌<br>(Database record biasa) | ❌<br>(Standard web database) | ❌<br>(Server logs) | ❌<br>(Database storage) | ❌<br>(Relational record) | ⚠️<br>(General integrity check) | 🟢 **NOVEL IN COMBINATION**<br>(Penguncian kriptografis snapshot asesmen ilmiah multi-layer) |

---

## 3. HIERARKI DRAFT KLAIM PATEN (20 CLAIMS STRUCTURE)

Untuk melindungi seluruh spektrum invensi dan menyediakan posisi perlindungan berlapis (*fallback defense*), klaim disusun ke dalam 3 Klaim Mandiri (*Independent Claims*) dan 17 Klaim Turunan (*Dependent Claims*):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       KLAIM MANDIRI 1 (SISTEM CII)                          │
│ Sistem terkomputerisasi pemrosesan bukti multi-sumber deterministik,        │
│ normalisasi skala heterogen, atenuasi konsistensi struktural, isolasi       │
│ keyakinan non-sirkular, dan pembangkitan rekaman kriptografis permanen.     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   [Klaim 4–6: Tri-Source]     [Klaim 7–9: 7+1 Matriks]     [Klaim 10–12: AECI/CF]
   SCORE, SCREEN, CLUE         Dimensi & Bobot Baku         5 Bukti & Redaman Terikat
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   [Klaim 13: Formula ARTI]    [Klaim 14–15: AAC & Validator] [Klaim 16–18: Kriptografi]
   Triangulasi 3 Kanal         Non-Circular & Schema Rule   RFC 8785 & SHA-256 Digest
```

### 3.1 Naskah Klaim Mandiri 1 (Sistem Terkomputerisasi):
> **Klaim 1 (Sistem):**  
> *"Suatu sistem terkomputerisasi untuk asesmen mutu naskah penelitian berbasis pemrosesan bukti deterministik multi-sumber dan verifikasi asal-usul yang dapat diaudit, sistem tersebut mencakup:  
> - **modul penerima dokumen** yang dikonfigurasikan untuk menerima naskah digital penelitian;  
> - **modul ekstraksi analitis pertama (SCORE)** yang mengekstraksi parameter struktural dalam skala diskret $[0, 10]$;  
> - **modul ekstraksi analitis kedua (SCREEN)** yang mengekstraksi parameter risiko, kebaruan, dan kejelasan dalam skala ordinal $[1, 5]$;  
> - **modul ekstraksi analitis ketiga (CLUE)** yang mengekstraksi parameter bukti substantif kuantitatif dan deklarasi batasan penelitian;  
> - **engine normalisasi skala deterministik** yang mengonversi parameter dari ketiga modul ekstraksi ke dalam skala komputasi terpadu $[0, 100]$;  
> - **engine pembobotan dimensi kualitas** yang menghitung Base Weighted Score ($\text{BWS}$) dari tujuh dimensi kualitas substantif terdefinisi dengan total bobot 100%;  
> - **modul pemeriksa bukti struktural ($\text{AECI}$)** yang mendeteksi kehadiran lima elemen struktural wajib pada naskah;  
> - **engine atenuasi terikat ($\text{CF}$)** yang menghitung faktor redaman dalam rentang $[0.85, 1.00]$ berdasarkan skor keselarasan bukti struktural untuk menghasilkan skor kualitas akhir ($\text{AT-RQS} = \text{BWS} \times \text{CF}$);  
> - **engine triangulasi analitik ($\text{ARTI}$)** yang mengukur kesepakatan konvergensi antar-lapisan analitik;  
> - **engine asesmen keyakinan ($\text{AAC}$)** yang menghitung indeks keyakinan asesmen secara independen tanpa memodifikasi skor kualitas akhir;  
> - **modul validator skema independen** yang mengevaluasi kelengkapan data dan konsistensi lintas-lapisan secara aturan kode deterministik; serta  
> - **modul pembuktian asal-usul kriptografis** yang mengonversi seluruh parameter asesmen menjadi representasi kanonikal terstandardisasi dan menghasilkan ringkasan hash kriptografis bertanda waktu yang mengunci rekaman data secara permanen."*

### 3.2 Naskah Klaim Mandiri 2 (Metode Terkomputerisasi):
> **Klaim 2 (Metode):**  
> *"Suatu metode yang diimplementasikan oleh komputer untuk mengevaluasi mutu naskah ilmiah secara deterministik dan anti-halusinasi, metode tersebut mencakup langkah-langkah:  
> (a) menerima naskah penelitian pada prosesor komputasi;  
> (b) mengekstraksi secara simultan tiga himpunan bukti analitik independen (SCORE, SCREEN, CLUE);  
> (c) menormalisasi seluruh himpunan bukti heterogen ke dalam domain nilai $[0, 100]$;  
> (d) menghitung skor terbobot $\text{BWS} = \sum_{i=1}^7 D_i W_i$ dengan batasan $\sum W_i = 1.00$;  
> (e) mendeteksi kehadiran lima elemen struktural wajib naskah untuk menghasilkan indeks $\text{AECI} = 100 \times (N_{\text{detected}}/5)$;  
> (f) menerapkan faktor atenuasi terikat $\text{CF} = 0.85 + 0.15 \times (\text{AECI}/100)$ terhadap $\text{BWS}$ untuk menghasilkan skor kualitas akhir $\text{AT-RQS}$;  
> (g) menghitung indeks triangulasi $\text{ARTI}$ dan indeks keyakinan $\text{AAC}$ pada jalur data terpisah dari $\text{AT-RQS}$; serta  
> (h) membangkitkan ringkasan SHA-256 dari serialisasi Canonical JSON (RFC 8785) untuk mengunci hasil asesmen ke dalam ledger permanen."*

### 3.3 Naskah Klaim Mandiri 3 (Media Penyimpan Terbaca Komputer):
> **Klaim 3 (Medium):**  
> *"Suatu media penyimpan non-transitori yang dapat dibaca oleh komputer yang memuat instruksi program, yang apabila dieksekusi oleh setidaknya satu prosesor, menyebabkan prosesor tersebut menjalankan langkah-langkah metode dari Klaim 2."*

### 3.4 Ringkasan 17 Klaim Turunan (Dependent Claims 4–20):
* **Klaim 4:** Sistem dari Klaim 1, di mana modul SCORE mengevaluasi 8 parameter struktural naskah ($S_1 \dots S_8$).
* **Klaim 5:** Sistem dari Klaim 1, di mana modul SCREEN mengevaluasi kebaruan, risiko metodologi, dan kejelasan akademik ($R_1 \dots R_3$).
* **Klaim 6:** Sistem dari Klaim 1, di mana modul CLUE menghitung CLUE Evidence Strength Score ($\text{CESS}$) dari 5 bobot bukti empiris.
* **Klaim 7:** Sistem dari Klaim 1, di mana 7 dimensi mutu terdiri dari: *Academic Contribution (18%), Procedural Rigor (18%), Analytical Strength (16%), Scholarly Communication (12%), Integrity & Transparency (12%), Future Research Value (10%),* dan *Impact & Applicability (14%)*.
* **Klaim 8:** Sistem dari Klaim 1, di mana Meta-Dimensi Penilaian Keyakinan ($\text{AAC}$) diisolasi dari penjumlahan bobot kualitas substantif.
* **Klaim 9:** Sistem dari Klaim 1, di mana normalisasi SCREEN mengadopsi fungsi $\text{SCREEN}_{\text{norm}} = ((R-1)/4) \times 100$.
* **Klaim 10:** Sistem dari Klaim 1, di mana 5 elemen struktural wajib modul $\text{AECI}$ terdiri dari: Tujuan Riset, Desain Metodologi, Sampel Empiris, Temuan Hasil, dan Keterbatasan Riset.
* **Klaim 11:** Sistem dari Klaim 1, di mana faktor atenuasi $\text{CF}$ memiliki batas bawah redaman sebesar $0.850$ saat $\text{AECI} = 0.0$ dan batas atas $1.000$ saat $\text{AECI} = 100.0$.
* **Klaim 12:** Sistem dari Klaim 1, di mana skor kualitas akhir $\text{AT-RQS}$ dipetakan ke dalam 5 tingkatan mutu resmi: *Exemplary Rigor, Strong Quality, Good Quality, Satisfactory with Limitations,* dan *Preliminary Evidence*.
* **Klaim 13:** Sistem dari Klaim 1, di mana indeks triangulasi dihitung melalui fungsi $\text{ARTI} = 100 - [(|\text{S}_{\text{norm}} - \text{R}_{\text{norm}}| + |\text{S}_{\text{norm}} - \text{C}_{\text{norm}}|)/2]$.
* **Klaim 14:** Sistem dari Klaim 1, di mana indeks keyakinan $\text{AAC}$ menggabungkan $\text{ARTI}$ ($50\%$), Kelengkapan Data $D$ ($30\%$), dan Konsistensi Ekstraksi $E$ ($20\%$).
* **Klaim 15:** Sistem dari Klaim 1, di mana Kelengkapan Data ($D$) diuji oleh modul pemeriksa kehadiran skema data non-null tanpa melibatkan proses inferensi model kecerdasan buatan.
* **Klaim 16:** Sistem dari Klaim 1, di mana Konsistensi Ekstraksi ($E$) diukur dari deviasi silang nilai ekstraksi lintas tiga lapisan analitik.
* **Klaim 17:** Sistem dari Klaim 1, di mana serialisasi kanonikal mengikuti standar internasional RFC 8785 (*JSON Canonicalization Scheme*).
* **Klaim 18:** Sistem dari Klaim 1, di mana identifier asesmen unik (`assessment_id`) dibangkitkan dari kombinasi prefix institusional, identifier dokumen, dan ringkasan hash SHA-256.
* **Klaim 19:** Sistem dari Klaim 1, di mana modifikasi retrospektif apapun pada basis data relasional menyebabkan ketidaksesuaian verifikasi hash (*hash mismatch detection*).
* **Klaim 20:** Sistem dari Klaim 1, di mana seluruh parameter hasil asesmen dan jejak audit disematkan secara otomatis pada kartu identitas publik digital artikel ilmiah (*Public Scholarly Passport*).

---

## 4. ROADMAP PENDAFTARAN PATEN & STRATEGI PRIORITAS (TIMELINE)

```
[Agustus 2026] ───────> [Bulan 0 - Sept 2026] ───────> [Bulan 12 - Sept 2027] ───────> [Bulan 30 - Maret 2029]
Internal Freeze         Filing Permohonan Paten        Filing Permohonan PCT          Fase Nasional PCT
& Claim Chart Final     Invensi ke DJKI Kemenkumham RI (WIPO Priority Claim)          (USPTO, EPO, JPO, MyIPO)
```

1. **Tahap 1: Penguncian Dokumen Paten Spesifikasi Teknis (Agustus 2026)**
   * Menyelaraskan seluruh kode sumber engine (`ATRQSEngine.ts`), unit test, spesifikasi monograf PDF, dan claim chart.
2. **Tahap 2: Pendaftaran Paten Invensi Perdana di DJKI Kemenkumham RI (September 2026)**
   * Mengajukan dokumen spesifikasi paten invensi lengkap (Deskripsi, 20 Klaim, Abstrak, dan 9 Gambar Teknik / FIG. 1–FIG. 9) ke DJKI RI untuk mengamankan **Priority Date**.
3. **Tahap 3: Permohonan Paten Internasional PCT melalui WIPO (Sebelum September 2027)**
   * Memanfaatkan hak prioritas Paris Convention / PCT dalam kurun waktu 12 bulan sejak tanggal penerimaan DJKI untuk melindungi invensi di 157 negara anggota PCT.
4. **Tahap 4: Memasuki Fase Nasional (*National Phase Entry*) (Sebelum Maret 2029)**
   * Memasuki pemeriksaan substantif di kantor paten prioritas (Amerika Serikat / USPTO, Eropa / EPO, Malaysia / MyIPO, Jepang / JPO).

---
*© 2026 Asia Pacific Academician (ASIA) / APASIFIC Academic Division. Dokumen Strategis Hak Kekayaan Intelektual.*
