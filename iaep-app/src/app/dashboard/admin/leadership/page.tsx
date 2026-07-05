"use client";
import { useState } from "react";

export default function LeadershipManagementPage() {
  const [selectedBody, setSelectedBody] = useState("");

  const bodies = [
    "ASIA Board of Certification (BOC)",
    "ASIACERT",
    "ASIA Quality Assurance & Accreditation Board (ASIA-QAAB)",
    "ASIA Competition Center (ASIA-CC)",
    "ASIA Publication & Knowledge Center (ASIA-PKC)",
    "ASIA Academic Mobility Center (ASIA-AMC)",
    "ASIA Research & Innovation Council (ASIA-RIC)",
    "ASIA Conference & Academic Forum (ASIA-CAF)",
    "ASIA Community Engagement & SDGs Center (ASIA-CES)",
    "ASIA Digital Academy & AI Center (ASIA-DAC)",
    "ASIA Young Academician Network (ASIA-YAN)",
    "ASIA Awards & Recognition Council (ASIA-ARC)",
  ];

  const InputField = ({ label, placeholder }: { label: string; placeholder: string }) => (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.8px", marginBottom: 8 }}>
        {label.toUpperCase()}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "10px 14px",
          color: "#fff",
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={e => (e.target.style.borderColor = "#c9a84c")}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );

  const PhotoUpload = () => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px", border: "1.5px dashed rgba(255,255,255,0.12)",
      borderRadius: 12, cursor: "pointer", transition: "border-color 0.2s",
      background: "rgba(255,255,255,0.02)",
    }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.4)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)")}
    >
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 10,
      }}>
        <svg width="32" height="32" fill="none" stroke="rgba(255,255,255,0.25)" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#c9a84c" }}>Upload Foto</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Rasio 1:1, maks. 2MB</span>
    </div>
  );

  return (
    <>
      <style>{`
        .leadership-select option {
          background: #1a1a2e;
          color: #fff;
          padding: 8px;
        }
        .leadership-select option:hover {
          background: #c9a84c;
        }
      `}</style>

      <div style={{ maxWidth: 1000 }}>

        {/* Header */}
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
            Manajemen <span style={{ color: "#c9a84c" }}>Pimpinan</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Kelola data Ketua dan Sekretaris untuk setiap Badan Strategis & Sertifikasi ASIA.
          </p>
        </div>

        {/* Dropdown selector */}
        <div style={{
          background: "#13131f",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "24px 28px",
          marginBottom: 24,
        }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1px", marginBottom: 10 }}>
            PILIH BADAN / DIVISI
          </label>
          <select
            className="leadership-select"
            value={selectedBody}
            onChange={e => setSelectedBody(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 560,
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "11px 16px",
              color: selectedBody ? "#fff" : "rgba(255,255,255,0.35)",
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23c9a84c' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              paddingRight: 40,
            }}
          >
            <option value="" disabled style={{ color: "rgba(255,255,255,0.35)", background: "#1a1a2e" }}>-- Pilih Badan --</option>
            {bodies.map(b => (
              <option key={b} value={b} style={{ background: "#1a1a2e", color: "#fff" }}>{b}</option>
            ))}
          </select>
        </div>

        {/* Form panel — only shown when body is selected */}
        {selectedBody && (
          <div style={{
            background: "#13131f",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            overflow: "hidden",
          }}>
            {/* Form header */}
            <div style={{
              background: "linear-gradient(90deg, #0d0d1a 0%, #1a1a2e 100%)",
              padding: "18px 28px",
              borderBottom: "1px solid rgba(201,168,76,0.2)",
            }}>
              <p style={{ fontSize: 11, color: "rgba(201,168,76,0.6)", letterSpacing: "1.5px", margin: "0 0 4px", fontWeight: 700 }}>
                DATA KEPEMIMPINAN
              </p>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c", margin: 0 }}>{selectedBody}</h2>
            </div>

            {/* Form grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              padding: "32px 28px",
            }}>

              {/* Ketua */}
              <div>
                <div style={{ borderBottom: "2px solid #c9a84c", paddingBottom: 10, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "#c9a84c", margin: 0, letterSpacing: "1px" }}>KETUA (HEAD)</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <PhotoUpload />
                  <InputField label="Nama Lengkap & Gelar" placeholder="Contoh: Prof. Dr. Budi Santoso, M.Si." />
                  <InputField label="Jabatan" placeholder="Contoh: Ketua ASIA-QAAB" />
                  <InputField label="Negara" placeholder="Contoh: Indonesia" />
                  <InputField label="ID Akademik" placeholder="Contoh: ASIA-2026-0001" />
                </div>
              </div>

              {/* Sekretaris */}
              <div>
                <div style={{ borderBottom: "2px solid rgba(255,255,255,0.15)", paddingBottom: 10, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.6)", margin: 0, letterSpacing: "1px" }}>SEKRETARIS (SECRETARY)</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <PhotoUpload />
                  <InputField label="Nama Lengkap & Gelar" placeholder="Contoh: Dr. Siti Aminah, M.Pd." />
                  <InputField label="Jabatan" placeholder="Contoh: Sekretaris ASIA-QAAB" />
                  <InputField label="Negara" placeholder="Contoh: Malaysia" />
                  <InputField label="ID Akademik" placeholder="Contoh: ASIA-2026-0002" />
                </div>
              </div>

            </div>

            {/* Footer action */}
            <div style={{
              padding: "18px 28px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}>
              <button
                onClick={() => setSelectedBody("")}
                style={{
                  padding: "10px 22px", borderRadius: 8,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button style={{
                padding: "10px 24px", borderRadius: 8,
                background: "linear-gradient(135deg, #c9a84c, #e8c96a)",
                color: "#0d0d0d", fontSize: 13, fontWeight: 700,
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
              }}>
                Simpan Data
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
