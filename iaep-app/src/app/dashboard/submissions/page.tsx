"use client";
 
import Link from "next/link";
import { useState, useEffect } from "react";
 
export default function MySubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const defaultSubs = [
      {
        id: "1045",
        title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education",
        journal: "APASIFIC IAEP",
        date: "July 01, 2026",
        status: "Under Review",
        lastAction: "Sent to Reviewers on July 03, 2026"
      },
      {
        id: "1022",
        title: "Analyzing Regional Economic Policies Post-Pandemic in ASEAN",
        journal: "RJRAKP",
        date: "May 15, 2026",
        status: "Published",
        lastAction: "Published in Vol. 4 No. 2 (2026)"
      },
      {
        id: "1056",
        title: "Blockchain Integration in Academic Credential Verification",
        journal: "APASIFIC IAEP",
        date: "July 04, 2026",
        status: "Awaiting Assignment",
        lastAction: "Submitted successfully"
      }
    ];

    const stored = localStorage.getItem("mock_submissions");
    if (stored) {
      setSubmissions(JSON.parse(stored));
    } else {
      localStorage.setItem("mock_submissions", JSON.stringify(defaultSubs));
      setSubmissions(defaultSubs);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-['Cinzel'] mb-1">My Submissions</h1>
          <p className="text-gray-500">Track the status of your submitted manuscripts.</p>
        </div>
        <Link 
          href="/dashboard/submit" 
          className="bg-[#0d0d1a] hover:bg-[#1a1a2e] text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Submission
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600">
                <th className="p-5 font-bold">ID</th>
                <th className="p-5 font-bold">Manuscript Title</th>
                <th className="p-5 font-bold">Journal</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 text-sm font-semibold text-gray-500">#{sub.id}</td>
                  <td className="p-5">
                    <div className="font-bold text-gray-800 text-base mb-1">{sub.title}</div>
                    <div className="text-xs text-gray-500">Submitted: {sub.date} • {sub.lastAction}</div>
                  </td>
                  <td className="p-5 text-sm font-semibold text-[#c9a84c]">{sub.journal}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      sub.status === 'Published' ? 'bg-green-100 text-green-700 border border-green-200' :
                      sub.status === 'Under Review' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button className="text-sm font-bold text-[#c9a84c] border border-[#c9a84c]/30 px-4 py-2 rounded hover:bg-[#c9a84c]/10 transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {submissions.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-semibold text-gray-700 mb-2">No submissions found</p>
            <p className="text-sm">You haven't submitted any manuscripts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
