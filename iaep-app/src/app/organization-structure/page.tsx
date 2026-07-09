"use client";

import React from 'react';
import Link from 'next/link';

/* ── NODE BOX ──────────────────────────────────────────────────── */
const NodeBox = ({
  title,
  level = "default",
  dashed = false,
}: {
  title: string;
  level?: "founder" | "cofounder" | "president" | "vp" | "default";
  dashed?: boolean;
}) => {
  const sizeMap: Record<string, string> = {
    founder: "76px",
    cofounder: "68px",
    president: "68px",
    vp: "56px",
    default: "48px",
  };
  const borderColorMap: Record<string, string> = {
    founder: "#c9a84c",
    cofounder: "rgba(100,180,255,0.8)",
    president: "rgba(201,168,76,0.8)",
    vp: "rgba(201,168,76,0.5)",
    default: "rgba(201,168,76,0.3)",
  };
  const bgMap: Record<string, string> = {
    founder: "rgba(201,168,76,0.08)",
    cofounder: "rgba(100,180,255,0.06)",
    president: "rgba(201,168,76,0.06)",
    vp: "rgba(13,13,26,0.9)",
    default: "rgba(13,13,26,0.85)",
  };
  const titleColorMap: Record<string, string> = {
    founder: "#c9a84c",
    cofounder: "rgba(130,200,255,0.9)",
    president: "#c9a84c",
    vp: "#c9a84c",
    default: "rgba(201,168,76,0.75)",
  };

  const photoSize = sizeMap[level];
  const borderColor = borderColorMap[level];
  const bg = bgMap[level];
  const titleColor = titleColorMap[level];
  const borderStyle = dashed ? `2px dashed ${borderColor}` : `1px solid ${borderColor}`;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      padding: "16px 12px",
      background: bg,
      border: borderStyle,
      borderRadius: "14px",
      width: "160px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      transition: "all 0.3s ease",
      flexShrink: 0,
    }}>
      {/* Photo circle */}
      <div style={{
        width: photoSize,
        height: photoSize,
        borderRadius: "50%",
        border: `2px solid ${borderColor}`,
        background: "#0a0a14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={`${borderColor}80`} strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      {/* Title */}
      <div style={{
        fontSize: "10.5px",
        fontWeight: 700,
        color: titleColor,
        textTransform: "uppercase",
        letterSpacing: "0.7px",
        lineHeight: 1.3,
        textAlign: "center",
      }}>
        {title}
      </div>
      {/* Name placeholder */}
      <div style={{
        fontSize: "11px",
        color: "rgba(232,232,240,0.3)",
        lineHeight: 1.3,
        textAlign: "center",
        fontStyle: "italic",
      }}>
        —
      </div>
    </div>
  );
};

/* ── CONNECTORS ────────────────────────────────────────────────── */
const VLine = ({ height = 32, color = "rgba(201,168,76,0.35)", dashed = false }: {
  height?: number; color?: string; dashed?: boolean;
}) => (
  <div style={{
    width: "2px",
    height: `${height}px`,
    background: dashed ? "none" : color,
    backgroundImage: dashed ? `repeating-linear-gradient(to bottom, ${color} 0, ${color} 6px, transparent 6px, transparent 12px)` : "none",
    margin: "0 auto",
  }} />
);

const HLine = ({ width, color = "rgba(201,168,76,0.35)" }: { width: number; color?: string }) => (
  <div style={{
    width: `${width}px`,
    height: "2px",
    background: color,
    flexShrink: 0,
  }} />
);

/* ── MAIN PAGE ─────────────────────────────────────────────────── */
export default function OrganizationStructurePage() {
  const vpList = [
    // Row 1 — VPs with sub-divisions
    {
      vp: "VP Publication",
      children: ["Editor in Chief", "Managing Editor", "Editorial Board", "Reviewer Board", "Publication Director"],
    },
    {
      vp: "VP Certification",
      children: ["Chairman of Certification", "Examination Board", "Interview Board", "Certification Assessors", "Certification Admin"],
    },
    // "Spacer" — empty slot so row 1 only has 2 items and row 2 starts fresh
    // Row 2 — VPs without sub-divisions
    { vp: "VP Research",              children: [] },
    { vp: "VP Conference",            children: [] },
    { vp: "VP Membership",            children: [] },   // ← shifted to right column of row 2
    // Row 3
    { vp: "VP International Affairs", children: [] },
    { vp: "VP Finance",               children: [] },
    { vp: "VP Administration",        children: [] },
  ];


  const cofBlue = "rgba(100,180,255,0.6)";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#05050a",
      color: "#e8e8f0",
      paddingTop: "110px",
      paddingBottom: "80px",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Background glows */}
      <div style={{ position:"absolute", top:0, left:"20%", width:"400px", height:"400px", background:"#c9a84c", borderRadius:"50%", filter:"blur(128px)", opacity:0.07, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"absolute", bottom:0, right:"20%", width:"400px", height:"400px", background:"#6ab4ff", borderRadius:"50%", filter:"blur(128px)", opacity:0.05, pointerEvents:"none", zIndex:0 }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Back button */}
        <Link href="/">
          <div style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", width:"fit-content", marginBottom:"40px" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", border:"2px solid #c9a84c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9a84c" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </div>
            <span style={{ color:"#9ca3af", fontWeight:600, fontSize:"14px" }}>Back to Home</span>
          </div>
        </Link>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"60px" }}>
          <p style={{ color:"#c9a84c", fontSize:"13px", fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", marginBottom:"12px" }}>
            Association of Asia Pacific Academician
          </p>
          <h1 style={{ fontSize:"clamp(28px, 4vw, 44px)", fontWeight:800, letterSpacing:"-0.5px" }}>
            Organizational <span style={{ color:"#c9a84c" }}>Structure</span>
          </h1>
          <div style={{ width:"80px", height:"2px", background:"linear-gradient(to right, transparent, #c9a84c, transparent)", margin:"20px auto 0" }} />
          <p style={{ color:"#6b7280", fontSize:"13px", marginTop:"14px" }}>
            Names and photos can be updated from Admin Dashboard → Leadership
          </p>
        </div>

        {/* ════════════ CHART ════════════ */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>

          {/* ── Row 1: Founder ── Co-Founder (side by side) ──────── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
            {/* Founder (main chain) */}
            <NodeBox title="Founder" level="founder" />

            {/* Horizontal connector */}
            <HLine width={48} />

            {/* Co-Founder (IT branch — different color) */}
            <NodeBox title="Co-Founder" level="cofounder" dashed />
          </div>

          {/* ── Row 2: two vertical drops ──────────────────────────
              Left  → main chain (from Founder)
              Right → IT branch (from Co-Founder)              */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center", gap:"0" }}>

            {/* ─ MAIN CHAIN (centered column) ─ */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginRight:"80px" }}>
              <VLine />
              <NodeBox title="Board of Advisors" level="president" />
              <VLine />

              {/* Secretary General ─── President ─── Treasurer */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center" }}>
                {/* Secretary General on the left — aligned to top of President */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginTop:"60px" }}>
                  <NodeBox title="Secretary General" level="vp" />
                </div>
                <HLine width={24} />

                {/* President + VLine + VP Grid in center */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <NodeBox title="President" level="president" />
                  <VLine />

                  {/* ── Row A: 2 VPs with sub-divisions (side by side) */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 160px)",
                    gap: "28px 18px",
                    justifyContent: "center",
                    marginBottom: "28px",
                  }}>
                    {vpList.filter(v => v.children.length > 0).map((item, i) => (
                      <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <NodeBox title={item.vp} level="vp" />
                        {item.children.map((child, j) => (
                          <div key={j} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                            <VLine height={14} />
                            <NodeBox title={child} level="default" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* ── Row B: flat VPs (no sub-divisions), 3 cols */}
                  {/* Research | Conference | Membership(right) */}
                  {/* Int. Affairs | Finance | Administration */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 160px)",
                    gap: "18px 18px",
                    justifyContent: "center",
                  }}>
                    {vpList.filter(v => v.children.length === 0).map((item, i) => (
                      <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <NodeBox title={item.vp} level="vp" />
                      </div>
                    ))}
                  </div>

                </div>

                <HLine width={24} />
                {/* Treasurer on the right — aligned to top of President */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginTop:"60px" }}>
                  <NodeBox title="Treasurer" level="vp" />
                </div>
              </div>
            </div>


            {/* ─ CO-FOUNDER → IT BRANCH (right column) ─ */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"0" }}>
              <VLine height={40} color={cofBlue} dashed />
              {/* Label */}
              <div style={{
                fontSize:"10px",
                color: cofBlue,
                fontWeight:700,
                letterSpacing:"1px",
                textTransform:"uppercase",
                marginBottom:"8px",
                border: `1px dashed ${cofBlue}`,
                borderRadius:"20px",
                padding:"3px 10px",
                background:"rgba(100,180,255,0.05)",
              }}>
                Direct Line → IT
              </div>
              <VLine height={40} color={cofBlue} dashed />
              <NodeBox title="VP Digital Platform" level="vp" dashed />
            </div>

          </div>

        </div>
        {/* ════════════ END CHART ════════════ */}

        {/* Legend */}
        <div style={{ display:"flex", gap:"24px", justifyContent:"center", marginTop:"48px", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"24px", height:"2px", background:"#c9a84c" }} />
            <span style={{ color:"#9ca3af", fontSize:"12px" }}>Main reporting line</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"24px", height:"2px", backgroundImage:"repeating-linear-gradient(to right, rgba(100,180,255,0.6) 0, rgba(100,180,255,0.6) 6px, transparent 6px, transparent 12px)" }} />
            <span style={{ color:"#9ca3af", fontSize:"12px" }}>Co-Founder → Digital Platform (IT)</span>
          </div>
        </div>

        {/* Footer note */}
        <div style={{
          marginTop:"40px",
          padding:"18px 24px",
          border:"1px solid rgba(201,168,76,0.2)",
          borderRadius:"12px",
          background:"rgba(201,168,76,0.04)",
          display:"flex",
          alignItems:"flex-start",
          gap:"12px",
          maxWidth:"600px",
          margin:"40px auto 0",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" style={{ flexShrink:0, marginTop:"2px" }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ color:"#9ca3af", fontSize:"13px", lineHeight:1.6, margin:0 }}>
            This chart reflects the official structure of the <strong style={{ color:"#c9a84c" }}>Association of Asia Pacific Academician (ASIA)</strong>. Names and photos are managed by administrators and will appear once filled in the Admin Dashboard.
          </p>
        </div>

      </div>
    </div>
  );
}
