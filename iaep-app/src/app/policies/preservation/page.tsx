import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Preservation Policy | APASIFIC Press',
  description: 'Digital archiving and preservation infrastructure of APASIFIC Press.',
};

export default function PreservationPolicyPage() {
  return (
    <PolicyLayout title="Digital Preservation Policy">
      <p>
        APASIFIC Press is committed to ensuring the permanent availability and accessibility of all published scholarly content. We utilize a robust, multi-layered digital preservation strategy to safeguard the scholarly record against technological obsolescence and platform failure.
      </p>

      <h3>1. Primary DOI Infrastructure</h3>
      <p>
        We are a registered member of <strong>Crossref</strong>. Every published article, issue, and volume is assigned a persistent Digital Object Identifier (DOI). Crossref serves as our primary identity and metadata preservation layer, ensuring that the link to the article remains active permanently, even if the APASIFIC platform URL changes.
      </p>

      <h3>2. Long-term Archiving (The Preservation Layer)</h3>
      <p>
        To guarantee the survival of the actual PDF manuscripts and associated research objects, we employ a secondary preservation strategy:
      </p>
      <ul>
        <li><strong>Zenodo (CERN):</strong> A complete copy of the published manuscript (Version of Record) and its metadata is automatically deposited into the Zenodo repository, funded by CERN and OpenAIRE. This acts as our dark archive and public preservation mirror.</li>
      </ul>

      <h3>3. Global Discovery Federation</h3>
      <p>
        Our metadata is continuously synced with global discovery networks, including OpenAIRE and OpenAlex, ensuring that the bibliographic footprint of the article exists in multiple independent academic graphs worldwide.
      </p>
    </PolicyLayout>
  );
}
