// src/components/researcher/ExternalVerificationBadge.tsx
import React from 'react';

export const ExternalVerificationBadge = ({ provider, isVerified }: { provider: string, isVerified: boolean }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
      {isVerified ? (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      )}
      {provider}
    </div>
  );
};
