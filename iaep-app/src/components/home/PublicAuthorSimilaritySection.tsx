'use client';

import React, { useState, useEffect } from 'react';
import { 
  removeBibliography, 
  extractParagraphs, 
  countWords, 
  checkParagraphPlagiarism,
  PlagiarismResult,
  PlagiarismReport 
} from '@/lib/plagiarism';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  Download, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  BookOpen, 
  Quote, 
  Sparkles,
  X,
  ExternalLink
} from 'lucide-react';

const SAMPLE_ACADEMIC_TEXT = `Pendidikan tinggi di era transformasi digital menuntut integrasi teknologi yang komprehensif dalam kurikulum pembelajaran. Berbagai institusi pendidikan mulai mengadopsi model pembelajaran hibrida untuk meningkatkan fleksibilitas dan daya serap mahasiswa.

Menurut Smith et al. (2020), "adopsi platform digital terbukti meningkatkan partisipasi aktif mahasiswa hingga sebesar 45 persen dalam kegiatan diskusi ilmiah daring". Temuan ini sejalan dengan penelitian terdahulu yang menggarisbawahi efektivitas blended learning dalam meningkatkan retensi konsep.

Metode penelitian yang digunakan adalah pendekatan kuantitatif dengan desain cross-sectional empirical. Populasi penelitian mencakup seluruh mahasiswa aktif semester genap dengan teknik stratified random sampling pada tiga fakultas utama.

DAFTAR PUSTAKA
Smith, J., Rahman, A., & Widodo, B. (2020). Digital Learning in Higher Education. Journal of Education and Technology, 12(3), 45-60.
Danil, M., & Rahman, F. (2023). Empirical Research Methods in Social Sciences. Academic Press.`;

export default function PublicAuthorSimilaritySection() {
  const [inputText, setInputText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleLoadSample = () => {
    setInputText(SAMPLE_ACADEMIC_TEXT);
    setReport(null);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setInputText('');
    setReport(null);
    setProgress(0);
    setIsModalOpen(false);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsChecking(true);
    setProgress(0);
    setReport(null);

    // 1. Abaikan bagian Daftar Pustaka / Referensi secara otomatis
    const cleanText = removeBibliography(inputText);

    // 2. Ekstraksi batas paragraf alami semantik
    const paragraphs = extractParagraphs(cleanText);
    const total = paragraphs.length;

    if (total === 0) {
      setIsChecking(false);
      const emptyReport: PlagiarismReport = {
        totalParagraphs: 0,
        checkedParagraphs: 0,
        plagiarizedParagraphs: 0,
        plagiarismPercentage: 0,
        riskSignalSummary: 'NO_HIGH_RISK_SIGNAL',
        results: []
      };
      setReport(emptyReport);
      setIsModalOpen(true);
      return;
    }

    const results: PlagiarismResult[] = [];
    let highRiskCount = 0;
    let reviewCount = 0;
    let totalScoreSum = 0;

    for (let i = 0; i < total; i++) {
      const paragraph = paragraphs[i];
      const pWordCount = countWords(paragraph);
      const otherParagraphs = paragraphs.filter((_, idx) => idx !== i);

      // Evaluasi per-paragraf dengan CML & deteksi sitasi (Khusus Penulis, tanpa Clue Review)
      const checkResult = await checkParagraphPlagiarism(paragraph, otherParagraphs);
      
      const isHighRisk = checkResult.classification === 'HIGH_RISK_SIGNAL';
      const isReview = checkResult.classification === 'CONTEXT_REVIEW';

      if (isHighRisk) highRiskCount++;
      if (isReview) reviewCount++;
      totalScoreSum += (checkResult.similarityScore || 0);

      results.push({
        sentence: paragraph,
        isPlagiarized: isHighRisk,
        wordCount: pWordCount,
        continuousMatchLength: checkResult.continuousMatchLength,
        sources: checkResult.sources,
        similarityScore: checkResult.similarityScore,
        classification: checkResult.classification,
        citationContext: checkResult.citationContext,
        editorialNote: checkResult.editorialNote,
        phrasesChecked: checkResult.phrasesChecked
      });

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    const avgScore = Math.round(totalScoreSum / total);
    const riskSignalSummary: 'NO_HIGH_RISK_SIGNAL' | 'REVIEW_RECOMMENDED' | 'HIGH_RISK_SIGNAL_DETECTED' = 
      highRiskCount > 0 || avgScore > 20
        ? 'HIGH_RISK_SIGNAL_DETECTED' 
        : (reviewCount > 0 ? 'REVIEW_RECOMMENDED' : 'NO_HIGH_RISK_SIGNAL');

    const generatedReport: PlagiarismReport = {
      totalParagraphs: paragraphs.length,
      checkedParagraphs: results.length,
      plagiarizedParagraphs: highRiskCount,
      plagiarismPercentage: avgScore,
      riskSignalSummary,
      results
    };

    setReport(generatedReport);
    setIsChecking(false);
    setIsModalOpen(true); // Otomatis membuka modal pop-up hasil
  };

  const handleDownloadReport = () => {
    if (!report) return;

    let content = `APASIFIC SIMILARITY CONTEXT ANALYSIS™ - LAPORAN PEMERIKSAAN MANDIRI PENULIS\n`;
    content += `========================================================================================\n`;
    content += `Waktu Pemeriksaan     : ${new Date().toLocaleString()}\n`;
    content += `Total Paragraf Dinilai: ${report.totalParagraphs}\n`;
    content += `Indeks Similaritas    : ${report.plagiarismPercentage}%\n`;
    content += `Paragraf Risiko Tinggi: ${report.plagiarizedParagraphs} paragraf\n`;
    content += `Status Sinyal Global  : ${report.riskSignalSummary}\n`;
    content += `Ambang Baku Evaluasi  : Minimal 20 kata identik berturut-turut tanpa sitasi inline\n`;
    content += `Aturan Otomatis       : Bagian Daftar Pustaka & Kutipan Bersitasi Resmi Diabaikan\n`;
    content += `========================================================================================\n\n`;
    content += `DISCLAIMER INTEGRITAS AKADEMIK (APASIFIC MASTER ARCHITECTURE v1.0):\n`;
    content += `Laporan ini adalah alat bantu kepatuhan mandiri bagi penulis sebelum menyerahkan naskah.\n`;
    content += `Platform menganut filosofi: "Similarity -> Context -> Attribution -> Editorial Review".\n`;
    content += `Sistem ini tidak memuat putusan plagiarisme otomatis; pertimbangan akhir berada pada Dewan Redaksi.\n\n`;
    content += `RINCIAN PER PARAGRAF:\n`;
    content += `----------------------------------------------------------------------------------------\n\n`;

    report.results.forEach((r, idx) => {
      content += `[Paragraf #${idx + 1}] (${r.wordCount} kata) | Klasifikasi: ${r.classification} | CML: ${r.continuousMatchLength || 0} kata\n`;
      content += `Teks: ${r.sentence}\n`;
      if (r.editorialNote) content += `Catatan Kepatuhan: ${r.editorialNote}\n`;
      if (r.citationContext?.hasInlineCitation) {
        content += `Sitasi Terdeteksi : ${r.citationContext.citationSnippets.join(', ')}\n`;
      }
      if (r.sources && r.sources.length > 0) {
        content += `Sinyal Asal       : ${r.sources.join(', ')}\n`;
      }
      content += `\n----------------------------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APASIFIC_Laporan_Kepatuhan_Penulis_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section author-similarity-section py-12 relative overflow-hidden" id="author-plagiarism-checker">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Main Card */}
        <div className="w-full bg-[#0a0a16] border border-[#c9a84c]/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden text-gray-200">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c9a84c]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-gray-800/80 pb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#c9a84c]/15 text-[#e8c97a] border border-[#c9a84c]/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c9a84c]" />
                  Layanan Mandiri Penulis
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Khusus Penulis &bull; Bebas Clue Reviewer
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-3 font-serif">
                Uji Integritas &amp; <span className="text-[#c9a84c]">Similaritas Naskah</span> Mandiri
              </h3>
              <p className="text-sm text-gray-400 mt-2 max-w-3xl leading-relaxed">
                Fasilitas uji mandiri pra-penyerahan naskah. Mesin secara otomatis <strong>mengabaikan Daftar Pustaka</strong>, 
                mengenali <strong>sitasi ilmiah bersumber resmi</strong>, dan mengevaluasi kontinuitas kata identik (CML &ge; 20 kata).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#121324] hover:bg-[#1a1b32] text-gray-300 hover:text-white border border-gray-700/60 transition-all flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-[#c9a84c]" />
                {showExplanation ? 'Tutup Penjelasan Sistem' : 'Keterangan Sistem Lengkap'}
              </button>
            </div>
          </div>

          {/* System Explanation Panel (Collapsible) */}
          {showExplanation && (
            <div className="mt-6 p-6 bg-[#0e0f1f] border border-[#c9a84c]/20 rounded-2xl space-y-4 animate-in fade-in duration-300 relative z-10 text-xs text-gray-300 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-sm text-[#e8c97a]">
                <BookOpen className="w-4 h-4" />
                Spesifikasi &amp; Filosofi Sistem Plagiarisme APASIFIC (Master Architecture v1.0)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-black/40 rounded-xl border border-gray-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#c9a84c]">1. Filosofi &amp; Kedaulatan Editorial</h4>
                  <p>
                    <strong>Similarity &rarr; Context &rarr; Attribution &rarr; Editorial Review:</strong> Platform tidak menggunakan vonis otomatis biner (&quot;plagiat/tidak&quot;). Sistem menyediakan sinyal kontekstual bagi penulis agar menyempurnakan naskah secara mandiri.
                  </p>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-gray-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#c9a84c]">2. Aturan Baku CML &amp; Sitasi</h4>
                  <p>
                    <strong>CML (Continuous Match Length) &ge; 20 kata:</strong> Rangkaian kata identik berturut-turut tanpa sitasi inline ditandai sebagai risiko tinggi. Sitasi ilmiah (Author-Date, Naratif, Numerik) dan kutipan langsung resmi otomatis diakui sebagai atribusi sah.
                  </p>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-gray-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#c9a84c]">3. Pembersihan Referensi Otomatis</h4>
                  <p>
                    Bagian <code>DAFTAR PUSTAKA / REFERENSI / BIBLIOGRAPHY</code> diabaikan secara cerdas agar judul buku, nama jurnal, dan daftar pengarang tidak menaikkan indeks kemiripan naskah secara keliru.
                  </p>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-gray-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#c9a84c]">4. Independen &amp; Khusus Penulis</h4>
                  <p>
                    Sistem ini terisolasi dari modul petunjuk reviewer (AI Clue Review). Naskah Anda tidak disimpan permanen atau dibagikan ke pihak ketiga, menjamin kerahasiaan draf penelitian Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Input Form */}
          <div className="mt-8 space-y-4 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <label htmlFor="manuscript-input" className="font-bold text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#c9a84c]" />
                Tempel Teks Draf Naskah (Abstrak, Pendahuluan, atau Pembahasan):
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[#c9a84c] hover:text-[#e8c97a] hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Muat Contoh Teks
                </button>
                {inputText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-red-400 flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Bersihkan
                  </button>
                )}
                <span className="text-gray-500 font-mono">
                  {wordCount} kata
                </span>
              </div>
            </div>

            <textarea
              id="manuscript-input"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tempel draf artikel ilmiah Anda di sini (minimal 30 kata)... Termasuk kutipan atau daftar pustaka (sistem akan otomatis memilah dan membersihkannya)."
              className="w-full bg-[#05050d] border border-gray-800 focus:border-[#c9a84c] rounded-2xl p-4 sm:p-5 text-gray-200 text-sm leading-relaxed placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50 transition font-sans"
            />

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Info className="w-4 h-4 text-[#c9a84c] flex-shrink-0" />
                <span>Hasil pengecekan akan ditampilkan secara mendalam dalam jendela Pop-up interaktif.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {report && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#181932] hover:bg-[#222446] text-[#e8c97a] border border-[#c9a84c]/40 transition flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Hasil Pop-up
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isChecking || wordCount < 10}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#b8953c] hover:to-[#d8b868] text-black shadow-lg shadow-[#c9a84c]/20 hover:shadow-[#c9a84c]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isChecking ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Menganalisis ({progress}%)...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Mulai Analisis Mandiri
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar Animation */}
            {isChecking && (
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mt-3">
                <div 
                  className="bg-gradient-to-r from-[#c9a84c] to-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Quick Result Banner (if report is ready and modal closed) */}
            {report && !isModalOpen && !isChecking && (
              <div className="mt-4 p-4 bg-[#101224] border border-[#c9a84c]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      Analisis Selesai &bull; Indeks Kemiripan: 
                      <span className={`font-mono text-sm ${
                        report.plagiarismPercentage > 20 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {report.plagiarismPercentage}%
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {report.totalParagraphs} paragraf dinilai &bull; {report.plagiarizedParagraphs} paragraf berisiko tinggi (CML &ge; 20 kata).
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#c9a84c] hover:bg-[#b8953c] text-black transition flex items-center gap-1.5 shadow-md shadow-[#c9a84c]/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Modal Hasil Lengkap
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
           MODAL POP-UP HASIL CEK PLAGIARISME MANDIRI PENULIS
      ═══════════════════════════════════════════════════════════════════ */}
      {isModalOpen && report && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
          
          <div className="bg-[#0b0c18] border border-[#c9a84c]/40 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.9)] relative overflow-hidden text-gray-200 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-gray-800 bg-[#0e0f20] flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white font-serif tracking-wide">
                      Hasil Uji Integritas &amp; Similaritas Naskah
                    </h3>
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Author Self-Check
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Laporan evaluasi per-paragraf alami &bull; Bebas Clue Reviewer &bull; Evaluasi diskresi editorial
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition border border-gray-700/60 flex-shrink-0"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-grow custom-scrollbar">
              
              {/* 4 Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Clean Similarity Index */}
                <div className="bg-[#121426] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                  <div className="text-xs text-gray-400 font-medium">Indeks Kemiripan Bersih</div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-3xl font-black font-mono ${
                      report.plagiarismPercentage > 20 ? 'text-red-400' : report.plagiarismPercentage > 10 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {report.plagiarismPercentage}%
                    </span>
                    <span className="text-xs text-gray-400">rata-rata</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    {report.plagiarismPercentage <= 20 ? '✓ Dalam ambang wajar' : '⚠ Melebihi ambang 20%'}
                  </div>
                </div>

                {/* Metric 2: Total Paragraphs Checked */}
                <div className="bg-[#121426] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                  <div className="text-xs text-gray-400 font-medium">Total Paragraf Dinilai</div>
                  <div className="text-3xl font-black font-mono text-white mt-2">
                    {report.totalParagraphs}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    Daftar pustaka dilewati otomatis
                  </div>
                </div>

                {/* Metric 3: Flagged High Risk */}
                <div className="bg-[#121426] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                  <div className="text-xs text-gray-400 font-medium">Paragraf Risiko Tinggi</div>
                  <div className={`text-3xl font-black font-mono mt-2 ${
                    report.plagiarizedParagraphs > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {report.plagiarizedParagraphs}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    {report.plagiarizedParagraphs > 0 ? 'CML ≥ 20 kata tanpa sitasi' : '✓ Nol tumpang tindih'}
                  </div>
                </div>

                {/* Metric 4: Risk Signal Summary */}
                <div className="bg-[#121426] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                  <div className="text-xs text-gray-400 font-medium">Status Sinyal Kepatuhan</div>
                  <div className="mt-2">
                    {report.riskSignalSummary === 'NO_HIGH_RISK_SIGNAL' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Siap Submit Resmi
                      </span>
                    )}
                    {report.riskSignalSummary === 'REVIEW_RECOMMENDED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Disarankan Parafrase
                      </span>
                    )}
                    {report.riskSignalSummary === 'HIGH_RISK_SIGNAL_DETECTED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Perlu Revisi Sitasi
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    Bukan vonis otomatis
                  </div>
                </div>

              </div>

              {/* Action Banner inside Modal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#14162a] border border-[#c9a84c]/20 rounded-2xl">
                <div className="text-xs text-gray-300">
                  <span className="font-bold text-white">Arsip Mandiri Penulis:</span> Unduh lembar laporan kepatuhan resmi atau lanjutkan proses submit artikel.
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1d1f3d] hover:bg-[#272a52] text-white border border-gray-700/80 transition flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c9a84c]" />
                    Unduh Laporan (.TXT)
                  </button>
                  <a
                    href="/dashboard/submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#c9a84c] hover:bg-[#b8953c] text-black transition flex items-center justify-center gap-2 shadow-md shadow-[#c9a84c]/20 flex-1 sm:flex-initial"
                  >
                    Lanjutkan ke Submit
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Detailed Paragraph Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <Quote className="w-4 h-4 text-[#c9a84c]" />
                    Rincian Evaluasi Paragraf ({report.results.length} Paragraf):
                  </h4>
                  <span className="text-xs text-gray-500">
                    Berdasarkan aturan CML &ge; 20 kata dan atribusi sitasi
                  </span>
                </div>

                <div className="space-y-3">
                  {report.results.map((res, index) => {
                    const isHigh = res.classification === 'HIGH_RISK_SIGNAL';
                    const isReview = res.classification === 'CONTEXT_REVIEW';

                    return (
                      <div 
                        key={index}
                        className={`p-4 rounded-xl border text-xs transition leading-relaxed ${
                          isHigh 
                            ? 'bg-red-950/20 border-red-500/40 text-red-100' 
                            : isReview
                            ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
                            : 'bg-emerald-950/15 border-emerald-500/30 text-emerald-100'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-800/60 mb-2">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            Paragraf #{index + 1}
                            <span className="text-[11px] font-normal text-gray-400">
                              ({res.wordCount} kata &bull; CML: {res.continuousMatchLength || 0} kata)
                            </span>
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isHigh 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : isReview
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {isHigh ? 'Risiko Tinggi' : isReview ? 'Perlu Parafrase' : 'Atribusi Bersih'}
                          </span>
                        </div>

                        <p className="text-gray-300 font-serif text-sm">
                          &quot;{res.sentence}&quot;
                        </p>

                        <div className="mt-3 pt-2 border-t border-gray-800/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                          <div>
                            <span className="font-semibold text-gray-300">Catatan Sistem: </span>
                            {res.editorialNote || 'Frasa akademik standar dalam batas wajar.'}
                          </div>

                          {res.citationContext?.hasInlineCitation && (
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              ✓ Sitasi inline terverifikasi
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-800 bg-[#0e0f20] flex items-center justify-between gap-4 flex-shrink-0">
              <div className="text-[11px] text-gray-500 hidden sm:block">
                APASIFIC Master Architecture v1.0 &bull; Editorial Sovereignty Guaranteed
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
                >
                  Tutup Pop-up
                </button>
                <a
                  href="/dashboard/submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#c9a84c] hover:bg-[#b8953c] text-black transition flex items-center gap-2"
                >
                  Lanjutkan Submit Naskah
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}
