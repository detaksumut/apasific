// src/components/researcher/AcademicEvidenceCard.tsx
import React from 'react';
import { ExternalVerificationBadge } from './ExternalVerificationBadge';
import { ProviderEvidenceTimeline } from './ProviderEvidenceTimeline';

export const AcademicEvidenceCard = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Academic Evidence Verification
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Federated Sources</h4>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">SINTA</span>
                <span className="text-xs text-gray-500">ID: 6197943</span>
              </div>
              <ExternalVerificationBadge provider="Verified" isVerified={true} />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">ORCID</span>
                <span className="text-xs text-gray-500">0000-0002-XXXX</span>
              </div>
              <ExternalVerificationBadge provider="Verified" isVerified={true} />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">Crossref</span>
                <span className="text-xs text-gray-500">Publication Match</span>
              </div>
              <ExternalVerificationBadge provider="Verified" isVerified={true} />
            </div>
          </div>
          
          <div>
            <ProviderEvidenceTimeline />
          </div>
        </div>
      </div>
    </div>
  );
};
