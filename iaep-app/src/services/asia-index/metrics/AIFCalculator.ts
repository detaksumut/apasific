// src/services/asia-index/metrics/AIFCalculator.ts
/**
 * AIFCalculator — ASIA Impact Factor Engine (Level Jurnal - Laju Sitasi 2-Tahun).
 * 
 * Independently defined ASIA metric.
 */

import type { AIFResult, MetricState } from './types';

export class AIFCalculator {
  public static readonly FORMULA_VERSION = 'AIF-1.2-INDEPENDENT-2YEAR';

  public static calculateAIF(input: {
    journalId: string;
    twoYearCitations: number;
    twoYearPublishedArticles: number;
  }): AIFResult {
    const articles = Math.max(0, input.twoYearPublishedArticles || 0);
    const citations = Math.max(0, input.twoYearCitations || 0);

    let status: MetricState = 'CALCULATED';
    if (articles < 5) {
      status = 'INSUFFICIENT_DATA';
    } else if (articles < 10) {
      status = 'PROVISIONAL';
    }

    const rate = articles > 0 ? +(citations / articles).toFixed(2) : 0.00;

    return {
      journalId: input.journalId,
      twoYearCitationRate: rate,
      citableArticlesCount: articles,
      totalCitationsReceived: citations,
      status,
      formulaVersion: this.FORMULA_VERSION
    };
  }
}
