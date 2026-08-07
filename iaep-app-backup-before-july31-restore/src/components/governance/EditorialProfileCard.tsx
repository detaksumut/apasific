// src/components/governance/EditorialProfileCard.tsx
import React from 'react';
import { ORCIDBadge } from './ORCIDBadge';

interface EditorialProfile {
  name: string;
  role: string;
  institution: string;
  country: string;
  orcid: string;
}

export const EditorialProfileCard = ({ profile }: { profile: EditorialProfile }) => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-gray-900 text-lg">{profile.name}</h4>
          <p className="text-sm text-blue-700 font-medium mb-2">{profile.role}</p>
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              {profile.institution}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {profile.country}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <ORCIDBadge orcid={profile.orcid} />
        <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Verified Affiliation</span>
      </div>
    </div>
  );
};
