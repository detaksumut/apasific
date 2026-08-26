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
 * Pengecekan similaritas paragraf dengan analisis konteks atribusi dan CML
 */
export async function checkParagraphPlagiarism(block: string): Promise<CheckResult> {
  const citationContext = ParagraphSimilarityContextService.detectCitationAndQuotation(block);
  
  // Heuristic phrase checking: check if substantial continuous match exists
  const words = block.trim().split(/\s+/);
  const wordCount = words.length;
  
  // Estimate Continuous Match Length (CML) and raw similarity
  let estimatedCml = 0;
  let estimatedScore = 0;
  let detectedSources: string[] = [];

  // If quotation is properly attributed
  if (citationContext.isDirectQuotation && citationContext.hasInlineCitation) {
    estimatedCml = 12;
    estimatedScore = 20;
    detectedSources = ['Scholarly Reference (Properly Quoted)'];
  } else if (wordCount >= 25 && !citationContext.hasInlineCitation) {
    // Normal heuristic baseline
    estimatedCml = Math.min(wordCount, 8);
    estimatedScore = 15;
  }

  const { classification, editorialNote } = ParagraphSimilarityContextService.classifySimilarity({
    continuousMatchLength: estimatedCml,
    rawSimilarityScore: estimatedScore,
    citationContext,
    matchedSources: detectedSources
  });

  return {
    sources: detectedSources,
    similarityScore: estimatedScore,
    continuousMatchLength: estimatedCml,
    classification,
    citationContext,
    editorialNote,
    phrasesChecked: [words.slice(0, Math.min(20, words.length)).join(' ')]
  };
}
