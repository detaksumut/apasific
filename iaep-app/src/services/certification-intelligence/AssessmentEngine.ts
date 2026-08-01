import { CertificationPolicy } from '../../domain/certification-intelligence/CertificationPolicy';
import { AssessmentRecord } from '../../domain/certification-intelligence/AssessmentRecord';

/**
 * Phase E.2: Assessment Engine
 * Solely responsible for evaluating assessments against policies.
 */
export class AssessmentEngine {
  
  /**
   * Calculates the final score based on the policy weights.
   * Ensures that all required assessments dictated by the weights exist.
   */
  public evaluateApplication(policy: CertificationPolicy, records: AssessmentRecord[]): { passed: boolean; finalScore: number } {
    let finalScore = 0;
    
    // Ensure all required components are present
    const requiredTypes = Object.keys(policy.weights);
    for (const type of requiredTypes) {
      const record = records.find(r => r.type === type);
      if (!record) {
        throw new Error(`AssessmentEngine Error: Missing required assessment type '${type}'`);
      }
      const weightPercentage = policy.weights[type] / 100;
      finalScore += (record.score * weightPercentage);
    }

    return {
      passed: finalScore >= policy.passingScore,
      finalScore
    };
  }
}
