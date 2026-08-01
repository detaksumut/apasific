<<<<<<< HEAD
export default function PlagiarismPolicyPage() {
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
            PLAGIARISM POLICY
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
            PLAGIARISM &amp; ORIGINALITY POLICY
          </h2>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "20px", color: "rgba(255,255,255,0.7)" }}>
              We maintain a strict zero-tolerance policy towards any form of plagiarism. All authors submitting their manuscripts are required to adhere to the highest standards of academic integrity.
            </p>
            <ul style={{ listStyleType: "none", padding: "0", margin: "0" }}>
              {[
                "All submitted manuscripts are rigorously screened for similarity using industry-standard plagiarism detection software before undergoing the peer review process.",
                "A similarity index of more than 20% (excluding references, quotes, and standard phrases) is generally considered unacceptable and may result in immediate desk rejection.",
                "Self-plagiarism or text-recycling without proper citation and transparent acknowledgment is strictly prohibited.",
                "Authors must ensure that all sources, data, and contributions from other researchers are properly cited and acknowledged in the manuscript.",
                "If plagiarism is detected after a manuscript has been published, the editorial board reserves the right to issue a formal retraction, remove the article from the journal, and notify the authors' affiliated institutions."
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
  title: 'Plagiarism Policy | APASIFIC Press',
  description: 'Plagiarism detection and enforcement policy at APASIFIC Press.',
};

export default function PlagiarismPolicyPage() {
  return (
    <PolicyLayout title="Plagiarism Policy">
      <p>
        APASIFIC Press enforces a zero-tolerance policy against plagiarism. All submitted manuscripts are subjected to rigorous similarity checks before they are sent for peer review.
      </p>

      <h3>1. Definition of Plagiarism</h3>
      <p>
        Plagiarism includes, but is not limited to:
      </p>
      <ul>
        <li>Copying text, data, or ideas from another source without proper attribution.</li>
        <li>Self-plagiarism (recycling one's own previously published work without citation).</li>
        <li>Paraphrasing substantial portions of another author's work without crediting the original source.</li>
      </ul>

      <h3>2. Similarity Threshold</h3>
      <p>
        All manuscripts are screened using industry-standard similarity detection software (e.g., Turnitin, iThenticate). 
        The maximum acceptable similarity index is <strong>20%</strong>, excluding the bibliography/references section. Furthermore, similarity from a single source must not exceed <strong>5%</strong>.
      </p>

      <h3>3. Enforcement</h3>
      <p>
        If plagiarism is detected:
      </p>
      <ul>
        <li><strong>During Initial Screening:</strong> The manuscript will be immediately desk-rejected, and the authors will be notified of the reason.</li>
        <li><strong>After Publication:</strong> If plagiarism is discovered after the article has been published, APASIFIC Press will conduct a formal investigation. If proven, the article will be formally retracted according to our Corrections & Retractions policy, and the authors' institutions may be notified.</li>
      </ul>
    </PolicyLayout>
>>>>>>> e477a726ed7aa5eb4d0c37a5f7323196db965314
  );
}
