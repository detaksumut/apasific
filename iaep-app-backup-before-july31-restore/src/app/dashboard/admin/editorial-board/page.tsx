"use client";
import { useState, useRef, useEffect } from "react";

interface EditorialMember {
  jabatan: string;
  nama: string;
  afiliasi: string;
  foto: string;
}

export default function EditorialBoardManagement() {
  const [selectedJournal, setSelectedJournal] = useState("");
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [saved, setSaved] = useState(false);
  const [skCurrent, setSkCurrent] = useState("");
  const [skPast, setSkPast] = useState("");
  const [uploadingSkCurrent, setUploadingSkCurrent] = useState(false);
  const [uploadingSkPast, setUploadingSkPast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fileInputCurrent = useRef<HTMLInputElement>(null);
  const fileInputPast = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const fotoRefs = useRef<(HTMLInputElement | null)[]>([]);

  const journals = [
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

  useEffect(() => {
    if (!selectedJournal) {
      setMembers([]);
      return;
    }

    const bodyName = `Editorial Board - ${selectedJournal}`;
    fetch(`/api/leadership?body=${encodeURIComponent(bodyName)}`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.members && Array.isArray(data.members)) {
          setMembers(data.members);
        } else {
          setMembers([]);
        }
        setSkCurrent(data.skCurrent || "");
        setSkPast(data.skPast || "");
      })
      .catch(() => {
        setMembers([]);
        setSkCurrent("");
        setSkPast("");
      });
  }, [selectedJournal]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 150;
          const MAX_HEIGHT = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.5));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setMembers(prev => {
        const next = [...prev];
        next[index] = { ...next[index], foto: compressed };
        return next;
      });
    } catch (err) {
      showToast("Gagal memproses foto");
    }
  };

  const updateMember = (index: number, field: string, value: string) => {
    setMembers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addMember = () => {
    setMembers(prev => [...prev, { jabatan: "", nama: "", afiliasi: "", foto: "" }]);
  };

  const removeMember = (index: number) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSk = async (e: React.ChangeEvent<HTMLInputElement>, type: 'current' | 'past') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Hanya file PDF yang diperbolehkan!");
      return;
    }
    if (type === 'current') setUploadingSkCurrent(true);
    else setUploadingSkPast(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("journalName", selectedJournal);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload-sk", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (type === 'current') setSkCurrent(data.url);
        else setSkPast(data.url);
        showToast("SK berhasil diunggah! Jangan lupa klik Simpan Data.");
        setSaved(false);
      } else {
        throw new Error(data.error || "Gagal upload");
      }
    } catch (err: any) {
      showToast(err.message);
    } finally {
      if (type === 'current') setUploadingSkCurrent(false);
      else setUploadingSkPast(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!selectedJournal) {
      showToast("Pilih jurnal terlebih dahulu.");
      return;
    }

    try {
      const payload = {
        bodyName: `Editorial Board - ${selectedJournal}`,
        members: members,
        skCurrent: skCurrent,
        skPast: skPast,
      };

      const payloadString = JSON.stringify(payload);
      const sizeMB = (new Blob([payloadString]).size / (1024 * 1024)).toFixed(2);

      if (parseFloat(sizeMB) > 0.9) {
        showToast(`Data Anda masih ${sizeMB} MB. Server membatasi maksimal 1 MB! Tolong ganti foto (upload ulang) anggota yang fotonya paling besar agar dikompres secara otomatis.`);
        return;
      }

      const response = await fetch("/api/leadership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadString,
      });

      const resData = await response.json();
      if (!response.ok || resData.error) {
        throw new Error(resData.error || "Gagal menyimpan data");
      }

      setSaved(true);
      showToast("Data Dewan Editorial berhasil disimpan!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      showToast(`Gagal menyimpan data: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 960, position: "relative" }}>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 animate-fade-in-down border border-green-400 backdrop-blur-sm flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff", margin: "0 0 5px" }}>
          Dewan <span style={{ color: "#c9a84c" }}>Editorial</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
          Kelola susunan struktur Dewan Redaksi (Editorial Board) untuk masing-masing jurnal dengan pola input yang dinamis dan simpel.
        </p>
      </div>

      {/* Dropdown */}
      <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 8 }}>
          PILIH JURNAL
        </label>
        <select
          value={selectedJournal}
          onChange={e => { setSelectedJournal(e.target.value); setSaved(false); }}
          style={{
            width: "100%", maxWidth: 520,
            background: "#1a1a2e", border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "9px 14px",
            color: selectedJournal ? "#fff" : "rgba(255,255,255,0.3)",
            fontSize: 13, outline: "none", cursor: "pointer",
          }}
        >
          <option value="" disabled style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.3)" }}>-- Pilih Jurnal --</option>
          {journals.map(j => <option key={j} value={j} style={{ background: "#1a1a2e", color: "#fff" }}>{j}</option>)}
        </select>
      </div>

      {/* Form Area */}
      {selectedJournal && (
        <div style={{ background: "#13131f", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, overflow: "hidden" }}>

          <div style={{ background: "linear-gradient(90deg,#0d0d1a,#1a1a2e)", padding: "14px 24px", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
            <p style={{ fontSize: 10, color: "rgba(201,168,76,0.55)", letterSpacing: "1.5px", margin: "0 0 3px", fontWeight: 700 }}>STRUKTUR REDAKSI</p>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#c9a84c", margin: 0 }}>📖 Editorial Board — {selectedJournal}</h2>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>Tambahkan anggota redaksi tanpa batas. Anda bebas menentukan nama jabatannya (misal: Editor in Chief, Reviewer, dll).</p>
          </div>

          <div style={{ padding: "24px 24px 10px", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
            <h3 style={{ fontSize: 13, color: "#fff", marginBottom: 12, fontWeight: 700 }}>SURAT KEPUTUSAN (SK) DEWAN REDAKSI</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SK Current */}
              <div className="bg-[#1a1a2e] border border-[#c9a84c]/20 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <label className="block text-[#c9a84c] text-[11px] font-bold mb-1">SK PERIODE SEKARANG (PDF)</label>
                  <p className="text-[10px] text-gray-500 mb-3">Upload SK yang berlaku saat ini (berlaku 3 tahun)</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputCurrent.current?.click()}
                    disabled={uploadingSkCurrent}
                    className="bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30 hover:bg-[#c9a84c] hover:text-black px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap"
                  >
                    {uploadingSkCurrent ? "Mengunggah..." : "Upload PDF"}
                  </button>
                  <input type="file" accept="application/pdf" className="hidden" ref={fileInputCurrent} onChange={(e) => handleUploadSk(e, 'current')} />
                  {skCurrent && (
                    <a href={skCurrent} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Lihat SK
                    </a>
                  )}
                </div>
              </div>

              {/* SK Past */}
              <div className="bg-[#1a1a2e] border border-[#c9a84c]/20 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <label className="block text-gray-400 text-[11px] font-bold mb-1">SK PERIODE BERLALU (PDF)</label>
                  <p className="text-[10px] text-gray-600 mb-3">Upload arsip SK dari periode sebelumnya</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputPast.current?.click()}
                    disabled={uploadingSkPast}
                    className="bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap"
                  >
                    {uploadingSkPast ? "Mengunggah..." : "Upload PDF"}
                  </button>
                  <input type="file" accept="application/pdf" className="hidden" ref={fileInputPast} onChange={(e) => handleUploadSk(e, 'past')} />
                  {skPast && (
                    <a href={skPast} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Lihat SK
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            {members.map((member, idx) => (
              <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#c9a84c", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Anggota #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeMember(idx)}
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    × Hapus
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "start" }}>
                  {/* Foto mini */}
                  <div
                    onClick={() => { if (fotoRefs.current[idx]) fotoRefs.current[idx]!.click(); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                  >
                    <input
                      ref={el => { fotoRefs.current[idx] = el; }}
                      type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => handleFotoChange(e, idx)}
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
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 4 }}>JABATAN (ROLE)</label>
                      <input
                        type="text"
                        placeholder="Contoh: Editor in Chief, Editor on Board, Reviewer..."
                        value={member.jabatan}
                        onChange={e => updateMember(idx, "jabatan", e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 11px", color: "#fff", fontSize: 13, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 4 }}>NAMA LENGKAP & GELAR</label>
                      <input
                        type="text"
                        placeholder="Contoh: Prof. Dr. Alan Turing"
                        value={member.nama}
                        onChange={e => updateMember(idx, "nama", e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 11px", color: "#fff", fontSize: 13, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: 4 }}>AFILIASI / UNIVERSITAS</label>
                      <input
                        type="text"
                        placeholder="Contoh: Oxford University, UK"
                        value={member.afiliasi}
                        onChange={e => updateMember(idx, "afiliasi", e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 11px", color: "#fff", fontSize: 13, outline: "none" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add member button */}
            <button
              onClick={addMember}
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
                onClick={() => setSelectedJournal("")}
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
    </div>
  );
}
