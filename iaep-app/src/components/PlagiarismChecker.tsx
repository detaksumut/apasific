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

interface PlagiarismCheckerProps {
  initialText?: string;
  autoCheck?: boolean;
}

export const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({ initialText = '', autoCheck = false }) => {
  const [text, setText] = useState(initialText);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<PlagiarismReport | null>(null);

  useEffect(() => {
    if (autoCheck && text.trim() && !isChecking && !report) {
      handleCheck();
    }
  }, [autoCheck, text]);

  const handleCheck = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setReport(null);
    setProgress(0);

    const cleanText = removeBibliography(text);
    const paragraphs = extractParagraphs(cleanText);
    
    const results: PlagiarismResult[] = [];
    let checkedCount = 0;
    let plagiarizedCount = 0;

    const totalTarget = paragraphs.length;

    if (totalTarget === 0) {
      setIsChecking(false);
      setReport({
        totalParagraphs: paragraphs.length,
        checkedParagraphs: 0,
        plagiarizedParagraphs: 0,
        plagiarismPercentage: 0,
        results: []
      });
      return;
    }

    for (let i = 0; i < totalTarget; i++) {
      const paragraph = paragraphs[i];
      const wordCount = countWords(paragraph);
      
      let sources: string[] = [];
      let isPlagiarized = false;
      let similarityScore = 0;
      let classification = "Low Similarity";
      let phrasesChecked: string[] = [];

      // Proses blok yang memiliki cukup kata
      if (wordCount >= 10) {
        const checkResult = await checkParagraphPlagiarism(paragraph);
        sources = checkResult.sources;
        similarityScore = checkResult.similarityScore;
        classification = checkResult.classification;
        phrasesChecked = checkResult.phrasesChecked;
        
        // Klasifikasikan sebagai plagiat jika skor similarity >= 25% (1 dari 4 potongan terdeteksi)
        isPlagiarized = similarityScore >= 25;
      }
      
      if (isPlagiarized) {
        plagiarizedCount++;
      }
      
      checkedCount++;
      
      results.push({
        sentence: paragraph,
        isPlagiarized,
        wordCount,
        sources,
        similarityScore,
        classification,
        phrasesChecked
      });

      setProgress(Math.round(((i + 1) / totalTarget) * 100));
    }

    const percentage = Math.round((plagiarizedCount / checkedCount) * 100);

    setReport({
      totalParagraphs: paragraphs.length,
      checkedParagraphs: checkedCount,
      plagiarizedParagraphs: plagiarizedCount,
      plagiarismPercentage: percentage,
      results
    });

    setIsChecking(false);
  };

  const downloadReport = () => {
    if (!report) return;
    
    let content = `HASIL PENGECEKAN PLAGIARISME (Sistem Internal ASIA)\n`;
    content += `====================================================\n\n`;
    content += `Total Potongan Teks: ${report.totalParagraphs}\n`;
    content += `Potongan Diperiksa : ${report.checkedParagraphs} (Minimal 20 Kata)\n`;
    content += `Terdeteksi Plagiat : ${report.plagiarizedParagraphs}\n`;
    content += `Persentase Plagiat : ${report.plagiarismPercentage}%\n\n`;
    content += `DETAIL TEKS YANG TERINDIKASI PLAGIAT:\n`;
    content += `-------------------------------------\n\n`;
    
    const plagiarizedItems = report.results.filter(r => r.isPlagiarized);
    if (plagiarizedItems.length === 0) {
      content += `Tidak ada teks yang terindikasi plagiat! Artikel Anda aman.\n`;
    } else {
      plagiarizedItems.forEach((result, idx) => {
        content += `[Blok #${idx + 1}] (${result.wordCount} kata) - ${result.classification} (${result.similarityScore}%)\n`;
        content += `Teks: "${result.sentence}"\n`;
        if (result.phrasesChecked && result.phrasesChecked.length > 0) {
          content += `Frasa yang diuji:\n`;
          result.phrasesChecked.forEach(phrase => content += `> "${phrase}"\n`);
        }
        if (result.sources && result.sources.length > 0) {
          content += `Sumber Terindikasi:\n`;
          result.sources.forEach(src => content += `- ${src}\n`);
        }
        content += `\n`;
      });
    }
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Plagiarisme_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-black/40 border border-emerald-500/20 p-6 rounded-xl shadow-lg backdrop-blur-sm max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-serif font-bold mb-4 text-emerald-500">Cek Plagiarisme Artikel</h2>
      <p className="text-zinc-400 mb-4 text-sm">
        Sistem akan memotong bagian Daftar Pustaka dan mengecek artikel secara per paragraf secara cerdas.
      </p>

      <textarea
        data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false"
        className="w-full p-4 bg-zinc-900 border border-emerald-500/30 text-white rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4 min-h-[200px]"
        placeholder="Tempelkan teks artikel Anda di sini..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isChecking}
      />

      <button
        onClick={handleCheck}
        disabled={isChecking || !text.trim()}
        className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-black font-bold py-2 px-6 rounded-md transition-all disabled:opacity-50 hover:from-emerald-500 hover:to-emerald-300"
      >
        {isChecking ? <span>Sedang Mengecek...</span> : <span>Mulai Pengecekan</span>}
      </button>

      {isChecking && (
        <div className="mt-6">
          <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-emerald-500 mt-2 text-center">Progres: {progress}%</p>
        </div>
      )}

      {report && (
        <div className="mt-8 border-t border-emerald-500/20 pt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <h3 className="text-xl font-semibold text-emerald-400 mb-4 sm:mb-0">Hasil Pengecekan</h3>
            <button
              onClick={downloadReport}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-sm py-2 px-4 rounded-md transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Laporan (TXT)
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black/60 p-4 rounded-md border border-zinc-800 text-center">
              <p className="text-zinc-400 text-sm">Total Paragraf</p>
              <p className="text-2xl font-bold text-white">{report.totalParagraphs}</p>
            </div>
            <div className="bg-emerald-900/20 p-4 rounded-md border border-emerald-500/20 text-center">
              <p className="text-emerald-500 text-sm">Paragraf Diperiksa</p>
              <p className="text-2xl font-bold text-white">{report.checkedParagraphs}</p>
            </div>
            <div className="bg-red-900/20 p-4 rounded-md border border-red-500/20 text-center">
              <p className="text-red-500 text-sm">Terdeteksi Plagiat</p>
              <p className="text-2xl font-bold text-white">{report.plagiarizedParagraphs}</p>
            </div>
            <div className={`p-4 rounded-md border text-center ${report.plagiarismPercentage > 20 ? 'bg-red-900/30 border-red-500/30 text-red-500' : 'bg-green-900/30 border-green-500/30 text-green-500'}`}>
              <p className="text-sm">Persentase</p>
              <p className="text-2xl font-bold">{report.plagiarismPercentage}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-zinc-300">Detail Blok yang Diperiksa:</h4>
            {report.results.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">Tidak ada blok yang ditemukan.</p>
            ) : (
              <ul className="space-y-3">
                {report.results.map((result, idx) => (
                  <li key={idx} className={`p-4 rounded-md border text-sm ${result.isPlagiarized ? 'border-red-500/30 bg-red-900/10 text-zinc-300' : 'border-green-500/30 bg-green-900/10 text-zinc-300'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-zinc-500">Blok #{idx + 1}</span>
                      {result.classification && (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          result.similarityScore && result.similarityScore >= 90 ? 'bg-red-500 text-white' : 
                          result.similarityScore && result.similarityScore >= 70 ? 'bg-orange-500 text-white' :
                          result.similarityScore && result.similarityScore >= 40 ? 'bg-yellow-500 text-black' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {result.classification} ({result.similarityScore}%)
                        </span>
                      )}
                    </div>
                    
                    <p className="mb-2 text-zinc-400">{result.sentence}</p>
                    
                    {result.phrasesChecked && result.phrasesChecked.length > 0 && (
                      <div className="mb-3 mt-2 border-t border-zinc-700/50 pt-2">
                        <p className="text-zinc-500 font-semibold mb-1 text-xs">Frasa yang diuji ke Mesin Pencari:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {result.phrasesChecked.map((phrase, pIdx) => (
                            <li key={pIdx} className="text-zinc-400 text-xs italic">
                              "{phrase}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.sources && result.sources.length > 0 && (
                      <div className="mb-3 border-t border-red-500/20 pt-2">
                        <p className="text-red-400 font-semibold mb-1 text-xs">URL Sumber Terindikasi (Evidence):</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {result.sources.map((src, srcIdx) => (
                            <li key={srcIdx}>
                              <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all text-xs">
                                {src}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs mt-3">
                      <span className="font-medium text-emerald-500/70">
                        {result.wordCount} kata
                      </span>
                      {result.isPlagiarized ? (
                        <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">Terindikasi Plagiat!</span>
                      ) : (
                        <span className="text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">Aman</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
