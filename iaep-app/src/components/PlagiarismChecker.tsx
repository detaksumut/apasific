"use client";
import React, { useState, useEffect } from 'react';
import { ultimateAIAnalysis } from '@/lib/ultimateAI';
import { 
  removeBibliography, 
  extractParagraphs, 
  countWords, 
  checkParagraphPlagiarism,
  PlagiarismResult,
  PlagiarismReport
} from '@/lib/plagiarism';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, BookOpen, Quote } from 'lucide-react';

interface PlagiarismCheckerProps {
  initialText?: string;
  autoCheck?: boolean;
  summaryOnly?: boolean;
  onAnalysisComplete?: (result: any) => void;
}

export const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({ 
  initialText = '', 
  autoCheck = false, 
  summaryOnly = false, 
  onAnalysisComplete 
}) => {
  const [text, setText] = useState(initialText);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (initialText && initialText !== text) {
      setText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (!text.trim() || text.length < 50) return;

    let isMounted = true;
    setIsAiLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await ultimateAIAnalysis(text);
        if (isMounted) {
          setAiAnalysis(result.rawContent || "");
          if (onAnalysisComplete) {
            onAnalysisComplete(result);
          }
        }
      } catch (error) {
        console.error("[UltimateAI Trigger] Analysis failed", error);
      } finally {
        if (isMounted) {
          setIsAiLoading(false);
        }
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [text]);

  useEffect(() => {
    if (autoCheck && text.trim() && !isChecking && !report) {
      handleCheck();
    }
  }, [autoCheck, text]);

  const handleCheck = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setIsAiLoading(true);
    setProgress(0);

    // Trigger AI Clue analysis in parallel
    ultimateAIAnalysis(text).then(res => {
      if (res && res.rawContent) {
        setAiAnalysis(res.rawContent);
        if (onAnalysisComplete) onAnalysisComplete(res);
      }
    }).catch(err => {
      console.error("AI Clue generation error:", err);
    }).finally(() => {
      setIsAiLoading(false);
    });

    const cleanText = removeBibliography(text);
    const paragraphs = extractParagraphs(cleanText);
    
    const results: PlagiarismResult[] = [];
    let highRiskCount = 0;
    let reviewCount = 0;
    let totalScoreSum = 0;

    const totalTarget = paragraphs.length;

    if (totalTarget === 0) {
      setIsChecking(false);
      setReport({
        totalParagraphs: 0,
        checkedParagraphs: 0,
        plagiarizedParagraphs: 0,
        plagiarismPercentage: 0,
        riskSignalSummary: 'NO_HIGH_RISK_SIGNAL',
        results: []
      });
      return;
    }

    for (let i = 0; i < totalTarget; i++) {
      const paragraph = paragraphs[i];
      const wordCount = countWords(paragraph);
      
      const checkResult = await checkParagraphPlagiarism(paragraph);
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
    const riskSignalSummary = highRiskCount > 0 
      ? 'HIGH_RISK_SIGNAL_DETECTED' 
      : (reviewCount > 0 ? 'REVIEW_RECOMMENDED' : 'NO_HIGH_RISK_SIGNAL');

    setIsChecking(false);
    setReport({
      totalParagraphs: paragraphs.length,
      checkedParagraphs: results.length,
      plagiarizedParagraphs: highRiskCount,
      plagiarismPercentage: avgScore,
      riskSignalSummary,
      results
    });
  };

  const downloadReport = () => {
    if (!report) return;

    let content = `APASIFIC SIMILARITY CONTEXT ANALYSIS™ REPORT\n`;
    content += `=======================================================\n`;
    content += `Generated Date       : ${new Date().toLocaleString()}\n`;
    content += `Total Paragraphs     : ${report.totalParagraphs}\n`;
    content += `Raw Similarity Index : ${report.plagiarismPercentage}%\n`;
    content += `Risk Signal Summary  : ${report.riskSignalSummary}\n`;
    content += `=======================================================\n\n`;
    content += `DISCLAIMER: APASIFIC Similarity Context Analysis™ provides automated contextual signals for editorial discretion and does NOT constitute an automated verdict of plagiarism.\n\n`;
    content += `PARAGRAPH-BY-PARAGRAPH ATTRIBUTION BREAKDOWN:\n`;
    content += `-------------------------------------------------------\n\n`;

    report.results.forEach((r, idx) => {
      content += `[Paragraph #${idx + 1}] (${r.wordCount} words) - Class: ${r.classification}\n`;
      content += `Text: ${r.sentence}\n`;
      if (r.editorialNote) content += `Note: ${r.editorialNote}\n`;
      if (r.sources && r.sources.length > 0) content += `Sources: ${r.sources.join(', ')}\n`;
      content += `\n-------------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APASIFIC_Similarity_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-400">
          Tempel Teks Naskah Ilmiah (Natural Paragraph Parsing Engine):
        </label>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tempelkan draf naskah ilmiah lengkap di sini untuk analisis konteks kemiripan..."
          className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl p-4 text-white text-xs leading-relaxed focus:border-[#c9a84c] outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking || !text.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-black font-bold text-xs rounded-lg hover:scale-105 transition-all disabled:opacity-40"
        >
          {isChecking ? "Menganalisis Paragraf & Sitasi..." : "Jalankan Analisis Konteks Similaritas"}
        </button>

        <span className="text-[11px] text-zinc-500 font-mono">
          {countWords(text)} kata terdeteksi
        </span>
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
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-medium">Total Paragraf</div>
              <div className="text-xl font-bold text-white mt-1">{report.totalParagraphs}</div>
            </div>

            <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-medium">Indeks Similaritas</div>
              <div className="text-xl font-bold text-[#c9a84c] mt-1">{report.plagiarismPercentage}%</div>
            </div>

            <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-medium">Overlaps Berisiko Tinggi</div>
              <div className="text-xl font-bold text-red-400 mt-1">{report.plagiarizedParagraphs}</div>
            </div>

            <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-medium">Status Sinyal</div>
              <div className={`text-xs font-bold mt-2 ${
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

          {/* Legal / Editorial Disclaimer */}
          <div className="p-4 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl flex items-start gap-3 text-xs text-zinc-300 leading-relaxed">
            <Info className="w-5 h-5 text-[#c9a84c] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#c9a84c] block mb-0.5">Prinsip Analisis Konteks &amp; Kedaulatan Dewan Redaksi APASIFIC:</strong>
              Hasil di atas adalah sinyal kontekstual atribusi (bukan vonis plagiarisme otomatis). Keputusan integritas naskah sepenuhnya berada di tangan Dewan Redaksi melalui evaluasi konteks ilmiah.
            </div>
          </div>

          {/* AI Analysis Clue & Reviewer/Editor Companion */}
          {(aiAnalysis || isAiLoading) && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#0a0a14]/90 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Clue &amp; Analisis Komparatif Naskah
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  Editorial &amp; Reviewer Clue
                </span>
              </div>

              {isAiLoading && !aiAnalysis ? (
                <div className="text-xs text-zinc-400 italic py-3 flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-emerald-400" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/></svg>
                  Sedang menyusun analisis komprehensif naskah sebagai clue telaah...
                </div>
              ) : (
                <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans max-h-[420px] overflow-y-auto pr-1">
                  {aiAnalysis}
                </div>
              )}
            </div>
          )}

          {/* Detailed Paragraph Breakdown */}
          {!summaryOnly && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#c9a84c]" /> Rincian Paragraf &amp; Konteks Sitasi
                </h4>
                <button
                  type="button"
                  onClick={downloadReport}
                  className="text-xs text-[#c9a84c] hover:underline flex items-center gap-1 font-semibold"
                >
                  Download Laporan Lengkap (TXT) ↗
                </button>
              </div>

              <div className="space-y-3">
                {report.results.map((r, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                      r.classification === 'HIGH_RISK_SIGNAL'
                        ? 'bg-red-950/20 border-red-500/40'
                        : (r.classification === 'CONTEXT_REVIEW'
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-black/30 border-zinc-800')
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
                      <span className="font-bold text-zinc-400 font-mono">Paragraf #{idx + 1} ({r.wordCount} kata)</span>
                      
                      <div className="flex items-center gap-2">
                        {r.citationContext?.hasInlineCitation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded text-[10px] font-semibold">
                            <Quote className="w-3 h-3" /> Sitasi Terdeteksi
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
                      <div className="text-[11px] text-zinc-400 italic bg-black/40 p-2 rounded border border-zinc-800">
                        <strong>Catatan Konteks:</strong> {r.editorialNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
