export default function AuthorGuidelinesPage() {
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
            AUTHOR GUIDELINES
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
            SUBMISSION GUIDELINES &amp; REQUIREMENTS
          </h2>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "20px" }}>
              Penulis yang ingin mengirimkan naskah ke jurnal di bawah APASIFIC Press wajib mengikuti pedoman penulisan berikut untuk memastikan kelancaran evaluasi administrasi dan peninjauan sejawat.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>1. Persiapan Pengajuan (Submission Preparation)</h3>
            <ul style={{ listStyleType: "none", paddingLeft: "10px", margin: "0 0 20px 0" }}>
              <li><strong>Originality:</strong> Naskah harus orisinal, bebas dari unsur plagiarisme, dan tidak sedang dalam pertimbangan penerbitan di tempat lain.</li>
              <li><strong>Template:</strong> Naskah diketik menggunakan file template resmi (MS Word format) dengan struktur: Judul, Nama & Afiliasi, Abstrak, Pendahuluan, Metode, Hasil & Pembahasan, Kesimpulan, dan Referensi.</li>
              <li><strong>Anonymity:</strong> Untuk review buta ganda, pastikan tidak ada data identitas penulis (nama/afiliasi) di dalam berkas naskah utama yang diunggah.</li>
            </ul>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>2. Format & Penulisan (Formatting)</h3>
            <p style={{ marginBottom: "16px" }}>
              Naskah ditulis menggunakan font <strong>Arial atau Times New Roman 11pt</strong>, spasi 1.15, batas margin standar (2.54 cm pada semua sisi). Tabel dan Gambar diletakkan menyatu di dalam paragraf naskah (bukan dilampirkan terpisah) dan diberi nomor urut serta keterangan yang jelas.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>3. Gaya Referensi (References Style)</h3>
            <p style={{ marginBottom: "16px" }}>
              Rujukan dan sitasi wajib menggunakan gaya <strong>APA (American Psychological Association) 7th Edition</strong>. Penulis sangat direkomendasikan menggunakan aplikasi manajemen referensi seperti Mendeley, Zotero, atau EndNote. Setiap referensi wajib menyertakan tautan DOI jika tersedia.
            </p>

            <h3 style={{ color: "#c9a84c", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>4. Alur Kerja Publikasi (Publication Workflow)</h3>
            <ol style={{ paddingLeft: "20px", margin: "0" }}>
              <li><strong>Submit:</strong> Penulis mengunggah naskah melalui portal penulis (*Author Dashboard*).</li>
              <li><strong>Editorial Screening:</strong> Pemeriksaan administrasi dan uji plagiarisme (maksimal toleransi Turnitin 20%).</li>
              <li><strong>Peer Review:</strong> Evaluasi substansi ilmiah oleh minimal dua reviewer independen.</li>
              <li><strong>Revision & Proofread:</strong> Penulis memperbaiki naskah sesuai saran review dan menyetujui layout praterbit (*galley proof*).</li>
              <li><strong>Publish:</strong> Naskah diterbitkan online dan metadata didistribusikan ke DOAJ, Crossref DOI, dan SINTA.</li>
            </ol>
          </div>
        </div>

      </div>
    </main>
  );
}
