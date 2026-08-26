// src/services/similarity/ParagraphSimilarityContextService.ts
/**
 * APASIFIC Paragraph-Level Similarity Context Analysis™ Engine
 * Conforms to APASIFIC Master Architecture v1.0 (Locked) - Sprint 3
 * 
 * Core Philosophy:
 * Similarity → Context → Attribution → Editorial Review (NOT Similarity → Automated Plagiarism Verdict)
 */

export type SimilarityClassification = 
  | 'BENIGN_SIMILARITY'      // Standard academic phrase / methodology boilerplate / properly attributed quotation
  | 'CONTEXT_REVIEW'          // Moderate overlap / ambiguous paraphrase / partial attribution requiring human review
  | 'HIGH_RISK_SIGNAL';       // Unattributed substantive verbatim overlap (CML >= 20 words without citation)

export interface CitationPresence {
  hasInlineCitation: boolean;
  citationSnippets: string[];
  isDirectQuotation: boolean;
  quotationSnippets: string[];
}

export interface ParagraphSimilarityRecord {
  paragraphIndex: number;
  originalText: string;
  wordCount: number;
  continuousMatchLength: number; // Longest continuous matching token run
  similarityScore: number;       // 0 - 100%
  matchedSources: string[];
  classification: SimilarityClassification;
  citationContext: CitationPresence;
  editorialNote: string;
}

export interface ManuscriptSimilarityReport {
  totalParagraphs: number;
  assessedParagraphs: number;
  benignCount: number;
  reviewRequiredCount: number;
  highRiskCount: number;
  overallSimilarityIndex: number; // Aggregate raw index %
  riskSignalSummary: 'NO_HIGH_RISK_SIGNAL' | 'REVIEW_RECOMMENDED' | 'HIGH_RISK_SIGNAL_DETECTED';
  paragraphs: ParagraphSimilarityRecord[];
  disclaimer: string;
}

export class ParagraphSimilarityContextService {

  /**
   * 1. Natural Paragraph Parsing: Extracts true semantic paragraphs without rigid word cutting.
   */
  public static extractNaturalParagraphs(text: string): string[] {
    if (!text || !text.trim()) return [];

    // Remove standalone bibliography section to focus on substantive manuscript text
    const cleanText = this.stripBibliography(text);

    // Split on double newlines or paragraph breaks
    const rawBlocks = cleanText
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const validParagraphs: string[] = [];

    for (const block of rawBlocks) {
      // Normalize internal whitespace
      const normalized = block.replace(/\s+/g, ' ').trim();
      const words = normalized.split(' ').filter(w => w.length > 0);
      
      // Keep paragraphs with substantial content (at least 8 words)
      if (words.length >= 8) {
        validParagraphs.push(normalized);
      }
    }

    return validParagraphs;
  }

  /**
   * 2. Citation & Direct Quotation Detection Engine
   */
  public static detectCitationAndQuotation(paragraphText: string): CitationPresence {
    const citationPatterns = [
      // Standard Author-Date: (Smith, 2020), (Rahman et al., 2024), (Danil & Rahman, 2023: 45)
      /\([A-Z][a-zA-Z\s\.,&]+(?:\s+et\s+al\.)?,\s*(?:19|20)\d{2}[a-z]?(?::\s*\d+)?\)/g,
      // Narrative Citation: Menurut Smith (2020), Berdasarkan Danil et al. (2024), According to Rahman (2022)
      /(?:Menurut|Berdasarkan|According to|As stated by)\s+[A-Z][a-zA-Z]+(?:\s+et\s+al\.)?\s*\((?:19|20)\d{2}[a-z]?\)/gi,
      // Numeric Citations: [1], [1, 2], [12-15]
      /\[\d+(?:[\s,\-–]\d+)*\]/g
    ];

    const quotationPatterns = [
      // Double quotes: "...", “...”
      /["“][^"”]{10,}["”]/g,
      // Guilloche/Angle quotes: «...»
      /«[^»]{10,}»/g
    ];

    const citationSnippets: string[] = [];
    for (const pattern of citationPatterns) {
      const matches = paragraphText.match(pattern);
      if (matches) {
        citationSnippets.push(...matches);
      }
    }

    const quotationSnippets: string[] = [];
    for (const pattern of quotationPatterns) {
      const matches = paragraphText.match(pattern);
      if (matches) {
        quotationSnippets.push(...matches);
      }
    }

    return {
      hasInlineCitation: citationSnippets.length > 0,
      citationSnippets: Array.from(new Set(citationSnippets)),
      isDirectQuotation: quotationSnippets.length > 0,
      quotationSnippets: Array.from(new Set(quotationSnippets))
    };
  }

  /**
   * 3. Continuous Match Length (CML) & Context-Aware Classification
   */
  public static classifySimilarity({
    continuousMatchLength,
    rawSimilarityScore,
    citationContext,
    matchedSources
  }: {
    continuousMatchLength: number;
    rawSimilarityScore: number;
    citationContext: CitationPresence;
    matchedSources: string[];
  }): { classification: SimilarityClassification; editorialNote: string } {
    
    // Case 1: Properly Attributed Direct Quotation
    if (citationContext.isDirectQuotation && citationContext.hasInlineCitation) {
      return {
        classification: 'BENIGN_SIMILARITY',
        editorialNote: 'Attributed Direct Quotation: Text is explicitly enclosed in quotation marks with inline citation.'
      };
    }

    // Case 2: Standard Scholarly / Methodological Boilerplate (Low CML, under 15 continuous words)
    if (continuousMatchLength < 15 && rawSimilarityScore < 30) {
      return {
        classification: 'BENIGN_SIMILARITY',
        editorialNote: 'Benign Scholarly Similarity: Standard terminology or generic academic phraseology without substantive verbatim copying.'
      };
    }

    // Case 3: High-Risk Unattributed Substantive Overlap (CML >= 20 continuous words without citation)
    if (continuousMatchLength >= 20 && !citationContext.hasInlineCitation) {
      return {
        classification: 'HIGH_RISK_SIGNAL',
        editorialNote: 'Unattributed Substantive Overlap: Continuous verbatim match of 20+ words detected with no inline citation.'
      };
    }

    // Case 4: Moderate Overlap with Citation or Intermediate Paraphrase (Needs Editorial Context Review)
    if (citationContext.hasInlineCitation && continuousMatchLength >= 15) {
      return {
        classification: 'CONTEXT_REVIEW',
        editorialNote: 'Context Review: In-text citation is present, but continuous match length is high. Verify if block quotes or closer paraphrasing is required.'
      };
    }

    if (rawSimilarityScore >= 30) {
      return {
        classification: 'CONTEXT_REVIEW',
        editorialNote: 'Context Review: Elevated similarity index detected. Human editorial inspection recommended to determine provenance.'
      };
    }

    return {
      classification: 'BENIGN_SIMILARITY',
      editorialNote: 'Minor academic similarity within expected normative bounds.'
    };
  }

  /**
   * 4. Evaluates a full manuscript text
   */
  public static analyzeManuscript(text: string, mockMatcher?: (paragraph: string) => { cml: number; score: number; sources: string[] }): ManuscriptSimilarityReport {
    const paragraphs = this.extractNaturalParagraphs(text);
    
    const records: ParagraphSimilarityRecord[] = [];
    let benignCount = 0;
    let reviewCount = 0;
    let highRiskCount = 0;
    let totalScoreSum = 0;

    paragraphs.forEach((pText, idx) => {
      const words = pText.split(' ').filter(w => w.length > 0);
      const citationContext = this.detectCitationAndQuotation(pText);

      // Match evaluation (using external matcher or fallback heuristic)
      let cml = 0;
      let score = 0;
      let sources: string[] = [];

      if (mockMatcher) {
        const matchRes = mockMatcher(pText);
        cml = matchRes.cml;
        score = matchRes.score;
        sources = matchRes.sources;
      }

      const { classification, editorialNote } = this.classifySimilarity({
        continuousMatchLength: cml,
        rawSimilarityScore: score,
        citationContext,
        matchedSources: sources
      });

      if (classification === 'BENIGN_SIMILARITY') benignCount++;
      else if (classification === 'CONTEXT_REVIEW') reviewCount++;
      else if (classification === 'HIGH_RISK_SIGNAL') highRiskCount++;

      totalScoreSum += score;

      records.push({
        paragraphIndex: idx + 1,
        originalText: pText,
        wordCount: words.length,
        continuousMatchLength: cml,
        similarityScore: score,
        matchedSources: sources,
        classification,
        citationContext,
        editorialNote
      });
    });

    const total = paragraphs.length;
    const avgScore = total > 0 ? Math.round(totalScoreSum / total) : 0;
    
    const riskSignalSummary: 'NO_HIGH_RISK_SIGNAL' | 'REVIEW_RECOMMENDED' | 'HIGH_RISK_SIGNAL_DETECTED' = 
      highRiskCount > 0 
        ? 'HIGH_RISK_SIGNAL_DETECTED' 
        : (reviewCount > 0 ? 'REVIEW_RECOMMENDED' : 'NO_HIGH_RISK_SIGNAL');

    return {
      totalParagraphs: total,
      assessedParagraphs: total,
      benignCount,
      reviewRequiredCount: reviewCount,
      highRiskCount,
      overallSimilarityIndex: avgScore,
      riskSignalSummary,
      paragraphs: records,
      disclaimer: "APASIFIC Similarity Context Analysis™ provides automated contextual signals for editorial discretion and does NOT constitute an automated verdict of plagiarism."
    };
  }

  private static stripBibliography(text: string): string {
    const regex = /(?:\n|^)\s*(?:DAFTAR PUSTAKA|REFERENSI|REFERENCES|BIBLIOGRAPHY)\s*(?:\n|$)/i;
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      const cut = text.substring(0, match.index).trim();
      return cut.length > 0 ? cut : text;
    }
    return text;
  }
}
