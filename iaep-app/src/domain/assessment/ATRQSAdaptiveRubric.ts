// src/domain/assessment/ATRQSAdaptiveRubric.ts
/**
 * APASIFIC Adaptive Multi-Taxonomy Evaluation Engine (AT-RQS™ v1.0)
 * Conforms to APASIFIC Master Architecture v1.0 (Locked) - Sprint 4
 * 
 * Guarantees Methodological Specialization:
 * Quantitative -> Statistical / Empirical Rigor
 * Qualitative -> Interpretive / Trustworthiness Rigor (No forced stats!)
 * Systematic Review (SLR / PRISMA) -> Search & Screening Rigor
 * Conceptual / Theoretical -> Conceptual Coherence & Dialectical Rigor
 * Legal-Normative -> Doctrinal & Statutory Rigor
 */

export type ResearchApproachKey = 
  | 'Quantitative'
  | 'Qualitative'
  | 'Mixed-Methods'
  | 'Meta-Analysis / SLR'
  | 'Conceptual / Theoretical'
  | 'Legal-Normative'
  | 'Experimental'
  | 'Bibliometric';

export interface RubricCriterion {
  id: string;
  name: string;
  description?: string;
  layer: 'Layer 1: Identity' | 'Layer 2: Integrity' | 'Layer 3: Methodological Rigor' | 'Layer 4: Evidence & Data' | 'Layer 5: Scholarly Impact';
  maxWeight: number; // Percentage contribution
}

export interface AdaptiveRubricDefinition {
  rubricVersion: string;
  approachKey: ResearchApproachKey;
  title: string;
  description: string;
  criteria: RubricCriterion[];
}

export const AT_RQS_RUBRIC_VERSION = 'AT-RQS-RUBRIC-v1.0';

export const ADAPTIVE_RUBRICS: Record<ResearchApproachKey, AdaptiveRubricDefinition> = {
  'Quantitative': {
    rubricVersion: AT_RQS_RUBRIC_VERSION,
    approachKey: 'Quantitative',
    title: 'Quantitative Empirical Evaluation Rubric',
    description: 'Specialized for statistical testing, hypothesis verification, sample representativeness, construct validity, and econometric/statistical rigor.',
    criteria: [
      { id: 'L1_TAXONOMY', name: 'Taxonomy & Scope Congruence', layer: 'Layer 1: Identity', maxWeight: 10 },
      { id: 'L2_INTEGRITY', name: 'Ethics, AI Transparency & Disclosures', layer: 'Layer 2: Integrity', maxWeight: 20 },
      { id: 'L3_STAT_RIGOR', name: 'Sampling, Statistical Testing & Construct Validity', layer: 'Layer 3: Methodological Rigor', maxWeight: 35 },
      { id: 'L4_DATA_OPEN', name: 'Empirical Data Openness & Reproducibility', layer: 'Layer 4: Evidence & Data', maxWeight: 20 },
      { id: 'L5_IMPACT', name: 'Theoretical & Practical Contribution', layer: 'Layer 5: Scholarly Impact', maxWeight: 15 }
    ]
  },
  'Qualitative': {
    rubricVersion: AT_RQS_RUBRIC_VERSION,
    approachKey: 'Qualitative',
    title: 'Qualitative Interpretive Evaluation Rubric',
    description: 'Specialized for phenomenological depth, reflexivity, informant saturation, thick description, and qualitative trustworthiness (No statistical testing required).',
    criteria: [
      { id: 'L1_TAXONOMY', name: 'Taxonomy & Scope Congruence', layer: 'Layer 1: Identity', maxWeight: 10 },
      { id: 'L2_INTEGRITY', name: 'Informed Consent, Ethics & AI Transparency', layer: 'Layer 2: Integrity', maxWeight: 20 },
      { id: 'L3_QUAL_RIGOR', name: 'Reflexivity, Informant Saturation & Thick Description', layer: 'Layer 3: Methodological Rigor', maxWeight: 35 },
      { id: 'L4_AUDIT_TRAIL', name: 'Audit Trail, Interview Corpus & Verbatim Evidencing', layer: 'Layer 4: Evidence & Data', maxWeight: 20 },
      { id: 'L5_IMPACT', name: 'Conceptual Resonance & Contextual Insight', layer: 'Layer 5: Scholarly Impact', maxWeight: 15 }
    ]
  },
  'Meta-Analysis / SLR': {
    rubricVersion: AT_RQS_RUBRIC_VERSION,
    approachKey: 'Meta-Analysis / SLR',
    title: 'Systematic Literature Review (PRISMA / SLR) Rubric',
    description: 'Specialized for multi-database search protocol, PRISMA flow transparency, inclusion/exclusion eligibility, and cross-study synthesis.',
    criteria: [
      { id: 'L1_TAXONOMY', name: 'Review Scope & Research Questions', layer: 'Layer 1: Identity', maxWeight: 10 },
      { id: 'L2_INTEGRITY', name: 'Review Protocol Transparency & AI Disclosures', layer: 'Layer 2: Integrity', maxWeight: 20 },
      { id: 'L3_PRISMA_RIGOR', name: 'Search Strategy, Eligibility & PRISMA Compliance', layer: 'Layer 3: Methodological Rigor', maxWeight: 35 },
      { id: 'L4_CORPUS_DATA', name: 'Extracted Corpus Dataset & Critical Appraisal', layer: 'Layer 4: Evidence & Data', maxWeight: 20 },
      { id: 'L5_IMPACT', name: 'Synthesis Quality, Gaps Identification & Future Agenda', layer: 'Layer 5: Scholarly Impact', maxWeight: 15 }
    ]
  },
  'Conceptual / Theoretical': {
    rubricVersion: AT_RQS_RUBRIC_VERSION,
    approachKey: 'Conceptual / Theoretical',
    title: 'Conceptual & Theoretical Synthesis Rubric',
    description: 'Specialized for theoretical coherence, dialectical argumentation, paradigm positioning, and conceptual framework novelty.',
    criteria: [
      { id: 'L1_TAXONOMY', name: 'Paradigm & Theoretical Framework Context', layer: 'Layer 1: Identity', maxWeight: 10 },
      { id: 'L2_INTEGRITY', name: 'Academic Attribution, AI Disclosures & Originality', layer: 'Layer 2: Integrity', maxWeight: 20 },
      { id: 'L3_THEORY_RIGOR', name: 'Dialectical Argumentation & Conceptual Coherence', layer: 'Layer 3: Methodological Rigor', maxWeight: 35 },
      { id: 'L4_SCHOLARLY_EVID', name: 'Literature Grounding & Critical Comparative Synthesis', layer: 'Layer 4: Evidence & Data', maxWeight: 20 },
      { id: 'L5_IMPACT', name: 'Conceptual Novelty & Paradigm Expansion', layer: 'Layer 5: Scholarly Impact', maxWeight: 15 }
    ]
  },
  'Legal-Normative': {
    rubricVersion: AT_RQS_RUBRIC_VERSION,
    approachKey: 'Legal-Normative',
    title: 'Doctrinal & Normative Legal Rubric',
    description: 'Specialized for statutory hierarchy analysis, case law hermeneutics, doctrinal reasoning, and legal coherence.',
    criteria: [
      { id: 'L1_TAXONOMY', name: 'Legal Issue Identification & Jurisdiction', layer: 'Layer 1: Identity', maxWeight: 10 },
      { id: 'L2_INTEGRITY', name: 'Attribution, Normative Integrity & AI Disclosures', layer: 'Layer 2: Integrity', maxWeight: 20 },
      { id: 'L3_DOCTRINAL_RIGOR', name: 'Statutory Hierarchy, Case Law & Doctrinal Coherence', layer: 'Layer 3: Methodological Rigor', maxWeight: 35 },
      { id: 'L4_LEGAL_SOURCES', name: 'Primary & Secondary Legal Source Exhaustivity', layer: 'Layer 4: Evidence & Data', maxWeight: 20 },
      { id: 'L5_IMPACT', name: 'Jurisprudential Contribution & Policy Reform', layer: 'Layer 5: Scholarly Impact', maxWeight: 15 }
    ]
  },
  'Mixed-Methods': {
    rubricVersion: AT_RQS_RUBRIC_VERSION,
    approachKey: 'Mixed-Methods',
    title: 'Mixed-Methods Integration Rubric',
    description: 'Specialized for convergent/sequential designs, quantitative-qualitative integration, and cross-method validity.',
    criteria: [
      { id: 'L1_TAXONOMY', name: 'Mixed-Method Design Rationalization', layer: 'Layer 1: Identity', maxWeight: 10 },
      { id: 'L2_INTEGRITY', name: 'Ethics, Informed Consent & AI Transparency', layer: 'Layer 2: Integrity', maxWeight: 20 },
      { id: 'L3_MIXED_RIGOR', name: 'Method Integration, Convergence & Strands Rigor', layer: 'Layer 3: Methodological Rigor', maxWeight: 35 },
      { id: 'L4_DATA_OPEN', name: 'Dual Evidence Openness & Audit Trail', layer: 'Layer 4: Evidence & Data', maxWeight: 20 },
      { id: 'L5_IMPACT', name: 'Meta-Inference Quality & Substantive Insights', layer: 'Layer 5: Scholarly Impact', maxWeight: 15 }
    ]
  },
  'Experimental': {
    rubricVersion: AT_RQS_RUBRIC_VERSION,
    approachKey: 'Experimental',
    title: 'Experimental & Laboratory Evaluation Rubric',
    description: 'Specialized for control group validity, experimental protocol reproducibility, instrument calibration, and statistical significance.',
    criteria: [
      { id: 'L1_TAXONOMY', name: 'Experimental Setup & Variable Definitions', layer: 'Layer 1: Identity', maxWeight: 10 },
      { id: 'L2_INTEGRITY', name: 'Biosafety / Lab Ethics & AI Transparency', layer: 'Layer 2: Integrity', maxWeight: 20 },
      { id: 'L3_EXP_RIGOR', name: 'Control Protocols, Calibration & Statistical Power', layer: 'Layer 3: Methodological Rigor', maxWeight: 35 },
      { id: 'L4_LAB_DATA', name: 'Raw Experimental Data & Protocol Openness', layer: 'Layer 4: Evidence & Data', maxWeight: 20 },
      { id: 'L5_IMPACT', name: 'Empirical Verification & Technological Advance', layer: 'Layer 5: Scholarly Impact', maxWeight: 15 }
    ]
  },
  'Bibliometric': {
    rubricVersion: AT_RQS_RUBRIC_VERSION,
    approachKey: 'Bibliometric',
    title: 'Bibliometrics & Scientometrics Evaluation Rubric',
    description: 'Specialized for Scopus/WoS query syntax reproducibility, co-citation mapping, network analysis metrics, and thematic clustering.',
    criteria: [
      { id: 'L1_TAXONOMY', name: 'Bibliometric Query & Thematic Scope', layer: 'Layer 1: Identity', maxWeight: 10 },
      { id: 'L2_INTEGRITY', name: 'Database Query Reproducibility & AI Transparency', layer: 'Layer 2: Integrity', maxWeight: 20 },
      { id: 'L3_BIBLIO_RIGOR', name: 'Co-occurrence, Coupling & Network Analysis Metrics', layer: 'Layer 3: Methodological Rigor', maxWeight: 35 },
      { id: 'L4_RAW_EXPORT', name: 'Bibliographic Dataset & Software Script Openness', layer: 'Layer 4: Evidence & Data', maxWeight: 20 },
      { id: 'L5_IMPACT', name: 'Intellectual Structure Mapping & Research Trends', layer: 'Layer 5: Scholarly Impact', maxWeight: 15 }
    ]
  }
};
