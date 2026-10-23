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
  let internalOverlap = false;

  // Compare with other paragraphs from this manuscript only; this is not an external-source search.
  if (otherParagraphs.length > 0) {
    for (let idx = 0; idx < otherParagraphs.length; idx++) {
      const otherPara = otherParagraphs[idx];
      const otherTokens = otherPara.split(/\\s+/).map(cleanWordToken).filter(w => w.length > 0);
      const matchRun = findLongestCommonWordRun(cleanTokens, otherTokens);
      if (matchRun > detectedCml) {
        detectedCml = matchRun;
        internalOverlap = matchRun > 0;
        detectedSources = matchRun > 0 ? [`Duplikasi internal naskah (paragraf pembanding #${idx + 1})`] : [];
      }
    }
  }

  const estimatedScore = detectedCml > 0
    ? Math.min(100, Math.round((detectedCml / Math.max(wordCount, 1)) * 100))
    : 0;

  // A citation in the current paragraph cannot explain away repeated text elsewhere in the same manuscript.
  // Internal repetition is a review signal, not proof of plagiarism against an external source.
  const { classification: baseClassification, editorialNote: baseEditorialNote } =
    ParagraphSimilarityContextService.classifySimilarity({
      continuousMatchLength: detectedCml,
      rawSimilarityScore: estimatedScore,
      citationContext: internalOverlap
        ? { ...citationContext, hasInlineCitation: false, isDirectQuotation: false }
        : citationContext,
      matchedSources: detectedSources
    });

  const classification = internalOverlap && detectedCml >= 15
    ? 'CONTEXT_REVIEW' as const
    : baseClassification;
  const editorialNote = internalOverlap
    ? 'Kemiripan internal antarparagraf terdeteksi. Ini bukan bukti plagiarisme eksternal; periksa apakah pengulangan disengaja, termasuk metode atau kutipan yang sah.'
    : baseEditorialNote;

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
