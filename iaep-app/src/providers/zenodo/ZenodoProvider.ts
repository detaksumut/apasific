// src/providers/zenodo/ZenodoProvider.ts

import { ZenodoCapability } from './ZenodoCapability';
import { ZenodoMetadata } from './ZenodoMapper';
import { IZenodoDepositProvider } from './IZenodoDepositProvider';
import crypto from 'crypto';
import { ProviderRuntimeManager } from '../core/ProviderRuntimeManager';

/**
 * ZenodoProvider communicates with the Zenodo API (Sandbox by default).
 * All calls must be executed via the ProviderRuntimeManager.
 */
export class ZenodoProvider implements IZenodoDepositProvider {
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor() {
    // Default to Sandbox for development as per architecture rules
    const environment = process.env.ZENODO_ENVIRONMENT || 'sandbox';
    this.apiUrl = environment === 'production' 
      ? 'https://zenodo.org/api' 
      : 'https://sandbox.zenodo.org/api';

    this.apiToken = process.env.ZENODO_API_TOKEN || process.env.NEXT_PUBLIC_ZENODO_API_TOKEN || '';
  }

  public getCapabilities(): ZenodoCapability[] {
    return [
      ZenodoCapability.CREATE_DEPOSIT,
      ZenodoCapability.UPLOAD_FILE,
      ZenodoCapability.PUBLISH_RECORD,
      ZenodoCapability.FETCH_METADATA,
      ZenodoCapability.VERIFY_DOI
    ];
  }

  public async createDeposit(metadata: ZenodoMetadata): Promise<{ data: any, hash: string }> {
    if (!this.apiToken) throw new Error("ZENODO_API_TOKEN is not configured.");

    const url = `${this.apiUrl}/deposit/depositions`;
    
    const data = await ProviderRuntimeManager.executeRequest('ZENODO', url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`
      },
      body: JSON.stringify(metadata),
      timeoutMs: 20000,
      retryAttempts: 2,
      retryDelayMs: 600
    });
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    
    return { data, hash };
  }

  public async uploadFile(depositId: string, filename: string, fileBuffer: Buffer): Promise<any> {
    if (!this.apiToken) throw new Error("ZENODO_API_TOKEN is not configured.");

    const url = `${this.apiUrl}/deposit/depositions/${depositId}/files?name=${encodeURIComponent(filename)}`;
    
    return await ProviderRuntimeManager.executeRequest('ZENODO', url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer as any,
      timeoutMs: 30000,
      retryAttempts: 2,
      retryDelayMs: 600
    });
  }

  public async publishRecord(depositId: string): Promise<{ data: any, hash: string }> {
    if (!this.apiToken) throw new Error("ZENODO_API_TOKEN is not configured.");

    const url = `${this.apiUrl}/deposit/depositions/${depositId}/actions/publish`;
    
    const data = await ProviderRuntimeManager.executeRequest('ZENODO', url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      },
      timeoutMs: 20000,
      retryAttempts: 2,
      retryDelayMs: 600
    });
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    
    return { data, hash };
  }
}
