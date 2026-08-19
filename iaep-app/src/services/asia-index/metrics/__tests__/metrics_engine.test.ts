// src/services/asia-index/metrics/__tests__/metrics_engine.test.ts
import { AASCalculator } from '../AASCalculator';
import { ACSCalculator } from '../ACSCalculator';
import { AIFCalculator } from '../AIFCalculator';
import { ASRPrestigeEngine } from '../ASRPrestigeEngine';
import { SubjectPercentileRanker } from '../SubjectPercentileRanker';
import { ASIAMetricsAuditService } from '../ASIAMetricsAuditService';

describe('Sprint 4: ASIA Scholarly Metrics Engine Mathematical Audit', () => {
  test('1. AAS must be strictly bounded to [0.00, 100.00] under extreme input values', () => {
    const extremeCitations = Array.from({ length: 500 }, (_, i) => ({
      sourceDoi: `10.55927/cite.${i}`,
      selfClass: 'EXTERNAL_CITATION' as const,
      topologyConfidence: 'NORMAL' as const,
      sourcePrestige: 5.0
    }));

    const result = AASCalculator.calculateAAS({
      articleId: 'test-extreme-id',
      provenanceScore: 100,
      citations: extremeCitations,
      publishedDate: '2026-01-01',
      uniqueCitingJournalsCount: 200,
      hasOrcidLinked: true
    });

    expect(result.score).toBeLessThanOrEqual(100.00);
    expect(result.score).toBeGreaterThanOrEqual(0.00);
    expect(result.components.provenance).toBeLessThanOrEqual(40.00);
    expect(result.components.citation).toBeLessThanOrEqual(35.00);
    expect(result.components.velocity).toBeLessThanOrEqual(15.00);
    expect(result.components.network).toBeLessThanOrEqual(10.00);
    expect(result.formulaVersion).toBe('AAS-1.2-NORMALIZED-BOUNDED');
  });

  test('2. Self-citation damping and topology confidence must apply exactly once', () => {
    // AUTHOR_AND_JOURNAL_SELF (0.35) * NORMAL (1.00) = 0.35
    expect(AASCalculator.getEffectiveEdgeWeight('AUTHOR_AND_JOURNAL_SELF', 'NORMAL')).toBe(0.35);
    // AUTHOR_SELF_ONLY (0.60) * SUSPICIOUS (0.75) = 0.45
    expect(AASCalculator.getEffectiveEdgeWeight('AUTHOR_SELF_ONLY', 'SUSPICIOUS')).toBe(0.45);
    // JOURNAL_SELF_ONLY (0.50) * FLAGGED (0.50) = 0.25
    expect(AASCalculator.getEffectiveEdgeWeight('JOURNAL_SELF_ONLY', 'FLAGGED')).toBe(0.25);
    // EXTERNAL_CITATION (1.00) * NORMAL (1.00) = 1.00
    expect(AASCalculator.getEffectiveEdgeWeight('EXTERNAL_CITATION', 'NORMAL')).toBe(1.00);
  });

  test('3. ASR Power Iteration must strictly conserve L1 probability (||p||_1 === 1.00000000)', () => {
    const nodes = [
      { journalId: 'J1', journalCode: 'AJCS', subjectCategory: 'Computer Science', publishedArticlesCount: 50 },
      { journalId: 'J2', journalCode: 'AJITE', subjectCategory: 'Computer Science', publishedArticlesCount: 40 },
      { journalId: 'J3', journalCode: 'AJAI', subjectCategory: 'Computer Science', publishedArticlesCount: 30 },
      { journalId: 'J4', journalCode: 'AJROBOT', subjectCategory: 'Computer Science', publishedArticlesCount: 20 } // Dangling node
    ];

    // J4 has no outgoing edges (dangling node)
    const internalEdges = [
      { sourceJournalId: 'J1', targetJournalId: 'J2', selfClass: 'EXTERNAL_CITATION' as const, topologyConfidence: 'NORMAL' as const, weight: 1 },
      { sourceJournalId: 'J2', targetJournalId: 'J3', selfClass: 'EXTERNAL_CITATION' as const, topologyConfidence: 'NORMAL' as const, weight: 1 },
      { sourceJournalId: 'J3', targetJournalId: 'J1', selfClass: 'EXTERNAL_CITATION' as const, topologyConfidence: 'NORMAL' as const, weight: 1 }
    ];

    // Scenario A: With external influx
    const externalInflux = [
      { targetJournalId: 'J1', sourceType: 'VERIFIED_EXTERNAL_SOURCE' as const, selfClass: 'EXTERNAL_CITATION' as const, topologyConfidence: 'NORMAL' as const, count: 15 },
      { targetJournalId: 'J4', sourceType: 'UNRESOLVED_EXTERNAL_SOURCE' as const, selfClass: 'EXTERNAL_CITATION' as const, topologyConfidence: 'NORMAL' as const, count: 8 }
    ];

    const asrWithExt = ASRPrestigeEngine.calculateASRNetwork(nodes, internalEdges, externalInflux);
    expect(asrWithExt).toHaveLength(4);
    const sumWithExt = asrWithExt.reduce((sum, r) => sum + r.prestigeScore, 0);
    expect(sumWithExt).toBeCloseTo(1.000000, 6);

    // Scenario B: With ZERO external influx (v_ext = 0)
    const asrNoExt = ASRPrestigeEngine.calculateASRNetwork(nodes, internalEdges, []);
    expect(asrNoExt).toHaveLength(4);
    const sumNoExt = asrNoExt.reduce((sum, r) => sum + r.prestigeScore, 0);
    expect(sumNoExt).toBeCloseTo(1.000000, 6);
  });

  test('4. SubjectPercentileRanker must withhold quartiles (N/A) when N < 10', () => {
    const microCorpusResults = [
      { journalId: 'J1', prestigeScore: 0.5, scholarlyRank: 1.5, subjectCategory: 'Law', iterationsToConvergence: 20, convergenceDelta: 1e-6, status: 'PROVISIONAL' as const, formulaVersion: 'ASR-1.2' },
      { journalId: 'J2', prestigeScore: 0.5, scholarlyRank: 0.8, subjectCategory: 'Law', iterationsToConvergence: 20, convergenceDelta: 1e-6, status: 'PROVISIONAL' as const, formulaVersion: 'ASR-1.2' }
    ];

    const ranked = SubjectPercentileRanker.rankSubjectCategory(microCorpusResults);
    expect(ranked[0].quartile).toBe('N/A');
    expect(ranked[0].percentile).toBeNull();
    expect(ranked[0].status).toBe('PROVISIONAL');
  });

  test('5. ASIAMetricsAuditService strictly enforces VERIFIED state criteria', () => {
    // Condition A: Sufficient corpus (12), converged, locked versions -> VERIFIED
    const statusA = ASIAMetricsAuditService.verifyMetricQualification({
      corpusSize: 12,
      convergenceDelta: 1e-6,
      formulaVersionLocked: true,
      datasetVersionLocked: true
    });
    expect(statusA).toBe('VERIFIED');

    // Condition B: Insufficient corpus size (8) -> PROVISIONAL
    const statusB = ASIAMetricsAuditService.verifyMetricQualification({
      corpusSize: 8,
      convergenceDelta: 1e-6,
      formulaVersionLocked: true,
      datasetVersionLocked: true
    });
    expect(statusB).toBe('PROVISIONAL');
  });
});
