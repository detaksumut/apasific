"use client";

import Link from "next/link";

export default function PendingReviews() {
  const assignments = [
    {
      id: 1,
      submissionId: 1045,
      title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education",
      journal: "APASIFIC IAEP",
      round: 1,
      dateAssigned: "2026-07-02",
      dateDue: "2026-07-30",
      status: "pending",
    },
    {
      id: 2,
      submissionId: 1089,
      title: "Sustainable Development Goals in Pacific Island Nations: A Policy Analysis",
      journal: "RJRAKP",
      round: 2,
      dateAssigned: "2026-07-04",
      dateDue: "2026-08-01",
      status: "pending",
    },
    {
      id: 3,
      submissionId: 1103,
      title: "Digital Transformation in ASEAN Public Healthcare Systems Post-COVID",
      journal: "APASIFIC IAEP",
      round: 1,
      dateAssigned: "2026-07-05",
      dateDue: "2026-08-10",
      status: "pending",
    },
  ];

  const daysLeft = (due: string) => {
    return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
  };

  const urgentCount = assignments.filter(a => daysLeft(a.dateDue) <= 7).length;

  return (
    <div className="pend-enterprise">
      {/* Header */}
      <div className="pend-header">
        <div>
          <h1 className="pend-title">Pending Reviews</h1>
          <p className="pend-subtitle">Manuscripts assigned to you awaiting evaluation.</p>
        </div>
        <div className="pend-header-stats">
          <div className="pend-hstat" style={{ "--c": "#f59e0b" } as React.CSSProperties}>
            <div className="pend-hstat-val">{assignments.length}</div>
            <div className="pend-hstat-label">Assigned</div>
          </div>
          <div className="pend-hstat" style={{ "--c": "#f87171" } as React.CSSProperties}>
            <div className="pend-hstat-val">{urgentCount}</div>
            <div className="pend-hstat-label">Urgent</div>
          </div>
        </div>
      </div>

      {/* Urgent Banner */}
      {urgentCount > 0 && (
        <div className="pend-urgent-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
          </svg>
          <span><strong>{urgentCount} review{urgentCount > 1 ? "s" : ""}</strong> due within 7 days. Please complete them promptly.</span>
        </div>
      )}

      {/* Assignment Cards */}
      {assignments.length === 0 ? (
        <div className="pend-empty">
          <div className="pend-empty-icon">✅</div>
          <div className="pend-empty-title">All caught up!</div>
          <div className="pend-empty-desc">No pending reviews at this time. Great work!</div>
        </div>
      ) : (
        <div className="pend-cards">
          {assignments.map(a => {
            const left = daysLeft(a.dateDue);
            const urgent = left <= 7;
            const critical = left <= 3;
            return (
              <div key={a.id} className={`pend-card ${critical ? "critical" : urgent ? "urgent" : ""}`}>
                {/* Card Header */}
                <div className="pend-card-top">
                  <div className="pend-card-meta">
                    <span className="pend-card-id">#{a.submissionId}</span>
                    <span className="pend-card-journal">{a.journal}</span>
                    <span className="pend-card-round">Round {a.round}</span>
                  </div>
                  <div className={`pend-card-due ${critical ? "critical" : urgent ? "urgent" : ""}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {left > 0 ? `${left} days left` : "Overdue!"}
                  </div>
                </div>

                {/* Title */}
                <div className="pend-card-title">{a.title}</div>

                {/* Info Row */}
                <div className="pend-card-info">
                  <div className="pend-card-info-item">
                    <span className="pend-info-label">Assigned</span>
                    <span className="pend-info-val">{a.dateAssigned}</span>
                  </div>
                  <div className="pend-card-info-item">
                    <span className="pend-info-label">Due Date</span>
                    <span className="pend-info-val" style={urgent ? { color: "#f87171" } : {}}>
                      {a.dateDue}
                    </span>
                  </div>
                  <div className="pend-card-info-item">
                    <span className="pend-info-label">Status</span>
                    <span className="pend-status-dot-wrap">
                      <span className="pend-status-dot" />
                      Pending Evaluation
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pend-progress-wrap">
                  <div className="pend-progress-label">
                    <span>Review Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="pend-progress-track">
                    <div className="pend-progress-fill" style={{ width: "0%" }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="pend-card-actions">
                  <Link href={`/dashboard/reviews/${a.id}`} className="pend-start-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Start Review
                  </Link>
                  <button className="pend-decline-btn">Decline</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .pend-enterprise {
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 60px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* Header */
        .pend-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .pend-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0 0 5px;
        }
        .pend-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }
        .pend-header-stats {
          display: flex;
          gap: 12px;
        }
        .pend-hstat {
          text-align: center;
          padding: 14px 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          border-top: 2px solid var(--c, #f59e0b);
          min-width: 80px;
        }
        .pend-hstat-val {
          font-size: 26px;
          font-weight: 800;
          color: var(--c, #f59e0b);
          line-height: 1;
          margin-bottom: 4px;
        }
        .pend-hstat-label {
          font-size: 10.5px;
          color: rgba(255,255,255,0.3);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Urgent Banner */
        .pend-urgent-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 18px;
          background: rgba(248,113,113,0.07);
          border: 1px solid rgba(248,113,113,0.18);
          border-radius: 12px;
          font-size: 13.5px;
          color: rgba(255,255,255,0.55);
          line-height: 1.5;
        }
        .pend-urgent-banner svg { width: 18px; height: 18px; color: #f87171; flex-shrink: 0; }
        .pend-urgent-banner strong { color: #f87171; }

        /* Cards */
        .pend-cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pend-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .pend-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 3px 0 0 3px;
        }
        .pend-card.urgent::before { background: #f59e0b; }
        .pend-card.critical::before { background: #f87171; }
        .pend-card:hover { border-color: rgba(255,255,255,0.11); transform: translateY(-1px); }

        /* Card Top */
        .pend-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pend-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pend-card-id {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.2);
          font-family: monospace;
        }
        .pend-card-journal {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          background: rgba(201,168,76,0.1);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.2);
        }
        .pend-card-round {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          background: rgba(96,165,250,0.08);
          color: #60a5fa;
          border: 1px solid rgba(96,165,250,0.15);
        }
        .pend-card-due {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          flex-shrink: 0;
        }
        .pend-card-due.urgent { color: #f59e0b; }
        .pend-card-due.critical { color: #f87171; animation: pulse 1.5s ease infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .pend-card-due svg { width: 13px; height: 13px; }

        /* Title */
        .pend-card-title {
          font-size: 15px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          line-height: 1.4;
        }

        /* Info */
        .pend-card-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 600px) { .pend-card-info { grid-template-columns: 1fr 1fr; } }
        .pend-card-info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pend-info-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .pend-info-val {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          font-weight: 500;
        }
        .pend-status-dot-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #f59e0b;
          font-weight: 600;
        }
        .pend-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          animation: blink 2s ease infinite;
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* Progress */
        .pend-progress-wrap { display: flex; flex-direction: column; gap: 6px; }
        .pend-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          font-weight: 500;
        }
        .pend-progress-track {
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }
        .pend-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a84c, #e8c97a);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        /* Actions */
        .pend-card-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 4px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        :global(.pend-start-btn) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          background: linear-gradient(135deg, #c9a84c 0%, #a07828 100%);
          color: #000;
          font-size: 13px;
          font-weight: 700;
          border-radius: 9px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 3px 12px rgba(201,168,76,0.2);
        }
        :global(.pend-start-btn:hover) {
          box-shadow: 0 5px 20px rgba(201,168,76,0.35);
          transform: translateY(-1px);
        }
        :global(.pend-start-btn svg) { width: 13px; height: 13px; }
        .pend-decline-btn {
          padding: 9px 16px;
          background: transparent;
          border: 1px solid rgba(248,113,113,0.15);
          color: rgba(248,113,113,0.5);
          font-size: 12.5px;
          font-weight: 600;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .pend-decline-btn:hover {
          background: rgba(248,113,113,0.08);
          border-color: rgba(248,113,113,0.3);
          color: #f87171;
        }

        /* Empty */
        .pend-empty {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
        }
        .pend-empty-icon { font-size: 48px; margin-bottom: 14px; }
        .pend-empty-title { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        .pend-empty-desc { font-size: 13px; color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}
