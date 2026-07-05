"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function SuperAdminOverview() {
  const [submissionCount, setSubmissionCount] = useState(342);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // 1. Calculate submissions count dynamically
    const defaultSubsLength = 3;
    const storedSubs = localStorage.getItem("mock_submissions");
    if (storedSubs) {
      try {
        const parsed = JSON.parse(storedSubs);
        const addedCount = Math.max(0, parsed.length - defaultSubsLength);
        setSubmissionCount(342 + addedCount);
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Load system logs
    const defaultLogs = [
      { time: "10 mins ago", text: "New Journal created: 'APASIFIC Medical Journal'", status: "success" },
      { time: "1 hour ago", text: "System backup completed successfully.", status: "info" },
      { time: "3 hours ago", text: "M. A. Rahman granted 'Editor' role in RJRAKP.", status: "warning" },
      { time: "1 day ago", text: "High traffic warning: 50+ simultaneous submissions.", status: "error" },
    ];

    const storedLogs = localStorage.getItem("mock_system_logs");
    if (storedLogs) {
      try {
        setActivities(JSON.parse(storedLogs));
      } catch (e) {
        setActivities(defaultLogs);
      }
    } else {
      localStorage.setItem("mock_system_logs", JSON.stringify(defaultLogs));
      setActivities(defaultLogs);
    }
  }, []);

  const stats = [
    { label: "Total Journals", value: "3", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { label: "Active Users", value: "1,248", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Total Submissions", value: String(submissionCount), icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "System Health", value: "99.9%", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header */}
      <div className="bg-[#12121f] rounded-2xl shadow-xl overflow-hidden border border-[#c9a84c]/20 relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <svg className="w-32 h-32 text-[#c9a84c]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="px-8 py-10 relative z-10">
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-2">Super Admin Overview</h1>
          <p className="text-[#8888aa]">Global oversight of the APASIFIC Academician Publishing Network.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#18182e] p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-[#c9a84c]/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#0d0d1a] rounded-lg group-hover:bg-[#c9a84c]/10 transition-colors">
                <svg className="w-6 h-6 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
              </div>
              <div className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+12%</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-[#8888aa]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hosted Journals */}
        <div className="lg:col-span-2 bg-[#18182e] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#111120]">
            <h2 className="text-lg font-bold text-white">Hosted Journals (OJS)</h2>
            <Link href="/dashboard/admin/journals" className="text-sm font-semibold text-[#c9a84c] hover:text-[#e8c97a]">Manage All</Link>
          </div>
          <div className="divide-y divide-gray-800">
            <div className="p-6 flex items-center justify-between hover:bg-[#1a1a2e] transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c9a84c] to-[#9a7a30] rounded-lg flex items-center justify-center text-white font-bold font-['Cinzel'] text-xl">RJ</div>
                <div>
                  <h3 className="font-bold text-white text-lg">RJRAKP</h3>
                  <p className="text-sm text-[#8888aa]">Riau Journal of Review Audit & Knowledge...</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">215 Users</div>
                <div className="text-xs text-green-400">● Active</div>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between hover:bg-[#1a1a2e] transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-lg flex items-center justify-center text-white font-bold font-['Cinzel'] text-xl">IA</div>
                <div>
                  <h3 className="font-bold text-white text-lg">APASIFIC IAEP</h3>
                  <p className="text-sm text-[#8888aa]">Impact of Artificial Intelligence...</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">1,033 Users</div>
                <div className="text-xs text-green-400">● Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-[#18182e] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800 bg-[#111120]">
            <h2 className="text-lg font-bold text-white">System Logs</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {activities.map((act, i) => (
                <div key={i} className="flex relative">
                  {i !== activities.length - 1 && <div className="absolute top-8 left-[9px] w-0.5 h-full bg-gray-800 -z-10"></div>}
                  <div className={`mt-1.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-[#18182e] ${
                    act.status === 'success' ? 'bg-green-500' :
                    act.status === 'warning' ? 'bg-yellow-500' :
                    act.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs text-gray-500 font-mono mb-1">{act.time}</p>
                    <p className="text-sm text-gray-300">{act.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm font-semibold hover:bg-gray-800 hover:text-white transition-colors">
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
