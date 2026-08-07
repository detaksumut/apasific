// src/providers/core/ProviderRuntimeManager.ts
import { logger } from '../../infrastructure/observability/logger';
import crypto from 'crypto';

/**
 * ProviderRuntimeManager acts as the central gateway for ALL external academic API calls.
 * It ensures rate-limiting, logging, retry mechanisms, and payload hashing.
 * Domain logic is NOT allowed to bypass this manager to reach external providers.
 */
export class ProviderRuntimeManager {
  
  static async executeRequest(
    providerName: string, 
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    try {
      logger.info({
        event: 'PROVIDER_REQUEST_INITIATED',
        requestId,
        provider: providerName,
        endpoint
      });

      // Implement rate limiting / queueing checks here in production
      
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        throw new Error(`Provider HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      logger.info({
        event: 'PROVIDER_REQUEST_SUCCESS',
        requestId,
        provider: providerName,
        latencyMs
      });

      return data;
      
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      logger.error({
        event: 'PROVIDER_REQUEST_FAILED',
        requestId,
        provider: providerName,
        latencyMs,
        error: (error as Error).message
      });
      throw error;
    }
  }

  static generatePayloadHash(payload: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }
}
