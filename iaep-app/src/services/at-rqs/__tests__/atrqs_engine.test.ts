// src/services/at-rqs/__tests__/atrqs_engine.test.ts

import { ATRQSEngine } from '../ATRQSEngine';
import { TriSourceInput } from '../types';

describe('ATRQSEngine v1.0 Mathematical & Consistency Tests', () => {
  test('Case 1: Full BPPRD Barito Kuala Tri-Source Input produces valid AT-RQS snapshot', () => {
    const input: TriSourceInput = {
      articleId: '3866e0a6-3b57-48ca-8bcd-4646af83c017',
      title: 'Determinants of Civil Servant Performance: The Role of Servant Leadership, Work-Life Balance, and Workload at BPPRD Barito Kuala',
      abstract: 'Studi kuantitatif analisis pengaruh servant leadership, work-life balance, dan workload terhadap kinerja pegawai BPPRD Barito Kuala. Metode survei dengan 38 responden (total sampling), analisis regresi linear berganda via SPSS.',
      scoreLayer: {
        topic_relevance: 9,
        article_structure: 8,
        abstract: 8,
        research_gap: 9,
        methodology: 8,
        data_statistics: 9,
        discussion: 8,
        conclusion: 8,
        references: 9,
        overall_score: 8.3
      },
      screenLayer: {
        novelty_rating: 3,
        methodology_rating: 3,
        clarity_rating: 4,
        confidence_score: 85,
        summary_evaluation: 'Studi kuantitatif regresi berganda 38 responden.',
        suggested_improvements: 'Perluas tinjauan literatur dan diskusikan keterbatasan generalisasi.'
      },
      clueLayer: {
        objective: 'Uji pengaruh servant leadership, work-life balance, workload terhadap kinerja pegawai.',
        methodology: 'Kuantitatif, survei kausal-asosiatif, total sampling 38 pegawai, regresi linear berganda SPSS.',
        sample_size: 38,
        sampling_strategy: 'Total Sampling (38 pegawai BPPRD Barito Kuala)',
        findings: 'Ketiga variabel berpengaruh positif signifikan (Workload dominan t=3.801, WLB t=3.320, SL t=2.133).',
        conclusion: 'Kombinasi ketiga variabel optimal mendorong kinerja pegawai secara simultan (F=15.294, p=0.000).',
        limitations: 'Sampel 38 responden pada satu instansi (generalisasi terbatas) dan desain cross-sectional.',
        practical_implications: 'Distribusi beban kerja proporsional dan perkuat kepemimpinan suportif.',
        policy_relevance: 'Panduan manajemen SDM dan alokasi beban kerja pegawai di instansi BPPRD.',
        explained_variance: '53.7%'
      }
    };

    const snapshot = ATRQSEngine.compute(input);

    // Assertions for Core Outputs
    expect(snapshot.assessment_id).toContain('APS-AT-RQS-3866e0a6');
    expect(snapshot.framework_version).toBe('v1.0');
    expect(snapshot.algorithm_version).toBe('AT-RQS-1.0');
    
    // AT-RQS Quality Score
    expect(snapshot.at_rqs).toBeGreaterThanOrEqual(75);
    expect(snapshot.at_rqs).toBeLessThanOrEqual(95);
    expect(snapshot.at_rqs_ten_scale).toBeCloseTo(snapshot.at_rqs / 10, 1);
    expect(snapshot.quality_level).toBe('STRONG RESEARCH QUALITY');

    // AECI Consistency (Evidence Coverage 5/5 -> ECF = 1.0 -> AECI = 100.0)
    expect(snapshot.aeci).toBeCloseTo(100.0, 1);
    expect(snapshot.provenance.evidence_elements_detected).toBe(5);
    expect(snapshot.provenance.evidence_coverage_ratio).toBe(1.0);

    // Consistency factor bounded in [0.85, 1.00]
    expect(snapshot.provenance.consistency_factor).toBeGreaterThanOrEqual(0.85);
    expect(snapshot.provenance.consistency_factor).toBeLessThanOrEqual(1.00);

    // ARTI & AAC
    expect(snapshot.arti).toBeGreaterThan(70);
    expect(snapshot.aac).toBeGreaterThanOrEqual(80);
    expect(snapshot.aac).toBeLessThanOrEqual(100);

    // 7 Dimensions checks
    expect(snapshot.dimension_scores.academic_contribution).toBeGreaterThan(0);
    expect(snapshot.dimension_scores.procedural_rigor).toBeGreaterThan(0);
    expect(snapshot.dimension_scores.analytical_strength).toBeGreaterThan(0);
    expect(snapshot.dimension_scores.scholarly_communication).toBeGreaterThan(0);
    expect(snapshot.dimension_scores.integrity_transparency).toBeGreaterThan(0);
    expect(snapshot.dimension_scores.future_research_value).toBeGreaterThan(0);
    expect(snapshot.dimension_scores.impact_applicability).toBeGreaterThan(0);

    // Governance & Limitations
    expect(snapshot.governance_disclaimer).toBe(ATRQSEngine.GOVERNANCE_DISCLAIMER);
    expect(snapshot.documented_limitations.length).toBeGreaterThan(0);
    expect(snapshot.is_fallback).toBe(false);
  });

  test('Case 2: Fallback deterministic calculation for legacy article with no AI input', () => {
    const input: TriSourceInput = {
      articleId: 'legacy-article-12345',
      title: 'Legacy Study on Economics',
      abstract: 'Abstract text without prior AI analysis.'
    };

    const snapshot = ATRQSEngine.compute(input);

    expect(snapshot.is_fallback).toBe(true);
    expect(snapshot.at_rqs).toBeGreaterThanOrEqual(60);
    expect(snapshot.at_rqs).toBeLessThanOrEqual(100);
    expect(snapshot.aeci).toBeGreaterThan(0);
    expect(snapshot.aac).toBeGreaterThan(0);
    expect(Number.isNaN(snapshot.at_rqs)).toBe(false);
    expect(Number.isNaN(snapshot.aeci)).toBe(false);
    expect(Number.isNaN(snapshot.aac)).toBe(false);
  });

  test('Case 3: Incomplete evidence coverage ECF is strictly bounded and does not cause crash', () => {
    const input: TriSourceInput = {
      articleId: 'sparse-article-001',
      title: 'Very Short Note',
      abstract: 'Short note only.'
    };

    const snapshot = ATRQSEngine.compute(input);
    expect(snapshot.provenance.consistency_factor).toBeGreaterThanOrEqual(0.85);
    expect(snapshot.provenance.consistency_factor).toBeLessThanOrEqual(1.00);
  });

  test('Case 4: Sampling Rigor evaluates total population sampling appropriately', () => {
    const score = ATRQSEngine.evaluateSamplingRigor({
      sampling_strategy: 'Total Sampling (38 pegawai)',
      methodology: 'Kuantitatif survei kausal pada populasi instansi BPPRD',
      sample_size: 38,
      raw_clue_text: 'uji asumsi validitas reliabilitas regresi linear'
    });

    expect(score).toBe(90);
  });
});
