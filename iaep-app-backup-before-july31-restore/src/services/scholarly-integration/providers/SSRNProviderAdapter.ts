import { IScholarlyProviderAdapter, PublicationMetadata } from '../IScholarlyProviderAdapter';

export class SSRNProviderAdapter implements IScholarlyProviderAdapter {
  
  async fetchMetadata(identifier: string): Promise<PublicationMetadata> {
    // Phase 1: Manual metadata management
    // No scraping or unofficial API dependency.
    // In the future (Phase 2), this could integrate with an official SSRN API if one becomes available.
    return {
      identifier: identifier,
      provider: 'SSRN',
      url: `https://papers.ssrn.com/sol3/papers.cfm?abstract_id=${identifier}`,
      sourceType: 'EXTERNAL'
    };
  }

  async validateIdentifier(identifier: string): Promise<boolean> {
    // Basic validation for SSRN Abstract ID (typically numeric)
    const isValidFormat = /^\d+$/.test(identifier);
    
    if (!isValidFormat) return false;

    // Phase 1: We assume it's manually validated or we do a simple format check.
    // If we wanted to perform a lightweight HEAD request in Phase 2, we could do it here
    // to check if the SSRN URL returns a 200 OK. For now, format validation is sufficient.
    return true;
  }
}
