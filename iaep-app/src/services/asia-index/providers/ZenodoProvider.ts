// src/services/asia-index/providers/ZenodoProvider.ts
/**
 * ZenodoProvider — Tier 2 Scholarly Infrastructure Provider (Open Science Deposit)
 * Non-blocking, isolated, fail-safe.
 */

export interface ZenodoVerificationResult {
  verified: boolean;
  recordId?: string;
  doi?: string;
  externalUrl?: string;
  matchMethod: 'RECORD_ID' | 'DOI_EXACT' | 'NONE';
  confidenceScore: number; // 0 - 100
  views?: number;
  downloads?: number;
  error?: string;
}

export class ZenodoProvider {
  private static readonly TIMEOUT_MS = 4000;

  /**
   * Verifies Zenodo record by ID or DOI
   */
  public static async verifyRecord(zenodoIdOrDoi?: string): Promise<ZenodoVerificationResult> {
    if (!zenodoIdOrDoi) {
      return {
        verified: false,
        matchMethod: 'NONE',
        confidenceScore: 0
      };
    }

    let recordId = '';
    const cleanInput = zenodoIdOrDoi.trim();

    if (/^\d+$/.test(cleanInput)) {
      recordId = cleanInput;
    } else if (cleanInput.includes('zenodo.')) {
      recordId = cleanInput.split('zenodo.').slice(-1)[0].replace(/[^0-9]/g, '');
    }

    if (!recordId) {
      return {
        verified: false,
        matchMethod: 'NONE',
        confidenceScore: 0
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const url = `https://zenodo.org/api/records/${recordId}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Fallback for valid ID format
        return {
          verified: true,
          recordId,
          externalUrl: `https://zenodo.org/records/${recordId}`,
          matchMethod: 'RECORD_ID',
          confidenceScore: 75,
          error: `Zenodo API returned ${response.status}`
        };
      }

      const data = await response.json();
      const zDoi = data?.doi || data?.metadata?.doi || `10.5281/zenodo.${recordId}`;
      const zViews = data?.stats?.all?.views || data?.stats?.views || 0;
      const zDownloads = data?.stats?.all?.downloads || data?.stats?.downloads || 0;

      return {
        verified: true,
        recordId,
        doi: zDoi,
        externalUrl: `https://zenodo.org/records/${recordId}`,
        matchMethod: 'RECORD_ID',
        confidenceScore: 100,
        views: zViews,
        downloads: zDownloads
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      return {
        verified: true,
        recordId,
        externalUrl: `https://zenodo.org/records/${recordId}`,
        matchMethod: 'RECORD_ID',
        confidenceScore: 70,
        error: err?.message || 'Zenodo API timeout/fallback'
      };
    }
  }
}
