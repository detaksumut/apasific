// src/services/at-rqs/types.ts

/**
 * APASIFIC Tri-Source Research Quality Score™ (AT-RQS™) v1.0
 * Type Definitions & Data Contract
 */

export interface ScoreLayerInput {
  topic_relevance?: number;       // 0-10
  article_structure?: number;     // 0-10
  abstract?: number;              // 0-10
  research_gap?: number;          // 0-10
  methodology?: number;           // 0-10
  data_statistics?: number;       // 0-10
  discussion?: number;            // 0-10
  conclusion?: number;            // 0-10
  references?: number;            // 0-10
  overall_score?: number;         // 0-10
}

export interface ScreenLayerInput {
  novelty_rating?: number;        // 1-5
  methodology_rating?: number;    // 1-5
  clarity_rating?: number;        // 1-5
  confidence_score?: number;      // 0-100 percentage
  summary_evaluation?: string;
  suggested_improvements?: string;
}

export interface ClueLayerInput {
  objective?: string;
  methodology?: string;
  sample_size?: number | string;
  sampling_strategy?: string;
  findings?: string;
  conclusion?: string;
  limitations?: string;
  practical_implications?: string;
  policy_relevance?: string;
  explained_variance?: string;   // e.g. "53.7%"
  model_statistics?: string;      // e.g. "F=15.294, p=0.000, R2=0.574"
  raw_clue_text?: string;
}

export interface TriSourceInput {
  articleId: string;
  title?: string;
  abstract?: string;
  doi?: string;
  scoreLayer?: ScoreLayerInput | null;
  screenLayer?: ScreenLayerInput | null;
  clueLayer?: ClueLayerInput | null;
}

export interface ATRQSDimensionBreakdown {
  academic_contribution: number;   // 0-100 (18%)
  procedural_rigor: number;        // 0-100 (18%)
  analytical_strength: number;     // 0-100 (16%)
  scholarly_communication: number; // 0-100 (12%)
  integrity_transparency: number;  // 0-100 (12%)
  future_research_value: number;   // 0-100 (10%)
  impact_applicability: number;    // 0-100 (14%)
}

export interface ATRQSScoreProvenance {
  score_layer_norm: number;        // 0-100
  screen_layer_norm: number;       // 0-100
  clue_layer_norm: number;         // 0-100
  base_weighted_score: number;     // 0-100
  consistency_factor: number;      // 0.85 - 1.00
  evidence_elements_detected: number; // 0-5
  evidence_coverage_ratio: number; // 0.0 - 1.0 (ECF)
}

export type QualityLevel = 
  | "EXEMPLARY RESEARCH RIGOR"
  | "STRONG RESEARCH QUALITY"
  | "GOOD RESEARCH QUALITY"
  | "SATISFACTORY WITH LIMITATIONS"
  | "PRELIMINARY EVIDENCE";

export interface ATRQSSnapshot {
  assessment_id: string;             // e.g. "APS-AT-RQS-3866e0a6-v1.0"
  article_id: string;
  framework_version: "v1.0";
  algorithm_version: "AT-RQS-1.0";
  timestamp: string;
  
  // 4 Core Identity Layers
  at_rqs: number;                    // 0-100 (e.g. 82.6)
  at_rqs_ten_scale: number;          // 0.0 - 10.0 (e.g. 8.26)
  quality_level: QualityLevel;
  
  aeci: number;                      // 0-100 (Evidence Consistency Index)
  arti: number;                      // 0-100 (Tri-Source Agreement / Triangulation)
  aac: number;                       // 0-100% (Assessment Confidence)
  
  // Dimensional Profile
  dimension_scores: ATRQSDimensionBreakdown;
  
  // Provenance & Source Contribution
  provenance: ATRQSScoreProvenance;
  
  // Qualitative Insights
  primary_strength: string;
  secondary_strength: string;
  documented_limitations: string[];
  research_opportunities: string[];
  
  // Governance Metadata
  governance_disclaimer: string;
  is_fallback: boolean;
}
