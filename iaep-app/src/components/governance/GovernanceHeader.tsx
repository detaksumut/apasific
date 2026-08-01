// src/components/governance/GovernanceHeader.tsx
import React from 'react';
import Link from 'next/link';

export const GovernanceHeader = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif font-bold text-xl text-blue-900 tracking-tight">
              APASIFIC Press
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/publisher" className="text-sm font-medium text-gray-600 hover:text-blue-600">Publisher</Link>
              <Link href="/journal" className="text-sm font-medium text-gray-600 hover:text-blue-600">Journal Identity</Link>
              <Link href="/editorial-board" className="text-sm font-medium text-gray-600 hover:text-blue-600">Editorial Board</Link>
              <Link href="/policies/ethics" className="text-sm font-medium text-gray-600 hover:text-blue-600">Policies</Link>
              <Link href="/authors/guidelines" className="text-sm font-medium text-gray-600 hover:text-blue-600">Author Guidelines</Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
