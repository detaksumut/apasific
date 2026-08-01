<<<<<<< HEAD
export default function OpenAccessPolicyPage() {
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
            OPEN ACCESS POLICY
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
            OPEN ACCESS &amp; LICENSING
          </h2>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "20px", color: "rgba(255,255,255,0.7)" }}>
              We strongly believe that making research freely available to the public supports a greater global exchange of knowledge. Our publications are fully open access.
            </p>
            <ul style={{ listStyleType: "none", padding: "0", margin: "0" }}>
              {[
                "All articles published by our journals are immediately and permanently available online free of charge upon publication.",
                "Users are permitted to read, download, copy, distribute, print, search, or link to the full texts of the articles without asking prior permission from the publisher or the author.",
                "Our open access articles are published under the terms of the Creative Commons Attribution License (CC-BY).",
                "Authors retain the copyright of their respective scholarly work while granting the journal the right of first publication.",
                "There are no paywalls or subscription barriers to accessing the scientific content published in our journals."
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
  title: 'Open Access Policy | APASIFIC Press',
  description: 'Diamond Open Access policy and APC structure at APASIFIC Press.',
};

export default function OpenAccessPolicyPage() {
  return (
    <PolicyLayout title="Open Access Policy">
      <p>
        APASIFIC Press is a staunch advocate for the democratization of scientific knowledge. We believe that research should be freely available to the public to support a greater global exchange of knowledge.
      </p>

      <h3>1. Diamond Open Access Model</h3>
      <p>
        All journals published under APASIFIC Press operate on a <strong>Diamond Open Access</strong> model. This means that:
      </p>
      <ul>
        <li><strong>No Paywalls:</strong> Readers can access, read, download, and distribute all published articles completely free of charge immediately upon publication.</li>
        <li><strong>No APCs:</strong> Authors are <strong>not</strong> required to pay any Article Processing Charges (APCs) or submission fees. The publication costs are fully subsidized by our institutional partners and the APASIFIC academic network.</li>
      </ul>

      <h3>2. Licensing</h3>
      <p>
        As detailed in our Copyright Policy, all content is published under the Creative Commons Attribution 4.0 International License (CC BY 4.0). This ensures maximum reach and reusability of the research while maintaining proper attribution to the original authors.
      </p>

      <h3>3. Self-Archiving (Green Open Access)</h3>
      <p>
        We strongly support self-archiving. Authors are permitted and encouraged to post the final, published PDF version of their article (the Publisher's Version of Record) on their personal websites, institutional repositories, and academic networks (e.g., ResearchGate, Academia.edu) immediately upon publication.
      </p>
    </PolicyLayout>
>>>>>>> e477a726ed7aa5eb4d0c37a5f7323196db965314
  );
}
