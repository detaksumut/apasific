"use client";

import { useState } from "react";

export default function EditorialBoardManagement() {
  const [selectedJournal, setSelectedJournal] = useState("RJRAKP");

  const boardStructure = [
    {
      category: "Executive Leadership",
      roles: [
        { title: "Editor in Chief", current: "Prof. Dr. Alan Turing", available: ["Prof. Dr. Alan Turing", "Dr. Sarah Connor"] },
      ]
    },
    {
      category: "Core Editorial Team",
      roles: [
        { title: "Editor on Board", current: "M. A. Rahman", available: ["M. A. Rahman", "John Smith"] },
        { title: "Editor on Board", current: "Dr. Emily Chen", available: ["Dr. Emily Chen", "Michael Chang"] },
      ]
    },
    {
      category: "Peer Review Team",
      roles: [
        { title: "Reviewer On Board", current: "Kadin Medan", available: ["Kadin Medan", "Dr. Bruce Wayne"] },
        { title: "Reviewer On Board", current: "Prof. John von Neumann", available: ["Prof. John von Neumann", "Clark Kent"] },
      ]
    },
    {
      category: "Production Team",
      roles: [
        { title: "Copy Editor", current: "Unassigned", available: ["Alice Wonderland", "Bob Builder"] },
        { title: "Layout Editor", current: "Unassigned", available: ["Charlie Chaplin", "David Copperfield"] },
        { title: "Cover Editor", current: "Unassigned", available: ["Eve Adams", "Frank Castle"] },
        { title: "Publish Editor", current: "Unassigned", available: ["Grace Hopper", "Heidi Klum"] },
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-1">Editorial Board (Dewan Redaksi)</h1>
          <p className="text-[#8888aa]">Structurally manage and assign roles for the journal's board members.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-gray-400">Journal:</label>
          <select 
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
            className="bg-[#18182e] border border-[#c9a84c]/50 text-white font-bold rounded-lg px-4 py-2 focus:outline-none focus:border-[#c9a84c] min-w-[200px]"
          >
            <option value="RJRAKP">RJRAKP</option>
            <option value="IAEP">APASIFIC IAEP</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {boardStructure.map((section, idx) => (
          <div key={idx} className="bg-[#12121f] rounded-2xl shadow-xl border border-[rgba(201,168,76,0.2)] overflow-hidden">
            <div className="bg-gradient-to-r from-[#18182e] to-[#12121f] px-6 py-4 border-b border-[rgba(201,168,76,0.2)]">
              <h2 className="text-xl font-bold text-[#c9a84c]">{section.category}</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.roles.map((role, rIdx) => (
                <div key={rIdx} className="bg-[#18182e] p-5 rounded-xl border border-gray-800 hover:border-[#c9a84c]/50 transition-colors flex flex-col">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{role.title}</div>
                  
                  {role.current !== "Unassigned" ? (
                    <div className="flex items-center gap-3 mb-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                        {role.current.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{role.current}</div>
                        <div className="text-xs text-green-400">Assigned</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-4 flex-1 opacity-50">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500">
                        ?
                      </div>
                      <div className="font-bold text-gray-500 text-sm italic">Vacant Position</div>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-800">
                    <button className={`w-full py-2 rounded font-semibold text-sm transition-colors ${
                      role.current === "Unassigned" 
                        ? "bg-[#c9a84c] hover:bg-[#b0923d] text-black" 
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}>
                      {role.current === "Unassigned" ? "Assign Member" : "Reassign Role"}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add New Slot Button */}
              <div className="bg-[#18182e]/50 border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center p-5 hover:border-gray-600 hover:bg-[#1a1a2e] transition-colors cursor-pointer group">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-gray-700 text-gray-400 flex items-center justify-center mx-auto mb-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  </div>
                  <div className="text-xs font-bold text-gray-500 group-hover:text-gray-400">Add New Slot</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
