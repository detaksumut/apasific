"use client";

import { useEffect, useState } from "react";

interface LeadershipData {
  ketuaNama: string;
  ketuaJabatan: string;
  ketuaNegara: string;
  ketuaId: string;
  ketuaPhoto: string | null;
  sekNama: string;
  sekJabatan: string;
  sekNegara: string;
  sekId: string;
  sekretarisPhoto: string | null;
}

const BodySection = ({ title, bodyName, customRoleHead, data }: { title: string, bodyName: string, customRoleHead?: string, data: any }) => {
  if (!data) return null;

  const hasSekretaris = data.sekNama && data.sekNama.trim() !== "";

  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      marginBottom: "24px",
      background: "#0d0d1a",
      overflow: "hidden"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid #c9a84c",
        padding: "12px",
        textAlign: "center"
      }}>
        <h3 style={{ margin: 0, color: "#c9a84c", fontSize: "18px", fontWeight: "bold" }}>{title}</h3>
      </div>
      
      <div style={{
        display: "flex",
        flexDirection: hasSekretaris ? "row" : "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "40px",
        padding: "30px 20px",
        flexWrap: "wrap"
      }}>
        {/* KETUA */}
        {data.ketuaNama && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "12px",
            padding: "12px",
            textAlign: "center",
            width: "220px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            {data.ketuaPhoto ? (
              <img src={data.ketuaPhoto} alt={data.ketuaNama} style={{
                width: "100%", height: "230px", objectFit: "cover",
                borderRadius: "8px", border: "1.5px solid #c9a84c",
                marginBottom: "12px", boxShadow: "0 4px 15px rgba(201,168,76,0.2)"
              }} />
            ) : (
              <div style={{
                width: "100%", height: "230px", background: "rgba(201,168,76,0.1)",
                borderRadius: "8px", border: "1.5px solid #c9a84c", marginBottom: "12px",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ color: "#c9a84c", fontSize: "40px" }}>👤</span>
              </div>
            )}
            <div style={{ color: "#fff", fontFamily: "'Cinzel', serif", fontSize: "13px", fontWeight: "800", letterSpacing: "0.5px", marginBottom: "6px", lineHeight: "1.3" }}>
              {data.ketuaNama}
            </div>
            <div style={{ color: "#c9a84c", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
              {customRoleHead || data.ketuaJabatan || "HEAD"}
            </div>
            {data.ketuaNegara && (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>📍 {data.ketuaNegara}</div>
            )}
          </div>
        )}

        {/* SEKRETARIS */}
        {hasSekretaris && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "12px",
            textAlign: "center",
            width: "220px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            {data.sekretarisPhoto ? (
              <img src={data.sekretarisPhoto} alt={data.sekNama} style={{
                width: "100%", height: "230px", objectFit: "cover",
                borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.3)",
                marginBottom: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
              }} />
            ) : (
              <div style={{
                width: "100%", height: "230px", background: "rgba(255,255,255,0.05)",
                borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.3)", marginBottom: "12px",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "40px" }}>👤</span>
              </div>
            )}
            <div style={{ color: "#fff", fontFamily: "'Cinzel', serif", fontSize: "13px", fontWeight: "800", letterSpacing: "0.5px", marginBottom: "6px", lineHeight: "1.3" }}>
              {data.sekNama}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
              {data.sekJabatan || "SECRETARY"}
            </div>
            {data.sekNegara && (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>📍 {data.sekNegara}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};



export default function CertificationPage() {
  const [allData, setAllData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leadership?body=all')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllData(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const bodies = [
    { title: "ASIACERT", api: "ASIACERT", customRole: "FOUNDER" },
    { title: "ASIA Board of Certification (BOC)", api: "ASIA Board of Certification (BOC)" },
    { title: "Research & Innovation Council", api: "ASIA Research & Innovation Council (ASIA-RIC)" },
    { title: "Conference & Academic Forum", api: "ASIA Conference & Academic Forum (ASIA-CAF)" },
    { title: "Publication & Knowledge Center", api: "ASIA Publication & Knowledge Center (ASIA-PKC)" },
    { title: "Academic Mobility Center", api: "ASIA Academic Mobility Center (ASIA-AMC)" },
    { title: "Competition Center", api: "ASIA Competition Center (ASIA-CC)" },
    { title: "Community Engagement & SDGs Center", api: "ASIA Community Engagement & SDGs Center (ASIA-CES)" },
    { title: "Quality Assurance & Accreditation Board", api: "ASIA Quality Assurance & Accreditation Board (ASIA-QAAB)" },
    { title: "Digital Academy & AI Center", api: "ASIA Digital Academy & AI Center (ASIA-DAC)" },
    { title: "Young Academician Network", api: "ASIA Young Academician Network (ASIA-YAN)" },
    { title: "Awards & Recognition Council", api: "ASIA Awards & Recognition Council (ASIA-ARC)" }
  ];

  return (
    <main style={{ minHeight: "100vh", padding: "100px 20px 60px", background: "#06060c", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "#c9a84c", fontSize: "32px", fontWeight: "bold", textTransform: "uppercase", margin: "0 0 10px", letterSpacing: "2px" }}>
            ASIACERT ORGANIZATIONAL STRUCTURE
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", margin: 0 }}>
            Strategic Bodies of Association of Asia Pacific Academician
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", color: "#c9a84c", padding: "40px" }}>Loading structure...</div>
        ) : (
          bodies.map((b, idx) => {
            const rawData = allData.find(d => d.body_name === b.api);
            let mappedData = null;
            
            if (rawData && (rawData.ketua_name || rawData.sek_name)) {
              mappedData = {
                ketuaNama: rawData.ketua_name || "",
                ketuaJabatan: rawData.ketua_jabatan || "",
                ketuaNegara: rawData.ketua_negara || "",
                ketuaId: rawData.ketua_id || "",
                ketuaPhoto: rawData.ketua_photo || null,
                sekNama: rawData.sek_name || "",
                sekJabatan: rawData.sek_jabatan || "",
                sekNegara: rawData.sek_negara || "",
                sekId: rawData.sek_id || "",
                sekretarisPhoto: rawData.sek_photo || null
              };
            }

            return <BodySection key={idx} title={b.title} bodyName={b.api} customRoleHead={b.customRole} data={mappedData} />;
          })
        )}

      </div>
    </main>
  );
}
