# APASIFIC TRI-SOURCE RESEARCH QUALITY SCORE™ (AT-RQS™)
## Official Methodology & Mathematical Formulation Specification v1.0

**Dokumen Standar:** `SPEC-AT-RQS-2026-V1.0`  
**Penerbit:** APASIFIC Academic Institution / IAEP (Integrated Academic Editorial Platform)  
**Status Metodologis:** APPROVED & FROZEN BASELINE  
**Pemberlakuan:** Seluruh Artikel Naskah yang Dipublikasikan (*Published Articles*)

---

## 1. Latar Belakang & Filosofi Metodologis

Dalam lanskap publikasi ilmiah modern, penggunaan kecerdasan buatan (*Artificial Intelligence*) yang hanya sekadar memberikan satu angka mentah (*black-box single score*) sering kali memicu keraguan di kalangan akademisi, dewan guru besar, dan lembaga pengindeks internasional. Pertanyaan mendasarnya adalah: *“Dari mana angka tersebut dihitung, apa parameternya, dan bagaimana tingkat konsistensinya?”*

Untuk menjawab tantangan tersebut, APASIFIC menciptakan **APASIFIC Tri-Source Research Quality Score™ (AT-RQS™)**. 

### Prinsip Utama AT-RQS™:
1. **Bukan Sekadar "Skor AI":** AT-RQS™ adalah **metode sintesis dan triangulasi ilmiah berpemilik (*proprietary consensus methodology*)** milik APASIFIC. AI bertindak murni sebagai instrumen ekstraksi data analitis awal, sedangkan standardisasi, pembobotan, triangulasi, dan penilaian akhir dikendalikan sepenuhnya oleh algoritma baku APASIFIC.
2. **Pemisahan Kualitas vs Kepercayaan (*Quality vs. Confidence Separation*):** Kualitas substantif penelitian (**AT-RQS™**) dipisahkan secara tegas dari konsistensi bukti (**AECI™**), kesepakatan triangulasi (**ARTI™**), dan tingkat keyakinan komputasi (**AAC™**). Tidak ada *circularity* matematika di mana keyakinan ikut menaikkan/menurunkan skor kualitas secara artifisial.
3. **Akronim Institusional Baku (A-P-A-S-I-F-I-C):** Mengubah nama institusi APASIFIC menjadi **8 Dimensi Mutu Akademik** yang terukur, transparan, dan dapat diaudit selamanya (*immutable snapshot*).

---

## 2. Arsitektur Tri-Source (3 Lapisan Sumber Analisis)

Sistem AT-RQS™ mengekstraksi data secara simultan dari 3 lapisan analitik independen:

```
                  ┌──────────────────────────────────────────────┐
                  │        3 LAPISAN SUMBER ANALISIS AI          │
                  ├──────────────────────────────────────────────┤
                  │ 1. SCORE  : Structured Quality Rubrics (0-10) │
                  │ 2. SCREEN : Academic Risk, Novelty & Clarity  │
                  │ 3. CLUE   : Evidence, Findings & Limitations  │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    SCORING EVIDENCE REGISTRY & NORMALISASI   │
                  │         (Skala Terstandarisasi 0–100)        │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       8 DIMENSI A-P-A-S-I-F-I-C MATRIX       │
                  │    (7 Weighted Dimensions + 1 Meta Dimension)│
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    TRIANGULATION & CONSISTENCY VERIFICATION  │
                  │       ARTI™ Divergence + AECI™ Alignment     │
                  │        Bounded Consistency Adjustment        │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
 ════════════════════════════════════════════════════════════════════════════════
                  4 LAPISAN IDENTITAS RESMI PADA ARTIKEL
 ════════════════════════════════════════════════════════════════════════════════
   🥇 1. AT-RQS™ Score (0–100 / 0.0–10.0) : Skor Mutu Kualitas Penelitian
   🛡️ 2. AECI™ Index (0–100)              : Indeks Konsistensi & Bukti Naskah
   📊 3. ARTI™ Agreement (0–100)          : Derajat Kesepakatan Tri-Source Layer
   ◈ 4. AAC™ Confidence (%)              : Keyakinan Asesmen & Kelengkapan Data
 ════════════════════════════════════════════════════════════════════════════════
```

---

## 3. Scoring Evidence Registry (Pemetaan Indikator & Provenance)

Setiap sub-indikator memiliki sumber field yang pasti, aturan normalisasi ke skala $0 - 100$, dan *fallback rule* berbasis bukti (*evidence-based fallback*):

| Kode | Sub-Indikator | Layer Sumber | Field Input Asli | Formula Normalisasi & Scoring | Fallback Rule (Jika Sumber Kosong) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A1** | **Research Gap** | `SCORE` | `research_gap` (0–10) | $\text{Input} \times 10$ | Analisis Frasa *Gap* pada Abstrak ($80 / 65$) |
| **A2** | **Novelty Rating** | `SCREEN` | `novelty_rating` (1–5) | $\text{Input} \times 20$ | Canonical Topic Heuristic ($65$) |
| **A3** | **Topic Relevance** | `SCORE` | `topic_relevance` (0–10) | $\text{Input} \times 10$ | Scope Keyword Match ($85$) |
| **P1** | **Methodology Rubric** | `SCORE` | `methodology` (0–10) | $\text{Input} \times 10$ | Structural Method Checker ($80$) |
| **P2** | **Methodology Screening** | `SCREEN` | `methodology_rating` (1–5) | $\text{Input} \times 20$ | Section Presence Scorer ($75$) |
| **P3** | **Sampling Rigor** | `CLUE` | `sample_size`, `strategy` | Evaluasi 5 Faktor Sampling Rigor | Analisis Sampel Kontekstual ($75$) |
| **A4** | **Data & Statistics** | `SCORE` | `data_statistics` (0–10) | $\text{Input} \times 10$ | Tabel/Hasil Uji Statistik ($85$) |
| **A5** | **Model Robustness** | `CLUE` | $R^2$, $F$, $t$, $p$-val | $R^2 > 0.40$ & $p < 0.05 \rightarrow 90$; Lainnya $\rightarrow 82$ | Baseline Model Robustness ($82$) |
| **S1** | **Article Structure** | `SCORE` | `article_structure` (0–10) | $\text{Input} \times 10$ | Kelengkapan IMRAD ($80$) |
| **S2** | **Abstract Quality** | `SCORE` | `abstract` (0–10) | $\text{Input} \times 10$ | Kerapian Panjang Abstrak & Kata Kunci ($80$) |
| **S3** | **Discussion Quality** | `SCORE` | `discussion` (0–10) | $\text{Input} \times 10$ | Kepadatan Komparasi Sitasi ($80$) |
| **S4** | **References Quality** | `SCORE` | `references` (0–10) | $\text{Input} \times 10$ | Rasio Sitasi DOI Mutakhir ($85$) |
| **I1** | **Conclusion Alignment**| `SCORE` | `conclusion` (0–10) | $\text{Input} \times 10$ | Keselarasan Temuan & Kesimpulan ($80$) |
| **I2** | **Limitation Openness** | `CLUE` | `limitations` | Keterbatasan dinyatakan jujur $\rightarrow 90$; Nihil $\rightarrow 75$ | Pendeteksi Keterbatasan Teks ($75$) |
| **F1** | **Future Research Gap** | `CLUE` | `rekomendasi_lanjutan` | Ditemukan agenda riset masa depan $\rightarrow 85$; Nihil $\rightarrow 72$ | Agenda Lanjutan Heuristik ($75$) |
| **F2** | **Unanswered Questions**| `SCREEN` | `suggested_improvements`| Teridentifikasi gap lanjutan $\rightarrow 82$; Nihil $\rightarrow 72$ | Saran Perbaikan Penelaah ($75$) |
| **I3** | **Practical Utility** | `CLUE` | `implikasi_praktis` | Rekomendasi manajerial operasional $\rightarrow 88$; Nihil $\rightarrow 82$ | Analisis Manfaat Praktis ($82$) |
| **I4** | **Policy Transferability**| `CLUE` | `relevansi_kebijakan` | Relevan untuk instansi/kebijakan $\rightarrow 86$; Nihil $\rightarrow 80$ | Analisis Relevansi Kebijakan ($80$) |

---

## 4. Multi-Factor Sampling Rigor Rubric

Untuk menghindari bias simplistis seperti *"Sampel besar pasti bagus, sampel kecil pasti jelek"*, AT-RQS™ menggunakan evaluasi **5 Kriteria Ketepatan Sampling**:

1. **Sampling Strategy Stated:** Strategi sampling dideklarasikan secara eksplisit (*Total Sampling, Purposive, Stratified, Random, Sensus, Cluster*).
2. **Population Clearly Defined:** Batasan populasi sasaran didefinisikan secara tegas (misal: *seluruh pegawai BPPRD Kabupaten Barito Kuala*).
3. **Sample Size Justified:** Jumlah sampel memiliki justifikasi yang rasional dan sesuai dengan populasi induknya.
4. **Sampling Method Appropriate:** Metode pengumpulan data sesuai dengan desain studi (misal: kuesioner skala Likert teruji validitas-reliabilitas).
5. **Coverage / Saturation Adequate:** Mencapai tingkat representasi memadai atau uji asumsi klasik/kredibilitas terpenuhi.

### Skala Penilaian Sampling Rigor:
* **5 Kriteria Terpenuhi:** Skor **90** *(Contoh: Total sampling 38 pegawai dari populasi terdefinisi pada instansi BPPRD)*.
* **4 Kriteria Terpenuhi:** Skor **85**.
* **3 Kriteria Terpenuhi:** Skor **80**.
* **2 Kriteria Terpenuhi:** Skor **70**.
* **Kurang dari 2 Kriteria:** Skor **60**.

---

## 5. Matriks 8 Dimensi Mutu APASIFIC (A-P-A-S-I-F-I-C Framework)

Sistem memetakan data ke dalam 8 dimensi terstandarisasi yang terdiri dari **7 Dimensi Kualitas Tertimbang (*Weighted Quality Dimensions*)** dan **1 Meta-Dimensi Non-Tertimbang (*Non-Weighted Meta-Dimension*)**:

### A. 7 Dimensi Kualitas Tertimbang (Total Bobot = 100%)

1. **`A` — Academic Contribution (Bobot: 18%)**
   $$D_1 = 0.40(A_1) + 0.35(A_2) + 0.25(A_3)$$
   *Menilai kebaruan (novelty), justifikasi kesenjangan riset (research gap), dan kesesuaian topik.*

2. **`P` — Procedural Rigor (Bobot: 18%)**
   $$D_2 = 0.50(P_1) + 0.30(P_2) + 0.20(P_3)$$
   *Menilai kekuatan metodologi, desain penelitian, dan ketepatan strategi sampling.*

3. **`A` — Analytical Strength (Bobot: 16%)**
   $$D_3 = 0.60(A_4) + 0.40(A_5)$$
   *Menilai kualitas data, statistik empiris, dan ketahanan model regresi ($R^2$, signifikansi).*

4. **`S` — Scholarly Communication (Bobot: 12%)**
   $$D_4 = 0.35(S_1) + 0.25(S_2) + 0.20(S_3) + 0.20(S_4)$$
   *Menilai kepatuhan struktur IMRAD, kejelasan abstrak, alur diskusi, dan kualitas sitasi.*

5. **`I` — Integrity & Transparency (Bobot: 12%)**
   $$D_5 = 0.50(I_1) + 0.50(I_2)$$
   *Menilai keterbukaan dalam mendokumentasikan keterbatasan sampel, ruang lingkup, dan potensi bias.*

6. **`F` — Future Research Value (Bobot: 10%)**
   $$D_6 = 0.60(F_1) + 0.40(F_2)$$
   *Menilai kejelasan agenda riset masa depan dan peluang penelitian lanjutan.*

7. **`I` — Impact & Applicability (Bobot: 14%)**
   $$D_7 = 0.50(I_3) + 0.50(I_4)$$
   *Menilai kegunaan manajerial praktis dan potensi transferabilitas kebijakan.*

#### Perhitungan Base Weighted Score:
$$\text{Base Score} = \sum_{i=1}^{7} (D_i \times W_i)$$

---

### B. 1 Meta-Dimensi Non-Tertimbang (Non-Weighted Meta-Dimension)

8. **`C` — Confidence Assessment (Status: Meta-Dimension / Non-Weighted)**
   * **Nilai:** Merefleksikan skor **AAC™** ($0 - 100\%$).
   * **Deskripsi:** *Tri-source agreement, evidence completeness & assessment reliability*.
   * **Prinsip Metodologis:** Tidak dimasukkan sebagai pengali penambah/pengurang pada Base Score untuk menjaga integritas murni kualitas substantif naskah.

---

## 6. Formulasi Matematis 4 Metrik Resmi

### 1. 🛡️ AECI™ (APASIFIC Evidence Consistency Index)
Mengukur keselarasan vertikal alur naskah: $\text{Tujuan} \leftrightarrow \text{Metode} \leftrightarrow \text{Hasil} \leftrightarrow \text{Kesimpulan} \leftrightarrow \text{Keterbatasan}$.

$$\text{AECI} = \text{Alignment Score (A)} \times \text{Evidence Coverage Factor (ECF)}$$

* $\text{Alignment Score (A)} = 94.0$ *(Tingkat keselarasan struktural kanonikal)*.
* $\text{Evidence Coverage Factor (ECF)} \in [0.0, 1.0]$:
  $$\text{ECF} = \frac{\text{Jumlah Elemen Inti Terdeteksi (Tujuan, Metode, Sampel, Temuan, Batasan)}}{5}$$
  * $5 / 5 \text{ Elemen} \implies \text{ECF} = 1.00 \implies \text{AECI} = 94.0$
  * $4 / 5 \text{ Elemen} \implies \text{ECF} = 0.80 \implies \text{AECI} = 75.2$
  * $3 / 5 \text{ Elemen} \implies \text{ECF} = 0.60 \implies \text{AECI} = 56.4$

---

### 2. 🥇 AT-RQS™ (APASIFIC Tri-Source Research Quality Score)
Skor akhir menerapkan **Bounded Consistency Adjustment** dalam rentang aman $[0.85, 1.00]$ untuk mencegah *double punishment*:

$$\text{Consistency Factor (CF)} = 0.85 + 0.15 \times \left( \frac{\text{AECI}}{100} \right)$$
$$\text{AT-RQS} = \text{Base Score} \times \text{CF}$$

#### Skala Tampilan:
* **Skala 100:** $0.0 - 100.0$ *(Contoh: `83.6 / 100`)*.
* **Skala 10:** $0.00 - 10.00$ *(Contoh: `8.36 / 10`)*.

#### Kategori Kualitas Penelitian (*Quality Level*):
* $\text{AT-RQS} \ge 88.0$ $\rightarrow$ **EXEMPLARY RESEARCH RIGOR**
* $80.0 \le \text{AT-RQS} < 88.0$ $\rightarrow$ **STRONG RESEARCH QUALITY**
* $70.0 \le \text{AT-RQS} < 80.0$ $\rightarrow$ **GOOD RESEARCH QUALITY**
* $60.0 \le \text{AT-RQS} < 70.0$ $\rightarrow$ **SATISFACTORY WITH LIMITATIONS**
* $\text{AT-RQS} < 60.0$ $\rightarrow$ **PRELIMINARY EVIDENCE**

---

### 3. 📊 ARTI™ (APASIFIC Research Triangulation Index)
Mengukur tingkat konvergensi dan kesepakatan antara ketiga layer analisis independen:

$$\text{ARTI} = 100 - \left( \frac{|\text{SCORE}_{\text{norm}} - \text{SCREEN}_{\text{norm}}| + |\text{SCORE}_{\text{norm}} - \text{CLUE}_{\text{norm}}|}{2} \right)$$

* $\text{SCORE}_{\text{norm}} = \text{Overall Rubric Score} \times 10 \in [0, 100]$
* $\text{SCREEN}_{\text{norm}} = 0.40(\text{Novelty}\times 20) + 0.40(\text{Methodology}\times 20) + 0.20(\text{Clarity}\times 20) \in [0, 100]$
* $\text{CLUE}_{\text{norm}} = \text{Substantive Verification Score } (45 - 90)$

---

### 4. ◈ AAC™ (APASIFIC Assessment Confidence)
Mengukur tingkat kelengkapan dan keandalan data riset dalam menghasilkan asesmen:

$$\text{AAC} = 0.50(\text{ARTI}) + 0.30(D) + 0.20(E)$$

* $\text{ARTI} =$ Indeks Kesepakatan Triangulasi ($0 - 100$).
* $D =$ *Data Completeness Ratio* ($\frac{\text{Available Required Fields}}{\text{Total Required Fields}} \times 100$).
* $E =$ *Extraction Consistency Score* ($0 - 100$).

---

## 7. Penempatan pada Halaman Artikel Publik

Komponen `ApasificResearchQualityProfile.tsx` disematkan secara elegan pada setiap halaman naskah publikasi (`/article/[id]`), pada struktur tata letak kolom utama:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Header Metadata Naskah (Judul, Penulis, DOI, Tanggal)    │
├─────────────────────────────────────────────────────────────┤
│ 2. Abstrak & Kata Kunci (Abstract & Keywords)               │
├─────────────────────────────────────────────────────────────┤
│ 3. Pembaca Naskah Digital (PDF Viewer / Embed)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⭐ [POSISI RESMI]: APASIFIC RESEARCH QUALITY PROFILE™      │
│     Powered by AT-RQS™ v1.0 • Tri-Source Research Quality   │
│                                                             │
│  ┌───────────────────┬───────────────────┬───────────────┐  │
│  │ 🥇 AT-RQS™ SCORE  │ 🛡️ AECI™ EVIDENCE │ ◈ AAC™ CONF.  │  │
│  │    83.6 / 100     │     94.0 / 100    │      94%      │  │
│  │ (Strong Rigor)    │ (High Alignment)  │ (Consensus)   │  │
│  └───────────────────┴───────────────────┴───────────────┘  │
│                                                             │
│  📊 Tri-Source Layer Contribution (SCORE: 89, SCREEN: 72, CLUE: 90)
│  📊 8 APASIFIC Research Quality Dimensions Matrix           │
│     [A, P, A, S, I, F, I (Weighted) + C (Meta Non-Weighted)]│
│  🟢 Research Strengths (Kekuatan Metodologi & Model Fit)    │
│  🟡 Documented Academic Limitations (Transparansi Sampel)   │
│  🔍 Modal Transparansi: "How was this score determined?"    │
│  🔒 Ethical Governance Notice & Immutable Snapshot Stamp    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 4. ASIA INDEX RECORD (Official Scholarly Passport & Metrik) │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Prinsip Tata Kelola & Etika Akademik (Governance Disclaimer)

Sesuai standar etika penerbitan ilmiah internasional (*COPE / Committee on Publication Ethics* dan *WAME / World Association of Medical Editors*), setiap tampilan publik menyertakan penegasan tata kelola baku:

> **Official Governance Statement:**  
> *"This score is an assessment indicator, not a certification of research validity, originality, or scientific truth. Assessment methodology: AI-assisted multi-source triangulation using SCORE, SCREEN, and CLUE analytical layers under APASIFIC Tri-Source Research Quality Methodology v1.0."*

---

## 9. Skema Data & Immutable Snapshot Versioning

Setiap naskah yang dinilai menyimpan snapshot data permanen:

```typescript
interface ATRQSSnapshot {
  assessment_id: string;             // e.g. "APS-AT-RQS-3866e0a6-v1.0"
  article_id: string;                // UUID Submission
  framework_version: "v1.0";         // Snapshot Version
  algorithm_version: "AT-RQS-1.0";   // Engine Release
  timestamp: string;                 // ISO 8601 Timestamp
  at_rqs: number;                    // 0 - 100
  at_rqs_ten_scale: number;          // 0.00 - 10.00
  quality_level: QualityLevel;
  aeci: number;                      // 0 - 100
  arti: number;                      // 0 - 100
  aac: number;                       // 0 - 100%
  dimension_scores: {
    academic_contribution: number;
    procedural_rigor: number;
    analytical_strength: number;
    scholarly_communication: number;
    integrity_transparency: number;
    future_research_value: number;
    impact_applicability: number;
  };
  provenance: {
    score_layer_norm: number;
    screen_layer_norm: number;
    clue_layer_norm: number;
    base_weighted_score: number;
    consistency_factor: number;
    evidence_elements_detected: number;
    evidence_coverage_ratio: number;
  };
  primary_strength: string;
  secondary_strength: string;
  documented_limitations: string[];
  research_opportunities: string[];
  governance_disclaimer: string;
  is_fallback: boolean;
}
```

---

## 10. Ringkasan Status & Kesimpulan

Metodologi **AT-RQS™ v1.0** telah resmi diimplementasikan di:
1. **Engine Service:** [ATRQSEngine.ts](file:///d:/Users/apasific/iaep-baseline-73c1fe4/iaep-app/src/services/at-rqs/ATRQSEngine.ts)
2. **Type Contract:** [types.ts](file:///d:/Users/apasific/iaep-baseline-73c1fe4/iaep-app/src/services/at-rqs/types.ts)
3. **Unit Test Suite:** [atrqs_engine.test.ts](file:///d:/Users/apasific/iaep-baseline-73c1fe4/iaep-app/src/services/at-rqs/__tests__/atrqs_engine.test.ts)
4. **Visual Component:** [ApasificResearchQualityProfile.tsx](file:///d:/Users/apasific/iaep-baseline-73c1fe4/iaep-app/src/components/article/ApasificResearchQualityProfile.tsx)
5. **Article Integration:** [ArticlePaywallClient.tsx](file:///d:/Users/apasific/iaep-baseline-73c1fe4/iaep-app/src/components/article/ArticlePaywallClient.tsx#L552-L557)

Dokumen ini menjadi rujukan baku institusional untuk seluruh evaluasi kualitas naskah publikasi di ekosistem APASIFIC Academic.
