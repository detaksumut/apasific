import React from 'react';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080810] text-[#e8e8f0]">
      <GovernanceHeader />
      <div className="bg-[#0d0d1a] border-b border-[#c9a84c]/20 py-10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold text-[#c9a84c] tracking-wide">Academic Policies</h1>
          <p className="mt-2 text-gray-400 text-sm md:text-base">The foundational rules and ethical guidelines of APASIFIC Press.</p>
        </div>
      </div>
      <div className="bg-[#080810]">
        {children}
      </div>
    </div>
  );
}

