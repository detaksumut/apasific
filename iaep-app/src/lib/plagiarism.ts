// src/lib/plagiarism.ts
import { ParagraphSimilarityContextService, SimilarityClassification, CitationPresence } from '@/services/similarity/ParagraphSimilarityContextService';

export interface PlagiarismResult {
  sentence: string;
  isPlagiarized: boolean;
  wordCount: number;
  continuousMatchLength?: number;
  sources?: string[];
  similarityScore?: number;
  classification?: SimilarityClassification | string;
  citationContext?: CitationPresence;
  editorialNote?: string;
  phrasesChecked?: string[];
}

export interface PlagiarismReport {
  totalParagraphs: number;
  checkedParagraphs: number;
  plagiarizedParagraphs: number;
  plagiarismPercentage: number;
  riskSignalSummary?: 'NO_HIGH_RISK_SIGNAL' | 'REVIEW_RECOMMENDED' | 'HIGH_RISK_SIGNAL_DETECTED';
  results: PlagiarismResult[];
}

/**
 * Membuang bagian Daftar Pustaka atau Referensi dari teks.
 */
export function removeBibliography(text: string): string {
  const regex = /(?:\n|^)\s*(?:DAFTAR PUSTAKA|REFERENSI|REFERENCES|BIBLIOGRAPHY)\s*(?:\n|$)/i;
  const match = text.match(regex);
  if (match && match.index !== undefined) {
    const cutText = text.substring(0, match.index).trim();
    if (cutText.length === 0) {
      return text;
    }
    return cutText;
  }
  return text;
}

/**
 * Natural Paragraph Extraction (preserves semantic boundaries, sentences, quotes, and citations).
 */
export function extractParagraphs(text: string): string[] {
  return ParagraphSimilarityContextService.extractNaturalParagraphs(text);
}

/**
 * Menghitung jumlah kata dalam sebuah string.
 */
export function countWords(text: string): number {
  const words = text.trim().split(/\s+/);
  return words.length === 1 && words[0] === '' ? 0 : words.length;
}

export interface CheckResult {
  sources: string[];
  similarityScore: number;
  continuousMatchLength: number;
  classification: SimilarityClassification | string;
  citationContext: CitationPresence;
  editorialNote: string;
  phrasesChecked: string[];
}

/**
 * Menghitung kecocokan kata identik berturut-turut terpanjang (Continuous Match Length / CML)
 * antara dua daftar kata (case-insensitive & pembersihan tanda baca).
 */
export function findLongestCommonWordRun(wordsA: string[], wordsB: string[]): number {
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  
  let maxLength = 0;
  // Dynamic table (optimized with single row)
  const current = new Array(wordsB.length + 1).fill(0);

  for (let i = 0; i < wordsA.length; i++) {
    const wordA = wordsA[i];
    let prev = 0;
    for (let j = 0; j < wordsB.length; j++) {
      const temp = current[j + 1];
      if (wordA === wordsB[j] && wordA.length > 0) {
        current[j + 1] = prev + 1;
        if (current[j + 1] > maxLength) {
          maxLength = current[j + 1];
        }
      } else {
        current[j + 1] = 0;
      }
      prev = temp;
    }
  }

  return maxLength;
}

export function cleanWordToken(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Pengecekan similaritas paragraf dengan analisis konteks atribusi dan CML
 */
export async function checkParagraphPlagiarism(
  block: string, 
  otherParagraphs: string[] = []
): Promise<CheckResult> {
  const citationContext = ParagraphSimilarityContextService.detectCitationAndQuotation(block);
  
  const rawWords = block.trim().split(/\s+/).filter(w => w.length > 0);
  const cleanTokens = rawWords.map(cleanWordToken).filter(w => w.length > 0);
  const wordCount = rawWords.length;
  
  let detectedCml = 0;
  let detectedSources: string[] = [];

  // 1. Cek tumpang tindih kata berturut-turut terhadap paragraf lain di naskah
  if (otherParagraphs.length > 0) {
    for (let idx = 0; idx < otherParagraphs.length; idx++) {
      const otherPara = otherParagraphs[idx];
      const otherTokens = otherPara.split(/\s+/).map(cleanWordToken).filter(w => w.length > 0);
      const matchRun = findLongestCommonWordRun(cleanTokens, otherTokens);
      if (matchRun > detectedCml) {
        detectedCml = matchRun;
        detectedSources = [`Duplikasi Paragraf Naskah (Paragraf #${idx + 1})`];
      }
    }
  }

  // 2. Terapkan aturan baku: abaikan sitasi & referensi
  let estimatedScore = 0;

  if (citationContext.isDirectQuotation && citationContext.hasInlineCitation) {
    // Kutipan langsung dengan sitasi resmi: diabaikan dari indikasi plagiasi
    estimatedScore = Math.min(20, Math.round((detectedCml / Math.max(wordCount, 1)) * 100));
    detectedSources = ['Kutipan Langsung Resmi (Bersitasi)'];
  } else if (citationContext.hasInlineCitation) {
    // Sitasi inline terdeteksi: atribusi sah
    estimatedScore = Math.min(25, Math.round((detectedCml / Math.max(wordCount, 1)) * 100));
    detectedSources = ['Sitasi Akademis Inline Terdeteksi'];
  } else if (detectedCml >= 20) {
    // Aturan baku: minimal 20 kata identik berturut-turut tanpa sitasi = Overlap Berisiko Tinggi
    estimatedScore = Math.min(100, Math.max(40, Math.round((detectedCml / Math.max(wordCount, 1)) * 100)));
  } else if (detectedCml >= 15) {
    estimatedScore = Math.min(30, Math.round((detectedCml / Math.max(wordCount, 1)) * 100));
  } else {
    // Kesamaan normatif di bawah 15 kata
    estimatedScore = Math.min(10, Math.round((detectedCml / Math.max(wordCount, 1)) * 100));
  }

  const { classification, editorialNote } = ParagraphSimilarityContextService.classifySimilarity({
    continuousMatchLength: detectedCml,
    rawSimilarityScore: estimatedScore,
    citationContext,
    matchedSources: detectedSources
  });

  return {
    sources: detectedSources,
    similarityScore: estimatedScore,
    continuousMatchLength: detectedCml,
    classification,
    citationContext,
    editorialNote,
    phrasesChecked: [rawWords.slice(0, Math.min(20, rawWords.length)).join(' ')]
  };
}
