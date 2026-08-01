import React from 'react';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <GovernanceHeader />
      <div className="bg-gray-50 border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Academic Policies</h1>
          <p className="mt-2 text-gray-600">The foundational rules and ethical guidelines of APASIFIC Press.</p>
        </div>
      </div>
      {children}
    </div>
  );
}
