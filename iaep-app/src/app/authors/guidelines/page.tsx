<<<<<<< HEAD
export default function AuthorGuidelinesPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "120px 20px 80px", background: "#05050a", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{ 
            color: "#c9a84c", 
            fontSize: "36px", 
            fontWeight: "900", 
            textTransform: "uppercase", 
            margin: "0", 
            letterSpacing: "3px",
            textShadow: "0 4px 15px rgba(201,168,76,0.2)",
            fontFamily: "'Cinzel', serif"
          }}>
            AUTHOR GUIDELINES
          </h1>
        </div>

        <div style={{
          background: "linear-gradient(145deg, #0a0a14 0%, #121222 100%)",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ 
            color: "#c9a84c", 
            fontSize: "22px", 
            fontWeight: "bold", 
            textTransform: "uppercase", 
            letterSpacing: "1px",
            margin: "0 0 20px 0",
            paddingBottom: "15px",
            borderBottom: "1px solid rgba(201,168,76,0.2)"
          }}>
            SUBMISSION GUIDELINES &amp; REQUIREMENTS
          </h2>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "20px", color: "rgba(255,255,255,0.7)" }}>
              Authors wishing to submit their manuscripts to our journals are requested to read and follow these guidelines carefully to ensure a smooth review process.
            </p>
            <ul style={{ listStyleType: "none", padding: "0", margin: "0" }}>
              {[
                "Submissions must be strictly original, unpublished, and not under consideration for publication elsewhere.",
                "Manuscripts should be formatted according to the journal's official template, including a clear abstract, introduction, methodology, results, discussion, and conclusion.",
                "References and citations must be consistently formatted following the APA (American Psychological Association) style guidelines.",
                "Authors are fully responsible for obtaining explicit permission to reproduce any copyrighted material, such as figures or extensive quotes, included in their manuscript.",
                "All listed authors must have made a significant academic contribution to the work, and their affiliations and contact details must be accurate and up to date."
              ].map((item, idx) => (
                <li key={idx} style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  marginBottom: "12px" 
                }}>
                  <span style={{ 
                    color: "#c9a84c", 
                    marginRight: "15px", 
                    fontSize: "20px",
                    lineHeight: "1.2"
                  }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </main>
=======
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
>>>>>>> e477a726ed7aa5eb4d0c37a5f7323196db965314
  );
}
