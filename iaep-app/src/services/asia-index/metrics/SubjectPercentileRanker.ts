// src/services/asia-index/metrics/SubjectPercentileRanker.ts
/**
 * SubjectPercentileRanker — Evaluates Percentile and AM-Q1..AM-Q4 Quartile Rankings.
 * 
 * Strict Compliance:
 * 1. Requires MINIMUM_RANKABLE_CORPUS >= 10 journals per subject category.
 * 2. If N < 10, yields Percentile = N/A and Quartile = N/A with PROVISIONAL state.
 * 3. Exact relative percentile ranking within field.
 */

import type { ASRResult, SubjectPercentileResult, MetricState } from './types';

export class SubjectPercentileRanker {
  public static readonly MINIMUM_RANKABLE_CORPUS = 10;

  public static rankSubjectCategory(asrResults: ASRResult[]): SubjectPercentileResult[] {
    const N = asrResults.length;
    const subjectCategory = asrResults[0]?.subjectCategory || 'Multidisciplinary';

    // Condition 1: Insufficient corpus size (N < 10)
    if (N < this.MINIMUM_RANKABLE_CORPUS) {
      return asrResults.map(item => ({
        journalId: item.journalId,
        subjectCategory,
        rank: 0,
        totalJournalsInCategory: N,
        percentile: null,
        quartile: 'N/A',
        status: 'PROVISIONAL' as MetricState
      }));
    }

    // Condition 2: Sufficient corpus size (N >= 10)
    // Sort descending by ASR scholarly rank
    const sorted = [...asrResults].sort((a, b) => b.scholarlyRank - a.scholarlyRank);

    return sorted.map((item, idx) => {
      const rank = idx + 1; // 1-indexed (Rank 1 = highest ASR)
      const percentile = +((1.0 - ((rank - 0.5) / N)) * 100.0).toFixed(2);

      let quartile: 'AM-Q1' | 'AM-Q2' | 'AM-Q3' | 'AM-Q4' = 'AM-Q4';
      if (percentile >= 75.0) {
        quartile = 'AM-Q1';
      } else if (percentile >= 50.0) {
        quartile = 'AM-Q2';
      } else if (percentile >= 25.0) {
        quartile = 'AM-Q3';
      } else {
        quartile = 'AM-Q4';
      }

      return {
        journalId: item.journalId,
        subjectCategory,
        rank,
        totalJournalsInCategory: N,
        percentile,
        quartile,
        status: item.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED'
      };
    });
  }
}
