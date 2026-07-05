"use client";

import { useState } from "react";

export default function ReviewHistory() {
  const [history] = useState([
    {
      id: "REV-2026-001",
      title: "Analyzing Regional Economic Policies Post-Pandemic in ASEAN",
      journal: "RJRAKP",
      dateCompleted: "May 20, 2026",
      decision: "Accept with Minor Revisions",
      articleLevel: "S3 (Doktor / Profesor)",
      honorarium: "Rp 500.000",
      status: "Paid"
    },
    {
      id: "REV-2026-042",
      title: "Machine Learning Models for Predicting Inflation Rates",
      journal: "APASIFIC IAEP",
      dateCompleted: "June 15, 2026",
      decision: "Major Revisions Required",
      articleLevel: "Mahasiswa (Belum Lulus S1)",
      honorarium: "Rp 250.000",
      status: "Pending Payment"
    },
    {
      id: "REV-2026-088",
      title: "The Efficacy of Remote Work on Corporate Productivity",
      journal: "RJRAKP",
      dateCompleted: "July 02, 2026",
      decision: "Reject",
      articleLevel: "S1 (Sarjana / Menulis untuk S2)",
      honorarium: "Rp 350.000",
      status: "Pending Payment"
    }
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-1">Review History</h1>
          <p className="text-[#8888aa]">Track your completed reviews and earned honorariums.</p>
        </div>
        <div className="bg-[#12121f] rounded-lg p-3 border border-green-500/20 shadow-lg text-right">
          <div className="text-xs text-[#8888aa] font-bold">TOTAL HONORARIUM EARNED</div>
          <div className="text-xl font-bold text-green-400">Rp 1.100.000</div>
        </div>
      </div>

      <div className="bg-[#18182e] rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111120] border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-5 font-bold">Article Details</th>
                <th className="p-5 font-bold">Journal & Date</th>
                <th className="p-5 font-bold">Article Level</th>
                <th className="p-5 font-bold">Your Decision</th>
                <th className="p-5 font-bold text-right">Honorarium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {history.map((rev) => (
                <tr key={rev.id} className="hover:bg-[#1a1a2e] transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-white text-base mb-1">{rev.title}</div>
                    <div className="text-xs text-gray-500">ID: {rev.id}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-sm font-semibold text-[#c9a84c]">{rev.journal}</div>
                    <div className="text-xs text-gray-400">Completed: {rev.dateCompleted}</div>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      rev.articleLevel.includes('S3') ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                      rev.articleLevel.includes('S2') || rev.articleLevel.includes('S1') ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                      'bg-gray-800 text-gray-300 border border-gray-600'
                    }`}>
                      {rev.articleLevel}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      rev.decision.includes('Accept') ? 'bg-green-900/30 text-green-400' :
                      rev.decision.includes('Reject') ? 'bg-red-900/30 text-red-400' :
                      'bg-yellow-900/30 text-yellow-500'
                    }`}>
                      {rev.decision}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="font-bold text-[#c9a84c] text-lg">{rev.honorarium}</div>
                    <div className={`text-xs font-bold mt-1 ${
                      rev.status === 'Paid' ? 'text-green-500' : 'text-yellow-500 animate-pulse'
                    }`}>
                      {rev.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {history.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-semibold text-gray-400 mb-2">No reviews completed yet</p>
            <p className="text-sm">Your honorarium details will appear here once you complete a review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
