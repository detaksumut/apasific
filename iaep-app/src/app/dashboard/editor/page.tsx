"use client";

import { useState } from "react";
import Link from "next/link";

export default function EditorDashboard() {
  const [activeTab, setActiveTab] = useState("unassigned");

  const manuscripts = [
    { id: 1045, title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education", author: "Jane Doe",      dateSubmitted: "2026-07-01", stage: "unassigned",  daysInStage: 3  },
    { id: 1089, title: "Sustainable Development Goals in Pacific Island Nations: A Policy Analysis",  author: "Robert Smith", dateSubmitted: "2026-06-25", stage: "in_review",   daysInStage: 10 },
    { id: 1092, title: "Economic Resilience in ASEAN during the Post-Pandemic Era",                  author: "Ahmad Ibrahim",dateSubmitted: "2026-06-15", stage: "copyediting", daysInStage: 5  },
  ];

  const tabs = [
    { id: "unassigned",  label: "Belum Ditugaskan",  count: 1 },
    { id: "in_review",   label: "Dalam Tinjauan",   count: 1 },
    { id: "copyediting", label: "Penyuntingan Naskah", count: 1 },
    { id: "production",  label: "Produksi",  count: 0 },
  ];

  const filtered = manuscripts.filter(m => m.stage === activeTab);

  const stageColor: Record<string, string> = {
    unassigned:  "#f59e0b",
    in_review:   "#4285f4",
    copyediting: "#a3c94c",
    production:  "#34a853",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff", margin: "0 0 5px" }}>
          Dewan <span style={{ color: "#c9a84c" }}>Editorial</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
          Kelola dan pantau naskah di setiap tahap penerbitan.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {tabs.map(t => (
          <div key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? "rgba(201,168,76,0.1)" : "#13131f",
              border: `1px solid ${activeTab === t.id ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.18s",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: stageColor[t.id], fontFamily: "system-ui" }}>{t.count}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>

        {/* Tab row */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "13px 16px", fontSize: 13, fontWeight: 600,
              color: activeTab === tab.id ? "#c9a84c" : "rgba(255,255,255,0.35)",
              background: activeTab === tab.id ? "rgba(201,168,76,0.07)" : "transparent",
              borderBottom: activeTab === tab.id ? "2px solid #c9a84c" : "2px solid transparent",
              border: "none", cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap",
            }}>
              {tab.label}
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 700,
                background: activeTab === tab.id ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.08)",
                color: activeTab === tab.id ? "#c9a84c" : "rgba(255,255,255,0.3)",
                padding: "2px 7px", borderRadius: 20,
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Table content */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["ID", "Judul & Penulis", "Tanggal Submit", "Hari di Tahap", "Aksi"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textAlign: h === "Aksi" ? "right" : "left" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  Tidak ada naskah di tahap ini.
                </td>
              </tr>
            ) : filtered.map(m => (
              <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>#{m.id}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Oleh: {m.author}</div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{m.dateSubmitted}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: m.daysInStage > 7 ? "rgba(239,68,68,0.15)" : "rgba(52,168,83,0.15)",
                    color: m.daysInStage > 7 ? "#f87171" : "#4ade80",
                  }}>
                    {m.daysInStage} hari
                  </span>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <Link href={`/dashboard/editor/submissions/${m.id}`} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                    background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)",
                    color: "#c9a84c", textDecoration: "none", transition: "all 0.2s",
                  }}>
                    Kelola →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
