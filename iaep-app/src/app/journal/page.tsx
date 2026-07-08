"use client";
import { useEffect, useState } from "react";

interface Member {
  jabatan: string;
  nama: string;
  afiliasi: string;
  foto: string;
}

export default function JournalPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch("/api/leadership?body=Editorial Board - AJSSH");
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error("Failed to load editorial board", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
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
            JOURNAL EDITORIAL BOARD
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "15px", letterSpacing: "1px" }}>
            AJSSH - ASIA Journal of Social Sciences & Humanities
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#c9a84c", padding: "50px" }}>Loading Editorial Board...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "50px", fontStyle: "italic" }}>
            Belum ada anggota dewan editorial yang ditambahkan.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "30px"
          }}>
            {members.map((m, i) => (
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
    </main>
  );
}
