"use client";
import Link from "next/link";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const commonLinks = [
    { label: "Overview", path: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "My Profile", path: "/dashboard/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  const authorLinks = [
    { label: "Submit Manuscript", path: "/dashboard/submit", icon: "M12 4v16m8-8H4" },
    { label: "My Submissions", path: "/dashboard/submissions", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  const reviewerLinks = [
    { label: "Pending Reviews", path: "/dashboard/reviews/pending", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Review History", path: "/dashboard/reviews/history", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  ];

  const editorLinks = [
    { label: "Editorial Board", path: "/dashboard/editor", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  ];

  const adminLinks = [
    { label: "System Overview", path: "/dashboard/admin", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Journal Mgmt", path: "/dashboard/admin/journals", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { label: "Editorial Board", path: "/dashboard/admin/editorial-board", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Leadership Mgmt", path: "/dashboard/admin/leadership", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "User Mgmt", path: "/dashboard/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Financials", path: "/dashboard/admin/financials", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Rates & Settings", path: "/dashboard/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  const getRoleLinks = () => {
    switch(role) {
      case 'author': return authorLinks;
      case 'reviewer': return reviewerLinks;
      case 'editor': return editorLinks;
      case 'admin': return adminLinks;
      default: return [];
    }
  };

  return (
    <div className="w-64 bg-[#0d0d1a] text-[#8888aa] border-r border-[#1a1a2e] flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-[#1a1a2e]">
        <span className="text-xl font-bold text-[#c9a84c] font-['Cinzel']">APASIFIC Hub</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Main</div>
          {commonLinks.map((link) => (
            <Link key={link.label} href={link.path} className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-[#1a1a2e] hover:text-white transition-colors">
              <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
              </svg>
              {link.label}
            </Link>
          ))}

          <div className="mt-8">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              {role} Actions
            </div>
            {getRoleLinks().map((link) => (
              <Link key={link.label} href={link.path} className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-[#1a1a2e] hover:text-white transition-colors">
                <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
