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
              Seluruh naskah yang dikirimkan ke jurnal-jurnal di bawah APASIFIC Press melalui peninjauan sejawat buta ganda (*Double-Blind Peer Review*) untuk memastikan integritas ilmiah, orisinalitas riset, kelayakan metodologi, dan kepatuhan etika.
            </p>
            <p style={{ marginBottom: "20px" }}>
              Identitas penulis disembunyikan dari reviewer, dan identitas reviewer dirahasiakan dari penulis sepanjang alur peninjauan guna menghindari bias evaluasi.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>A. Alur Review (Review Workflow)</h3>
            <ol style={{ paddingLeft: "20px", marginBottom: "20px" }}>
              <li><strong>Pre-Screening:</strong> Evaluasi awal oleh Editor Utama untuk menyaring kesesuaian ruang lingkup (*scope*), kualitas plagiarisme, dan kelengkapan administrasi.</li>
              <li><strong>Review Assignment:</strong> Naskah dikirim ke minimal 2 (dua) penilai sejawat (*reviewer*) independen secara buta ganda.</li>
              <li><strong>Author Revision:</strong> Penulis merevisi naskah berdasarkan komentar dan saran perbaikan dari reviewer.</li>
              <li><strong>Final Decision:</strong> Editor mengambil keputusan final berdasarkan akumulasi masukan reviewer.</li>
            </ol>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>B. Batas Waktu (Review Timeline)</h3>
            <p style={{ marginBottom: "20px" }}>
              Proses review putaran pertama ditargetkan selesai dalam waktu <strong>2 hingga 4 minggu</strong> sejak naskah ditugaskan ke reviewer.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>C. Keputusan Editorial (Editorial Decision)</h3>
            <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
              <li><strong>Accept Submission:</strong> Diterima langsung tanpa revisi tambahan.</li>
              <li><strong>Minor Revisions:</strong> Diterima dengan catatan revisi kecil dari penulis.</li>
              <li><strong>Major Revisions:</strong> Penulis wajib melakukan revisi besar dan naskah diuji ulang di putaran kedua.</li>
              <li><strong>Decline Submission (Reject):</strong> Ditolak karena kelemahan metodologi fatal atau tidak orisinal.</li>
            </ul>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>D. Tanggung Jawab Reviewer</h3>
            <p style={{ margin: "0" }}>
              Reviewer bertanggung jawab menilai kebenaran metode riset, kebaruan temuan ilmiah, kesesuaian sitasi, dan memberikan masukan konstruktif demi meningkatkan mutu artikel ilmiah.
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
  );
}
