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
    // A source object alone is not proof that the source is complete or valid.
    const requiredScoreFields: Array<keyof NonNullable<TriSourceInput['scoreLayer']>> = [
      'research_gap',
      'topic_relevance',
      'methodology',
      'data_statistics',
      'article_structure',
      'abstract',
      'discussion',
      'references'
    ];
    const validScore = requiredScoreFields.every((field) => {
      const value = input.scoreLayer?.[field];
      return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10;
    });
    const validScreen = [input.screenLayer?.novelty_rating, input.screenLayer?.methodology_rating, input.screenLayer?.clarity_rating]
      .every((rating) => typeof rating === 'number' && Number.isFinite(rating) && rating >= 1 && rating <= 5);
    // Raw reviewer text alone is not proof that the five CLUE elements were extracted.
    // Require at least one structured evidence field; missing sections remain incomplete.
    const hasText = (value: unknown) =>
      typeof value === 'string' && value.trim().length > 0;
    const hasSampleSize = (value: unknown) =>
      (typeof value === 'number' && Number.isFinite(value) && value > 0) ||
      (typeof value === 'string' && value.trim().length > 0);
    const validClue = Boolean(
      input.clueLayer &&
      hasText(input.clueLayer.objective) &&
      hasText(input.clueLayer.methodology) &&
      hasSampleSize(input.clueLayer.sample_size) &&
      hasText(input.clueLayer.findings) &&
      hasText(input.clueLayer.limitations)
    );
    const isFallback = !(validScore && validScreen && validClue);

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
    // Official E_consistency is the mean pairwise deviation across all three normalized channels.
    const meanPairwiseDeviation = (
      Math.abs(scoreNorm.overall - screenNorm.overall) +
      Math.abs(scoreNorm.overall - clueNorm.overall) +
      Math.abs(screenNorm.overall - clueNorm.overall)
    ) / 3;
    const extractionConsistency = Math.min(100, Math.max(0, 100 - meanPairwiseDeviation));
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

  private static getHashMod(id?: string): number {
    if (!id) return 0;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 7) - 3; // range: -3 to +3
  }

  private static normalizeScoreLayer(score?: TriSourceInput['scoreLayer'], _input?: TriSourceInput) {
    const valid = (value: unknown): value is number =>
      typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10;
    if (score && valid(score.overall_score)) {
      // Missing rubric items are neutral placeholders, never copied from overall_score.
      const toScale = (value: unknown) => (valid(value) ? value * 10 : 50);
      return {
        topic: toScale(score.topic_relevance),
        structure: toScale(score.article_structure),
        abstract: toScale(score.abstract),
        gap: toScale(score.research_gap),
        method: toScale(score.methodology),
        data: toScale(score.data_statistics),
        discussion: toScale(score.discussion),
        conclusion: toScale(score.conclusion),
        references: toScale(score.references),
        overall: score.overall_score * 10
      };
    }
    // Neutral computational placeholder only. Missing evidence must remain visibly fallback.
    return {
      topic: 50, structure: 50, abstract: 50, gap: 50, method: 50,
      data: 50, discussion: 50, conclusion: 50, references: 50, overall: 50
    };
  }

  private static normalizeScreenLayer(screen?: TriSourceInput['screenLayer'], _input?: TriSourceInput) {
    const valid = (value: unknown): value is number =>
      typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 5;
    if (
      screen &&
      valid(screen.novelty_rating) &&
      valid(screen.methodology_rating) &&
      valid(screen.clarity_rating)
    ) {
      // Official SCREEN normalization: 1 -> 0, 2 -> 25, 3 -> 50, 4 -> 75, 5 -> 100.
      const normalize = (rating: number) => ((rating - 1) / 4) * 100;
      const novelty = normalize(screen.novelty_rating);
      const methodology = normalize(screen.methodology_rating);
      const clarity = normalize(screen.clarity_rating);
      const overall = 0.40 * novelty + 0.40 * methodology + 0.20 * clarity;
      return { novelty, methodology, clarity, overall };
    }
    // Never synthesize a SCREEN result from article metadata.
    return { novelty: 50, methodology: 50, clarity: 50, overall: 50 };
  }

  private static normalizeClueLayer(clue?: TriSourceInput['clueLayer'], input?: TriSourceInput) {
    if (!clue) {
      return { overall: 50, consistencyScore: 50 };
    }

    // CLUE Evidence Strength Score (CESS), following the official five-factor weights.
    const c1 = clue.explained_variance
      ? 90
      : clue.model_statistics
        ? 82
        : (clue.findings?.trim() ? 70 : 50);
    const c2 = this.evaluateSamplingRigor(clue, input?.abstract);
    const c3 = clue.limitations?.trim() ? 90 : 50;
    const c4 = input?.screenLayer?.suggested_improvements?.trim()
      ? 88
      : clue.limitations?.trim()
        ? 75
        : 50;
    const hasPracticalUtility = Boolean(clue.practical_implications?.trim());
    const hasPolicyRelevance = Boolean(clue.policy_relevance?.trim());
    const c5 = hasPracticalUtility && hasPolicyRelevance
      ? 90
      : hasPracticalUtility || hasPolicyRelevance
        ? 80
        : 50;

    const cess = 0.30 * c1 + 0.25 * c2 + 0.15 * c3 + 0.15 * c4 + 0.15 * c5;
    return { overall: Math.round(cess * 10) / 10, consistencyScore: 50 };
  }

  private static computeDimensions(
    input: TriSourceInput,
    s: ReturnType<typeof ATRQSEngine.normalizeScoreLayer>,
    r: ReturnType<typeof ATRQSEngine.normalizeScreenLayer>,
    c: ReturnType<typeof ATRQSEngine.normalizeClueLayer>
  ): ATRQSDimensionBreakdown {
    const clue = input.clueLayer;
    const samplingRigor = this.evaluateSamplingRigor(clue, input.abstract);
    const hasModelStats = Boolean(clue?.model_statistics?.trim());
    const hasExplainedVariance = Boolean(clue?.explained_variance?.trim());
    const hasFindings = Boolean(clue?.findings?.trim());
    const hasLimitations = Boolean(clue?.limitations?.trim());
    const hasFutureResearch = Boolean(input.screenLayer?.suggested_improvements?.trim());
    const hasPracticalUtility = Boolean(clue?.practical_implications?.trim());
    const hasPolicyRelevance = Boolean(clue?.policy_relevance?.trim());

    // Sub-indicators use stored evidence only; absence is not rewarded with a positive default.
    // 1. Academic Contribution (18%)
    const academic_contribution = Math.round(0.40 * s.gap + 0.35 * r.novelty + 0.25 * s.topic);

    // 2. Procedural Rigor (18%)
    const procedural_rigor = Math.round(0.50 * s.method + 0.30 * r.methodology + 0.20 * samplingRigor);

    // 3. Analytical Strength (16%): data/statistics plus evidence of model fit/statistics.
    const modelRobustness = hasExplainedVariance ? 90 : hasModelStats ? 82 : hasFindings ? 70 : 50;
    const analytical_strength = Math.round(0.60 * s.data + 0.40 * modelRobustness);

    // 4. Scholarly Communication (12%)
    const scholarly_communication = Math.round(0.35 * s.structure + 0.25 * s.abstract + 0.20 * s.discussion + 0.20 * s.references);

    // 5. Integrity & Transparency (12%): documented limitations only.
    const limitationOpenness = hasLimitations ? 90 : 50;
    const integrity_transparency = Math.round(0.50 * s.conclusion + 0.50 * limitationOpenness);

    // 6. Future Research Value (10%): reviewer improvement suggestions or documented limitations.
    const futureResearchIndicator = hasFutureResearch ? 88 : hasLimitations ? 75 : 50;
    const future_research_value = Math.round(0.60 * futureResearchIndicator + 0.40 * (hasLimitations ? 75 : 50));

    // 7. Impact & Applicability (14%): documented practical and policy relevance.
    const practicalUtility = hasPracticalUtility && hasPolicyRelevance ? 90
      : hasPracticalUtility || hasPolicyRelevance ? 80 : 50;
    const impact_applicability = Math.round(0.50 * practicalUtility + 0.50 * (hasPolicyRelevance ? 90 : 50));

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
    // The fifth required element is limitations (not conclusion or implications).
    if (c?.limitations || /keterbatasan|limitations|limitation/i.test(abs)) detected++;

    const ecf = detected / 5; // e.g. 5/5 = 1.0, 4/5 = 0.8, 3/5 = 0.6
    const structuralAlignmentBase = 100.0; // Pure theoretical maximum (100.0 scale)

    const aeci = structuralAlignmentBase * ecf;
    return { aeci: Math.round(aeci * 10) / 10, ecf, detectedElements: detected };
  }

  private static computeARTI(scoreNorm: number, screenNorm: number, clueNorm: number): number {
    const divergence = (Math.abs(scoreNorm - screenNorm) + Math.abs(scoreNorm - clueNorm)) / 2;
    const arti = 100 - divergence;
    return Math.min(100, Math.max(0, arti));
  }

  private static computeDataCompleteness(input: TriSourceInput): number {
    // Official D_completeness checks the eight SCORE rubric fields specified in Chapter II.
    const requiredScoreFields: Array<keyof NonNullable<TriSourceInput['scoreLayer']>> = [
      'research_gap',
      'topic_relevance',
      'methodology',
      'data_statistics',
      'article_structure',
      'abstract',
      'discussion',
      'references'
    ];
    const score = input.scoreLayer;
    const available = requiredScoreFields.filter((field) => {
      const value = score?.[field];
      return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10;
    }).length;

    return Math.round((available / requiredScoreFields.length) * 100);
  }

  private static determineQualityLevel(score: number): QualityLevel {
    if (score >= 88) return 'EXEMPLARY RESEARCH RIGOR';
    if (score >= 80) return 'STRONG RESEARCH QUALITY';
    if (score >= 70) return 'GOOD RESEARCH QUALITY';
    if (score >= 60) return 'SATISFACTORY WITH LIMITATIONS';
    return 'PRELIMINARY EVIDENCE';
  }

  private static extractInsights(input: TriSourceInput, dims: ATRQSDimensionBreakdown) {
    const hasTriSource = Boolean(input.scoreLayer && input.screenLayer && input.clueLayer);
    let primaryStrength = 'Belum dapat ditentukan dari bukti tersimpan.';
    let secondaryStrength = 'Belum dapat ditentukan dari bukti tersimpan.';

    if (hasTriSource && dims.analytical_strength >= 88) {
      primaryStrength = 'Indikator analytical strength relatif tinggi pada hasil perhitungan.';
    }
    if (hasTriSource && dims.impact_applicability >= 85) {
      secondaryStrength = 'Indikator impact & applicability relatif tinggi pada hasil perhitungan.';
    }

    const limitations: string[] = input.clueLayer?.limitations?.trim()
      ? [input.clueLayer.limitations]
      : [];
    const opportunities: string[] = input.screenLayer?.suggested_improvements?.trim()
      ? [input.screenLayer.suggested_improvements]
      : [];

    return { primaryStrength, secondaryStrength, limitations, opportunities };
  }
}
