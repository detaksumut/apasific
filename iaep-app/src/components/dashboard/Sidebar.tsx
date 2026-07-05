"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const commonLinks = [
    { label: "Overview",    path: "/dashboard",         icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Profil Saya", path: "/dashboard/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  const authorLinks = [
    { label: "Submit Naskah",    path: "/dashboard/submit",      icon: "M12 4v16m8-8H4" },
    { label: "Submission Saya",  path: "/dashboard/submissions", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  const reviewerLinks = [
    { label: "Review Pending",  path: "/dashboard/reviews/pending", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Riwayat Review",  path: "/dashboard/reviews/history", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  ];

  const editorLinks = [
    { label: "Dewan Editorial", path: "/dashboard/editor", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  ];

  const adminLinks = [
    { label: "System Overview",  path: "/dashboard/admin",                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Manajemen Jurnal", path: "/dashboard/admin/journals",       icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { label: "Dewan Editorial",  path: "/dashboard/admin/editorial-board",icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Manajemen Pimpinan",path: "/dashboard/admin/leadership",    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Manajemen User",   path: "/dashboard/admin/users",          icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Keuangan",         path: "/dashboard/admin/financials",     icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Tarif & Pengaturan",path: "/dashboard/admin/settings",      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
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
    admin:    "Admin",
    editor:   "Editor",
    reviewer: "Reviewer",
    author:   "Author",
  };

  const NavLink = ({ link }: { link: { label: string; path: string; icon: string } }) => {
    const isActive = pathname === link.path;
    return (
      <Link
        href={link.path}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 16px",
          borderRadius: "10px",
          fontSize: "13.5px",
          fontWeight: isActive ? 600 : 400,
          color: isActive ? "#c9a84c" : "rgba(255,255,255,0.5)",
          background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
          border: isActive ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
          textDecoration: "none",
          transition: "all 0.18s",
          marginBottom: "4px",
        }}
        onMouseEnter={e => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }
        }}
      >
        <svg
          style={{ width: 17, height: 17, flexShrink: 0, color: isActive ? "#c9a84c" : "rgba(255,255,255,0.35)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={link.icon} />
        </svg>
        {link.label}
      </Link>
    );
  };

  return (
    <div
      className="hidden md:flex"
      style={{
        width: 260,
        background: "#09090f",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{
        padding: "28px 24px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#c9a84c", letterSpacing: "1.5px", fontFamily: "serif" }}>
          APASIFIC
        </div>
        <div style={{ fontSize: 10, color: "rgba(201,168,76,0.45)", letterSpacing: "1px", marginTop: 3 }}>
          HUB AKADEMIK
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px" }}>

        {/* Section: Utama */}
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", marginBottom: 12, paddingLeft: 4 }}>
          UTAMA
        </div>
        {commonLinks.map(link => <NavLink key={link.path} link={link} />)}

        {/* Section: Role Actions */}
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", marginTop: 32, marginBottom: 12, paddingLeft: 4 }}>
          {roleLabelMap[role] || role} ACTIONS
        </div>
        {getRoleLinks().map(link => <NavLink key={link.path} link={link} />)}

      </div>

      {/* Footer */}
      <div style={{
        padding: "20px 20px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 10 }}>
          v1.0.0 · IAEP Platform
        </div>
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, color: "rgba(255,255,255,0.35)",
            textDecoration: "none", transition: "color 0.2s",
          }}
        >
          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
