// src/services/asia-index/providers/CrossrefProvider.ts
/**
 * CrossrefProvider — Tier 1 Identity Provider (DOI Exact Match & Verification)
 * Non-blocking, isolated, fail-safe.
 */

export interface CrossrefVerificationResult {
  verified: boolean;
  doi: string;
  externalUrl?: string;
  matchMethod: 'DOI_EXACT' | 'METADATA_MATCH' | 'NONE';
  confidenceScore: number; // 0 - 100
  titleMatch?: boolean;
  publisher?: string;
  isReferencedByCount?: number;
  error?: string;
}

export class CrossrefProvider {
  private static readonly TIMEOUT_MS = 4000;

  /**
   * Verifies DOI against Crossref API
   */
  public static async verifyDoi(doi: string, expectedTitle?: string): Promise<CrossrefVerificationResult> {
    if (!doi) {
      return {
        verified: false,
        doi: '',
        matchMethod: 'NONE',
        confidenceScore: 0
      };
    }

    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, '').trim();
    if (!cleanDoi) {
      return {
        verified: false,
        doi: '',
        matchMethod: 'NONE',
        confidenceScore: 0
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const email = 'admin@apasific.org';
      const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}?mailto=${email}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          verified: false,
          doi: cleanDoi,
          externalUrl: `https://doi.org/${cleanDoi}`,
          matchMethod: 'NONE',
          confidenceScore: 20, // DOI exists format-wise but query returned non-200
          error: `Crossref returned status ${response.status}`
        };
      }

      const data = await response.json();
      const message = data?.message;
      if (!message) {
        return {
          verified: false,
          doi: cleanDoi,
          matchMethod: 'NONE',
          confidenceScore: 30
        };
      }

      // Exact check on title if provided
      let titleMatch = true;
      if (expectedTitle && message.title && message.title.length > 0) {
        const normExpected = expectedTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normCrossref = String(message.title[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
        titleMatch = normExpected.length > 0 && (normCrossref.includes(normExpected) || normExpected.includes(normCrossref));
      }

      const confidence = titleMatch ? 100 : 85;

      return {
        verified: true,
        doi: cleanDoi,
        externalUrl: `https://doi.org/${cleanDoi}`,
        matchMethod: 'DOI_EXACT',
        confidenceScore: confidence,
        titleMatch,
        publisher: message.publisher || 'Crossref Registered Publisher',
        isReferencedByCount: message['is-referenced-by-count'] || 0
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      // Non-blocking fallback: if DOI has standard DOI syntax (10.xxxx/...)
      const looksLikeValidDoi = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/i.test(cleanDoi);
      return {
        verified: looksLikeValidDoi,
        doi: cleanDoi,
        externalUrl: `https://doi.org/${cleanDoi}`,
        matchMethod: looksLikeValidDoi ? 'DOI_EXACT' : 'NONE',
        confidenceScore: looksLikeValidDoi ? 70 : 0,
        error: err?.message || 'Crossref lookup timeout/network fallback'
      };
    }
  }
}
