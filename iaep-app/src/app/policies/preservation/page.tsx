<<<<<<< HEAD
export default function PreservationPolicyPage() {
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
            PRESERVATION POLICY
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
            DIGITAL PRESERVATION &amp; ARCHIVING
          </h2>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "20px", color: "rgba(255,255,255,0.7)" }}>
              We are committed to the permanent availability and long-term preservation of all scholarly research published in our journals.
            </p>
            <ul style={{ listStyleType: "none", padding: "0", margin: "0" }}>
              {[
                "All published articles are systematically archived and digitally preserved using reliable third-party repositories and preservation services.",
                "In the highly unlikely event that the journal ceases publication, we guarantee that all previously published articles will remain fully accessible through established digital archives.",
                "Authors are encouraged to self-archive the final published versions of their articles (post-print) in institutional repositories, pre-print servers, or their personal websites.",
                "We ensure that metadata for all articles is properly maintained and submitted to relevant academic databases to aid in long-term discoverability."
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
>>>>>>> e477a726ed7aa5eb4d0c37a5f7323196db965314
  );
}
