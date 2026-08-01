// src/components/researcher/GlobalPublicationFederationCard.tsx
import React from 'react';

export const GlobalPublicationFederationCard = ({ doi }: { doi?: string }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Global Scholarly Identity
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. External Presence Snapshot */}
          <div className="flex-1">
            <div className="space-y-4">
              
              {/* Publisher DOI (Crossref) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Publisher Identity</h3>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-red-600 font-bold text-xs">CR</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-sm">Crossref DOI</span>
                      <span className="text-xs text-red-700 font-mono mt-0.5">10.99999/apasific.2026.001</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">✅ Verified</span>
                </div>
              </div>

              {/* Archive */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Archive</h3>
                <div className="space-y-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span className="text-gray-900 font-medium">Zenodo Backup</span>
                    <span className="text-xs text-gray-500 font-mono ml-auto">10.5281/zenodo.123456</span>
                  </div>
                </div>
              </div>

              {/* Discovery Network */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Discovery</h3>
                
                <div className="space-y-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span className="text-gray-900 font-medium">OpenAIRE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span className="text-gray-900 font-medium">OpenAlex</span>
                  </div>
                </div>
              </div>

              {/* Author Identity */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Author Identity</h3>
                <div className="space-y-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span className="text-gray-900 font-medium">ORCID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Research Impact (OpenAlex Intelligence) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Research Impact (Intelligence)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="block text-xs text-blue-600 font-semibold uppercase">Citations</span>
                <span className="block text-2xl font-bold text-gray-900 mt-1">15</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <span className="block text-xs text-indigo-600 font-semibold uppercase">Concepts</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] px-2 py-1 bg-white rounded-md border border-indigo-200 text-indigo-700">AI</span>
                  <span className="text-[10px] px-2 py-1 bg-white rounded-md border border-indigo-200 text-indigo-700">Education</span>
                  <span className="text-[10px] px-2 py-1 bg-white rounded-md border border-indigo-200 text-indigo-700">Technology</span>
                </div>
              </div>
            </div>
          </div>

          {/* Research Artifacts (DataCite DOI) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Research Artifacts</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 text-sm">Dataset: Survey Results</span>
                  <span className="text-xs text-indigo-700 font-mono mt-0.5">DOI: 10.80000/datacite.ds123</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full ml-auto">✅ Verified</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 text-sm">AI Model: Prediction Core</span>
                  <span className="text-xs text-purple-700 font-mono mt-0.5">DOI: 10.80000/datacite.md456</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full ml-auto">✅ Verified</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
