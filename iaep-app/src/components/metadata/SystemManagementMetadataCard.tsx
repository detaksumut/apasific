'use client';

import React, { useState } from 'react';
import { 
  APASIFIC_SYSTEM_MANAGEMENT_METADATA 
} from '@/config/systemManagementMetadata';
import { ShieldCheck, ExternalLink, ChevronDown, ChevronUp, Database, FileCheck } from 'lucide-react';

export const SystemManagementMetadataCard: React.FC = () => {
  const [showRoleDeclaration, setShowRoleDeclaration] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const metadata = APASIFIC_SYSTEM_MANAGEMENT_METADATA;

  // Static ISO UTC verification timestamp for clean deterministic rendering
  const verificationTimestamp = "2026-08-27T00:00:00Z";

  return (
    <div className="rounded-2xl border border-[#c9a84c]/35 bg-gradient-to-b from-[#0e1022] via-[#090a16] to-[#06060c] p-6 text-white shadow-[0_4px_24px_rgba(0,0,0,0.45)] relative overflow-hidden space-y-5">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="border-b border-[#c9a84c]/20 pb-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c9a84c] shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#c9a84c]">
              APASIFIC System Management Metadata™
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#c9a84c]/10 text-[#e8c96a] px-2.5 py-0.5 rounded border border-[#c9a84c]/30">
            {metadata.recordId}
          </span>
        </div>
        
        <div className="text-sm font-bold text-white tracking-wide">
          {metadata.registryTitle}
        </div>
        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          {metadata.governanceScope} • Standard {metadata.governance.version}
        </p>
      </div>

      {/* 5 Persistent Research Identifiers */}
      <div className="space-y-2.5">
        <div className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-[#c9a84c]" />
          <span>Persistent Research Identifiers</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {/* ORCID */}
          <div className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-800 rounded-xl hover:border-[#a6ce39]/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a6ce39]" />
              <span className="text-zinc-300 font-sans font-semibold text-[11px]">ORCID iD</span>
            </div>
            <a 
              href={metadata.identifiers.orcid.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#a6ce39] hover:underline flex items-center gap-1 font-bold text-[11.5px]"
            >
              <span>{metadata.identifiers.orcid.id}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Scopus */}
          <div className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-800 rounded-xl hover:border-[#ff7700]/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff7700]" />
              <span className="text-zinc-300 font-sans font-semibold text-[11px]">Scopus Author ID</span>
            </div>
            <a 
              href={metadata.identifiers.scopus.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#ff9f43] hover:underline flex items-center gap-1 font-bold text-[11.5px]"
            >
              <span>{metadata.identifiers.scopus.id}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Web of Science */}
          <div className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-800 rounded-xl hover:border-[#a78bfa]/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a78bfa]" />
              <span className="text-zinc-300 font-sans font-semibold text-[11px]">WoS ResearcherID</span>
            </div>
            <a 
              href={metadata.identifiers.wos.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#c084fc] hover:underline flex items-center gap-1 font-bold text-[11.5px]"
            >
              <span>{metadata.identifiers.wos.id}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Google Scholar */}
          <div className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-800 rounded-xl hover:border-[#60a5fa]/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
              <span className="text-zinc-300 font-sans font-semibold text-[11px]">Google Scholar</span>
            </div>
            <a 
              href={metadata.identifiers.googleScholar.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#93c5fd] hover:underline flex items-center gap-1 font-bold text-[11.5px]"
            >
              <span>{metadata.identifiers.googleScholar.id}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* SINTA */}
          <div className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-800 rounded-xl hover:border-[#10b981]/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-zinc-300 font-sans font-semibold text-[11px]">SINTA Author ID</span>
            </div>
            <a 
              href={metadata.identifiers.sinta.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#34d399] hover:underline flex items-center gap-1 font-bold text-[11.5px]"
            >
              <span>{metadata.identifiers.sinta.id}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Metadata Governance Badges */}
      <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-[11px] text-zinc-400">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Metadata Steward:</span>
          <span className="font-bold text-white">{metadata.governance.steward}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Integrity Status:</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {metadata.governance.integrityStatus}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Verification Authority:</span>
          <span className="text-zinc-300 font-medium text-right text-[10px]">
            {metadata.governance.authority}
          </span>
        </div>
      </div>

      {/* Expandable Role Declaration */}
      <div className="border-t border-zinc-800/80 pt-3">
        <button
          type="button"
          onClick={() => setShowRoleDeclaration(!showRoleDeclaration)}
          className="w-full flex items-center justify-between text-xs text-[#c9a84c] hover:text-[#e8c96a] font-bold transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Role Declaration &amp; Provenance</span>
          </span>
          {showRoleDeclaration ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRoleDeclaration && (
          <div className="mt-3 p-3.5 bg-black/60 border border-zinc-800 rounded-xl space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Deklarasi Peran Tata Kelola
              </span>
              <div className="flex gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLang('id')}
                  className={`px-2 py-0.5 rounded ${lang === 'id' ? 'bg-[#c9a84c] text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-[#c9a84c] text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  EN
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
              {lang === 'id' ? metadata.roleDeclaration.id : metadata.roleDeclaration.en}
            </p>

            <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
              Verified Timestamp: {verificationTimestamp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
