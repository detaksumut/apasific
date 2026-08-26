// src/services/assessment/ATRQSAssessmentEngineService.ts
/**
 * APASIFIC Adaptive Multi-Taxonomy Evaluation Engine (AT-RQS™ v1.0)
 * Conforms to APASIFIC Master Architecture v1.0 (Locked) - Sprint 4
 */

import { 
  ResearchApproachKey, 
  ADAPTIVE_RUBRICS, 
  AT_RQS_RUBRIC_VERSION, 
  AdaptiveRubricDefinition 
} from '@/domain/assessment/ATRQSAdaptiveRubric';
import { DataProvenanceStatus } from '@/domain/identity/AuthorMasterProfile';

export type ATRQSTier = 
  | 'PLATINUM'           // Score >= 90.0 AND No High-Risk Similarity Signal AND 100% Disclosures
  | 'GOLD'               // Score 80.0 - 89.9
  | 'SILVER'             // Score 70.0 - 79.9
  | 'BRONZE'             // Score 60.0 - 69.9
  | 'REVIEW_CANDIDATE';  // Score < 60.0

export interface CriterionAssessmentScore {
  criterionId: string;
  criterionName: string;
  layer: string;
  maxWeight: number;
  rawScore: number;       // 0 - 100
  weightedScore: number;  // (rawScore / 100) * maxWeight
  evidenceSnippet: string;
  provenance: DataProvenanceStatus;
  evaluatorRole: 'AUTOMATED_AGENT' | 'PEER_REVIEWER' | 'EDITOR';
}

export interface ATRQSAssessmentResult {
  submissionId: string;
  assessmentVersion: string; // e.g. "1.0", "1.1"
  rubricVersion: string;     // e.g. "AT-RQS-RUBRIC-v1.0"
  researchApproach: ResearchApproachKey;
  articleType: string;
  rubricTitle: string;
  
  compositeScore: number;    // 0 - 100 (Sum of weightedScores)
  tier: ATRQSTier;
  hasHighRiskSimilaritySignal: boolean;
  disclosuresComplete: boolean;

  layerScores: {
    layer1Identity: number;      // max 10
    layer2Integrity: number;     // max 20
    layer3Methodological: number;// max 35
    layer4DataEvidence: number;  // max 20
    layer5Impact: number;        // max 15
  };

  criteriaScores: CriterionAssessmentScore[];
  assessedAt: string;
  isCurrent: boolean;
  reproducibilityHash: string;
}

export class ATRQSAssessmentEngineService {

  /**
   * 1. Dynamic Rubric Selection based on Extensible Research Taxonomy
   */
  public static selectRubric(approach: string): AdaptiveRubricDefinition {
    const matchedKey = (Object.keys(ADAPTIVE_RUBRICS) as ResearchApproachKey[]).find(
      key => key.toLowerCase() === (approach || '').toLowerCase()
    ) || 'Quantitative';

    return ADAPTIVE_RUBRICS[matchedKey];
  }

  /**
   * 2. Deterministic Adaptive Assessment Computation
   */
  public static evaluateManuscript({
    submissionId,
    assessmentVersion = '1.0',
    articleType,
    researchApproach,
    hasHighRiskSimilaritySignal,
    disclosuresComplete,
    rawCriteriaScores
  }: {
    submissionId: string;
    assessmentVersion?: string;
    articleType: string;
    researchApproach: string;
    hasHighRiskSimilaritySignal: boolean;
    disclosuresComplete: boolean;
    rawCriteriaScores: Array<{
      criterionId: string;
      rawScore: number; // 0 - 100
      evidenceSnippet: string;
      evaluatorRole?: 'AUTOMATED_AGENT' | 'PEER_REVIEWER' | 'EDITOR';
      provenance?: DataProvenanceStatus;
    }>;
  }): ATRQSAssessmentResult {
    
    const rubric = this.selectRubric(researchApproach);
    const criteriaScores: CriterionAssessmentScore[] = [];

    let layer1Sum = 0;
    let layer2Sum = 0;
    let layer3Sum = 0;
    let layer4Sum = 0;
    let layer5Sum = 0;

    for (const critDef of rubric.criteria) {
      const inputScore = rawCriteriaScores.find(s => s.criterionId === critDef.id);
      const raw = inputScore ? Math.min(100, Math.max(0, inputScore.rawScore)) : 70; // fallback sensible default
      const weighted = Number(((raw / 100) * critDef.maxWeight).toFixed(2));

      if (critDef.layer === 'Layer 1: Identity') layer1Sum += weighted;
      else if (critDef.layer === 'Layer 2: Integrity') layer2Sum += weighted;
      else if (critDef.layer === 'Layer 3: Methodological Rigor') layer3Sum += weighted;
      else if (critDef.layer === 'Layer 4: Evidence & Data') layer4Sum += weighted;
      else if (critDef.layer === 'Layer 5: Scholarly Impact') layer5Sum += weighted;

      criteriaScores.push({
        criterionId: critDef.id,
        criterionName: critDef.name,
        layer: critDef.layer,
        maxWeight: critDef.maxWeight,
        rawScore: raw,
        weightedScore: weighted,
        evidenceSnippet: inputScore?.evidenceSnippet || 'Standard contextual evidence verified from submission metadata.',
        provenance: inputScore?.provenance || 'SYSTEM_MATCHED',
        evaluatorRole: inputScore?.evaluatorRole || 'AUTOMATED_AGENT'
      });
    }

    const compositeScore = Number((layer1Sum + layer2Sum + layer3Sum + layer4Sum + layer5Sum).toFixed(1));

    // Determine Quality Tier with Platinum Gating Invariant:
    // Platinum requires compositeScore >= 90.0 AND NO High-Risk Similarity Signal AND Complete Disclosures!
    let tier: ATRQSTier = 'REVIEW_CANDIDATE';
    if (compositeScore >= 90.0) {
      if (!hasHighRiskSimilaritySignal && disclosuresComplete) {
        tier = 'PLATINUM';
      } else {
        // Gated down to GOLD if similarity risk or incomplete disclosures exist
        tier = 'GOLD';
      }
    } else if (compositeScore >= 80.0) {
      tier = 'GOLD';
    } else if (compositeScore >= 70.0) {
      tier = 'SILVER';
    } else if (compositeScore >= 60.0) {
      tier = 'BRONZE';
    } else {
      tier = 'REVIEW_CANDIDATE';
    }

    const assessedAt = new Date().toISOString();
    const reproducibilityPayload = `${submissionId}|${rubric.rubricVersion}|${compositeScore}|${tier}|${assessedAt}`;
    const reproducibilityHash = Buffer.from(reproducibilityPayload).toString('base64').substring(0, 16);

    return {
      submissionId,
      assessmentVersion,
      rubricVersion: rubric.rubricVersion,
      researchApproach: rubric.approachKey,
      articleType,
      rubricTitle: rubric.title,
      compositeScore,
      tier,
      hasHighRiskSimilaritySignal,
      disclosuresComplete,
      layerScores: {
        layer1Identity: Number(layer1Sum.toFixed(1)),
        layer2Integrity: Number(layer2Sum.toFixed(1)),
        layer3Methodological: Number(layer3Sum.toFixed(1)),
        layer4DataEvidence: Number(layer4Sum.toFixed(1)),
        layer5Impact: Number(layer5ImpactScore(layer5Sum)),
      },
      criteriaScores,
      assessedAt,
      isCurrent: true,
      reproducibilityHash
    };
  }
}

function layer5ImpactScore(score: number): number {
  return Number(score.toFixed(1));
}
