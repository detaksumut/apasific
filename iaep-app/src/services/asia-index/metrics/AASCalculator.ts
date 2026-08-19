// src/services/asia-index/metrics/AASCalculator.ts
/**
 * AASCalculator — ASIA Article Score Engine (Level Article).
 * 
 * Strict Mathematical Guarantees:
 * 1. Strictly bounded to [0.00, 100.00].
 * 2. Component maximums: Provenance <= 40.0, Citation <= 35.0, Velocity <= 15.0, Network <= 10.0.
 * 3. Exact single-classification self-citation damping and topology confidence weighting applied exactly ONCE.
 */

import type { AASCalculationInput, AASResult, MetricState } from './types';

export class AASCalculator {
  public static readonly FORMULA_VERSION = 'AAS-1.2-NORMALIZED-BOUNDED';
  public static readonly TARGET_CITATION_WEIGHT = 50.0;
  public static readonly TARGET_VELOCITY = 5.0;

  /**
   * Evaluates the effective edge weight applied exactly ONCE.
   * W_eff = W_damp * W_conf
   */
  public static getEffectiveEdgeWeight(
    selfClass: 'EXTERNAL_CITATION' | 'AUTHOR_SELF_ONLY' | 'JOURNAL_SELF_ONLY' | 'AUTHOR_AND_JOURNAL_SELF',
    topologyConfidence: 'NORMAL' | 'SUSPICIOUS' | 'FLAGGED'
  ): number {
    let damp = 1.00;
    switch (selfClass) {
      case 'AUTHOR_AND_JOURNAL_SELF':
        damp = 0.35;
        break;
      case 'JOURNAL_SELF_ONLY':
        damp = 0.50;
        break;
      case 'AUTHOR_SELF_ONLY':
        damp = 0.60;
        break;
      case 'EXTERNAL_CITATION':
      default:
        damp = 1.00;
        break;
    }

    let conf = 1.00;
    switch (topologyConfidence) {
      case 'FLAGGED':
        conf = 0.50;
        break;
      case 'SUSPICIOUS':
        conf = 0.75;
        break;
      case 'NORMAL':
      default:
        conf = 1.00;
        break;
    }

    return +(damp * conf).toFixed(4);
  }

  /**
   * Calculates the mathematically bounded ASIA Article Score (AAS).
   */
  public static calculateAAS(input: AASCalculationInput): AASResult {
    const pubYear = new Date(input.publishedDate).getFullYear() || new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const deltaYears = Math.max(0, currentYear - pubYear);

    // 1. Provenance Component (0 - 40 pts)
    const provScore = Math.max(0, Math.min(100, Number(input.provenanceScore) || 0));
    const cProv = +(40.0 * (provScore / 100.0)).toFixed(2);

    // 2. Citation Component (0 - 35 pts)
    let weightedSum = 0;
    for (const cite of input.citations) {
      const wEff = this.getEffectiveEdgeWeight(cite.selfClass, cite.topologyConfidence);
      const prestige = Math.max(0.35, Math.min(5.0, Number(cite.sourcePrestige) || 1.00));
      weightedSum += wEff * prestige;
    }

    const logNumerator = Math.log(1 + Math.max(0, weightedSum));
    const logDenominator = Math.log(1 + this.TARGET_CITATION_WEIGHT);
    const citNormalizedRatio = Math.min(1.0, Math.max(0.0, logNumerator / logDenominator));
    const cCit = +(35.0 * citNormalizedRatio).toFixed(2);

    // 3. Velocity Component (0 - 15 pts)
    const totalCites = input.citations.length;
    const velocityPerYear = +(totalCites / Math.max(1, deltaYears || 1)).toFixed(2);
    const velNormalizedRatio = Math.min(1.0, Math.max(0.0, velocityPerYear / this.TARGET_VELOCITY));
    const cVel = +(15.0 * velNormalizedRatio).toFixed(2);

    // 4. Scholarly Network Diversity Component (0 - 10 pts)
    const uniqueJournals = Math.max(0, input.uniqueCitingJournalsCount || 0);
    const journalDiversityRatio = totalCites > 0 
      ? Math.min(1.0, uniqueJournals / Math.max(1, totalCites))
      : 0.50; // Neutral baseline for fresh publications
    const orcidBonus = input.hasOrcidLinked ? 1.0 : 0.0;
    const networkComposite = Math.min(1.0, (0.60 * journalDiversityRatio) + (0.40 * orcidBonus));
    const cNet = +(10.0 * networkComposite).toFixed(2);

    // 5. Time Continuity Factor (0.85 - 1.00)
    const continuityDecay = +(Math.max(0.85, Math.min(1.0, 1.0 / (1.0 + 0.02 * deltaYears)))).toFixed(4);

    // Final Bounded Score
    const rawSum = +(cProv + cCit + cVel + cNet).toFixed(2);
    const finalScore = +(Math.min(100.00, Math.max(0.00, rawSum * continuityDecay))).toFixed(2);

    // Metric State Resolution
    let status: MetricState = 'CALCULATED';
    if (provScore === 0 && totalCites === 0) {
      status = 'INSUFFICIENT_DATA';
    } else if (deltaYears === 0 && totalCites < 3) {
      status = 'PROVISIONAL';
    }

    return {
      articleId: input.articleId,
      rawScore: rawSum,
      score: finalScore,
      components: {
        provenance: cProv,
        citation: cCit,
        velocity: cVel,
        network: cNet
      },
      continuityDecay,
      velocityPerYear,
      status,
      formulaVersion: this.FORMULA_VERSION
    };
  }
}
