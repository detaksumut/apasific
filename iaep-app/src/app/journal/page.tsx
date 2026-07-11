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

export default function JournalPage() {
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllBoards = async () => {
      try {
        const res = await fetch(`/api/leadership?body=all`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        const data = await res.json();
        
        if (res.ok) {
          // data is an array of all rows in the leadership table
          const editorialBoards = data
            .filter((row: any) => row.body_name && row.body_name.startsWith("Editorial Board - "))
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
    <main style={{ minHeight: "100vh", padding: "100px 20px 60px", background: "#05050a", fontFamily: "sans-serif" }}>
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
                          {m.afiliasi}
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
    </main>
  );
}
