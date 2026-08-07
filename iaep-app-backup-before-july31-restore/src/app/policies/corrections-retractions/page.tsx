import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corrections & Retractions | APASIFIC Press',
  description: 'Procedures for correcting and retracting published articles.',
};

export default function CorrectionsRetractionsPage() {
  return (
    <PolicyLayout title="Corrections & Retractions">
      <p>
        APASIFIC Press is committed to maintaining the integrity of the scholarly record. We recognize our responsibility to correct errors that affect the interpretation of data or information presented in an article.
      </p>

      <h3>1. Corrections (Errata and Corrigenda)</h3>
      <p>
        A correction notice will be published when a significant error is discovered in a published article that affects the scholarly record or the scientific integrity of the paper, but does not invalidate the overall results and conclusions.
      </p>
      <ul>
        <li><strong>Erratum:</strong> Issued when the error was introduced by the publisher during the editing or production process.</li>
        <li><strong>Corrigendum:</strong> Issued when the error was made by the authors.</li>
      </ul>
      <p>
        The original article remains online, but a link to the correction notice is appended to the metadata.
      </p>

      <h3>2. Retractions</h3>
      <p>
        Retractions are reserved for articles whose findings or conclusions are found to be unreliable, either as a result of honest error or scientific misconduct (e.g., data fabrication, severe plagiarism, unethical research practices).
      </p>
      <p>
        When an article is retracted:
      </p>
      <ul>
        <li>A retraction notice is published and linked to the original article.</li>
        <li>The original article is marked as "RETRACTED" across the APASIFIC platform, Crossref, and Zenodo.</li>
        <li>The DOI of the retracted article is maintained to ensure transparency of the scholarly record.</li>
      </ul>

      <h3>3. Expressions of Concern</h3>
      <p>
        If serious concerns are raised about an article, but conclusive evidence of misconduct is pending a lengthy investigation, the Editor-in-Chief may issue an "Expression of Concern" to alert readers while the investigation is ongoing.
      </p>
    </PolicyLayout>
  );
}
