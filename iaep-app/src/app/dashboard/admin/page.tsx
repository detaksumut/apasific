"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function SuperAdminOverview() {
  const [submissionCount, setSubmissionCount] = useState(342);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const defaultSubsLength = 3;
    const storedSubs = localStorage.getItem("mock_submissions");
    if (storedSubs) {
      try {
        const parsed = JSON.parse(storedSubs);
        const addedCount = Math.max(0, parsed.length - defaultSubsLength);
        setSubmissionCount(342 + addedCount);
      } catch (e) { console.error(e); }
    }

    const defaultLogs = [
      { time: "10 menit lalu",  text: "Jurnal baru dibuat: 'APASIFIC Medical Journal'",       status: "success" },
      { time: "1 jam lalu",     text: "Backup sistem berhasil diselesaikan.",                  status: "info"    },
      { time: "3 jam lalu",     text: "M. A. Rahman diberikan peran 'Editor' di RJRAKP.",     status: "warning" },
      { time: "1 hari lalu",    text: "Peringatan traffic tinggi: 50+ submission serentak.",  status: "error"   },
    ];

    const storedLogs = localStorage.getItem("mock_system_logs");
    if (storedLogs) {
      try { setActivities(JSON.parse(storedLogs)); }
      catch (e) { setActivities(defaultLogs); }
    } else {
      localStorage.setItem("mock_system_logs", JSON.stringify(defaultLogs));
      setActivities(defaultLogs);
    }
  }, []);

  const stats = [
    { label: "Total Jurnal",      value: "3",              delta: "+1 bulan ini",  color: "#c9a84c", icon: "📚" },
    { label: "Pengguna Aktif",    value: "1,248",          delta: "+12%",          color: "#34a853", icon: "👥" },
    { label: "Total Submission",  value: String(submissionCount), delta: "+8%",   color: "#4285f4", icon: "📄" },
    { label: "Kesehatan Sistem",     value: "99.9%",          delta: "Stabil",        color: "#a3c94c", icon: "✅" },
  ];

  const statusColor: Record<string, string> = {
    success: "#34a853",
    info:    "#4285f4",
    warning: "#f59e0b",
    error:   "#ef4444",
  };

  return (
    <>
      <style>{`
        /* ── Reset font for all numbers in dashboard ── */
        .dash-num {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-variant-numeric: tabular-nums;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        /* ── Header banner ── */
        .dash-header {
          background: linear-gradient(135deg, #12122a 0%, #1a1a38 60%, #12122a 100%);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 16px;
          padding: 36px 40px;
          position: relative;
          overflow: hidden;
          margin-bottom: 28px;
        }
        .dash-header::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .dash-header h1 {
          font-size: 26px; font-weight: 800; color: #fff;
          margin: 0 0 6px;
          font-family: 'Inter', sans-serif;
        }
        .dash-header h1 span { color: #c9a84c; }
        .dash-header p { color: rgba(255,255,255,0.45); font-size: 14px; margin: 0; }

        /* ── Stat Cards ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: #13131f;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px 24px 20px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover { border-color: rgba(201,168,76,0.35); transform: translateY(-2px); }
        .stat-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .stat-icon { font-size: 22px; }
        .stat-delta {
          font-size: 11px; font-weight: 700; padding: 3px 8px;
          border-radius: 20px; background: rgba(52,168,83,0.12); color: #34a853;
        }
        .stat-value {
          font-size: 32px;
          color: #fff;
          margin-bottom: 4px;
          line-height: 1;
        }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500; }

        /* ── Main grid ── */
        .dash-main-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
        }
        @media (max-width: 1100px) { .dash-main-grid { grid-template-columns: 1fr; } }

        /* ── Card ── */
        .dash-card {
          background: #13131f;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
        }
        .dash-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .dash-card-head h2 { font-size: 15px; font-weight: 700; color: #fff; margin: 0; }
        .dash-card-head a  { font-size: 12px; font-weight: 600; color: #c9a84c; text-decoration: none; transition: color 0.2s; }
        .dash-card-head a:hover { color: #fff; }

        /* ── Journal rows ── */
        .journal-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .journal-row:last-child { border-bottom: none; }
        .journal-row:hover { background: rgba(255,255,255,0.03); }
        .journal-avatar {
          width: 44px; height: 44px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: #fff;
          flex-shrink: 0;
          font-family: 'Inter', sans-serif;
        }
        .journal-info { margin-left: 14px; }
        .journal-info h3 { font-size: 14px; font-weight: 700; color: #fff; margin: 0 0 3px; }
        .journal-info p  { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }
        .journal-meta { text-align: right; }
        .journal-meta .users { font-size: 13px; font-weight: 600; color: #fff; }
        .journal-meta .status { font-size: 11px; color: #34a853; margin-top: 2px; }

        /* ── System Logs ── */
        .log-body { padding: 20px 24px; }
        .log-item { display: flex; gap: 14px; margin-bottom: 20px; }
        .log-item:last-child { margin-bottom: 0; }
        .log-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .log-time { font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 3px; font-family: monospace; }
        .log-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; }
        .btn-view-all {
          display: block; width: 100%; padding: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600;
          border-radius: 8px; cursor: pointer; margin-top: 16px;
          transition: all 0.2s; text-align: center;
        }
        .btn-view-all:hover { background: rgba(255,255,255,0.08); color: #fff; }
      `}</style>

      <div>
        {/* ── Header ── */}
        <div className="dash-header">
          <h1>Super Admin <span>Ringkasan</span></h1>
          <p>Pengawasan global jaringan penerbitan akademik APASIFIC.</p>
        </div>

        {/* ── Stats ── */}
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-top">
                <span className="stat-icon">{s.icon}</span>
                <span className="stat-delta">{s.delta}</span>
              </div>
              <div className="stat-value dash-num" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="dash-main-grid">

          {/* Hosted Journals */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h2>Jurnal yang Dikelola (OJS)</h2>
              <Link href="/dashboard/admin/journals">Kelola Semua →</Link>
            </div>
            <div>
              <div className="journal-row">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="journal-avatar" style={{ background: "linear-gradient(135deg, #c9a84c, #9a7a30)" }}>RJ</div>
                  <div className="journal-info">
                    <h3>RJRAKP</h3>
                    <p>Riau Journal of Review Audit &amp; Knowledge Practice</p>
                  </div>
                </div>
                <div className="journal-meta">
                  <div className="users dash-num">215</div>
                  <div className="status">● Aktif</div>
                </div>
              </div>
              <div className="journal-row">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="journal-avatar" style={{ background: "linear-gradient(135deg, #4285f4, #1a56c4)" }}>IA</div>
                  <div className="journal-info">
                    <h3>APASIFIC IAEP</h3>
                    <p>Impact of Artificial Intelligence on Education &amp; Practice</p>
                  </div>
                </div>
                <div className="journal-meta">
                  <div className="users dash-num">1,033</div>
                  <div className="status">● Aktif</div>
                </div>
              </div>
              <div className="journal-row">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="journal-avatar" style={{ background: "linear-gradient(135deg, #34a853, #1a7a35)" }}>AJ</div>
                  <div className="journal-info">
                    <h3>ASIA Journal</h3>
                    <p>Asia Pacific Multidisciplinary Academic Journal</p>
                  </div>
                </div>
                <div className="journal-meta">
                  <div className="users dash-num">—</div>
                  <div className="status" style={{ color: "#f59e0b" }}>● Persiapan</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h2>Log Sistem</h2>
            </div>
            <div className="log-body">
              {activities.map((act, i) => (
                <div key={i} className="log-item">
                  <div className="log-dot" style={{ background: statusColor[act.status] || "#4285f4" }} />
                  <div>
                    <div className="log-time">{act.time}</div>
                    <div className="log-text">{act.text}</div>
                  </div>
                </div>
              ))}
              <button className="btn-view-all">Lihat Semua Log</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
