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
}

const OFFICIAL_JOURNALS = [
  "AJAF - Akuntansi, Audit & Perpajakan",
  "AJED - Ekonomi Pembangunan & Keuangan",
  "AJEP - Pendidikan Dasar, Menengah & Tinggi",
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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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
              try {
                if (typeof row.members_json === 'string') {
                  parsedMembers = JSON.parse(row.members_json);
                } else if (row.members_json) {
                  parsedMembers = row.members_json;
                }
              } catch (e) {
                console.error("Error parsing", row.body_name, e);
              }
              return {
                body_name: row.body_name.replace("Editorial Board - ", ""), // Extract just the journal name
                members: parsedMembers
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
      
      {/* SIDEBAR GAMBAR KIRI */}
      <div className="hidden xl:block fixed top-[150px] left-[30px] 2xl:left-[60px] w-[180px] 2xl:w-[220px] z-40">
        <div 
          // onClick={() => setZoomedImage("/path-ke-gambar-kiri.jpg")} // Uncomment jika gambar sudah ada
          className="overflow-hidden rounded-xl border-2 border-dashed border-[#c9a84c]/40 flex flex-col items-center justify-center bg-[#0a0a0f]/30 aspect-[3/4]"
        >
          <div className="text-center p-4">
            <svg className="w-8 h-8 text-[#c9a84c]/40 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-[#c9a84c]/70 text-[11px] font-bold tracking-widest uppercase">Space Gambar<br/>Kiri</p>
            <p className="text-gray-500/70 text-[9px] mt-2">(Belum ada gambar)</p>
          </div>
        </div>
      </div>

      {/* SIDEBAR GAMBAR KANAN */}
      <div className="hidden xl:block fixed top-[150px] right-[30px] 2xl:right-[60px] w-[180px] 2xl:w-[220px] z-40">
        <div 
          // onClick={() => setZoomedImage("/path-ke-gambar-kanan.jpg")} // Uncomment jika gambar sudah ada
          className="overflow-hidden rounded-xl border-2 border-dashed border-[#c9a84c]/40 flex flex-col items-center justify-center bg-[#0a0a0f]/30 aspect-[3/4]"
        >
          <div className="text-center p-4">
            <svg className="w-8 h-8 text-[#c9a84c]/40 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-[#c9a84c]/70 text-[11px] font-bold tracking-widest uppercase">Space Gambar<br/>Kanan</p>
            <p className="text-gray-500/70 text-[9px] mt-2">(Belum ada gambar)</p>
          </div>
        </div>
      </div>

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
                <h2 style={{ 
                  color: "#fff", 
                  fontSize: "22px", 
                  borderBottom: "1px solid rgba(201,168,76,0.3)", 
                  paddingBottom: "15px",
                  marginBottom: "30px",
                  borderLeft: "4px solid #c9a84c",
                  paddingLeft: "15px"
                }}>
                  {board.body_name}
                </h2>
                
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

      {/* MODAL ZOOM IMAGE */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <img 
              src={zoomedImage} 
              alt="Zoomed Image" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl border-2 border-[#c9a84c]/40 shadow-[0_0_50px_rgba(201,168,76,0.3)]"
            />
            <button 
              onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
              className="absolute -top-4 -right-4 bg-red-600/90 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-white/20 hover:scale-110 hover:bg-red-500 transition-all shadow-lg text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
