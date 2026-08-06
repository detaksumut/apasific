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
            <p style={{ marginBottom: "20px" }}>
              APASIFIC Press berkomitmen untuk menjaga keandalan akses jangka panjang terhadap semua karya ilmiah yang dipublikasikan. Kebijakan preservasi digital kami dirancang untuk memastikan bahwa artikel tetap tersedia bagi komunitas akademis global bahkan jika sistem jurnal lokal mengalami kegagalan.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>1. Preservasi Digital Repositori Zenodo (CERN)</h3>
            <p style={{ marginBottom: "16px" }}>
              Setiap artikel ilmiah yang dinyatakan terbit secara otomatis didepositkan dan diarsipkan ke dalam repositori <strong>Zenodo (CERN)</strong> di Jenewa, Swiss. Zenodo menjamin penyimpanan data berkas PDF dan metadata naskah secara permanen pada infrastruktur penyimpanan data ilmiah jangka panjang Uni Eropa.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>2. DOI Persisten Crossref (DOI Persistence)</h3>
            <p style={{ marginBottom: "16px" }}>
              Kami mendaftarkan pengenal objek digital persisten <strong>Digital Object Identifier (DOI)</strong> melalui Crossref untuk setiap naskah yang diterbitkan. Pendaftaran DOI menjamin tautan akses rujukan naskah tidak akan pernah rusak (*link rot protection*) dan dapat ditelusuri secara universal.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>3. Preservasi Metadata Terbuka</h3>
            <p style={{ marginBottom: "16px" }}>
              Metadata naskah dipanen secara rutin melalui protokol OAI-PMH oleh pengindeks sains global seperti <strong>OpenAIRE</strong>, <strong>Google Scholar</strong>, <strong>OpenAlex</strong>, dan <strong>DOAJ</strong>. Hal ini membagi catatan kepengarangan ke ratusan server ilmiah di seluruh dunia.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>4. Cadangan Server Lokal (Local Server Backups)</h3>
            <p style={{ margin: "0" }}>
              Selain repositori pihak ketiga, server lokal kami yang berbasis cloud menjalankan pencadangan data otomatis harian (daily backups) dengan konfigurasi triple-redundancy untuk mengamankan database relasional, metadata log, dan file mentah artikel.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
