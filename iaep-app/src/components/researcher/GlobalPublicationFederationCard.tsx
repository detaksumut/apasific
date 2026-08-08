// src/components/researcher/GlobalPublicationFederationCard.tsx
import React from 'react';

export const GlobalPublicationFederationCard = ({ 
  article 
}: { 
  article: {
    doi?: string;
    zenodo_id?: string;
    orcid?: string;
    scopus_citations?: number;
    wos_citations?: number;
    keywords?: string[];
  } 
}) => {
  const doiValue = article.doi ? article.doi.replace(/https?:\/\/doi\.org\//i, '').trim() : '';
  const isDoiVerified = !!doiValue;
  
  let zenodoId = article.zenodo_id;
  if ((!zenodoId || zenodoId === '0') && doiValue.includes('zenodo.')) {
    const parts = doiValue.split('zenodo.');
    if (parts.length > 1) {
      zenodoId = parts[1];
    }
  }
  
  const isZenodoVerified = zenodoId && zenodoId !== '0';
  const totalCitations = (article.scopus_citations || 0) + (article.wos_citations || 0);

  return (
    <div className="bg-[#070714] rounded-xl border border-blue-950/40 shadow-2xl overflow-hidden mt-6 text-[#e8e8f0]">
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 px-6 py-4 border-b border-blue-950/60">
        <h3 className="text-xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5 tracking-wide">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Global Scholarly Identity
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. External Presence Snapshot */}
          <div className="flex-1">
            <div className="space-y-4">
              
              {/* Publisher Verification */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Publisher Verification</h3>
                <div className="space-y-2 bg-[#0b0c16]/80 rounded-lg p-3 border border-blue-950/30 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium">Publisher:</span>{' '}
                    <span className="font-semibold text-white">PT Bernas Sumut Jaya</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Legal Entity:</span>{' '}
                    <span className="font-semibold text-white font-mono">AHU-0034291.AH.01.01.2026</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">KBLI:</span>{' '}
                    <span className="font-semibold text-white">58110 (Penerbitan Buku/Jurnal) &amp; 63121 (Penerbitan Portal Web Digital)</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-blue-950/40">
                    <div>
                      <span className="text-gray-500 font-medium">Status:</span>{' '}
                      <span className="text-green-400 font-bold">Verified</span>
                    </div>
                    <span className="text-[10px] text-gray-500 italic">Evidence: AHU Online System</span>
                  </div>
                </div>
              </div>

              {/* Publisher DOI */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Publisher Identity</h3>
                <div className={`flex items-center justify-between p-3 rounded-lg border ${isDoiVerified ? (doiValue.includes('zenodo') ? 'bg-[#1b253c]/40 border-blue-900/30' : 'bg-[#2d181b]/40 border-red-900/30') : 'bg-[#0b0c16]/80 border-blue-950/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-950/40 rounded-full flex items-center justify-center shadow-sm border border-blue-900/20">
                      {doiValue.includes('zenodo') ? (
                        <span className="text-blue-400 font-bold text-xs">ZD</span>
                      ) : (
                        <span className="text-red-400 font-bold text-xs">CR</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-sm">
                        {doiValue.includes('zenodo') ? 'Zenodo DOI' : 'Crossref DOI'}
                      </span>
                      <span className={`text-xs font-mono mt-0.5 max-w-[200px] truncate ${doiValue.includes('zenodo') ? 'text-blue-300' : 'text-red-300'}`}>{doiValue || 'Not Registered'}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDoiVerified ? 'bg-green-950/40 text-green-400 border border-green-900/20' : 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/20'}`}>
                    {isDoiVerified ? '✅ Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Archive */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Archive</h3>
                <div className="space-y-3 bg-[#0b0c16]/80 rounded-lg p-3 border border-blue-950/30 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/logo-zenodo.jpg" className="w-14 h-14 object-contain" alt="Zenodo" />
                      <div className="flex flex-col">
                        <a href="https://zenodo.org/me/uploads?q=&f=shared_with_me%3Afalse&l=list&p=1&s=10&sort=newest" target="_blank" rel="noopener noreferrer" className="text-white font-semibold text-base hover:text-blue-400 transition-colors">
                          Zenodo Backup
                        </a>
                        <span className="text-xs text-gray-400 font-mono">{isZenodoVerified ? zenodoId : 'Not Deposited'}</span>
                      </div>
                    </div>
                    {isZenodoVerified && (
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Discovery Network */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Discovery</h3>
                <div className="space-y-3 bg-[#0b0c16]/80 rounded-lg p-3 border border-blue-950/30 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/logo-openaire.jpg" className="w-14 h-14 object-contain" alt="OpenAIRE" />
                      <div className="flex flex-col">
                        <a href={isZenodoVerified ? `https://explore.openaire.eu/search/find/publications?keyword=${doiValue}` : '#'} target="_blank" rel="noopener noreferrer" className="text-white font-semibold text-base hover:text-blue-400 transition-colors">
                          OpenAIRE
                        </a>
                        <span className="text-xs text-gray-400">{isZenodoVerified ? 'Indexed' : 'Pending'}</span>
                      </div>
                    </div>
                    {isZenodoVerified && (
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/logo-openalex.png" className="w-14 h-14 object-contain" alt="OpenAlex" />
                      <div className="flex flex-col">
                        <a href={isDoiVerified ? `https://openalex.org/works?filter=doi:${doiValue}` : '#'} target="_blank" rel="noopener noreferrer" className="text-white font-semibold text-base hover:text-blue-400 transition-colors">
                          OpenAlex
                        </a>
                        <span className="text-xs text-gray-400">{isDoiVerified ? 'Indexed' : 'Pending'}</span>
                      </div>
                    </div>
                    {isDoiVerified && (
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Research Impact */}
          <div className="flex flex-col gap-6 text-xs">
            <div className="space-y-4 pt-4 md:pt-0 border-t md:border-t-0 border-blue-950/40">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Research Impact</h4>
                           <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-blue-950/40 rounded-lg border border-blue-900/30">
                  <span className="block text-xs text-blue-400 font-semibold uppercase mb-2">In Progress Projects</span>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-medium">Campus-OS</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#1d1d36]/60 text-[#c9a84c] border border-yellow-900/20">
                        In Progress
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-medium">aptisi-app</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#1d1d36]/60 text-[#c9a84c] border border-yellow-900/20">
                        In Progress
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-medium">UltimateAI</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#1d1d36]/60 text-[#c9a84c] border border-yellow-900/20">
                        In Progress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Artifacts */}
            <div className="space-y-4 pt-4 border-t border-blue-950/40">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Research Artifacts</h4>
              <div className="space-y-3">
                {/* Repo 1: apasific */}
                <div className="flex items-start justify-between p-3 bg-[#0b0c16]/80 rounded-lg border border-blue-950/30 text-xs">
                  <div className="flex items-start gap-3">
                    <svg className="w-10 h-10 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col">
                      <a href="https://github.com/detaksumut/apasific" target="_blank" rel="noopener noreferrer" className="font-semibold text-white text-sm hover:text-blue-400 transition-colors">
                        detaksumut/apasific
                      </a>
                      <p className="text-gray-400 mt-1 leading-relaxed text-[11px]">
                        Integrated Academic Ecosystem Platform (IAEP) codebase with multi-tenant publishing engine.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-950/40 text-green-400 border border-green-900/20 whitespace-nowrap">
                    Verified Repo
                  </span>
                </div>

                {/* Repo 3: AKP */}
                <div className="flex items-start justify-between p-3 bg-[#0b0c16]/80 rounded-lg border border-blue-950/30 text-xs">
                  <div className="flex items-start gap-3">
                    <svg className="w-10 h-10 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col">
                      <a href="https://github.com/detaksumut/AKP" target="_blank" rel="noopener noreferrer" className="font-semibold text-white text-sm hover:text-blue-400 transition-colors">
                        detaksumut/AKP
                      </a>
                      <p className="text-gray-400 mt-1 leading-relaxed text-[11px]">
                        Academic Knowledge Portal modules and indexing services.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-950/40 text-green-400 border border-green-900/20 whitespace-nowrap">
                    Completed
                  </span>
                </div>


                {/* Repo 4: Audit-Justice */}
                <div className="flex items-start justify-between p-3 bg-[#0b0c16]/80 rounded-lg border border-blue-950/30 text-xs">
                  <div className="flex items-start gap-3">
                    <svg className="w-10 h-10 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col">
                      <a href="https://github.com/detaksumut/Audit-Justice" target="_blank" rel="noopener noreferrer" className="font-semibold text-white text-sm hover:text-blue-400 transition-colors">
                        detaksumut/Audit-Justice
                      </a>
                      <p className="text-gray-400 mt-1 leading-relaxed text-[11px]">
                        Legal informatics and audit trail system for judicial transparency.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-950/40 text-green-400 border border-green-900/20 whitespace-nowrap">
                    Completed
                  </span>
                </div>

                {/* Repo 5: MasterAdvocat */}
                <div className="flex items-start justify-between p-3 bg-[#0b0c16]/80 rounded-lg border border-blue-950/30 text-xs">
                  <div className="flex items-start gap-3">
                    <svg className="w-10 h-10 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col">
                      <a href="https://github.com/detaksumut/MasterAdvocat" target="_blank" rel="noopener noreferrer" className="font-semibold text-white text-sm hover:text-blue-400 transition-colors">
                        detaksumut/MasterAdvocat
                      </a>
                      <p className="text-gray-400 mt-1 leading-relaxed text-[11px]">
                        Advocacy and legal services management system for legal practitioners.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-950/40 text-green-400 border border-green-900/20 whitespace-nowrap">
                    Completed
                  </span>
                </div>

                {/* Repo 6: RJRAKP */}
                <div className="flex items-start justify-between p-3 bg-[#0b0c16]/80 rounded-lg border border-blue-950/30 text-xs">
                  <div className="flex items-start gap-3">
                    <svg className="w-10 h-10 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col">
                      <a href="https://github.com/detaksumut/RJRAKP" target="_blank" rel="noopener noreferrer" className="font-semibold text-white text-sm hover:text-blue-400 transition-colors">
                        detaksumut/RJRAKP
                      </a>
                      <p className="text-gray-400 mt-1 leading-relaxed text-[11px]">
                        Reputasi Jurnal &amp; Rekam Jejak Akademik Nasional platform.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-950/40 text-green-400 border border-green-900/20 whitespace-nowrap">
                    Completed
                  </span>
                </div>

                {/* Repo 7: tenderindonesia */}
                <div className="flex items-start justify-between p-3 bg-[#0b0c16]/80 rounded-lg border border-blue-950/30 text-xs">
                  <div className="flex items-start gap-3">
                    <svg className="w-10 h-10 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col">
                      <a href="https://github.com/detaksumut/tenderindonesia" target="_blank" rel="noopener noreferrer" className="font-semibold text-white text-sm hover:text-blue-400 transition-colors">
                        detaksumut/tenderindonesia
                      </a>
                      <p className="text-gray-400 mt-1 leading-relaxed text-[11px]">
                        Tender and procurement intelligence analytics platform.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-950/40 text-green-400 border border-green-900/20 whitespace-nowrap">
                    Completed
                  </span>
                </div>

              </div>
            </div>




          </div>

        </div>
      </div>
    </div>
  );
};
