import { ReputationPolicy } from '../../domain/academic-reputation/ReputationPolicy';
import { ReputationSignal } from '../../domain/academic-reputation/ReputationSignal';
import { AcademicReputationProfile, ReputationLevel } from '../../domain/academic-reputation/AcademicReputationProfile';

/**
 * Phase G.3: Reputation Calculation Engine
 * The ultimate authority for calculating the Academic Reputation Score.
 */
export class ReputationCalculationEngine {
  
  /**
   * Applies the policy formula to a set of signals to calculate the final ARS.
   */
  public calculateScore(policy: ReputationPolicy, signals: ReputationSignal[], researcherId: string): AcademicReputationProfile {
    let finalScore = 0;

    // A real implementation would aggregate all signals of the same type first.
    // For this demonstration, we process one consolidated signal per type.
    signals.forEach(signal => {
      let weight = 0;
      if (signal.signalType === 'IDENTITY_SIGNAL') weight = policy.identityWeight;
      if (signal.signalType === 'CREDENTIAL_SIGNAL') weight = policy.credentialWeight;
      if (signal.signalType === 'PUBLICATION_SIGNAL') weight = policy.publicationWeight;
      if (signal.signalType === 'IMPACT_SIGNAL') weight = policy.impactWeight;

      signal.weight = weight;
      signal.contributionScore = (signal.normalizedValue * (weight / 100));
      finalScore += signal.contributionScore;
    });

    return {
      id: crypto.randomUUID(),
      researcherId,
      reputationScore: finalScore,
      reputationLevel: this.determineLevel(finalScore),
      confidenceScore: 90.0,
      status: 'ACTIVE',
      calculatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private determineLevel(score: number): ReputationLevel {
    if (score >= 95) return 'DISTINGUISHED';
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'ESTABLISHED';
    if (score >= 40) return 'DEVELOPING';
    return 'EMERGING';
  }
}
