"use client";
import { useEffect, useState } from "react";

interface Member {
  jabatan: string;
  nama: string;
  afiliasi: string;
  foto: string;
}

interface BoardData {
  body_name: string;
  members: Member[];
  skCurrent?: string;
  skPast?: string;
}

const OFFICIAL_JOURNALS = [
  "AJAF - Akuntansi, Audit & Perpajakan",
  "AJED - Ekonomi Pembangunan & Keuangan",
  "AJEP - Jurnal Pendidikan",
  "AJCE - Teknik Sipil, Mesin & Elektro",
  "AJAFR - Pertanian, Kehutanan & Perikanan",
  "AJADM - Seni, Desain & Media Kreatif",
  "AJIR - Ilmu Politik & Hubungan Internasional",
  "AJCS - Pengabdian Kepada Masyarakat (PKM)",
  "AJBA - Manajemen, Bisnis dan Administrasi",
  "AJLS - Ilmu Hukum & Hak Asasi Manusia",
  "AJPH - Kedokteran, Kesehatan Masyarakat & Keperawatan",
  "AJITE - Ilmu Komputer & Teknologi Informasi",
  "AJSSH - Sosiologi & Ilmu Pengetahuan Budaya",
  "AJES - Ilmu Lingkungan & Keberlanjutan",
  "AJTHM - Pariwisata & Manajemen Perhotelan",
  "AJIS - Disiplin Ilmu Agama dan Peradaban Islam"
];

export default function JournalPage() {
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewPdf, setViewPdf] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllBoards = async () => {
      try {
        const res = await fetch(`/api/leadership?body=all`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        const data = await res.json();
        
        if (res.ok) {
          // data is an array of all rows in the leadership table
          const editorialBoards = data
            .filter((row: any) => {
              if (!row.body_name || !row.body_name.startsWith("Editorial Board - ")) return false;
              const extractedName = row.body_name.replace("Editorial Board - ", "");
              // Only allow exact matches with the official journal structure (hides old/obsolete data)
              return OFFICIAL_JOURNALS.includes(extractedName);
            })
            .map((row: any) => {
              let parsedMembers = [];
              let skCurrent = "";
              let skPast = "";
              try {
                let parsed = row.members_json;
                if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                
                if (Array.isArray(parsed)) {
                  parsedMembers = parsed;
                } else if (parsed && typeof parsed === 'object') {
                  parsedMembers = parsed.members || [];
                  skCurrent = parsed.skCurrent || "";
                  skPast = parsed.skPast || "";
                }
              } catch (e) {
                console.error("Error parsing", row.body_name, e);
              }
              return {
                body_name: row.body_name.replace("Editorial Board - ", ""), // Extract just the journal name
                members: parsedMembers,
                skCurrent,
                skPast
              };
            });
            
          // Sort them to match the official journal order
          editorialBoards.sort((a: BoardData, b: BoardData) => {
            return OFFICIAL_JOURNALS.indexOf(a.body_name) - OFFICIAL_JOURNALS.indexOf(b.body_name);
          });
            
          setBoards(editorialBoards);
        } else {
          console.error("API failed:", res.status, data);
        }
      } catch (err: any) {
        console.error("Network error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBoards();
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: "100px 20px 60px", background: "#05050a", fontFamily: "sans-serif" }} className="relative overflow-x-hidden">
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "50px", padding: "40px 0", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
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
            JOURNAL EDITORIAL BOARDS
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "15px", letterSpacing: "1px" }}>
            Daftar Susunan Dewan Redaksi Seluruh Jurnal APASIFIC
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#c9a84c", padding: "50px" }}>Loading Editorial Boards...</div>
        ) : boards.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "50px", fontStyle: "italic" }}>
            <p>Belum ada dewan editorial jurnal yang ditambahkan ke sistem.</p>
          </div>
        ) : (
          <div>
            {boards.map((board, bIdx) => (
              <div key={bIdx} style={{ marginBottom: "80px" }}>
                {/* Judul Editorial Board */}
                <div className="border-b border-[#c9a84c]/30 pb-4 mb-4 pl-4 border-l-4 border-l-[#c9a84c]">
                  <h2 style={{ color: "#fff", fontSize: "22px", margin: 0 }}>
                    {board.body_name}
                  </h2>
                </div>

                {/* Kontrol SK (Kiri dan Kanan) */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-[#12121a] p-3 rounded-lg border border-[#c9a84c]/20 mb-8 gap-3">
                  
                  {/* SK Periode Sekarang (Kiri) */}
                  <button 
                    onClick={() => {
                      if (board.skCurrent) {
                        setViewPdf(board.skCurrent);
                      } else {
                        alert("File SK Periode Sekarang untuk jurnal ini belum diunggah oleh Admin.");
                      }
                    }}
                    className={`flex w-full sm:w-auto items-center justify-center gap-2 transition-all px-4 py-2 rounded-lg text-[13px] font-bold tracking-wider ${
                      board.skCurrent 
                        ? "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30 hover:bg-[#c9a84c] hover:text-black shadow-[0_0_15px_rgba(201,168,76,0.15)]" 
                        : "bg-gray-800 text-gray-500 border border-gray-700 opacity-70 cursor-not-allowed"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {board.skCurrent ? "SK PERIODE SEKARANG (2026-2029)" : "SK SEKARANG BELUM TERSEDIA"}
                  </button>

                  {/* SK Periode Berlalu (Kanan) */}
                  <button 
                    onClick={() => {
                      if (board.skPast) {
                        setViewPdf(board.skPast);
                      } else {
                        alert("File SK Periode Berlalu untuk jurnal ini belum diunggah oleh Admin.");
                      }
                    }}
                    className={`flex w-full sm:w-auto items-center justify-center gap-2 transition-all px-4 py-2 rounded-lg text-[13px] font-bold tracking-wider ${
                      board.skPast
                        ? "bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 hover:text-white shadow-lg"
                        : "bg-gray-800 text-gray-500 border border-gray-700 opacity-70 cursor-not-allowed"
                    }`}
                  >
                    {board.skPast ? "SK PERIODE BERLALU" : "SK BERLALU BELUM TERSEDIA"}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                
                {board.members.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Belum ada anggota yang ditambahkan.</p>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "30px"
                  }}>
                    {board.members.map((m, i) => (
                      <div key={i} style={{
                        background: "linear-gradient(145deg, #0d0d1a 0%, #12122a 100%)",
                        border: "1px solid rgba(201,168,76,0.15)",
                        borderRadius: "16px",
                        padding: "30px 20px",
                        textAlign: "center",
                        transition: "transform 0.3s ease",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                      }}>
                        <div style={{
                          width: "120px",
                          height: "120px",
                          margin: "0 auto 20px",
                          borderRadius: "50%",
                          border: "2px solid #c9a84c",
                          padding: "4px",
                          background: "#05050a"
                        }}>
                          {m.foto ? (
                            <img src={m.foto} alt={m.nama} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: "32px", fontWeight: "bold" }}>
                              {m.nama.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h3 style={{ margin: "0 0 5px", color: "#fff", fontSize: "16px", fontWeight: "700" }}>{m.nama}</h3>
                        <div style={{ color: "#c9a84c", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
                          {m.jabatan}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", lineHeight: "1.5" }}>
                          {m.afiliasi?.includes("Komite Advokasi Daerah Anti Korupsi") ? (
                            <>Komite Advokasi Daerah<br />Anti Korupsi Sumatera Utara</>
                          ) : (
                            m.afiliasi
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL VIEW PDF SK */}
      {viewPdf && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm p-3 sm:p-6">
          {/* Header Modal */}
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-[#c9a84c] font-bold text-[16px] sm:text-lg flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Dokumen Surat Keputusan (SK)
            </h3>
            <button 
              onClick={() => setViewPdf(null)}
              className="bg-red-600/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold border-2 border-white/20 hover:bg-red-500 hover:scale-105 transition-all shadow-lg text-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Tutup
            </button>
          </div>
          
          {/* Native PDF Viewer */}
          <div className="flex-1 w-full h-full bg-white rounded-xl overflow-hidden border-2 border-[#c9a84c]/30 shadow-[0_0_50px_rgba(201,168,76,0.15)] relative">
            <iframe 
              src={`${viewPdf}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`} 
              className="absolute inset-0 w-full h-full"
              title="SK PDF Viewer"
            />
          </div>
        </div>
      )}
    </main>
  );
}
