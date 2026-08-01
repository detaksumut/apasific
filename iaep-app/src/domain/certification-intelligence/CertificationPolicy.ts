export interface CertificationPolicy {
  id: string;
  programId: string;
  passingScore: number;
  validityPeriodMonths: number | null;
  renewalRequired: boolean;
  weights: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export class CertificationPolicyValidator {
  /**
   * Governance Validation: Total Assessment Weights must exactly equal 100%.
   */
  public static validateWeights(weights: Record<string, number>): boolean {
    const total = Object.values(weights).reduce((acc, weight) => acc + weight, 0);
    return total === 100;
  }
}
