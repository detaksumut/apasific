import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complaints Policy | APASIFIC Press',
  description: 'Procedures for handling complaints and appeals at APASIFIC Press.',
};

export default function ComplaintsPolicyPage() {
  return (
    <PolicyLayout title="Complaints & Appeals Policy">
      <p>
        APASIFIC Press is committed to providing an excellent service to our authors, reviewers, and readers. We take all complaints and appeals seriously and handle them with transparency, fairness, and professionalism in accordance with the COPE (Committee on Publication Ethics) guidelines.
      </p>

      <h3>1. Appeals Against Editorial Decisions</h3>
      <p>
        Authors have the right to appeal a rejection decision if they believe it was fundamentally unfair or based on a clear misunderstanding of the scientific content.
      </p>
      <ul>
        <li>Appeals must be submitted in writing to the Editor-in-Chief within 30 days of the rejection notice.</li>
        <li>The appeal must contain detailed, point-by-point evidence refuting the reviewers' or editor's comments.</li>
        <li>The Editor-in-Chief's decision on the appeal is final.</li>
      </ul>

      <h3>2. Complaints About Editorial Processes</h3>
      <p>
        Complaints regarding the peer review process (e.g., severe delays, unprofessional reviewer comments, or perceived bias) should be directed to the Publisher Office (admin@apasific.com). The Publisher Office will investigate the procedural aspects without interfering in the scientific evaluation.
      </p>

      <h3>3. Complaints About Publication Ethics</h3>
      <p>
        If a reader or researcher suspects ethical misconduct in a published APASIFIC article (e.g., plagiarism, data fabrication, undisclosed conflicts of interest), they should contact the editorial team immediately.
      </p>
      <p>
        All allegations of misconduct will be thoroughly investigated. If the allegations are substantiated, APASIFIC Press will follow the Corrections & Retractions policy to amend the scholarly record.
      </p>
    </PolicyLayout>
  );
}
