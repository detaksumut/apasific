"use client";
import React, { useState, useEffect } from 'react';
import { 
  removeBibliography, 
  extractParagraphs, 
  countWords, 
  checkParagraphPlagiarism,
  PlagiarismResult,
  PlagiarismReport
} from '@/lib/plagiarism';
import { Info, BookOpen, Quote, Download } from 'lucide-react';

interface AuthorPlagiarismCheckerProps {
  initialText?: string;
  autoCheck?: boolean;
  onAnalysisComplete?: (report: PlagiarismReport) => void;
}

export const AuthorPlagiarismChecker: React.FC<AuthorPlagiarismCheckerProps> = ({ 
  initialText = '', 
  autoCheck = false,
  onAnalysisComplete 
}) => {
  const [text, setText] = useState(initialText);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<PlagiarismReport | null>(null);

  useEffect(() => {
    if (initialText && initialText !== text) {
      setText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (autoCheck && text.trim() && !isChecking && !report) {
      handleCheck();
    }
  }, [autoCheck, text]);

  const handleCheck = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setProgress(0);

    // 1. Abaikan bagian Daftar Pustaka / Referensi otomatis
    const cleanText = removeBibliography(text);

    // 2. Ekstraksi paragraf alami (mendukung multiformat copy-paste)
    const paragraphs = extractParagraphs(cleanText);
    const totalTarget = paragraphs.length;

    if (totalTarget === 0) {
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
      if (onAnalysisComplete) onAnalysisComplete(emptyReport);
      return;
    }

    const results: PlagiarismResult[] = [];
    let highRiskCount = 0;
    let reviewCount = 0;
    let totalScoreSum = 0;

    for (let i = 0; i < totalTarget; i++) {
      const paragraph = paragraphs[i];
      const wordCount = countWords(paragraph);

      // Kumpulkan paragraf lain untuk analisis deteksi tumpang tindih antar-paragraf
      const otherParagraphs = paragraphs.filter((_, idx) => idx !== i);

      // 3. Pengecekan per-paragraf dengan aturan baku: abaikan sitasi, ambang 20 kata identik
      const checkResult = await checkParagraphPlagiarism(paragraph, otherParagraphs);
      
      const isHighRisk = checkResult.classification === 'HIGH_RISK_SIGNAL';
      const isReview = checkResult.classification === 'CONTEXT_REVIEW';

      if (isHighRisk) highRiskCount++;
      if (isReview) reviewCount++;
      totalScoreSum += (checkResult.similarityScore || 0);

      results.push({
        sentence: paragraph,
        isPlagiarized: isHighRisk,
        wordCount,
        continuousMatchLength: checkResult.continuousMatchLength,
        sources: checkResult.sources,
        similarityScore: checkResult.similarityScore,
        classification: checkResult.classification,
        citationContext: checkResult.citationContext,
        editorialNote: checkResult.editorialNote,
        phrasesChecked: checkResult.phrasesChecked
      });

      setProgress(Math.round(((i + 1) / totalTarget) * 100));
    }

    const avgScore = Math.round(totalScoreSum / totalTarget);
    
    // Status Sinyal Kepatuhan
    const riskSignalSummary: 'NO_HIGH_RISK_SIGNAL' | 'REVIEW_RECOMMENDED' | 'HIGH_RISK_SIGNAL_DETECTED' = 
      highRiskCount > 0 || avgScore > 20
        ? 'HIGH_RISK_SIGNAL_DETECTED' 
        : (reviewCount > 0 ? 'REVIEW_RECOMMENDED' : 'NO_HIGH_RISK_SIGNAL');

    const finalReport: PlagiarismReport = {
      totalParagraphs: paragraphs.length,
      checkedParagraphs: results.length,
      plagiarizedParagraphs: highRiskCount,
      plagiarismPercentage: avgScore,
      riskSignalSummary,
      results
    };

    setIsChecking(false);
    setReport(finalReport);

    if (onAnalysisComplete) {
      onAnalysisComplete(finalReport);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    let content = `APASIFIC SIMILARITY CONTEXT ANALYSIS™ - LAPORAN PRA-SUBMIT PENULIS\n`;
    content += `=======================================================================\n`;
    content += `Tanggal Pemeriksaan : ${new Date().toLocaleString()}\n`;
    content += `Total Paragraf      : ${report.totalParagraphs}\n`;
    content += `Indeks Similaritas  : ${report.plagiarismPercentage}%\n`;
    content += `Overlaps Berisiko   : ${report.plagiarizedParagraphs} paragraf\n`;
    content += `Status Sinyal       : ${report.riskSignalSummary}\n`;
    content += `Aturan Baku         : Minimal 20 kata sama identik per paragraf (Sitasi & Referensi diabaikan)\n`;
    content += `=======================================================================\n\n`;
    content += `DISCLAIMER RESMI:\n`;
    content += `Hasil pemeriksaan pra-submit ini merupakan alat bantu kepatuhan mandiri penulis sebelum naskah diserahkan.\n`;
    content += `Keputusan integritas naskah berada di tangan Dewan Redaksi melalui evaluasi ilmiah kontekstual.\n\n`;
    content += `RINCIAN EVALUASI PER PARAGRAF:\n`;
    content += `-----------------------------------------------------------------------\n\n`;

    report.results.forEach((r, idx) => {
      content += `[Paragraf #${idx + 1}] (${r.wordCount} kata) - Status: ${r.classification}\n`;
      content += `Teks: ${r.sentence}\n`;
      if (r.citationContext?.hasInlineCitation) {
        content += `Sitasi Terdeteksi: Ya (${r.citationContext.citationSnippets.join(', ') || 'Inline Citation'})\n`;
      }
      if (r.continuousMatchLength !== undefined) {
        content += `Panjang Kata Cocok Beruntun (CML): ${r.continuousMatchLength} kata\n`;
      }
      if (r.editorialNote) {
        content += `Catatan: ${r.editorialNote}\n`;
      }
      if (r.sources && r.sources.length > 0) {
        content += `Sumber/Rujukan: ${r.sources.join(', ')}\n`;
      }
      content += `\n-----------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APASIFIC_PraSubmit_Similarity_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-zinc-300">
            Tempel Draf Naskah Ilmiah (Ekstraksi Paragraf Alami &amp; Deteksi Atribusi):
          </label>
          <span className="text-[11px] text-[#c9a84c] font-mono">
            {countWords(text)} kata terdeteksi
          </span>
        </div>
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tempelkan draf naskah lengkap di sini. Sistem akan memisahkan paragraf secara alami, mengabaikan sitasi dan daftar pustaka, serta menghitung tumpang tindih kata identik (ambang baku minimal 20 kata)..."
          className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl p-4 text-white text-xs leading-relaxed focus:border-[#c9a84c] outline-none transition-colors"
        />
        <p className="text-[11px] text-zinc-500">
          * Catatan: Bagian <strong>Daftar Pustaka / References</strong> serta kutipan yang memiliki <strong>sitasi resmi</strong> diabaikan secara otomatis. Ambang batas plagiasi dihitung jika ditemukan &ge; 20 kata sama identik tanpa sitasi per paragraf.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking || !text.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-black font-bold text-xs rounded-lg hover:scale-105 transition-all disabled:opacity-40 shadow-lg cursor-pointer disabled:cursor-not-allowed"
        >
          {isChecking ? "Menganalisis Paragraf & Sitasi..." : "Jalankan Analisis Konteks Similaritas"}
        </button>

        {report && (
          <button
            type="button"
            onClick={downloadReport}
            className="text-xs text-[#c9a84c] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Laporan (TXT)
          </button>
        )}
      </div>

      {isChecking && (
        <div className="space-y-2">
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#c9a84c] h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(201,168,76,0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#c9a84c] text-center font-mono">Memproses Paragraf: {progress}%</p>
        </div>
      )}

      {report && (
        <div className="border-t border-zinc-800 pt-6 space-y-6 animate-in fade-in">
          
          {/* 4 Summary Metric Cards Khusus Penulis */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-medium">Total Paragraf</div>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{report.totalParagraphs}</div>
            </div>

            <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-medium">Indeks Similaritas</div>
              <div className="text-2xl font-bold text-[#c9a84c] mt-1 font-mono">{report.plagiarismPercentage}%</div>
            </div>

            <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-medium">Overlaps Berisiko Tinggi</div>
              <div className="text-2xl font-bold text-red-400 mt-1 font-mono">{report.plagiarizedParagraphs}</div>
            </div>

            <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-medium">Status Sinyal</div>
              <div className={`text-xs font-bold mt-2 font-mono ${
                report.riskSignalSummary === 'HIGH_RISK_SIGNAL_DETECTED' 
                  ? 'text-red-400' 
                  : (report.riskSignalSummary === 'REVIEW_RECOMMENDED' ? 'text-amber-400' : 'text-emerald-400')
              }`}>
                {report.riskSignalSummary === 'HIGH_RISK_SIGNAL_DETECTED' 
                  ? '🔴 HIGH RISK SIGNAL' 
                  : (report.riskSignalSummary === 'REVIEW_RECOMMENDED' ? '🟡 REVIEW REQUIRED' : '🟢 NO HIGH RISK')}
              </div>
            </div>
          </div>

          {/* Legal / Context Disclaimer */}
          <div className="p-4 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl flex items-start gap-3 text-xs text-zinc-300 leading-relaxed">
            <Info className="w-5 h-5 text-[#c9a84c] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#c9a84c] block mb-0.5">Prinsip Analisis Konteks &amp; Kedaulatan Dewan Redaksi APASIFIC:</strong>
              Hasil di atas adalah sinyal kontekstual atribusi pra-submit (bukan vonis plagiarisme otomatis). Keputusan akhir integritas naskah ditentukan oleh Dewan Redaksi melalui evaluasi konteks ilmiah.
            </div>
          </div>

          {/* Detailed Paragraph Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c9a84c]" /> Rincian Paragraf &amp; Konteks Sitasi
            </h4>

            <div className="space-y-3">
              {report.results.map((r, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                    r.classification === 'HIGH_RISK_SIGNAL'
                      ? 'bg-red-950/20 border-red-500/40'
                      : (r.classification === 'CONTEXT_REVIEW'
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-black/30 border-zinc-800')
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
                    <span className="font-bold text-zinc-400 font-mono">
                      Paragraf #{idx + 1} ({r.wordCount} kata)
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {r.citationContext?.hasInlineCitation && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded text-[10px] font-semibold">
                          <Quote className="w-3 h-3" /> Sitasi Terdeteksi
                        </span>
                      )}
                      {r.continuousMatchLength !== undefined && r.continuousMatchLength >= 20 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px] font-semibold">
                          CML: {r.continuousMatchLength} kata identik
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        r.classification === 'HIGH_RISK_SIGNAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : (r.classification === 'CONTEXT_REVIEW'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40')
                      }`}>
                        {r.classification}
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-300 leading-relaxed font-serif text-[13px]">{r.sentence}</p>

                  {r.editorialNote && (
                    <div className="text-[11px] text-zinc-400 italic bg-black/40 p-2.5 rounded border border-zinc-800">
                      <strong>Catatan Konteks:</strong> {r.editorialNote}
                    </div>
                  )}

                  {r.sources && r.sources.length > 0 && (
                    <div className="text-[10px] text-zinc-500">
                      <strong>Sumber Terindikasi:</strong> {r.sources.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
