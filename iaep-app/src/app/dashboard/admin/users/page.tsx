"use client";

import { useState } from "react";

export default function UserManagement() {
  const [users] = useState([
    { id: 1, name: "M. A. Rahman", email: "marahman2169@gmail.com", role: "Editor", journal: "RJRAKP, APASIFIC IAEP", joined: "Oct 2024", status: "Active" },
    { id: 2, name: "Kadin Medan", email: "kadinmedan1@gmail.com", role: "Reviewer", journal: "RJRAKP", joined: "Nov 2024", status: "Active" },
    { id: 3, name: "Kad Sumut", email: "kadsumut@gmail.com", role: "Author", journal: "APASIFIC IAEP", joined: "Dec 2024", status: "Active" },
    { id: 4, name: "Jane Doe", email: "jane.doe@university.edu", role: "Author", journal: "RJRAKP", joined: "Jan 2025", status: "Pending" },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-1">User Management</h1>
          <p className="text-[#8888aa]">Manage global users, assign cross-journal roles, and monitor activity.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search users by email..." className="bg-[#18182e] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#c9a84c] w-64" />
          </div>
          <button className="bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-2 px-4 rounded-lg shadow-lg shadow-[#c9a84c]/20 transition-all">
            Invite User
          </button>
        </div>
      </div>

      <div className="bg-[#18182e] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111120] border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-5 font-semibold">User Details</th>
                <th className="p-5 font-semibold">Global Role</th>
                <th className="p-5 font-semibold">Assigned Journals</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#1a1a2e] transition-colors">
                  <td className="p-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      user.role === 'Editor' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                      user.role === 'Reviewer' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                      'bg-gray-800 text-gray-300 border border-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="text-sm text-gray-300 max-w-[200px] truncate">{user.journal}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-gray-400">{user.status}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button className="text-gray-400 hover:text-white px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors mr-2">Edit</button>
                    <button className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/20 hover:bg-red-900/40 rounded transition-colors">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
