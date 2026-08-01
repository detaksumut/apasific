import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Independence | APASIFIC Press',
  description: 'Editorial Independence Policy of APASIFIC Press.',
};

export default function EditorialIndependencePage() {
  return (
    <PolicyLayout title="Editorial Independence Policy">
      <p>
        APASIFIC Press respects and fiercely protects the editorial independence of all journals under our umbrella. We believe that scientific decisions must be completely separated from commercial, political, or publisher interests.
      </p>

      <h3>1. Separation of Powers</h3>
      <p>
        The Publisher Office is strictly segregated from the Editorial Board. APASIFIC Press provides the technical infrastructure, financial sustainability models (Diamond Open Access), and metadata federation, but exercises <strong>zero influence</strong> over manuscript acceptance or rejection.
      </p>

      <h3>2. Absolute Authority of the Editor-in-Chief</h3>
      <p>
        The Editor-in-Chief (EiC) has the final authority on all scientific content. The decision to accept or reject a manuscript is based solely on:
      </p>
      <ul>
        <li>The manuscript's scientific merit and originality.</li>
        <li>The validity of the methodology and data.</li>
        <li>The relevance to the journal's focus and scope.</li>
        <li>Compliance with research ethics and legal requirements (e.g., copyright infringement, plagiarism).</li>
      </ul>

      <h3>3. Protection Against Interference</h3>
      <p>
        APASIFIC Press guarantees that no corporate sponsor, institution, or political entity can override an editorial decision. Any attempt to pressure an editor will be met with immediate formal investigation.
      </p>
    </PolicyLayout>
  );
}
