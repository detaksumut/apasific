import { ReputationEvidenceSnapshot } from '../../domain/academic-reputation/ReputationEvidenceSnapshot';

export interface ReputationExplanation {
  score: number;
  level: string;
  reasons: string[];
}

/**
 * Phase G.4: Evidence Explanation Engine
 * Translates evidence snapshots into human-readable transparency reports.
 */
export class ReputationExplanationService {

  /**
   * Generates a readable explanation of why a score is what it is.
   */
  public explainScore(score: number, level: string, snapshots: ReputationEvidenceSnapshot[]): ReputationExplanation {
    const reasons: string[] = [];

    // Analyze evidence to form natural language reasoning.
    snapshots.forEach(snapshot => {
      if (snapshot.evidenceType === 'ARTICLE_PUBLISHED') {
        reasons.push(`Active knowledge creation evidenced by publication (${snapshot.evidenceReference}).`);
      }
      if (snapshot.evidenceType === 'CITATION_IMPACT') {
        reasons.push(`Demonstrated academic influence via citation impact (${snapshot.value.citations} citations).`);
      }
      if (snapshot.evidenceType === 'CREDENTIAL_ISSUED') {
        reasons.push(`Verified professional qualification achieved (${snapshot.evidenceReference}).`);
      }
      if (snapshot.evidenceType === 'IDENTITY_VERIFIED') {
        reasons.push(`Core identity is verified, contributing to baseline trust.`);
      }
    });

    // Deduplicate and fallback
    const uniqueReasons = [...new Set(reasons)];
    if (uniqueReasons.length === 0) {
      uniqueReasons.push("Score is based on preliminary or emerging academic data.");
    }

    return {
      score,
      level,
      reasons: uniqueReasons
    };
  }
}
