import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copyright Policy | APASIFIC Press',
  description: 'Copyright and licensing policy for APASIFIC Press.',
};

export default function CopyrightPolicyPage() {
  return (
    <PolicyLayout title="Copyright Policy">
      <p>
        APASIFIC Press believes that authors should retain control over their intellectual property. Our copyright policy aligns with modern Open Access principles to maximize the dissemination of scholarly work.
      </p>

      <h3>1. Author Rights</h3>
      <p>
        Authors who publish with APASIFIC Press retain <strong>full copyright</strong> of their work without any restrictions. We do not require authors to transfer their copyright to the publisher.
      </p>

      <h3>2. Open Access License</h3>
      <p>
        All articles published in our journals are distributed under the terms of the <strong>Creative Commons Attribution 4.0 International License (CC BY 4.0)</strong>. 
      </p>
      <p>
        Under this license, anyone is free to:
      </p>
      <ul>
        <li><strong>Share:</strong> Copy and redistribute the material in any medium or format.</li>
        <li><strong>Adapt:</strong> Remix, transform, and build upon the material for any purpose, even commercially.</li>
      </ul>
      <p>
        Under the following terms:
      </p>
      <ul>
        <li><strong>Attribution:</strong> You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.</li>
      </ul>

      <h3>3. Reuse Permission</h3>
      <p>
        Because the articles are published under CC BY 4.0 and authors retain copyright, readers and other researchers do not need to request permission from APASIFIC Press to reuse the material, provided that proper attribution to the original authors and the APASIFIC journal is given.
      </p>
    </PolicyLayout>
  );
}
