import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plagiarism Policy | APASIFIC Press',
  description: 'Plagiarism detection and enforcement policy at APASIFIC Press.',
};

export default function PlagiarismPolicyPage() {
  return (
    <PolicyLayout title="Plagiarism Policy">
      <p>
        APASIFIC Press enforces a zero-tolerance policy against plagiarism. All submitted manuscripts are subjected to rigorous similarity checks before they are sent for peer review.
      </p>

      <h3>1. Definition of Plagiarism</h3>
      <p>
        Plagiarism includes, but is not limited to:
      </p>
      <ul>
        <li>Copying text, data, or ideas from another source without proper attribution.</li>
        <li>Self-plagiarism (recycling one's own previously published work without citation).</li>
        <li>Paraphrasing substantial portions of another author's work without crediting the original source.</li>
      </ul>

      <h3>2. Similarity Threshold</h3>
      <p>
        All manuscripts are screened using industry-standard similarity detection software (e.g., Turnitin, iThenticate). 
        The maximum acceptable similarity index is <strong>20%</strong>, excluding the bibliography/references section. Furthermore, similarity from a single source must not exceed <strong>5%</strong>.
      </p>

      <h3>3. Enforcement</h3>
      <p>
        If plagiarism is detected:
      </p>
      <ul>
        <li><strong>During Initial Screening:</strong> The manuscript will be immediately desk-rejected, and the authors will be notified of the reason.</li>
        <li><strong>After Publication:</strong> If plagiarism is discovered after the article has been published, APASIFIC Press will conduct a formal investigation. If proven, the article will be formally retracted according to our Corrections & Retractions policy, and the authors' institutions may be notified.</li>
      </ul>
    </PolicyLayout>
  );
}
