<<<<<<< HEAD
export default function PeerReviewPolicyPage() {
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
            PEER REVIEW &amp; PUBLICATION ETHICS
          </h1>
        </div>

        <div style={{
          background: "linear-gradient(145deg, #0a0a14 0%, #121222 100%)",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: "16px",
          padding: "40px",
          marginBottom: "40px",
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
            4. DOUBLE-BLIND PEER REVIEW POLICY
          </h2>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "16px" }}>
              All manuscripts submitted to this discipline will undergo a rigorous Double-Blind Peer Review process to ensure scientific quality, originality, methodological rigor, ethical compliance, and relevance to the discipline.
            </p>
            <p style={{ marginBottom: "16px" }}>
              During the review process, the identities of both authors and reviewers remain anonymous to maintain fairness, objectivity, and academic integrity.
            </p>
            <p style={{ margin: "0" }}>
              Only manuscripts that successfully pass the editorial evaluation and peer review process will be accepted for publication.
            </p>
          </div>
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
  title: 'Peer Review Policy | APASIFIC Press',
  description: 'Double-blind peer review policy at APASIFIC Press.',
};

export default function PeerReviewPolicyPage() {
  return (
    <PolicyLayout title="Peer Review Policy">
      <p>
        APASIFIC Press employs a rigorous, independent, and confidential peer review process to ensure the highest quality of scientific publication.
      </p>

      <h3>1. Double-Blind Peer Review</h3>
      <p>
        All research articles published by APASIFIC Press undergo a strictly <strong>double-blind peer review</strong> process. This means that:
      </p>
      <ul>
        <li>The reviewers do not know the identity of the authors.</li>
        <li>The authors do not know the identity of the reviewers.</li>
      </ul>
      <p>
        This policy is designed to eliminate bias based on gender, institutional prestige, geographic location, or personal relationships.
      </p>

      <h3>2. The Review Process</h3>
      <ol>
        <li><strong>Initial Screening:</strong> The Editor-in-Chief or an Associate Editor conducts an initial desk review to ensure the manuscript fits the journal's scope, meets formatting guidelines, and passes a plagiarism check. Manuscripts failing this stage are desk-rejected.</li>
        <li><strong>Reviewer Assignment:</strong> The manuscript is anonymized and sent to at least two independent expert reviewers in the relevant field.</li>
        <li><strong>Reviewer Evaluation:</strong> Reviewers assess the manuscript for originality, methodology, clarity, and contribution to the field. They provide a recommendation: Accept, Minor Revisions, Major Revisions, or Reject.</li>
        <li><strong>Editorial Decision:</strong> The Editor makes a final decision based on the reviewers' reports. The Editor's decision is final.</li>
      </ol>

      <h3>3. Timeline</h3>
      <p>
        We strive for a rapid but thorough review process. Authors can typically expect a first decision within 4 to 6 weeks of submission.
      </p>
    </PolicyLayout>
>>>>>>> e477a726ed7aa5eb4d0c37a5f7323196db965314
  );
}
