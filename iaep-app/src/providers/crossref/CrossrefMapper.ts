// src/providers/crossref/CrossrefMapper.ts

export interface CrossrefDepositMetadata {
  journalTitle: string;
  issn: string;
  volume: string;
  issue: string;
  articleTitle: string;
  doi: string;
  publicationYear: string;
  publicationDate: string; // ISO format string YYYY-MM-DD
  url: string; // The URL to resolve the DOI to (e.g. APASIFIC article page)
  authors: Array<{ givenName: string; surname: string; orcid?: string }>;
}

export class CrossrefMapper {
  /**
   * Generates a rigid XML string representing the Crossref deposit schema.
   * This builds a lightweight XML payload suitable for the test.crossref.org deposit API.
   */
  public static mapToCrossrefXML(metadata: CrossrefDepositMetadata): string {
    const batchId = crypto.randomUUID();
    const timestamp = Date.now();

    const contributorsXml = metadata.authors.map((author, index) => `
      <person_name sequence="${index === 0 ? 'first' : 'additional'}" contributor_role="author">
        <given_name>${author.givenName}</given_name>
        <surname>${author.surname}</surname>
        ${author.orcid ? `<ORCID>https://orcid.org/${author.orcid}</ORCID>` : ''}
      </person_name>
    `).join('');

    // Parse YYYY-MM-DD
    const dateParts = metadata.publicationDate.split('-');
    const year = dateParts[0] || metadata.publicationYear;
    const month = dateParts[1] || '01';
    const day = dateParts[2] || '01';

    const publicationDateXml = `
        <publication_date media_type="online">
          <year>${year}</year>
          <month>${month}</month>
          <day>${day}</day>
        </publication_date>`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch xmlns="http://www.crossref.org/schema/4.3.6" 
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
           version="4.3.6" 
           xsi:schemaLocation="http://www.crossref.org/schema/4.3.6 http://www.crossref.org/schemas/crossref4.3.6.xsd">
  <head>
    <doi_batch_id>${batchId}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>APASIFIC Publisher</depositor_name>
      <email_address>admin@apasific.com</email_address>
    </depositor>
    <registrant>APASIFIC Publisher</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata>
        <full_title>${metadata.journalTitle}</full_title>
        <issn media_type="electronic">${metadata.issn}</issn>
      </journal_metadata>
      <journal_issue>
        ${publicationDateXml}
        <journal_volume><volume>${metadata.volume}</volume></journal_volume>
        <issue>${metadata.issue}</issue>
      </journal_issue>
      <journal_article publication_type="full_text">
        <titles>
          <title>${metadata.articleTitle}</title>
        </titles>
        <contributors>
          ${contributorsXml}
        </contributors>
        ${publicationDateXml}
        <doi_data>
          <doi>${metadata.doi}</doi>
          <resource>${metadata.url}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;
  }
}
