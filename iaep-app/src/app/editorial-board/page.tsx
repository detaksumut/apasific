"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { UploadCloud, Loader2 } from "lucide-react";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

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
  "AJEP - Pendidikan",
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
  const [isAdmin, setIsAdmin] = useState(true); // Bypass auth untuk keperluan upload lokal
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [targetUploadName, setTargetUploadName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const triggerUpload = (name: string) => {
    setTargetUploadName(name);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUploadName) return;

    setUploadingName(targetUploadName);
    const slug = slugify(targetUploadName);
    const fileName = `${slug}.jpg`;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const res = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Gagal mengunggah");
      }
      
      // Tambahkan query param agar browser tidak me-load cache lama
      const cacheBuster = new Date().getTime();
      window.location.href = window.location.pathname + "?t=" + cacheBuster;
    } catch (error: any) {
      alert("Gagal mengunggah foto: " + error.message);
    }
    
    setUploadingName(null);
    setTargetUploadName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main style={{ minHeight: "100vh", padding: "100px 20px 60px", background: "#05050a", fontFamily: "sans-serif" }} className="relative overflow-x-hidden">
      <input 
        type="file" 
        accept="image/*" 
        style={{ display: "none" }} 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
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

        {/* --- HARDCODED GLOBAL EDITORIAL BOARD --- */}
        <div style={{ marginBottom: "80px" }}>
          <div className="border-b border-[#c9a84c]/30 pb-4 mb-6 pl-4 border-l-4 border-l-[#c9a84c]">
            <h2 style={{ color: "#fff", fontSize: "24px", margin: 0, textTransform: "uppercase", letterSpacing: "2px", fontWeight: "900" }}>
              Editorial Board (Global)
            </h2>
          </div>

          <div style={{
            background:"rgba(13,13,26,0.8)",
            border:"1px solid rgba(201,168,76,0.15)",
            borderRadius:"16px",
            overflow:"hidden",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
            backdropFilter:"blur(16px)",
          }}>
            {/* Table header */}
            <div style={{
              display:"grid",
              gridTemplateColumns:"48px 80px 1fr 1.5fr 1fr",
              padding:"14px 24px",
              borderBottom:"1px solid rgba(201,168,76,0.15)",
              background:"rgba(201,168,76,0.06)",
            }}>
              {["No.", "Foto", "Posisi / Jabatan", "Nama", "Negara"].map((h, i) => (
                <div key={i} style={{ fontSize:"11px", fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:"1.5px" }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {[
              { pos: "Editor-in-Chief", name: "Dr. Arfan Ikhsan Lubis, S.E., M.Si., CATr", country: "Indonesia", photo: "/arfan.jpg" },
              { pos: "Deputy Editor-in-Chief", name: "Dr. Muhammad Yamin Noch, S.E., M.S.A", country: "Indonesia", photo: "/yamin.jpg" },
              { pos: "Advisory Board", name: "Dr. Prihat Assih, S.E., M.Si., CSR", country: "Indonesia", photo: "/Prihatti.png" },
              { pos: "Advisory Board", name: "Prof. Dr. Indra Maipita, M.Si.", country: "Indonesia", photo: "/indra.jpg" },
              { pos: "Advisory Board", name: "Assoc. Prof. Ts. Dr. Aidi Ahmi", country: "Malaysia", photo: "" },
              { pos: "Advisory Board", name: "Prof. Istianingsih Sastrodiharjo, S.E., S.H., M.Si.", country: "Indonesia", photo: "" },
              { pos: "Managing Editor", name: "Muhibbuddin Abdul Rahman", country: "Indonesia", photo: "/rahman.jpg" },
              { pos: "Ethics Editor", name: "Dr. Elen Puspitasari., SE., M.Si., CRM., CFDP., CFSM., MSEAC.", country: "Indonesia", photo: "" },
              { pos: "Methodology & Statistics", name: "Dr. Ikbar Pratama, S.E., M.Acc., PhD", country: "Indonesia", photo: "" },
              { pos: "Methodology & Statistics", name: "Dr. Wuri Septi Handayani, S.E., M.Si", country: "Indonesia", photo: "" },
              { pos: "Quality Assurance", name: "Dr. Majo George", country: "International", photo: "" },
              { pos: "Quality Assurance", name: "Dr. Mohammad Sahabuddin", country: "International", photo: "" },

              // SEMUA BOARD EDITORS
              { pos: "Board Editor", name: "Prof. Istianingsih Sastrodiharjo, S.E., S.H., M.Si.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Prof. Dr. Indra Maipita, M.Si.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Prof. Dr. Indra Devi", country: "Malaysia", photo: "" },
              { pos: "Board Editor", name: "Prof. Darmawati, S.E., Ak., M.Si., CA., CRA., ASEAN CPA", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Prof. Dr. Ram Al Jaffri Saad", country: "Malaysia", photo: "" },
              { pos: "Board Editor", name: "Dr. Desak Sri Werastuti, S.E., M.Si.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Wisang Candra Bintari, S.E., M.M.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Evada Dewata", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Bahkrul Khair Amal, M.Si.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Dwi Soegiarto, S.E., M.Si.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Arfan Ikhsan Lubis, S.E., M.Si., CATr", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Robbi Shahary, M.H.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Ratna Wijayanti Daniar Paramita, S.E., M.M.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Arifatul Husna Mohd Ariff", country: "Malaysia", photo: "" },
              { pos: "Board Editor", name: "Dr. Lince Bulutoding", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Ngatemin, M.Si.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Rahmat Ilyas, M.S.I.", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Ha Thuy", country: "Vietnam", photo: "" },
              { pos: "Board Editor", name: "Dr. Ryan", country: "Vietnam", photo: "" },
              { pos: "Board Editor", name: "Dr. Intan Fatimah Anwar", country: "Malaysia", photo: "" },
              { pos: "Board Editor", name: "Dr. Nifaosan", country: "Thailand", photo: "" },
              { pos: "Board Editor", name: "Dr. Muhammad Hashim", country: "Malaysia", photo: "" },
              { pos: "Board Editor", name: "Dr. Raja Haslinda", country: "Malaysia", photo: "" },
              { pos: "Board Editor", name: "Dr. Prattana Arisuk", country: "Thailand", photo: "" },
              { pos: "Board Editor", name: "Dr. Prattana Srisuk", country: "Thailand", photo: "" },
              { pos: "Board Editor", name: "Dr. Sazali Zainal Abidin", country: "Malaysia", photo: "" },
              { pos: "Board Editor", name: "Dr. Eko Cahyo Mayndarto, S.E., M.Si., Ak", country: "Indonesia", photo: "" },
              { pos: "Board Editor", name: "Dr. Amni Suhailah", country: "Brunei Darussalam", photo: "" },
              { pos: "Board Editor", name: "Dr. Majo George", country: "International", photo: "" },
              { pos: "Board Editor", name: "Dr. Mohammad Sahabuddin", country: "International", photo: "" },

              // SEMUA REVIEWERS
              { pos: "Board Reviewer", name: "Prof. Dr. Ram Al Jaffri Saad", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Assoc. Prof. Dr. Norfaiezah Sawandi", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Prof. Dr. Nor Aziah Abd Manaf", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Assoc. Prof. Dr. Azharudin Ali", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Prof. Dr. Ayoib Che Ahmad", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Prof. Dr. Siti Zabedah Binti Saidin", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Assoc. Prof. Wira Ramashar, S.E., M.Ak., Ph.D.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Assoc. Prof. Dr. (Cand) Petty Aprilia Sari, S.E., M.Ak.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Prof. Dr. Rika Dwi Ayu Parmitasari, S.E., M.Com.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Ha Thuy", country: "Vietnam", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Ryan", country: "Vietnam", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Intan Fatimah Anwar", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Nifaosan", country: "Thailand", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Muhammad Hashim", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Raja Haslinda", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Prattana Arisuk", country: "Thailand", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Prattana Srisuk", country: "Thailand", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Sazali Zainal Abidin", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Eko Cahyo Mayndarto, S.E., M.Si., Ak", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Aulia Juanda Djaingsastro", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Anwar Masatip, MMPAR", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Cliff Cheng", country: "Taiwan", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Hakan Aslan", country: "Turkey", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Wahida", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Tri Dessy Fadillah, S.E., M.Ak", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Amni Suhailah", country: "Brunei Darussalam", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Aryo Prakoso", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Jumaiyah, SE. M.Si", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Meilda Wiguna, S.E., M.Sc., Ak., CA", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Indrian Supheni, S.E., M.Aks., CSRA", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Murtiadi Awaluddin", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Inugrah Ratia Pratiwi", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Saliza Binti Abdul Aziz", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Jamaluddin Majid, M.Si", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Tan Chee Yu", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Naz'aina, S.E., M.Si., Ak", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Herman Rustandi", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Hj. Subadriyah, S.E., M.Si", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Yuni Ekawarti", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Anita Kusuma Dewi", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Enos Julvirta, MMPAR", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Nor Atikah Shafai", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Mazrah Malik @ Malek", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Ooi Sue Chern", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Mohd Syahrir Bin Rahim", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Safrul Izani Mohd Salleh", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Zaimah Zainol Ariffin", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Saidatul Nurul Hidayah Jannatun Naim Nor Ahmad", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Sitraselvi Chandren", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Noor Afza Binti Amran", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Muhammad Syahir Bin Abd. Wahab", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Aryati Juliana Binti Sulaiman", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Ku Maisurrah Ku Bahador", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Raja Haslinda Raja Mohd Ali", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Noor Asma Jamaluddin", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Akilah Abdullah", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Lok Yee Huei", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Wan Norhayati Wan Ahmad", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Idawati Ibrahim", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Rohaida Abdul Latif", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Nadzirah Bt Mohd Said", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Muhammad Harith Bin Zahrullaili", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Ira Geraldina", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Sazali Saad", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Nur Azliani Haniza Binti Che Pak", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Hafizah Mohamad Hsbollah", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Adura Binti Ahmad", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Fathiyyah Abu Bakar", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Rokiah Ishak", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Faidzulaini Muhammad", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Rinda Fithriyana", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Zaimah Binti Abdullah", country: "Malaysia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Ismul Mauludin Al Habib", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Zul Azmi", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Saifhul Anuar Syahdan", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Masithah Akbar", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Gemi Ruwanti", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Asri Elies Alamanda, S.H., M.H.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Kiljamilawati, M.H.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Imam Gunanjar, S.E., M.M.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Hadi Jauhari", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Surna Lastri, S.E., M.Si., CTT., CSBA.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Ni Nyoman Ayu Suryandari, S.E., M.Si., Ak., CA.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Marahaman", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Nur Alim Natsir, S.Pi., M.Si.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Dr. Budie Sudjatmiko", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Fikri Rizki Utama, S.E., M.S.Ak., Akt.", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Muhammad Syafril Nasution, S.E., M.Si", country: "Indonesia", photo: "" },
              { pos: "Board Reviewer", name: "Rida Ristiyana, S.E., M.Si", country: "Indonesia", photo: "" },
              // Tech Team
              { pos: "Layout Editor", name: "Kun Syafi'i Habibi", country: "Indonesia", photo: "" },
              { pos: "Cover Editor", name: "Rizky Al Ridho", country: "Indonesia", photo: "" },
              { pos: "Publish Editor", name: "Parida Hannum", country: "Indonesia", photo: "" },
              { pos: "Supervisor Editor", name: "Muhammad Danil", country: "Indonesia", photo: "" },
              { pos: "Web Editor", name: "Azizah Binti Saban., MBA", country: "Indonesia", photo: "" },
              { pos: "Journal Administrator", name: "Khairan Rashad Haqqani Lubis", country: "Indonesia", photo: "" },
              { pos: "Social Media Editor", name: "Wais Al-Qarni, S.T.", country: "Indonesia", photo: "" }
            ].map((m, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} style={{
                  display:"grid",
                  gridTemplateColumns:"48px 100px 1.2fr 1.5fr 1fr",
                  padding:"16px 24px",
                  borderBottom:"1px solid rgba(255,255,255,0.04)",
                  background: isEven ? "transparent" : "rgba(255,255,255,0.015)",
                  alignItems:"center",
                  transition:"background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = isEven ? "transparent" : "rgba(255,255,255,0.015)")}
                >
                  <div style={{ fontSize:"14px", color:"#4b5563", fontWeight:600 }}>{String(i + 1).padStart(2, "0")}</div>
                  
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div 
                      className="group relative"
                      style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(201,168,76,0.3)", background: "#131326", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontWeight: "bold", fontSize: "24px", cursor: isAdmin ? "pointer" : "default" }}
                      onClick={() => isAdmin && triggerUpload(m.name)}
                    >
                          <img 
                            src={`/images/${slugify(m.name)}.jpg`} 
                            alt={m.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                            onError={(e) => { 
                              if (m.photo && !e.currentTarget.src.includes(m.photo)) {
                                e.currentTarget.src = m.photo;
                              } else {
                                e.currentTarget.style.display = 'none'; 
                                e.currentTarget.nextElementSibling?.classList.remove('hidden'); 
                              }
                            }} 
                          />
                      <span className="hidden">{m.name.charAt(0)}</span>
                      
                      {isAdmin && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {uploadingName === m.name ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <UploadCloud className="w-6 h-6 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, color: "#c9a84c" }}>
                    {m.pos}
                  </h3>
                  
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#e8e8f0" }}>
                    {m.name}
                  </p>
                  
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                    {m.country}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* --- END HARDCODED GLOBAL EDITORIAL BOARD --- */}

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
                        <div 
                          className="group relative"
                          style={{
                            width: "120px",
                            height: "120px",
                            margin: "0 auto 20px",
                            borderRadius: "50%",
                            border: "2px solid #c9a84c",
                            padding: "4px",
                            background: "#05050a",
                            cursor: isAdmin ? "pointer" : "default",
                            overflow: "hidden"
                          }}
                          onClick={() => isAdmin && triggerUpload(m.nama)}
                        >
                          <img 
                            src={`/images/${slugify(m.nama)}.jpg`}
                            alt={m.nama} 
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                            onError={(e) => { 
                              if (m.foto && !e.currentTarget.src.includes(m.foto)) {
                                e.currentTarget.src = m.foto;
                              } else {
                                e.currentTarget.style.display = 'none'; 
                                e.currentTarget.nextElementSibling?.classList.remove('hidden'); 
                              }
                            }} 
                          />
                          <div className="hidden" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: "32px", fontWeight: "bold" }}>
                            {m.nama.charAt(0)}
                          </div>
                          
                          {isAdmin && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10 m-1">
                              {uploadingName === m.nama ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              ) : (
                                <UploadCloud className="w-8 h-8 text-white" />
                              )}
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
