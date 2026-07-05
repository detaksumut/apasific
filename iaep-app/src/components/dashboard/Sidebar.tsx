"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const commonLinks = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      label: "Profil Saya",
      path: "/dashboard/profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  const authorLinks = [
    {
      label: "Submit Naskah",
      path: "/dashboard/submit",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
      badge: "New",
    },
    {
      label: "Submission Saya",
      path: "/dashboard/submissions",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      ),
    },
  ];

  const reviewerLinks = [
    {
      label: "Review Pending",
      path: "/dashboard/reviews/pending",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      badge: "3",
    },
    {
      label: "Riwayat Review",
      path: "/dashboard/reviews/history",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ];

  const editorLinks = [
    {
      label: "Dewan Editorial",
      path: "/dashboard/editor",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      ),
    },
  ];

  const adminLinks = [
    {
      label: "System Overview",
      path: "/dashboard/admin",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Manajemen Jurnal",
      path: "/dashboard/admin/journals",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
    },
    {
      label: "Dewan Editorial",
      path: "/dashboard/admin/editorial-board",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: "Manajemen Pimpinan",
      path: "/dashboard/admin/leadership",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "Manajemen User",
      path: "/dashboard/admin/users",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Keuangan",
      path: "/dashboard/admin/financials",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      label: "Pengaturan",
      path: "/dashboard/admin/settings",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
    },
  ];

  const getRoleLinks = () => {
    switch (role) {
      case "author":   return authorLinks;
      case "reviewer": return reviewerLinks;
      case "editor":   return editorLinks;
      case "admin":    return adminLinks;
      default:         return [];
    }
  };

  const roleLabelMap: Record<string, string> = {
    admin:    "Administration",
    editor:   "Editorial",
    reviewer: "Reviewer",
    author:   "Author",
  };

  const roleColorMap: Record<string, string> = {
    admin:    "#f59e0b",
    editor:   "#60a5fa",
    reviewer: "#34d399",
    author:   "#c9a84c",
  };

  const NavLink = ({ link }: { link: { label: string; path: string; icon: React.ReactNode; badge?: string } }) => {
    const isActive = pathname === link.path;
    return (
      <Link
        href={link.path}
        className={`sidebar-navlink ${isActive ? "active" : ""}`}
      >
        <span className="sidebar-navlink-icon">{link.icon}</span>
        <span className="sidebar-navlink-label">{link.label}</span>
        {link.badge && (
          <span className="sidebar-navlink-badge">{link.badge}</span>
        )}
      </Link>
    );
  };

  return (
    <aside className="sidebar-enterprise">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="#c9a84c" strokeWidth="1.5" />
            <path d="M8 22L16 8l8 14" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.5 18h11" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="sidebar-brand-name">APASIFIC</div>
          <div className="sidebar-brand-sub">Academic Hub</div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="sidebar-role-badge" style={{ "--role-color": roleColorMap[role] || "#c9a84c" } as React.CSSProperties}>
        <div className="sidebar-role-dot" />
        <span>{roleLabelMap[role] || role} Portal</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        {commonLinks.map(link => <NavLink key={link.path} link={link} />)}

        <div className="sidebar-section-label" style={{ marginTop: 24 }}>
          {roleLabelMap[role] || role}
        </div>
        {getRoleLinks().map(link => <NavLink key={link.path} link={link} />)}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-version">IAEP Platform · v1.0.0</div>
        <Link href="/" className="sidebar-footer-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      <style jsx>{`
        .sidebar-enterprise {
          width: 256px;
          flex-shrink: 0;
          background: #07070e;
          border-right: 1px solid rgba(201, 168, 76, 0.08);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sidebar-brand-logo svg {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
        }
        .sidebar-brand-name {
          font-size: 15px;
          font-weight: 800;
          color: #c9a84c;
          letter-spacing: 2px;
          font-family: 'Georgia', serif;
          line-height: 1;
        }
        .sidebar-brand-sub {
          font-size: 9px;
          color: rgba(201,168,76,0.4);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .sidebar-role-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 12px 16px;
          padding: 7px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--role-color, #c9a84c);
          letter-spacing: 0.5px;
        }
        .sidebar-role-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--role-color, #c9a84c);
          box-shadow: 0 0 6px var(--role-color, #c9a84c);
          animation: pulse-dot 2s ease infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          scrollbar-width: none;
        }
        .sidebar-nav::-webkit-scrollbar { display: none; }

        .sidebar-section-label {
          font-size: 9.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.18);
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 0 8px;
          margin-bottom: 6px;
        }

        :global(.sidebar-navlink) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: all 0.18s ease;
          margin-bottom: 2px;
          position: relative;
          border: 1px solid transparent;
        }
        :global(.sidebar-navlink:hover) {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.06);
        }
        :global(.sidebar-navlink.active) {
          color: #c9a84c;
          background: rgba(201,168,76,0.09);
          border-color: rgba(201,168,76,0.2);
          font-weight: 600;
        }
        :global(.sidebar-navlink.active::before) {
          content: '';
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #c9a84c;
          border-radius: 2px;
        }
        :global(.sidebar-navlink-icon) {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: opacity 0.18s;
        }
        :global(.sidebar-navlink:hover .sidebar-navlink-icon),
        :global(.sidebar-navlink.active .sidebar-navlink-icon) {
          opacity: 1;
        }
        :global(.sidebar-navlink-icon svg) {
          width: 100%;
          height: 100%;
        }
        :global(.sidebar-navlink-label) {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        :global(.sidebar-navlink-badge) {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 20px;
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.3);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 14px 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .sidebar-footer-version {
          font-size: 10px;
          color: rgba(255,255,255,0.15);
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }
        :global(.sidebar-footer-link) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: color 0.2s;
        }
        :global(.sidebar-footer-link:hover) {
          color: rgba(255,255,255,0.55);
        }
      `}</style>
    </aside>
  );
}
