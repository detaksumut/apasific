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

## 6. URAIAN LENGKAP INVENSI

### 6.1 Arsitektur Perangkat Keras dan Lingkungan Komputasi
Merujuk pada **FIG. 1**, sistem komputasi mencakup setidaknya satu unit pemroses pusat (*Central Processing Unit / CPU* atau *Neural Processing Unit / NPU*), memori kerja berkecepatan tinggi (*RAM*), media penyimpan data non-transitori permanen (*Solid-State Drive / Database Server*), antarmuka jaringan (*Network Interface Controller*), serta sejumlah modul perangkat lunak terkonfigurasi.

### 6.2 Modul Ekstraksi Tiga Kanal Independen (Tri-Source)
Merujuk pada **FIG. 2**, dokumen penelitian digital diterima oleh modul penerima dan diproses secara simultan oleh tiga modul analitik independen:
1. **Modul Ekstraksi Pertama (SCORE):** Mengekstraksi 8 parameter rubrik struktural ($S_1 \dots S_8$) dalam skala diskret mentah $[0, 10]$ (*topic relevance, article structure, abstract, research gap, methodology, data/statistics, discussion, references*).
2. **Modul Ekstraksi Kedua (SCREEN):** Mengekstraksi 3 parameter penapisan risiko dan kebaruan ($R_1 \dots R_3$) dalam skala ordinal mentah $[1, 5]$ (*novelty rating, methodology risk rating, clarity rating*).
3. **Modul Ekstraksi Ketiga (CLUE):** Mengekstraksi bukti faktual substantif kuantitatif ($R^2$, nilai-$p$, uji statistik $t/F$, ukuran sampel $n$, teknik sampling, batasan penelitian eksplisit, implikasi kebijakan, dan agenda riset lanjutan).

### 6.3 Pipeline Normalisasi Skala Deterministik
Merujuk pada **FIG. 3**, engine normalisasi memetakan seluruh masukan mentah heterogen ke dalam domain nilai baku $x_{\text{norm}} \in [0, 100]$:
$$\text{SCORE}_{\text{norm}} = \left( \frac{\text{SCORE}}{10} \right) \times 100$$
$$\text{SCREEN}_{\text{norm}} = \left( \frac{\text{SCREEN} - 1}{4} \right) \times 100$$
$$\text{CLUE}_{\text{norm}} = \text{CESS} = \sum_{k=1}^{5} w_k \cdot c_k = 0.30(c_1) + 0.25(c_2) + 0.15(c_3) + 0.15(c_4) + 0.15(c_5)$$

### 6.4 Matriks 7 Dimensi Kualitas Baku & Base Weighted Score (BWS)
Merujuk pada **FIG. 4**, nilai terstandardisasi diagregasikan ke dalam 7 Dimensi Kualitas Substantif Tertimbang ($D_1 \dots D_7$):
$$\text{BWS} = \sum_{i=1}^{7} (D_i \times W_i)$$
dengan bobot terkalibrasi tetap:
$$W = [0.18, 0.18, 0.16, 0.12, 0.12, 0.10, 0.14], \quad \sum_{i=1}^{7} W_i = 1.00$$

### 6.5 Deteksi 5 Pilar Bukti Struktural & Bounded Attenuation Engine
Merujuk pada **FIG. 5**, sistem mendeteksi keberadaan 5 elemen struktural wajib:
$$\text{AECI} = 100 \times \left( \frac{N_{\text{detected}}}{5} \right), \quad N_{\text{detected}} \in \{0, 1, 2, 3, 4, 5\}$$
Nilai $\text{AECI}$ dimasukkan ke dalam fungsi redaman terikat:
$$\text{CF} = 0.85 + 0.15 \times \left( \frac{\text{AECI}}{100} \right), \quad \text{CF} \in [0.85, 1.00]$$
Skor kualitas substantif akhir dihasilkan melalui perkalian:
$$\text{AT-RQS} = \text{BWS} \times \text{CF}, \quad \text{AT-RQS}_{10} = \frac{\text{AT-RQS}}{10}$$

### 6.6 Pemisahan Mutu vs Keyakinan & Validator Skema Independen
Merujuk pada **FIG. 6** dan **FIG. 7**, sistem menghitung indeks triangulasi konvergensi:
$$\text{ARTI} = 100 - \left[ \frac{|\text{S}_{\text{norm}} - \text{R}_{\text{norm}}| + |\text{S}_{\text{norm}} - \text{C}_{\text{norm}}|}{2} \right]$$
Indeks keyakinan asesmen dihitung pada jalur data terpisah:
$$\text{AAC} = 0.50(\text{ARTI}) + 0.30(D_{\text{completeness}}) + 0.20(E_{\text{consistency}})$$
Di mana validator skema deterministik independen mengevaluasi:
$$D_{\text{completeness}} = \left( \frac{\sum_{j=1}^{8} \mathbb{I}(F_j \neq \emptyset)}{8} \right) \times 100$$
$$E_{\text{consistency}} = 100 - \left( \frac{|\text{S}_{\text{norm}} - \text{R}_{\text{norm}}| + |\text{S}_{\text{norm}} - \text{C}_{\text{norm}}| + |\text{R}_{\text{norm}} - \text{C}_{\text{norm}}|}{3} \right)$$

### 6.7 Pembangkitan Asal-Usul Kriptografis Permanen
Merujuk pada **FIG. 8** dan **FIG. 9**, seluruh struktur data hasil evaluasi diserialisasi ke dalam format Canonical JSON sesuai standar RFC 8785, dihitung nilai ringkasan kriptografis SHA-256 Digest, dan dibangkitkan identifier unik `assessment_id` yang terkunci bersama timestamp ISO 8601 pada basis data permanen.

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
