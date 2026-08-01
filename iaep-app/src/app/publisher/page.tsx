import React from 'react';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { PublisherStructureDiagram } from '@/components/governance/PublisherStructureDiagram';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APASIFIC Press | Academic Publisher',
  description: 'Independent Open Access Academic Publisher dedicated to global scholarly communication.',
};

export default function PublisherPage() {
  return (
    <div className="min-h-screen bg-white">
      <GovernanceHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">APASIFIC Press</h1>
        
        <div className="prose prose-blue max-w-none text-gray-700">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">About the Publisher</h2>
            <p>
              <strong>APASIFIC Press</strong> is an independent, non-profit academic publisher committed to advancing global scholarly communication through fully open-access, peer-reviewed journals. We leverage modern research object federation to bridge the Global South with international academic networks.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Publisher Type:</strong> Independent Academic Publisher</li>
              <li><strong>Publishing Model:</strong> Open Access Scholarly Publishing Platform</li>
              <li><strong>Access Model:</strong> Diamond Open Access</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">Publisher Responsibilities & Transparency Statement</h2>
            <p>
              APASIFIC Press follows international principles of scholarly publishing transparency. We are committed to maintaining independent editorial decisions and protecting academic integrity.
            </p>
            <p>The publisher publicly provides and guarantees:</p>
            <ul className="list-disc pl-5 mt-4 space-y-1">
              <li>Transparent journal ownership information</li>
              <li>Verifiable editorial board affiliations</li>
              <li>Rigorous double-blind peer review processes</li>
              <li>Strict publication ethics policies</li>
              <li>Diamond Open Access licensing (CC-BY 4.0) with zero Article Processing Charges (APCs)</li>
              <li>Clear correction, retraction, and complaints procedures</li>
              <li>Long-term digital preservation strategies (Crossref & Zenodo)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">Organizational Structure</h2>
            <p>
              To ensure editorial independence, APASIFIC Press separates its administrative operations from its editorial and peer-review networks.
            </p>
            <PublisherStructureDiagram />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-2"><strong>Official Publisher Name:</strong> APASIFIC Press</p>
              <p className="mb-2"><strong>Website:</strong> <a href="https://apasific.com" className="text-blue-600 hover:underline">https://apasific.com</a></p>
              <p className="mb-2"><strong>Primary Contact:</strong> admin@apasific.com</p>
              <p className="mb-0"><strong>Address:</strong> Global Academic Infrastructure Node</p>
            </div>
          </section>
        </div>
      </main>

      {/* Basic JSON-LD for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "APASIFIC Press",
            "url": "https://apasific.com",
            "logo": "https://apasific.com/logo.png",
            "sameAs": [
              "https://crossref.org",
              "https://orcid.org"
            ]
          })
        }}
      />
    </div>
  );
}
