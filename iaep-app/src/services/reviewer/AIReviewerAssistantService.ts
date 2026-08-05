// src/services/reviewer/AIReviewerAssistantService.ts
//
// AI REVIEWER ASSISTANT (IAEP)
//
// PURPOSE: Assist the HUMAN reviewer DURING the active review process.
//
// GOVERNANCE (non-negotiable):
//   - AI is an ASSISTANT to the human reviewer, NOT a reviewer itself.
//   - AI does NOT create a review report.
//   - AI does NOT replace the reviewer.
//   - AI does NOT submit a review.
//   - AI does NOT make editorial decisions.
//   - AI does NOT use reviewer_type='AI' (it never writes to review_assignments).
//
// ACCOUNTABILITY MODEL:
//   Human Reviewer = sole owner of academic judgment, recommendation, and the
//   final review report that is submitted to the editor.
//   This service = advisory guidance surfaced inside the reviewer workspace
//   to help the human reviewer be thorough and consistent.
//
// OUTPUT (advisory only, ephemeral — computed on demand, never persisted):
//   1. Academic Observations  — neutral/strength/concern signals derived from
//      manuscript metadata (title, abstract, keywords).
//   2. Review Considerations  — guiding questions for the human reviewer to
//      consider across key academic dimensions.
//   3. Completeness Checklist — whether the manuscript metadata signals each
//      required element (title, abstract, keywords, methodology, results,
//      discussion, conclusion, references).
//
// STRICT FORBIDDEN OPERATIONS:
//   - Writing to review_assignments (never uses reviewer_type='AI').
//   - Writing to submissions.status/stage.
//   - Calling SubmissionLifecycleService.
//   - Returning / deriving a recommendation, score, or editorial decision.
//
// DESIGN: fully deterministic (no external LLM dependency), unit-testable,
// auditable, and safe for double-blind review (it never reveals author
// identity).

import { normalizeRole } from '@/lib/roles';
import { parseAbstractEnvelope } from './ReviewerMatchingService';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ObservationSignal = 'strength' | 'concern' | 'neutral';

export interface AcademicObservation {
  dimension: string;
  signal: ObservationSignal;
  observation: string;
}

export interface ReviewConsideration {
  area: string;
  question: string;
}

export interface CompletenessChecklistItem {
  item: string;
  present: boolean;
  note?: string;
}

export interface ManuscriptSnapshot {
  title?: string | null;
  abstract?: string | null;
  keywords?: string[] | string | null;
  journalName?: string | null;
  hasFullText?: boolean;
}

export interface ReviewerAssistantOutput {
  manuscriptSnapshot: ManuscriptSnapshot;
  academicObservations: AcademicObservation[];
  reviewConsiderations: ReviewConsideration[];
  completenessChecklist: CompletenessChecklistItem[];
  /** Always included — reaffirms the human reviewer's sole authority. */
  disclaimer: string;
  engine: string;
  version: string;
}

// ─── Pure analysis helpers (deterministic) ─────────────────────────────────

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'for', 'to', 'and', 'or', 'with', 'by',
  'from', 'at', 'as', 'is', 'are', 'be', 'been', 'being', 'this', 'that',
  'these', 'those', 'it', 'its', 'of', 'yang', 'dan', 'atau', 'dari', 'ke',
  'di', 'pada', 'dengan', 'untuk', 'dalam', 'oleh', 'adalah', 'merupakan',
  'ini', 'itu', 'tersebut', 'serta', 'juga', 'tidak', 'akan', 'dapat',
  'sangat', 'perlu', 'harus', 'sebagai', 'sebuah', 'suatu', 'paper', 'article',
  'manuscript', 'authors', 'author', 'research', 'study', 'jurnal', 'artikel',
  'penelitian', 'studi', 'naskah', 'penulis',
]);

function normalize(v: string | null | undefined): string {
  return (v || '').toLowerCase().replace(/[^a-z0-9\s]/gi, ' ');
}

function tokenize(v: string | null | undefined, max = 400): string[] {
  return normalize(v)
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 3 && !STOPWORDS.has(t))
    .slice(0, max);
}

function hasAny(textLower: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(textLower));
}

// ─── Manuscript signal extraction ──────────────────────────────────────────

export interface ManuscriptSignal {
  title: string;
  abstractText: string;
  keywords: string[];
  titleTokens: string[];
  abstractTokens: string[];
  wordCount: number;
}

export function buildManuscriptSignal(snapshot: ManuscriptSnapshot): ManuscriptSignal {
  const rawAbstract = snapshot.abstract || '';
  let abstractText = rawAbstract;
  let keywords: string[] = [];

  // Abstract may be an envelope: { abstract_en, abstract_id, keywords, ... }
  if (typeof rawAbstract === 'string' && rawAbstract.trim().startsWith('{')) {
    try {
      const envelope = parseAbstractEnvelope(rawAbstract);
      abstractText = envelope.abstractText || rawAbstract;
      keywords = envelope.keywords.length ? envelope.keywords : keywords;
    } catch {
      abstractText = rawAbstract;
    }
  }

  if (keywords.length === 0) {
    if (Array.isArray(snapshot.keywords)) {
      keywords = snapshot.keywords.map(k => String(k));
    } else if (typeof snapshot.keywords === 'string') {
      keywords = snapshot.keywords.split(/[,;]/).map(k => k.trim()).filter(Boolean);
    }
  }

  const title = snapshot.title || '';
  return {
    title,
    abstractText,
    keywords,
    titleTokens: tokenize(title),
    abstractTokens: tokenize(abstractText),
    wordCount: abstractText.trim().split(/\s+/).filter(Boolean).length,
  };
}

// ─── A. Academic Observations ──────────────────────────────────────────────

export function buildAcademicObservations(signal: ManuscriptSignal): AcademicObservation[] {
  const observations: AcademicObservation[] = [];
  const absLower = signal.abstractText.toLowerCase();
  const titleLower = signal.title.toLowerCase();

  // 1. Title clarity
  if (signal.title.length < 10) {
    observations.push({
      dimension: 'Title',
      signal: 'concern',
      observation: 'The title appears short or low-signal. Consider whether it adequately conveys the study scope and contribution.',
    });
  } else if (signal.title.length >= 20) {
    observations.push({
      dimension: 'Title',
      signal: 'strength',
      observation: 'The title is reasonably descriptive, which should help readers and indexers understand the scope.',
    });
  }

  // 2. Abstract presence & length
  if (signal.abstractText.length < 120) {
    observations.push({
      dimension: 'Abstract',
      signal: 'concern',
      observation: 'The abstract is short or missing (<120 chars). A structured abstract strengthens clarity and discoverability.',
    });
  } else if (signal.wordCount >= 80 && signal.wordCount <= 350) {
    observations.push({
      dimension: 'Abstract',
      signal: 'strength',
      observation: `The abstract length (${signal.wordCount} words) is within the typical 80–350 word range.`,
    });
  } else {
    observations.push({
      dimension: 'Abstract',
      signal: 'neutral',
      observation: `The abstract is ${signal.wordCount} words; verify it still balances completeness and conciseness.`,
    });
  }

  // 3. Keywords
  if (signal.keywords.length === 0) {
    observations.push({
      dimension: 'Keywords',
      signal: 'concern',
      observation: 'No keywords were detected. Keywords are important for indexing and should be present.',
    });
  } else if (signal.keywords.length >= 3 && signal.keywords.length <= 6) {
    observations.push({
      dimension: 'Keywords',
      signal: 'strength',
      observation: `The manuscript provides ${signal.keywords.length} keyword(s), which is a suitable count (3–6).`,
    });
  } else {
    observations.push({
      dimension: 'Keywords',
      signal: 'neutral',
      observation: `The manuscript provides ${signal.keywords.length} keyword(s). Confirm they are specific and non-redundant.`,
    });
  }

  // 4. Methodological signal
  const hasMethod = hasAny(absLower, [
    /\bmethod/i, /\bmetodologi/i, /\bmetode/i, /\bapproach/i, /\bpendekatan/i,
    /\bsampling/i, /\bsample/i, /\bdesign/i, /\bdata collection/i, /\bdata/i,
  ]);
  observations.push({
    dimension: 'Methodology',
    signal: hasMethod ? 'strength' : 'concern',
    observation: hasMethod
      ? 'The abstract signals methodological content (design/sampling/data).'
      : 'No explicit methodological signal found in the abstract. Consider whether the method is adequately described.',
  });

  // 5. Results signal
  const hasResults = hasAny(absLower, [/\bresult/i, /\bfinding/i, /\bhasil/i, /\btemuan/i, /\boutcome/i]);
  observations.push({
    dimension: 'Results',
    signal: hasResults ? 'strength' : 'concern',
    observation: hasResults
      ? 'The abstract signals reported results/findings.'
      : 'No explicit results signal found in the abstract. Verify whether findings are summarized.',
  });

  // 6. Conclusion/implication signal
  const hasConclusion = hasAny(absLower, [
    /\bconclusion/i, /\bkesimpulan/i, /\bdiskusi/i, /\bdiscussion/i,
    /\bimplication/i, /\bdampak/i, /\brecommend/i, /\bsimpulan/i,
  ]);
  observations.push({
    dimension: 'Conclusion & Implications',
    signal: hasConclusion ? 'strength' : 'concern',
    observation: hasConclusion
      ? 'The abstract signals a conclusion or implications section.'
      : 'No explicit conclusion/implication signal found. Consider whether the manuscript closes with clear takeaways.',
  });

  // 7. Novelty / contribution signal
  const hasNovelty = hasAny(absLower, [
    /\bnovel/i, /\bnovelty/i, /\boriginal/i, /\bcontribution/i, /\bstate of the art/i,
    /\bkebaruan/i, /\binovasi/i, /\bkontribusi/i,
  ]);
  observations.push({
    dimension: 'Novelty & Contribution',
    signal: hasNovelty ? 'strength' : 'neutral',
    observation: hasNovelty
      ? 'The abstract signals a claim of novelty or contribution — assess whether it is substantiated.'
      : 'No explicit novelty/contribution claim detected in the abstract. Assess the contribution from the full text.',
  });

  // 8. Title-abstract keyword alignment
  const titleTokenSet = new Set(signal.titleTokens);
  const overlap = signal.keywords.filter(k => {
    const kt = tokenize(k);
    return kt.some(t => titleTokenSet.has(t));
  }).length;
  if (signal.keywords.length > 0 && overlap === 0) {
    observations.push({
      dimension: 'Title–Keyword Alignment',
      signal: 'concern',
      observation: 'None of the keywords appear related to title tokens. Verify keyword specificity and alignment.',
    });
  }

  return observations;
}

// ─── B. Review Considerations (guiding questions) ──────────────────────────

export function buildReviewConsiderations(signal: ManuscriptSignal): ReviewConsideration[] {
  const considerations: ReviewConsideration[] = [
    {
      area: 'Clarity & Aims',
      question: 'Is the research aim/question clearly stated and does the scope match the abstract?',
    },
    {
      area: 'Methodology',
      question: 'Is the research design appropriate, the sampling strategy sound, and the data collection reproducible?',
    },
    {
      area: 'Results & Evidence',
      question: 'Are the reported results complete, internally consistent, and supported by the data presented?',
    },
    {
      area: 'Discussion & Interpretation',
      question: 'Are findings interpreted relative to prior work, and are limitations acknowledged?',
    },
    {
      area: 'Conclusion & Contribution',
      question: 'Do the conclusions follow from the results, and is the contribution to the field clearly articulated?',
    },
    {
      area: 'Literature & Rigour',
      question: 'Is the literature review current and relevant, and are claims appropriately supported by citations?',
    },
    {
      area: 'Language & Structure',
      question: 'Is the manuscript well-structured and readable, and is the academic language precise?',
    },
  ];

  // Add a targeted consideration when a likely gap is detected.
  if (signal.wordCount > 0 && signal.wordCount < 80) {
    considerations.unshift({
      area: 'Abstract Completeness',
      question: 'The abstract is short — does it adequately cover aim, method, results, and conclusion?',
    });
  }
  if (signal.keywords.length === 0) {
    considerations.unshift({
      area: 'Keywords',
      question: 'The manuscript metadata lacks keywords — should this be flagged for the author to add?',
    });
  }

  return considerations;
}

// ─── C. Completeness Checklist ─────────────────────────────────────────────

export interface ManuscriptFlags {
  hasTitle: boolean;
  hasAbstract: boolean;
  hasKeywords: boolean;
  hasMethod: boolean;
  hasResults: boolean;
  hasDiscussion: boolean;
  hasConclusion: boolean;
  hasReferencesSignal: boolean;
}

export function evaluateManuscriptFlags(signal: ManuscriptSignal): ManuscriptFlags {
  const absLower = signal.abstractText.toLowerCase();
  return {
    hasTitle: signal.title.trim().length >= 5,
    hasAbstract: signal.abstractText.trim().length >= 40,
    hasKeywords: signal.keywords.length > 0,
    hasMethod: hasAny(absLower, [/\bmethod/i, /\bmetodologi/i, /\bmetode/i, /\bapproach/i, /\bpendekatan/i, /\bsampling/i, /\bdata/i, /\bdesign/i]),
    hasResults: hasAny(absLower, [/\bresult/i, /\bfinding/i, /\bhasil/i, /\btemuan/i]),
    hasDiscussion: hasAny(absLower, [/\bdiscussion/i, /\bpembahasan/i, /\binterpret/i, /\bimplication/i]),
    hasConclusion: hasAny(absLower, [/\bconclusion/i, /\bkesimpulan/i, /\bsimpulan/i, /\bconcluding/i]),
    hasReferencesSignal: hasAny(absLower, [/\breference/i, /\breferensi/i, /\bbibliograph/i, /\bcitation/i, /\bsitasi/i, /\bdaftar.pustaka/i]),
  };
}

export function buildCompletenessChecklist(flags: ManuscriptFlags): CompletenessChecklistItem[] {
  return [
    {
      item: 'Title present & descriptive',
      present: flags.hasTitle,
      note: flags.hasTitle ? undefined : 'No sufficiently descriptive title detected in metadata.',
    },
    {
      item: 'Abstract present',
      present: flags.hasAbstract,
      note: flags.hasAbstract ? undefined : 'Abstract missing or too short in metadata.',
    },
    {
      item: 'Keywords provided',
      present: flags.hasKeywords,
      note: flags.hasKeywords ? undefined : 'No keywords detected in metadata.',
    },
    {
      item: 'Methodology described',
      present: flags.hasMethod,
      note: flags.hasMethod ? undefined : 'No methodological signal found in the abstract.',
    },
    {
      item: 'Results reported',
      present: flags.hasResults,
      note: flags.hasResults ? undefined : 'No results signal found in the abstract.',
    },
    {
      item: 'Discussion present',
      present: flags.hasDiscussion,
      note: flags.hasDiscussion ? undefined : 'No discussion/implication signal found in the abstract.',
    },
    {
      item: 'Conclusion provided',
      present: flags.hasConclusion,
      note: flags.hasConclusion ? undefined : 'No conclusion signal found in the abstract.',
    },
    {
      item: 'References / citations signalled',
      present: flags.hasReferencesSignal,
      note: flags.hasReferencesSignal ? undefined : 'No reference/citation signal found in the abstract (verify in full text).',
    },
  ];
}

// ─── Orchestrator ──────────────────────────────────────────────────────────

export class AIReviewerAssistantService {
  /**
   * Generate the advisory assistant output for a human reviewer.
   * PURE: no DB writes, no lifecycle calls, no assignment creation,
   * no report generation, no recommendation/decision.
   */
  static generateAssistant(snapshot: ManuscriptSnapshot): ReviewerAssistantOutput {
    const signal = buildManuscriptSignal(snapshot);
    const flags = evaluateManuscriptFlags(signal);

    return {
      manuscriptSnapshot: {
        title: snapshot.title ?? null,
        abstract: snapshot.abstract ?? null,
        keywords: snapshot.keywords ?? null,
        journalName: snapshot.journalName ?? null,
        hasFullText: snapshot.hasFullText ?? false,
      },
      academicObservations: buildAcademicObservations(signal),
      reviewConsiderations: buildReviewConsiderations(signal),
      completenessChecklist: buildCompletenessChecklist(flags),
      disclaimer:
        'This AI Reviewer Assistant is advisory guidance only. It does not create, ' +
        'replace, or submit your review. You, the human reviewer, remain the sole ' +
        'authority over your academic judgment, recommendation, and final review report.',
      engine: 'AIReviewerAssistantService',
      version: '1.0',
    };
  }

  /**
   * Role gate for using the AI Reviewer Assistant.
   * REVIEWER (and above) may use it. Authors are never granted access.
   */
  static canAccessAssistant(actorRole: string | null | undefined): boolean {
    const r = normalizeRole(actorRole);
    return (
      r === 'SUPER_ADMIN' ||
      r === 'ADMIN' ||
      r === 'EDITOR' ||
      r === 'REVIEWER'
    );
  }
}

export default AIReviewerAssistantService;
