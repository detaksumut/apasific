"use client";
import { useState } from "react";

export default function LeadershipManagementPage() {
  const [selectedBody, setSelectedBody] = useState("");

  const bodies = [
    "ASIA Board of Certification (BOC)",
    "ASIACERT",
    "ASIA Quality Assurance & Accreditation Board (ASIA-QAAB)",
    "ASIA Competition Center (ASIA-CC)",
    "ASIA Publication & Knowledge Center (ASIA-PKC)",
    "ASIA Academic Mobility Center (ASIA-AMC)",
    "ASIA Research & Innovation Council (ASIA-RIC)",
    "ASIA Conference & Academic Forum (ASIA-CAF)"
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-['Cinzel']">Leadership Management</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage the Head and Secretary for each Strategic & Certification Body.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Certification / Strategic Body</label>
        <select 
          className="w-full max-w-xl p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none transition-all"
          value={selectedBody}
          onChange={(e) => setSelectedBody(e.target.value)}
        >
          <option value="" disabled>-- Select Body --</option>
          {bodies.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {selectedBody && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#0d0d1a] px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#c9a84c] font-['Cinzel']">
              Leadership Data: {selectedBody}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            
            {/* Left Column: KETUA (HEAD) */}
            <div className="space-y-6">
              <div className="border-b-2 border-[#c9a84c] pb-2 mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-['Cinzel'] uppercase">Ketua (Head)</h3>
              </div>
              
              <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-3 overflow-hidden">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <span className="text-sm font-medium text-[#c9a84c]">Upload Photo</span>
                <span className="text-xs text-gray-400 mt-1">Recommended: 1:1 ratio, max 2MB</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name with Title</label>
                <input type="text" placeholder="e.g. Prof. Dr. Budi Santoso, M.Si." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input type="text" placeholder="e.g. Head of ASIA-QAAB" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" placeholder="e.g. Indonesia" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic ID</label>
                <input type="text" placeholder="e.g. ASIA-2025-0001" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none" />
              </div>
            </div>

            {/* Right Column: SEKRETARIS (SECRETARY) */}
            <div className="space-y-6">
              <div className="border-b-2 border-gray-300 pb-2 mb-6">
                <h3 className="text-xl font-bold text-gray-700 font-['Cinzel'] uppercase">Sekretaris (Secretary)</h3>
              </div>
              
              <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-3 overflow-hidden">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <span className="text-sm font-medium text-gray-500">Upload Photo</span>
                <span className="text-xs text-gray-400 mt-1">Recommended: 1:1 ratio, max 2MB</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name with Title</label>
                <input type="text" placeholder="e.g. Dr. Siti Aminah, M.Pd." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input type="text" placeholder="e.g. Secretary of ASIA-QAAB" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" placeholder="e.g. Malaysia" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic ID</label>
                <input type="text" placeholder="e.g. ASIA-2025-0002" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a84c] focus:border-[#c9a84c] outline-none" />
              </div>
            </div>
            
          </div>

          {/* Action Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button className="px-6 py-2.5 bg-[#0d0d1a] text-[#c9a84c] font-semibold rounded-lg shadow hover:bg-[#1a1a2e] transition-colors border border-[#c9a84c]/30">
              Save Leadership Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
