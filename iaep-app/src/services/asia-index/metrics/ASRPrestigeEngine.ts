// src/services/asia-index/metrics/ASRPrestigeEngine.ts
/**
 * ASRPrestigeEngine — ASIA Scholarly Rank (Level Jurnal - Prestige Propagation).
 * 
 * Strict Mathematical Guarantees:
 * 1. Recursive matrix W strictly contains ONLY KNOWN_ASIA_SOURCE journal nodes (N x N).
 * 2. External sources participate strictly as a bounded linear influx vector v_ext.
 * 3. Teleportation vector q is strictly normalized: ||q||_1 === 1.00000000.
 * 4. Dangling nodes are handled via uniform distribution W_ik = 1/N.
 * 5. Iteration strictly conserves probability: ||p^(k)|| === 1.00000000 for all k.
 * 6. Effective edge weight W_eff = W_damp * W_conf applied exactly ONCE at edge collection.
 * 7. Subject normalization against category baseline.
 */

import { AASCalculator } from './AASCalculator';
import type { 
  ASRGraphNode, 
  ASRGraphEdge, 
  ASRExternalInflux, 
  ASRResult, 
  MetricState 
} from './types';

export class ASRPrestigeEngine {
  public static readonly FORMULA_VERSION = 'ASR-1.2-PAGE-PROPAGATION-CONSERVED';
  public static readonly DAMPING_FACTOR = 0.85;
  public static readonly EXTERNAL_COUPLING_BETA = 0.15;
  public static readonly CONVERGENCE_EPSILON = 1e-6;
  public static readonly MAX_ITERATIONS = 100;

  /**
   * Solves the Power Iteration for ASR prestige propagation with external influx isolation
   * and strict L1 probability conservation (||p||_1 === 1.000000).
   */
  public static calculateASRNetwork(
    nodes: ASRGraphNode[],
    internalEdges: ASRGraphEdge[],
    externalInfluxList: ASRExternalInflux[]
  ): ASRResult[] {
    const N = nodes.length;
    if (N === 0) return [];

    const nodeIndexMap = new Map<string, number>();
    nodes.forEach((n, idx) => nodeIndexMap.set(n.journalId, idx));

    // 1. Construct N x N transition matrix W (source -> target)
    const rawMatrix: number[][] = Array.from({ length: N }, () => Array(N).fill(0));

    for (const edge of internalEdges) {
      const srcIdx = nodeIndexMap.get(edge.sourceJournalId);
      const tgtIdx = nodeIndexMap.get(edge.targetJournalId);
      if (srcIdx !== undefined && tgtIdx !== undefined) {
        // W_eff applied exactly ONCE here
        const wEff = AASCalculator.getEffectiveEdgeWeight(edge.selfClass, edge.topologyConfidence);
        rawMatrix[srcIdx][tgtIdx] += wEff;
      }
    }

    // Row-normalize W with Dangling Node handling
    const W: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    let danglingCount = 0;

    for (let i = 0; i < N; i++) {
      const rowSum = rawMatrix[i].reduce((sum, val) => sum + val, 0);
      if (rowSum > 0) {
        for (let j = 0; j < N; j++) {
          W[i][j] = rawMatrix[i][j] / rowSum;
        }
      } else {
        // Dangling node: uniform distribution across all nodes
        danglingCount++;
        for (let j = 0; j < N; j++) {
          W[i][j] = 1.0 / N;
        }
      }
    }

    // 2. Construct strictly normalized external influx vector v_ext
    const rawExtVector = Array(N).fill(0);
    for (const ext of externalInfluxList) {
      const tgtIdx = nodeIndexMap.get(ext.targetJournalId);
      if (tgtIdx !== undefined) {
        // W_eff applied exactly ONCE here
        const wEff = AASCalculator.getEffectiveEdgeWeight(ext.selfClass, ext.topologyConfidence);
        const pSource = ext.sourceType === 'VERIFIED_EXTERNAL_SOURCE' ? 1.00 : 0.35;
        rawExtVector[tgtIdx] += ext.count * wEff * pSource;
      }
    }

    const totalExtWeight = rawExtVector.reduce((sum: number, val: number) => sum + val, 0);
    const vExt = Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      vExt[i] = totalExtWeight > 0 ? (rawExtVector[i] / totalExtWeight) : (1.0 / N);
    }

    // 3. Composite teleportation vector q = ( (e/N) + beta * v_ext ) / ||(e/N) + beta * v_ext||_1
    const beta = this.EXTERNAL_COUPLING_BETA;
    const rawQ = Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      rawQ[i] = (1.0 / N) + (beta * vExt[i]);
    }
    const qSum = rawQ.reduce((sum: number, val: number) => sum + val, 0);
    const q = rawQ.map((val: number) => val / qSum); // Strictly ||q||_1 === 1.00000000

    // 4. Power Iteration Solver
    const d = this.DAMPING_FACTOR;
    let p = Array(N).fill(1.0 / N);
    let iterations = 0;
    let delta = 1.0;

    while (iterations < this.MAX_ITERATIONS && delta > this.CONVERGENCE_EPSILON) {
      const pNext = Array(N).fill(0);

      // pNext = (1 - d) * q + d * (W^T * p)
      for (let j = 0; j < N; j++) {
        let wtSum = 0;
        for (let i = 0; i < N; i++) {
          wtSum += p[i] * W[i][j];
        }
        pNext[j] = ((1 - d) * q[j]) + (d * wtSum);
      }

      // Explicit L1-conservation step
      const stepSum = pNext.reduce((sum: number, val: number) => sum + val, 0);
      const pNextNormalized = stepSum > 0 ? pNext.map((val: number) => val / stepSum) : pNext;

      // Compute L1 Delta
      let stepDelta = 0;
      for (let i = 0; i < N; i++) {
        stepDelta += Math.abs(pNextNormalized[i] - p[i]);
      }
      delta = stepDelta;
      p = pNextNormalized;
      iterations++;
    }

    // 5. Subject Category Normalization
    // Group journals by subject category
    const categoryMap = new Map<string, number[]>();
    nodes.forEach((n, idx) => {
      const cat = n.subjectCategory || 'Multidisciplinary';
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(idx);
    });

    const results: ASRResult[] = [];

    categoryMap.forEach((indices, category) => {
      // Calculate per-article raw prestige
      const perArticlePrestige = indices.map(idx => {
        const artCount = Math.max(1, nodes[idx].publishedArticlesCount || 1);
        return p[idx] / artCount;
      });

      const catMean = perArticlePrestige.reduce((a, b) => a + b, 0) / Math.max(1, indices.length);

      indices.forEach((idx, localIdx) => {
        const rawPrestige = p[idx];
        const normalizedASR = catMean > 0 
          ? +(perArticlePrestige[localIdx] / catMean).toFixed(3)
          : 1.000;

        let status: MetricState = 'CALCULATED';
        if (nodes[idx].publishedArticlesCount < 5) {
          status = 'INSUFFICIENT_DATA';
        } else if (nodes[idx].publishedArticlesCount < 10 || indices.length < 10) {
          status = 'PROVISIONAL';
        }

        results.push({
          journalId: nodes[idx].journalId,
          prestigeScore: +rawPrestige.toFixed(6),
          scholarlyRank: normalizedASR,
          subjectCategory: category,
          iterationsToConvergence: iterations,
          convergenceDelta: +delta.toExponential(4),
          status,
          formulaVersion: this.FORMULA_VERSION
        });
      });
    });

    return results;
  }
}
