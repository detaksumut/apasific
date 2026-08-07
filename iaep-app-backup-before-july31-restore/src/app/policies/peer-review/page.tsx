import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peer Review Policy | APASIFIC Press',
  description: 'Double-blind peer review policy at APASIFIC Press.',
};

export default function PeerReviewPolicyPage() {
  return (
    <PolicyLayout title="Peer Review Policy">
      <p>
        APASIFIC Press employs a rigorous, independent, and confidential peer review process to ensure the highest quality of scientific publication.
      </p>

      <h3>1. Double-Blind Peer Review</h3>
      <p>
        All research articles published by APASIFIC Press undergo a strictly <strong>double-blind peer review</strong> process. This means that:
      </p>
      <ul>
        <li>The reviewers do not know the identity of the authors.</li>
        <li>The authors do not know the identity of the reviewers.</li>
      </ul>
      <p>
        This policy is designed to eliminate bias based on gender, institutional prestige, geographic location, or personal relationships.
      </p>

      <h3>2. The Review Process</h3>
      <ol>
        <li><strong>Initial Screening:</strong> The Editor-in-Chief or an Associate Editor conducts an initial desk review to ensure the manuscript fits the journal's scope, meets formatting guidelines, and passes a plagiarism check. Manuscripts failing this stage are desk-rejected.</li>
        <li><strong>Reviewer Assignment:</strong> The manuscript is anonymized and sent to at least two independent expert reviewers in the relevant field.</li>
        <li><strong>Reviewer Evaluation:</strong> Reviewers assess the manuscript for originality, methodology, clarity, and contribution to the field. They provide a recommendation: Accept, Minor Revisions, Major Revisions, or Reject.</li>
        <li><strong>Editorial Decision:</strong> The Editor makes a final decision based on the reviewers' reports. The Editor's decision is final.</li>
      </ol>

      <h3>3. Timeline</h3>
      <p>
        We strive for a rapid but thorough review process. Authors can typically expect a first decision within 4 to 6 weeks of submission.
      </p>
    </PolicyLayout>
  );
}
