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
      
      const sources = await checkParagraphPlagiarism(paragraph);
      const isPlagiarized = sources.length > 0;
      
      if (isPlagiarized) {
        plagiarizedCount++;
      }
      
      checkedCount++;
      
      results.push({
        sentence: paragraph,
        isPlagiarized,
        wordCount,
        sources
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

  return (
    <div className="bg-black/40 border border-emerald-500/20 p-6 rounded-xl shadow-lg backdrop-blur-sm max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-serif font-bold mb-4 text-emerald-500">Cek Plagiarisme Artikel</h2>
      <p className="text-zinc-400 mb-4 text-sm">
        Sistem akan memotong bagian Daftar Pustaka dan mengecek artikel secara per paragraf secara cerdas.
      </p>

      <textarea
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
        {isChecking ? 'Sedang Mengecek...' : 'Mulai Pengecekan'}
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
          <h3 className="text-xl font-semibold mb-4 text-emerald-400">Hasil Pengecekan</h3>
          
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
            <h4 className="font-medium text-zinc-300">Detail Paragraf yang Diperiksa:</h4>
            {report.results.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">Tidak ada paragraf yang ditemukan.</p>
            ) : (
              <ul className="space-y-3">
                {report.results.map((result, idx) => (
                  <li key={idx} className={`p-4 rounded-md border text-sm ${result.isPlagiarized ? 'border-red-500/30 bg-red-900/10 text-zinc-300' : 'border-green-500/30 bg-green-900/10 text-zinc-300'}`}>
                    <p className="mb-2 text-zinc-400">{result.sentence}</p>
                    <div className="flex justify-between items-center text-xs">
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
