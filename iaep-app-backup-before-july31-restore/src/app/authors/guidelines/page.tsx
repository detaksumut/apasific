import React from 'react';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Author Guidelines | APASIFIC Press',
  description: 'Submission guidelines and checklist for prospective authors.',
};

export default function AuthorGuidelinesPage() {
  return (
    <div className="min-h-screen bg-white">
      <GovernanceHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">Author Guidelines</h1>
        <p className="text-lg text-gray-600 mb-12 border-b border-gray-200 pb-8">
          Thank you for choosing APASIFIC Journal of Academic Research. Please review our submission requirements carefully before submitting your manuscript.
        </p>
        
        <div className="prose prose-blue max-w-none text-gray-700">
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">1. Pre-Submission Checklist</h2>
            <p>Ensure that your submission complies with all of the following requirements:</p>
            <ul className="list-none pl-0 space-y-2">
              <li className="flex items-start gap-2">
                <input type="checkbox" checked readOnly className="mt-1" />
                <span><strong>Original Research:</strong> The submission has not been previously published, nor is it before another journal for consideration.</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" checked readOnly className="mt-1" />
                <span><strong>ORCID Requirement:</strong> The corresponding author (and ideally all co-authors) must provide a valid ORCID iD.</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" checked readOnly className="mt-1" />
                <span><strong>Ethical Approval:</strong> If the study involves human or animal subjects, ethical approval documents are attached.</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" checked readOnly className="mt-1" />
                <span><strong>Conflict Declaration:</strong> A clear conflict of interest statement is included.</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" checked readOnly className="mt-1" />
                <span><strong>Data Availability:</strong> A data availability statement is provided, and any datasets are preferably deposited in DataCite-compliant repositories.</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">2. Manuscript Format</h2>
            <p>
              Manuscripts should be submitted in Microsoft Word (.docx) format. We require a structured format including:
            </p>
            <ul>
              <li><strong>Title Page:</strong> Title, Author Names, Affiliations, ORCIDs, and Corresponding Author email.</li>
              <li><strong>Abstract:</strong> Maximum 250 words, structured (Background, Methods, Results, Conclusion).</li>
              <li><strong>Keywords:</strong> 3 to 6 keywords separated by semicolons.</li>
              <li><strong>Main Body:</strong> Introduction, Literature Review, Methodology, Results, Discussion, Conclusion.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">3. Citation and Reference Style</h2>
            <p>
              APASIFIC Press strictly adheres to the <strong>APA (American Psychological Association) 7th Edition</strong> format for all in-text citations and reference lists. 
              All references must include DOI links (preferably as active <code>https://doi.org/10.xxxx/...</code> URLs) whenever available.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
