const React = require('react');
const ReactPDF = require('@react-pdf/renderer');
const fs = require('fs');
const path = require('path');

const { Document, Page, Text, View, StyleSheet, Image, Link, Font } = ReactPDF;

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 50,
    paddingHorizontal: 45,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#1e293b',
    lineHeight: 1.5,
  },
  coverPage: {
    paddingTop: 60,
    paddingBottom: 60,
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
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#f8fafc',
    lineHeight: 1.25,
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 13,
    color: '#c9a84c',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 25,
    lineHeight: 1.3,
  },
  coverDivider: {
    height: 2,
    backgroundColor: '#c9a84c',
    width: 60,
    marginBottom: 25,
  },
  coverDesc: {
    fontSize: 10,
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: 30,
  },
  coverMetaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
  },
  coverMetaRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 5,
  },
  coverMetaLabel: {
    width: 140,
    fontSize: 8.5,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Bold',
  },
  coverMetaValue: {
    flex: 1,
    fontSize: 8.5,
    color: '#f1f5f9',
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverFooterText: {
    fontSize: 8,
    color: '#64748b',
  },
  h1: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#0a1128',
    marginTop: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#c9a84c',
    paddingBottom: 4,
  },
  h2: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginTop: 10,
    marginBottom: 5,
  },
  h3: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginTop: 8,
    marginBottom: 3,
  },
  p: {
    marginBottom: 7,
    textAlign: 'justify',
    fontSize: 9.5,
    lineHeight: 1.45,
  },
  callout: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#c9a84c',
    padding: 9,
    marginVertical: 7,
    borderRadius: 2,
  },
  calloutText: {
    fontSize: 8.5,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginVertical: 8,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    minHeight: 18,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#0a1128',
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  tableCell: {
    padding: 4.5,
    fontSize: 7.8,
  },
  tableCellBold: {
    padding: 4.5,
    fontSize: 7.8,
    fontFamily: 'Helvetica-Bold',
  },
  formulaBox: {
    backgroundColor: '#f1f5f9',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 8,
    marginVertical: 6,
  },
  formulaText: {
    fontFamily: 'Courier-Bold',
    fontSize: 8.5,
    color: '#0f172a',
    marginBottom: 3,
  },
  formulaDesc: {
    fontSize: 7.8,
    color: '#475569',
    lineHeight: 1.3,
  },
  badgePill: {
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 3,
    alignSelf: 'flex-start',
  }
});

const ATRQSSpecDocument = () => {
  return React.createElement(
    Document,
    {
      title: "APASIFIC TRI-SOURCE RESEARCH QUALITY SCORE (AT-RQS) Specification v1.0",
      author: "Association of Asia Pacific Academician (ASIA) / APASIFIC",
      subject: "Official Methodology & Mathematical Formulation Specification",
      keywords: "AT-RQS, AECI, ARTI, AAC, Research Quality Score, AI Triangulation, APASIFIC"
    },
    // PAGE 1: COVER
    React.createElement(
      Page,
      { size: "A4", style: styles.coverPage },
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.coverBadge }, "Official Specification • v1.0 Standard"),
        React.createElement(Text, { style: styles.coverTitle }, "APASIFIC TRI-SOURCE RESEARCH QUALITY SCORE™\n(AT-RQS™)"),
        React.createElement(Text, { style: styles.coverSubtitle }, "Metodologi Baku, Arsitektur Tri-Source & Spesifikasi Formulasi Matematika"),
        React.createElement(View, { style: styles.coverDivider }),
        React.createElement(
          Text,
          { style: styles.coverDesc },
          "Dokumen spesifikasi formal metodologi proprietary evaluasi kualitas naskah ilmiah berbasis sintesis dan triangulasi tiga lapisan analitik (SCORE, SCREEN, CLUE) dengan jaminan objektivitas, transparansi, dan keterlacakan permanen."
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
            React.createElement(Text, { style: styles.coverMetaLabel }, "Penerbit Resmi:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "Asia Pacific Academician (ASIA) / APASIFIC")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Klasifikasi HKI / Paten:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "Computer-Implemented Research Assessment Invention")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Status Metodologis:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "APPROVED & FROZEN BASELINE (v1.0)")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Pemberlakuan:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "Seluruh Jurnal Akademik di Ekosistem APASIFIC")
          ),
          React.createElement(
            View,
            { style: styles.coverMetaRow },
            React.createElement(Text, { style: styles.coverMetaLabel }, "Tanggal Rilis:"),
            React.createElement(Text, { style: styles.coverMetaValue }, "Agustus 2026 (Jakarta / Medan / Kuala Lumpur)")
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.coverFooter },
        React.createElement(Text, { style: styles.coverFooterText }, "© 2026 Association of Asia Pacific Academician. All Rights Reserved."),
        React.createElement(Text, { style: styles.coverFooterText }, "https://apasific.org • info@apasific.org")
      )
    ),

    // PAGE 2: BAB 1 & BAB 2
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB I & II: PENDAHULUAN & ARSITEKTUR")
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
        "Dalam perkembangan pesat teknologi kecerdasan buatan (Artificial Intelligence), banyak sistem evaluasi otomatis yang menerapkan model black-box (kotak hitam) yang hanya menghasilkan skor tunggal tanpa justifikasi parameter yang jelas. Pendekatan simplistis semacam ini memicu skeptisisme di kalangan akademisi, dewan guru besar, dan asesor akreditasi internasional karena ketiadaan transparansi kalkulasi, ketidakjelasan batas sampling, dan rentannya halusinasi model."
      ),
      React.createElement(
        Text,
        { style: styles.p },
        "Guna mengatasi kelemahan mendasar tersebut, Asia Pacific Academician (ASIA) / APASIFIC mengembangkan metodologi proprietary: APASIFIC Tri-Source Research Quality Score™ (AT-RQS™) sebagai kerangka kerja penilaian mutu karya ilmiah yang komprehensif, multi-dimensi, dan dapat diaudit secara permanen."
      ),
      React.createElement(Text, { style: styles.h2 }, "1.2 Tiga Prinsip Utama AT-RQS™"),
      React.createElement(
        Text,
        { style: styles.p },
        "1. Bukan Sekadar Skor AI (Proprietary Consensus Methodology): AI bertindak murni sebagai instrumen ekstraksi data analitis awal pada tiga lapisan independen. Standardisasi, normalisasi, pembobotan matriks, dan formulasi matematis dikendalikan secara deterministik oleh algoritma baku APASIFIC."
      ),
      React.createElement(
        Text,
        { style: styles.p },
        "2. Pemisahan Kualitas vs Kepercayaan (Quality vs. Confidence Separation): Skor mutu substantif penelitian (AT-RQS™) dipisahkan secara tegas dari indeks konsistensi bukti (AECI™), derajat triangulasi (ARTI™), dan tingkat keyakinan komputasi (AAC™) untuk mencegah circularity matematika."
      ),
      React.createElement(
        Text,
        { style: styles.p },
        "3. Matriks 8 Dimensi Berbasis Akronim Baku (A-P-A-S-I-F-I-C): Mentransformasikan nama institusi APASIFIC menjadi 8 dimensi mutu akademik yang terukur dan terdistribusi secara seimbang."
      ),
      React.createElement(
        View,
        { style: styles.callout },
        React.createElement(
          Text,
          { style: styles.calloutText },
          "Pernyataan Tata Kelola: AT-RQS™ dirancang sebagai indikator asesmen mutu naskah, bukan sertifikasi mutlak kebenaran ilmiah atau orisinalitas tanpa telaah manusia. Metodologi ini memperkuat dan melengkapi proses double-blind peer-review manusia."
        )
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB II: ARSITEKTUR TIGA LAPISAN ANALITIK (TRI-SOURCE)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Sistem AT-RQS™ mengekstraksi dan mensintesis data secara simultan dari tiga lapisan sumber analitik independen:"
      ),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "1. LAYER SCORE  : Structured Quality Rubrics (Skala 0 - 10)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Mengevaluasi 8 rubrik struktural: kesenjangan riset, relevansi topik, metodologi, data/statistik, struktur artikel, kualitas abstrak, diskusi, dan referensi."),
        React.createElement(Text, { style: styles.formulaText, marginTop: 4 }, "2. LAYER SCREEN : Academic Risk, Novelty & Clarity (Skala 1 - 5)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Menilai tingkat kebaruan konsep, risiko metodologis, kejelasan narasi akademik, dan usulan perbaikan penelaah."),
        React.createElement(Text, { style: styles.formulaText, marginTop: 4 }, "3. LAYER CLUE   : Deep Evidence & Limitations (Verifikasi Substantif)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Mengekstraksi temuan kuantitatif spesifik (R², nilai-p, statistik uji), transparansi batasan sampel, agenda riset lanjutan, serta implikasi praktis/kebijakan.")
      )
    ),

    // PAGE 3: BAB 3 & BAB 4
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB III & IV: EVIDENCE REGISTRY & 8 DIMENSI")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Official Specification Document • AT-RQS™ v1.0"),
        React.createElement(Text, null, "Halaman 3")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB III: SCORING EVIDENCE REGISTRY & SAMPLING RIGOR"),
      React.createElement(Text, { style: styles.h2 }, "3.1 Evaluasi 5 Faktor Sampling Rigor (Multi-Factor Rubric)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Untuk mencegah bias simplistis seperti menganggap sampel besar selalu unggul dan sampel kecil selalu cacat, AT-RQS™ mengadopsi 5 Kriteria Ketepatan Kontekstual Sampling:"
      ),
      React.createElement(
        Text,
        { style: styles.p },
        "• Kriteria 1: Strategi sampling dideklarasikan secara eksplisit (Total Sampling, Purposive, Stratified, Random, Sensus).\n" +
        "• Kriteria 2: Batasan populasi sasaran didefinisikan secara tegas dan terukur.\n" +
        "• Kriteria 3: Jumlah sampel memiliki justifikasi rasional yang memadai terhadap populasi induk.\n" +
        "• Kriteria 4: Metode pengumpulan data sesuai dengan instrumen dan desain riset.\n" +
        "• Kriteria 5: Uji asumsi klasik, validitas-reliabilitas, atau derajat saturasi data terpenuhi."
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
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "90 / 100"),
          React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, "High Contextual Rigor")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "4 Kriteria Terpenuhi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "85 / 100"),
          React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, "Strong Sampling Alignment")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "3 Kriteria Terpenuhi"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "80 / 100"),
          React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, "Adequate Sampling")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Kurang dari 3 Kriteria"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '25%' }] }, "60 - 70 / 100"),
          React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, "Documented Limitations")
        )
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB IV: MATRIKS 8 DIMENSI MUTU APASIFIC"),
      React.createElement(
        Text,
        { style: styles.p },
        "Matriks A-P-A-S-I-F-I-C membagi kualitas riset ke dalam 7 Dimensi Tertimbang (Total Bobot = 100%) dan 1 Meta-Dimensi Non-Tertimbang:"
      ),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: [styles.tableRow, styles.tableHeader] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%', color: '#ffffff' }] }, "Kode"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '40%', color: '#ffffff' }] }, "Dimensi Mutu Akademik"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%', color: '#ffffff' }] }, "Bobot"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '33%', color: '#ffffff' }] }, "Fokus Penilaian")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "A1"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Academic Contribution"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "18%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, "Novelty & Research Gap Rigor")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "P"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Procedural Rigor"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "18%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, "Metodologi & Sampling Design")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "A2"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Analytical Strength"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "16%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, "Uji Statistik & Model Robustness")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "S"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Scholarly Communication"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "12%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, "Struktur IMRAD, Abstrak & Sitasi")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "I1"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Integrity & Transparency"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "12%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, "Keterbukaan Keterbatasan Naskah")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "F"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Future Research Value"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "10%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, "Agenda Riset Lanjutan & Gap")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "I2"),
          React.createElement(Text, { style: [styles.tableCell, { width: '40%' }] }, "Impact & Applicability"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%' }] }, "14%"),
          React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, "Manfaat Praktis & Kebijakan")
        ),
        React.createElement(
          View,
          { style: [styles.tableRow, { backgroundColor: '#f8fafc' }] },
          React.createElement(Text, { style: [styles.tableCellBold, { width: '12%' }] }, "C"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '40%' }] }, "Confidence Assessment (AAC™)"),
          React.createElement(Text, { style: [styles.tableCellBold, { width: '15%', color: '#2563eb' }] }, "META"),
          React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, "Non-Weighted Triangulation Index")
        )
      )
    ),

    // PAGE 4: BAB 5 FORMULASI MATEMATIS
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB V: FORMULASI MATEMATIS 4 METRIK RESMI")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Official Specification Document • AT-RQS™ v1.0"),
        React.createElement(Text, null, "Halaman 4")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB V: FORMULASI MATEMATIS 4 METRIK RESMI"),
      
      React.createElement(Text, { style: styles.h2 }, "5.1 🛡️ AECI™ (APASIFIC Evidence Consistency Index)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Mengukur keselarasan vertikal alur naskah: Tujuan ↔ Metode ↔ Temuan ↔ Kesimpulan ↔ Keterbatasan."
      ),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "AECI = Alignment_Score (94.0) × Evidence_Coverage_Factor (ECF)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Di mana ECF = (Elemen Inti Terdeteksi / 5). Naskah dengan 5 elemen lengkap menghasilkan skor AECI = 94.0 (High Structural Alignment).")
      ),

      React.createElement(Text, { style: styles.h2 }, "5.2 🥇 AT-RQS™ (APASIFIC Tri-Source Research Quality Score)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Skor akhir kualitas menerapkan Bounded Consistency Adjustment dalam rentang terkendali [0.85, 1.00]:"
      ),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "Consistency_Factor (CF) = 0.85 + 0.15 × (AECI / 100)"),
        React.createElement(Text, { style: styles.formulaText }, "AT-RQS = Base_Weighted_Score × CF"),
        React.createElement(Text, { style: styles.formulaDesc }, "Base_Weighted_Score dihitung dari penjumlahan terbobot 7 dimensi mutu (Total Bobot = 100%).")
      ),

      React.createElement(Text, { style: styles.h3 }, "Tingkatan Mutu Resmi (Official Quality Categories):"),
      React.createElement(
        Text,
        { style: styles.p },
        "• AT-RQS ≥ 88.0 : EXEMPLARY RESEARCH RIGOR (Sangat Unggul)\n" +
        "• 80.0 ≤ AT-RQS < 88.0 : STRONG RESEARCH QUALITY (Kualitas Riset Kuat)\n" +
        "• 70.0 ≤ AT-RQS < 80.0 : GOOD RESEARCH QUALITY (Kualitas Riset Baik)\n" +
        "• 60.0 ≤ AT-RQS < 70.0 : SATISFACTORY WITH LIMITATIONS (Cukup dengan Keterbatasan)\n" +
        "• AT-RQS < 60.0 : PRELIMINARY EVIDENCE (Bukti Awal)"
      ),

      React.createElement(Text, { style: styles.h2 }, "5.3 📊 ARTI™ (APASIFIC Research Triangulation Index)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Mengukur konvergensi dan tingkat kesepakatan antar 3 lapisan independen:"
      ),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "ARTI = 100 - [ (|SCORE_norm - SCREEN_norm| + |SCORE_norm - CLUE_norm|) / 2 ]"),
        React.createElement(Text, { style: styles.formulaDesc }, "Menghasilkan indeks kesepakatan triangulasi dalam rentang 0 – 100.")
      ),

      React.createElement(Text, { style: styles.h2 }, "5.4 ◈ AAC™ (APASIFIC Assessment Confidence)"),
      React.createElement(
        Text,
        { style: styles.p },
        "Mengukur tingkat kelengkapan dan keandalan data riset dalam menghasilkan asesmen:"
      ),
      React.createElement(
        View,
        { style: styles.formulaBox },
        React.createElement(Text, { style: styles.formulaText }, "AAC = 0.50(ARTI) + 0.30(Data_Completeness) + 0.20(Extraction_Consistency)"),
        React.createElement(Text, { style: styles.formulaDesc }, "Dinyatakan dalam persentase keyakinan (misal: 94% Tri-Source Consensus).")
      )
    ),

    // PAGE 5: BAB 6 & 7 TATA KELOLA, HKI & PENGESAHAN
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, null, "APASIFIC ACADEMIC • SPEC-AT-RQS-2026-V1.0"),
        React.createElement(Text, null, "BAB VI & VII: TATA KELOLA, HKI & PENGESAHAN")
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, "Official Specification Document • AT-RQS™ v1.0"),
        React.createElement(Text, null, "Halaman 5")
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB VI: TATA KELOLA ETIKA, SNAPSHOT & KLAIM HKI / PATEN"),
      React.createElement(Text, { style: styles.h2 }, "6.1 Standar Etika Publikasi Ilmiah"),
      React.createElement(
        Text,
        { style: styles.p },
        "Sesuai standar Committee on Publication Ethics (COPE) dan World Association of Medical Editors (WAME), seluruh hasil asesmen AT-RQS™ bersifat adil, bebas bias komersial, dan mencantumkan pernyataan tata kelola transparan pada setiap kartu profil publikasi artikel."
      ),
      React.createElement(Text, { style: styles.h2 }, "6.2 Skema Immutable Snapshot"),
      React.createElement(
        Text,
        { style: styles.p },
        "Setiap artikel yang dipublikasikan mengunci snapshot data evaluasi permanen (assessment_id, timestamp ISO 8601, profil 8 dimensi, bukti primer/sekunder, dan batasan terdokumentasi) pada database relasional yang tidak dapat dimanipulasi secara retrospektif."
      ),
      React.createElement(Text, { style: styles.h2 }, "6.3 Perlindungan Hak Kekayaan Intelektual & Klaim Paten"),
      React.createElement(
        Text,
        { style: styles.p },
        "Seluruh formulasi metodologi, matriks 8 dimensi A-P-A-S-I-F-I-C, algoritma triangulasi ARTI™, formula konsistensi bukti AECI™, dan arsitektur engine komputasi ini dilindungi oleh Hak Cipta Ciptaan Karya Tulis Ilmiah, Ciptaan Program Komputer, serta Invensi Paten Sistem Komputerisasi (DJKI Kemenkumham RI / WIPO)."
      ),
      React.createElement(Text, { style: styles.h1 }, "BAB VII: PENGESAHAN DEWAN AKADEMIK & REPOSITORI RESMI"),
      React.createElement(
        Text,
        { style: styles.p },
        "Spesifikasi Metodologi AT-RQS™ v1.0 ini telah melalui proses telaah, pengujian komputasi, dan validasi empiris oleh Dewan Redaksi dan Komite Metodologi Asia Pacific Academician (ASIA)."
      ),
      React.createElement(
        View,
        { style: styles.coverMetaBox, backgroundColor: '#f8fafc', borderColor: '#c9a84c' },
        React.createElement(Text, { style: [styles.h3, { color: '#0a1128', marginTop: 0 }] }, "DEWAN PENGESAH METODOLOGI ASIA / APASIFIC:"),
        React.createElement(Text, { style: styles.p }, "• Lembaga Penerbit: Asia Pacific Academician (ASIA) / APASIFIC"),
        React.createElement(Text, { style: styles.p }, "• Kantor Regional: Indonesia, New Zealand, Malaysia, Thailand, Pakistan, Sri Lanka"),
        React.createElement(Text, { style: styles.p }, "• Web of Science ResearcherID: QKY-3514-2026"),
        React.createElement(Text, { style: styles.p }, "• Scopus Author ID: 59675598500 • ORCID: 0009-0006-8416-6156"),
        React.createElement(Text, { style: styles.p }, "• Repositori & Dokumentasi: https://www.apasific.org/docs/at-rqs")
      ),
      React.createElement(
        View,
        { style: { marginTop: 15, textAlign: 'center', alignItems: 'center' } },
        React.createElement(Text, { style: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0a1128' } }, "DITETAPKAN & DIBERLAKUKAN SECARA RESMI"),
        React.createElement(Text, { style: { fontSize: 8, color: '#64748b', marginTop: 2 } }, "Berdasarkan Keputusan Sidang Dewan Redaksi ASIA Academic Nomor 01/SK-MTH/ASIA/2026")
      )
    )
  );
};

async function generatePdf() {
  const outputPath1 = path.join(__dirname, '../public/docs/AT-RQS-Methodology-Specification-v1.0.pdf');
  const outputPath2 = path.join(__dirname, '../public/AT-RQS-Methodology-Specification-v1.0.pdf');

  console.log('Generating AT-RQS Methodology Specification PDF...');
  
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
