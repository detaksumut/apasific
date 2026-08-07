import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research Integrity | APASIFIC Press',
  description: 'Research integrity standards and misconduct prevention at APASIFIC Press.',
};

export default function ResearchIntegrityPage() {
  return (
    <PolicyLayout title="Research Integrity Policy">
      <p>
        APASIFIC Press is dedicated to upholding the highest standards of research integrity. We believe that trustworthy science is the foundation of human progress. Our policies are aligned with the principles outlined by the Committee on Publication Ethics (COPE).
      </p>

      <h3>1. Scientific Misconduct</h3>
      <p>
        We strictly prohibit all forms of scientific misconduct, including but not limited to:
      </p>
      <ul>
        <li><strong>Data Fabrication:</strong> Inventing data or results and recording or reporting them.</li>
        <li><strong>Data Falsification:</strong> Manipulating research materials, equipment, or processes, or changing/omitting data such that the research is not accurately represented.</li>
        <li><strong>Duplicate Publication:</strong> Submitting or publishing the same manuscript (or substantially the same data) in multiple journals simultaneously.</li>
      </ul>

      <h3>2. Authorship Integrity & Disputes</h3>
      <p>
        Authorship must be limited to those who have made a significant contribution to the conception, design, execution, or interpretation of the reported study. "Ghost authorship" (omitting deserving authors) and "Guest/Gift authorship" (including non-contributing authors) are strictly prohibited.
      </p>
      <p>
        In the event of an authorship dispute arising before or after publication, APASIFIC Press will halt the publication process (or issue an Expression of Concern if already published) until the authors and their institutions resolve the dispute.
      </p>

      <h3>3. Human and Animal Rights</h3>
      <p>
        For research involving human subjects, authors must state that the study was conducted in accordance with the Declaration of Helsinki and that informed consent was obtained from all participants. For research involving animals, authors must state compliance with institutional or national guidelines for the care and use of laboratory animals.
      </p>
      <p>
        Documentation of ethical approval from the relevant Institutional Review Board (IRB) or ethics committee must be available upon request.
      </p>
    </PolicyLayout>
  );
}
