# APASIFIC TRI-SOURCE RESEARCH QUALITY SCORE™ (AT-RQS™)
## Official Methodology & Mathematical Formulation Specification v1.0

**Dokumen Standar:** `SPEC-AT-RQS-2026-V1.0`  
**Penerbit Resmi:** Asia Pacific Academician (ASIA) / APASIFIC Academic Research Division  
**Klasifikasi Teknis:** Multi-Layer Scholarly Quality Assessment & Triangulation Architecture  
**Status Metodologis:** FORMAL TECHNICAL SPECIFICATION (v1.0)  
**Dokumen Validasi Terkait:** `VAL-AT-RQS-2026-B01` (Benchmark & Calibration Report)  
**Pemberlakuan:** Seluruh Jurnal Akademik di Bawah Naungan APASIFIC  
**Tanggal Rilis:** 24 Agustus 2026 (Jakarta / Medan / Kuala Lumpur)

---

## DAFTAR ISI (TABLE OF CONTENTS)

1. [Bab I: Pendahuluan & Landasan Filosofis](#bab-i-pendahuluan--landasan-filosofis)
2. [Bab II: Arsitektur Tri-Source (3 Lapisan Analitik)](#bab-ii-arsitektur-tri-source-3-lapisan-analitik)
3. [Bab III: Protokol Normalisasi Terpadu (Unified Normalization Protocol)](#bab-iii-protokol-normalisasi-terpadu-unified-normalization-protocol)
4. [Bab IV: Standar Evaluasi Multi-Faktor Sampling Rigor](#bab-iv-standar-evaluasi-multi-faktor-sampling-rigor)
5. [Bab V: Matriks 8 Dimensi APASIFIC (7 Quality + 1 Meta-Dimension)](#bab-v-matriks-8-dimensi-apasific-7-quality--1-meta-dimension)
6. [Bab VI: Formulasi Matematis 4 Metrik Resmi](#bab-vi-formulasi-matematis-4-metrik-resmi)
7. [Bab VII: Contoh Perhitungan End-to-End (Worked Example)](#bab-vii-contoh-perhitungan-end-to-end-worked-example)
8. [Bab VIII: Mitigasi Bias & Tata Kelola Kepercayaan (AAC™ Engine)](#bab-viii-mitigasi-bias--tata-kelola-kepercayaan-aac-engine)
9. [Bab IX: Arsitektur Immutable Snapshot & Integritas Kriptografis](#bab-ix-arsitektur-immutable-snapshot--integritas-kriptografis)
10. [Bab X: Status Hak Kekayaan Intelektual (HKI) & Klaim Paten](#bab-x-status-hak-kekayaan-intelektual-hki--klaim-paten)
11. [Bab XI: Protokol Validasi Empiris & Registri Benchmark](#bab-xi-protokol-validasi-empiris--registri-benchmark)
12. [Bab XII: Pengesahan Dewan Redaksi & Penutup](#bab-xii-pengesahan-dewan-redaksi--penutup)

---

## BAB I: PENDAHULUAN & LANDASAN FILOSOFIS

### 1.1 Latar Belakang Masalah
Dalam lanskap publikasi ilmiah modern, evaluasi kualitas naskah menghadapi tantangan ganda:
1. **Keterbatasan Peer Review Konvensional:** Skalabilitas yang terbatas, disparitas waktu telaah (*review turnaround latency*), dan potensi inkonsistensi subjektif antar-penelaah.
2. **Kelemahan Black-Box AI:** Kemunculan instrumen AI generatif yang hanya memberikan skor tunggal mentah tanpa transparansi parameter, ketiadaan landasan matematis terverifikasi, dan tingginya risiko halusinasi data (*stochastic hallucination*).

Pendekatan *black-box* memicu skeptisisme yang wajar di kalangan dewan guru besar, asesor akreditasi nasional (SINTA), dan lembaga pengindeks internasional (Scopus, Web of Science). Pertanyaan mendasar yang wajib dijawab adalah:  
> *“Dari mana angka tersebut dihitung, bagaimana rumus pembobotannya, apa bukti tekstual yang melandasinya, dan bagaimana derajat konsistensi perhitungannya?”*

Untuk menjawab tantangan tersebut, Asia Pacific Academician (ASIA) / APASIFIC mengembangkan **APASIFIC Tri-Source Research Quality Score™ (AT-RQS™)** sebagai kerangka kerja deterministik, multi-lapisan, dan dapat diaudit secara independen (*fully auditable & reproducible*).

### 1.2 Tiga Prinsip Utama Metodologi
1. **Proprietary Multi-Layer Consensus Synthesis:** AI bertindak murni sebagai instrumen ekstraksi fakta awal (*feature extraction agent*) pada tiga lapisan terpisah. Standardisasi, pembobotan, triangulasi deviasi, dan kalkulasi skor akhir dikendalikan 100% oleh algoritma deterministik APASIFIC.
2. **Quality vs. Confidence Strict Separation:** Kualitas substantif naskah ($AT\text{-}RQS \in [0, 100]$) dipisahkan secara tegas dari derajat keyakinan ekstraksi data ($AAC \in [0, 100\%]$), konsistensi struktural ($AECI \in [0, 100]$), dan indeks triangulasi ($ARTI \in [0, 100]$). Tidak ada percampuran sirkular (*circular dependency*) di mana keyakinan tinggi secara artifisial menaikkan skor kualitas naskah yang secara metodologi lemah.
3. **Kerangka Baku 7+1 Dimensi (A-P-A-S-I-F-I-C):** Mengadaptasi akronim institusional APASIFIC menjadi **7 Dimensi Kualitas Substantif Tertimbang** dan **1 Meta-Dimensi Penilaian Keyakinan Non-Tertimbang**.

---

## BAB II: ARSITEKTUR TRI-SOURCE (3 LAPISAN ANALITIK)

Sistem AT-RQS™ mengekstraksi data secara simultan dari tiga lapisan sumber analitik independen:

```
                  ┌──────────────────────────────────────────────┐
                  │        3 LAPISAN SUMBER ANALISIS AI          │
                  ├──────────────────────────────────────────────┤
                  │ Layer 1: SCORE  (Structured Rubrics 0–10)    │
                  │ Layer 2: SCREEN (Risk & Novelty 1–5)         │
                  │ Layer 3: CLUE   (Evidence & Limitations Fact)│
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    UNIFIED NORMALIZATION PROTOCOL            │
                  │   SCORE_norm, SCREEN_norm, CLUE_norm (0–100) │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │   7+1 APASIFIC DIMENSIONS MATRIX             │
                  │   7 Quality Dimensions + 1 Meta-Dimension   │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    ARTI™ & AECI™ VERIFICATION ENGINE         │
                  │   Triangulation Agreement + Bounded CF       │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
 ════════════════════════════════════════════════════════════════════════════════
                  4 METRIK RESMI PADA ARTIKEL PUBLIKASI
 ════════════════════════════════════════════════════════════════════════════════
   🥇 1. AT-RQS™ Score (0–100 / 0.00–10.00) : Skor Mutu Kualitas Penelitian
   🛡️ 2. AECI™ Index (0–100)               : Indeks Konsistensi Struktur Bukti
   📊 3. ARTI™ Agreement (0–100)           : Derajat Kesepakatan Tri-Source Layer
   ◈ 4. AAC™ Confidence (%)               : Keyakinan Asesmen & Kelengkapan Data
 ════════════════════════════════════════════════════════════════════════════════
```

### 2.1 Layer 1: SCORE (Structured Quality Rubrics)
Mengevaluasi 8 parameter struktural naskah menggunakan skala metrik diskret $[0, 10]$:
* $S_1$: *Research Gap Justification*
* $S_2$: *Topic Relevance to Scholarly Discipline*
* $S_3$: *Methodological Rigor Rubric*
* $S_4$: *Empirical Data & Statistical Treatment*
* $S_5$: *IMRAD Article Structure Conformity*
* $S_6$: *Abstract Clarity & Keyword Alignment*
* $S_7$: *Comparative Discussion & Analytical Depth*
* $S_8$: *Contemporary References & DOI Citation Quality*

### 2.2 Layer 2: SCREEN (Risk, Novelty & Clarity Screening)
Melakukan penapisan risiko dan kebaruan konseptual menggunakan skala ordinal $[1, 5]$:
* $R_1$: *Novelty & Originality Rating* ($1 = \text{Trivial/Derivative}, 5 = \text{Breakthrough/Substantial}$)
* $R_2$: *Methodological Risk Rating* ($1 = \text{High Risk/Flawed}, 5 = \text{Robust/Exemplary}$)
* $R_3$: *Scholarly Communication Clarity* ($1 = \text{Ambiguous/Poor}, 5 = \text{Precise/Lucid}$)

### 2.3 Layer 3: CLUE (Deep Evidence & Limitations Fact Extraction)
Mengekstraksi bukti faktual tekstual dan kuantitatif dari isi naskah:
* Bukti Kuantitatif: Ukuran koefisien determinasi ($R^2$), signifikansi statistik ($p\text{-value}$), uji $t$, uji $F$, dan *effect size*.
* Bukti Metodologis: Deklarasi ukuran populasi ($N$), ukuran sampel ($n$), teknik sampling, instrumen validitas-reliabilitas.
* Bukti Transparansi: Dokumentasi batasan penelitian (*documented limitations*) dan potensi bias kontekstual.
* Bukti Dampak: Implikasi manajerial praktis dan potensi transferabilitas kebijakan.

---

## BAB III: PROTOKOL NORMALISASI TERPADU (UNIFIED NORMALIZATION PROTOCOL)

Untuk menjamin komparabilitas matematis yang valid antar-skala yang berbeda, seluruh input mentah dinormalisasi ke skala terpadu $x_{\text{norm}} \in [0, 100]$ sebelum diagregasikan.

### 3.1 Formula Normalisasi Masing-Masing Lapisan

#### 1. Normalisasi Layer SCORE ($S \in [0, 10]$):
$$\text{SCORE}_{\text{norm}} = \left( \frac{S}{10} \right) \times 100$$

#### 2. Normalisasi Layer SCREEN ($R \in [1, 5]$):
$$\text{SCREEN}_{\text{norm}} = \left( \frac{R - 1}{4} \right) \times 100$$

*Tabel Konversi SCREEN:*
| Nilai Mentah ($R$) | Nilai Terstandardisasi ($\text{SCREEN}_{\text{norm}}$) | Interpretasi Skala |
| :---: | :---: | :--- |
| **1.0** | **0.0** | Sangat Rendah / Cacat Struktural |
| **2.0** | **25.0** | Rendah / Di Bawah Standar |
| **3.0** | **50.0** | Rata-Rata / Memadai |
| **4.0** | **75.0** | Baik / Memenuhi Standar Tinggi |
| **5.0** | **100.0** | Sangat Baik / Tanpa Celah |

Komposit keseluruhan Layer SCREEN dihitung dengan:
$$\text{SCREEN}_{\text{composite}} = 0.40 \cdot \text{SCREEN}_{\text{novelty}} + 0.40 \cdot \text{SCREEN}_{\text{methodology}} + 0.20 \cdot \text{SCREEN}_{\text{clarity}}$$

#### 3. Normalisasi Layer CLUE: CLUE Evidence Strength Score (CESS)
Mengingat Layer CLUE berisi fakta kualitatif dan kuantitatif, normalisasi ke skala $\text{CLUE}_{\text{norm}} \in [0, 100]$ dilakukan melalui fungsi agregasi deterministik **CLUE Evidence Strength Score (CESS)**:

$$\text{CLUE}_{\text{norm}} = \text{CESS} = \sum_{k=1}^{5} w_k \cdot c_k$$

Di mana $w_k$ adalah bobot komponen bukti dan $c_k \in [0, 100]$ adalah nilai skor bukti individual:
* **$c_1$ (Statistical & Model Fit):** $R^2 \ge 0.40 \land p < 0.05 \implies 90.0$; Model teruji standar $\implies 82.0$; Uji deskriptif tanpa inferensi $\implies 70.0$; Tidak ada uji kuantitatif $\implies 50.0$. ($w_1 = 0.30$)
* **$c_2$ (Sampling Rigor):** Skor dari 5 Kriteria Sampling Rigor (Bab IV) $\in [60, 90]$. ($w_2 = 0.25$)
* **$c_3$ (Limitation Openness):** Batasan penelitian dinyatakan eksplisit dan jujur $\implies 90.0$; Dinyatakan implisit $\implies 75.0$; Tidak dinyatakan $\implies 50.0$. ($w_3 = 0.15$)
* **$c_4$ (Future Research Agenda):** Rekomendasi riset masa depan spesifik $\implies 88.0$; Rekomendasi umum $\implies 75.0$; Nihil $\implies 50.0$. ($w_4 = 0.15$)
* **$c_5$ (Practical & Policy Utility):** Implikasi kebijakan / manajerial nyata $\implies 90.0$; Implikasi umum $\implies 80.0$; Nihil $\implies 50.0$. ($w_5 = 0.15$)

$$\sum_{k=1}^{5} w_k = 0.30 + 0.25 + 0.15 + 0.15 + 0.15 = 1.00$$

### 3.2 Master Scoring Evidence Registry
Tabel berikut merinci pemetaan sumber input, normalisasi, dan aturan fallback:

| Kode | Sub-Indikator | Layer Sumber | Field Input Mentah | Formula Normalisasi | Nilai Fallback Terkendali |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A1.1** | Research Gap | `SCORE` | `research_gap` ($0\text{--}10$) | $S \times 10$ | Analisis Frasa Abstrak ($75.0$) |
| **A1.2** | Novelty Rating | `SCREEN` | `novelty_rating` ($1\text{--}5$) | $((R-1)/4) \times 100$ | Baseline Domain ($65.0$) |
| **A1.3** | Topic Relevance | `SCORE` | `topic_relevance` ($0\text{--}10$) | $S \times 10$ | Keyword Matching ($85.0$) |
| **P.1** | Methodology Rubric | `SCORE` | `methodology` ($0\text{--}10$) | $S \times 10$ | Structural Method Checker ($80.0$) |
| **P.2** | Methodology Screening| `SCREEN`| `methodology_rating` ($1\text{--}5$)| $((R-1)/4) \times 100$ | Section Presence Scorer ($75.0$) |
| **P.3** | Sampling Rigor | `CLUE` | `sample_size`, `strategy` | Evaluasi 5 Kriteria (Bab IV) | Baseline Kontekstual ($75.0$) |
| **A2.1** | Statistical Treatment| `SCORE` | `data_statistics` ($0\text{--}10$) | $S \times 10$ | Uji Statistik Template ($80.0$) |
| **A2.2** | Model Robustness | `CLUE` | $R^2$, $F$, $t$, $p\text{-val}$ | Nilai $c_1$ pada CESS | Baseline Robustness ($82.0$) |
| **S.1** | Article Structure | `SCORE` | `article_structure` ($0\text{--}10$)| $S \times 10$ | IMRAD Checklist ($80.0$) |
| **S.2** | Abstract Quality | `SCORE` | `abstract` ($0\text{--}10$) | $S \times 10$ | Panjang & Kerapian Teks ($80.0$) |
| **S.3** | Discussion Quality | `SCORE` | `discussion` ($0\text{--}10$) | $S \times 10$ | Kepadatan Komparasi ($80.0$) |
| **S.4** | References Quality | `SCORE` | `references` ($0\text{--}10$) | $S \times 10$ | Rasio Sitasi DOI Mutakhir ($85.0$) |
| **I1.1** | Conclusion Alignment | `SCORE` | `conclusion` ($0\text{--}10$) | $S \times 10$ | Keselarasan Temuan ($80.0$) |
| **I1.2** | Limitation Openness | `CLUE` | `limitations` | Nilai $c_3$ pada CESS | Deteksi Keterbatasan Teks ($75.0$) |
| **F.1** | Future Research Gap | `CLUE` | `rekomendasi_lanjutan` | Nilai $c_4$ pada CESS | Agenda Lanjutan Heuristik ($75.0$) |
| **F.2** | Suggested Improvements| `SCREEN`| `suggested_improvements`| $((R-1)/4) \times 100$ | Usulan Reviewer ($75.0$) |
| **I2.1** | Practical Utility | `CLUE` | `implikasi_praktis` | Nilai $c_5$ pada CESS | Analisis Manfaat Praktis ($82.0$) |
| **I2.2** | Policy Transferability| `CLUE` | `relevansi_kebijakan` | Deteksi Kebijakan Publik | Analisis Relevansi ($80.0$) |

---

## BAB IV: STANDAR EVALUASI MULTI-FAKTOR SAMPLING RIGOR

Evaluasi metodologis menolak dikotomi simplistis bahwa *"sampel berukuran besar pasti bermutu dan sampel berukuran kecil pasti cacat"*. AT-RQS™ menerapkan **5 Kriteria Ketepatan Kontekstual Sampling**:

1. **Explicit Sampling Strategy:** Strategi sampling dideklarasikan secara tegas (*Total Sampling, Sensus, Purposive, Stratified Random, Cluster*).
2. **Defined Target Population:** Batasan populasi sasaran didefinisikan secara konkret (contoh: *seluruh 38 pegawai ASN pada instansi X*).
3. **Proportional Sample Justification:** Ukuran sampel memiliki rasionalitas metodologis terhadap populasi induk (misal: sensus 100% dari populasi terbatas).
4. **Appropriate Data Collection Instrument:** Instrumen pengumpulan data teruji validitas dan reliabilitasnya (misal: kuesioner skala Likert teruji Cronbach's Alpha $> 0.70$).
5. **Assumptions & Saturation Fulfilled:** Uji asumsi klasik regresi (normalitas, multikolinearitas, heteroskedastisitas) atau kejenuhan data kualitatif terpenuhi.

### Skala Penilaian Sub-Indikator Sampling Rigor ($P.3$):
* **5 Kriteria Terpenuhi Penuh:** Skor **$90.0 / 100$** *(Contoh: Total sampling 38 pegawai pada populasi terbatas dengan uji asumsi klasik lengkap)*.
* **4 Kriteria Terpenuhi:** Skor **$85.0 / 100$**.
* **3 Kriteria Terpenuhi:** Skor **$80.0 / 100$**.
* **2 Kriteria Terpenuhi:** Skor **$70.0 / 100$**.
* **Kurang dari 2 Kriteria:** Skor **$60.0 / 100$**.

---

## BAB V: MATRIKS 8 DIMENSI APASIFIC (7 QUALITY + 1 META-DIMENSION)

Struktur evaluasi membagi parameter kualitas ke dalam **7 Dimensi Kualitas Substantif Tertimbang** ($D_1 \dots D_7$) dan **1 Meta-Dimensi Penilaian Keyakinan Non-Tertimbang** ($M_1$):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   A-P-A-S-I-F-I-C FRAMEWORK MATRIX                          │
├─────┬───────────────────────────┬────────┬──────────────────────────────────┤
│ No  │ Dimensi Kualitas          │ Bobot  │ Formula Agregasi Sub-Indikator   │
├─────┼───────────────────────────┼────────┼──────────────────────────────────┤
│ D1  │ Academic Contribution     │  18%   │ 0.40(A1.1) + 0.35(A1.2) + 0.25(A1.3)│
│ D2  │ Procedural Rigor          │  18%   │ 0.50(P.1)  + 0.30(P.2)  + 0.20(P.3) │
│ D3  │ Analytical Strength       │  16%   │ 0.60(A2.1) + 0.40(A2.2)          │
│ D4  │ Scholarly Communication   │  12%   │ 0.35(S.1)  + 0.25(S.2)  + 0.20(S.3) + 0.20(S.4)│
│ D5  │ Integrity & Transparency  │  12%   │ 0.50(I1.1) + 0.50(I1.2)          │
│ D6  │ Future Research Value     │  10%   │ 0.60(F.1)  + 0.40(F.2)           │
│ D7  │ Impact & Applicability    │  14%   │ 0.50(I2.1) + 0.50(I2.2)          │
├─────┴───────────────────────────┴────────┴──────────────────────────────────┤
│ TOTAL BOBOT KUALITAS SUBSTANTIF (Σ W_i) = 100%                              │
├─────┬───────────────────────────┬────────┬──────────────────────────────────┤
│ M1  │ Confidence Assessment     │  META  │ Non-Weighted Meta-Dimension (AAC)│
└─────┴───────────────────────────┴────────┴──────────────────────────────────┘
```

### Formulasi Base Weighted Score (BWS):
$$\text{BWS} = \sum_{i=1}^{7} (D_i \times W_i)$$

Di mana:
* $D_i \in [0, 100]$ adalah nilai masing-masing dimensi kualitas ke-$i$.
* $W_i$ adalah bobot dimensi ke-$i$, dengan batasan formal $\sum_{i=1}^{7} W_i = 1.00$.

---

## BAB VI: FORMULASI MATEMATIS 5 PERSAMAAN RESMI

### 6.1 AECI™ — Evidence Consistency Index
Mengukur keselarasan vertikal struktur logika naskah dari Tujuan ↔ Metode ↔ Hasil ↔ Kesimpulan ↔ Keterbatasan:

$$\text{AECI} = 100 \times \left( \frac{N_{\text{detected}}}{5} \right) \tag{6.1}$$

**Domain:**
$$0 \le \text{AECI} \le 100, \quad N_{\text{detected}} \in \{0, 1, 2, 3, 4, 5\}$$

**Definisi Variabel:**
* $N_{\text{detected}}$ = Jumlah elemen inti struktural yang terdeteksi secara tekstual (*Rumusan Masalah/Tujuan, Desain Metodologi, Sampel/Data Empiris, Temuan Pembahasan, Keterbatasan/Bias*).
* $5$ = Jumlah elemen struktural wajib standar naskah ilmiah IMRAD.

**Tabel Distribusi:**
$$\begin{array}{rcl}
5/5 &\to& 100 \quad (\text{High Structural Alignment}) \\
4/5 &\to& 80 \quad (\text{Substantial Alignment}) \\
3/5 &\to& 60 \quad (\text{Moderate Alignment}) \\
2/5 &\to& 40 \quad (\text{Weak Alignment}) \\
1/5 &\to& 20 \quad (\text{Fragmented Structure}) \\
0/5 &\to& 0 \quad (\text{Non-Compliant})
\end{array}$$

---

### 6.2 CF — Consistency Factor (Bounded Attenuator)
Faktor pengali peredam untuk mengoreksi naskah yang memiliki inkonsistensi struktur bukti:

$$\text{CF} = 0.85 + 0.15 \times \left( \frac{\text{AECI}}{100} \right) \tag{6.2}$$

**Domain:**
$$0.85 \le \text{CF} \le 1.00 \quad (\text{Batas atenuasi maksimal } 15\%)$$

---

### 6.3 AT-RQS™ — Tri-Source Research Quality Score
Skor akhir kualitas riset yang menggabungkan Base Weighted Score dengan Bounded Consistency Factor:

$$\text{AT-RQS} = \text{BWS} \times \text{CF} \tag{6.3}$$

Di mana:
$$\text{BWS} = \sum_{i=1}^{7} D_i W_i \quad \text{dengan} \quad \sum_{i=1}^{7} W_i = 1.00$$

**Konversi Skala 10:**
$$\text{AT-RQS}_{10} = \frac{\text{AT-RQS}}{10}$$

**Domain:**
$$0 \le \text{AT-RQS} \le 100, \quad 0.00 \le \text{AT-RQS}_{10} \le 10.00$$

**Kategori Tingkat Mutu Resmi (Official Quality Categories):**
* $\text{AT-RQS} \ge 88.0$ $\rightarrow$ **EXEMPLARY RESEARCH RIGOR**
* $80.0 \le \text{AT-RQS} < 88.0$ $\rightarrow$ **STRONG RESEARCH QUALITY**
* $70.0 \le \text{AT-RQS} < 80.0$ $\rightarrow$ **GOOD RESEARCH QUALITY**
* $60.0 \le \text{AT-RQS} < 70.0$ $\rightarrow$ **SATISFACTORY WITH LIMITATIONS**
* $\text{AT-RQS} < 60.0$ $\rightarrow$ **PRELIMINARY EVIDENCE**

---

### 6.4 ARTI™ — Research Triangulation Index
Mengukur tingkat konvergensi dan kesepakatan antar 3 lapisan independen:

$$\text{ARTI} = 100 - \left[ \frac{|\text{S}_{\text{norm}} - \text{R}_{\text{norm}}| + |\text{S}_{\text{norm}} - \text{C}_{\text{norm}}|}{2} \right] \tag{6.4}$$

**Definisi Variabel:**
* $\text{S}_{\text{norm}} = \text{SCORE}_{\text{norm}} \in [0, 100]$ (Layer I - Rubrik Kualitas Terstruktur)
* $\text{R}_{\text{norm}} = \text{SCREEN}_{\text{norm}} \in [0, 100]$ (Layer II - Penyaringan Risiko & Kebaruan)
* $\text{C}_{\text{norm}} = \text{CLUE}_{\text{norm}} = \text{CESS} \in [0, 100]$ (Layer III - Skor Kekuatan Bukti Substantif)

**Domain:**
$$0 \le \text{ARTI} \le 100$$

---

### 6.5 AAC™ — Assessment Confidence
Mengukur tingkat keyakinan dan kelengkapan data dalam menghasilkan asesmen:

$$\text{AAC} = 0.50(\text{ARTI}) + 0.30(D_{\text{completeness}}) + 0.20(E_{\text{consistency}}) \tag{6.5}$$

**Domain:**
$$0 \le \text{AAC} \le 100\%$$

**Keterangan:**
* $D_{\text{completeness}}$ dan $E_{\text{consistency}}$ dihitung secara independen oleh *Deterministic Schema Validator*.

---

## BAB VII: CONTOH PERHITUNGAN END-TO-END (WORKED EXAMPLE)

Sebagai bukti verifikasi komputasi, berikut adalah simulasi perhitungan pada naskah empiris terbitan:

### Langkah 1: Normalisasi Sub-Indikator ke 7 Dimensi Mutu ($D_1 \dots D_7$)
* **$D_1$ (Academic Contribution):** $0.40(80) + 0.35(75) + 0.25(85) = 32.0 + 26.25 + 21.25 = \mathbf{79.50}$
* **$D_2$ (Procedural Rigor):** $0.50(80) + 0.30(75) + 0.20(90) = 40.0 + 22.5 + 18.0 = \mathbf{80.50}$
* **$D_3$ (Analytical Strength):** $0.60(85) + 0.40(90) = 51.0 + 36.0 = \mathbf{87.00}$
* **$D_4$ (Scholarly Communication):** $0.35(80) + 0.25(80) + 0.20(85) + 0.20(85) = 28.0 + 20.0 + 17.0 + 17.0 = \mathbf{82.00}$
* **$D_5$ (Integrity & Transparency):** $0.50(80) + 0.50(90) = 40.0 + 45.0 = \mathbf{85.00}$
* **$D_6$ (Future Research Value):** $0.60(85) + 0.40(75) = 51.0 + 30.0 = \mathbf{81.00}$
* **$D_7$ (Impact & Applicability):** $0.50(88) + 0.50(86) = 44.0 + 43.0 = \mathbf{87.00}$

### Langkah 2: Perhitungan Base Weighted Score (BWS)
$$\begin{aligned}
\text{BWS} &= (79.50 \times 0.18) + (80.50 \times 0.18) + (87.00 \times 0.16) + (82.00 \times 0.12) \\
&\quad + (85.00 \times 0.12) + (81.00 \times 0.10) + (87.00 \times 0.14) \\
&= 14.31 + 14.49 + 13.92 + 9.84 + 10.20 + 8.10 + 12.18 \\
&= \mathbf{83.04}
\end{aligned}$$

### Langkah 3: Evaluasi AECI & Consistency Factor (CF)
* $5 / 5$ Elemen Terdeteksi $\implies \text{AECI} = 100.0$
* $\text{CF} = 0.85 + 0.15 \times (100.0 / 100) = 0.85 + 0.15(1.000) = \mathbf{1.000}$

### Langkah 4: Kalkulasi Skor Akhir AT-RQS™
$$\text{AT-RQS} = 83.04 \times 1.000 = \mathbf{83.04} \implies \mathbf{83.0 / 100} \quad (\text{Skala 10: } \mathbf{8.30 / 10})$$
**Kategori Mutu:** **STRONG RESEARCH QUALITY**

---

## BAB VIII: MITIGASI BIAS & TATA KELOLA KEPERCAYAAN (AAC™ ENGINE)

Untuk mencegah *self-assessment bias* (di mana AI menilai kualitas ekstraksinya sendiri), sistem menerapkan **Rule-Based Deterministic Validation**:
1. **Pemeriksaan Kelengkapan Data ($D_{\text{completeness}}$):** Dieksekusi oleh modul kode independen (*Schema Validator*) yang memeriksa kehadiran parameter wajib tanpa melibatkan inferensi AI.
2. **Pemeriksaan Konsistensi Ekstraksi ($E_{\text{consistency}}$):** Mengukur variansi matematis antar-hasil ekstraksi dari 3 lapisan yang berbeda (*cross-layer divergence*).
3. **Pemberitahuan Etika COPE/WAME:** Setiap lembar hasil menyertakan klausul baku bahwa hasil AT-RQS adalah instrumen penilai pembantu (*decision-support tool*), bukan sertifikasi mutlak kebenaran ilmiah tanpa pertimbangan dewan redaksi.

---

## BAB IX: ARSITEKTUR IMMUTABLE SNAPSHOT & INTEGRITAS KRIPTOGRAFIS

Untuk menjamin bahwa data penilaian tidak dapat diubah secara retrospektif oleh pihak manapun, sistem mengimplementasikan **Cryptographic Provenance Ledger**:

```
[Raw Article Data] ──> [Tri-Source Execution] ──> [Canonical JSON (RFC 8785)]
                                                            │
                                                            ▼
                                                   [SHA-256 Hash Digest]
                                                            │
                                                            ▼
[Published Article] <── [Immutable DB Snapshot] <── [Timestamped Block ID]
```

1. Seluruh parameter penilaian serialisasi ke dalam **Canonical JSON (RFC 8785)**.
2. Dihitung nilai ringkasan kriptografis **SHA-256 Digest**.
3. Nilai hash dikunci bersama nomor submisi dan timestamp ISO 8601 menghasilkan `assessment_id` unik (contoh: `APS-AT-RQS-60047abe-v1.0`).
4. Setiap modifikasi retrospektif pada database akan menghasilkan *hash mismatch* seketika.

---

## BAB X: STATUS HAK KEKAYAAN INTELEKTUAL (HKI) & KLAIM PATEN

Untuk menjaga akurasi terminologi hukum kekayaan intelektual:

1. **Hak Cipta (Copyright):**
   * *Karya Tulis Ilmiah:* Spesifikasi Metodologi dan Formulasi Matematika AT-RQS™ v1.0 terdaftar pada Direktorat Jenderal Kekayaan Intelektual (DJKI) Kemenkumham RI.
   * *Program Komputer:* Source Code Engine Komputasi Tri-Source Scoring (ATRQSEngine) dilindungi hak cipta perangkat lunak.
2. **Merek Dagang (Trademark):**
   * Tanda dagang terdaftar/proses pendaftaran pada Kelas 41 (Publikasi Akademik) dan Kelas 42 (Layanan Ilmiah & Perangkat Lunak): **`AT-RQS™`**, **`AECI™`**, **`AAC™`**, **`ARTI™`**, **`IAEEA™`**, **`APASIFIC®`**.
3. **Permohonan Paten Invensi (Patent Application):**
   * Dokumen spesifikasi teknis dan klaim metode komputasi (*Computer-Implemented Scholarly Assessment Method & System*) dipersiapkan untuk pendaftaran paten invensi di DJKI RI dan penelusuran prioritas internasional (PCT/WIPO).

---

## BAB XI: PROTOKOL VALIDASI EMPIRIS & KALIBRASI DATA-DRIVEN

### 11.1 Hasil Uji Benchmark v1.0
Metodologi AT-RQS™ v1.0 telah melalui pengujian kalibrasi berbasis dataset tolak ukur resmi:
* **Registri Laporan Validasi:** `VAL-AT-RQS-2026-B01`
* **Ukuran Dataset Kalibrasi:** $N = 24$ artikel ilmiah lintas disiplin (Ekonomi & Manajemen, Hukum & Kebijakan Publik, Pendidikan, Sains Terapan).
* **Koefisien Kesepakatan Inter-Rater (Inter-Rater Agreement):** Nilai Cohen's Kappa $\kappa = 0.88$ dan Krippendorff's Alpha $\alpha = 0.89$ menunjukkan konkordansi sangat tinggi antara skor AT-RQS™ dengan evaluasi dewan editor manusia (*gold-standard review*).
* **Mean Absolute Error (MAE):** Disparitas deviasi antar-lapisan $\le 4.2$ poin pada skala 100.

### 11.2 Protokol Kalibrasi Data-Driven (Calibration Derivation Protocol)
Untuk menjaga prinsip integritas data dan menghindari pemilihan konstanta sembarangan (*arbitrary parameter selection*), setiap penetapan konstanta empiris wajib mengikuti siklus protokol kalibrasi ilmiah:

$$\text{Multi-Center Benchmark} \longrightarrow \text{Human Expert Gold-Standard (HSAS)} \longrightarrow \text{Distribution Metrics (Mean, SD, 95\% CI)} \longrightarrow \text{Data-Driven Constant}$$

1. **Penetapan Sasaran Ukur:** Menentukan indikator struktural yang hendak dikalibrasi (misal: *Human Structural Alignment Score - HSAS*).
2. **Evaluasi Gold-Standard Independen:** Penilaian naskah oleh minimal 3 penelaah sejawat manusia independen berbasis rubrik baku.
3. **Analisis Statistik Derivasi:** Menghitung nilai $\text{Mean}$, $\text{Median}$, $\text{SD}$, dan selang kepercayaan $\text{95\% CI}$.
4. **Pemberlakuan:** Nilai konstanta kalibrasi hanya dapat diadopsi ke dalam algoritma jika telah lolos uji signifikansi empiris dan terdokumentasi dalam *Validation Benchmark Report*. Sebelum adanya laporan kalibrasi empiris bertaraf multi-senter, formula AT-RQS™ v1.0 beroperasi murni secara deterministik berbasis skala teoretis penuh $[0, 100]$.

---

## BAB XII: PENGESAHAN DEWAN REDAKSI & PENUTUP

Dokumen spesifikasi metodologi ini telah disetujui, diuji, dan disahkan oleh Komite Metodologi dan Dewan Redaksi Asia Pacific Academician (ASIA) / APASIFIC:

* **Lembaga Penerbit:** Asia Pacific Academician (ASIA) / APASIFIC
* **Afiliasi Institusi:** Universitas Negeri Medan – Indonesia
* **Jaringan Kantor Regional:** Indonesia, New Zealand, Malaysia, Thailand, Pakistan, Sri Lanka
* **Clarivate Web of Science ResearcherID:** `QKY-3514-2026`
* **Elsevier Scopus Author ID:** `59675598500`
* **ORCID ID Terpadu:** `0009-0006-8416-6156`
* **Repositori & Dokumentasi Publik:** `https://www.apasific.org/docs/at-rqs`

---
*© 2026 Asia Pacific Academician (ASIA) / APASIFIC. Hak Cipta Dilindungi Undang-Undang.*
