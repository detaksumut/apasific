"use client";
import { useState, useRef, useEffect } from "react";

const HOME_BODY = "Struktur Organisasi ASIA (Home)";

// Default 8 members for Home org structure
const DEFAULT_HOME_MEMBERS = [
  { jabatan: "Founding Father", nama: "DR. ARFAN IKHSAN LUBIS., SE., M.Si., CATr", afiliasi: "Association of Asia Pacific Academician", foto: "" },
  { jabatan: "Advisor",         nama: "PROF. DR. INDRA MAIPITA., M.Si",            afiliasi: "Asia Pacific Academic Advisory Board",    foto: "" },
  { jabatan: "President",       nama: "DR. ARFAN IKHSAN LUBIS., SE., M.Si., CATr", afiliasi: "Asia Pacific Academic Leadership",         foto: "" },
  { jabatan: "Vice President",  nama: "DR. MUHAMMAD YAMIN NOCH., SE., MSA",         afiliasi: "Academic Affairs & Institutional Development", foto: "" },
  { jabatan: "Vice President",  nama: "PROF. DR. ISTIANINGSIH SASTRODIHARJO., SE., M.Si", afiliasi: "Research & International Cooperation", foto: "" },
  { jabatan: "Secretary General", nama: "DR. NGATEMIN., M.Si",                     afiliasi: "Strategic Operations & Governance",      foto: "" },
  { jabatan: "Treasurer",       nama: "TRI DESSY FADILLAH., SE., M.Ak",            afiliasi: "Finance & Resource Management",           foto: "" },
  { jabatan: "Information Technology", nama: "M. A. RAHMAN",                       afiliasi: "Digital Platform & System Integration",   foto: "" },
];

export default function LeadershipManagementPage() {
  const [selectedBody, setSelectedBody] = useState("");
  const [ketuaPhoto, setKetuaPhoto]     = useState<string | null>(null);
  const [sekretarisPhoto, setSekretarisPhoto] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Home org structure state — 8 members
  const [homeMembers, setHomeMembers] = useState(DEFAULT_HOME_MEMBERS.map(m => ({ ...m })));
  const homeFotoRefs = useRef<(HTMLInputElement | null)[]>([]);

  const ketuaPhotoRef     = useRef<HTMLInputElement>(null);
  const sekretarisPhotoRef = useRef<HTMLInputElement>(null);

  // Form state for strategic bodies
  const [form, setForm] = useState({
    ketuaNama: "", ketuaJabatan: "", ketuaNegara: "", ketuaId: "",
    sekNama:   "", sekJabatan:   "", sekNegara:   "", sekId:   "",
  });

  const isHome = selectedBody === HOME_BODY;

  // Load saved data when selectedBody changes
  useEffect(() => {
    if (!selectedBody) return;

    if (selectedBody === HOME_BODY) {
      // Load home members from API
      fetch(`/api/leadership?body=${encodeURIComponent(HOME_BODY)}`)
        .then(res => res.json())
        .then(data => {
          if (data.members && Array.isArray(data.members) && data.members.length > 0) {
            setHomeMembers(data.members);
          } else {
            setHomeMembers(DEFAULT_HOME_MEMBERS.map(m => ({ ...m })));
          }
        })
        .catch(() => {
          setHomeMembers(DEFAULT_HOME_MEMBERS.map(m => ({ ...m })));
        });
      return;
    }

    // Fetch from Supabase API for strategic bodies
    fetch(`/api/leadership?body=${encodeURIComponent(selectedBody)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error("Error fetching leadership data:", data.error);
          return;
        }
        setForm({
          ketuaNama: data.ketuaNama || "",
          ketuaJabatan: data.ketuaJabatan || "",
          ketuaNegara: data.ketuaNegara || "",
          ketuaId: data.ketuaId || "",
          sekNama: data.sekNama || "",
          sekJabatan: data.sekJabatan || "",
          sekNegara: data.sekNegara || "",
          sekId: data.sekId || "",
        });
        setKetuaPhoto(data.ketuaPhoto || null);
        setSekretarisPhoto(data.sekretarisPhoto || null);
      })
      .catch(err => {
        console.error("Failed to load leadership data", err);
      });
  }, [selectedBody]);

  const bodies = [
    HOME_BODY,
    "ASIACERT",
    "ASIA Board of Certification (BOC)",
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, side: "ketua" | "sek") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (side === "ketua") setKetuaPhoto(reader.result as string);
      else setSekretarisPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleHomeFotoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setHomeMembers(prev => {
        const next = [...prev];
        next[index] = { ...next[index], foto: reader.result as string };
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const updateHomeMember = (index: number, field: string, value: string) => {
    setHomeMembers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addHomeMember = () => {
    setHomeMembers(prev => [...prev, { jabatan: "", nama: "", afiliasi: "", foto: "" }]);
  };

  const removeHomeMember = (index: number) => {
    setHomeMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedBody) { alert("Pilih badan terlebih dahulu."); return; }

    try {
      let payload: any;

      if (isHome) {
        payload = {
          bodyName: HOME_BODY,
          members: homeMembers,
        };
      } else {
        payload = {
          bodyName: selectedBody,
          ketuaNama, ketuaJabatan: form.ketuaJabatan, ketuaNegara: form.ketuaNegara, ketuaId: form.ketuaId, ketuaPhoto,
          sekNama: form.sekNama, sekJabatan: form.sekJabatan, sekNegara: form.sekNegara, sekId: form.sekId, sekretarisPhoto,
          ...form,
        };
      }

      const response = await fetch("/api/leadership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok || resData.error) {
        throw new Error(resData.error || "Gagal menyimpan data");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(`Gagal menyimpan data: ${err.message}`);
    }
  };

  const field = (key: keyof typeof form, label: string, placeholder: string) => (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 7, padding: "8px 12px",
          color: "#fff", fontSize: 13, outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={e => (e.target.style.borderColor = "#c9a84c")}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );

  const PhotoBox = ({
    photo, onUpload, inputRef,
  }: {
    photo: string | null;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "16px 12px",
        border: "1.5px dashed rgba(255,255,255,0.12)",
        borderRadius: 10, cursor: "pointer",
        background: "rgba(255,255,255,0.02)",
        transition: "border-color 0.2s",
        minHeight: 200,
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.5)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)")}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onUpload} />
      {photo ? (
        <img src={photo} alt="preview" style={{ width: 150, height: 200, borderRadius: "6px", objectFit: "cover", border: "2px solid #c9a84c" }} />
      ) : (
        <div style={{ width: 150, height: 200, borderRadius: "6px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <svg width="26" height="26" fill="none" stroke="rgba(255,255,255,0.2)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
      <span style={{ fontSize: 12, fontWeight: 600, color: "#c9a84c", marginTop: photo ? 8 : 0 }}>
        {photo ? "Ganti Foto" : "Upload Foto"}
      </span>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>Rasio 3:4, maks. 2MB</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff", margin: "0 0 5px" }}>
          Manajemen <span style={{ color: "#c9a84c" }}>Pimpinan</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
          Kelola Struktur Organisasi Home & Ketua/Sekretaris setiap Badan Strategis ASIA.
        </p>
      </div>

      {/* Dropdown */}
      <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 8 }}>
          PILIH BADAN / DIVISI
        </label>
        <select
          value={selectedBody}
          onChange={e => { setSelectedBody(e.target.value); setSaved(false); }}
          style={{
            width: "100%", maxWidth: 520,
            background: "#1a1a2e", border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "9px 14px",
            color: selectedBody ? "#fff" : "rgba(255,255,255,0.3)",
            fontSize: 13, outline: "none", cursor: "pointer",
          }}
        >
          <option value="" disabled style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.3)" }}>-- Pilih Badan --</option>
          {bodies.map(b => <option key={b} value={b} style={{ background: "#1a1a2e", color: b === HOME_BODY ? "#c9a84c" : "#fff" }}>{b === HOME_BODY ? "🏠 " + b : b}</option>)}
        </select>
      </div>

      {/* ── HOME ORG STRUCTURE FORM ── */}
      {selectedBody && isHome && (
        <div style={{ background: "#13131f", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, overflow: "hidden" }}>

          {/* Form header */}
          <div style={{ background: "linear-gradient(90deg,#0d0d1a,#1a1a2e)", padding: "14px 24px", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
            <p style={{ fontSize: 10, color: "rgba(201,168,76,0.55)", letterSpacing: "1.5px", margin: "0 0 3px", fontWeight: 700 }}>STRUKTUR ORGANISASI</p>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#c9a84c", margin: 0 }}>🏠 Halaman Home — Organizational Structure</h2>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>Edit, tambah, atau hapus anggota yang tampil di bagian Organizational Structure halaman utama website.</p>
          </div>

          <div style={{ padding: "24px" }}>
            {homeMembers.map((member, idx) => (
              <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#c9a84c", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Anggota #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeHomeMember(idx)}
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    × Hapus
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "start" }}>
                  {/* Foto mini */}
                  <div
                    onClick={() => { if (homeFotoRefs.current[idx]) homeFotoRefs.current[idx]!.click(); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                  >
                    <input
                      ref={el => { homeFotoRefs.current[idx] = el; }}
                      type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => handleHomeFotoChange(e, idx)}
                    />
                    {member.foto ? (
                      <img src={member.foto} alt="foto" style={{ width: 90, height: 110, borderRadius: 8, objectFit: "cover", border: "2px solid #c9a84c" }} />
                    ) : (
                      <div style={{ width: 90, height: 110, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px dashed rgba(255,255,255,0.15)" }}>
                        <svg width="22" height="22" fill="none" stroke="rgba(255,255,255,0.2)" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <span style={{ fontSize: 10, color: "#c9a84c", marginTop: 6, fontWeight: 600 }}>
                      {member.foto ? "Ganti" : "Upload"} Foto
                    </span>
                  </div>

                  {/* Fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 4 }}>JABATAN</label>
                      <input
                        type="text"
                        placeholder="Contoh: President, Vice President, Treasurer..."
                        value={member.jabatan}
                        onChange={e => updateHomeMember(idx, "jabatan", e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 11px", color: "#fff", fontSize: 13, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 4 }}>NAMA LENGKAP & GELAR</label>
                      <input
                        type="text"
                        placeholder="Contoh: DR. ARFAN IKHSAN LUBIS., SE., M.Si."
                        value={member.nama}
                        onChange={e => updateHomeMember(idx, "nama", e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 11px", color: "#fff", fontSize: 13, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 4 }}>DIVISI / AFILIASI</label>
                      <input
                        type="text"
                        placeholder="Contoh: Academic Affairs & Institutional Development"
                        value={member.afiliasi}
                        onChange={e => updateHomeMember(idx, "afiliasi", e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 11px", color: "#fff", fontSize: 13, outline: "none" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add member button */}
            <button
              onClick={addHomeMember}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px dashed rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.05)", color: "#c9a84c", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 4 }}
            >
              + Tambah Anggota
            </button>
          </div>

          {/* Footer */}
          <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              {saved && (
                <span style={{ fontSize: 13, color: "#4ade80", display: "flex", alignItems: "center", gap: 6 }}>
                  ✓ Data berhasil disimpan ke database
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSelectedBody("")}
                style={{ padding: "8px 18px", borderRadius: 7, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                style={{ padding: "8px 22px", borderRadius: 7, background: "linear-gradient(135deg,#c9a84c,#e8c96a)", color: "#0d0d0d", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 3px 12px rgba(201,168,76,0.3)" }}
              >
                Simpan ke Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STRATEGIC BODY FORM (existing) ── */}
      {selectedBody && !isHome && (
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>

          {/* Form header */}
          <div style={{ background: "linear-gradient(90deg,#0d0d1a,#1a1a2e)", padding: "14px 24px", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
            <p style={{ fontSize: 10, color: "rgba(201,168,76,0.55)", letterSpacing: "1.5px", margin: "0 0 3px", fontWeight: 700 }}>DATA KEPEMIMPINAN</p>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#c9a84c", margin: 0 }}>{selectedBody}</h2>
          </div>

          {/* Two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, padding: "24px 24px" }}>

            {/* Ketua */}
            <div>
              <div style={{ borderBottom: "2px solid #c9a84c", paddingBottom: 8, marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "#c9a84c", margin: 0, letterSpacing: "1px" }}>KETUA (HEAD)</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <PhotoBox photo={ketuaPhoto} onUpload={e => handlePhotoChange(e, "ketua")} inputRef={ketuaPhotoRef} />
                {field("ketuaNama",     "Nama Lengkap & Gelar",   "Contoh: Prof. Dr. Budi Santoso, M.Si.")}
                {field("ketuaJabatan",  "Jabatan",                "Contoh: Ketua ASIACERT")}
                {field("ketuaNegara",   "Negara",                 "Contoh: Indonesia")}
                {field("ketuaId",       "ID Akademik",            "Contoh: ASIA-2026-0001")}
              </div>
            </div>

            {/* Sekretaris */}
            <div>
              <div style={{ borderBottom: "2px solid rgba(255,255,255,0.15)", paddingBottom: 8, marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", margin: 0, letterSpacing: "1px" }}>SEKRETARIS (SECRETARY)</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <PhotoBox photo={sekretarisPhoto} onUpload={e => handlePhotoChange(e, "sek")} inputRef={sekretarisPhotoRef} />
                {field("sekNama",    "Nama Lengkap & Gelar",   "Contoh: Dr. Siti Aminah, M.Pd.")}
                {field("sekJabatan", "Jabatan",                "Contoh: Sekretaris ASIACERT")}
                {field("sekNegara",  "Negara",                 "Contoh: Malaysia")}
                {field("sekId",      "ID Akademik",            "Contoh: ASIA-2026-0002")}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              {saved && (
                <span style={{ fontSize: 13, color: "#4ade80", display: "flex", alignItems: "center", gap: 6 }}>
                  ✓ Data berhasil disimpan
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSelectedBody("")}
                style={{ padding: "8px 18px", borderRadius: 7, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                style={{ padding: "8px 22px", borderRadius: 7, background: "linear-gradient(135deg,#c9a84c,#e8c96a)", color: "#0d0d0d", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 3px 12px rgba(201,168,76,0.3)" }}
              >
                Simpan Data
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
