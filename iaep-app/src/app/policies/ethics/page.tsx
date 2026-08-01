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
  );
}
