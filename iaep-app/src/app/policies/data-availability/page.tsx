import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Availability Policy | APASIFIC Press',
  description: 'Data availability and sharing policy for APASIFIC Press.',
};

export default function DataAvailabilityPage() {
  return (
    <PolicyLayout title="Data Availability Policy">
      <p>
        APASIFIC Press supports the FAIR (Findable, Accessible, Interoperable, and Reusable) data principles. We believe that underlying research data should be made available alongside the publication to ensure scientific reproducibility and transparency.
      </p>

      <h3>1. Data Availability Statement</h3>
      <p>
        All manuscripts submitted to APASIFIC Press must include a <strong>Data Availability Statement</strong>. This statement should inform the reader where the research data associated with the paper is available, and under what conditions the data can be accessed.
      </p>

      <h3>2. Recommended Repositories</h3>
      <p>
        We strongly encourage authors to deposit their data, software, code, and AI model artifacts in recognized, DataCite-compliant public repositories before submitting their manuscript. 
      </p>
      <ul>
        <li><strong>Zenodo:</strong> For general multidisciplinary datasets and software.</li>
        <li><strong>GitHub / GitLab:</strong> For source code (preferably with a Zenodo DOI snapshot).</li>
        <li><strong>HuggingFace:</strong> For AI models and machine learning datasets.</li>
        <li><strong>Dryad / Figshare:</strong> For scientific research data.</li>
      </ul>

      <h3>3. Exceptions</h3>
      <p>
        If the data cannot be made publicly available due to privacy, ethical, or legal restrictions (e.g., patient confidentiality, proprietary corporate data), this must be clearly stated in the Data Availability Statement.
      </p>
    </PolicyLayout>
  );
}
