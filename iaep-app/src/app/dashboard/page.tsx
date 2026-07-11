import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DashboardHome() {
  let profile = {
    fullName: "Dr. M A Rahman",
    email: "john.doe@university.edu",
    role: "Author",
    university: "National University of Singapore",
    country: "Singapore",
    orcid: "0000-1111-2222-3333",
    sinta: "6543210",
  };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (dbProfile) {
        profile = {
          fullName: dbProfile.full_name || "N/A",
          email: dbProfile.email || user.email || "N/A",
          role: dbProfile.role || "Member",
          university: dbProfile.university || "N/A",
          country: dbProfile.country || "N/A",
          orcid: dbProfile.orcid_id || "N/A",
          sinta: dbProfile.sinta_id || "N/A",
        };
      }
    }
  } catch {
    console.log("Using fallback profile data");
  }

  const stats = [
    { label: "Total Submisi", value: "3", change: "+1 bulan ini", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "#c9a84c" },
    { label: "Sedang Ditinjau", value: "1", change: "Diharapkan Agu 2026", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", color: "#60a5fa" },
    { label: "Diterbitkan", value: "1", change: "Vol. 4 No. 2 (2026)", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "#34d399" },
    { label: "Royalti Diperoleh", value: "Rp 2.1M", change: "42 unduhan", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "#a78bfa" },
  ];

  const recentActivity = [
    { icon: "✓", text: "Naskah #1045 dikirim ke reviewer", time: "2 jam yang lalu", type: "success" },
    { icon: "📋", text: "Profil berhasil diperbarui", time: "1 hari yang lalu", type: "info" },
    { icon: "🚀", text: "Naskah #1022 diterbitkan di Vol. 4", time: "3 hari yang lalu", type: "success" },
    { icon: "📤", text: "Naskah baru #1056 disubmit", time: "5 hari yang lalu", type: "info" },
  ];

  return (
    <div className="ent-dashboard">
      {/* Page Header */}
      <div className="ent-page-header">
        <div>
          <h1 className="ent-page-title">Selamat pagi, {profile.fullName.split(" ")[0]} 👋</h1>
          <p className="ent-page-subtitle">Berikut ini yang terjadi dengan portofolio akademik Anda hari ini.</p>
        </div>
        <Link href="/dashboard/submit" className="ent-primary-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Submit Naskah
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="ent-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="ent-stat-card" style={{ "--accent": stat.color } as React.CSSProperties}>
            <div className="ent-stat-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={stat.icon} />
              </svg>
            </div>
            <div className="ent-stat-value">{stat.value}</div>
            <div className="ent-stat-label">{stat.label}</div>
            <div className="ent-stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="ent-main-grid">
        {/* Academic Profile Card */}
        <div className="ent-card ent-card-profile">
          <div className="ent-card-header">
            <h2 className="ent-card-title">Profil Akademik</h2>
            <Link href="/dashboard/profile" className="ent-card-action">Edit Profil →</Link>
          </div>

          <div className="ent-profile-avatar-row">
            <div className="ent-profile-avatar">
              {profile.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div className="ent-profile-name">{profile.fullName}</div>
              <div className="ent-profile-email">{profile.email}</div>
              <span className="ent-role-badge">{profile.role}</span>
            </div>
          </div>

          <div className="ent-profile-fields">
            {[
              { label: "Institusi", value: profile.university },
              { label: "Negara", value: profile.country },
              { label: "ORCID ID", value: profile.orcid, mono: true },
              { label: "SINTA ID", value: profile.sinta, mono: true },
            ].map(field => (
              <div key={field.label} className="ent-profile-field">
                <div className="ent-profile-field-label">{field.label}</div>
                <div className={`ent-profile-field-value ${field.mono ? "mono" : ""}`}>{field.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="ent-right-col">
          {/* Platform Status */}
          <div className="ent-card">
            <div className="ent-card-header">
              <h2 className="ent-card-title">Status Platform</h2>
              <div className="ent-status-live">
                <span className="ent-status-dot" />
                Semua Sistem Operasional
              </div>
            </div>
            <div className="ent-status-rows">
              <div className="ent-status-row">
                <span>Keanggotaan</span>
                <span className="ent-badge ent-badge-green">Aktif</span>
              </div>
              <div className="ent-status-row">
                <span>Sistem Review</span>
                <span className="ent-badge ent-badge-green">Online</span>
              </div>
              <div className="ent-status-row">
                <span>Peran</span>
                <span className="ent-badge ent-badge-gold">{profile.role}</span>
              </div>
            </div>
          </div>

          {/* Royalties Card */}
          <div className="ent-card ent-card-royalties">
            <div className="ent-royalties-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <span>Royalti & Pendapatan</span>
            </div>
            <div className="ent-royalties-amount">Rp 2.100.000</div>
            <div className="ent-royalties-sub">dari 42 unduhan artikel</div>
            <div className="ent-royalties-bar">
              <div className="ent-royalties-fill" style={{ width: "67%" }} />
            </div>
            <div className="ent-royalties-meta">67% dari target bulanan</div>
            <button className="ent-withdraw-btn">
              Tarik Dana
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="ent-card" style={{ marginTop: 24 }}>
        <div className="ent-card-header">
          <h2 className="ent-card-title">Aktivitas Terbaru</h2>
          <Link href="/dashboard/submissions" className="ent-card-action">Lihat semua →</Link>
        </div>
        <div className="ent-activity-list">
          {recentActivity.map((item, i) => (
            <div key={i} className={`ent-activity-item ${item.type}`}>
              <div className="ent-activity-icon">{item.icon}</div>
              <div className="ent-activity-content">
                <div className="ent-activity-text">{item.text}</div>
                <div className="ent-activity-time">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ent-dashboard {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-bottom: 40px;
        }

        /* Page Header */
        .ent-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ent-page-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }
        .ent-page-subtitle {
          font-size: 13.5px;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }
        :global(.ent-primary-btn) {
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
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(201,168,76,0.25);
          white-space: nowrap;
          flex-shrink: 0;
        }
        :global(.ent-primary-btn:hover) {
          background: linear-gradient(135deg, #dbb85c 0%, #b08838 100%);
          box-shadow: 0 6px 28px rgba(201,168,76,0.4);
          transform: translateY(-1px);
        }
        :global(.ent-primary-btn svg) { width: 16px; height: 16px; }

        /* Stats Grid */
        .ent-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (max-width: 1100px) {
          .ent-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .ent-stat-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, border-color 0.2s;
        }
        .ent-stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.1);
        }
        .ent-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent, #c9a84c);
          opacity: 0.6;
        }
        .ent-stat-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          color: var(--accent, #c9a84c);
        }
        .ent-stat-icon-wrap svg { width: 18px; height: 18px; }
        .ent-stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #f0f0f8;
          line-height: 1;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        .ent-stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
          margin-bottom: 8px;
        }
        .ent-stat-change {
          font-size: 11px;
          color: var(--accent, #c9a84c);
          opacity: 0.75;
        }

        /* Main Grid */
        .ent-main-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
        }
        @media (max-width: 1000px) {
          .ent-main-grid { grid-template-columns: 1fr; }
        }

        /* Base Card */
        .ent-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
        }
        .ent-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .ent-card-title {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.2px;
          margin: 0;
        }
        :global(.ent-card-action) {
          font-size: 12px;
          color: #c9a84c;
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 0.15s;
        }
        :global(.ent-card-action:hover) { opacity: 1; }

        /* Profile Card */
        .ent-profile-avatar-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ent-profile-avatar {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(201,168,76,0.12);
          border: 1.5px solid rgba(201,168,76,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: #c9a84c;
          flex-shrink: 0;
        }
        .ent-profile-name {
          font-size: 15px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          margin-bottom: 3px;
        }
        .ent-profile-email {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 8px;
        }
        .ent-role-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(201,168,76,0.12);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.25);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .ent-profile-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ent-profile-field-label {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .ent-profile-field-value {
          font-size: 13.5px;
          color: rgba(255,255,255,0.75);
          font-weight: 500;
        }
        .ent-profile-field-value.mono {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: rgba(201,168,76,0.8);
        }

        /* Right Column */
        .ent-right-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Status Card */
        .ent-status-live {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          color: #34d399;
          font-weight: 600;
        }
        .ent-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px #34d399;
          animation: blink 2s ease infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ent-status-rows {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ent-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }
        .ent-status-row:last-child { border-bottom: none; }
        .ent-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }
        .ent-badge-green {
          background: rgba(52,211,153,0.12);
          color: #34d399;
          border: 1px solid rgba(52,211,153,0.2);
        }
        .ent-badge-gold {
          background: rgba(201,168,76,0.12);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.2);
        }

        /* Royalties Card */
        .ent-card-royalties {
          background: linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(16,185,129,0.02) 100%);
          border-color: rgba(52,211,153,0.12);
        }
        .ent-royalties-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #34d399;
          margin-bottom: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .ent-royalties-header svg { width: 16px; height: 16px; }
        .ent-royalties-amount {
          font-size: 28px;
          font-weight: 800;
          color: #f0f0f8;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .ent-royalties-sub {
          font-size: 11.5px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 14px;
        }
        .ent-royalties-bar {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .ent-royalties-fill {
          height: 100%;
          background: linear-gradient(90deg, #34d399, #10b981);
          border-radius: 2px;
          transition: width 0.8s ease;
        }
        .ent-royalties-meta {
          font-size: 11px;
          color: rgba(52,211,153,0.6);
          margin-bottom: 16px;
        }
        .ent-withdraw-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.2);
          color: #34d399;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ent-withdraw-btn:hover {
          background: rgba(52,211,153,0.18);
          border-color: rgba(52,211,153,0.35);
        }
        .ent-withdraw-btn svg { width: 14px; height: 14px; }

        /* Activity */
        .ent-activity-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ent-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .ent-activity-item:last-child { border-bottom: none; }
        .ent-activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .ent-activity-text {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 4px;
          line-height: 1.4;
        }
        .ent-activity-time {
          font-size: 11px;
          color: rgba(255,255,255,0.22);
      ` }} />
    </div>
  );
}
