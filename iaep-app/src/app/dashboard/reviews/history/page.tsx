"use client";

import { useState } from "react";

const decisionConfig: Record<string, { color: string; bg: string; border: string }> = {
  "Accept with Minor Revisions": { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  "Major Revisions Required": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  "Reject": { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  "Accept": { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  "Resubmit for Review": { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
};

export default function ReviewHistory() {
  const [history] = useState([
    {
      id: "REV-2026-001",
      title: "Analyzing Regional Economic Policies Post-Pandemic in ASEAN",
      journal: "RJRAKP",
      dateCompleted: "May 20, 2026",
      decision: "Accept with Minor Revisions",
      articleLevel: "S3 (Doktor / Profesor)",
      honorarium: "Rp 500.000",
      honorariumRaw: 500000,
      status: "Paid",
    },
    {
      id: "REV-2026-042",
      title: "Machine Learning Models for Predicting Inflation Rates",
      journal: "APASIFIC IAEP",
      dateCompleted: "June 15, 2026",
      decision: "Major Revisions Required",
      articleLevel: "Mahasiswa (Belum Lulus S1)",
      honorarium: "Rp 250.000",
      honorariumRaw: 250000,
      status: "Pending Payment",
    },
    {
      id: "REV-2026-088",
      title: "The Efficacy of Remote Work on Corporate Productivity in Southeast Asia",
      journal: "RJRAKP",
      dateCompleted: "July 02, 2026",
      decision: "Reject",
      articleLevel: "S1 (Sarjana / Menulis untuk S2)",
      honorarium: "Rp 350.000",
      honorariumRaw: 350000,
      status: "Pending Payment",
    },
  ]);

  const totalEarned = history.filter(h => h.status === "Paid").reduce((s, h) => s + h.honorariumRaw, 0);
  const totalPending = history.filter(h => h.status !== "Paid").reduce((s, h) => s + h.honorariumRaw, 0);

  return (
    <div className="hist-enterprise">
      {/* Header */}
      <div className="hist-header">
        <div>
          <h1 className="hist-title">Review History</h1>
          <p className="hist-subtitle">Your completed reviews and honorarium records.</p>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="hist-earnings-row">
        <div className="hist-earn-card total">
          <div className="hist-earn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div>
            <div className="hist-earn-label">Total Reviews</div>
            <div className="hist-earn-value">{history.length}</div>
            <div className="hist-earn-sub">completed reviews</div>
          </div>
        </div>
        <div className="hist-earn-card paid">
          <div className="hist-earn-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="hist-earn-label">Paid Out</div>
            <div className="hist-earn-value green">Rp {totalEarned.toLocaleString("id-ID")}</div>
            <div className="hist-earn-sub">total received</div>
          </div>
        </div>
        <div className="hist-earn-card pending-pay">
          <div className="hist-earn-icon amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="hist-earn-label">Pending</div>
            <div className="hist-earn-value amber">Rp {totalPending.toLocaleString("id-ID")}</div>
            <div className="hist-earn-sub">awaiting payment</div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="hist-table-wrap">
        {history.length === 0 ? (
          <div className="hist-empty">
            <div className="hist-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <div className="hist-empty-title">No reviews completed yet</div>
            <div className="hist-empty-desc">Your review history and honorarium details will appear here.</div>
          </div>
        ) : (
          <table className="hist-table">
            <thead>
              <tr className="hist-thead-row">
                <th>Article Details</th>
                <th>Journal & Date</th>
                <th>Level</th>
                <th>Decision</th>
                <th style={{ textAlign: "right" }}>Honorarium</th>
              </tr>
            </thead>
            <tbody>
              {history.map(rev => {
                const dec = decisionConfig[rev.decision] || decisionConfig["Reject"];
                const levelColor = rev.articleLevel.includes("S3") ? { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.15)" }
                  : rev.articleLevel.includes("S2") ? { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.15)" }
                  : { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" };
                return (
                  <tr key={rev.id} className="hist-row">
                    <td className="hist-td-article">
                      <div className="hist-article-title">{rev.title}</div>
                      <div className="hist-article-id">{rev.id}</div>
                    </td>
                    <td>
                      <div className="hist-journal">{rev.journal}</div>
                      <div className="hist-date">Completed {rev.dateCompleted}</div>
                    </td>
                    <td>
                      <span
                        className="hist-level-badge"
                        style={{ color: levelColor.color, background: levelColor.bg, borderColor: levelColor.border }}
                      >
                        {rev.articleLevel.split(" ")[0]}
                      </span>
                      <div className="hist-level-detail">{rev.articleLevel.slice(rev.articleLevel.indexOf(" ") + 1)}</div>
                    </td>
                    <td>
                      <span
                        className="hist-decision-badge"
                        style={{ color: dec.color, background: dec.bg, borderColor: dec.border }}
                      >
                        {rev.decision}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="hist-amount">{rev.honorarium}</div>
                      <span className={`hist-pay-status ${rev.status === "Paid" ? "paid" : "pending"}`}>
                        {rev.status === "Paid" ? "✓ " : "⏳ "}{rev.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .hist-enterprise {
          max-width: 1100px;
          margin: 0 auto;
          padding-bottom: 60px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* Header */
        .hist-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .hist-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0 0 5px;
        }
        .hist-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }

        /* Earnings */
        .hist-earnings-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media (max-width: 700px) { .hist-earnings-row { grid-template-columns: 1fr; } }
        .hist-earn-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
        }
        .hist-earn-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: rgba(201,168,76,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #c9a84c;
        }
        .hist-earn-icon svg { width: 18px; height: 18px; }
        .hist-earn-icon.green { background: rgba(52,211,153,0.1); color: #34d399; }
        .hist-earn-icon.amber { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .hist-earn-label {
          font-size: 10.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .hist-earn-value {
          font-size: 20px;
          font-weight: 800;
          color: #f0f0f8;
          line-height: 1;
          margin-bottom: 4px;
        }
        .hist-earn-value.green { color: #34d399; }
        .hist-earn-value.amber { color: #f59e0b; }
        .hist-earn-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
        }

        /* Table */
        .hist-table-wrap {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
        }
        .hist-table {
          width: 100%;
          border-collapse: collapse;
        }
        .hist-thead-row th {
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
        .hist-row {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .hist-row:last-child { border-bottom: none; }
        .hist-row:hover { background: rgba(255,255,255,0.02); }
        .hist-row td { padding: 18px; vertical-align: middle; }
        .hist-td-article { min-width: 260px; }
        .hist-article-title {
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          margin-bottom: 5px;
          line-height: 1.4;
        }
        .hist-article-id {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          font-family: monospace;
        }
        .hist-journal {
          font-size: 12.5px;
          font-weight: 600;
          color: #c9a84c;
          margin-bottom: 3px;
        }
        .hist-date {
          font-size: 11.5px;
          color: rgba(255,255,255,0.3);
        }
        .hist-level-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .hist-level-detail {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          line-height: 1.4;
        }
        .hist-decision-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
        }
        .hist-amount {
          font-size: 16px;
          font-weight: 800;
          color: #c9a84c;
          margin-bottom: 4px;
        }
        .hist-pay-status {
          font-size: 11px;
          font-weight: 700;
        }
        .hist-pay-status.paid { color: #34d399; }
        .hist-pay-status.pending { color: #f59e0b; }

        /* Empty */
        .hist-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }
        .hist-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .hist-empty-icon svg { width: 26px; height: 26px; color: rgba(255,255,255,0.2); }
        .hist-empty-title { font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
        .hist-empty-desc { font-size: 13px; color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}
