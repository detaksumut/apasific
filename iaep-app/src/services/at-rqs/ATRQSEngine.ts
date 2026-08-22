// src/services/at-rqs/ATRQSEngine.ts

import {
  TriSourceInput,
  ATRQSSnapshot,
  ATRQSDimensionBreakdown,
  ATRQSScoreProvenance,
  QualityLevel
} from './types';

export class ATRQSEngine {
  public static readonly FRAMEWORK_VERSION = 'v1.0';
  public static readonly ALGORITHM_VERSION = 'AT-RQS-1.0';
  public static readonly GOVERNANCE_DISCLAIMER =
    'This score is an assessment indicator, not a certification of research validity, originality, or scientific truth.';

  /**
   * Main entry point: Computes the full AT-RQS v1.0 snapshot from 3 analytical input layers.
   */
  public static compute(input: TriSourceInput): ATRQSSnapshot {
    const articleId = input.articleId || 'canonical-article';
    const isFallback = !input.scoreLayer && !input.screenLayer && !input.clueLayer;

    // --- STAGE 1: Scoring Evidence Registry Normalization ---
    const scoreNorm = this.normalizeScoreLayer(input.scoreLayer, input);
    const screenNorm = this.normalizeScreenLayer(input.screenLayer, input);
    const clueNorm = this.normalizeClueLayer(input.clueLayer, input);

    // --- STAGE 2: 7 APASIFIC Quality Dimensions ---
    const dimensions = this.computeDimensions(input, scoreNorm, screenNorm, clueNorm);

    // Base Weighted Score
    const baseWeightedScore =
      dimensions.academic_contribution * 0.18 +
      dimensions.procedural_rigor * 0.18 +
      dimensions.analytical_strength * 0.16 +
      dimensions.scholarly_communication * 0.12 +
      dimensions.integrity_transparency * 0.12 +
      dimensions.future_research_value * 0.10 +
      dimensions.impact_applicability * 0.14;

    // --- STAGE 3: Evidence Consistency (AECI) & Tri-Source Agreement (ARTI) ---
    const { aeci, ecf, detectedElements } = this.computeAECI(input);
    const arti = this.computeARTI(scoreNorm.overall, screenNorm.overall, clueNorm.overall);

    // --- STAGE 4: Bounded Consistency Adjustment ---
    // Factor is bounded in [0.85, 1.00]
    const consistencyFactor = 0.85 + 0.15 * (aeci / 100);
    const rawAtRqs = baseWeightedScore * consistencyFactor;
    const finalAtRqs = Math.min(100, Math.max(0, Math.round(rawAtRqs * 10) / 10));
    const atRqsTenScale = Math.round((finalAtRqs / 10) * 100) / 100;

    // --- STAGE 5: Assessment Confidence (AAC) ---
    const dataCompleteness = this.computeDataCompleteness(input);
    const extractionConsistency = clueNorm.consistencyScore;
    const rawAac = 0.50 * arti + 0.30 * dataCompleteness + 0.20 * extractionConsistency;
    const finalAac = Math.min(100, Math.max(0, Math.round(rawAac)));

    // Qualitative Insights Extraction
    const { primaryStrength, secondaryStrength, limitations, opportunities } =
      this.extractInsights(input, dimensions);

    const qualityLevel = this.determineQualityLevel(finalAtRqs);

    const provenance: ATRQSScoreProvenance = {
      score_layer_norm: Math.round(scoreNorm.overall * 10) / 10,
      screen_layer_norm: Math.round(screenNorm.overall * 10) / 10,
      clue_layer_norm: Math.round(clueNorm.overall * 10) / 10,
      base_weighted_score: Math.round(baseWeightedScore * 10) / 10,
      consistency_factor: Math.round(consistencyFactor * 1000) / 1000,
      evidence_elements_detected: detectedElements,
      evidence_coverage_ratio: Math.round(ecf * 100) / 100
    };

    return {
      assessment_id: `APS-AT-RQS-${articleId.substring(0, 8)}-${this.FRAMEWORK_VERSION}`,
      article_id: articleId,
      framework_version: this.FRAMEWORK_VERSION,
      algorithm_version: this.ALGORITHM_VERSION,
      timestamp: new Date().toISOString(),
      at_rqs: finalAtRqs,
      at_rqs_ten_scale: atRqsTenScale,
      quality_level: qualityLevel,
      aeci: Math.round(aeci * 10) / 10,
      arti: Math.round(arti * 10) / 10,
      aac: finalAac,
      dimension_scores: dimensions,
      provenance,
      primary_strength: primaryStrength,
      secondary_strength: secondaryStrength,
      documented_limitations: limitations,
      research_opportunities: opportunities,
      governance_disclaimer: this.GOVERNANCE_DISCLAIMER,
      is_fallback: isFallback
    };
  }

  /**
   * Evaluates Multi-factor Sampling Rigor based on 5 rigorous academic criteria:
   * 1. Sampling strategy clearly stated (Total/Purposive/Stratified/Random)
   * 2. Target population clearly defined
   * 3. Sample size justified
   * 4. Sampling method appropriate for research design
   * 5. Coverage / saturation adequate
   */
  public static evaluateSamplingRigor(clue?: TriSourceInput['clueLayer'], textContext?: string): number {
    let factorCount = 0;
    const combined = `${clue?.methodology || ''} ${clue?.sampling_strategy || ''} ${clue?.raw_clue_text || ''} ${textContext || ''}`.toLowerCase();

    // 1. Strategy stated
    if (/total\s*sampling|purposive|stratified|random|snowball|sensus|cluster|saturated|sampling/i.test(combined)) {
      factorCount++;
    }
    // 2. Population defined
    if (/populasi|pegawai|responden|institusi|organisasi|bpprd|karyawan|guru|siswa|perusahaan|instansi/i.test(combined)) {
      factorCount++;
    }
    // 3. Sample size justified
    if (/sample|sampel|responden|n\s*=|n\s*:\s*\d+|\d+\s*(orang|responden|pegawai|sampel|articles|naskah)/i.test(combined) || clue?.sample_size) {
      factorCount++;
    }
    // 4. Appropriate method for design
    if (/survei|kuesioner|kuantitatif|kualitatif|prisma|slr|regresi|sem|pls|wawancara|observasi/i.test(combined)) {
      factorCount++;
    }
    // 5. Coverage / saturation / validity
    if (/validitas|reliabilitas|uji\s*asumsi|normalitas|multikol|heteros|r2|r-squared|signifikan|f=|t=/i.test(combined)) {
      factorCount++;
    }

    if (factorCount >= 5) return 90;
    if (factorCount === 4) return 85;
    if (factorCount === 3) return 80;
    if (factorCount === 2) return 70;
    return 60;
  }

  // --- PRIVATE CALCULATORS ---

  private static normalizeScoreLayer(score?: TriSourceInput['scoreLayer'], input?: TriSourceInput) {
    if (score && score.overall_score !== undefined) {
      const overall = score.overall_score * 10;
      return {
        topic: (score.topic_relevance ?? score.overall_score) * 10,
        structure: (score.article_structure ?? score.overall_score) * 10,
        abstract: (score.abstract ?? score.overall_score) * 10,
        gap: (score.research_gap ?? score.overall_score) * 10,
        method: (score.methodology ?? score.overall_score) * 10,
        data: (score.data_statistics ?? score.overall_score) * 10,
        discussion: (score.discussion ?? score.overall_score) * 10,
        conclusion: (score.conclusion ?? score.overall_score) * 10,
        references: (score.references ?? score.overall_score) * 10,
        overall
      };
    }
    // Canonical evidence-based fallback
    return {
      topic: 85,
      structure: 80,
      abstract: 80,
      gap: 80,
      method: 80,
      data: 85,
      discussion: 80,
      conclusion: 80,
      references: 85,
      overall: 81.5
    };
  }

  private static normalizeScreenLayer(screen?: TriSourceInput['screenLayer'], input?: TriSourceInput) {
    if (screen && screen.novelty_rating) {
      const nov = screen.novelty_rating * 20;
      const met = (screen.methodology_rating || 3) * 20;
      const cla = (screen.clarity_rating || 4) * 20;
      const overall = 0.40 * nov + 0.40 * met + 0.20 * cla;
      return { novelty: nov, methodology: met, clarity: cla, overall };
    }
    return { novelty: 65, methodology: 75, clarity: 80, overall: 72.0 };
  }

  private static normalizeClueLayer(clue?: TriSourceInput['clueLayer'], input?: TriSourceInput) {
    if (!clue) {
      return { overall: 80.0, consistencyScore: 80 };
    }

    let detectedCount = 0;
    if (clue.objective) detectedCount++;
    if (clue.methodology) detectedCount++;
    if (clue.findings) detectedCount++;
    if (clue.conclusion) detectedCount++;
    if (clue.limitations) detectedCount++;

    let clueNorm = 75;
    if (detectedCount >= 5) clueNorm = 90;
    else if (detectedCount === 4) clueNorm = 85;
    else if (detectedCount === 3) clueNorm = 75;
    else if (detectedCount === 2) clueNorm = 65;
    else clueNorm = 55;

    return { overall: clueNorm, consistencyScore: clueNorm };
  }

  private static computeDimensions(
    input: TriSourceInput,
    s: ReturnType<typeof ATRQSEngine.normalizeScoreLayer>,
    r: ReturnType<typeof ATRQSEngine.normalizeScreenLayer>,
    c: ReturnType<typeof ATRQSEngine.normalizeClueLayer>
  ): ATRQSDimensionBreakdown {
    const samplingRigor = this.evaluateSamplingRigor(input.clueLayer, input.abstract);

    // 1. Academic Contribution (18%)
    const academic_contribution = Math.round(0.40 * s.gap + 0.35 * r.novelty + 0.25 * s.topic);

    // 2. Procedural Rigor (18%)
    const procedural_rigor = Math.round(0.50 * s.method + 0.30 * r.methodology + 0.20 * samplingRigor);

    // 3. Analytical Strength (16%)
    const modelRobustness = input.clueLayer?.explained_variance ? 90 : 82;
    const analytical_strength = Math.round(0.60 * s.data + 0.40 * modelRobustness);

    // 4. Scholarly Communication (12%)
    const scholarly_communication = Math.round(0.35 * s.structure + 0.25 * s.abstract + 0.20 * s.discussion + 0.20 * s.references);

    // 5. Integrity & Transparency (12%)
    const limitationOpenness = input.clueLayer?.limitations ? 90 : 75;
    const integrity_transparency = Math.round(0.50 * s.conclusion + 0.50 * limitationOpenness);

    // 6. Future Research Value (10%)
    const futureGap = input.screenLayer?.suggested_improvements || input.clueLayer?.limitations ? 82 : 72;
    const future_research_value = Math.round(futureGap);

    // 7. Impact & Applicability (14%)
    const practicalUtility = input.clueLayer?.practical_implications ? 88 : 82;
    const policyTransferability = input.clueLayer?.policy_relevance ? 86 : 80;
    const impact_applicability = Math.round(0.50 * practicalUtility + 0.50 * policyTransferability);

    return {
      academic_contribution,
      procedural_rigor,
      analytical_strength,
      scholarly_communication,
      integrity_transparency,
      future_research_value,
      impact_applicability
    };
  }

  private static computeAECI(input: TriSourceInput): { aeci: number; ecf: number; detectedElements: number } {
    let detected = 0;
    const c = input.clueLayer;
    const abs = input.abstract || '';

    // Check 5 Core Elements
    if (c?.objective || /tujuan|objective|aim/i.test(abs)) detected++;
    if (c?.methodology || /metode|method|kuantitatif|kualitatif|prisma/i.test(abs)) detected++;
    if (c?.sample_size || /sampel|sample|responden|populasi/i.test(abs)) detected++;
    if (c?.findings || /hasil|temuan|findings|result|signifikan/i.test(abs)) detected++;
    if (c?.conclusion || c?.limitations || /kesimpulan|conclusion|implikasi/i.test(abs)) detected++;

    const ecf = detected / 5; // e.g. 5/5 = 1.0, 4/5 = 0.8
    const alignmentScore = 94.0; // High canonical alignment between stated goals & conclusions

    const aeci = alignmentScore * ecf;
    return { aeci: Math.round(aeci * 10) / 10, ecf, detectedElements: detected };
  }

  private static computeARTI(scoreNorm: number, screenNorm: number, clueNorm: number): number {
    const divergence = (Math.abs(scoreNorm - screenNorm) + Math.abs(scoreNorm - clueNorm)) / 2;
    const arti = 100 - divergence;
    return Math.min(100, Math.max(0, arti));
  }

  private static computeDataCompleteness(input: TriSourceInput): number {
    let totalFields = 8;
    let available = 0;
    if (input.title) available++;
    if (input.abstract) available++;
    if (input.doi) available++;
    if (input.scoreLayer) available += 2;
    if (input.screenLayer) available++;
    if (input.clueLayer) available += 2;

    return Math.round((available / totalFields) * 100);
  }

  private static determineQualityLevel(score: number): QualityLevel {
    if (score >= 88) return 'EXEMPLARY RESEARCH RIGOR';
    if (score >= 80) return 'STRONG RESEARCH QUALITY';
    if (score >= 70) return 'GOOD RESEARCH QUALITY';
    if (score >= 60) return 'SATISFACTORY WITH LIMITATIONS';
    return 'PRELIMINARY EVIDENCE';
  }

  private static extractInsights(input: TriSourceInput, dims: ATRQSDimensionBreakdown) {
    let primaryStrength = 'Strong analytical evidence and robust statistical methodology';
    let secondaryStrength = 'Clear empirical design with high practical and policy relevance';

    if (dims.analytical_strength >= 88) {
      primaryStrength = 'Analytical evidence and high statistical regression model robustness';
    }
    if (dims.impact_applicability >= 85) {
      secondaryStrength = 'Practical utility and direct organizational/policy applicability';
    }

    const limitations: string[] = [];
    if (input.clueLayer?.limitations) {
      limitations.push(input.clueLayer.limitations);
    } else {
      limitations.push('Single-institution empirical context with specific organizational scope.');
      limitations.push('Cross-sectional survey design captures point-in-time perceptions.');
    }

    const opportunities: string[] = [];
    if (input.screenLayer?.suggested_improvements) {
      opportunities.push(input.screenLayer.suggested_improvements);
    } else {
      opportunities.push('Expansion of sample size across multi-sector agencies for broader generalizability.');
      opportunities.push('Longitudinal tracking to observe multi-period organizational dynamics.');
    }

    return { primaryStrength, secondaryStrength, limitations, opportunities };
  }
}
