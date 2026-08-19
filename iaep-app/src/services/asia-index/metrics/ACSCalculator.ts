// src/services/asia-index/metrics/ACSCalculator.ts
/**
 * ACSCalculator — ASIA Citation Score Engine (Level Jurnal - Laju Sitasi 3-Tahun).
 * 
 * Independently defined ASIA metric.
 */

import type { ACSResult, MetricState } from './types';

export class ACSCalculator {
  public static readonly FORMULA_VERSION = 'ACS-1.2-INDEPENDENT-3YEAR';

  public static calculateACS(input: {
    journalId: string;
    threeYearCitations: number;
    threeYearPublishedArticles: number;
  }): ACSResult {
    const articles = Math.max(0, input.threeYearPublishedArticles || 0);
    const citations = Math.max(0, input.threeYearCitations || 0);

    let status: MetricState = 'CALCULATED';
    if (articles < 5) {
      status = 'INSUFFICIENT_DATA';
    } else if (articles < 10) {
      status = 'PROVISIONAL';
    }

    const rate = articles > 0 ? +(citations / articles).toFixed(2) : 0.00;

    return {
      journalId: input.journalId,
      threeYearCitationRate: rate,
      citableArticlesCount: articles,
      totalCitationsReceived: citations,
      status,
      formulaVersion: this.FORMULA_VERSION
    };
  }
}
