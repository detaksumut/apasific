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
      label: "Ringkasan",
      path: (() => {
        const r = (role || '').toLowerCase();
        if (r === 'editor') return '/dashboard/editor';
        if (r === 'admin editor') return '/dashboard/production/supervisor';
        if (r === 'admin' || r === 'superadmin' || r === 'super_admin') return '/dashboard/admin';
        if (r === 'layout editor') return '/dashboard/production/layout';
        if (r === 'cover editor') return '/dashboard/production/cover';
        if (r === 'publish editor') return '/dashboard/production/publish';
        if (r === 'co_admin' || r === 'co-admin') return '/dashboard/admin/users';
        return '/dashboard';
      })(),
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
      badge: "Baru",
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
    {
      label: "Lacak Proses",
      path: "/dashboard/track",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      label: "Acceptance Letter",
      path: "/dashboard/loa",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
    {
      label: "Sertifikat Publikasi",
      path: "/dashboard/certificates",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      ),
    },
  ];

  const reviewerLinks = [
    {
      label: "Dashboard",
      path: "/dashboard/reviews",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      label: "Artikel Ditugaskan",
      path: "/dashboard/reviews/assignments",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      badge: "Baru",
    },
    {
      label: "Review Saya",
      path: "/dashboard/reviews/my-reviews",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
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
      label: "Dashboard",
      path: "/dashboard/editor",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Artikel Masuk",
      path: "/dashboard/editor/incoming",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: "Assign Reviewer",
      path: "/dashboard/editor/assign-reviewer",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: "Pemeriksaan Hasil Review",
      path: "/dashboard/editor/review-results",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: "Riwayat Keputusan",
      path: "/dashboard/editor/decisions",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ];

  const productionLinks = [
    {
      label: "Layout Editor",
      path: "/dashboard/production/layout",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      ),
    },
    {
      label: "Cover Editor",
      path: "/dashboard/production/cover",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      ),
    },
    {
      label: "Publish Editor",
      path: "/dashboard/production/publish",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21"></path><path d="M16 16l-4-4-4 4"></path>
        </svg>
      ),
    },
    {
      label: "Supervisor",
      path: "/dashboard/production/supervisor",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
    },
  ];

  const adminLinks = [
    {
      label: "Ringkasan Sistem",
      path: "/dashboard/admin",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Bukti Transfer",
      path: "/dashboard/admin/transactions",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      badge: "3",
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
      label: "Struktur Organisasi",
      path: "/dashboard/admin/org-structure",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
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
      label: "Monitoring Member",
      path: "/dashboard/admin/members",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: "Manajemen Toko Buku",
      path: "/dashboard/admin/bookstore",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      ),
    },
    {
      label: "Pesanan & Belanja",
      path: "/dashboard/admin/orders",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
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
      label: "Manajemen Sertifikasi",
      path: "/dashboard/admin/certifications",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 11 11 13 15 9" />
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

  const coAdminLinks = [
    {
      label: "Approve Author (User)",
      path: "/dashboard/admin/users",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Approve Member",
      path: "/dashboard/admin/members",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
  ];

  const normalizedRole = role ? role.toLowerCase() : "";

  const getRoleLinks = () => {
    switch (normalizedRole) {
      case "author":   return authorLinks;
      case "reviewer": return reviewerLinks;
      case "editor":   return editorLinks;
      case "admin":    return adminLinks;
      case "co_admin": return coAdminLinks;
      default:         return [];
    }
  };

  const roleLabelMap: Record<string, string> = {
    admin:    "Administrasi",
    co_admin: "Co-Admin",
    editor:   "Editorial",
    reviewer: "Reviewer",
    author:   "Penulis",
  };

  const roleColorMap: Record<string, string> = {
    admin:    "#f59e0b",
    co_admin: "#ec4899",
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

      {/* Role Badge (Static - No longer clickable) */}
      <div className="sidebar-role-badge" style={{ "--role-color": roleColorMap[normalizedRole] || "#c9a84c" } as React.CSSProperties}>
        <div className="sidebar-role-dot" />
        <span style={{ flex: 1 }}>{roleLabelMap[normalizedRole] || normalizedRole} Portal</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Utama</div>
        {commonLinks.map(link => <NavLink key={link.path} link={link} />)}

        {getRoleLinks().length > 0 && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 24 }}>
              Menu {roleLabelMap[normalizedRole] || normalizedRole}
            </div>
            {getRoleLinks().map(link => <NavLink key={link.path} link={link} />)}
          </>
        )}

        {(normalizedRole === "superadmin" || normalizedRole === "layout editor" || normalizedRole === "cover editor" || normalizedRole === "publish editor" || normalizedRole === "supervisor" || normalizedRole === "admin editor") && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 24 }}>Menu Produksi</div>
            {productionLinks.filter((link) => {
               if (normalizedRole === "superadmin") return true;
               if (normalizedRole === "layout editor" && link.label === "Layout Editor") return true;
               if (normalizedRole === "cover editor" && link.label === "Cover Editor") return true;
               if (normalizedRole === "publish editor" && link.label === "Publish Editor") return true;
               if ((normalizedRole === "supervisor" || normalizedRole === "admin editor") && link.label === "Supervisor") return true;
               return false;
            }).map((link) => (
              <NavLink key={link.path} link={link} />
            ))}
          </>
        )}
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
          transition: all 0.2s ease;
        }
        .sidebar-role-badge:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.15);
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
