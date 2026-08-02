// src/providers/zenodo/IZenodoDepositProvider.ts

import { ZenodoCapability } from './ZenodoCapability';
import { ZenodoMetadata } from './ZenodoMapper';

export interface IZenodoDepositProvider {
  getCapabilities(): ZenodoCapability[];
  createDeposit(metadata: ZenodoMetadata): Promise<{ data: any, hash: string }>;
  uploadFile(depositId: string, filename: string, fileBuffer: Buffer): Promise<any>;
  publishRecord(depositId: string): Promise<{ data: any, hash: string }>;
}
