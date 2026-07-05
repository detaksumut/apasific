"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  "Published": { label: "Published", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", dot: "#34d399" },
  "Under Review": { label: "Under Review", color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)", dot: "#60a5fa" },
  "Awaiting Assignment": { label: "Awaiting", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", dot: "#f59e0b" },
  "Rejected": { label: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", dot: "#f87171" },
};

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const defaultSubs = [
      { id: "1045", title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education", journal: "APASIFIC IAEP", date: "July 01, 2026", status: "Under Review", lastAction: "Sent to Reviewers on July 03, 2026" },
      { id: "1022", title: "Analyzing Regional Economic Policies Post-Pandemic in ASEAN", journal: "RJRAKP", date: "May 15, 2026", status: "Published", lastAction: "Published in Vol. 4 No. 2 (2026)" },
      { id: "1056", title: "Blockchain Integration in Academic Credential Verification", journal: "APASIFIC IAEP", date: "July 04, 2026", status: "Awaiting Assignment", lastAction: "Submitted successfully" },
    ];
    const stored = localStorage.getItem("mock_submissions");
    if (stored) {
      setSubmissions(JSON.parse(stored));
    } else {
      localStorage.setItem("mock_submissions", JSON.stringify(defaultSubs));
      setSubmissions(defaultSubs);
    }
  }, []);

  const filters = ["All", "Under Review", "Awaiting Assignment", "Published", "Rejected"];
  const filtered = filter === "All" ? submissions : submissions.filter(s => s.status === filter);

  return (
    <div className="subs-enterprise">
      {/* Header */}
      <div className="subs-header">
        <div>
          <h1 className="subs-title">My Submissions</h1>
          <p className="subs-subtitle">Track the status of your submitted manuscripts.</p>
        </div>
        <Link href="/dashboard/submit" className="subs-new-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Submission
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="subs-stats-row">
        {[
          { label: "Total", value: submissions.length, color: "#c9a84c" },
          { label: "Under Review", value: submissions.filter(s => s.status === "Under Review").length, color: "#60a5fa" },
          { label: "Published", value: submissions.filter(s => s.status === "Published").length, color: "#34d399" },
          { label: "Awaiting", value: submissions.filter(s => s.status === "Awaiting Assignment").length, color: "#f59e0b" },
        ].map(stat => (
          <div key={stat.label} className="subs-stat" style={{ "--c": stat.color } as React.CSSProperties}>
            <div className="subs-stat-value">{stat.value}</div>
            <div className="subs-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="subs-filters">
        {filters.map(f => (
          <button
            key={f}
            className={`subs-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f !== "All" && (
              <span className="subs-filter-count">
                {submissions.filter(s => s.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="subs-table-wrap">
        {filtered.length === 0 ? (
          <div className="subs-empty">
            <div className="subs-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            </div>
            <div className="subs-empty-title">No submissions found</div>
            <div className="subs-empty-desc">
              {filter === "All"
                ? "You haven't submitted any manuscripts yet."
                : `No manuscripts with status "${filter}".`}
            </div>
          </div>
        ) : (
          <table className="subs-table">
            <thead>
              <tr className="subs-thead-row">
                <th>ID</th>
                <th>Manuscript</th>
                <th>Journal</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => {
                const statusCfg = statusConfig[sub.status] || statusConfig["Awaiting Assignment"];
                return (
                  <tr key={sub.id} className="subs-row">
                    <td>
                      <span className="subs-id">#{sub.id}</span>
                    </td>
                    <td className="subs-title-cell">
                      <div className="subs-ms-title">{sub.title}</div>
                      <div className="subs-ms-action">{sub.lastAction}</div>
                    </td>
                    <td>
                      <span className="subs-journal">{sub.journal}</span>
                    </td>
                    <td>
                      <span className="subs-date">{sub.date}</span>
                    </td>
                    <td>
                      <span
                        className="subs-status-badge"
                        style={{
                          color: statusCfg.color,
                          background: statusCfg.bg,
                          borderColor: statusCfg.border,
                        }}
                      >
                        <span className="subs-status-dot" style={{ background: statusCfg.dot }} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="subs-view-btn">View Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .subs-enterprise {
          max-width: 1100px;
          margin: 0 auto;
          padding-bottom: 60px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Header */
        .subs-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .subs-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0 0 4px;
        }
        .subs-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }
        :global(.subs-new-btn) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #c9a84c 0%, #a07828 100%);
          color: #000;
          font-size: 13px;
          font-weight: 700;
          border-radius: 10px;
          text-decoration: none;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(201,168,76,0.2);
          transition: all 0.2s;
        }
        :global(.subs-new-btn:hover) {
          box-shadow: 0 6px 24px rgba(201,168,76,0.35);
          transform: translateY(-1px);
        }
        :global(.subs-new-btn svg) { width: 15px; height: 15px; }

        /* Stats Row */
        .subs-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 600px) { .subs-stats-row { grid-template-columns: repeat(2, 1fr); } }
        .subs-stat {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          border-top: 2px solid var(--c, #c9a84c);
        }
        .subs-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: var(--c, #c9a84c);
          line-height: 1;
          margin-bottom: 6px;
        }
        .subs-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        /* Filters */
        .subs-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .subs-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.4);
          transition: all 0.18s;
        }
        .subs-filter-btn:hover {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.05);
        }
        .subs-filter-btn.active {
          border-color: rgba(201,168,76,0.35);
          background: rgba(201,168,76,0.08);
          color: #c9a84c;
        }
        .subs-filter-count {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4);
          font-weight: 700;
        }
        .subs-filter-btn.active .subs-filter-count {
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
        }

        /* Table */
        .subs-table-wrap {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .subs-table {
          width: 100%;
          border-collapse: collapse;
        }
        .subs-thead-row th {
          padding: 13px 18px;
          font-size: 10.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: left;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          white-space: nowrap;
        }
        .subs-row {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .subs-row:last-child { border-bottom: none; }
        .subs-row:hover { background: rgba(255,255,255,0.025); }
        .subs-row td {
          padding: 16px 18px;
          vertical-align: middle;
        }
        .subs-id {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.2);
          font-family: monospace;
          white-space: nowrap;
        }
        .subs-title-cell { min-width: 280px; }
        .subs-ms-title {
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          margin-bottom: 4px;
          line-height: 1.4;
        }
        .subs-ms-action {
          font-size: 11.5px;
          color: rgba(255,255,255,0.25);
        }
        .subs-journal {
          font-size: 12px;
          font-weight: 600;
          color: #c9a84c;
          white-space: nowrap;
        }
        .subs-date {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          white-space: nowrap;
        }
        .subs-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 20px;
          border: 1px solid;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }
        .subs-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .subs-view-btn {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.2);
          background: rgba(201,168,76,0.06);
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .subs-view-btn:hover {
          background: rgba(201,168,76,0.12);
          border-color: rgba(201,168,76,0.35);
        }

        /* Empty */
        .subs-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }
        .subs-empty-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .subs-empty-icon svg { width: 28px; height: 28px; color: rgba(255,255,255,0.2); }
        .subs-empty-title {
          font-size: 16px;
          font-weight: 700;
          color: rgba(255,255,255,0.55);
          margin-bottom: 6px;
        }
        .subs-empty-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  );
}
