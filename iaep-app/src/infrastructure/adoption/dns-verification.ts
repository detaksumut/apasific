// src/infrastructure/adoption/dns-verification.ts
import crypto from 'crypto';
import dns from 'dns/promises';
import { logger } from '../observability/logger';

export function generateDnsChallenge(): string {
  return `apasific-verification=${crypto.randomBytes(16).toString('hex')}`;
}

export const DnsVerificationEngine = {
  verifyDomain: async (domain: string, expectedChallenge: string): Promise<boolean> => {
    try {
      const records = await dns.resolveTxt(domain);
      const flattenedRecords = records.map(record => record.join(''));
      
      const isVerified = flattenedRecords.includes(expectedChallenge);
      
      logger.info({ 
        event: 'DNS_VERIFICATION_EVALUATED', 
        domain, 
        isVerified 
      });

      return isVerified;
    } catch (error) {
      logger.error({ event: 'DNS_VERIFICATION_FAILED', domain, error: (error as Error).message });
      return false;
    }
  }
};
