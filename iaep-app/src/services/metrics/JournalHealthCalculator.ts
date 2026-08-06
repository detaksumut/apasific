import { IHealthScoreStrategy, OperationalScoreStrategy, PublicationScoreStrategy, IndexingScoreStrategy } from './HealthScoreStrategy';

export interface HealthWeights {
  operational?: number;
  publication?: number;
  indexing?: number;
}

export class JournalHealthCalculator {
  private strategies: IHealthScoreStrategy[];

  constructor(customWeights?: HealthWeights) {
    // Configurable weights with default fallbacks
    const opW = customWeights?.operational !== undefined ? customWeights.operational : 0.40;
    const pubW = customWeights?.publication !== undefined ? customWeights.publication : 0.30;
    const idxW = customWeights?.indexing !== undefined ? customWeights.indexing : 0.30;

    // Standardize to ensure weights sum to 1.0 (defensive configuration check)
    const sum = opW + pubW + idxW;
    const scale = sum > 0 ? 1.0 / sum : 1.0;

    this.strategies = [
      new OperationalScoreStrategy(opW * scale),
      new PublicationScoreStrategy(pubW * scale),
      new IndexingScoreStrategy(idxW * scale)
    ];
  }

  /**
   * Registers a new scoring strategy dynamically (e.g. ScopusStrategy, DOAJStrategy)
   */
  public registerStrategy(strategy: IHealthScoreStrategy): void {
    // Check if strategy already exists, then override
    this.strategies = this.strategies.filter(s => s.getStrategyName() !== strategy.getStrategyName());
    this.strategies.push(strategy);
  }

  /**
   * Orchestrates the total health calculation based on active strategy scores and weights.
   */
  public calculateHealthScore(metrics: any): {
    score: number;
    breakdown: Record<string, number>;
  } {
    let totalScore = 0;
    const breakdown: Record<string, number> = {};

    for (const strategy of this.strategies) {
      const score = strategy.calculateScore(metrics);
      const weight = strategy.getWeight();
      
      totalScore += score * weight;
      breakdown[strategy.getStrategyName()] = Math.round(score);
    }

    return {
      score: Math.min(100, Math.max(0, Math.round(totalScore))),
      breakdown
    };
  }
}
