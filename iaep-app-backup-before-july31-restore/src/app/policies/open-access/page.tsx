import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Open Access Policy | APASIFIC Press',
  description: 'Diamond Open Access policy and APC structure at APASIFIC Press.',
};

export default function OpenAccessPolicyPage() {
  return (
    <PolicyLayout title="Open Access Policy">
      <p>
        APASIFIC Press is a staunch advocate for the democratization of scientific knowledge. We believe that research should be freely available to the public to support a greater global exchange of knowledge.
      </p>

      <h3>1. Diamond Open Access Model</h3>
      <p>
        All journals published under APASIFIC Press operate on a <strong>Diamond Open Access</strong> model. This means that:
      </p>
      <ul>
        <li><strong>No Paywalls:</strong> Readers can access, read, download, and distribute all published articles completely free of charge immediately upon publication.</li>
        <li><strong>No APCs:</strong> Authors are <strong>not</strong> required to pay any Article Processing Charges (APCs) or submission fees. The publication costs are fully subsidized by our institutional partners and the APASIFIC academic network.</li>
      </ul>

      <h3>2. Licensing</h3>
      <p>
        As detailed in our Copyright Policy, all content is published under the Creative Commons Attribution 4.0 International License (CC BY 4.0). This ensures maximum reach and reusability of the research while maintaining proper attribution to the original authors.
      </p>

      <h3>3. Self-Archiving (Green Open Access)</h3>
      <p>
        We strongly support self-archiving. Authors are permitted and encouraged to post the final, published PDF version of their article (the Publisher's Version of Record) on their personal websites, institutional repositories, and academic networks (e.g., ResearchGate, Academia.edu) immediately upon publication.
      </p>
    </PolicyLayout>
  );
}
