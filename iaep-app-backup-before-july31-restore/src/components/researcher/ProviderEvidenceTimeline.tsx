// src/components/researcher/ProviderEvidenceTimeline.tsx
import React from 'react';

export const ProviderEvidenceTimeline = () => {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Verification Timeline</h4>
      <div className="space-y-4">
        <div className="flex gap-3 relative">
          <div className="absolute left-1.5 top-5 w-0.5 h-full bg-gray-200"></div>
          <div className="w-3 h-3 mt-1.5 rounded-full bg-blue-500 shrink-0 relative z-10 shadow-[0_0_0_3px_white]"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">SINTA Profile Synced</p>
            <p className="text-xs text-gray-500">Today at 14:30 WIB</p>
          </div>
        </div>
        <div className="flex gap-3 relative">
          <div className="w-3 h-3 mt-1.5 rounded-full bg-green-500 shrink-0 relative z-10 shadow-[0_0_0_3px_white]"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">ORCID Authorized</p>
            <p className="text-xs text-gray-500">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};
