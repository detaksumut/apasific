const React = require('react');
const ReactPDF = require('@react-pdf/renderer');
const fs = require('fs');
const path = require('path');

const { Document, Page, Text, View, StyleSheet } = ReactPDF;

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 8.4,
    color: '#1e293b',
    lineHeight: 1.42,
  },
  coverPage: {
    paddingTop: 55,
    paddingBottom: 50,
    paddingHorizontal: 45,
    fontFamily: 'Helvetica',
    backgroundColor: '#091326',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 18,
    left: 40,
    right: 40,
    fontSize: 7.2,
    color: '#64748b',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    fontSize: 7.2,
    color: '#64748b',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverBadge: {
    backgroundColor: '#b45309',
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  coverSubBadge: {
    backgroundColor: '#1e293b',
    color: '#93c5fd',
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    lineHeight: 1.25,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    color: '#94a3b8',
    lineHeight: 1.4,
    marginBottom: 18,
  },
  coverMetaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  coverMetaRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 4,
  },
  coverMetaLabel: {
    width: '32%',
    fontSize: 7.8,
    fontFamily: 'Helvetica-Bold',
    color: '#cbd5e1',
  },
  coverMetaValue: {
    width: '68%',
    fontSize: 7.8,
    color: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    borderBottomWidth: 1.2,
    borderBottomColor: '#0284c7',
    paddingBottom: 3,
    marginTop: 10,
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  subSectionTitle: {
    fontSize: 9.8,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginTop: 7,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 5,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderWidth: 0.6,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    padding: 7,
    marginBottom: 7,
  },
  alertBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    padding: 6,
    marginBottom: 6,
    borderRadius: 2,
  },
  warningBox: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
    padding: 6,
    marginBottom: 6,
    borderRadius: 2,
  },
  table: {
    width: '100%',
    borderWidth: 0.6,
    borderColor: '#cbd5e1',
    marginBottom: 7,
  },
  tableHeader: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    paddingVertical: 3.5,
    paddingHorizontal: 4,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 0.4,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 7.4,
  },
  tableCell: {
    paddingRight: 3,
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    paddingRight: 3,
  },
  mathBox: {
    backgroundColor: '#f1f5f9',
    borderWidth: 0.8,
    borderColor: '#94a3b8',
    borderRadius: 3,
    padding: 5,
    marginVertical: 4,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#0f172a',
  },
  drawingBox: {
    backgroundColor: '#ffffff',
    borderWidth: 0.8,
    borderColor: '#475569',
    borderRadius: 3,
    padding: 6,
    marginVertical: 4,
    fontFamily: 'Courier',
    fontSize: 6.8,
    lineHeight: 1.25,
    color: '#0f172a',
  },
});

const PatentDossierPDF = () => (
  React.createElement(
    Document,
    {
      title: "AT-RQS v1.0 - Complete Patent Application & Legal Prosecution Dossier",
      author: "Association of Asia Pacific Academician (ASIA) / APASIFIC Academic Division",
      subject: "DJKI & PCT Patent Specification, Drawings FIG 1-9, Claim Architecture Review, EPO Problem-Solution, and Prior-Art Matrix",
      keywords: "AT-RQS, Patent Dossier, DJKI, PCT, Computer-Implemented Invention, G06F 40/20, Bounded Attenuation, Cryptographic Provenance",
      creator: "APASIFIC Intellectual Property Division"
    },

    // =========================================================================
    // COVER PAGE
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.coverPage },
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.coverBadge }, "OFFICIAL PATENT APPLICATION & PROSECUTION DOSSIER"),
        React.createElement(Text, { style: styles.coverSubBadge }, "DOKUMEN INDUK PRE-FILING • DJKI KEMENKUMHAM RI & PCT (WIPO)"),
        React.createElement(
          Text,
          { style: styles.coverTitle },
          "SISTEM DAN METODE TERKOMPUTERISASI UNTUK PEMROSESAN BUKTI DOKUMEN ILMIAH MULTI-SUMBER DETERMINISTIK DENGAN REDAMAN KONSISTENSI STRUKTURAL DAN PENGUNCIAN ASAL-USUL KRIPTOGRAFIS"
        ),
        React.createElement(
          Text,
          { style: styles.coverSubtitle },
          "Kompilasi Komprehensif Berkas Paten Invensi: Draf Spesifikasi Lengkap, 20 Klaim Hierarkis, 9 Lembar Gambar Teknik (FIG. 1–9), Audit 10 Dimensi Klaim, Analisis EPO Problem-Solution & Data Ablasi (N=24), Sanggahan Simulasi Pemeriksa, dan Matriks Novelty Prior-Art Global."
        )
      ),

      React.createElement(
        View,
        { style: styles.coverMetaBox },
        React.createElement(
          View,
          { style: styles.coverMetaRow },
          React.createElement(Text, { style: styles.coverMetaLabel }, "Pemohon Paten:"),
          React.createElement(Text, { style: styles.coverMetaValue }, "Association of Asia Pacific Academician (ASIA) / APASIFIC Academic Division")
        ),
        React.createElement(
          View,
          { style: styles.coverMetaRow },
          React.createElement(Text, { style: styles.coverMetaLabel }, "Klasifikasi Kandidat IPC:"),
          React.createElement(Text, { style: styles.coverMetaValue }, "G06F 40/20, G06N 3/00, G06F 16/30, G06F 21/64 (Computer-Implemented Invention)")
        ),
        React.createElement(
          View,
          { style: styles.coverMetaRow },
          React.createElement(Text, { style: styles.coverMetaLabel }, "Frozen Technical Baseline:"),
          React.createElement(Text, { style: styles.coverMetaValue }, "Commit bb0561d (Arsitektur & Formulasi Terkunci)")
        ),
        React.createElement(
          View,
          { style: styles.coverMetaRow },
          React.createElement(Text, { style: styles.coverMetaLabel }, "Prosecution Hardening Commit:"),
          React.createElement(Text, { style: styles.coverMetaValue }, "Commit 1dcffa0 (Claim Fallback Ladder & Antecedent Audit)")
        ),
        React.createElement(
          View,
          { style: styles.coverMetaRow },
          React.createElement(Text, { style: styles.coverMetaLabel }, "Status Tata Kelola:"),
          React.createElement(Text, { style: styles.coverMetaValue }, "Ready for Final Patent Counsel Review (Internal Inconsistencies: None Found)")
        ),
        React.createElement(
          View,
          { style: styles.coverMetaRow },
          React.createElement(Text, { style: styles.coverMetaLabel }, "Target Pengajuan (Filing):"),
          React.createElement(Text, { style: styles.coverMetaValue }, "September 2026 (Permohonan Paten DJKI RI ──> PCT Priority Claim)")
        )
      ),

      React.createElement(
        View,
        { style: { borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 8 } },
        React.createElement(
          Text,
          { style: { fontSize: 7.2, color: '#94a3b8', textAlign: 'center' } },
          "CONFIDENTIAL & PROPRIETARY • ASIA PACIFIC ACADEMICIAN • ALL RIGHTS RESERVED"
        )
      )
    ),

    // =========================================================================
    // PAGE 2: TABLE OF CONTENTS & EXECUTIVE SUMMARY
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN I: DAFTAR ISI & RINGKASAN EKSEKUTIF")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 2")
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "DAFTAR ISI DOSIR PATEN INVENSI"),
      
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "BAGIAN I: DRAF SPESIFIKASI PATEN FORMAL DJKI RI (Halaman 3–6)"),
        React.createElement(Text, null, "  1. Judul Invensi, Bidang Teknik, dan Klasifikasi Kandidat"),
        React.createElement(Text, null, "  2. Latar Belakang Invensi & Kelemahan Prior-Art (D1 s/d D6)"),
        React.createElement(Text, null, "  3. Ringkasan Invensi & Karakter Teknis Tiga Lapisan"),
        React.createElement(Text, null, "  4. Uraian Singkat Gambar Teknik (FIG. 1 s/d FIG. 9)"),
        React.createElement(Text, null, "  5. Uraian Lengkap Invensi & Formulasi Deterministik"),
        React.createElement(Text, null, "  6. Naskah 20 Klaim Paten Hierarkis (Klaim 1–3 Mandiri, 4–20 Turunan)"),
        React.createElement(Text, null, "  7. Abstrak Paten Formal"),
        React.createElement(Text, { style: [styles.bold, { marginTop: 4 }] }, "BAGIAN II: SPESIFIKASI 9 GAMBAR TEKNIK PATEN (FIG. 1–9) (Halaman 7–9)"),
        React.createElement(Text, null, "  • Registri Nomor Acuan Konsisten (100 s/d 902)"),
        React.createElement(Text, null, "  • Diagram Blok Fungsional Arsitektur, Normalisasi, Redaman, & Ledger"),
        React.createElement(Text, { style: [styles.bold, { marginTop: 4 }] }, "BAGIAN III: AUDIT ARSITEKTUR KLAIM & FALLBACK LADDER (Halaman 10–11)"),
        React.createElement(Text, null, "  • Audit 10 Dimensi Klaim (Antecedent Basis, Dependency, No Added Matter)"),
        React.createElement(Text, null, "  • Strategi Tangga Pertahanan Amandemen Berlapis"),
        React.createElement(Text, { style: [styles.bold, { marginTop: 4 }] }, "BAGIAN IV: EPO PROBLEM-SOLUTION & DATA ABLASI EKSPERIMENTAL (Halaman 12–13)"),
        React.createElement(Text, null, "  • Uji 3 Langkah EPO (CPA, OTP, Could-Would Approach)"),
        React.createElement(Text, null, "  • Tabel Komparatif Uji Ablasi N=24 Pembuktian Efek Teknis Nyata"),
        React.createElement(Text, null, "  • Matriks Ketahanan 5 Kondisi Batas Ekstrem (Edge-Cases)"),
        React.createElement(Text, { style: [styles.bold, { marginTop: 4 }] }, "BAGIAN V: SIMULASI SERANGAN PEMERIKSA & SANGGAHAN HUKUM (Halaman 14–15)"),
        React.createElement(Text, null, "  • Sanggahan Pasal 4 UU No. 65/2024 (Eligibility CII)"),
        React.createElement(Text, null, "  • Sanggahan Mosaicing D1+D2, D1+D3+D6, dan D4+D5"),
        React.createElement(Text, { style: [styles.bold, { marginTop: 4 }] }, "BAGIAN VI: PRIOR-ART CLAIM CHART & NOVELTY MATRIX (Halaman 16)"),
        React.createElement(Text, null, "  • Pemetaan Elemen-per-Elemen terhadap 6 Dokumen Paten Global")
      ),

      React.createElement(Text, { style: styles.subSectionTitle }, "RINGKASAN EKSEKUTIF KESIAPAN PATEN"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Dosir ini mengonsolidasikan seluruh dokumen teknis, hukum, dan pengujian empiris yang membuktikan kelayakan patentabilitas invensi AT-RQS™ v1.0. Invensi ini dikonstruksikan sebagai Sistem dan Metode yang Diimplementasikan oleh Komputer (CII) untuk memecahkan masalah teknis distorsi skala masukan heterogen, pembengkakan skor akibat hilangnya bukti struktural naskah ilmiah, serta bias sirkular evaluasi diri model AI generatif."
      ),
      React.createElement(
        View,
        { style: styles.alertBox },
        React.createElement(
          Text,
          { style: styles.bold },
          "STATUS AUDIT INTERNAL: TIDAK DITEMUKAN INKONSISTENSI (NO INCONSISTENCY IDENTIFIED)"
        ),
        React.createElement(
          Text,
          null,
          "Seluruh parameter matematis (AECI, CF, BWS, AT-RQS, ARTI, AAC, D_completeness, E_consistency), registri nomor acuan (100–902), dan relasi klaim telah diverifikasi 100% konsisten lintas seluruh berkas dosir ini."
        )
      )
    ),

    // =========================================================================
    // PAGE 3: BAGIAN I - DRAF SPESIFIKASI PATEN DJKI (DESKRIPSI & LATAR BELAKANG)
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN I: DRAF SPESIFIKASI PATEN DJKI")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 3")
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "BAGIAN I: DRAF SPESIFIKASI PATEN FORMAL DJKI RI"),
      
      React.createElement(Text, { style: styles.subSectionTitle }, "1. JUDUL INVENSI"),
      React.createElement(
        Text,
        { style: [styles.paragraph, styles.bold] },
        "SISTEM DAN METODE TERKOMPUTERISASI UNTUK PEMROSESAN BUKTI DOKUMEN ILMIAH MULTI-SUMBER DETERMINISTIK DENGAN REDAMAN KONSISTENSI STRUKTURAL DAN PENGUNCIAN ASAL-USUL KRIPTOGRAFIS"
      ),

      React.createElement(Text, { style: styles.subSectionTitle }, "2. BIDANG TEKNIK INVENSI"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Invensi ini secara umum berkaitan dengan bidang pemrosesan dokumen digital dan sistem kecerdasan buatan, dan secara lebih khusus berkaitan dengan sistem dan metode yang diimplementasikan oleh komputer (CII) untuk memproses aliran data bukti terstruktur dari naskah penelitian ilmiah melalui sintesis tiga kanal analitik independen, menerapkan koreksi redaman konsistensi struktural terikat (bounded structural feedforward attenuation), memisahkan kalkulasi mutu substantif dari indeks keyakinan secara non-sirkular, serta membangkitkan rekaman bukti asal-usul yang terkunci secara kriptografis (tamper-evident cryptographic provenance ledger)."
      ),

      React.createElement(Text, { style: styles.subSectionTitle }, "3. LATAR BELAKANG INVENSI & KELEMAHAN PRIOR ART"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Evaluasi kualitas naskah ilmiah digital merupakan instrumen vital dalam penjaminan mutu penelitian perguruan tinggi dan akreditasi akademik. Namun demikian, sistem konvensional dalam seni terdahulu memiliki sejumlah kelemahan teknis fatal:"
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "• Kelemahan Pencocokan Statis Linear (WO2020257780A1 - D1): Mengandalkan pencocokan teks terhadap basis data eksternal tanpa mengekstrak interaksi metodologi internal naskah.\n• Kelemahan Penjumlahan Sinyal Linier Subjektif (US20220107973A1 - D2): Menggabungkan anotasi kolaboratif dengan AI secara linier sederhana, memicu lolosnya naskah tanpa data empiris (false high score rate 29.2%).\n• Kelemahan Prediksi Replikabilitas Parsial (US12118311B1 - D3): Hanya mengekstrak statistik parsial tanpa kerangka multidimensi terpadu.\n• Kelemahan Penilaian Komparatif Berpasangan (WO2026072754A1 - D4): Rentan terhadap ketidakseimbangan domain dokumen pembanding.\n• Kelemahan Bias Sirkularitas Evaluasi Diri (US11275810B2 - D6): Skor keyakinan (confidence) langsung memodifikasi skor hasil akhir, memicu fenomena hallucinatory confidence inflation (circular bias 41.7%).\n• Kelemahan Integritas Pasca-Asesmen: Penyimpanan hasil evaluasi pada database standar tanpa penguncian hash kriptografis rentan manipulasi retrospektif."
      ),

      React.createElement(Text, { style: styles.subSectionTitle }, "4. RINGKASAN INVENSI"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Invensi ini menyelesaikan kelemahan di atas melalui integrasi fungsional 3 lapisan: (1) Lapisan Provenance/Input yang mengekstrak 3 kanal independen (SCORE 0–10, SCREEN 1–5, CLUE faktual); (2) Lapisan Processing Deterministik yang menormalisasi skala ke [0, 100], menghitung Base Weighted Score (BWS) 7 dimensi kualitas baku (Σ Wi = 1.00), menerapkan faktor redaman terikat CF ∈ [0.85, 1.00] berbasis deteksi 5 bukti struktural (AECI), menghitung triangulasi konvergensi (ARTI), dan mengisolasi indeks keyakinan (AAC) via Validator Skema independen; serta (3) Lapisan Integritas/Output yang membangkitkan representasi Canonical JSON (RFC 8785) dan SHA-256 Digest bertanda waktu."
      )
    ),

    // =========================================================================
    // PAGE 4: DRAF SPESIFIKASI (URAIAN LENGKAP INVENSI & FORMULASI)
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN I: DRAF SPESIFIKASI (URAIAN LENGKAP)")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 4")
      ),

      React.createElement(Text, { style: styles.subSectionTitle }, "5. URAIAN LENGKAP INVENSI & FORMULASI DETERMINISTIK"),
      
      React.createElement(Text, { style: styles.bold }, "A. Pipeline Normalisasi Skala Deterministik (5.1)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Tiga kanal analitik heterogen (SCORE 0–10, SCREEN 1–5, CLUE faktual) ditransformasikan secara deterministik ke domain terpadu [0, 100]:"
      ),
      React.createElement(
        Text,
        { style: styles.mathBox },
        "SCORE_norm = (S / 10) \u00D7 100   |   SCREEN_norm = ((R \u2212 1) / 4) \u00D7 100   |   C_norm = CESS_k = w_k \u00D7 c_k"
      ),

      React.createElement(Text, { style: styles.bold }, "B. Matriks 7 Dimensi Kualitas Substantif Baku (BWS) (5.2)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Base Weighted Score (BWS) dihitung sebagai penjumlahan terbobot 7 dimensi kualitas dengan total bobot tepat 100%:"
      ),
      React.createElement(
        Text,
        { style: styles.mathBox },
        "BWS = \u2211_{i=1}^{7} (D_i \u00D7 W_i)   |   W = [0.18, 0.18, 0.16, 0.12, 0.12, 0.10, 0.14],  \u2211 W_i = 1.00"
      ),

      React.createElement(Text, { style: styles.bold }, "C. Deteksi 5 Bukti Struktural (AECI) & Bounded Attenuation (CF) (5.3–5.5)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Deteksi 5 pilar wajib (Tujuan, Metode, Sampel, Temuan, Batasan) mengendalikan faktor redaman terikat CF \u2208 [0.85, 1.00]:"
      ),
      React.createElement(
        Text,
        { style: styles.mathBox },
        "AECI = 100 \u00D7 (N_det / 5)   \u2192   CF = 0.85 + 0.15 \u00D7 (AECI / 100)   \u2192   AT-RQS = BWS \u00D7 CF"
      ),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Saat naskah tanpa bukti metodologi inti (N_det = 0 \u2192 AECI = 0), skor mutu teredam tepat 15% (CF = 0.850 \u2192 AT-RQS = 0.85 \u00D7 BWS) tanpa penalti ganda linier."
      ),

      React.createElement(Text, { style: styles.bold }, "D. Triangulasi Konvergensi (ARTI) & Isolasi Non-Sirkular AAC (5.6–5.7)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Konvergensi 3 kanal dihitung via ARTI, sedangkan indeks keyakinan AAC diisolasi mutlak (AAC \u2280 AT-RQS):"
      ),
      React.createElement(
        Text,
        { style: styles.mathBox },
        "ARTI = 100 \u2212 [ (|S_norm \u2212 R_norm| + |S_norm \u2212 C_norm|) / 2 ]\nAAC = 0.50(ARTI) + 0.30(D_completeness) + 0.20(E_consistency)   |   [ AAC \u2280 AT-RQS ]"
      ),

      React.createElement(Text, { style: styles.bold }, "E. Validator Skema Deterministik Independen (5.8–5.9)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "D_completeness dan E_consistency dievaluasi secara aturan kode statis independen (anti AI self-assessment bias):"
      ),
      React.createElement(
        Text,
        { style: styles.mathBox },
        "D_comp = ( \u2211_{j=1}^{8} \uD835\uDF59(F_j \u2260 \u2205) / 8 ) \u00D7 100   |   E_cons = 100 \u2212 [ (|S\u2212R| + |S\u2212C| + |R\u2212C|) / 3 ]"
      ),

      React.createElement(Text, { style: styles.bold }, "F. Asal-Usul Kriptografis Kanonikal Permanen (5.10–5.13)"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Snapshot data diserialisasi sesuai RFC 8785 (Canonical JSON) dan dihitung ringkasan SHA-256 Digest 256-bit: H = SHA256(CanonicalJSON(Snapshot)), dikunci permanen bersama assessment_id dan timestamp ISO 8601."
      )
    ),

    // =========================================================================
    // PAGE 5: DRAF KLAIM PATEN (KLAIM 1–10)
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN I: DRAF 20 KLAIM PATEN (KLAIM 1–10)")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 5")
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "KLAIM-KLAIM PATEN (KLAIM 1 s/d KLAIM 10)"),
      
      React.createElement(Text, { style: [styles.paragraph, styles.bold] }, "KLAIM MANDIRI 1 (SISTEM TERKOMPUTERISASI):"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "1. Suatu sistem terkomputerisasi untuk asesmen bukti dokumen ilmiah secara deterministik dan pembangkitan rekaman terverifikasi integritasnya, sistem tersebut mencakup:\n" +
        "   - modul penerima data masukan yang dikonfigurasikan pada setidaknya satu prosesor untuk menerima naskah digital penelitian;\n" +
        "   - modul ekstraksi analitis pertama yang mengekstraksi sejumlah parameter kualitas struktural dalam domain nilai diskret pertama;\n" +
        "   - modul ekstraksi analitis kedua yang mengekstraksi sejumlah parameter evaluasi risiko dan kebaruan dalam domain nilai ordinal kedua;\n" +
        "   - modul ekstraksi analitis ketiga yang mengekstraksi parameter bukti substantif kuantitatif dan pernyataan batasan penelitian;\n" +
        "   - engine normalisasi skala deterministik yang mengonversi parameter dari ketiga modul ekstraksi ke dalam domain komputasi terpadu berskala 0 hingga 100;\n" +
        "   - engine pembobotan dimensi kualitas yang menghitung skor terbobot dasar (BWS) dari tujuh dimensi kualitas substantif terdefinisi dengan total bobot 100%;\n" +
        "   - modul pemeriksa bukti struktural yang mendeteksi keberadaan lima elemen struktural wajib pada naskah untuk menghasilkan indeks keselarasan struktural (AECI);\n" +
        "   - engine atenuasi terikat yang menghitung faktor redaman (CF) dalam rentang terkendali 0.85 hingga 1.00 berdasarkan indeks keselarasan struktural, dan mengalikan faktor redaman tersebut dengan skor terbobot dasar untuk menghasilkan skor mutu substantif akhir;\n" +
        "   - engine triangulasi analitik yang menghitung indeks kesepakatan konvergensi antar-lapisan analitik berdasarkan deviasi absolut rata-rata antar-modul ekstraksi;\n" +
        "   - engine asesmen keyakinan yang menghitung indeks keyakinan asesmen secara independen tanpa memodifikasi skor mutu substantif akhir;\n" +
        "   - modul validator skema independen yang mengevaluasi kelengkapan skema data dan konsistensi lintas-lapisan secara aturan kode deterministik tanpa melibatkan inferensi model kecerdasan buatan; serta\n" +
        "   - modul pembuktian asal-usul kriptografis yang mengonversi parameter hasil evaluasi menjadi representasi kanonikal terstandardisasi dan membangkitkan ringkasan hash kriptografis bertanda waktu yang mengunci rekaman asesmen ke dalam media penyimpan permanen."
      ),

      React.createElement(Text, { style: [styles.paragraph, styles.bold] }, "KLAIM MANDIRI 2 (METODE KOMPUTASI):"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "2. Suatu metode yang diimplementasikan oleh komputer untuk mengevaluasi mutu naskah ilmiah secara deterministik dan anti-halusinasi, metode tersebut mencakup langkah-langkah: (a) menerima naskah penelitian pada prosesor komputasi; (b) mengekstraksi secara simultan tiga himpunan bukti analitik independen; (c) menormalisasi seluruh himpunan bukti heterogen ke dalam domain nilai 0 hingga 100; (d) menghitung skor terbobot dasar BWS = ∑ Di Wi dengan batasan ∑ Wi = 1.00; (e) mendeteksi keberadaan lima elemen struktural wajib naskah untuk menghasilkan indeks AECI = 100 × (N_detected / 5); (f) menerapkan faktor atenuasi terikat CF = 0.85 + 0.15 × (AECI / 100) terhadap BWS untuk menghasilkan skor mutu substantif akhir; (g) menghitung indeks triangulasi konvergensi dan indeks keyakinan asesmen pada jalur data terpisah dari skor mutu substantif akhir; serta (h) membangkitkan ringkasan SHA-256 dari serialisasi Canonical JSON (RFC 8785) untuk mengunci hasil asesmen ke dalam ledger permanen."
      ),

      React.createElement(Text, { style: [styles.paragraph, styles.bold] }, "KLAIM MANDIRI 3 (MEDIA PENYIMPAN TERBACA KOMPUTER):"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "3. Suatu media penyimpan non-transitori yang dapat dibaca oleh komputer yang memuat instruksi program, yang apabila dieksekusi oleh setidaknya satu prosesor, menyebabkan prosesor tersebut menjalankan langkah-langkah metode dari Klaim 2."
      ),

      React.createElement(Text, { style: [styles.paragraph, styles.bold] }, "KLAIM TURUNAN (KLAIM 4 s/d KLAIM 10):"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "4. Sistem dari Klaim 1, di mana modul ekstraksi analitis pertama mengevaluasi 8 parameter struktural naskah (topic relevance, article structure, abstract, research gap, methodology, data/statistics, discussion, references) dalam skala diskret 0 hingga 10.\n" +
        "5. Sistem dari Klaim 1, di mana modul ekstraksi analitis kedua mengevaluasi parameter kebaruan, risiko metodologi, dan kejelasan komunikasi akademik dalam skala ordinal 1 hingga 5.\n" +
        "6. Sistem dari Klaim 1, di mana modul ekstraksi analitis ketiga menghitung skor kekuatan bukti substantif (CESS) melalui penjumlahan terbobot dari nilai ketepatan model statistik, ketepatan kontekstual sampling, keterbukaan batasan penelitian, agenda riset masa depan, dan utilitas praktis/kebijakan.\n" +
        "7. Sistem dari Klaim 1, di mana tujuh dimensi kualitas substantif terdiri dari: Academic Contribution (18%), Procedural Rigor (18%), Analytical Strength (16%), Scholarly Communication (12%), Integrity & Transparency (12%), Future Research Value (10%), dan Impact & Applicability (14%).\n" +
        "8. Sistem dari Klaim 1, di mana engine pembobotan mengisolasi dimensi keyakinan asesmen dari perhitungan skor terbobot dasar (BWS).\n" +
        "9. Sistem dari Klaim 1, di mana engine normalisasi mengonversi nilai skala ordinal R ∈ [1, 5] modul kedua melalui fungsi matematis SCREEN_norm = ((R−1)/4) × 100.\n" +
        "10. Sistem dari Klaim 1, di mana lima elemen struktural wajib modul pemeriksa bukti struktural terdiri dari: rumusan masalah/tujuan riset, desain metodologi, sampel/data empiris, temuan pembahasan, dan pernyataan batasan riset."
      )
    ),

    // =========================================================================
    // PAGE 6: DRAF KLAIM PATEN (KLAIM 11–20) & ABSTRAK
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN I: DRAF KLAIM (11–20) & ABSTRAK")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 6")
      ),

      React.createElement(Text, { style: [styles.paragraph, styles.bold] }, "KLAIM TURUNAN (KLAIM 11 s/d KLAIM 20):"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "11. Sistem dari Klaim 1, di mana faktor redaman (CF) menghasilkan nilai batas bawah sebesar 0.850 saat indeks keselarasan struktural AECI = 0.0 dan nilai batas atas sebesar 1.000 saat AECI = 100.0.\n" +
        "12. Sistem dari Klaim 1, di mana skor mutu substantif akhir dipetakan ke dalam lima tingkatan mutu: Exemplary Rigor (≥ 88.0), Strong Quality (80.0–87.9), Good Quality (70.0–79.9), Satisfactory with Limitations (60.0–69.9), dan Preliminary Evidence (< 60.0).\n" +
        "13. Sistem dari Klaim 1, di mana engine triangulasi analitik menghitung indeks kesepakatan konvergensi melalui formula ARTI = 100 − [ ( |S_norm − R_norm| + |S_norm − C_norm| ) / 2 ].\n" +
        "14. Sistem dari Klaim 1, di mana engine asesmen keyakinan menghitung indeks keyakinan melalui formula AAC = 0.50(ARTI) + 0.30(D_completeness) + 0.20(E_consistency).\n" +
        "15. Sistem dari Klaim 1, di mana modul validator skema mengevaluasi parameter kelengkapan data (D_completeness) melalui fungsi rasio biner kehadiran parameter wajib skema non-null D_completeness = ( ∑_{j=1}^{8} \uD835\uDF59(F_j ≠ ∅) / 8 ) × 100.\n" +
        "16. Sistem dari Klaim 1, di mana modul validator skema mengevaluasi parameter konsistensi ekstraksi (E_consistency) melalui fungsi deviasi rata-rata selisih absolut berpasangan lintas tiga kanal E_consistency = 100 − [ ( |S_norm − R_norm| + |S_norm − C_norm| + |R_norm − C_norm| ) / 3 ].\n" +
        "17. Sistem dari Klaim 1, di mana representasi kanonikal terstandardisasi mematuhi skema kanonisasi JSON standar internasional RFC 8785.\n" +
        "18. Sistem dari Klaim 1, di mana modul pembuktian asal-usul membangkitkan identifier asesmen unik yang mengombinasikan prefix institusional, identifier dokumen, dan ringkasan hash SHA-256.\n" +
        "19. Sistem dari Klaim 1, di mana sistem secara otomatis mendeteksi modifikasi retrospektif tidak sah pada media penyimpan permanen melalui ketidaksesuaian verifikasi ringkasan hash kriptografis.\n" +
        "20. Sistem dari Klaim 1, di mana seluruh parameter skor kualitas substantif akhir, indeks keselarasan struktural, indeks keyakinan, dan bukti asal-usul kriptografis disematkan secara otomatis pada kartu rekaman indeks publikasi digital artikel penelitian."
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "ABSTRAK PATEN FORMAL"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Suatu sistem dan metode terkomputerisasi untuk asesmen mutu naskah penelitian ilmiah secara deterministik dan anti-halusinasi diungkapkan. Sistem mencakup modul penerima dokumen digital; tiga modul ekstraksi analitis independen (SCORE skala diskret 0–10, SCREEN skala ordinal 1–5, dan CLUE bukti substantif); engine normalisasi skala deterministik ke domain [0, 100]; engine pembobotan 7 dimensi kualitas substantif (BWS, ∑ Wi = 1.00); modul pemeriksa 5 pilar bukti struktural (AECI); engine redaman terikat CF = 0.85 + 0.15 × (AECI/100) yang menghasilkan skor mutu akhir AT-RQS = BWS × CF; engine triangulasi analitik (ARTI); engine asesmen keyakinan non-sirkular (AAC) yang diuji oleh validator skema deterministik independen; serta modul pembuktian asal-usul kriptografis yang mengonversi hasil evaluasi ke Canonical JSON (RFC 8785) dan ringkasan SHA-256 permanen. Invensi ini meniadakan bias sirkular evaluasi diri AI dan menghasilkan asesmen yang tahan manipulasi serta dapat diaudit secara independen."
      )
    ),

    // =========================================================================
    // PAGE 7: BAGIAN II - SPESIFIKASI GAMBAR TEKNIK PATEN (FIG. 1–3)
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN II: GAMBAR TEKNIK (FIG. 1 s/d FIG. 3)")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 7")
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "BAGIAN II: SPESIFIKASI 9 LEMBAR GAMBAR TEKNIK (FIG. 1–9)"),
      
      // FIG. 1
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 1 — DIAGRAM BLOK ARSITEKTUR SISTEM KOMPUTASI KESELURUHAN"),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f0f9ff', borderColor: '#0284c7', marginVertical: 3 }] },
          React.createElement(Text, { style: [styles.bold, { color: '#0369a1', textAlign: 'center' }] }, "[ 102 ] MODUL PENERIMA DOKUMEN NASKAH DIGITAL"),
          React.createElement(Text, { style: { fontSize: 6.8, textAlign: 'center', color: '#475569' } }, "Menerima file PDF/XML naskah penelitian dan metadata pendukung")
        ),
        React.createElement(Text, { style: { textAlign: 'center', color: '#64748b', fontSize: 7 } }, "|  (Data Input Stream)"),
        React.createElement(Text, { style: { textAlign: 'center', color: '#64748b', fontSize: 7 } }, "v"),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#ffffff', borderColor: '#0f172a', padding: 5, marginVertical: 2 }] },
          React.createElement(Text, { style: [styles.bold, { fontSize: 7.4, color: '#0f172a', marginBottom: 3 }] }, "[ 100 ] SISTEM KOMPUTASI ASESMEN DETERMINISTIK"),
          React.createElement(
            View,
            { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 } },
            React.createElement(View, { style: [styles.card, { width: '31%', padding: 3, marginVertical: 0 }] }, React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 106 ] PROSESOR (CPU/NPU)"), React.createElement(Text, { style: { fontSize: 6.2, color: '#475569' } }, "Eksekusi pipeline deterministik")),
            React.createElement(View, { style: [styles.card, { width: '31%', padding: 3, marginVertical: 0 }] }, React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 104 ] MEMORI BUFFER"), React.createElement(Text, { style: { fontSize: 6.2, color: '#475569' } }, "Penyimpan teks & token sementara")),
            React.createElement(View, { style: [styles.card, { width: '31%', padding: 3, marginVertical: 0 }] }, React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 110 ] BUS SISTEM / NETWORK"), React.createElement(Text, { style: { fontSize: 6.2, color: '#475569' } }, "Komunikasi data internal"))
          ),
          React.createElement(
            View,
            { style: [styles.card, { backgroundColor: '#f8fafc', padding: 4, marginVertical: 0 }] },
            React.createElement(Text, { style: { fontSize: 6.8, color: '#0f172a' } }, "• [ 200 ] Sub-Sistem Ekstraksi Tiga Kanal Independen (SCORE, SCREEN, CLUE)"),
            React.createElement(Text, { style: { fontSize: 6.8, color: '#0f172a' } }, "• [ 300 ] Engine Normalisasi Skala Deterministik [0, 100]"),
            React.createElement(Text, { style: { fontSize: 6.8, color: '#0f172a' } }, "• [ 400 ] Engine Pembobotan Matriks 7 Dimensi (BWS, Total Bobot 1.00)"),
            React.createElement(Text, { style: { fontSize: 6.8, color: '#0f172a' } }, "• [ 500 ] Modul Deteksi 5 Bukti (AECI) & Bounded Attenuation Engine (CF)"),
            React.createElement(Text, { style: { fontSize: 6.8, color: '#0f172a' } }, "• [ 600 ] Engine Triangulasi Konvergensi (ARTI) & Keyakinan Non-Sirkular (AAC)"),
            React.createElement(Text, { style: { fontSize: 6.8, color: '#0f172a' } }, "• [ 700 ] Modul Validator Skema Deterministik Independen (D_comp & E_cons)"),
            React.createElement(Text, { style: { fontSize: 6.8, color: '#0f172a' } }, "• [ 800 ] Modul Asal-Usul Kriptografis Kanonikal (RFC 8785 + SHA-256 Digest)")
          )
        ),
        React.createElement(Text, { style: { textAlign: 'center', color: '#64748b', fontSize: 7 } }, "|  (Snapshot Hashing & Storage)"),
        React.createElement(Text, { style: { textAlign: 'center', color: '#64748b', fontSize: 7 } }, "v"),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f0fdf4', borderColor: '#16a34a', marginVertical: 2 }] },
          React.createElement(Text, { style: [styles.bold, { color: '#16a34a', textAlign: 'center' }] }, "[ 108 ] MEDIA PENYIMPAN NON-TRANSITORI PERMANEN (LEDGER DATABASE)"),
          React.createElement(Text, { style: { fontSize: 6.8, textAlign: 'center', color: '#475569' } }, "Pencatatan snapshot immutable asesmen terverifikasi hash SHA-256 bertanda waktu")
        )
      ),

      // FIG. 2
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 2 — SUB-SISTEM EKSTRAKSI TIGA KANAL INDEPENDEN (TRI-SOURCE)"),
        React.createElement(Text, { style: { fontSize: 6.8, color: '#475569', marginBottom: 3 } }, "Aliran pemrosesan paralel dari dokumen naskah digital [ 102 ] ke tiga kanal analitik terisolasi:"),
        React.createElement(
          View,
          { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' } },
          React.createElement(
            View,
            { style: [styles.card, { width: '31%', backgroundColor: '#f8fafc', borderColor: '#cbd5e1', marginVertical: 0 }] },
            React.createElement(Text, { style: [styles.bold, { color: '#0369a1', fontSize: 7 }] }, "[ 202 ] KANAL SCORE"),
            React.createElement(Text, { style: { fontSize: 6.4 } }, "Skala Diskret Mentah 0–10"),
            React.createElement(Text, { style: { fontSize: 6.0, color: '#64748b' } }, "8 Rubrik: S1 s/d S8 (Relevansi, Struktur, Metodologi, Statistik, dll.)")
          ),
          React.createElement(
            View,
            { style: [styles.card, { width: '31%', backgroundColor: '#f8fafc', borderColor: '#cbd5e1', marginVertical: 0 }] },
            React.createElement(Text, { style: [styles.bold, { color: '#0369a1', fontSize: 7 }] }, "[ 204 ] KANAL SCREEN"),
            React.createElement(Text, { style: { fontSize: 6.4 } }, "Skala Ordinal Mentah 1–5"),
            React.createElement(Text, { style: { fontSize: 6.0, color: '#64748b' } }, "3 Dimensi: R1 s/d R3 (Kebaruan, Risiko Metodologi, Kejelasan)")
          ),
          React.createElement(
            View,
            { style: [styles.card, { width: '31%', backgroundColor: '#f8fafc', borderColor: '#cbd5e1', marginVertical: 0 }] },
            React.createElement(Text, { style: [styles.bold, { color: '#0369a1', fontSize: 7 }] }, "[ 206 ] KANAL CLUE"),
            React.createElement(Text, { style: { fontSize: 6.4 } }, "Ekstraksi Bukti Faktual"),
            React.createElement(Text, { style: { fontSize: 6.0, color: '#64748b' } }, "5 Elemen: C1 s/d C5 (CESS = ∑ wk × ck dari data empiris, sampel, batasan)")
          )
        )
      ),

      // FIG. 3
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 3 — ENGINE NORMALISASI SKALA DETERMINISTIK TERPADU"),
        React.createElement(Text, { style: { fontSize: 6.8, color: '#475569', marginBottom: 3 } }, "Pemetaan seluruh masukan heterogen ke Common Computational Domain [0, 100]:"),
        React.createElement(
          View,
          { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement(
            View,
            { style: [styles.card, { width: '30%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 302 ] Unit SCORE"),
            React.createElement(Text, { style: { fontSize: 6.2 } }, "S_norm = (S / 10) × 100")
          ),
          React.createElement(
            View,
            { style: [styles.card, { width: '30%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 304 ] Unit SCREEN"),
            React.createElement(Text, { style: { fontSize: 6.2 } }, "R_norm = ((R−1)/4) × 100")
          ),
          React.createElement(
            View,
            { style: [styles.card, { width: '30%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 306 ] Unit CLUE"),
            React.createElement(Text, { style: { fontSize: 6.2 } }, "C_norm = CESS (0–100)")
          )
        ),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f1f5f9', marginVertical: 3, padding: 3 }] },
          React.createElement(Text, { style: [styles.bold, { textAlign: 'center', fontSize: 6.8, color: '#0f172a' }] }, "COMMON COMPUTATIONAL DOMAIN: x_norm ∈ [0, 100] (Deterministik & Terstandarisasi)")
        )
      )
    ),

    // =========================================================================
    // PAGE 8: BAGIAN II - SPESIFIKASI GAMBAR TEKNIK PATEN (FIG. 4–6)
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN II: GAMBAR TEKNIK (FIG. 4 s/d FIG. 6)")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 8")
      ),

      // FIG. 4
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 4 — ENGINE PEMBOBOTAN MATRIKS 7 DIMENSI KUALITAS (BWS)"),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f8fafc', padding: 4, marginVertical: 2 }] },
          React.createElement(Text, { style: [styles.bold, { fontSize: 7 }] }, "[ 402 ] REGISTER BOBOT BAKU 7 DIMENSI SUBSTANTIF (∑ Wi = 1.00):"),
          React.createElement(Text, { style: { fontSize: 6.4, color: '#334155' } }, "• D1: Academic Contribution (W1 = 0.18)      • D5: Integrity & Transparency (W5 = 0.12)"),
          React.createElement(Text, { style: { fontSize: 6.4, color: '#334155' } }, "• D2: Procedural Rigor (W2 = 0.18)           • D6: Future Research Value (W6 = 0.10)"),
          React.createElement(Text, { style: { fontSize: 6.4, color: '#334155' } }, "• D3: Analytical Strength (W3 = 0.16)         • D7: Impact & Applicability (W7 = 0.14)"),
          React.createElement(Text, { style: { fontSize: 6.4, color: '#334155' } }, "• D4: Scholarly Communication (W4 = 0.12)")
        ),
        React.createElement(Text, { style: { textAlign: 'center', color: '#64748b', fontSize: 6.5 } }, "v  (Penjumlahan Terbobot Deterministik)"),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f0f9ff', borderColor: '#0284c7', padding: 4, marginVertical: 2 }] },
          React.createElement(Text, { style: [styles.bold, { color: '#0369a1', textAlign: 'center', fontSize: 7.2 }] }, "[ 404 ] AKUMULATOR BASE WEIGHTED SCORE (BWS)"),
          React.createElement(Text, { style: { fontSize: 6.6, textAlign: 'center', color: '#0f172a' } }, "BWS = ∑_{i=1}^{7} ( D_i × W_i ) ∈ [0, 100]")
        )
      ),

      // FIG. 5
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 5 — DETEKSI 5 BUKTI STRUKTURAL & BOUNDED ATTENUATION ENGINE"),
        React.createElement(
          View,
          { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement(
            View,
            { style: [styles.card, { width: '28%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 502 ] Deteksi 5 Pilar"),
            React.createElement(Text, { style: { fontSize: 6.0, color: '#475569' } }, "Tujuan, Metode, Sampel, Temuan, Batasan"),
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.2, color: '#0369a1' }] }, "N_det ∈ {0,1,2,3,4,5}")
          ),
          React.createElement(Text, { style: { fontSize: 7, color: '#64748b' } }, "──>"),
          React.createElement(
            View,
            { style: [styles.card, { width: '31%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 504 ] Komputator AECI"),
            React.createElement(Text, { style: { fontSize: 6.2 } }, "AECI = 100 × (N_det / 5)"),
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.2, color: '#0369a1' }] }, "AECI ∈ [0, 100]")
          ),
          React.createElement(Text, { style: { fontSize: 7, color: '#64748b' } }, "──>"),
          React.createElement(
            View,
            { style: [styles.card, { width: '31%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 506 ] Bounded CF Engine"),
            React.createElement(Text, { style: { fontSize: 6.2 } }, "CF = 0.85 + 0.15×(AECI/100)"),
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.2, color: '#0369a1' }] }, "CF ∈ [0.85, 1.00]")
          )
        ),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f0fdf4', borderColor: '#16a34a', marginVertical: 2, padding: 3 }] },
          React.createElement(Text, { style: [styles.bold, { textAlign: 'center', fontSize: 7, color: '#16a34a' }] }, "[ 508 ] PENGALI SKOR MUTU AKHIR: AT-RQS = BWS × CF   (Batas Redaman Maksimal 15%)")
        )
      ),

      // FIG. 6
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 6 — TOPOLOGI PEMISAHAN NON-SIRKULAR MUTU VS KEYAKINAN (AAC)"),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f8fafc', padding: 3, marginVertical: 1 }] },
          React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 602 ] KOMPUTATOR TRIANGULASI (ARTI):"),
          React.createElement(Text, { style: { fontSize: 6.2 } }, "ARTI = 100 − [ ( |S_norm − R_norm| + |S_norm − C_norm| ) / 2 ] ∈ [0, 100]")
        ),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f8fafc', padding: 3, marginVertical: 1 }] },
          React.createElement(Text, { style: [styles.bold, { fontSize: 6.8 }] }, "[ 606 ] KOMPUTATOR KEYAKINAN ASESMEN (AAC):"),
          React.createElement(Text, { style: { fontSize: 6.2 } }, "AAC = 0.50(ARTI) + 0.30(D_completeness) + 0.20(E_consistency) ∈ [0, 100%]")
        ),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#fef2f2', borderColor: '#ef4444', borderStyle: 'dashed', padding: 3, marginVertical: 2 }] },
          React.createElement(Text, { style: [styles.bold, { color: '#b91c1c', textAlign: 'center', fontSize: 6.8 }] }, "=== [ 604 ] ISOLASI MUTLAK NON-SIRKULAR: AAC \u2280 AT-RQS (Zero Circular Bias) ==="),
          React.createElement(Text, { style: { fontSize: 6.0, textAlign: 'center', color: '#7f1d1d' } }, "Nilai keyakinan AAC tidak pernah menjadi faktor pengali kualitas substantif AT-RQS")
        )
      )
    ),

    // =========================================================================
    // PAGE 9: BAGIAN II - SPESIFIKASI GAMBAR TEKNIK PATEN (FIG. 7–9)
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN II: GAMBAR TEKNIK (FIG. 7 s/d FIG. 9)")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 9")
      ),

      // FIG. 7
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 7 — MODUL VALIDATOR SKEMA DETERMINISTIK INDEPENDEN"),
        React.createElement(Text, { style: { fontSize: 6.8, color: '#475569', marginBottom: 3 } }, "Evaluasi integritas data berbasis aturan statis tanpa inferensi AI (Anti-Self-Assessment Bias):"),
        React.createElement(
          View,
          { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' } },
          React.createElement(
            View,
            { style: [styles.card, { width: '48%', backgroundColor: '#f8fafc', marginVertical: 0, padding: 4 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.8, color: '#0369a1' }] }, "[ 702 ] UNIT KELENGKAPAN SKEMA (D_comp)"),
            React.createElement(Text, { style: { fontSize: 6.2 } }, "Uji 8 Parameter Wajib Non-Null:"),
            React.createElement(Text, { style: { fontSize: 6.0, color: '#475569' } }, "D = ( ∑_{j=1}^{8} \uD835\uDF59(F_j ≠ ∅) / 8 ) × 100")
          ),
          React.createElement(
            View,
            { style: [styles.card, { width: '48%', backgroundColor: '#f8fafc', marginVertical: 0, padding: 4 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.8, color: '#0369a1' }] }, "[ 704 ] UNIT DIVERGENSI SILANG (E_cons)"),
            React.createElement(Text, { style: { fontSize: 6.2 } }, "Deviasi Rata-rata 3 Kanal Terstandarisasi:"),
            React.createElement(Text, { style: { fontSize: 6.0, color: '#475569' } }, "E = 100 − [ (|S−R| + |S−C| + |R−C|) / 3 ]")
          )
        )
      ),

      // FIG. 8
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 8 — MODUL PEMBUKTIAN ASAL-USUL KRIPTOGRAFIS PERMANEN"),
        React.createElement(
          View,
          { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement(
            View,
            { style: [styles.card, { width: '22%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.6 }] }, "[ 802 ] Kanonisasi"),
            React.createElement(Text, { style: { fontSize: 5.8, color: '#475569' } }, "RFC 8785 Canonical JSON")
          ),
          React.createElement(Text, { style: { fontSize: 7, color: '#64748b' } }, "──>"),
          React.createElement(
            View,
            { style: [styles.card, { width: '22%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.6 }] }, "[ 804 ] SHA-256"),
            React.createElement(Text, { style: { fontSize: 5.8, color: '#475569' } }, "256-bit Immutable Signature")
          ),
          React.createElement(Text, { style: { fontSize: 7, color: '#64748b' } }, "──>"),
          React.createElement(
            View,
            { style: [styles.card, { width: '22%', marginVertical: 0, padding: 3 }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.6 }] }, "[ 806 ] Identifier"),
            React.createElement(Text, { style: { fontSize: 5.8, color: '#475569' } }, "assessment_id + timestamp")
          ),
          React.createElement(Text, { style: { fontSize: 7, color: '#64748b' } }, "──>"),
          React.createElement(
            View,
            { style: [styles.card, { width: '22%', marginVertical: 0, padding: 3, backgroundColor: '#f0fdf4', borderColor: '#16a34a' }] },
            React.createElement(Text, { style: [styles.bold, { fontSize: 6.6, color: '#16a34a' }] }, "[ 808 ] Ledger"),
            React.createElement(Text, { style: { fontSize: 5.8, color: '#475569' } }, "Immutable Storage Database")
          )
        )
      ),

      // FIG. 9
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "FIG. 9 — DIAGRAM ALIR EKSEKUSI KOMPUTASI MENYELURUH (END-TO-END)"),
        React.createElement(
          View,
          { style: [styles.card, { backgroundColor: '#f8fafc', padding: 4, marginVertical: 1 }] },
          React.createElement(Text, { style: { fontSize: 6.4, color: '#0f172a', textAlign: 'center' } }, "[ 102 ] Input Naskah  ──>  [ 200 ] Tri-Source Ekstraksi  ──>  [ 300 ] Normalisasi [0, 100]  ──>  [ 400 ] BWS 7 Dimensi"),
          React.createElement(Text, { style: { fontSize: 6.4, color: '#64748b', textAlign: 'center', marginVertical: 1 } }, "│"),
          React.createElement(Text, { style: { fontSize: 6.4, color: '#0f172a', textAlign: 'center' } }, "[ 500 ] Deteksi 5 Pilar & Redaman CF  ──>  [ 600 ] Triangulasi ARTI & AAC  ──>  [ 800 ] RFC8785 + SHA-256 Ledger"),
          React.createElement(Text, { style: { fontSize: 6.4, color: '#64748b', textAlign: 'center', marginVertical: 1 } }, "│"),
          React.createElement(Text, { style: [styles.bold, { fontSize: 6.6, color: '#0284c7', textAlign: 'center' }] }, "[ 902 ] PENYEMATAN KARTU IDENTITAS PUBLIK: ASIA INDEX RECORD / DIGITAL QUALITY PASSPORT")
        )
      )
    ),

    // =========================================================================
    // PAGE 10: BAGIAN III - AUDIT ARSITEKTUR KLAIM & FALLBACK LADDER
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN III: AUDIT ARSITEKTUR KLAIM")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 10")
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "BAGIAN III: AUDIT 10 DIMENSI ARSITEKTUR KLAIM & FALLBACK LADDER"),
      
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Audit struktural 10 dimensi memastikan seluruh klaim 1–20 memiliki kepastian hukum (legal certainty), dukungan penuh (enablement), dan kekebalan dari penolakan formalitas:"
      ),

      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "Dimensi Pengujian"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '60%' }] }, "Hasil Evaluasi Teknis & Verifikasi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%' }] }, "Status Audit")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "1. Independent Claims"),
          React.createElement(Text, { style: [styles.tableCell, { width: '60%' }] }, "Klaim 1 (Sistem CII), Klaim 2 (Metode (a)-(h)), Klaim 3 (Medium) koresponden 100%"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%', color: '#16a34a' }] }, "🟢 PASSED")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "2. Antecedent Basis"),
          React.createElement(Text, { style: [styles.tableCell, { width: '60%' }] }, "Seluruh rujukan gramatikal memiliki pengenalan definitif sebelumnya (Zero Ambiguity)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%', color: '#16a34a' }] }, "🟢 PASSED")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "3. Structural vs Functional"),
          React.createElement(Text, { style: [styles.tableCell, { width: '60%' }] }, "Setiap modul didefinisikan masukan, transformasi deterministik, dan keluarannya"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%', color: '#16a34a' }] }, "🟢 PASSED")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "4. Mathematical Support"),
          React.createElement(Text, { style: [styles.tableCell, { width: '60%' }] }, "Formula tertutup (6.1 s/d 6.5b) terikat bebas konstanta tidak terjelaskan"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%', color: '#16a34a' }] }, "🟢 PASSED")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "5. Topological Isolation"),
          React.createElement(Text, { style: [styles.tableCell, { width: '60%' }] }, "Barrier mutlak: AAC tidak pernah menjadi faktor pengali formula AT-RQS"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%', color: '#16a34a' }] }, "🟢 PASSED")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "6. No Added Subject Matter"),
          React.createElement(Text, { style: [styles.tableCell, { width: '60%' }] }, "100% konsisten terhadap dokumen spesifikasi teknis dan gambar teknik FIG. 1–9"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%', color: '#16a34a' }] }, "🟢 PASSED")
        )
      ),

      React.createElement(Text, { style: styles.subSectionTitle }, "STRATEGI TANGGA PERTAHANAN (FALLBACK LADDER STRATEGY)"),
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.bold }, "• Fallback Level 1 (Penolakan Novelty Scoring Umum):"),
        React.createElement(Text, null, "  Amandemen Klaim 1 dengan menggabungkan Klaim 10 (5 Pilar AECI) + Klaim 11 (Batas CF [0.85, 1.00]). Tidak ada prior-art yang mengajarkan bounded feedforward attenuation."),
        React.createElement(Text, { style: [styles.bold, { marginTop: 4 }] }, "• Fallback Level 2 (Penolakan AI Evaluation Self-Confidence Bias):"),
        React.createElement(Text, null, "  Amandemen Klaim 1 dengan menggabungkan Klaim 8 (Isolasi BWS) + Klaim 14–16 (Schema Validator Non-AI D_comp & E_cons). Membuktikan isolasi topologis anti-sirkular."),
        React.createElement(Text, { style: [styles.bold, { marginTop: 4 }] }, "• Fallback Level 3 (Penolakan Keabsahan & Integritas Rekaman Data):"),
        React.createElement(Text, null, "  Amandemen Klaim 1 dengan menggabungkan Klaim 17 (RFC 8785 Canonical JSON) + Klaim 18–19 (SHA-256 Tamper-Evident Ledger).")
      )
    ),

    // =========================================================================
    // PAGE 11: BAGIAN IV - EPO PROBLEM-SOLUTION & DATA ABLASI EKSPERIMENTAL
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN IV: EPO PROBLEM-SOLUTION & ABLASI")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 11")
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "BAGIAN IV: EPO PROBLEM-SOLUTION & DATA ABLASI ($N=24$)"),
      
      React.createElement(Text, { style: styles.subSectionTitle }, "1. UJI 3 LANGKAH EPO PROBLEM-SOLUTION APPROACH"),
      React.createElement(
        Text,
        { style: styles.paragraph },
        "• Step 1 (Closest Prior Art / CPA): D1 (WO2020257780A1) atau D4 (WO2026072754A1).\n" +
        "• Step 2 (Objective Technical Problem / OTP): Bagaimana merancang arsitektur sistem komputasi evaluasi dokumen penelitian yang memproses data multi-skala heterogen untuk menghasilkan asesmen mutu yang tahan manipulasi (tamper-evident), mencegah pembengkakan skor akibat hilangnya bukti metodologis inti, serta meniadakan bias sirkular evaluasi diri (self-assessment bias) dari model AI generatif.\n" +
        "• Step 3 (Could-Would Test): PSITA yang menggabungkan D1 (lookup) + D2 (pembobotan AI) + D6 (triple checking) TIDAK AKAN TERDORONG menciptakan mekanisme atenuasi terikat non-linier [0.85, 1.00] atau pengisolasian mutlak skor keyakinan dari skor mutu substantif. Kombinasi rutin justru akan menghasilkan penalti ganda tak terbatas atau sistem sirkular."
      ),

      React.createElement(Text, { style: styles.subSectionTitle }, "2. DATA KOMPARATIF UJI ABLASI TEKNIS ($N=24$)"),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '28%' }] }, "Konfigurasi Model Evaluasi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%' }] }, "MAE Error"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '24%' }] }, "False High Score*"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%' }] }, "Circularity**"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "Kappa κ")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '28%' }] }, "Model A: D1 Saja (Lookup)"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "14.8 poin"),
          React.createElement(Text, { style: [styles.tableCell, { width: '24%' }] }, "37.5% (Cacat Bukti)"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "N/A"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "0.54")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '28%' }] }, "Model B: D1 + D2 (Linear AI)"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "10.2 poin"),
          React.createElement(Text, { style: [styles.tableCell, { width: '24%' }] }, "29.2%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "41.7% (Bias)"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "0.68")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '28%' }] }, "Model C: D1+D2 + Bounded CF"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "6.4 poin"),
          React.createElement(Text, { style: [styles.tableCell, { width: '24%' }] }, "8.3%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "33.3%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "0.79")
        ),
        React.createElement(
          View,
          { style: [styles.tableRow, { backgroundColor: '#f0fdf4' }] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '28%', color: '#16a34a' }] }, "Model D: FULL AT-RQS™"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%', color: '#16a34a' }] }, "3.8 poin"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '24%', color: '#16a34a' }] }, "0.0% (Teredam)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%', color: '#16a34a' }] }, "0.0% (Isolasi)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%', color: '#16a34a' }] }, "0.88")
        )
      ),

      React.createElement(Text, { style: styles.subSectionTitle }, "3. MATRIKS KETAHANAN KONDISI BATAS EKSTREM (EDGE-CASES DETERMINISM MATRIX)"),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "Kondisi Batas (Edge)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '18%' }] }, "Masukan Data"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '38%' }] }, "Transformasi Formula Deterministik"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "Nilai Output & Status")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "1. Dokumen Kosong Total"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "Teks & data = \u2205"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "N_det = 0 \u2192 AECI = 0.0, CF = 0.850, BWS = 0.0"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%', color: '#16a34a' }] }, "AT-RQS = 0.0 (Floor)")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "2. Data Parsial Minimal"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "1 dari 8 field ada"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "D = (1/8)\u00D7100 = 12.5%, AECI = 0.0, CF = 0.850"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%', color: '#16a34a' }] }, "AT-RQS \u2264 12, AAC \u2264 15%")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "3. Input Di Luar Batas"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "S = 15.0, R = -2.0"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "S_clamp = 10.0, R_clamp = 1.0 (Penjepit)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%', color: '#16a34a' }] }, "S_norm=100, R_norm=0")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "4. Divergensi Ekstrem"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "S=100, R=0, C=0"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "ARTI = 100 \u2212 [200/2] = 0.0, E_cons = 33.3"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%', color: '#16a34a' }] }, "ARTI = 0, AAC \u2264 20%")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%' }] }, "5. Konflik Lintas Kanal"),
          React.createElement(Text, { style: [styles.tableCell, { width: '18%' }] }, "S=80, R=40, C=60"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "Deviasi selisih absolut berpasangan tanpa acak"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '22%', color: '#16a34a' }] }, "ARTI = 70.0, E = 73.3")
        )
      )
    ),

    // =========================================================================
    // PAGE 12: BAGIAN V - SIMULASI SERANGAN PEMERIKSA & SANGGAHAN BERBUKTI
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN V: SIMULASI SERANGAN PEMERIKSA & BUKTI SANGGAHAN")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 12")
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "BAGIAN V: SIMULASI SERANGAN PEMERIKSA PATEN & SANGGAHAN BERBUKTI"),
      
      // SERANGAN 1
      React.createElement(
        View,
        { style: styles.warningBox },
        React.createElement(Text, { style: styles.bold }, "SERANGAN 1 (Pasal 4 UU Paten — Metode Matematika / Aturan Mental):"),
        React.createElement(Text, null, "Tuduhan: 'Klaim 1–3 sekadar metode matematika atau aturan mental evaluasi naskah tanpa efek teknis.'"),
        React.createElement(Text, { style: [styles.bold, { color: '#0369a1', marginTop: 2.5 }] }, "Sanggahan Hukum-Teknis:"),
        React.createElement(Text, null, "Invensi bukan penilaian mental manusia, melainkan arsitektur pemrosesan aliran data heterogen (CII) yang mengonversi naskah digital menjadi rekaman data terverifikasi permanen (tamper-evident verifiable data object) sesuai Penjelasan Pasal 4 UU No. 65 Tahun 2024."),
        React.createElement(Text, { style: [styles.bold, { color: '#16a34a', marginTop: 2.5 }] }, "BUKTI TEKNIS YANG DITUNJUKKAN (SHOWN EVIDENCE):"),
        React.createElement(Text, null, "• Bukti 1 (Hardware-Interacting Pipeline): Blok fisik modul penerima (102), prosesor CPU/NPU (106), memori buffer (104), dan media penyimpan non-transitori (108) pada FIG. 1 dan FIG. 9.\n• Bukti 2 (Kriptografi Terverifikasi): Pembangkitan representasi Canonical JSON (RFC 8785) dan 256-bit SHA-256 Digest bertanda waktu (FIG. 8 (802, 804, 806)) yang secara otomatis mendeteksi modifikasi retrospektif tidak sah (FIG. 8 (808)) — efek teknis yang mustahil dilakukan mental manusia.")
      ),

      // SERANGAN 2
      React.createElement(
        View,
        { style: styles.warningBox },
        React.createElement(Text, { style: styles.bold }, "SERANGAN 2 (Mosaicing D1 WO'780 + D2 US'973 — AI & Linear Scoring):"),
        React.createElement(Text, null, "Tuduhan: 'Penggabungan skoring D1 dan AI pembobotan multisinjal D2 adalah kombinasi yang jelas (obvious).'"),
        React.createElement(Text, { style: [styles.bold, { color: '#0369a1', marginTop: 2.5 }] }, "Sanggahan Hukum-Teknis:"),
        React.createElement(Text, null, "D1 dan D2 hanya mengajarkan penjumlahan linier sederhana. Invensi AT-RQS menghasilkan efek teknis non-linier tak terduga via Bounded Structural Feedforward Attenuation yang mengoreksi kehilangan bukti struktural tanpa penalti ganda linier."),
        React.createElement(Text, { style: [styles.bold, { color: '#16a34a', marginTop: 2.5 }] }, "BUKTI EMPIRIS & MATEMATIS YANG DITUNJUKKAN (SHOWN EVIDENCE):"),
        React.createElement(Text, null, "• Bukti 1 (Data Uji Komparatif N=24): Pada naskah tanpa bukti empiris (N_detected = 0), Model B (D1+D2) meloloskan skor palsu tinggi (False High Score 29.2%, skor 82.4), sedangkan AT-RQS Bounded Attenuation meredamnya deterministik via CF = 0.850 sehingga False High Score turun mutlak ke 0.0% (skor teratenuasi ke 70.04; MAE membaik dari 10.2 ke 3.8 poin; Tabel Bagian IV.2).\n• Bukti 2 (Formulasi Terikat Non-Linier): Formula CF = 0.85 + 0.15 × (AECI/100) ∈ [0.85, 1.00] pada FIG. 5 (506) yang membatasi penalti maksimal 15% secara terkendali.")
      ),

      // SERANGAN 3
      React.createElement(
        View,
        { style: styles.warningBox },
        React.createElement(Text, { style: styles.bold }, "SERANGAN 3 (Mosaicing D1 + D3 US'311 + D6 US'810 — Triple Check & Replicability):"),
        React.createElement(Text, null, "Tuduhan: 'Ekstraksi statistik D3 dan triple-check D6 membuat Tri-Source & AAC menjadi obvious.'"),
        React.createElement(Text, { style: [styles.bold, { color: '#0369a1', marginTop: 2.5 }] }, "Sanggahan Hukum-Teknis:"),
        React.createElement(Text, null, "D6 mengajarkan skor keyakinan langsung memodifikasi hasil akhir (memicu bias). Invensi AT-RQS secara topologis mengisolasi AAC dari AT-RQS secara non-sirkular dan mengevaluasi integritas via Validator Skema aturan kode independen."),
        React.createElement(Text, { style: [styles.bold, { color: '#16a34a', marginTop: 2.5 }] }, "BUKTI TOPOLOGI & ELIMINASI BIAS YANG DITUNJUKKAN (SHOWN EVIDENCE):"),
        React.createElement(Text, null, "• Bukti 1 (Data Eliminasi Circular Bias N=24): Pada halusinasi AI berkeyakinan tinggi (95%), D6 mendongkrak skor akhir secara keliru (Circularity Bias Rate 41.7%), sedangkan pada AT-RQS, Circularity Bias Rate tereliminasi menjadi mutlak 0.0% karena AAC terisolasi di luar formula AT-RQS (FIG. 6 (604)).\n• Bukti 2 (Schema Validator Non-AI): Parameter D_completeness (6.5a) dan E_consistency (6.5b) dievaluasi oleh aturan kode statis pada FIG. 7 (702, 704) tanpa model AI, menjamin zero self-assessment bias.")
      )
    ),

    // =========================================================================
    // PAGE 13: BAGIAN VI - PRIOR-ART CLAIM CHART & NOVELTY MATRIX
    // =========================================================================
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "DOSIR PATEN AT-RQS™ v1.0 • ASIA INTELLECTUAL PROPERTY"),
        React.createElement(Text, null, "BAGIAN VI: PRIOR-ART NOVELTY MATRIX")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Dossier Dokumen Induk Paten Terpadu — DJKI & PCT"),
        React.createElement(Text, null, "Halaman 13")
      ),

      React.createElement(Text, { style: styles.sectionTitle }, "BAGIAN VI: PRIOR-ART CLAIM CHART & NOVELTY MATRIX"),
      
      React.createElement(
        Text,
        { style: styles.paragraph },
        "Pemetaan fitur teknis F1–F9 terhadap 6 dokumen pembanding paten global membuktikan kebaruan (novelty) dan langkah inventif (inventive step):"
      ),

      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%' }] }, "Fitur Teknis Invensi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "D1 (WO'780)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "D2 (US'973)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "D3 (US'311)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "D4 (WO'754)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "D6 (US'810)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%' }] }, "Status Novelty")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%' }] }, "F1: Tri-Source Pipeline"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Database"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "AI+Crowd"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "NLP Single"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Pairwise"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "3 Sources"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#16a34a' }] }, "🟢 NOVEL")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%' }] }, "F2: Unified Normalization"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Linear"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Dynamic"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Proba"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Compar"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Conf Norm"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#16a34a' }] }, "🟢 NOVEL")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%' }] }, "F3: 7+1 APASIFIC Matrix"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Single"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Arbitrary"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Replicab"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Compar"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Accuracy"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#16a34a' }] }, "🟢 NOVEL")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%' }] }, "F4: 5 Pillars AECI"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Standard"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Feedback"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Stats"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Summary"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Entity"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#16a34a' }] }, "🟢 NOVEL")
        ),
        React.createElement(
          View,
          { style: [styles.tableRow, { backgroundColor: '#fefce8' }] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%', color: '#b45309' }] }, "F5: Bounded CF [0.85, 1.0]"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Linear"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Feedback"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Regression"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Margin"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Binary"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#b45309' }] }, "⭐ CORE STEP")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%' }] }, "F6: Triangulation ARTI"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Nihil"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Boost"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Nihil"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Delta"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Check"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#16a34a' }] }, "🟢 NOVEL")
        ),
        React.createElement(
          View,
          { style: [styles.tableRow, { backgroundColor: '#fefce8' }] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%', color: '#b45309' }] }, "F7: Non-Circular Isolation"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Mixed"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Mixed"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Proba"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Mixed"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Alters Trust"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#b45309' }] }, "⭐ CORE STEP")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%' }] }, "F8: Schema Validator Non-AI"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "AI Conf"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Crowd"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "ML"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "LLM Judge"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Static Rules"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#16a34a' }] }, "🟢 NOVEL")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '26%' }] }, "F9: RFC 8785 + SHA-256"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "RDBMS"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Web DB"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Logs"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Generic DB"),
          React.createElement(Text, { style: [styles.tableCell, { width: '12%' }] }, "Check"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#16a34a' }] }, "🟢 NOVEL")
        )
      ),

      React.createElement(
        View,
        { style: [styles.card, { marginTop: 6 }] },
        React.createElement(
          Text,
          { style: [styles.bold, { fontSize: 7.8, color: '#0f172a' }] },
          "CATATAN FORMAL PENUTUP DOSIR PATEN:"
        ),
        React.createElement(
          Text,
          { style: { fontSize: 7.2, color: '#475569' } },
          "Dosir ini mengunci seluruh portofolio kekayaan intelektual metodologi AT-RQS™ v1.0. Dokumen ini diserahkan kepada Konsultan Paten Terdaftar untuk penelaahan akhir menjelang pendaftaran resmi permohonan paten invensi ke Direktorat Jenderal Kekayaan Intelektual (DJKI) Kementerian Hukum dan HAM Republik Indonesia pada September 2026 dan pengajuan prioritas internasional PCT (WIPO)."
        )
      )
    )
  )
);

const outputPath1 = path.join(__dirname, '../public/docs/AT-RQS-Patent-Dossier-v1.0.pdf');
const outputPath2 = path.join(__dirname, '../public/AT-RQS-Patent-Dossier-v1.0.pdf');
const docsDir = path.dirname(outputPath1);

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

console.log("Compiling Comprehensive 13-Page Patent Dossier PDF v1.0...");
ReactPDF.render(React.createElement(PatentDossierPDF), outputPath1).then(() => {
  fs.copyFileSync(outputPath1, outputPath2);
  console.log("✓ Successfully created:", outputPath1);
  console.log("✓ Successfully created:", outputPath2);
  const stats = fs.statSync(outputPath1);
  console.log(`Patent Dossier PDF Size: ${(stats.size / 1024).toFixed(2)} KB`);
}).catch(err => {
  console.error("Error generating Patent Dossier PDF:", err);
  process.exit(1);
});
