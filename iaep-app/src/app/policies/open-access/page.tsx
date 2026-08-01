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
  );
}
