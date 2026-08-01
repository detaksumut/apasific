"use client";

import React, { useState } from 'react';

export default function ResearchProfile() {
  const [profileName] = useState("DR. SAIFHUL ANUAR SYAHDAN, S.E.");
  
  // Dummy data representing Phase 1 state where metadata is manually inputted
  const mockPublication = {
    title: "Implementation and Engineering Validation of IAEEA",
    type: "Preprint",
    repository: "SSRN",
    identifier: "SSRN Abstract ID 7213621",
    doi: "Not Assigned",
    status: "Under Review",
    url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7213621"
  };

  return (
    <div className="bg-[#05050a] min-h-screen p-8 font-sans text-gray-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-[#0a0a14] border border-[#c9a84c]/20 rounded-xl p-8 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a38031] flex items-center justify-center text-black text-3xl font-bold shadow-lg">
              SAS
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{profileName}</h1>
              <p className="text-[#c9a84c] tracking-widest text-sm uppercase">Academic Identity & Research Profile</p>
            </div>
          </div>
        </div>

        {/* Publications List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">
            Research Publications
          </h2>
          
          <div className="bg-[#0a0a14] border border-gray-800 hover:border-[#c9a84c]/50 transition-colors rounded-xl p-6 relative overflow-hidden group">
            {/* Glowing Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#c9a84c] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <h3 className="text-xl font-bold text-white mb-4">
              {mockPublication.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-xs tracking-wider">Type</span>
                <span className="font-semibold text-gray-300">{mockPublication.type}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-xs tracking-wider">Repository</span>
                <span className="font-semibold text-[#c9a84c] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  {mockPublication.repository}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-xs tracking-wider">Identifier</span>
                <a href={mockPublication.url} target="_blank" rel="noreferrer" className="font-mono text-gray-300 hover:text-white transition-colors underline decoration-gray-700 underline-offset-4">
                  {mockPublication.identifier}
                </a>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-xs tracking-wider">DOI</span>
                <span className="font-semibold text-gray-400 italic">{mockPublication.doi}</span>
              </div>
              
              <div className="flex flex-col gap-1 md:col-span-2 mt-2">
                <span className="text-gray-500 uppercase text-xs tracking-wider">Status</span>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                    {mockPublication.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
