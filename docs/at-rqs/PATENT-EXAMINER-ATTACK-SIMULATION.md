# AT-RQS™ v1.0 PATENT EXAMINER ATTACK SIMULATION
## Rigorous Substantive Examination Defense, Inventive Step Analysis & Mosaicing Rebuttals

**Dokumen Analisis:** `SIM-EXAM-AT-RQS-2026-V1.0`  
**Yurisdiksi Acuan:** DJKI Kemenkumham RI (UU No. 65/2024 jo. UU No. 13/2016) & Traktat Kerja Sama Paten (PCT Articles 33(2) & 33(3))  
**Target Dokumen:** 20 Klaim Paten AT-RQS™ v1.0 (Berdasarkan `PAT-CHART-AT-RQS-2026-V1.0`)  
**Tujuan:** Menguji ketahanan hukum klaim terhadap penolakan substantif (*Office Actions*), merekayasa skenario serangan pemeriksa (*Examiner's Rejections*), dan merumuskan sanggahan hukum-teknis (*Technical Rebuttals*) sebelum filing resmi.

---

## 1. STRUKTUR PROTOKOL SIMULASI PEMERIKSAAN

Simulasi ini membedah 5 skenario serangan fatal yang paling mungkin diajukan oleh Pemeriksa Paten (*Patent Examiner*):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      5 SKENARIO SERANGAN PEMERIKSA PATEN                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Serangan Art. 4 / Subject Matter  : "Hanya Metode Matematika / Aturan"   │
│ 2. Serangan Mosaicing D1 + D2        : "Penggabungan Wajar WO'780 + US'973" │
│ 3. Serangan Mosaicing D1 + D3 + D6   : "Ekstraksi US'311 + Triple Check D6" │
│ 4. Serangan Support & Enablement     : "Definisi AAC, D, & E Tidak Jelas"   │
│ 5. Serangan Obviousness D4 + D5      : "Vektor CN'914 + Komparatif WO'754"  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. SKENARIO SERANGAN 1: SUBJEK BUKAN INVENSI (PASAL 4 UU PATEN)

### 🔴 Surat Penolakan Pemeriksa (Examiner's Office Action):
> *"Klaim 1–3 ditolak berdasarkan Pasal 4 ayat (1) huruf b dan f UU No. 13/2016 jo. UU No. 65/2024. Invensi yang dimohonkan pada dasarnya adalah **metode matematika dan aturan/metode untuk melakukan kegiatan mental** (evaluasi kualitas karya tulis ilmiah), di mana perangkat keras komputer hanya digunakan sebagai sarana kalkulasi umum tanpa adanya efek teknis yang menyelesaikan masalah teknologi komputer."*

### 🟢 Sanggahan & Argumentasi Hukum-Teknis (Applicant's Rebuttal):
1. **Karakter Teknis Konkret (Technical Character):**  
   Invensi tidak mematenkan penilaian mental naskah, melainkan **arsitektur pemrosesan aliran data bukti heterogen (*heterogeneous data stream pipeline*)**. Masalah teknis yang diselesaikan adalah *ketidakmampuan sistem komputasi mengagregasikan parameter diskret, ordinal, dan teks bebas tanpa mengalami distorsi skala dan bias halusinasi model*.
2. **Kesesuaian dengan Penjelasan Pasal 4 UU No. 65 Tahun 2024:**  
   UU No. 65/2024 secara tegas menyatakan bahwa program komputer yang mengimplementasikan penyelesaian masalah teknis menggunakan sistem terprogram dengan interaksi antar-modul fungsional spesifik memenuhi syarat patentabilitas (*CII Eligibility*).
3. **Efek Teknis Baru (*Technical Effect*):**  
   Interaksi antara modul penerima dokumen, tiga modul ekstraksi independen, engine normalisasi deterministik, validator skema independen, dan modul serialisasi kanonikal RFC 8785 menghasilkan **rekaman data asesmen yang dapat diverifikasi integritas kriptografisnya (*tamper-evident verifiable data object*)**, suatu efek teknis yang mustahil dilakukan oleh kegiatan mental manusia.

---

## 3. SKENARIO SERANGAN 2: MOSAICING D1 (WO'780) + D2 (US'973)

### 🔴 Surat Penolakan Pemeriksa (Examiner's Office Action):
> *"Klaim 1 tidak memiliki Langkah Inventif (Inventive Step / Obviousness) berdasarkan kombinasi D1 (`WO2020257780A1`) dan D2 (`US20220107973A1`).  
> - D1 telah mengungkapkan sistem komputer untuk mengevaluasi riset, mengekstraksi deskriptor riset, membandingkan terhadap standar, dan menghitung skor kualitas riset.  
> - D2 telah mengungkapkan evaluasi artikel ilmiah menggunakan AI yang menggabungkan berbagai sinyal dan memberikan bobot terhadap sinyal-sinyal tersebut.  
> Seorang ahli di bidangnya (*Person Skilled in the Art / PSITA*) yang menghadapi kebutuhan menilai naskah ilmiah secara otomatis akan dengan mudah menggabungkan sistem penilaian D1 dengan teknik AI pembobotan multisinjal D2 tanpa memerlukan kemampuan inventif."*

### 🟢 Sanggahan & Argumentasi Hukum-Teknis (Applicant's Rebuttal):
1. **Ketiadaan Rekayasa Sinergis pada Prior-Art (*Lack of Teaching/Motivation to Combine*):**  
   - D1 mengandalkan perbandingan terhadap pangkalan data deskriptor klinis eksternal (*database lookup*), bukan ekstraksi multi-lapisan independen dari naskah itu sendiri.
   - D2 mengandalkan anotasi kolaboratif pengguna (*crowdsourced annotations*) yang bersifat subjektif dan stokastik.
   - Tidak ada petunjuk (*teaching, suggestion, or motivation*) dalam D1 maupun D2 untuk membangun **tiga kanal analitik independen (SCORE 0–10, SCREEN 1–5, CLUE faktual)** yang kemudian disintesis secara deterministik.
2. **Efek Teknis Tak Terduga dari Bounded Attenuation Engine ($\text{CF} \in [0.85, 1.00]$):**  
   Penggabungan D1 + D2 hanya akan menghasilkan penjumlahan terbobot linier sederhana (*simple linear weighted sum*). Sebaliknya, invensi AT-RQS™ memperkenalkan **mekanisme umpan-maju peredam terikat (*bounded feedforward attenuator*)**:
   $$\text{AECI} = 100 \times \left(\frac{N_{\text{detected}}}{5}\right) \quad \longrightarrow \quad \text{CF} = 0.85 + 0.15 \times \left(\frac{\text{AECI}}{100}\right) \quad \longrightarrow \quad \text{AT-RQS} = \text{BWS} \times \text{CF}$$
   Mekanisme ini secara teknis mengoreksi naskah yang kehilangan pilar struktural tanpa menjatuhkan penalti ganda linier. Interaksi fungsional non-linier ini tidak diajarkan oleh D1 maupun D2.

---

## 4. SKENARIO SERANGAN 3: MOSAICING D1 (WO'780) + D3 (US'311) + D6 (US'810)

### 🔴 Surat Penolakan Pemeriksa (Examiner's Office Action):
> *"Kombinasi D1 (penilaian kualitas riset), D3 (`US12118311B1` - ekstraksi bukti empiris seperti statistik dan sampel untuk replikasi riset), dan D6 (`US11275810B2` - metode triple checking menggunakan tiga sumber untuk menghitung akurasi dan keyakinan) membuat arsitektur Tri-Source dan penghitungan keyakinan (AAC) menjadi jelas (obvious aggregation)."*

### 🟢 Sanggahan & Argumentasi Hukum-Teknis (Applicant's Rebuttal):
1. **Pemisahan Mutlak Non-Sirkular (*Non-Circular Quality vs. Confidence Separation*):**  
   Dalam D6, skor keyakinan (*confidence score*) digunakan untuk secara langsung memodifikasi dan memvalidasi kebenaran data (*confidence alters the primary outcome*).  
   Dalam invensi AT-RQS™, **alur data kualitas substantif ($\text{AT-RQS}$) dan keyakinan komputasi ($\text{AAC}$) dipisahkan secara topologis dan deterministik**:
   $$\text{AAC} = 0.50(\text{ARTI}) + 0.30(D_{\text{completeness}}) + 0.20(E_{\text{consistency}})$$
   $\text{AAC}$ **tidak pernah dimasukkan ke dalam persamaan $\text{AT-RQS}$**, sehingga mencegah cacat sirkularitas di mana ekstraksi AI yang salah namun berkeyakinan tinggi menggelembungkan skor mutu naskah. D6 mengajarkan hal yang sebaliknya.
2. **Isolasi Validator Skema Deterministik (Anti-Self-Assessment Bias):**  
   D3 mengandalkan model NLP internal untuk memprediksi replikabilitas. AT-RQS™ menerapkan **modul validator skema independen berbasis aturan statis** yang menguji kelengkapan skema ($D$) dan divergensi ekstraksi lintas-lapisan ($E$) di luar model AI, menghasilkan jaminan auditabilitas yang tidak diungkapkan oleh D1, D3, maupun D6.

---

## 5. SKENARIO SERANGAN 4: KEJELASAN & DUKUNGAN SPESIFIKASI (ENABLEMENT & SUPPORT)

### 🔴 Surat Penolakan Pemeriksa (Examiner's Office Action):
> *"Klaim 1, 13, dan 14 tidak memenuhi syarat kejelasan dan kecukupan pengungkapan (Clarity & Enablement).  
> 1. Parameter $D_{\text{completeness}}$ dan $E_{\text{consistency}}$ pada klaim AAC tidak diuraikan formulasinya secara matematis dalam spesifikasi.  
> 2. Formula $\text{ARTI}$ pada dokumen memiliki operator ambigu.  
> 3. Istilah 'Public Scholarly Passport' pada Klaim 20 tidak memiliki dukungan deskripsi yang memadai."*

### 🟢 Solusi Penyempurnaan Spesifikasi & Bukti Formal (Specification Rectification):
Untuk menjamin seluruh klaim memiliki dukungan penuh (*full support & enablement*), spesifikasi resmi telah disempurnakan dengan formula deterministik tertutup:

#### 1. Definisi Matematis Tertutup $D_{\text{completeness}}$:
$$D_{\text{completeness}} = \left( \frac{\sum_{j=1}^{M} \mathbb{I}(F_j \neq \emptyset)}{M} \right) \times 100 \tag{6.5a}$$
Di mana $M = 8$ himpunan parameter wajib skema:
$$F = \{\text{Judul}, \text{Abstrak}, \text{DOI}, \text{SCORE}_{\text{rubrics}}, \text{SCREEN}_{\text{ratings}}, \text{CLUE}_{\text{objective}}, \text{CLUE}_{\text{methodology}}, \text{CLUE}_{\text{findings}}\}$$
dan $\mathbb{I}(F_j \neq \emptyset) \in \{0, 1\}$ adalah fungsi indikator biner kehadiran nilai non-null.

#### 2. Definisi Matematis Tertutup $E_{\text{consistency}}$:
$$E_{\text{consistency}} = 100 - \left( \frac{|S_{\text{norm}} - R_{\text{norm}}| + |S_{\text{norm}} - C_{\text{norm}}| + |R_{\text{norm}} - C_{\text{norm}}|}{3} \right) \tag{6.5b}$$
Mengukur rata-rata deviasi berpasangan lintas tiga kanal analitik terstandarisasi.

#### 3. Penegasan Formula $\text{ARTI}$ Bebas Ambigu:
$$\text{ARTI} = 100 - \left[ \frac{|S_{\text{norm}} - R_{\text{norm}}| + |S_{\text{norm}} - C_{\text{norm}}|}{2} \right] \tag{6.4}$$
Dengan operator pengurangan eksplisit antar-skala normalisasi.

#### 4. Penyelarasan Klaim 20 dengan Deskripsi Spesifikasi:
Klaim 20 diselaraskan dengan terminologi resmi yang didukung pada Bab VII spesifikasi: **"Kartu Rekaman Indeks Publikasi Digital (*ASIA Index Record / Digital Article Quality Passport*)"**.

---

## 6. SKENARIO SERANGAN 5: MOSAICING D4 (WO'754) + D5 (CN'914)

### 🔴 Surat Penolakan Pemeriksa (Examiner's Office Action):
> *"D4 (`WO2026072754A1`) telah mengajarkan skor kualitas dokumen intrinsik dan komparatif, sedangkan D5 (`CN120337914A/B`) mengajarkan representasi vektor multidimensi untuk asesmen naskah akademik. Kombinasi D4 dan D5 mengantisipasi sistem penilaian multidimensi otomatis."*

### 🟢 Sanggahan & Argumentasi Hukum-Teknis (Applicant's Rebuttal):
1. **Perbedaan Paradigma Komputasi (Deterministic Pipeline vs. Black-Box Embeddings):**  
   - D5 beroperasi pada ruang laten vektor semantik (*dense vector embeddings*) melalui jaringan saraf tiruan (*deep neural network*) yang bersifat non-deterministik dan *black-box*.
   - D4 beroperasi melalui perbandingan pasangan dokumen dinamis (*pairwise document comparison*).
   - Invensi AT-RQS™ secara fundamental berbeda: mengekstraksi fakta terstruktur ke dalam **Matriks 7 Dimensi Kualitas Baku dengan bobot terkalibrasi tetap ($\sum W_i = 1.00$)** yang digabungkan secara deterministik dengan faktor redaman struktural ($\text{CF}$).
2. **Keterikatan dengan Cryptographic Provenance Ledger:**  
   Tidak ada satupun dari D4 maupun D5 yang mengaitkan eksekusi evaluasi dokumen dengan **pembangkitan representasi kanonikal (RFC 8785) dan ringkasan SHA-256 terstempel waktu**. Sinergi antara evaluasi deterministik dan pencatatan kriptografis menghasilkan integritas data yang dapat diaudit secara independen oleh pihak ketiga.

---

## 7. KESIMPULAN & MATRIX KETAHANAN KLAIM (PATENT DEFENSE READINESS)

| No. Klaim | Fitur Pokok | Tingkat Kerentanan Awal | Pertahanan Utama / Fallback Position | Status Pasca-Simulasi |
| :---: | :--- | :---: | :--- | :---: |
| **Klaim 1** | Sistem CII Tri-Source + Bounded CF + Provenance | 🟡 Sedang | Tekankan efek teknis integrasi pipeline multi-sumber deterministik vs black-box | 🟢 **DEFENSIBLE** |
| **Klaim 2** | Metode Komputasi Alur $(a)$–$(h)$ | 🟡 Sedang | Buktikan interaksi langkah non-sirkular dan redaman struktural | 🟢 **DEFENSIBLE** |
| **Klaim 3** | Media Terbaca Komputer | 🟢 Rendah | Mengikuti status kelolosan Klaim 2 | 🟢 **DEFENSIBLE** |
| **Klaim 4–6** | Spesifikasi SCORE, SCREEN, CLUE (CESS) | 🟢 Rendah | Fallback kuat membatasi ruang lingkup ekstraksi analitik | 🟢 **VERY STRONG** |
| **Klaim 7–9** | Matriks 7 Dimensi Bobot 100% & Normalisasi | 🟡 Sedang | Kombinasi spesifik matriks terbobot + isolasi meta-dimensi | 🟢 **DEFENSIBLE** |
| **Klaim 10–12**| 5 Bukti Wajib $\text{AECI}$ & Bounded $\text{CF} \in [0.85, 1.00]$ | 🟢 Sangat Rendah | Inti invensi: mekanisme umpan-maju redaman struktural non-linier | 🟢 **STRONGEST CORE** |
| **Klaim 13** | Formula Eksplisit $\text{ARTI}$ | 🟢 Rendah | Formula divergensi absolut 3 kanal | 🟢 **DEFENSIBLE** |
| **Klaim 14–16**| Formula $\text{AAC}$, $D_{\text{completeness}}$ & $E_{\text{consistency}}$ | 🟡 Sedang | Didukung formula tertutup (6.5a) dan (6.5b) | 🟢 **DEFENSIBLE** |
| **Klaim 17–19**| Kriptografi RFC 8785, SHA-256, & Immutable Snapshot | 🟢 Rendah | Penguncian hash snapshot asesmen permanen | 🟢 **STRONG FALLBACK** |
| **Klaim 20** | ASIA Index Record / Digital Quality Passport | 🟢 Rendah | Penyelarasan visual kartu identitas publik | 🟢 **DEFENSIBLE** |

### 🏁 Rekomendasi Tindakan:
1. Menyelaraskan formula tertutup $D_{\text{completeness}}$ (6.5a) dan $E_{\text{consistency}}$ (6.5b) ke dalam Dokumen Spesifikasi Metodologi Markdown dan PDF.
2. Mempersiapkan berkas deskripsi lengkap dan 9 Lembar Gambar Teknik (*FIG. 1 s/d FIG. 9*) sebelum pendaftaran resmi ke DJKI pada September 2026.
