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
            <p style={{ marginBottom: "20px" }}>
              Jurnal-jurnal yang diterbitkan oleh APASIFIC Press mematuhi standar etika publikasi ilmiah yang ditetapkan oleh <strong>Committee on Publication Ethics (COPE)</strong>. Seluruh pihak yang terlibat dalam proses penerbitan wajib mematuhi standar berikut:
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>A. Tanggung Jawab Penulis (Author Responsibilities)</h3>
            <ul style={{ listStyleType: "none", paddingLeft: "10px", margin: "0 0 20px 0" }}>
              <li><strong>Orisinalitas:</strong> Menjamin naskah bebas dari plagiarisme dan tidak sedang dikirimkan ke jurnal lain secara bersamaan.</li>
              <li><strong>Akurasi Data:</strong> Menyajikan data riset yang jujur tanpa fabrikasi atau falsifikasi data.</li>
              <li><strong>Pengakuan Sitasi:</strong> Menyebutkan rujukan dan sitasi sumber pustaka secara jujur dan tepat.</li>
              <li><strong>Konflik Kepentingan:</strong> Mengungkapkan potensi benturan kepentingan yang berkaitan dengan pendanaan riset.</li>
            </ul>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>B. Tanggung Jawab Reviewer (Reviewer Responsibilities)</h3>
            <ul style={{ listStyleType: "none", paddingLeft: "10px", margin: "0 0 20px 0" }}>
              <li><strong>Kerahasiaan:</strong> Menjaga kerahasiaan draf naskah yang ditinjau dan dilarang menggunakannya untuk kepentingan pribadi.</li>
              <li><strong>Objektivitas:</strong> Melakukan evaluasi secara objektif, rasional, dan memberikan argumentasi yang jelas.</li>
              <li><strong>Ketepatan Waktu:</strong> Menyelesaikan review sesuai deadline yang disepakati atau segera mengabarkan editor jika berhalangan.</li>
            </ul>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>C. Tanggung Jawab Editor (Editor Responsibilities)</h3>
            <ul style={{ listStyleType: "none", paddingLeft: "10px", margin: "0 0 20px 0" }}>
              <li><strong>Keadilan:</strong> Mengevaluasi naskah semata-mata berdasarkan kualitas ilmiah tanpa membedakan ras, gender, atau afiliasi penulis.</li>
              <li><strong>Independensi:</strong> Menjaga independensi keputusan editorial dari tekanan komersial atau kepentingan organisasi.</li>
              <li><strong>Resolusi Konflik:</strong> Mengambil langkah aktif jika terindikasi adanya dugaan plagiarisme atau pelanggaran etika publikasi.</li>
            </ul>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>D. Tanggung Jawab Penerbit (Publisher Responsibilities)</h3>
            <p style={{ margin: "0" }}>
              PT. Bernas Sumut Jaya sebagai penerbit menjamin bahwa kepentingan komersial tidak mempengaruhi keputusan editorial dewan redaksi, serta berkomitmen melakukan pengarsipan digital jangka panjang secara konsisten.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
