"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function SuperAdminOverview() {
  const [submissionCount, setSubmissionCount] = useState(342);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "visibility" | "publisher"

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

    const defaultLogs: any[] = [];
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
        .dash-num {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-variant-numeric: tabular-nums;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
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

        .dash-main-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
        }
        @media (max-width: 1100px) { .dash-main-grid { grid-template-columns: 1fr; } }

        .dash-card {
          background: #13131f;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
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

        /* Tabs styling */
        .tab-btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #8888aa;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn.active {
          color: #c9a84c;
          border-bottom-color: #c9a84c;
        }
      `}</style>

      <div>
        {/* ── Header ── */}
        <div className="dash-header">
          <h1>Super Admin <span>Intelligence</span></h1>
          <p>Pengawasan global dan analitik indeksasi scholarly ekosistem APASIFIC.</p>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="flex border-b border-gray-800 mb-8">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            System Overview
          </button>
          <button className={`tab-btn ${activeTab === 'visibility' ? 'active' : ''}`} onClick={() => setActiveTab('visibility')}>
            Scholarly Visibility
          </button>
          <button className={`tab-btn ${activeTab === 'publisher' ? 'active' : ''}`} onClick={() => setActiveTab('publisher')}>
            Publisher &amp; Executive Analytics
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
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

            {/* IAEP Enterprise Runtime Status Monitor Panel */}
            <RuntimeHealthPanel />

            {/* ── Main grid ── */}
            <div className="dash-main-grid">
              <div className="dash-card">
                <div className="dash-card-head">
                  <h2>Jurnal yang Dikelola (OJS)</h2>
                  <Link href="/dashboard/admin/journals">Kelola Semua →</Link>
                </div>
                <div>
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
          </>
        )}

        {activeTab === 'visibility' && (
          <div className="space-y-6">
            {/* Crossref & Zenodo Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#13131f] border border-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-blue-500">❖</span> Crossref Deposit Monitor
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-500 dash-num">142</div>
                    <div className="text-xs text-gray-400">Accepted</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-yellow-500 dash-num">4</div>
                    <div className="text-xs text-gray-400">Processing</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-red-500 dash-num">0</div>
                    <div className="text-xs text-gray-400">Failed</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex justify-between border-t border-gray-800 pt-3">
                  <span>Last Sync: 10 mins ago</span>
                  <span className="text-green-400">● Stable Connection</span>
                </div>
              </div>

              <div className="bg-[#13131f] border border-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-purple-500">❖</span> Zenodo Deposit Monitor
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-500 dash-num">142</div>
                    <div className="text-xs text-gray-400">Deposited</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-yellow-500 dash-num">2</div>
                    <div className="text-xs text-gray-400">Pending</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-red-500 dash-num">0</div>
                    <div className="text-xs text-gray-400">Failed</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex justify-between border-t border-gray-800 pt-3">
                  <span>Sync Status: MATCHED</span>
                  <span className="text-green-400">● Storage Sync OK</span>
                </div>
              </div>
            </div>

            {/* Indexing Readiness Engine */}
            <div className="bg-[#13131f] border border-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-[#c9a84c] mb-6">Scholarly Metadata &amp; Indexing Readiness</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">Google Scholar Compliance (citation tags, sitemap, canonicals)</span>
                    <span className="text-[#c9a84c] font-bold">96% (PASS)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: '96%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">OpenAIRE &amp; OAI-PMH Interoperability (Dublin Core exposure)</span>
                    <span className="text-[#c9a84c] font-bold">94% (PASS)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publisher' && (
          <div className="space-y-6">
            {/* PT Bernas Sumut Jaya Consolidate Dashboard */}
            <div className="bg-[#13131f] border border-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-6">PT Bernas Sumut Jaya — Publisher Aggregated KPIs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-gray-400 text-xs uppercase">Total Journals</div>
                  <div className="text-2xl font-bold text-[#c9a84c] dash-num mt-1">3</div>
                </div>
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-gray-400 text-xs uppercase">Total Published Articles</div>
                  <div className="text-2xl font-bold text-[#c9a84c] dash-num mt-1">142</div>
                </div>
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-gray-400 text-xs uppercase">Global ORCID Coverage</div>
                  <div className="text-2xl font-bold text-[#c9a84c] dash-num mt-1">92.4%</div>
                </div>
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-gray-400 text-xs uppercase">Total citations</div>
                  <div className="text-2xl font-bold text-[#c9a84c] dash-num mt-1">481</div>
                </div>
              </div>
            </div>

            {/* ORCID Coverage & SDGs Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#13131f] border border-gray-800 p-6 rounded-xl">
                <h3 className="text-md font-bold text-[#c9a84c] mb-4">ORCID Board Coverage</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Authors</span>
                    <span className="text-white font-semibold">134</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verified ORCID Authors</span>
                    <span className="text-white font-semibold">124</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reviewers with ORCID</span>
                    <span className="text-white font-semibold">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Editorial Board with ORCID</span>
                    <span className="text-white font-semibold">95%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#13131f] border border-gray-800 p-6 rounded-xl">
                <h3 className="text-md font-bold text-[#c9a84c] mb-4">Sustainable Development Goals (SDG) Mapping</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white">Goal 4: Quality Education</span>
                      <span className="text-gray-400">62 Articles</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#c9a84c] h-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white">Goal 8: Decent Work &amp; Economic Growth</span>
                      <span className="text-gray-400">45 Articles</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#c9a84c] h-full" style={{ width: '32%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function RuntimeHealthPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/health")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-[#13131f] border border-gray-800 p-6 rounded-xl mb-7 animate-pulse text-zinc-500 text-xs">
        Loading IAEP Enterprise Runtime Health Status...
      </div>
    );
  }

  if (!data || data.status !== "success") {
    return (
      <div className="bg-[#13131f] border border-red-900/30 p-6 rounded-xl mb-7 text-xs text-red-400">
        Status: Unknown. Reason: No runtime evidence available.
      </div>
    );
  }

  const { services, overallScore, overallLatencyMs } = data;

  return (
    <div className="bg-[#13131f] border border-gray-800 p-6 rounded-xl mb-7 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-md font-bold text-white">IAEP Enterprise Runtime Status</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Overall latency: {overallLatencyMs} ms • Verified at: {new Date(data.timestamp).toLocaleTimeString()}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase font-black tracking-wider block">Health Score</span>
          <span className="text-lg font-black text-green-400 dash-num">{overallScore}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(services).map(([key, s]: any) => (
          <div key={key} className="bg-black/30 border border-gray-900 p-3.5 rounded-lg space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs font-bold capitalize">{key}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${s.status === 'Healthy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {s.status}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 flex justify-between pt-1">
              <span>Latency: <strong className="text-gray-300 dash-num">{s.latencyMs} ms</strong></span>
              <span className="text-green-400 font-bold dash-num">{s.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

