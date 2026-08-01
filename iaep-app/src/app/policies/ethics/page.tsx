<<<<<<< HEAD
export default function PublicationEthicsPage() {
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
            PUBLICATION ETHICS
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
            5. PUBLICATION ETHICS
          </h2>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "20px", color: "rgba(255,255,255,0.7)" }}>
              Authors submitting manuscripts under this discipline are expected to comply with internationally accepted publication ethics, including:
            </p>
            <ul style={{ listStyleType: "none", padding: "0", margin: "0" }}>
              {[
                "Original and unpublished work with zero tolerance for plagiarism or self-plagiarism.",
                "No simultaneous submission to other journals.",
                "Proper citation and acknowledgment of all sources.",
                "Ethical approval for research involving human participants or sensitive data where applicable.",
                "Compliance with the Committee on Publication Ethics (COPE) principles.",
                "Full disclosure of conflicts of interest.",
                "Responsible use of artificial intelligence in research and manuscript preparation."
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
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publication Ethics | APASIFIC Press',
  description: 'Publication Ethics and Malpractice Statement of APASIFIC Press.',
};

export default function PublicationEthicsPage() {
  return (
    <PolicyLayout title="Publication Ethics & Malpractice Statement">
      <p>
        APASIFIC Press is committed to maintaining the highest ethical standards in scientific publishing. 
        We expect all parties involved—authors, reviewers, and editors—to strictly adhere to our policies.
      </p>

      <h3>1. Duties of Editors</h3>
      <ul>
        <li><strong>Fair Play:</strong> Editors evaluate manuscripts for their intellectual content without regard to race, gender, sexual orientation, religious belief, ethnic origin, citizenship, or political philosophy of the authors.</li>
        <li><strong>Confidentiality:</strong> The editorial staff must not disclose any information about a submitted manuscript to anyone other than the corresponding author, reviewers, and the publisher.</li>
        <li><strong>Disclosure and Conflicts of Interest:</strong> Unpublished materials disclosed in a submitted manuscript must not be used in an editor's own research without the express written consent of the author.</li>
      </ul>

      <h3>2. Duties of Reviewers</h3>
      <ul>
        <li><strong>Contribution to Editorial Decisions:</strong> Peer review assists the editor in making editorial decisions and may assist the author in improving the paper.</li>
        <li><strong>Promptness:</strong> Any selected referee who feels unqualified to review the research reported in a manuscript or knows that its prompt review will be impossible should notify the editor and excuse themselves from the review process.</li>
        <li><strong>Objectivity:</strong> Reviews should be conducted objectively. Personal criticism of the author is inappropriate. Referees should express their views clearly with supporting arguments.</li>
      </ul>

      <h3>3. Duties of Authors</h3>
      <ul>
        <li><strong>Originality and Plagiarism:</strong> Authors should ensure they have written entirely original works. If authors use the work or words of others, this must be appropriately cited or quoted.</li>
        <li><strong>Multiple, Redundant, or Concurrent Publication:</strong> Authors should not in general publish manuscripts describing essentially the same research in more than one journal.</li>
        <li><strong>Authorship of the Paper:</strong> Authorship should be limited to those who have made a significant contribution to the conception, design, execution, or interpretation of the reported study.</li>
      </ul>
    </PolicyLayout>
>>>>>>> e477a726ed7aa5eb4d0c37a5f7323196db965314
  );
}
