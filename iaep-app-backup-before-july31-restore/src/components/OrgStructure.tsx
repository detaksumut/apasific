"use client";

import { useState, useEffect } from "react";

const HOME_BODY = "Struktur Organisasi ASIA (Home)";

const DEFAULT_MEMBERS = [
  { jabatan: "Bapak Pendiri", nama: "DR. ARFAN IKHSAN LUBIS., SE., M.Si., CATr", afiliasi: "Association of Asia Pacific Academician", foto: "/arfan.png" },
  { jabatan: "Penasihat",         nama: "PROF. DR. INDRA MAIPITA., M.Si",            afiliasi: "Asia Pacific Academic Advisory Board",    foto: "/indra.jpg" },
  { jabatan: "Presiden",       nama: "DR. ARFAN IKHSAN LUBIS., SE., M.Si., CATr", afiliasi: "Kepemimpinan Akademik Asia Pasifik",         foto: "/arfan.png" },
  { jabatan: "Wakil Presiden",  nama: "DR. MUHAMMAD YAMIN NOCH., SE., MSA",         afiliasi: "Urusan Akademik & Pengembangan Institusi", foto: "/yamin.jpg" },
  { jabatan: "Wakil Presiden",  nama: "PROF. DR. ISTIANINGSIH SASTRODIHARJO., SE., M.Si", afiliasi: "Riset & Kerjasama Internasional", foto: "/istianingsih.jpg" },
  { jabatan: "Sekretaris Jenderal", nama: "DR. NGATEMIN., M.Si",                     afiliasi: "Operasi Strategis & Tata Kelola",      foto: "/ngatemin.jpg" },
  { jabatan: "Bendahara",       nama: "TRI DESSY FADILLAH., SE., M.Ak",            afiliasi: "Manajemen Keuangan & Sumber Daya",           foto: "/tridessy.jpg" }
];

interface Member {
  jabatan: string;
  nama: string;
  afiliasi: string;
  foto: string;
}

function toTitleCase(str: any) {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export default function OrgStructure() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leadership?body=${encodeURIComponent(HOME_BODY)}`)
      .then(res => res.json())
      .then(data => {
        if (data.members && Array.isArray(data.members)) {
          setMembers(data.members);
        }
      })
      .catch(() => {
        setMembers(DEFAULT_MEMBERS);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#c9a84c" }}>
        Memuat struktur organisasi...
      </div>
    );
  }

  return (
    <div className="leadership-grid">
      {members.map((m, idx) => (
        <div key={idx} className="leader-card" data-aos="fade-up" style={{ animationDelay: `${idx * 0.05}s` }}>
          <div className="leader-avatar">
            {m.foto ? (
              <img
                src={m.foto}
                alt={m.nama}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%", minHeight: "100px",
                background: "rgba(201,168,76,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "50%",
                aspectRatio: "1/1",
              }}>
                <svg width="40" height="40" fill="none" stroke="rgba(201,168,76,0.4)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="leader-info">
            <h4>{toTitleCase(m.jabatan)}</h4>
            <p className="leader-name">{m.nama}</p>
            <p className="leader-affil">{toTitleCase(m.afiliasi)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
