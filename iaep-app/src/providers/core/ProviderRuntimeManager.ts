// src/providers/core/ProviderRuntimeManager.ts
import { logger } from '../../infrastructure/observability/logger';
import crypto from 'crypto';

type ProviderRequestOptions = RequestInit & {
  timeoutMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
};

/**
 * ProviderRuntimeManager acts as the central gateway for ALL external academic API calls.
 * It ensures rate-limiting, logging, retry mechanisms, and payload hashing.
 * Domain logic is NOT allowed to bypass this manager to reach external providers.
 */
export class ProviderRuntimeManager {
  private static readonly defaultTimeoutMs = 15000;
  private static readonly defaultRetryAttempts = 3;
  private static readonly defaultRetryDelayMs = 250;

  static async executeRequest(
    providerName: string,
    endpoint: string,
    options: ProviderRequestOptions = {}
  ): Promise<any> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const timeoutMs = Number(options.timeoutMs ?? this.defaultTimeoutMs);
    const retryAttempts = Math.max(0, Number(options.retryAttempts ?? this.defaultRetryAttempts));
    const retryDelayMs = Number(options.retryDelayMs ?? this.defaultRetryDelayMs);
    const headers = new Headers(options.headers ?? {});
    headers.set('X-Trace-Id', requestId);

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      try {
        logger.info({
          event: 'PROVIDER_REQUEST_INITIATED',
          requestId,
          provider: providerName,
          endpoint,
          attempt: attempt + 1,
          timeoutMs
        });

        const response = await fetch(endpoint, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutHandle);

        if (!response.ok) {
          const responseText = await response.text().catch(() => '');
          const retryable = response.status === 408 || response.status === 429 || response.status >= 500;

          if (retryable && attempt < retryAttempts) {
            logger.warn({
              event: 'PROVIDER_REQUEST_RETRY',
              requestId,
              provider: providerName,
              endpoint,
              attempt: attempt + 1,
              status: response.status,
              reason: responseText
            });
            await this.delay(retryDelayMs * (attempt + 1));
            continue;
          }

          throw new Error(`Provider HTTP Error: ${response.status} ${responseText}`.trim());
        }

        const contentType = response.headers.get('content-type') ?? '';
        const data = contentType.includes('application/json')
          ? await response.json()
          : await response.text();
        const latencyMs = Date.now() - startTime;

        logger.info({
          event: 'PROVIDER_REQUEST_SUCCESS',
          requestId,
          provider: providerName,
          latencyMs,
          attempt: attempt + 1
        });

        return data;
      } catch (error) {
        clearTimeout(timeoutHandle);
        const latencyMs = Date.now() - startTime;
        const retryable = this.isRetryableError(error as Error);

        if (retryable && attempt < retryAttempts) {
          logger.warn({
            event: 'PROVIDER_REQUEST_RETRY',
            requestId,
            provider: providerName,
            endpoint,
            attempt: attempt + 1,
            latencyMs,
            error: (error as Error).message
          });
          await this.delay(retryDelayMs * (attempt + 1));
          continue;
        }

        logger.error({
          event: 'PROVIDER_REQUEST_FAILED',
          requestId,
          provider: providerName,
          latencyMs,
          attempt: attempt + 1,
          error: (error as Error).message
        });
        throw error;
      }
    }

    throw new Error(`Provider request failed after retries for ${providerName}`);
  }

  private static isRetryableError(error: Error): boolean {
    if (!error) return false;
    return error.name === 'AbortError' || /timeout|429|408|5\d\d|fetch/i.test(error.message);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generatePayloadHash(payload: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }
}
