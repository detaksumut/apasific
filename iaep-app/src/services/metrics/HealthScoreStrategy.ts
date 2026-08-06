export interface IHealthScoreStrategy {
  calculateScore(metrics: any): number;
  getWeight(): number;
  getStrategyName(): string;
}

export class OperationalScoreStrategy implements IHealthScoreStrategy {
  private weight: number;

  constructor(weight: number = 0.40) {
    this.weight = weight;
  }

  public calculateScore(metrics: any): number {
    // 1. Review speed: <= 21 days = 100, 21-30 days = 85, 30-45 = 65, >45 = 40
    const avgReviewDays = metrics.avg_review_days || 0;
    let reviewScore = 100;
    if (avgReviewDays > 45) reviewScore = 40;
    else if (avgReviewDays > 30) reviewScore = 65;
    else if (avgReviewDays > 21) reviewScore = 85;

    // 2. Acceptance rate balance (Ideally between 20% - 60% for academic rigor)
    const accRate = metrics.acceptance_rate || 0;
    let rateScore = 100;
    if (accRate > 80 || accRate < 10) rateScore = 50;
    else if (accRate > 60 || accRate < 20) rateScore = 80;

    return (reviewScore * 0.6) + (rateScore * 0.4);
  }

  public getWeight(): number {
    return this.weight;
  }

  public getStrategyName(): string {
    return 'operational';
  }
}

export class PublicationScoreStrategy implements IHealthScoreStrategy {
  private weight: number;

  constructor(weight: number = 0.30) {
    this.weight = weight;
  }

  public calculateScore(metrics: any): number {
    // Regularity score (e.g. quarterly publication releases)
    const regularity = metrics.publication_regularity || 100;
    return regularity;
  }

  public getWeight(): number {
    return this.weight;
  }

  public getStrategyName(): string {
    return 'publication';
  }
}

export class IndexingScoreStrategy implements IHealthScoreStrategy {
  private weight: number;

  constructor(weight: number = 0.30) {
    this.weight = weight;
  }

  public calculateScore(metrics: any): number {
    // 1. DOI Coverage: >= 90% = 100, >= 80% = 80, else 50
    const doiPct = metrics.doi_coverage_percentage || 0;
    let doiScore = 100;
    if (doiPct < 50) doiScore = 40;
    else if (doiPct < 80) doiScore = 70;
    else if (doiPct < 90) doiScore = 85;

    // 2. Zenodo Federation coverage
    const zenodoPct = metrics.zenodo_coverage_percentage || 0;
    let zenodoScore = zenodoPct;

    // 3. ORCID author coverage
    const orcidPct = metrics.orcid_coverage_percentage || 0;
    
    return (doiScore * 0.4) + (zenodoScore * 0.3) + (orcidPct * 0.3);
  }

  public getWeight(): number {
    return this.weight;
  }

  public getStrategyName(): string {
    return 'indexing';
  }
}
