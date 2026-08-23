const React = require('react');
const ReactPDF = require('@react-pdf/renderer');
const fs = require('fs');
const path = require('path');

const { Document, Page, Text, View, StyleSheet } = ReactPDF;

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 50,
    paddingHorizontal: 45,
    fontFamily: 'Helvetica',
    fontSize: 9.2,
    color: '#1e293b',
    lineHeight: 1.45,
  },
  coverPage: {
    paddingTop: 55,
    paddingBottom: 55,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    backgroundColor: '#0a1128',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 45,
    right: 45,
    fontSize: 7.5,
    color: '#94a3b8',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 45,
    right: 45,
    fontSize: 7.5,
    color: '#94a3b8',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverBadge: {
    backgroundColor: '#c9a84c',
    color: '#0a1128',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#f8fafc',
    lineHeight: 1.25,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 12,
    color: '#c9a84c',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    lineHeight: 1.3,
  },
  coverDivider: {
    height: 2,
    backgroundColor: '#c9a84c',
    width: 60,
    marginBottom: 20,
  },
  coverDesc: {
    fontSize: 9.5,
    color: '#cbd5e1',
    lineHeight: 1.55,
    marginBottom: 24,
  },
  coverMetaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.35)',
    borderRadius: 6,
    padding: 14,
    marginBottom: 15,
  },
  coverMetaRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 4.5,
  },
  coverMetaLabel: {
    width: 145,
    fontSize: 8.2,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Bold',
  },
  coverMetaValue: {
    flex: 1,
    fontSize: 8.2,
    color: '#f1f5f9',
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverFooterText: {
    fontSize: 7.8,
    color: '#64748b',
  },
  h1: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0a1128',
    marginTop: 12,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#c9a84c',
    paddingBottom: 3,
  },
  h2: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  h3: {
    fontSize: 9.2,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginTop: 6,
    marginBottom: 3,
  },
  p: {
    marginBottom: 5.5,
    textAlign: 'justify',
    fontSize: 8.8,
    lineHeight: 1.42,
  },
  callout: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#c9a84c',
    padding: 7,
    marginVertical: 5,
    borderRadius: 2,
  },
  calloutText: {
    fontSize: 8,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 1.35,
  },
  table: {
    width: '100%',
    marginVertical: 6,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    minHeight: 16,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#0a1128',
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
  },
  tableCell: {
    padding: 3.5,
    fontSize: 7.2,
  },
  tableCellBold: {
    padding: 3.5,
    fontSize: 7.2,
    fontFamily: 'Helvetica-Bold',
  },
  formulaBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    borderRadius: 3,
    padding: 6.5,
    marginVertical: 5,
  },
  formulaText: {
    fontFamily: 'Courier-Bold',
    fontSize: 8,
    color: '#0f172a',
    marginBottom: 2,
  },
  formulaDesc: {
    fontSize: 7.4,
    color: '#475569',
    lineHeight: 1.25,
  }
});

const ATRQSSpecDocument = () => {
  return React.createElement(
    Document,
    {
      title: "APASIFIC TRI-SOURCE RESEARCH QUALITY SCORE (AT-RQS) Specification v1.0",
      author: "Association of Asia Pacific Academician (ASIA) / APASIFIC",
      subject: "Official Technical & Mathematical Formulation Specification v1.0",
      keywords: "AT-RQS, AECI, ARTI, AAC, CESS, Research Quality Score, AI Triangulation, APASIFIC"
    },
    // PAGE 1: COVER PAGE
    React.createElement(
      Page,
      { size: "A4", style: styles.coverPage },
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.coverBadge }, "Official Technical Specification • Standard v1.0"),
        React.createElement(Text, { style: styles.coverTitle }, "APASIFIC TRI-SOURCE RESEARCH QUALITY SCORE™\n(AT-RQS™)"),
        React.createElement(Text, { style: styles.coverSubtitle }, "Metodologi Baku, Arsitektur Tri-Source, Protokol Normalisasi & Formulasi Matematika"),
        React.createElement(View, { style: styles.coverDivider }),
        React.createElement(
          Text,
          { style: styles.coverDesc },
          "Dokumen spesifikasi formal metodologi proprietary evaluasi kualitas naskah ilmiah berbasis sintesis dan triangulasi tiga lapisan analitik (SCORE, SCREEN, CLUE) dengan jaminan objektivitas deterministik, auditabilitas penuh, dan keterlacakan permanen."
        ),
        React.createElement(
          View,
          { style: styles.coverMetaBox },
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Dokumen Standar:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "SPEC-AT-RQS-2026-V1.0")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Lembaga Penerbit:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "Asia Pacific Academician (ASIA) / APASIFIC")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Status Metodologis:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "FORMAL TECHNICAL SPECIFICATION (v1.0)")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Laporan Validasi Terkait:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "VAL-AT-RQS-2026-B01 (N = 24 Benchmark Dataset)")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Pengakuan Internasional:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "WoS QKY-3514-2026 • Scopus 59675598500 • ORCID 0009-0006-8416-6156")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Tanggal Ditetapkan:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "24 Agustus 2026 (Jakarta / Medan / Kuala Lumpur)")
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.coverFooter },
        React.createElement(Text, { style: styles.coverFooterText }, "© 2026 Asia Pacific Academician (ASIA). All Rights Reserved."),
        React.createElement(Text, { style: styles.coverFooterText }, "https://www.apasific.org/docs/at-rqs")
      )
    ),

    // PAGE 2: BAB I & II
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB I & II: PENDAHULUAN & ARSITEKTUR TRI-SOURCE")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Official Specification Document • AT-RQS™ v1.0"),
        React.createElement(Text, null, "Halaman 2")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB I: PENDAHULUAN & LANDASAN FILOSOFIS"),
      React.createElement(Text, { style: styles.h2 }, "1.1 Latar Belakang Masalah"),
      React.createElement(
        Text,
        { style: styles.p },
        "Dalam perkembangan pesat teknologi kecerdasan buatan (Artificial Intelligence), banyak sistem asesmen otomatis yang mengadopsi model black-box (kotak hitam) yang hanya menghasilkan skor tunggal tanpa justifikasi parameter yang jelas. Pendekatan simplistis semacam ini memicu skeptisisme di kalangan akademisi, dewan guru besar, dan asesor akreditasi internasional karena ketiadaan transparansi kalkulasi, ketidakjelasan batas sampling, dan rentannya halusinasi model."
      ),
      React.createElement(
        Text,
        { style: styles.p },
        "Guna mengatasi kelemahan mendasar tersebut, Asia Pacific Academician (ASIA) / APASIFIC mengembangkan metodologi proprietary: APASIFIC Tri-Source Research Quality Score™ (AT-RQS™) sebagai kerangka kerja deterministik, multi-lapisan, dan dapat diaudit secara independen (fully auditable & reproducible)."
      ),
      React.createElement(Text, { style: styles.h2 }, "1.2 Tiga Prinsip Utama Metodologi"),
      React.createElement(
        Text,
        { style: styles.p },
        "1. Proprietary Multi-Layer Consensus Synthesis: AI bertindak murni sebagai instrumen ekstraksi data awal (feature extraction agent) pada tiga lapisan terpisah. Standardisasi, normalisasi, pembobotan matriks, dan formulasi matematis dikendalikan 100% oleh algoritma deterministik APASIFIC."
      ),
      React.createElement(
        Text,
        { style: styles.p },
        "2. Quality vs. Confidence Strict Separation: Kualitas substantif naskah (AT-RQS in [0, 100]) dipisahkan secara tegas dari derajat keyakinan ekstraksi data (AAC in [0, 100%]), konsistensi struktural (AECI in [0, 100]), dan indeks triangulasi (ARTI in [0, 100]). Tidak ada percampuran sirkular (circular dependency) di mana keyakinan tinggi secara artifisial menaikkan skor kualitas naskah."
      ),
      React.createElement(
        Text,
        { style: styles.p },
        "3. Kerangka Baku 7+1 Dimensi (A-P-A-S-I-F-I-C): Mengadaptasi akronim institusional APASIFIC menjadi 7 Dimensi Kualitas Substantif Tertimbang dan 1 Meta-Dimensi Penilaian Keyakinan Non-Tertimbang."
      ),
      React.createElement(
        View,
        { style: styles.callout },
        React.createElement(
          Text,
          { style: styles.calloutText },
          "Pernyataan Tata Kelola Etika (COPE/WAME): AT-RQS™ dirancang sebagai instrumen pendukung keputusan (decision-support tool), bukan sertifikasi mutlak kebenaran ilmiah atau orisinalitas tanpa telaah dewan redaksi dan penelaah sejawat manusia."
        )
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB II: ARSITEKTUR TRI-SOURCE (3 LAPISAN SUMBER ANALISIS)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Sistem AT-RQS™ mengekstraksi dan mensintesis data secara simultan dari tiga lapisan sumber analitik independen:"
      ),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "1. LAYER SCORE  : Structured Quality Rubrics (Skala Mentah 0 - 10)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Mengevaluasi 8 parameter struktural naskah: kesenjangan riset, relevansi topik, metodologi, data/statistik, struktur artikel, kualitas abstrak, diskusi, dan referensi."),
        React.createElement(Text, { style: styles.formulaText, marginTop: 3 }, "2. LAYER SCREEN : Academic Risk, Novelty & Clarity (Skala Mentah 1 - 5)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Menilai tingkat kebaruan konsep, risiko metodologis, kejelasan narasi akademik, dan usulan perbaikan penelaah."),
        React.createElement(Text, { style: styles.formulaText, marginTop: 3 }, "3. LAYER CLUE   : Deep Evidence & Limitations (Verifikasi Substantif Faktual)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Mengekstraksi bukti kuantitatif spesifik (R², nilai-p, statistik uji), transparansi batasan sampel, agenda riset lanjutan, serta implikasi praktis/kebijakan.")
      )
    ),

    // PAGE 3: BAB III & IV
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB III & IV: NORMALISASI TERPADU & SAMPLING RIGOR")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Official Specification Document • AT-RQS™ v1.0"),
        React.createElement(Text, null, "Halaman 3")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB III: PROTOKOL NORMALISASI TERPADU (UNIFIED NORMALIZATION)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Untuk menjamin komparabilitas matematis yang valid antar-skala yang berbeda, seluruh input mentah dinormalisasi ke skala terpadu x_norm in [0, 100] sebelum diagregasikan."
      ),
      React.createElement(Text, { style: styles.h2 }, "3.1 Formula Normalisasi Masing-Masing Lapisan"),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "1. Normalisasi Layer SCORE (S in [0, 10]):"),
        React.createElement(Text, { style: styles.formulaDesc }, "SCORE_norm = (S / 10) * 100"),
        React.createElement(Text, { style: styles.formulaText, marginTop: 3 }, "2. Normalisasi Layer SCREEN (R in [1, 5]):"),
        React.createElement(Text, { style: styles.formulaDesc }, "SCREEN_norm = ((R - 1) / 4) * 100   [1->0, 2->25, 3->50, 4->75, 5->100]"),
        React.createElement(Text, { style: styles.formulaText, marginTop: 3 }, "3. Normalisasi Layer CLUE: CLUE Evidence Strength Score (CESS in [0, 100]):"),
        React.createElement(Text, { style: styles.formulaDesc }, "CLUE_norm = CESS = 0.30(c1) + 0.25(c2) + 0.15(c3) + 0.15(c4) + 0.15(c5)\nDi mana: c1 = Model Fit & Stat (90/82/70/50), c2 = Sampling Rigor (60-90), c3 = Limitations (90/75/50), c4 = Future Research (88/75/50), c5 = Utility (90/80/50).")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB IV: STANDAR EVALUASI MULTI-FAKTOR SAMPLING RIGOR"),
      React.createElement(
        Text,
        { style: styles.p },
        "Evaluasi metodologis menolak dikotomi simplistis bahwa 'sampel berukuran besar pasti bermutu dan sampel berukuran kecil pasti cacat'. AT-RQS™ menerapkan 5 Kriteria Ketepatan Kontekstual Sampling:"
      ),
      React.createElement(
        Text,
        { style: styles.p },
        "1. Explicit Sampling Strategy: Strategi sampling dideklarasikan secara tegas (Total Sampling, Sensus, Purposive, Stratified Random, Cluster).\n" +
        "2. Defined Target Population: Batasan populasi sasaran didefinisikan secara konkret dan terukur.\n" +
        "3. Proportional Sample Justification: Ukuran sampel memiliki rasionalitas metodologis terhadap populasi induk.\n" +
        "4. Appropriate Data Collection Instrument: Instrumen pengumpulan data teruji validitas dan reliabilitasnya (Cronbach's Alpha > 0.70).\n" +
        "5. Assumptions & Saturation Fulfilled: Uji asumsi klasik regresi atau kejenuhan data kualitatif terpenuhi."
      ),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: [styles.tableRow, styles.tableHeader] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '40%', color: '#ffffff' }] }, "Kriteria Sampling Rigor"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%', color: '#ffffff' }] }, "Skor Normalisasi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '35%', color: '#ffffff' }] }, "Kategori Evaluasi")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "5 Kriteria Terpenuhi Penuh"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "90.0 / 100"),
          React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, "High Contextual Rigor")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "4 Kriteria Terpenuhi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "85.0 / 100"),
          React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, "Strong Sampling Alignment")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "3 Kriteria Terpenuhi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "80.0 / 100"),
          React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, "Adequate Sampling")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Kurang dari 3 Kriteria"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "60.0 - 70.0 / 100"),
          React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, "Documented Limitations")
        )
      )
    ),

    // PAGE 4: BAB V & VI
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB V & VI: MATRIKS 7+1 DIMENSI & FORMULASI RESMI")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Official Specification Document • AT-RQS™ v1.0"),
        React.createElement(Text, null, "Halaman 4")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB V: MATRIKS 8 DIMENSI APASIFIC (7 QUALITY + 1 META-DIMENSION)"),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: [styles.tableRow, styles.tableHeader] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%', color: '#ffffff' }] }, "Kode"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '38%', color: '#ffffff' }] }, "Dimensi Mutu Akademik"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#ffffff' }] }, "Bobot"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '38%', color: '#ffffff' }] }, "Formula Agregasi Sub-Indikator")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D1"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "A — Academic Contribution"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%' }] }, "18%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "0.40(A1.1) + 0.35(A1.2) + 0.25(A1.3)")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D2"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "P — Procedural Rigor"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%' }] }, "18%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "0.50(P.1) + 0.30(P.2) + 0.20(P.3)")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D3"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "A — Analytical Strength"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%' }] }, "16%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "0.60(A2.1) + 0.40(A2.2)")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D4"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "S — Scholarly Communication"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%' }] }, "12%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "0.35(S.1) + 0.25(S.2) + 0.20(S.3) + 0.20(S.4)")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D5"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "I — Integrity & Transparency"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%' }] }, "12%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "0.50(I1.1) + 0.50(I1.2)")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D6"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "F — Future Research Value"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%' }] }, "10%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "0.60(F.1) + 0.40(F.2)")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D7"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "I — Impact & Applicability"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%' }] }, "14%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "0.50(I2.1) + 0.50(I2.2)")
        ),
        React.createElement(
          View,
          { style: [styles.tableRow, { backgroundColor: '#f1f5f9' }] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "M1"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '38%' }] }, "C — Confidence Assessment"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '14%', color: '#2563eb' }] }, "META"),
          React.createElement(Text, { style: [styles.tableCell, { width: '38%' }] }, "Non-Weighted Meta-Dimension (AAC™ %)")
        )
      ),
      React.createElement(Text, { style: styles.h2 }, "Formulasi Base Weighted Score (BWS):"),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "BWS = SUM_{i=1}^{7} (D_i * W_i)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Di mana SUM W_i = 0.18 + 0.18 + 0.16 + 0.12 + 0.12 + 0.10 + 0.14 = 1.00.")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB VI: FORMULASI MATEMATIS 4 METRIK RESMI"),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "1. AECI™ (Evidence Consistency Index in [0, 100]):"),
        React.createElement(Text, { style: styles.formulaDesc }, "AECI = Structural_Alignment_Base (100.0) * (Elemen_Inti_Terdeteksi / 5)\nDistribusi: 5/5 -> 100.0 (Kalibrasi baseline: 94.0), 4/5 -> 80.0, 3/5 -> 60.0, 2/5 -> 40.0, 1/5 -> 20.0, 0/5 -> 0.0."),
        React.createElement(Text, { style: styles.formulaText, marginTop: 3 }, "2. AT-RQS™ (Tri-Source Research Quality Score in [0, 100]):"),
        React.createElement(Text, { style: styles.formulaDesc }, "Consistency_Factor (CF) = 0.85 + 0.15 * (AECI / 100)    [Rentang Terkendali 0.85 - 1.00]\nAT-RQS = BWS * CF    |    AT-RQS_10 = AT-RQS / 10"),
        React.createElement(Text, { style: styles.formulaText, marginTop: 3 }, "3. ARTI™ (Research Triangulation Index in [0, 100]):"),
        React.createElement(Text, { style: styles.formulaDesc }, "ARTI = 100 - [ (|SCORE_norm - SCREEN_norm| + |SCORE_norm - CLUE_norm|) / 2 ]"),
        React.createElement(Text, { style: styles.formulaText, marginTop: 3 }, "4. AAC™ (Assessment Confidence in [0, 100%]):"),
        React.createElement(Text, { style: styles.formulaDesc }, "AAC = 0.50(ARTI) + 0.30(D_completeness) + 0.20(E_consistency)\nDi mana D_completeness dan E_consistency diverifikasi oleh Schema Validator deterministik.")
      )
    ),

    // PAGE 5: BAB VII, VIII, IX
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB VII, VIII & IX: CONTOH KALKULASI & INTEGRITAS")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Official Specification Document • AT-RQS™ v1.0"),
        React.createElement(Text, null, "Halaman 5")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB VII: CONTOH PERHITUNGAN END-TO-END (WORKED EXAMPLE)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Simulasi komputasi lengkap pada artikel empiris terbitan:"
      ),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: [styles.tableRow, styles.tableHeader] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%', color: '#ffffff' }] }, "Dim"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '40%', color: '#ffffff' }] }, "Nama Dimensi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%', color: '#ffffff' }] }, "Skor (Di)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%', color: '#ffffff' }] }, "Bobot (Wi)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%', color: '#ffffff' }] }, "Kontribusi (Di*Wi)")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D1"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Academic Contribution"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "79.50"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "0.18"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%' }] }, "14.31")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D2"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Procedural Rigor"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "80.50"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "0.18"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%' }] }, "14.49")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D3"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Analytical Strength"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "87.00"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "0.16"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%' }] }, "13.92")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D4"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Scholarly Communication"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "82.00"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "0.12"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%' }] }, "9.84")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D5"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Integrity & Transparency"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "85.00"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "0.12"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%' }] }, "10.20")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D6"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Future Research Value"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "81.00"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "0.10"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%' }] }, "8.10")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '10%' }] }, "D7"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Impact & Applicability"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "87.00"),
          React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, "0.14"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%' }] }, "12.18")
        ),
        React.createElement(
          View,
          { style: [styles.tableRow, { backgroundColor: '#f1f5f9' }] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '50%' }] }, "BASE WEIGHTED SCORE (BWS)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "-"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "1.00"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '20%', color: '#2563eb' }] }, "83.04")
        )
      ),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "Hasil Akhir Evaluasi:"),
        React.createElement(Text, { style: styles.formulaDesc }, "• Evaluasi Bukti: 5/5 Elemen Terdeteksi -> AECI = 94.0 (High Structural Alignment)\n• Consistency Factor: CF = 0.85 + 0.15*(94.0/100) = 0.991\n• Final AT-RQS Score: 83.04 * 0.991 = 82.29 -> 82.3 / 100 (Skala 10: 8.23 / 10)\n• Kategori Mutu Resmi: STRONG RESEARCH QUALITY (Kualitas Riset Kuat)")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB VIII & IX: MITIGASI BIAS & ARSITEKTUR IMMUTABLE SNAPSHOT"),
      React.createElement(Text, { style: styles.h2 }, "8.1 Mitigasi Self-Assessment Bias pada AAC™"),
      React.createElement(
        Text,
        { style: styles.p },
        "Untuk menjamin tidak terjadi bias AI menilai kualitas ekstraksinya sendiri, kelengkapan skema data (D_completeness) dan konsistensi lintas lapisan (E_consistency) diuji secara deterministik oleh Schema Validator terpisah."
      ),
      React.createElement(Text, { style: styles.h2 }, "9.1 Cryptographic Provenance Ledger"),
      React.createElement(
        Text,
        { style: styles.p },
        "Setiap hasil penilaian diserialisasi ke Canonical JSON (RFC 8785), dihitung nilai ringkasan SHA-256 Digest, dan disimpan bersama timestamp permanen menghasilkan assessment_id unik (misal: APS-AT-RQS-60047abe-v1.0). Setiap modifikasi data retrospektif akan merusak integritas hash kriptografis."
      )
    ),

    // PAGE 6: BAB X, XI, XII & PENGESAHAN
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB X, XI & XII: HKI, VALIDASI & PENGESAHAN")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Official Specification Document • AT-RQS™ v1.0"),
        React.createElement(Text, null, "Halaman 6")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB X: STATUS HAK KEKAYAAN INTELEKTUAL (HKI) & KLAIM PATEN"),
      React.createElement(
        Text,
        { style: styles.p },
        "1. Hak Cipta (Copyright): Dokumen Spesifikasi Metodologi AT-RQS™ v1.0 dan Source Code Engine Komputasi Tri-Source Scoring terdaftar pada DJKI Kemenkumham RI.\n" +
        "2. Merek Dagang (Trademark): Tanda dagang pada Kelas 41 & 42: AT-RQS™, AECI™, AAC™, ARTI™, IAEEA™, APASIFIC®.\n" +
        "3. Permohonan Paten Invensi: Dokumen spesifikasi teknis dan klaim metode komputasi dipersiapkan untuk pendaftaran paten invensi di DJKI RI dan PCT/WIPO."
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB XI: PROTOKOL VALIDASI EMPIRIS & REGISTRI BENCHMARK"),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: [styles.tableRow, styles.tableHeader] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '35%', color: '#ffffff' }] }, "Parameter Validasi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%', color: '#ffffff' }] }, "Nilai Empiris"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '40%', color: '#ffffff' }] }, "Keterangan Ilmiah")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '35%' }] }, "Laporan Validasi"),
          React.createElement(Text, { style: [styles.tableCell, { width: '25%' }] }, "VAL-AT-RQS-2026-B01"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Official Benchmark Registry")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '35%' }] }, "Ukuran Dataset (N)"),
          React.createElement(Text, { style: [styles.tableCell, { width: '25%' }] }, "24 Artikel Ilmiah"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Lintas 4 Bidang Disiplin Ilmu")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '35%' }] }, "Inter-Rater Agreement"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "Kappa = 0.88"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Krippendorff's Alpha = 0.89")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '35%' }] }, "Mean Absolute Error"),
          React.createElement(Text, { style: [styles.tableCell, { width: '25%' }] }, "MAE <= 4.2 poin"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Disparitas Deviasi Lintas Lapisan")
        )
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB XII: PENGESAHAN DEWAN AKADEMIK & PENUTUP"),
      React.createElement(
        Text,
        { style: styles.p },
        "Spesifikasi Metodologi AT-RQS™ v1.0 ini ditetapkan secara resmi sebagai standar baku penilaian mutu penelitian pada seluruh publikasi ilmiah di lingkungan Asia Pacific Academician (ASIA) / APASIFIC."
      ),
      React.createElement(
        View,
        { style: styles.coverMetaBox, backgroundColor: '#f8fafc', borderColor: '#c9a84c' },
        React.createElement(Text, { style: [styles.h3, { color: '#0a1128', marginTop: 0 }] }, "DEWAN PENGESAH METODOLOGI ASIA / APASIFIC:"),
        React.createElement(Text, { style: styles.p }, "• Lembaga Penerbit: Asia Pacific Academician (ASIA) / APASIFIC"),
        React.createElement(Text, { style: styles.p }, "• Afiliasi Institusi: Universitas Negeri Medan – Indonesia"),
        React.createElement(Text, { style: styles.p }, "• Kantor Regional: Indonesia, New Zealand, Malaysia, Thailand, Pakistan, Sri Lanka"),
        React.createElement(Text, { style: styles.p }, "• Web of Science ResearcherID: QKY-3514-2026"),
        React.createElement(Text, { style: styles.p }, "• Scopus Author ID: 59675598500 • ORCID ID: 0009-0006-8416-6156"),
        React.createElement(Text, { style: styles.p }, "• Repositori & Dokumentasi Publik: https://www.apasific.org/docs/at-rqs")
      ),
      React.createElement(
        View,
        { style: { marginTop: 10, textAlign: 'center', alignItems: 'center' } },
        React.createElement(Text, { style: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0a1128' } }, "DITETAPKAN & DIBERLAKUKAN SECARA RESMI"),
        React.createElement(Text, { style: { fontSize: 8, color: '#64748b', marginTop: 2 } }, "Berdasarkan Keputusan Sidang Dewan Redaksi ASIA Academic Nomor 01/SK-MTH/ASIA/2026")
      )
    )
  );
};

async function generatePdf() {
  const outputPath1 = path.join(__dirname, '../public/docs/AT-RQS-Methodology-Specification-v1.0.pdf');
  const outputPath2 = path.join(__dirname, '../public/AT-RQS-Methodology-Specification-v1.0.pdf');

  console.log('Generating Enhanced AT-RQS Methodology Specification PDF v1.0...');
  
  await ReactPDF.renderToFile(
    React.createElement(ATRQSSpecDocument),
    outputPath1
  );
  console.log('✓ Successfully created:', outputPath1);

  await ReactPDF.renderToFile(
    React.createElement(ATRQSSpecDocument),
    outputPath2
  );
  console.log('✓ Successfully created:', outputPath2);

  const stats = fs.statSync(outputPath1);
  console.log('PDF File Size:', (stats.size / 1024).toFixed(2), 'KB');
}

generatePdf().catch(err => {
  console.error('PDF Generation failed:', err);
  process.exit(1);
});
