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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-start gap-8">
      <PolicySidebar />
      <div className="flex-1 max-w-3xl">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-8 pb-4 border-b border-gray-200">
          Last Updated: {lastUpdated}
        </p>
        <div className="prose prose-blue max-w-none text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};
