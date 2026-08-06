export interface AnonymizationReport {
  removed_authors: boolean;
  removed_emails: boolean;
  removed_affiliation: boolean;
  timestamp: string;
}

export class AnonymizationLayer {
  /**
   * Sanitizes manuscript text to enforce double-blind peer review compliance.
   * Replaces names, emails, and affiliations with anonymization placeholders.
   */
  public static anonymize(
    rawText: string,
    metadata: {
      authorNames?: string[];
      affiliation?: string;
      emails?: string[];
    }
  ): { cleanText: string; report: AnonymizationReport } {
    let cleanText = rawText || '';
    const report: AnonymizationReport = {
      removed_authors: false,
      removed_emails: false,
      removed_affiliation: false,
      timestamp: new Date().toISOString()
    };

    // 1. Remove Emails (Regex pattern match)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    if (emailRegex.test(cleanText)) {
      cleanText = cleanText.replace(emailRegex, '[EMAIL_REMOVED]');
      report.removed_emails = true;
    }

    // 2. Remove Affiliation / Institution
    if (metadata.affiliation && metadata.affiliation.trim().length > 3) {
      const cleanAff = metadata.affiliation.replace(/\s+/g, ' ').trim();
      const escapedAff = cleanAff.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape regex chars
      const affRegex = new RegExp(escapedAff, 'gi');
      if (affRegex.test(cleanText)) {
        cleanText = cleanText.replace(affRegex, '[INSTITUTION_REMOVED]');
        report.removed_affiliation = true;
      }
    }

    // 3. Remove Author Names
    if (metadata.authorNames && metadata.authorNames.length > 0) {
      for (const author of metadata.authorNames) {
        if (author && author.trim().length > 2) {
          const cleanAuthor = author.replace(/\s+/g, ' ').trim();
          const escapedAuthor = cleanAuthor.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const authorRegex = new RegExp(escapedAuthor, 'gi');
          if (authorRegex.test(cleanText)) {
            cleanText = cleanText.replace(authorRegex, '[AUTHOR_REMOVED]');
            report.removed_authors = true;
          }

          // Also remove individual tokens of names (e.g. surname) if they are distinct and long enough
          const nameParts = cleanAuthor.split(' ').filter(part => part.length > 3);
          for (const part of nameParts) {
            const escapedPart = part.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const partRegex = new RegExp(`\\b${escapedPart}\\b`, 'gi');
            if (partRegex.test(cleanText)) {
              cleanText = cleanText.replace(partRegex, '[AUTHOR_REMOVED]');
              report.removed_authors = true;
            }
          }
        }
      }
    }

    // 4. Remove Acknowledgement / Funding section (common place for identity leaks)
    const ackRegex = /(acknowledgements?|ucapan\s+terima\s+kasih|funding|pendanaan)[\s\S]*$/i;
    if (ackRegex.test(cleanText)) {
      cleanText = cleanText.replace(ackRegex, (match) => {
        // Keep the section header but wipe the content
        const lines = match.split('\n');
        const header = lines[0] || 'ACKNOWLEDGEMENTS';
        return `${header}\n\n[ACKNOWLEDGEMENT_SECTION_REMOVED_FOR_DOUBLE_BLIND]`;
      });
    }

    return { cleanText, report };
  }
}
