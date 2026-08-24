# DRAF SPESIFIKASI PERMOHONAN PATEN INVENSI (DJKI KEMENKUMHAM RI)
## SISTEM DAN METODE TERKOMPUTERISASI UNTUK PEMROSESAN BUKTI DOKUMEN ILMIAH MULTI-SUMBER DETERMINISTIK DENGAN REDAMAN KONSISTENSI STRUKTURAL DAN PENGUNCIAN ASAL-USUL KRIPTOGRAFIS

**Klasifikasi Paten Internasional (IPC):** `G06F 40/20`, `G06N 3/00`, `G06F 16/30`, `G06F 21/64`  
**Status Naskah:** DRAF SPESIFIKASI PATEN FORMAL TAHAP 1 (FROZEN BASELINE v1.0)  
**Pemohon:** Asia Pacific Academician (ASIA) / APASIFIC Academic Division  
**Inventor:** Tim Pengembang Metodologi & Arsitektur Sistem ASIA

---

## 1. JUDUL INVENSI
**SISTEM DAN METODE TERKOMPUTERISASI UNTUK PEMROSESAN BUKTI DOKUMEN ILMIAH MULTI-SUMBER DETERMINISTIK DENGAN REDAMAN KONSISTENSI STRUKTURAL DAN PENGUNCIAN ASAL-USUL KRIPTOGRAFIS**

---

## 2. BIDANG TEKNIK INVENSI
Invensi ini secara umum berkaitan dengan bidang pemrosesan dokumen digital dan sistem kecerdasan buatan (*natural language processing & information extraction*), dan secara lebih khusus berkaitan dengan sistem dan metode yang diimplementasikan oleh komputer (*Computer-Implemented Invention / CII*) untuk memproses aliran data bukti terstruktur dari naskah penelitian ilmiah melalui sintesis tiga kanal analitik independen, menerapkan koreksi redaman konsistensi struktural terikat (*bounded structural feedforward attenuation*), memisahkan kalkulasi mutu substantif dari indeks keyakinan secara non-sirkular, serta membangkitkan rekaman bukti asal-usul yang terkunci secara kriptografis (*tamper-evident cryptographic provenance ledger*).

---

## 3. LATAR BELAKANG INVENSI & KELEMAHAN PRIOR ART

Evaluasi kualitas naskah ilmiah digital merupakan salah satu pilar utama dalam ekosistem publikasi akademik, penjaminan mutu penelitian perguruan tinggi, dan akreditasi internasional. Perkembangan teknologi kecerdasan buatan (*Artificial Intelligence / AI*) dan model bahasa besar (*Large Language Models / LLM*) telah memicu munculnya berbagai instrumen evaluasi dokumen otomatis. Namun demikian, sistem-sistem konvensional dalam seni terdahulu (*prior art*) memiliki sejumlah kelemahan teknis yang mendasar:

1. **Kelemahan Pencocokan Statis Linear (Sebagaimana diungkapkan dalam `WO2020257780A1`):**  
   Sistem terdahulu mengandalkan pencocokan deskriptor teks terhadap basis data standar klinis/produk eksternal. Pendekatan ini tidak mampu mengekstraksi struktur metodologi internal naskah yang kompleks, rentan terhadap ketiadaan data pembanding eksternal, dan mengabaikan interaksi fungsional antara tujuan, metodologi, dan temuan empiris.
2. **Kelemahan Penjumlahan Sinyal Linier Subjektif (Sebagaimana diungkapkan dalam `US20220107973A1`):**  
   Sistem evaluasi artikel ilmiah kolaboratif menggabungkan anotasi pengguna (*crowdsourced signals*) dengan prediksi AI menggunakan pembobotan linier sederhana. Hal ini memicu ketidakstabilan stokastik dan kegagalan mendeteksi cacat struktural fatal; sebuah naskah yang memiliki teks narasi panjang namun tanpa data empiris tetap dapat memperoleh skor tinggi (*false high score rate*).
3. **Kelemahan Prediksi Replikabilitas Parsial (Sebagaimana diungkapkan dalam `US12118311B1`):**  
   Sistem terdahulu hanya berfokus pada ekstraksi parameter statistik untuk memprediksi probabilitas replikasi, namun tidak menyediakan kerangka kerja pembobotan multidimensi terpadu dan tidak mengintegrasikan mekanisme verifikasi divergensi lintas-lapisan analitik.
4. **Kelemahan Penilaian Komparatif Berpasangan (Sebagaimana diungkapkan dalam `WO2026072754A1`):**  
   Sistem komparasi pasangan dinamis memerlukan korpus dokumen pembanding dalam jumlah besar dan rentan terhadap ketidakseimbangan domain data (*data sparsity & domain bias*).
5. **Kelemahan Bias Sirkularitas Evaluasi Diri (Sebagaimana diungkapkan dalam `US11275810B2`):**  
   Pada arsitektur *triple checking* konvensional, skor keyakinan (*confidence score*) digunakan untuk secara langsung memodifikasi atau memperkuat skor kebenaran data. Dalam model AI generatif, hal ini memicu fenomena *hallucinatory confidence inflation*, di mana model memberikan tingkat keyakinan tinggi atas ekstraksinya yang keliru dan secara artifisial menaikkan skor kualitas naskah.
6. **Kelemahan Integritas Pasca-Asesmen:**  
   Sistem terdahulu menyimpan hasil evaluasi ke dalam basis data relasional standar tanpa perlindungan integritas kriptografis, sehingga rentan terhadap manipulasi retrospektif oleh pihak internal maupun eksternal.

Oleh karena itu, diperlukan suatu sistem dan metode terkomputerisasi baru yang memecahkan masalah-masalah teknis tersebut melalui arsitektur multi-sumber deterministik, koreksi redaman struktural terikat, pemisahan keyakinan non-sirkular, dan penguncian asal-usul kriptografis permanen.

---

## 4. RINGKASAN INVENSI

Invensi ini menyediakan sistem dan metode terkomputerisasi yang menyelesaikan permasalahan teknis di atas melalui integrasi fungsional dari tiga lapisan arsitektur utama:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TIGA LAPISAN ARSITEKTUR UTAMA                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. LAPISAN PROVENANCE / INPUT  : 3 Kanal Ekstraksi Independen              │
│    (SCORE diskret 0–10, SCREEN ordinal 1–5, CLUE faktual kuantitatif)       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. LAPISAN PROCESSING DETERMINISTIK :                                       │
│    • Normalisasi Skala Terpadu [0, 100]                                     │
│    • Pembobotan Matriks 7 Dimensi Kualitas Baku (BWS, Σ Wi = 1.00)          │
│    • Deteksi 5 Pilar Bukti Struktural (AECI) & Bounded Attenuation (CF)     │
│    • Triangulasi Divergensi Tiga Kanal (ARTI)                               │
│    • Isolasi Keyakinan Non-Sirkular (AAC) via Validator Skema Terpisah     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. LAPISAN INTEGRITAS / OUTPUT :                                            │
│    • Serialisasi Kanonikal RFC 8785 ──> SHA-256 Digest ──> Block ID         │
│    • Digital Article Quality Record / ASIA Index Record                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

Secara khusus, invensi ini memiliki fitur-fitur teknis utama yang bekerja secara sinergis:
* **Ekstraksi Tri-Source Multi-Skala:** Mengekstraksi secara independen parameter rubrik struktural diskret $[0, 10]$, parameter penapisan risiko ordinal $[1, 5]$, dan bukti substantif kuantitatif/keterbatasan (*CLUE Evidence Strength Score / CESS*).
* **Mekanisme Umpan-Maju Redaman Terikat (*Bounded Structural Feedforward Attenuator*):** Mendeteksi kelengkapan 5 elemen struktural naskah ($\text{AECI} = 100 \times (N_{\text{detected}}/5)$) yang mengendalikan faktor pengali redaman $\text{CF} = 0.85 + 0.15 \times (\text{AECI}/100)$ dalam batas terkendali $[0.85, 1.00]$ terhadap Base Weighted Score ($\text{BWS}$), sehingga skor mutu akhir $\text{AT-RQS} = \text{BWS} \times \text{CF}$ secara otomatis teredam proporsional saat bukti metodologi hilang tanpa menjatuhkan penalti ganda linier.
* **Pemisahan Topologis Mutu vs Keyakinan Non-Sirkular:** Indeks keyakinan asesmen $\text{AAC} = 0.50(\text{ARTI}) + 0.30(D_{\text{completeness}}) + 0.20(E_{\text{consistency}})$ dihitung pada jalur data independen dan tidak pernah menjadi pengali skor mutu, di mana $D_{\text{completeness}}$ dan $E_{\text{consistency}}$ dievaluasi oleh *Deterministic Schema Validator* terpisah berbasis aturan kode statis.
* **Pembangkitan Bukti Asal-Usul Kriptografis Permanen:** Serialisasi seluruh parameter penilaian ke dalam representasi Canonical JSON (RFC 8785), pembangkitan ringkasan hash SHA-256 terstempel waktu, dan pencatatan snapshot immutable yang terintegrasi pada kartu rekaman indeks publikasi digital.

---

## 5. URAIAN SINGKAT GAMBAR-GAMBAR TEKNIK (FIG. 1 s/d FIG. 9)

Invensi ini diilustrasikan melalui 9 lembar gambar teknik fungsional:

* **FIG. 1** adalah diagram blok arsitektur sistem terkomputerisasi pemrosesan bukti dokumen ilmiah secara keseluruhan sesuai perwujudan invensi ini.
* **FIG. 2** adalah diagram alir skematis yang mengilustrasikan modul ekstraksi analitis tiga kanal independen (Lapisan SCORE, SCREEN, dan CLUE).
* **FIG. 3** adalah diagram skematis pipeline normalisasi skala deterministik dari domain heterogen ke domain komputasi terpadu $[0, 100]$.
* **FIG. 4** adalah diagram alokasi dan pembobotan Matriks 7 Dimensi Kualitas Substantif Baku ($\text{BWS}, \sum W_i = 1.00$).
* **FIG. 5** adalah diagram logika fungsional modul pendeteksi 5 bukti struktural ($\text{AECI}$) dan engine atenuasi terikat non-linier ($\text{CF}$).
* **FIG. 6** adalah diagram topologi pemisahan jalur data non-sirkular antara skor kualitas substantif dan indeks keyakinan asesmen ($\text{ARTI}$ & $\text{AAC}$).
* **FIG. 7** adalah diagram alir modul validator skema deterministik independen untuk evaluasi parameter $D_{\text{completeness}}$ dan $E_{\text{consistency}}$.
* **FIG. 8** adalah diagram alir proses serialisasi Canonical JSON (RFC 8785), pembangkitan ringkasan hash SHA-256, dan pencatatan ledger asal-usul permanen.
* **FIG. 9** adalah diagram alir eksekusi komputasi menyeluruh (*end-to-end processing pipeline*) dari penerimaan naskah digital hingga penyematan kartu identitas publik digital.

---

## 6. URAIAN LENGKAP INVENSI DAN FORMULASI DETERMINISTIK

### 6.1 Pipeline Normalisasi Skala Deterministik
Sistem menerima masukan analitik yang berasal dari tiga kanal penilaian independen, yaitu SCORE, SCREEN, dan CLUE. Karena ketiga kanal tersebut menggunakan rentang nilai awal yang berbeda, masing-masing nilai terlebih dahulu ditransformasikan secara deterministik ke dalam domain komputasi terpadu $[0, 100]$.

#### 6.1.1 Normalisasi SCORE
Nilai SCORE memiliki rentang masukan dari 0 sampai 10. Nilai tersebut dinormalisasi menjadi $\text{SCORE}_{\text{norm}}$ dengan persamaan:
$$\text{SCORE}_{\text{norm}} = \left( \frac{S}{10} \right) \times 100$$
dengan:
* $S$ = nilai SCORE asli ($0 \le S \le 10$);
* $S_{\text{norm}}$ = nilai SCORE setelah normalisasi ($0 \le S_{\text{norm}} \le 100$).

Dengan demikian, nilai SCORE sebesar 0 menghasilkan nilai normalisasi 0, sedangkan nilai SCORE sebesar 10 menghasilkan nilai normalisasi 100.

#### 6.1.2 Normalisasi SCREEN
Nilai SCREEN memiliki rentang ordinal 1 sampai 5. Karena nilai minimum bukan nol, normalisasi dilakukan dengan menggeser titik awal sebesar 1 dan membagi dengan rentang efektif sebesar 4:
$$\text{SCREEN}_{\text{norm}} = \left( \frac{R - 1}{4} \right) \times 100$$
dengan:
* $R$ = nilai SCREEN asli ($1 \le R \le 5$);
* $R_{\text{norm}}$ = nilai SCREEN setelah normalisasi ($0 \le R_{\text{norm}} \le 100$).

Dengan persamaan tersebut: $R = 1 \implies R_{\text{norm}} = 0$, dan $R = 5 \implies R_{\text{norm}} = 100$. Transformasi ini mempertahankan urutan ordinal SCREEN sekaligus menyelaraskannya dengan domain komputasi $[0, 100]$.

#### 6.1.3 Pembentukan CLUE / CESS
Kanal CLUE menghasilkan pasangan nilai bobot dan nilai bukti faktual. Kontribusi setiap elemen CLUE dihitung sebagai:
$$\text{CESS}_k = w_k \times c_k$$
dengan:
* $w_k$ = bobot elemen bukti ke-$k$;
* $c_k$ = nilai atau kekuatan bukti faktual elemen ke-$k$;
* $\text{CESS}_k$ = kontribusi elemen ke-$k$.

Apabila terdapat beberapa elemen CLUE, kontribusi tersebut diakumulasikan sesuai struktur skema yang ditetapkan, sehingga menghasilkan nilai $\text{CESS}$ yang digunakan sebagai representasi kanal CLUE dalam domain komputasi terpadu:
$$C_{\text{norm}} = \text{CESS}$$
dengan nilai $C_{\text{norm}}$ berada pada domain komputasi yang ditetapkan oleh skema CLUE ($0 \le C_{\text{norm}} \le 100$).

### 6.2 Matriks 7 Dimensi Kualitas Substantif Baku
Setelah normalisasi, sistem membentuk Base Weighted Score ($\text{BWS}$) berdasarkan tujuh dimensi kualitas substantif:
$$\text{BWS} = \sum_{i=1}^{7} D_i W_i$$
dengan:
* $D_i$ = nilai dimensi kualitas ke-$i$;
* $W_i$ = bobot dimensi kualitas ke-$i$;
* $i$ = indeks dimensi, dengan $i = 1, \dots, 7$.

Vektor bobot yang digunakan adalah:
$$\mathbf{W} = [0.18, 0.18, 0.16, 0.12, 0.12, 0.10, 0.14], \quad \sum_{i=1}^{7} W_i = 1.00$$
Secara eksplisit:
$$\text{BWS} = 0.18 D_1 + 0.18 D_2 + 0.16 D_3 + 0.12 D_4 + 0.12 D_5 + 0.10 D_6 + 0.14 D_7$$
Dengan demikian, $\text{BWS}$ merupakan skor kualitas substantif dasar sebelum faktor redaman struktural diterapkan.

### 6.3 Deteksi Lima Bukti Struktural dan AECI
Sistem selanjutnya mendeteksi keberadaan lima elemen struktural wajib dalam materi yang dianalisis, yaitu: (1) Tujuan, (2) Metode, (3) Sampel, (4) Temuan, dan (5) Batasan. Jumlah elemen yang berhasil dideteksi dinyatakan sebagai $N_{\text{detected}} \in \{0, 1, 2, 3, 4, 5\}$.

Indeks kelengkapan bukti struktural atau $\text{AECI}$ (Assessment Evidence Completeness Index) dihitung:
$$\text{AECI} = 100 \times \left( \frac{N_{\text{detected}}}{5} \right)$$
Rentang nilai: $0 \le \text{AECI} \le 100$. Setiap tambahan satu elemen struktural yang terdeteksi meningkatkan $\text{AECI}$ sebesar 20 poin.

### 6.4 Bounded Attenuation Factor (CF)
Nilai $\text{AECI}$ selanjutnya digunakan untuk menentukan Bounded Attenuation Factor ($\text{CF}$):
$$\text{CF} = 0.85 + 0.15 \times \left( \frac{\text{AECI}}{100} \right)$$
Karena $0 \le \text{AECI} \le 100$, maka $0.85 \le \text{CF} \le 1.00$. Batas bawah dan atas tersebut bersifat tertutup.
* Pada kondisi tanpa bukti struktural ($N_{\text{detected}} = 0 \implies \text{AECI} = 0$), diperoleh $\text{CF} = 0.850$.
* Pada kondisi seluruh lima bukti struktural terdeteksi ($N_{\text{detected}} = 5 \implies \text{AECI} = 100$), diperoleh $\text{CF} = 1.000$.

Dengan demikian, faktor redaman tidak pernah turun di bawah 0.85 dan tidak pernah melebihi 1.00.

### 6.5 Pembentukan AT-RQS
Skor kualitas substantif akhir diperoleh dengan mengalikan $\text{BWS}$ dengan $\text{CF}$:
$$\text{AT-RQS} = \text{BWS} \times \text{CF}, \quad \text{AT-RQS}_{10} = \frac{\text{AT-RQS}}{10}$$
Karena $\text{CF} \in [0.85, 1.00]$, maka faktor tersebut berfungsi sebagai *bounded attenuation factor*, bukan sebagai pengali yang dapat meningkatkan $\text{BWS}$ di atas nilai dasarnya. Khusus pada kondisi $\text{AECI} = 0$, diperoleh $\text{AT-RQS} = 0.85 \times \text{BWS}$, yang berarti tidak adanya bukti struktural inti menghasilkan batas redaman tepat sebesar 15% terhadap $\text{BWS}$ dan tidak menghasilkan penalti linier ganda di luar faktor $\text{CF}$ tersebut.

### 6.6 Triangulasi Konvergensi (ARTI)
Setelah tiga kanal dinormalisasi ke domain komputasi terpadu, sistem menghitung tingkat konvergensinya. Selisih absolut antara dua nilai dinyatakan dengan operator $|x - y|$ yang menunjukkan jarak numerik tanpa memperhatikan arah selisih.
$$\text{ARTI} = 100 - \left[ \frac{|S_{\text{norm}} - R_{\text{norm}}| + |S_{\text{norm}} - C_{\text{norm}}|}{2} \right]$$
Jika ketiga kanal memiliki nilai yang semakin berdekatan, $\text{ARTI}$ semakin tinggi; jika perbedaan antar-kanal semakin besar, $\text{ARTI}$ semakin rendah. $\text{ARTI}$ mengukur konvergensi antar-sumber, bukan kualitas substantif yang telah dihitung oleh $\text{BWS}$.

### 6.7 Confidence Index (AAC)
Sistem kemudian membentuk Assessment Assurance/Confidence ($\text{AAC}$) dari tiga komponen independen:
$$\text{AAC} = 0.50(\text{ARTI}) + 0.30(D_{\text{completeness}}) + 0.20(E_{\text{consistency}})$$
dengan total bobot $0.50 + 0.30 + 0.20 = 1.00$. $\text{AAC}$ merupakan indeks keyakinan terhadap kualitas proses asesmen berdasarkan konvergensi, kelengkapan data, dan konsistensi antar-kanal.

$\text{AAC}$ tidak digunakan sebagai faktor pengali terhadap $\text{AT-RQS}$. Secara topologis:
$$\text{AAC} \not\to \text{AT-RQS}$$
$\text{AAC}$ tidak boleh masuk kembali ke jalur perhitungan $\text{BWS}$, $\text{CF}$, atau $\text{AT-RQS}$. Pemisahan tersebut mencegah terjadinya *circular self-assessment bias*.

### 6.8 Validator Kelengkapan Skema Deterministik
$D_{\text{completeness}}$ mengukur kelengkapan delapan parameter wajib ($F_1 \dots F_8$) yang harus tersedia dan tidak kosong. Digunakan fungsi indikator biner:
$$\mathbb{I}(F_j \neq \emptyset) = \begin{cases} 1, & \text{jika parameter } F_j \text{ tersedia/non-null} \\ 0, & \text{jika parameter } F_j \text{ kosong/null} \end{cases}, \quad j = 1, \dots, 8$$
$$D_{\text{completeness}} = \left( \frac{\sum_{j=1}^{8} \mathbb{I}(F_j \neq \emptyset)}{8} \right) \times 100$$
Evaluasi dilakukan oleh validator berbasis aturan kode statis independen, bukan oleh model AI.

### 6.9 Validator Konsistensi Antar-Kanal
$E_{\text{consistency}}$ mengukur konsistensi numerik tiga kanal setelah normalisasi berdasarkan rata-rata tiga perbedaan absolut berpasangan:
$$E_{\text{consistency}} = 100 - \left[ \frac{|S_{\text{norm}} - R_{\text{norm}}| + |S_{\text{norm}} - C_{\text{norm}}| + |R_{\text{norm}} - C_{\text{norm}}|}{3} \right]$$
Semakin kecil perbedaan antar-kanal, semakin besar nilai $E_{\text{consistency}}$.

### 6.10 Hubungan Deterministik Keseluruhan
Pipeline komputasi mutu substantif:
$$(S, R, C) \longrightarrow (S_{\text{norm}}, R_{\text{norm}}, C_{\text{norm}}) \longrightarrow \text{BWS} \longrightarrow \text{AECI} \longrightarrow \text{CF} \longrightarrow \text{AT-RQS}$$
Jalur keyakinan asesmen berjalan secara terpisah:
$$(S_{\text{norm}}, R_{\text{norm}}, C_{\text{norm}}) \longrightarrow \text{ARTI} \longrightarrow \{D_{\text{completeness}}, E_{\text{consistency}}\} \longrightarrow \text{AAC}$$
Isolasi mutlak non-sirkular: $\text{AAC} \not\to \text{AT-RQS}$.

### 6.11 Asal-Usul Kriptografis Kanonikal
Snapshot data asesmen diserialisasi menggunakan JSON Canonicalization Scheme (JCS) sesuai RFC 8785, kemudian diproses menggunakan fungsi hash SHA-256:
$$H = \text{SHA256}(\text{CanonicalJSON}(\text{AssessmentSnapshot}))$$
Digest $H$ (256-bit) dikaitkan dengan `assessment_id`, `timestamp` ISO 8601, dan dicatat pada ledger database permanen untuk memberikan jaminan *tamper-evident provenance*.

### 6.12 Ringkasan Variabel dan Fungsi
| Simbol | Pengertian | Fungsi Teknis |
| :--- | :--- | :--- |
| $S$ / $S_{\text{norm}}$ | SCORE asli / ternormalisasi | Input kanal SCORE (0–10) $\to$ Domain $[0, 100]$ |
| $R$ / $R_{\text{norm}}$ | SCREEN asli / ternormalisasi | Input kanal SCREEN (1–5) $\to$ Domain $[0, 100]$ |
| $C$ / $C_{\text{norm}}$ | CLUE / CESS | Representasi kanal bukti substantif $\to$ Domain $[0, 100]$ |
| $D_i$ / $W_i$ | Dimensi / Bobot kualitas ke-$i$ | Komponen dan pembobot $\text{BWS}$ ($i = 1 \dots 7, \sum W_i = 1.00$) |
| $\text{BWS}$ | Base Weighted Score | Skor kualitas substantif dasar |
| $N_{\text{detected}}$ / $\text{AECI}$ | Jumlah bukti / Indeks bukti | Deteksi 5 pilar $\to$ Indeks kelengkapan struktural $[0, 100]$ |
| $\text{CF}$ | Bounded Attenuation Factor | Faktor redaman terikat $[0.85, 1.00]$ |
| $\text{AT-RQS}$ | Tri-Source Research Quality Score | Output mutu substantif akhir ($\text{BWS} \times \text{CF}$) |
| $\text{ARTI}$ | Research Triangulation Index | Konvergensi deviasi absolut 3 kanal |
| $D_{\text{completeness}}$ | Kelengkapan 8 parameter wajib | Evaluasi rasio biner skema statis non-null (6.5a) |
| $E_{\text{consistency}}$ | Konsistensi silang 3 kanal | Evaluasi deviasi berpasangan 3 kanal (6.5b) |
| $\text{AAC}$ | Assessment Assurance/Confidence | Indeks keyakinan asesmen terisolasi ($\text{AAC} \not\to \text{AT-RQS}$) |
| $H$ / `assessment_id` | SHA-256 Digest / Identifier | Identitas kriptografis kanonikal RFC 8785 snapshot |

### 6.13 Prinsip Deterministik
Seluruh formula dirancang deterministik, terikat (*bounded*), terpisah secara topologis (*non-circular*), dapat diaudit (*auditable*), dapat direproduksi (*reproducible*), dan dapat diverifikasi secara kriptografis (*tamper-evident verifiable*).

---


## 7. KLAIM-KLAIM PATEN (20 KLAIM HIERARKIS RESMI)

### KLAIM MANDIRI 1 (SISTEM TERKOMPUTERISASI):
1. Suatu sistem terkomputerisasi untuk asesmen bukti dokumen ilmiah secara deterministik dan pembangkitan rekaman terverifikasi integritasnya, sistem tersebut mencakup:
   - **modul penerima data masukan** yang dikonfigurasikan pada setidaknya satu prosesor untuk menerima naskah digital penelitian;
   - **modul ekstraksi analitis pertama** yang mengekstraksi sejumlah parameter kualitas struktural dalam domain nilai diskret pertama;
   - **modul ekstraksi analitis kedua** yang mengekstraksi sejumlah parameter evaluasi risiko dan kebaruan dalam domain nilai ordinal kedua;
   - **modul ekstraksi analitis ketiga** yang mengekstraksi parameter bukti substantif kuantitatif dan pernyataan batasan penelitian;
   - **engine normalisasi skala deterministik** yang mengonversi parameter dari ketiga modul ekstraksi ke dalam domain komputasi terpadu berskala 0 hingga 100;
   - **engine pembobotan dimensi kualitas** yang menghitung skor terbobot dasar ($\text{BWS}$) dari tujuh dimensi kualitas substantif terdefinisi dengan total bobot 100%;
   - **modul pemeriksa bukti struktural** yang mendeteksi keberadaan lima elemen struktural wajib pada naskah untuk menghasilkan indeks keselarasan struktural ($\text{AECI}$);
   - **engine atenuasi terikat** yang menghitung faktor redaman ($\text{CF}$) dalam rentang terkendali 0.85 hingga 1.00 berdasarkan indeks keselarasan struktural, dan mengalikan faktor redaman tersebut dengan skor terbobot dasar untuk menghasilkan skor mutu substantif akhir;
   - **engine triangulasi analitik** yang menghitung indeks kesepakatan konvergensi antar-lapisan analitik berdasarkan deviasi absolut rata-rata antar-modul ekstraksi;
   - **engine asesmen keyakinan** yang menghitung indeks keyakinan asesmen secara independen tanpa memodifikasi skor mutu substantif akhir;
   - **modul validator skema independen** yang mengevaluasi kelengkapan skema data dan konsistensi lintas-lapisan secara aturan kode deterministik tanpa melibatkan inferensi model kecerdasan buatan; serta
   - **modul pembuktian asal-usul kriptografis** yang mengonversi parameter hasil evaluasi menjadi representasi kanonikal terstandardisasi dan membangkitkan ringkasan hash kriptografis bertanda waktu yang mengunci rekaman asesmen ke dalam media penyimpan permanen.

### KLAIM MANDIRI 2 (METODE KOMPUTASI):
2. Suatu metode yang diimplementasikan oleh komputer untuk mengevaluasi mutu naskah ilmiah secara deterministik dan anti-halusinasi, metode tersebut mencakup langkah-langkah:
   (a) menerima naskah penelitian pada prosesor komputasi;
   (b) mengekstraksi secara simultan tiga himpunan bukti analitik independen;
   (c) menormalisasi seluruh himpunan bukti heterogen ke dalam domain nilai 0 hingga 100;
   (d) menghitung skor terbobot dasar $\text{BWS} = \sum_{i=1}^7 D_i W_i$ dengan batasan $\sum W_i = 1.00$;
   (e) mendeteksi keberadaan lima elemen struktural wajib naskah untuk menghasilkan indeks $\text{AECI} = 100 \times (N_{\text{detected}}/5)$;
   (f) menerapkan faktor atenuasi terikat $\text{CF} = 0.85 + 0.15 \times (\text{AECI}/100)$ terhadap $\text{BWS}$ untuk menghasilkan skor mutu substantif akhir;
   (g) menghitung indeks triangulasi konvergensi dan indeks keyakinan asesmen pada jalur data terpisah dari skor mutu substantif akhir; serta
   (h) membangkitkan ringkasan SHA-256 dari serialisasi Canonical JSON (RFC 8785) untuk mengunci hasil asesmen ke dalam ledger permanen.

### KLAIM MANDIRI 3 (MEDIA PENYIMPAN TERBACA KOMPUTER):
3. Suatu media penyimpan non-transitori yang dapat dibaca oleh komputer yang memuat instruksi program, yang apabila dieksekusi oleh setidaknya satu prosesor, menyebabkan prosesor tersebut menjalankan langkah-langkah metode dari Klaim 2.

### KLAIM-KLAIM TURUNAN (KLAIM 4 s/d 20):
4. Sistem dari Klaim 1, di mana modul ekstraksi analitis pertama mengevaluasi 8 parameter struktural naskah yang mencakup relevansi topik, struktur artikel, kualitas abstrak, kesenjangan riset, metodologi, perlakuan data/statistik, diskusi komparatif, dan kualitas referensi dalam skala diskret 0 hingga 10.
5. Sistem dari Klaim 1, di mana modul ekstraksi analitis kedua mengevaluasi parameter kebaruan, risiko metodologi, dan kejelasan komunikasi akademik dalam skala ordinal 1 hingga 5.
6. Sistem dari Klaim 1, di mana modul ekstraksi analitis ketiga menghitung skor kekuatan bukti substantif ($\text{CESS}$) melalui penjumlahan terbobot dari nilai ketepatan model statistik, ketepatan kontekstual sampling, keterbukaan batasan penelitian, agenda riset masa depan, dan utilitas praktis/kebijakan.
7. Sistem dari Klaim 1, di mana tujuh dimensi kualitas substantif terdiri dari: *Academic Contribution (18%), Procedural Rigor (18%), Analytical Strength (16%), Scholarly Communication (12%), Integrity & Transparency (12%), Future Research Value (10%),* dan *Impact & Applicability (14%)*.
8. Sistem dari Klaim 1, di mana engine pembobotan mengisolasi dimensi keyakinan asesmen dari perhitungan skor terbobot dasar ($\text{BWS}$).
9. Sistem dari Klaim 1, di mana engine normalisasi mengonversi nilai skala ordinal $R \in [1, 5]$ modul kedua melalui fungsi matematis $\text{SCREEN}_{\text{norm}} = ((R-1)/4) \times 100$.
10. Sistem dari Klaim 1, di mana lima elemen struktural wajib modul pemeriksa bukti struktural terdiri dari: rumusan masalah/tujuan riset, desain metodologi, sampel/data empiris, temuan pembahasan, dan pernyataan batasan riset.
11. Sistem dari Klaim 1, di mana faktor redaman ($\text{CF}$) menghasilkan nilai batas bawah sebesar 0.850 saat indeks keselarasan struktural $\text{AECI} = 0.0$ dan nilai batas atas sebesar 1.000 saat $\text{AECI} = 100.0$.
12. Sistem dari Klaim 1, di mana skor mutu substantif akhir dipetakan ke dalam lima tingkatan mutu: *Exemplary Rigor ($\ge 88.0$), Strong Quality ($80.0\text{--}87.9$), Good Quality ($70.0\text{--}79.9$), Satisfactory with Limitations ($60.0\text{--}69.9$),* dan *Preliminary Evidence ($< 60.0$)*.
13. Sistem dari Klaim 1, di mana engine triangulasi analitik menghitung indeks kesepakatan konvergensi melalui formula $\text{ARTI} = 100 - [ ( |\text{S}_{\text{norm}} - \text{R}_{\text{norm}}| + |\text{S}_{\text{norm}} - \text{C}_{\text{norm}}| ) / 2 ]$.
14. Sistem dari Klaim 1, di mana engine asesmen keyakinan menghitung indeks keyakinan melalui formula $\text{AAC} = 0.50(\text{ARTI}) + 0.30(D_{\text{completeness}}) + 0.20(E_{\text{consistency}})$.
15. Sistem dari Klaim 1, di mana modul validator skema mengevaluasi parameter kelengkapan data ($D_{\text{completeness}}$) melalui fungsi rasio biner kehadiran parameter wajib skema non-null $D_{\text{completeness}} = ( \sum_{j=1}^{8} \mathbb{I}(F_j \neq \emptyset) / 8 ) \times 100$.
16. Sistem dari Klaim 1, di mana modul validator skema mengevaluasi parameter konsistensi ekstraksi ($E_{\text{consistency}}$) melalui fungsi deviasi rata-rata selisih absolut berpasangan lintas tiga kanal $E_{\text{consistency}} = 100 - [ ( |\text{S}_{\text{norm}} - \text{R}_{\text{norm}}| + |\text{S}_{\text{norm}} - \text{C}_{\text{norm}}| + |\text{R}_{\text{norm}} - \text{C}_{\text{norm}}| ) / 3 ]$.
17. Sistem dari Klaim 1, di mana representasi kanonikal terstandardisasi mematuhi skema kanonisasi JSON standar internasional RFC 8785.
18. Sistem dari Klaim 1, di mana modul pembuktian asal-usul membangkitkan identifier asesmen unik yang mengombinasikan prefix institusional, identifier dokumen, dan ringkasan hash SHA-256.
19. Sistem dari Klaim 1, di mana sistem secara otomatis mendeteksi modifikasi retrospektif tidak sah pada media penyimpan permanen melalui ketidaksesuaian verifikasi ringkasan hash kriptografis.
20. Sistem dari Klaim 1, di mana seluruh parameter skor kualitas substantif akhir, indeks keselarasan struktural, indeks keyakinan, dan bukti asal-usul kriptografis disematkan secara otomatis pada kartu rekaman indeks publikasi digital artikel penelitian.

---

## 8. ABSTRAK PATEN
Suatu sistem dan metode terkomputerisasi untuk asesmen mutu naskah penelitian ilmiah secara deterministik dan anti-halusinasi diungkapkan. Sistem mencakup modul penerima dokumen digital; tiga modul ekstraksi analitis independen (SCORE skala diskret 0–10, SCREEN skala ordinal 1–5, dan CLUE bukti substantif); engine normalisasi skala deterministik ke domain $[0, 100]$; engine pembobotan 7 dimensi kualitas substantif ($\text{BWS}, \sum W_i = 1.00$); modul pemeriksa 5 pilar bukti struktural ($\text{AECI}$); engine redaman terikat $\text{CF} = 0.85 + 0.15 \times (\text{AECI}/100)$ yang menghasilkan skor mutu akhir $\text{AT-RQS} = \text{BWS} \times \text{CF}$; engine triangulasi analitik ($\text{ARTI}$); engine asesmen keyakinan non-sirkular ($\text{AAC}$) yang diuji oleh validator skema deterministik independen; serta modul pembuktian asal-usul kriptografis yang mengonversi hasil evaluasi ke Canonical JSON (RFC 8785) dan ringkasan SHA-256 permanen. Invensi ini meniadakan bias sirkular evaluasi diri AI dan menghasilkan asesmen yang tahan manipulasi serta dapat diaudit secara independen.
