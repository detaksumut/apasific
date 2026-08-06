// src/components/governance/PolicyLayout.tsx
import React from 'react';
import { PolicySidebar } from './PolicySidebar';

interface PolicyLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: string;
}

export const PolicyLayout = ({ children, title, lastUpdated = 'August 2026' }: PolicyLayoutProps) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-start gap-8">
      <PolicySidebar />
      
      {/* Policy typography overrides block */}
      <style dangerouslySetInnerHTML={{ __html: `
        .policy-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #c9a84c;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid rgba(201,168,76,0.15);
          padding-bottom: 0.35rem;
        }
        .policy-content p {
          color: #a0aec0;
          line-height: 1.8;
          margin-bottom: 1.25rem;
          font-size: 0.95rem;
        }
        .policy-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .policy-content li {
          color: #a0aec0;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .policy-content strong {
          color: #e8c97a;
        }
      `}} />

      <div className="flex-1 w-full bg-[#0d0d1a] border border-[#c9a84c]/15 p-6 md:p-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl font-serif font-bold text-[#c9a84c] mb-2">{title}</h1>
        <p className="text-xs text-gray-500 mb-8 pb-4 border-b border-[#c9a84c]/20">
          Last Updated: {lastUpdated}
        </p>
        <div className="policy-content max-w-none text-[#e8e8f0]">
          {children}
        </div>
      </div>
    </div>
  );
};

