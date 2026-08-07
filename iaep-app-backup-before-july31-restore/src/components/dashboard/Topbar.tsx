"use client";
import { useState } from "react";

export default function Topbar({ userName, role }: { userName: string; role: string }) {
  const [showNotif, setShowNotif] = useState(false);

  const roleLabel: Record<string, string> = {
    admin: "Administrator",
    editor: "Editor",
    reviewer: "Reviewer",
    author: "Penulis",
    member: "Anggota",
  };

  const roleColor: Record<string, string> = {
    admin: "#f59e0b",
    editor: "#60a5fa",
    reviewer: "#34d399",
    author: "#c9a84c",
    member: "#a78bfa",
  };

  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const color = roleColor[role] || "#c9a84c";

  const notifications = [
    { id: 1, text: "Naskah Anda #1045 telah dikirim ke reviewer.", time: "2j yang lalu", unread: true },
    { id: 2, text: "Komentar baru pada submisi Anda #1022.", time: "1h yang lalu", unread: true },
    { id: 3, text: "Pemeliharaan sistem dijadwalkan pada 10 Juli 2026.", time: "2h yang lalu", unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="topbar-enterprise">
      {/* Left side - breadcrumb area */}
      <div className="topbar-left">
        <div className="topbar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Cari submisi, jurnal..." />
        </div>
      </div>

      {/* Right side */}
      <div className="topbar-right">
        {/* Notification Bell */}
        <div className="topbar-notif-wrap">
          <button
            className="topbar-icon-btn"
            onClick={() => setShowNotif(v => !v)}
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="topbar-notif-dot">{unreadCount}</span>}
          </button>
          {showNotif && (
            <div className="topbar-notif-dropdown">
              <div className="notif-header">
                <span>Notifikasi</span>
                <span className="notif-count">{unreadCount} baru</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`notif-item ${n.unread ? "unread" : ""}`}>
                  {n.unread && <div className="notif-item-dot" />}
                  <div className="notif-item-content">
                    <p className="notif-item-text">{n.text}</p>
                    <span className="notif-item-time">{n.time}</span>
                  </div>
                </div>
              ))}
              <div 
                className="notif-footer"
                onClick={() => {
                  setShowNotif(false);
                  window.location.href = "/dashboard/notifications";
                }}
              >
                Lihat semua notifikasi
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="topbar-divider" />

        {/* User Info */}
        <div className="topbar-user">
          <div className="topbar-user-info">
            <div className="topbar-user-name">{userName}</div>
            <div className="topbar-user-role" style={{ color }}>
              {roleLabel[role] || role}
            </div>
          </div>
          <div className="topbar-avatar" style={{ background: `${color}22`, border: `1.5px solid ${color}55`, color }}>
            {initials}
          </div>
          <button
            className="topbar-logout-btn"
            onClick={async () => {
              const { createClient } = await import('@/utils/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
              document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "mock_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "mock_user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "active_portal_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              window.location.href = "/";
            }}
            title="Logout"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .topbar-enterprise {
          height: 60px;
          background: rgba(9, 9, 15, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(201,168,76,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 16px;
          flex-shrink: 0;
        }

        .topbar-left {
          flex: 1;
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .topbar-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 7px 14px;
          max-width: 360px;
          width: 100%;
          transition: border-color 0.2s;
        }
        .topbar-search:focus-within {
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.04);
        }
        .topbar-search svg {
          width: 15px;
          height: 15px;
          color: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }
        .topbar-search input {
          background: none;
          border: none;
          outline: none;
          font-size: 12.5px;
          color: rgba(255,255,255,0.7);
          width: 100%;
          font-family: inherit;
        }
        .topbar-search input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .topbar-notif-wrap {
          position: relative;
        }
        .topbar-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.18s;
        }
        .topbar-icon-btn:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.12);
        }
        .topbar-icon-btn svg {
          width: 16px;
          height: 16px;
        }
        .topbar-notif-dot {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 16px;
          height: 16px;
          background: #ef4444;
          color: #fff;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #09090f;
          padding: 0 3px;
        }

        .topbar-notif-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 320px;
          background: #0f0f1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          overflow: hidden;
          z-index: 100;
          animation: dropdown-in 0.18s ease;
        }
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 10px;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.7);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .notif-count {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 20px;
          background: rgba(239,68,68,0.15);
          color: #f87171;
          font-weight: 700;
        }
        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          transition: background 0.15s;
          cursor: pointer;
        }
        .notif-item:hover { background: rgba(255,255,255,0.04); }
        .notif-item.unread { background: rgba(201,168,76,0.03); }
        .notif-item-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c9a84c;
          flex-shrink: 0;
          margin-top: 5px;
        }
        .notif-item-content { flex: 1; min-width: 0; }
        .notif-item-text {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
          margin: 0 0 4px;
        }
        .notif-item-time {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
        }
        .notif-footer {
          padding: 11px 16px;
          text-align: center;
          font-size: 11.5px;
          color: #c9a84c;
          border-top: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: background 0.15s;
        }
        .notif-footer:hover { background: rgba(201,168,76,0.05); }

        .topbar-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.07);
          margin: 0 4px;
        }

        .topbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .topbar-user-info {
          text-align: right;
          display: none;
        }
        @media (min-width: 640px) {
          .topbar-user-info { display: block; }
        }
        .topbar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          white-space: nowrap;
        }
        .topbar-user-role {
          font-size: 10.5px;
          font-weight: 500;
          margin-top: 1px;
          letter-spacing: 0.3px;
        }

        .topbar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }

        .topbar-logout-btn {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(239,68,68,0.15);
          background: rgba(239,68,68,0.06);
          color: rgba(239,68,68,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .topbar-logout-btn:hover {
          background: rgba(239,68,68,0.15);
          color: #f87171;
          border-color: rgba(239,68,68,0.3);
        }
        .topbar-logout-btn svg {
          width: 15px;
          height: 15px;
        }
      `}</style>
    </header>
  );
}
