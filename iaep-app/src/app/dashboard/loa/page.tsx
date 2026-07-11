"use client";
import React from 'react';
import { Clock, Download, FileCheck } from 'lucide-react';

export default function AcceptanceLetter() {
  // The LoAs will be fetched from the database
  const loas: any[] = [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white tracking-tight">Acceptance Letter (LoA)</h1>
        <p className="text-zinc-400 mt-2 text-sm">Unduh dokumen Letter of Acceptance (LoA) untuk artikel Anda yang telah disetujui.</p>
      </div>

      {/* LoA List */}
      <div className="space-y-4">
        {loas.map((loa) => (
          <div key={loa.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-zinc-900/60 hover:border-emerald-500/30 transition-all group">
            
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                  {loa.journal}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  {loa.target.replace('TARGET: ', '')}
                </span>
              </div>
              
              <h3 className="text-lg font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors leading-relaxed">
                {loa.title}
              </h3>
              
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <FileCheck className="w-3.5 h-3.5" /> Disubmit: {loa.date}
              </div>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
              {loa.status === 'pending' ? (
                <div className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 font-medium px-5 py-2.5 rounded-md text-sm">
                  <Clock className="w-4 h-4" /> LoA Belum Diterbitkan
                </div>
              ) : (
                <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-md text-sm shadow-sm ring-1 ring-emerald-500/50 transition-all">
                  <Download className="w-4 h-4" /> Unduh LoA (PDF)
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
