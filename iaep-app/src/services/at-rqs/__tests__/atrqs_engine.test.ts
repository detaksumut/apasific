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
    expect(snapshot.at_rqs).toBeGreaterThanOrEqual(0);
    expect(snapshot.at_rqs).toBeLessThan(60);
    expect(snapshot.aeci).toBe(0);
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

  test('SCREEN ratings use official 1-to-5 normalization before aggregation', () => {
    const input: TriSourceInput = {
      articleId: 'screen-normalization-test',
      scoreLayer: {
        research_gap: 5,
        topic_relevance: 5,
        methodology: 5,
        data_statistics: 5,
        article_structure: 5,
        abstract: 5,
        discussion: 5,
        references: 5,
        overall_score: 5
      },
      screenLayer: {
        novelty_rating: 1,
        methodology_rating: 3,
        clarity_rating: 5
      },
      clueLayer: {
        objective: 'Objective',
        methodology: 'Method',
        sample_size: 40,
        findings: 'Findings',
        conclusion: 'Conclusion',
        limitations: 'Limitations'
      }
    };

    const snapshot = ATRQSEngine.compute(input);
    // 1 -> 0, 3 -> 50, 5 -> 100; weighted SCREEN total = 40.
    expect(snapshot.provenance.screen_layer_norm).toBe(40);
    expect(snapshot.is_fallback).toBe(false);
  });

  test('CLUE normalization applies the official weighted CESS factors', () => {
    const input: TriSourceInput = {
      articleId: 'clue-cess-weight-test',
      abstract: 'Populasi pegawai, metode kuantitatif survei, sampel 38 responden, hasil analisis regresi.',
      scoreLayer: { overall_score: 8 },
      screenLayer: {
        novelty_rating: 3,
        methodology_rating: 3,
        clarity_rating: 3,
        suggested_improvements: 'Perluas validasi eksternal.'
      },
      clueLayer: {
        methodology: 'Kuantitatif survei dengan total sampling.',
        sampling_strategy: 'Total sampling',
        sample_size: 38,
        raw_clue_text: 'Uji validitas, reliabilitas, regresi dan uji asumsi.',
        findings: 'Hasil regresi terukur.',
        limitations: 'Satu instansi dan desain cross-sectional.',
        explained_variance: '53.7%',
        model_statistics: 'F=15.294, p=0.000, R2=0.574',
        practical_implications: 'Perbaiki pembagian beban kerja.',
        policy_relevance: 'Panduan manajemen SDM.'
      }
    };

    const snapshot = ATRQSEngine.compute(input);
    // c1=90, c2=90, c3=90, c4=88, c5=90 => CESS=89.7
    expect(snapshot.provenance.clue_layer_norm).toBe(89.7);
  });

  test('Raw CLUE reviewer text alone does not mark a tri-source assessment complete', () => {
    const input: TriSourceInput = {
      articleId: 'raw-clue-text-only',
      scoreLayer: { overall_score: 8 },
      screenLayer: {
        novelty_rating: 3,
        methodology_rating: 3,
        clarity_rating: 3
      },
      clueLayer: {
        raw_clue_text: 'Reviewer comments exist, but no structured evidence sections were extracted.'
      }
    };

    const snapshot = ATRQSEngine.compute(input);
    expect(snapshot.is_fallback).toBe(true);
  });

  test('AECI requires limitations as the fifth element; conclusion alone is insufficient', () => {
    const input: TriSourceInput = {
      articleId: 'aeci-limitations-required',
      abstract: 'Tujuan penelitian, metode survei, sampel 40 responden, dan hasil penelitian.',
      clueLayer: {
        objective: 'Tujuan penelitian',
        methodology: 'Metode survei',
        sample_size: 40,
        findings: 'Hasil penelitian',
        conclusion: 'Kesimpulan penelitian tanpa uraian keterbatasan'
      }
    };

    const snapshot = ATRQSEngine.compute(input);
    expect(snapshot.provenance.evidence_elements_detected).toBe(4);
    expect(snapshot.provenance.evidence_coverage_ratio).toBe(0.8);
    expect(snapshot.aeci).toBe(80);
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
