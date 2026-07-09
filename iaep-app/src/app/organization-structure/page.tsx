"use client";

import React, { useState } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────
   STATIC STRUCTURE TABLE
   Pre-filled with all positions. Photos & names can later
   be edited from the Admin Dashboard → Org Structure.
────────────────────────────────────────────────────────────── */

interface OrgMember {
  no: number;
  level: string;         // Tier label: "Executive", "VP", "Secretariat", etc.
  position: string;      // Job title
  name: string;          // Person's name (empty = TBA)
  division: string;      // Area / affiliation
  photo?: string;        // Optional URL
}

const ORG_STRUCTURE: OrgMember[] = [
  // ── Executive Board ───────────────────────────────────────
  { no: 1,  level: "Executive Board", position: "Founder",                        name: "Dr. Arfan Ikhsan Lubis, SE, M.Si, CATr",          division: "Association of Asia Pacific Academician" },
  { no: 2,  level: "Executive Board", position: "Co-Founder",                     name: "M. A. Rahman",                                     division: "Digital Platform & IT Innovation" },
  { no: 3,  level: "Executive Board", position: "Advisor",                        name: "Dr. Prihat Assih, M.Si, CSR S",                    division: "Asia Pacific Academic Advisory Board" },
  { no: 4,  level: "Executive Board", position: "Advisor",                        name: "Prof. Dr. Indra Maipita., M.Si",                   division: "Asia Pacific Academic Advisory Board" },
  { no: 5,  level: "Executive Board", position: "President AAPA",                     name: "Dr. Arfan Ikhsan Lubis, SE, M.Si, CATr",          division: "Association of Asia Pacific Academician" },
  // ── Vice Presidents ───────────────────────────────────────
  { no: 6,  level: "Vice Presidents", position: "Vice President",                 name: "Dr. Muhammad Yamin Noch, SE, MSA",                 division: "Academic Affairs & Institutional Development" },
  { no: 7,  level: "Vice Presidents", position: "Vice President",                 name: "Prof. Dr. Istianingsih Sastrodiharjo, SE, M.Si",   division: "Research & International Cooperation" },
  // ── Secretariat ───────────────────────────────────────────
  { no: 8,  level: "Secretariat",     position: "Secretary General",              name: "Dr. Ngatemin, M.Si",                               division: "Office of the Secretary General (OSG)" },
  { no: 9,  level: "Secretariat",     position: "Deputy Secretary General",       name: "Dr. Ellen Puspitasari, SE, M.Si",                  division: "Country Representatives" },
  { no: 10, level: "Secretariat",     position: "Chief Administrative Officer",   name: "Dr. Ikbar Pratama",                                 division: "Head of Secretariat Office" },
  { no: 11, level: "Secretariat",     position: "Treasurer",                      name: "Tri Dessy Fadillah, SE, M.Ak",                    division: "Finance & Resource Management" },
  // ── Directors ─────────────────────────────────────────────
  { no: 12, level: "Directors",       position: "Director of Information Technology", name: "M. A. Rahman",                                division: "Software Engineering, AI & Digital Innovation" },
  { no: 13, level: "Directors",       position: "Director of Global Partnerships",    name: "Dr. Bahkrul Khair Amal, M.Si",               division: "International Relations" },
  { no: 14, level: "Directors",       position: "General Counsel",                    name: "Dr. Robbi Shahary, MH",                      division: "Legal Affairs & Governance Office" },
  // ── Publication Division ──────────────────────────────────
  { no: 15, level: "Publication",     position: "Editor in Chief",               name: "Dr. Bahkrul Khair Alam, M.Si",  division: "Journal Editorial Leadership" },
  // ── ASIACERT ──────────────────────────────────────────────
  { no: 16, level: "ASIACERT",        position: "Chairman of ASIACERT",          name: "Dr. Arfan Ikhsan Lubis, SE, M.Si, CATr", division: "ASIACERT Center Leadership" },
  { no: 17, level: "ASIACERT",        position: "Chairman of BOC",               name: "Dr. Sazali Zainal Abidin", division: "Board of Certification Leadership" },
  { no: 18, level: "ASIACERT",        position: "Secretary of BOC",              name: "Dr. Amni Suhailah",                      division: "Board of Certification Leadership" },
  { no: 19, level: "Membership",      position: "Chief of Membership",           name: "",                                       division: "Member Relations & Registry" },
  // ── Strategic Bodies ──────────────────────────────────────
  { no: 20, level: "ASIACERT", position: "Chairman – Research & Innovation Council",        name: "Dr. Prattana Arisuk",                     division: "Research & Innovation Council" },
  { no: 21, level: "ASIACERT", position: "Secretary – Research & Innovation Council",       name: "Dr. Prattana Srisuk",                     division: "Research & Innovation Council" },
  { no: 22, level: "ASIACERT", position: "Chairman – Conference & Academic Forum",          name: "Cliff Cheng",                             division: "Conference & Academic Forum" },
  { no: 23, level: "ASIACERT", position: "Secretary – Conference & Academic Forum",         name: "Dr. Ha Thuy",                             division: "Conference & Academic Forum" },
  { no: 24, level: "ASIACERT", position: "Chairman – Publication & Knowledge Center",       name: "Dr. Hakan Aslan",                         division: "Publication & Knowledge Center" },
  { no: 25, level: "ASIACERT", position: "Secretary – Publication & Knowledge Center",      name: "Dr. Wahida",                              division: "Publication & Knowledge Center" },
  { no: 26, level: "ASIACERT", position: "Chairman – Academic Mobility Center",             name: "Dr. Muhammad Hashim",                     division: "Academic Mobility Center" },
  { no: 27, level: "ASIACERT", position: "Secretary – Academic Mobility Center",            name: "Dr. Raja Haslinda",                       division: "Academic Mobility Center" },
  { no: 28, level: "ASIACERT", position: "Chairman – Competition Center",                   name: "Dr. Nifaosan",                            division: "Competition Center" },
  { no: 29, level: "ASIACERT", position: "Secretary – Competition Center",                  name: "Dr. Ryan",                                division: "Competition Center" },
  { no: 30, level: "ASIACERT", position: "Chairman – Community Engagement & SDGs Center",   name: "Prof. Dr. Indra Devi",                    division: "Community Engagement & SDGs Center" },
  { no: 31, level: "ASIACERT", position: "Secretary – Community Engagement & SDGs Center",  name: "Dr. Intan Fatimah Anwar",                 division: "Community Engagement & SDGs Center" },
  { no: 32, level: "ASIACERT", position: "Chairman – Quality Assurance & Accreditation Board", name: "Dr. Majo George",                     division: "Quality Assurance & Accreditation Board" },
  { no: 33, level: "ASIACERT", position: "Secretary – Quality Assurance & Accreditation Board", name: "DR. Mohammad Sahabuddin",             division: "Quality Assurance & Accreditation Board" },
  { no: 34, level: "ASIACERT", position: "Chairman – Digital Academy & AI Center",          name: "DR. Eko Cahyo Mayndarto, SE, M.Si, Ak",   division: "Digital Academy & AI Center" },
  { no: 35, level: "ASIACERT", position: "Secretary – Digital Academy & AI Center",         name: "Dr. Anwar Masatip, MMPAR",                division: "Digital Academy & AI Center" },
  { no: 36, level: "ASIACERT", position: "Chairman – Young Academician Network",            name: "Dr. Enos Julvirta, MMPAR",                division: "Young Academician Network" },
  { no: 37, level: "ASIACERT", position: "Secretary – Young Academician Network",           name: "Ikbar Pratama, SE, MAcc, PhD",            division: "Young Academician Network" },
  { no: 38, level: "ASIACERT", position: "Chairman – Awards & Recognition Council",         name: "Prof. Dr. Ram Al Jafri bin Saad",         division: "Awards & Recognition Council" },
  { no: 39, level: "ASIACERT", position: "Secretary – Awards & Recognition Council",        name: "Dr. Ellen Puspitasasi, SE, M.Si",         division: "Awards & Recognition Council" },
];

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Executive Board":    { bg: "rgba(201,168,76,0.12)", text: "#c9a84c",  border: "rgba(201,168,76,0.5)" },
  "Vice Presidents":    { bg: "rgba(139,92,246,0.08)", text: "#a78bfa",  border: "rgba(139,92,246,0.4)" },
  "Secretariat":        { bg: "rgba(52,211,153,0.08)", text: "#6ee7b7",  border: "rgba(52,211,153,0.4)" },
  "Directors":          { bg: "rgba(56,189,248,0.08)", text: "#7dd3fc",  border: "rgba(56,189,248,0.4)" },
  "Publication":        { bg: "rgba(251,146,60,0.08)", text: "#fdba74",  border: "rgba(251,146,60,0.4)" },
  "ASIACERT":           { bg: "rgba(244,114,182,0.10)", text: "#f9a8d4", border: "rgba(244,114,182,0.5)" },
  "Membership":         { bg: "rgba(99,102,241,0.08)",  text: "#818cf8", border: "rgba(99,102,241,0.4)" },
  "Strategic Bodies":   { bg: "rgba(20,184,166,0.08)",  text: "#5eead4", border: "rgba(20,184,166,0.4)" },
  "Certification Field":{ bg: "rgba(167,139,250,0.08)", text: "#c4b5fd", border: "rgba(167,139,250,0.4)" },
};

const LEVELS = Array.from(new Set(ORG_STRUCTURE.map(m => m.level)));

export default function OrganizationStructurePage() {
  const [activeLevel, setActiveLevel] = useState<string>("All");

  const filtered = activeLevel === "All"
    ? ORG_STRUCTURE
    : ORG_STRUCTURE.filter(m => m.level === activeLevel);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#05050a",
      color: "#e8e8f0",
      paddingTop: "110px",
      paddingBottom: "80px",
      position: "relative",
    }}>
      {/* BG glow */}
      <div style={{ position:"absolute", top:0, left:"20%", width:"500px", height:"500px", background:"#c9a84c", borderRadius:"50%", filter:"blur(160px)", opacity:0.06, pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:0, right:"10%", width:"400px", height:"400px", background:"#7c3aed", borderRadius:"50%", filter:"blur(140px)", opacity:0.05, pointerEvents:"none" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Back */}
        <Link href="/">
          <div style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", width:"fit-content", marginBottom:"40px" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"50%", border:"2px solid #c9a84c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9a84c" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </div>
            <span style={{ color:"#9ca3af", fontWeight:600, fontSize:"14px" }}>Back to Home</span>
          </div>
        </Link>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <p style={{ color:"#c9a84c", fontSize:"12px", fontWeight:700, letterSpacing:"4px", textTransform:"uppercase", marginBottom:"12px" }}>
            Association of Asia Pacific Academician
          </p>
          <h1 style={{ fontSize:"clamp(26px, 4vw, 42px)", fontWeight:800 }}>
            Organizational <span style={{ color:"#c9a84c" }}>Structure</span>
          </h1>
          <div style={{ width:"72px", height:"2px", background:"linear-gradient(to right, transparent, #c9a84c, transparent)", margin:"18px auto 0" }} />
          <p style={{ color:"#6b7280", fontSize:"13px", marginTop:"14px", maxWidth:"560px", margin:"14px auto 0" }}>
            Complete roster of positions in the Association of Asia Pacific Academician (ASIA). Data is managed by administrators.
          </p>
        </div>

        {/* Organization Chart Image */}
        <div style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto 48px",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/APASIFIC.jpg" 
            alt="Organization Structure Chart" 
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{ 
              width: "100%", 
              height: "auto", 
              display: "block",
              pointerEvents: "none", // Prevents click-and-drag and most right clicks
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTouchCallout: "none" // Prevents long press on iOS
            }} 
          />
        </div>

        {/* Stats row */}
        <div style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap", marginBottom:"36px" }}>
          {[
            { label: "Total Positions", value: ORG_STRUCTURE.length },
            { label: "Filled", value: ORG_STRUCTURE.filter(m => m.name).length },
            { label: "Vacant", value: ORG_STRUCTURE.filter(m => !m.name).length },
            { label: "Divisions", value: LEVELS.length },
          ].map((s, i) => (
            <div key={i} style={{
              padding:"14px 24px",
              background:"rgba(201,168,76,0.05)",
              border:"1px solid rgba(201,168,76,0.2)",
              borderRadius:"12px",
              textAlign:"center",
              minWidth:"120px",
            }}>
              <div style={{ fontSize:"24px", fontWeight:800, color:"#c9a84c" }}>{s.value}</div>
              <div style={{ fontSize:"11px", color:"#9ca3af", textTransform:"uppercase", letterSpacing:"1px", marginTop:"4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"28px", justifyContent:"center" }}>
          {["All", ...LEVELS].map(lvl => {
            const active = activeLevel === lvl;
            const colors = lvl !== "All" ? LEVEL_COLORS[lvl] : { bg: "rgba(201,168,76,0.1)", text: "#c9a84c", border: "rgba(201,168,76,0.4)" };
            return (
              <button key={lvl} onClick={() => setActiveLevel(lvl)} style={{
                padding:"7px 16px",
                borderRadius:"20px",
                border: active ? `1.5px solid ${colors.border}` : "1px solid rgba(255,255,255,0.08)",
                background: active ? colors.bg : "rgba(255,255,255,0.03)",
                color: active ? colors.text : "#6b7280",
                fontSize:"12px",
                fontWeight: active ? 700 : 500,
                cursor:"pointer",
                transition:"all 0.2s",
                letterSpacing:"0.5px",
              }}>
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Table */}
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
            gridTemplateColumns:"48px 120px 1fr 1fr 1fr",
            padding:"14px 24px",
            borderBottom:"1px solid rgba(201,168,76,0.15)",
            background:"rgba(201,168,76,0.06)",
          }}>
            {["No.", "Level", "Position / Jabatan", "Name", "Division / Bidang"].map((h, i) => (
              <div key={i} style={{ fontSize:"11px", fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:"1.5px" }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((m, i) => {
            const colors = LEVEL_COLORS[m.level];
            const isEven = i % 2 === 0;
            return (
              <div key={m.no} style={{
                display:"grid",
                gridTemplateColumns:"48px 120px 1fr 1fr 1fr",
                padding:"14px 24px",
                borderBottom:"1px solid rgba(255,255,255,0.04)",
                background: isEven ? "transparent" : "rgba(255,255,255,0.015)",
                alignItems:"center",
                transition:"background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = isEven ? "transparent" : "rgba(255,255,255,0.015)")}
              >
                {/* No */}
                <div style={{ fontSize:"13px", color:"#4b5563", fontWeight:600 }}>{String(m.no).padStart(2, "0")}</div>

                {/* Level badge */}
                <div>
                  <span style={{
                    fontSize:"10px",
                    fontWeight:700,
                    color: colors.text,
                    background: colors.bg,
                    border:`1px solid ${colors.border}`,
                    borderRadius:"20px",
                    padding:"3px 9px",
                    whiteSpace:"nowrap",
                    letterSpacing:"0.5px",
                  }}>
                    {m.level}
                  </span>
                </div>

                {/* Position */}
                <div style={{ fontSize:"13px", fontWeight:600, color:"#e8e8f0", lineHeight:1.3 }}>
                  {m.position}
                </div>

                {/* Name */}
                <div style={{
                  fontSize:"13px",
                  color: m.name ? "#e8e8f0" : "#4b5563",
                  fontStyle: m.name ? "normal" : "italic",
                  lineHeight:1.3,
                }}>
                  {m.name || "— To Be Appointed —"}
                </div>

                {/* Division */}
                <div style={{ fontSize:"12px", color:"#6b7280", lineHeight:1.4 }}>
                  {m.division}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop:"32px",
          padding:"16px 22px",
          border:"1px solid rgba(201,168,76,0.15)",
          borderRadius:"12px",
          background:"rgba(201,168,76,0.04)",
          display:"flex",
          alignItems:"center",
          gap:"12px",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" style={{ flexShrink:0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ color:"#9ca3af", fontSize:"12px", lineHeight:1.5, margin:0 }}>
            This table reflects the complete official structure of <strong style={{ color:"#c9a84c" }}>ASIA</strong>. 
            Names and photos for vacant positions will be updated as appointments are finalized. 
            Administrators can manage this data via the Admin Dashboard.
          </p>
        </div>

      </div>
    </div>
  );
}
