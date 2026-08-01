// src/components/governance/ORCIDBadge.tsx
import React from 'react';

export const ORCIDBadge = ({ orcid, verified = true }: { orcid: string; verified?: boolean }) => {
  return (
    <a 
      href={`https://orcid.org/${orcid}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 hover:bg-green-100 transition-colors"
      title="Verified ORCID iD"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.949-.947.949a.95.95 0 0 1-.949-.949c0-.516.424-.947.949-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.44h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.719-4.097-3.719h-2.222z"/>
      </svg>
      <span className="font-mono">{orcid}</span>
      {verified && <span className="ml-1">✓</span>}
    </a>
  );
};
