"use client";

import Link from "next/link";
import { useState } from "react";

export default function JournalManagement() {
  const [journals] = useState([
    { id: 1, code: "RJ", title: "RJRAKP", fullname: "Riau Journal of Review Audit & Knowledge...", color: "from-[#c9a84c] to-[#9a7a30]", users: 215, status: "Active", lastUpdated: "2 days ago" },
    { id: 2, code: "IA", title: "APASIFIC IAEP", fullname: "Impact of Artificial Intelligence on Educ...", color: "from-blue-600 to-indigo-800", users: 1033, status: "Active", lastUpdated: "5 hours ago" },
    { id: 3, code: "MJ", title: "Med J", fullname: "Medical Journal of APASIFIC (Draft)", color: "from-gray-600 to-gray-800", users: 0, status: "Setup", lastUpdated: "Just now" },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<any>(null);

  const handleSettingsClick = (journal: any) => {
    setSelectedJournal(journal);
    setIsSettingsOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-1">Journal Management</h1>
          <p className="text-[#8888aa]">Create and configure OJS instances across the network.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-[#c9a84c]/20 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Create New Journal
        </button>
      </div>

      <div className="bg-[#18182e] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111120] border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-5 font-semibold">Journal Name</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold">Registered Users</th>
                <th className="p-5 font-semibold">Last Updated</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {journals.map((journal) => (
                <tr key={journal.id} className="hover:bg-[#1a1a2e] transition-colors">
                  <td className="p-5">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${journal.color} rounded-lg flex items-center justify-center text-white font-bold font-['Cinzel'] text-xl`}>
                        {journal.code}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{journal.title}</h3>
                        <p className="text-sm text-[#8888aa]">{journal.fullname}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      journal.status === 'Active' ? 'bg-green-400/10 text-green-400' : 'bg-gray-700/30 text-gray-400'
                    }`}>
                      {journal.status === 'Active' ? '● Active' : '○ Setup'}
                    </span>
                  </td>
                  <td className="p-5 text-gray-300 font-semibold">{journal.users.toLocaleString()}</td>
                  <td className="p-5 text-gray-500 text-sm">{journal.lastUpdated}</td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => handleSettingsClick(journal)}
                      className="text-[#c9a84c] hover:text-[#e8c97a] font-semibold text-sm px-4 py-2 border border-[#c9a84c]/30 rounded-lg hover:bg-[#c9a84c]/10 transition-colors"
                    >
                      Settings
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111120] border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-aos="zoom-in">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#18182e]">
              <h2 className="text-xl font-bold text-white font-['Cinzel']">Create New Journal</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Journal Title</label>
                <input type="text" className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" placeholder="e.g. APASIFIC IT Journal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Journal Code (Max 3 letters)</label>
                <input type="text" maxLength={3} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" placeholder="e.g. AIT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Theme Color</label>
                <select className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]">
                  <option>Gold (Default)</option>
                  <option>Blue</option>
                  <option>Crimson</option>
                  <option>Emerald</option>
                </select>
              </div>
              <div className="pt-4">
                <button onClick={() => { alert('Journal creation submitted! (Demo)'); setIsCreateOpen(false); }} className="w-full bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-3 rounded-lg transition-colors">
                  Create Instance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && selectedJournal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111120] border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-aos="zoom-in">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#18182e]">
              <h2 className="text-xl font-bold text-white font-['Cinzel']">Settings: {selectedJournal.code}</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Update Full Name</label>
                <input type="text" defaultValue={selectedJournal.fullname} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select defaultValue={selectedJournal.status} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]">
                  <option value="Active">Active</option>
                  <option value="Setup">Setup (Maintenance)</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsSettingsOpen(false)} className="flex-1 bg-transparent border border-gray-700 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={() => { alert('Settings saved! (Demo)'); setIsSettingsOpen(false); }} className="flex-1 bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-3 rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
