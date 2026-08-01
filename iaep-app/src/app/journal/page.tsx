import React from 'react';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APASIFIC Journal of Academic Research',
  description: 'An international peer-reviewed journal publishing multidisciplinary scholarly research.',
};

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-white">
      <GovernanceHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">APASIFIC Journal of Academic Research</h1>
        <p className="text-xl text-gray-500 mb-8">Abbreviation: APASIFIC J. Acad. Res.</p>
        
        <div className="prose prose-blue max-w-none text-gray-700">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mt-0 mb-3 border-b border-blue-200 pb-2">Journal Identity</h3>
              <ul className="space-y-2 m-0 p-0 list-none text-sm">
                <li><strong className="text-gray-900">Publisher:</strong> APASIFIC Press</li>
                <li><strong className="text-gray-900">ISSN (Online):</strong> <em>[Pending Assignment]</em></li>
                <li><strong className="text-gray-900">Language:</strong> English</li>
                <li><strong className="text-gray-900">Established:</strong> 2026</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-bold text-green-900 mt-0 mb-3 border-b border-green-200 pb-2">Publication Model</h3>
              <ul className="space-y-2 m-0 p-0 list-none text-sm">
                <li><strong className="text-gray-900">Access:</strong> Diamond Open Access</li>
                <li><strong className="text-gray-900">License:</strong> CC BY 4.0</li>
                <li><strong className="text-gray-900">Frequency:</strong> Biannual (2 issues/year)</li>
                <li><strong className="text-gray-900">Workflow:</strong> Continuous Publishing + Biannual Issue Compilation</li>
              </ul>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">Focus & Scope</h2>
            <p>
              The <strong>APASIFIC Journal of Academic Research</strong> publishes peer-reviewed scholarly articles covering multidisciplinary research. Our aim is to foster international academic interoperability and provide a global platform for innovative research from both emerging and established academic regions.
            </p>
            <p>We welcome submissions in the following areas (but not limited to):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <ul className="list-disc pl-5 m-0 space-y-1">
                <li>Education & Pedagogy</li>
                <li>Artificial Intelligence & Tech Innovation</li>
                <li>Social Sciences & Humanities</li>
                <li>Management & Economics</li>
              </ul>
              <ul className="list-disc pl-5 m-0 space-y-1">
                <li>Engineering & Applied Sciences</li>
                <li>Health Sciences</li>
                <li>Islamic Studies</li>
                <li>Global Academic Governance</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">Archiving and Indexing</h2>
            <p>
              To ensure long-term preservation and global discoverability, the journal integrates tightly with the following infrastructure:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>DOI Registration:</strong> Crossref</li>
              <li><strong>Digital Preservation:</strong> Zenodo Repository (CERN)</li>
              <li><strong>Discovery Networks:</strong> OpenAIRE and OpenAlex</li>
              <li><strong>Author Identity:</strong> Full ORCID integration for automated author profile updates</li>
            </ul>
          </section>

        </div>
      </main>
    </div>
  );
}
