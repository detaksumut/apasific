import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publication Ethics | APASIFIC Press',
  description: 'Publication Ethics and Malpractice Statement of APASIFIC Press.',
};

export default function PublicationEthicsPage() {
  return (
    <PolicyLayout title="Publication Ethics & Malpractice Statement">
      <p>
        APASIFIC Press is committed to maintaining the highest ethical standards in scientific publishing. 
        We expect all parties involved—authors, reviewers, and editors—to strictly adhere to our policies.
      </p>

      <h3>1. Duties of Editors</h3>
      <ul>
        <li><strong>Fair Play:</strong> Editors evaluate manuscripts for their intellectual content without regard to race, gender, sexual orientation, religious belief, ethnic origin, citizenship, or political philosophy of the authors.</li>
        <li><strong>Confidentiality:</strong> The editorial staff must not disclose any information about a submitted manuscript to anyone other than the corresponding author, reviewers, and the publisher.</li>
        <li><strong>Disclosure and Conflicts of Interest:</strong> Unpublished materials disclosed in a submitted manuscript must not be used in an editor's own research without the express written consent of the author.</li>
      </ul>

      <h3>2. Duties of Reviewers</h3>
      <ul>
        <li><strong>Contribution to Editorial Decisions:</strong> Peer review assists the editor in making editorial decisions and may assist the author in improving the paper.</li>
        <li><strong>Promptness:</strong> Any selected referee who feels unqualified to review the research reported in a manuscript or knows that its prompt review will be impossible should notify the editor and excuse themselves from the review process.</li>
        <li><strong>Objectivity:</strong> Reviews should be conducted objectively. Personal criticism of the author is inappropriate. Referees should express their views clearly with supporting arguments.</li>
      </ul>

      <h3>3. Duties of Authors</h3>
      <ul>
        <li><strong>Originality and Plagiarism:</strong> Authors should ensure they have written entirely original works. If authors use the work or words of others, this must be appropriately cited or quoted.</li>
        <li><strong>Multiple, Redundant, or Concurrent Publication:</strong> Authors should not in general publish manuscripts describing essentially the same research in more than one journal.</li>
        <li><strong>Authorship of the Paper:</strong> Authorship should be limited to those who have made a significant contribution to the conception, design, execution, or interpretation of the reported study.</li>
      </ul>
    </PolicyLayout>
  );
}
