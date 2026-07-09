"use client";

import React from 'react';
import Link from 'next/link';

/* ── NODE STYLES ──────────────────────────────────────────────── */
const NodeBox = ({
  title,
  level = "default",
}: {
  title: string;
  level?: "founder" | "president" | "vp" | "default";
}) => {
  const sizeMap: Record<string, string> = {
    founder: "80px",
    president: "72px",
    vp: "60px",
    default: "52px",
  };
  const borderMap: Record<string, string> = {
    founder: "rgba(201,168,76,1)",
    president: "rgba(201,168,76,0.8)",
    vp: "rgba(201,168,76,0.5)",
    default: "rgba(201,168,76,0.3)",
  };
  const bgMap: Record<string, string> = {
    founder: "rgba(201,168,76,0.08)",
    president: "rgba(201,168,76,0.06)",
    vp: "rgba(13,13,26,0.9)",
    default: "rgba(13,13,26,0.85)",
  };

  const photoSize = sizeMap[level];
  const borderColor = borderMap[level];
  const bg = bgMap[level];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      padding: "18px 14px",
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: "14px",
      width: "160px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      transition: "all 0.3s ease",
      cursor: "default",
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      {/* Title */}
      <div style={{
        fontSize: "11px",
        fontWeight: 700,
        color: "#c9a84c",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        lineHeight: 1.3,
        textAlign: "center",
      }}>
        {title}
      </div>
      {/* Name placeholder */}
      <div style={{
        fontSize: "12px",
        color: "rgba(232,232,240,0.35)",
        lineHeight: 1.3,
        textAlign: "center",
        fontStyle: "italic",
      }}>
        —
      </div>
    </div>
  );
};

/* ── CONNECTOR LINE ───────────────────────────────────────────── */
const VLine = ({ height = 32 }: { height?: number }) => (
  <div style={{
    width: "2px",
    height: `${height}px`,
    background: "rgba(201,168,76,0.35)",
    margin: "0 auto",
  }} />
);

const HLine = ({ width }: { width: number }) => (
  <div style={{
    width: `${width}px`,
    height: "2px",
    background: "rgba(201,168,76,0.35)",
  }} />
);

/* ── ROW OF NODES WITH T-CONNECTOR ───────────────────────────── */
const NodeRow = ({
  nodes,
  level = "default",
}: {
  nodes: string[];
  level?: "founder" | "president" | "vp" | "default";
}) => {
  const gap = 16; // gap between nodes
  const nodeWidth = 160;
  const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * gap;

  if (nodes.length === 1) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <VLine />
        <NodeBox title={nodes[0]} level={level} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <VLine />
      {/* Horizontal bar */}
      <HLine width={totalWidth} />
      {/* Drop lines + nodes */}
      <div style={{ display: "flex", gap: `${gap}px` }}>
        {nodes.map((title, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VLine height={20} />
            <NodeBox title={title} level={level} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── VP SECTION: VP node + its children in a compact column ──── */
const VPSection = ({
  vpTitle,
  children,
}: {
  vpTitle: string;
  children?: string[];
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <NodeBox title={vpTitle} level="vp" />
    {children && children.length > 0 && (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {children.map((child, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VLine height={20} />
            <NodeBox title={child} level="default" />
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ── MAIN PAGE ────────────────────────────────────────────────── */
export default function OrganizationStructurePage() {
  // VP definitions: title + sub-positions
  const vpList = [
    {
      vp: "VP Publication",
      children: ["Editor in Chief", "Managing Editor", "Editorial Board", "Reviewer Board", "Publication Director"],
    },
    {
      vp: "VP Certification",
      children: ["Chairman of Certification", "Examination Board", "Interview Board", "Certification Assessors", "Certification Admin"],
    },
    { vp: "VP Membership", children: [] },
    { vp: "VP Research", children: [] },
    { vp: "VP Conference", children: [] },
    { vp: "VP International Affairs", children: [] },
    { vp: "VP Digital Platform", children: [] },
    { vp: "VP Finance", children: [] },
    { vp: "VP Administration", children: [] },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05050a",
        color: "#e8e8f0",
        paddingTop: "110px",
        paddingBottom: "80px",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: 0, left: "20%",
        width: "400px", height: "400px",
        background: "#c9a84c",
        borderRadius: "50%",
        filter: "blur(128px)",
        opacity: 0.07,
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute", bottom: 0, right: "20%",
        width: "400px", height: "400px",
        background: "#c9a84c",
        borderRadius: "50%",
        filter: "blur(128px)",
        opacity: 0.07,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Back button */}
        <Link href="/">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", width: "fit-content", marginBottom: "40px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: "2px solid #c9a84c",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#c9a84c",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </div>
            <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: "14px" }}>Back to Home</span>
          </div>
        </Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p style={{ color: "#c9a84c", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
            Association of Asia Pacific Academician
          </p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
            Organizational <span style={{ color: "#c9a84c" }}>Structure</span>
          </h1>
          <div style={{ width: "80px", height: "2px", background: "linear-gradient(to right, transparent, #c9a84c, transparent)", margin: "20px auto 0" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "16px" }}>
            Names and photos can be updated from the Admin Dashboard → Leadership
          </p>
        </div>

        {/* ── CHART ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Level 1: Founder */}
          <NodeBox title="Founder" level="founder" />
          <VLine />

          {/* Level 2: Co-Founder */}
          <NodeBox title="Co-Founder" level="founder" />
          <VLine />

          {/* Level 3: Board of Advisors */}
          <NodeBox title="Board of Advisors" level="president" />
          <VLine />

          {/* Level 4: President */}
          <NodeBox title="President" level="president" />
          <VLine />

          {/* Level 5: Secretary General + Treasurer side by side */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Secretary General row */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "0" }}>
              <NodeBox title="Secretary General" level="vp" />
              <div style={{ width: "60px", height: "2px", background: "rgba(201,168,76,0.3)" }} />
              <NodeBox title="Treasurer" level="vp" />
            </div>
            <VLine />
          </div>

          {/* Level 6: VP Grid — 3 columns × 3 rows */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 160px)",
            gap: "32px 20px",
            justifyContent: "center",
            marginBottom: "40px",
          }}>
            {vpList.map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Drop line from "roof" */}
                <NodeBox title={item.vp} level="vp" />
                {/* Sub-positions as a vertical stack below each VP */}
                {item.children.map((child, j) => (
                  <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <VLine height={16} />
                    <NodeBox title={child} level="default" />
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
        {/* ── END CHART ─────────────────────────────────────── */}

        {/* Footer note */}
        <div style={{
          marginTop: "40px",
          padding: "20px 28px",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "12px",
          background: "rgba(201,168,76,0.04)",
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          maxWidth: "600px",
          margin: "40px auto 0",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: "2px" }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
            This organizational chart reflects the official structure of the <strong style={{ color: "#c9a84c" }}>Association of Asia Pacific Academician (ASIA)</strong>. Names, photos, and details are managed by administrators and will be updated as positions are filled.
          </p>
        </div>

      </div>
    </div>
  );
}
