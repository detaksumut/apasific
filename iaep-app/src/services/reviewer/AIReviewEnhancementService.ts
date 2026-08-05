// src/services/reviewer/AIReviewEnhancementService.ts
//
// AI-ASSISTED REVIEW ENHANCEMENT LAYER (IAEP)
//
// GOVERNANCE (non-negotiable):
//   - AI is NOT a reviewer.
//   - AI does NOT perform independent peer review.
//   - AI does NOT make editorial decisions.
//   - AI only enhances a COMPLETED HUMAN REVIEWER REPORT.
//
// Accountability model:
//   Human Reviewer  = sole owner of academic judgment + recommendation.
//   Editor          = final decision authority.
//   This service    = advisory quality-enhancement layer (derived output only).
//
// STRICT FORBIDDEN OPERATIONS:
//   - Creating reviewer assignments.
//   - Modifying review_assignments.status.
//   - Modifying submissions.status/stage.
//   - Calling SubmissionLifecycleService.
//   - Returning / deriving an editorial decision.
//
// STRICT ALLOWED OPERATIONS:
//   - Analyze the human review report + manuscript metadata.
//   - Generate: completeness analysis, academic language enhancement,
//     missing-issue detection, structure optimization, quality scores,
//     and an advisory severity level (0/1/2).
//   - Persist a derived record in `review_enhancements` only.
//
// DESIGN: fully deterministic (no external LLM dependency) so it is
// unit-testable and auditable. The human recommendation is preserved
// VERBATIM; the enhancement never changes it.

import { normalizeRole } from '@/lib/roles';

// ─── Types ─────────────────────────────────────────────────────────────────

export type SeverityLevel = 0 | 1 | 2;

export interface HumanReviewInput {
  reviewId: string;
  submissionId: string;
  recommendation: string | null;
  commentsForAuthor: string | null;
  commentsForEditor: string | null;
  correctionNotes: string | null;
}

export interface ManuscriptMetadata {
  title?: string | null;
  abstract?: string | null;
  keywords?: string[] | string | null;
  journalName?: string | null;
}

export interface QualityScore {
  completeness: number;   // 0-100
  clarity: number;        // 0-100
  professionalism: number;// 0-100
}

export interface AIObservation {
  aspect: string;
  issue: string;
  detail?: string;
}

export interface EnhancementOutput {
  /** Immutable snapshot of the human report. */
  originalReviewSnapshot: any;
  /** Derived, AI-assisted professional version of the human comments. */
  enhancedReviewContent: string;
  /** Quality assessment. */
  qualityScore: QualityScore;
  /** Advisory observations. */
  aiObservations: AIObservation[];
  /** 0 = no concern, 1 = additional consideration, 2 = significant attention. */
  severityLevel: SeverityLevel;
  /** Audit metadata (internal only). */
  enhancementEngine: string;
  enhancementVersion: string;
  status: string;
}

// Severity interpretations (advisory).
export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  0: 'AI Quality Confirmed',
  1: 'Additional Consideration',
  2: 'Significant Editorial Attention Required',
};

// ─── Pure analysis helpers (deterministic) ─────────────────────────────────

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'for', 'to', 'and', 'or', 'with', 'by',
  'from', 'at', 'as', 'is', 'are', 'be', 'been', 'being', 'this', 'that',
  'these', 'those', 'it', 'its', 'yang', 'dan', 'atau', 'dari', 'ke', 'di',
  'pada', 'dengan', 'untuk', 'dalam', 'oleh', 'adalah', 'merupakan', 'ini',
  'itu', 'tersebut', 'serta', 'juga', 'tidak', 'akan', 'dapat', 'sangat',
  'perlu', 'harus', 'dengan', 'agar', 'sebagai', 'sebuah', 'suatu',
]);

// Untouched filler words that do not add academic signal.
const GENERIC_TERMS = new Set([
  'paper', 'article', 'research', 'study', 'manuscript', 'authors', 'author',
  'review', 'reviewer', 'comments', 'result', 'results', 'data', 'analysis',
  'jurnal', 'artikel', 'penelitian', 'studi', 'naskah', 'penulis', 'review',
]);

function normalize(v: string | null | undefined): string {
  return (v || '').toLowerCase().replace(/[^a-z0-9\s]/gi, ' ');
}

function tokenize(v: string | null | undefined, max = 600): string[] {
  return normalize(v)
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 3 && !STOPWORDS.has(t) && !GENERIC_TERMS.has(t))
    .slice(0, max);
}

function hasAny(textLower: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(textLower));
}

// ─── Compose the human review text for analysis ────────────────────────────

function buildHumanReviewText(h: HumanReviewInput): string {
  return [h.commentsForAuthor, h.commentsForEditor, h.correctionNotes]
    .filter(Boolean)
    .join('\n\n');
}

// ─── A. Completeness Analysis ──────────────────────────────────────────────

interface CompletenessResult {
  score: number;                 // 0-100
  covered: string[];
  missing: string[];
}

const COMPLETENESS_ASPECTS: Array<{ key: string; signals: RegExp[] }> = [
  { key: 'novelty', signals: [/\bnovel\b/, /\bnovelty\b/, /\boriginal\b/, /\bnew\b/, /\bbe.*contribution\b/, /\bstate.of.the.art\b/, /\butuh.*pembaruan\b/, /\bkebaruan\b/, /\binovasi\b/] },
  { key: 'methodology', signals: [/\bmethod/, /\bmetodologi\b/, /\bmetode\b/, /\bresearch.design\b/, /\bsampling\b/, /\bsample\b/, /\bpendekatan\b/, /\bapproach\b/, /\bdata.collection\b/, /\bdesign\b/] },
  { key: 'literature', signals: [/\bliterature\b/, /\bliteratur\b/, /\breference/, /\breferensi\b/, /\bbibliograph/, /\bdaftar.pustaka\b/, /\bcitation\b/, /\bsitasi\b/, /\bstudi.terdahulu\b/] },
  { key: 'results', signals: [/\bresult/, /\bhasil\b/, /\bfinding/, /\btemuan\b/, /\bobservation/, /\boutput\b/] },
  { key: 'discussion', signals: [/\bdiscussion\b/, /\bpembahasan\b/, /\bimpl\b/, /\bdampak\b/, /\binterpret/, /\bdiskusi\b/] },
  { key: 'conclusion', signals: [/\bconclusion\b/, /\bkesimpulan\b/, /\bconcluding\b/, /\brekomendasi\b/, /\bsimpulan\b/, /\bsaran\b/] },
];

export function analyzeCompleteness(
  humanReviewText: string,
  manuscriptText: string
): CompletenessResult {
  const reviewLower = humanReviewText.toLowerCase();
  const manuscriptLower = manuscriptText.toLowerCase();
  const covered: string[] = [];
  const missing: string[] = [];

  for (const aspect of COMPLETENESS_ASPECTS) {
    const inManuscript = hasAny(manuscriptLower, aspect.signals);
    const inReview = hasAny(reviewLower, aspect.signals);
    if (inReview) {
      covered.push(aspect.key);
    } else if (inManuscript) {
      // Aspect is relevant to the manuscript but not addressed by the reviewer.
      missing.push(aspect.key);
    }
  }

  const score = Math.round((covered.length / COMPLETENESS_ASPECTS.length) * 100);
  return { score, covered, missing };
}

// ─── B. Academic Language Enhancement ──────────────────────────────────────

// Deterministic, template-driven professional phrasing. This NEVER changes
// the reviewer's judgment; it only improves clarity and professionalism.
export function enhanceAcademicLanguage(raw: string | null | undefined): string {
  const text = (raw || '').trim();
  if (!text) return '';

  let enhanced = text;

  // Weak/terse critique → structured professional clarification guidance.
  const weakPatterns: Array<{ re: RegExp; replacement: string }> = [
    {
      re: /\bMethodology is weak\b/i,
      replacement:
        'The methodology section requires additional clarification regarding ' +
        'research design, sampling strategy, data collection procedures, and ' +
        'analytical framework.',
    },
    {
      re: /\bMetodologi lemah\b/i,
      replacement:
        'Bagian metodologi memerlukan klarifikasi lebih lanjut mengenai desain ' +
        'penelitian, strategi pengambilan sampel, prosedur pengumpulan data, dan ' +
        'kerangka analisis.',
    },
    {
      re: /\b(?:Poor|Weak|Lack).?(?:structure|organization|flow)/i,
      replacement:
        'The overall structure could be improved to enhance logical flow and ' +
        'readability; consider reorganizing the narrative to guide the reader ' +
        'more clearly from introduction to conclusion.',
    },
    {
      re: /\b(?:Kurang|Lemah).?(?:struktur|organisasi|alur)/i,
      replacement:
        'Struktur keseluruhan dapat ditingkatkan untuk memperbaiki alur logis dan ' +
        'keterbacaan; pertimbangkan untuk menata ulang narasi agar lebih jelas ' +
        'dari pendahuluan hingga kesimpulan.',
    },
    {
      re: /\b(?:Poor|Insufficient|Weak).?literature/i,
      replacement:
        'The literature review would benefit from a more comprehensive and recent ' +
        'coverage of related studies to better situate the contribution within the ' +
        'existing body of knowledge.',
    },
    {
      re: /\b(?:Kurang|Terbatas).?literatur/i,
      replacement:
        'Tinjauan pustaka dapat diperkaya dengan cakupan studi terkait yang lebih ' +
        'komprehensif dan terbaru agar kontribusi penelitian lebih jelas dalam ' +
        'lanskap pengetahuan yang ada.',
    },
  ];

  for (const p of weakPatterns) {
    enhanced = enhanced.replace(p.re, p.replacement);
  }

  // Normalize whitespace so the enhanced report renders cleanly.
  enhanced = enhanced.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return enhanced;
}

// ─── C. Missing Issue Detection ────────────────────────────────────────────

export function detectMissingIssues(
  humanReviewText: string,
  manuscript: ManuscriptMetadata
): AIObservation[] {
  const reviewLower = humanReviewText.toLowerCase();
  const observations: AIObservation[] = [];

  const abstractText = normalize(manuscript.abstract);
  const hasTheoretical =
    /\btheory\b|\bteori\b|\bframework\b|\bkerangka\b|\bconceptual\b|\mkonseptual\b/.test(reviewLower);
  const manuscriptHasTheory =
    /\btheory\b|\bteori\b|\bframework\b|\bkerangka\b|\bconceptual\b|\bkonseptual\b/.test(abstractText);

  if (manuscriptHasTheory && !hasTheoretical) {
    observations.push({
      aspect: 'Theoretical Connection',
      issue: 'The human review does not explicitly engage the theoretical/conceptual framework of the manuscript.',
      detail: 'Consider whether the theoretical connection is adequately addressed.',
    });
  }

  const hasMethodCritique = /\bmethod|\bmetodologi\b|\bmetode\b|\bdesign\b|\bsampling\b/.test(reviewLower);
  if (manuscriptHasTheory && !hasMethodCritique) {
    observations.push({
      aspect: 'Methodological Clarity',
      issue: 'Methodological aspects appear only lightly addressed in the human review.',
      detail: 'Clarify research design, sampling strategy, data collection, and analytical framework.',
    });
  }

  const hasLitEvaluation = /\bliterature|\bliteratur\b|\breference|\breferensi\b|\bcitation\b|\bsitasi\b/.test(reviewLower);
  if (!hasLitEvaluation) {
    observations.push({
      aspect: 'Literature Coverage',
      issue: 'The human review does not assess the sufficiency or currency of the literature review.',
      detail: 'Recent and relevant literature may need to be expanded or contextualized.',
    });
  }

  const hasDiscussion = /\bdiscussion|\bpembahasan\b|\binterpret|\bimpl\b|\bdampak\b/.test(reviewLower);
  if (!hasDiscussion) {
    observations.push({
      aspect: 'Discussion Depth',
      issue: 'Interpretation and broader implications of findings are not explicitly discussed.',
      detail: 'A stronger discussion of results relative to prior work may strengthen the manuscript.',
    });
  }

  return observations;
}

// ─── D. Structure Optimization ─────────────────────────────────────────────

export interface StructuredReport {
  generalComments: string[];
  majorConcerns: string[];
  minorConcerns: string[];
  specificRecommendations: string[];
}

export function organizeReport(
  humanReviewText: string,
  enhancedText: string
): StructuredReport {
  const lines = humanReviewText
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);

  const generalComments: string[] = [];
  const majorConcerns: string[] = [];
  const minorConcerns: string[] = [];
  const specificRecommendations: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/^(major|big|significant|critical|utama|penting|krusial)/.test(lower) || /^[0-9]+[.)]\s*(major|critical)/.test(lower)) {
      majorConcerns.push(line);
    } else if (/^(minor|small|style|format|kosmetik|minor)/.test(lower)) {
      minorConcerns.push(line);
    } else if (/(recommend|saran|suggest|sebaiknya|disarankan|doiogram|recommendation)/.test(lower)) {
      specificRecommendations.push(line);
    } else {
      generalComments.push(line);
    }
  }

  // If nothing was classified, put the enhanced text as the general comment.
  if (generalComments.length === 0 && enhancedText.trim()) {
    generalComments.push(enhancedText.trim());
  }

  return { generalComments, majorConcerns, minorConcerns, specificRecommendations };
}

// ─── E. Quality Assessment ────────────────────────────────────────────────

export function computeQualityScore(
  completeness: CompletenessResult,
  humanReviewText: string
): QualityScore {
  const wordCount = humanReviewText.trim().split(/\s+/).filter(Boolean).length;

  // Clarity: length + sentence structure heuristics.
  let clarity = 40;
  if (wordCount >= 40) clarity += 20;
  if (wordCount >= 120) clarity += 20;
  if (wordCount >= 250) clarity += 20;
  clarity = Math.min(100, clarity);

  // Professionalism: presence of structured, complete sentences.
  let professionalism = 50;
  const sentenceCount = (humanReviewText.match(/[.!?]/g) || []).length;
  if (sentenceCount >= 4) professionalism += 20;
  if (sentenceCount >= 8) professionalism += 15;
  if (completeness.covered.length >= 4) professionalism += 15;
  professionalism = Math.min(100, professionalism);

  return {
    completeness: completeness.score,
    clarity,
    professionalism,
  };
}

// ─── Severity determination ────────────────────────────────────────────────

export function determineSeverity(
  observations: AIObservation[],
  quality: QualityScore
): SeverityLevel {
  // Significant editorial attention when multiple substantive gaps exist.
  const substantive = observations.filter(o =>
    ['Theoretical Connection', 'Methodological Clarity', 'Discussion Depth'].includes(o.aspect)
  );
  if (substantive.length >= 2 || quality.completeness < 50) return 2;
  if (observations.length >= 1 || quality.completeness < 80) return 1;
  return 0;
}

// ─── Orchestrator ──────────────────────────────────────────────────────────

export class AIReviewEnhancementService {
  /**
   * Generate the enhancement for a completed human review report.
   * PURE: no database writes, no lifecycle calls, no assignment creation.
   */
  static generateEnhancement(
    review: HumanReviewInput,
    manuscript: ManuscriptMetadata
  ): EnhancementOutput {
    const humanReviewText = buildHumanReviewText(review);
    const manuscriptText = [
      manuscript.title,
      manuscript.abstract,
      Array.isArray(manuscript.keywords) ? manuscript.keywords.join(' ') : manuscript.keywords,
    ].filter(Boolean).join('\n');

    const completeness = analyzeCompleteness(humanReviewText, manuscriptText);
    const aiObservations = detectMissingIssues(humanReviewText, manuscript);
    const quality = computeQualityScore(completeness, humanReviewText);
    const severity = determineSeverity(aiObservations, quality);

    // Professional, restructured enhancement (derived output only).
    const enhanced = enhanceAcademicLanguage(
      [review.commentsForAuthor, review.correctionNotes, review.commentsForEditor]
        .filter(Boolean)
        .join('\n\n')
    );
    const structured = organizeReport(humanReviewText, enhanced);

    const enhancedReport = [
      '## Reviewer Comments (AI-Assisted Enhancement)',
      '',
      '### General Comments',
      ...(structured.generalComments.length ? structured.generalComments.map(c => `- ${c}`) : ['- No general comments provided.']),
      '',
      '### Major Concerns',
      ...(structured.majorConcerns.length ? structured.majorConcerns.map(c => `- ${c}`) : ['- No major concerns identified.']),
      '',
      '### Minor Concerns',
      ...(structured.minorConcerns.length ? structured.minorConcerns.map(c => `- ${c}`) : ['- No minor concerns identified.']),
      '',
      '### Specific Recommendations',
      ...(structured.specificRecommendations.length ? structured.specificRecommendations.map(c => `- ${c}`) : ['- See reviewer comments.']),
      '',
      '> Disclaimer: This enhanced rendering is AI-assisted and advisory only. ' +
        'It does not alter the human reviewer\'s recommendation or judgment.',
    ].join('\n');

    const originalReviewSnapshot = {
      reviewId: review.reviewId,
      submissionId: review.submissionId,
      recommendation: review.recommendation,
      comments_for_author: review.commentsForAuthor,
      comments_for_editor: review.commentsForEditor,
      correction_notes: review.correctionNotes,
    };

    return {
      originalReviewSnapshot,
      enhancedReviewContent: enhancedReport,
      qualityScore: quality,
      aiObservations,
      severityLevel: severity,
      enhancementEngine: 'AIReviewEnhancementService',
      enhancementVersion: '1.0',
      status: 'COMPLETED',
    };
  }

  /**
   * Role gate for running/reading the enhancement layer.
   * Editor-or-above (including co-admin who may manage reviews) may use it.
   * Strictly advisory — no lifecycle authority.
   */
  static canAccessEnhancement(actorRole: string | null | undefined): boolean {
    const r = normalizeRole(actorRole);
    return r === 'SUPER_ADMIN' || r === 'ADMIN' || r === 'EDITOR';
  }
}

export default AIReviewEnhancementService;
