"use client";

import React from 'react';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { Metadata } from 'next';
import boardData from '@/data/editorial-board.json';

// Helper to render a group as a dark themed list
function EditorialListSection({ title, members, startIndex = 1 }: { title: string, members: typeof boardData, startIndex?: number }) {
  if (members.length === 0) return null;
  
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold text-white mb-6 border-b border-white/10 pb-2">{title}</h2>
      <div className="flex flex-col">
        {members.map((member, idx) => {
          const globalIndex = startIndex + idx;
          return (
            <div 
              key={globalIndex} 
              className="flex items-center gap-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors px-4"
            >
              {/* Number */}
              <div className="w-8 text-gray-500 font-mono text-sm shrink-0">
                {globalIndex}
              </div>
              
              {/* Photo placeholder (Circle) */}
              <div className="w-10 h-10 rounded-full bg-[#131326] flex items-center justify-center shrink-0 border border-[#c9a84c]/30 overflow-hidden relative">
                <img 
                  src={`/images/${member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.jpg`}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                    }
                  }}
                />
                <span className="text-[#c9a84c] text-xs font-bold hidden">
                  {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              
              {/* Role */}
              <div className="w-64 shrink-0 pl-4">
                <span className="text-[#c9a84c] font-bold text-[11px] tracking-wider uppercase">
                  {member.role}
                </span>
              </div>
              
              {/* Name */}
              <div className="flex-1 font-semibold text-white">
                {member.name}
              </div>
              
              {/* Country */}
              <div className="w-32 text-right text-gray-400 text-sm shrink-0">
                {member.country}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function EditorialBoardPage() {
  const eic = boardData.filter(e => e.role === 'Editor-in-Chief');
  const deputy = boardData.filter(e => e.role === 'Deputy Editor-in-Chief');
  const advisory = boardData.filter(e => e.role === 'Advisory Board');
  const managing = boardData.filter(e => e.role === 'Managing Editor' || e.role === 'Ethics Editor' || e.role === 'Methodology & Statistics' || e.role === 'Quality Assurance');
  const boardEditors = boardData.filter(e => e.role === 'Board Editor');
  const boardReviewers = boardData.filter(e => e.role === 'Board Reviewer');
  const production = boardData.filter(e => ['Layout Editor', 'Cover Editor', 'Publish Editor', 'Supervisor Editor', 'Web Editor', 'Journal Administrator'].includes(e.role));

  let currentIndex = 1;

  return (
    <div className="min-h-screen bg-[#05050a]">
      <GovernanceHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-white mb-6 text-center">Editorial Board Global</h1>
        <p className="text-lg text-gray-400 mb-16 text-center max-w-3xl mx-auto">
          APASIFIC Press is guided by an international network of leading scholars dedicated to maintaining the highest standards of scientific integrity and open access publishing.
        </p>

        <EditorialListSection title="Executive Leadership" members={[...eic, ...deputy]} startIndex={currentIndex} />
        {(() => { currentIndex += eic.length + deputy.length; return null; })()}

        <EditorialListSection title="Advisory Board" members={advisory} startIndex={currentIndex} />
        {(() => { currentIndex += advisory.length; return null; })()}

        <EditorialListSection title="Core Editorial Staff" members={managing} startIndex={currentIndex} />
        {(() => { currentIndex += managing.length; return null; })()}

        <EditorialListSection title="Board Editors" members={boardEditors} startIndex={currentIndex} />
        {(() => { currentIndex += boardEditors.length; return null; })()}

        <EditorialListSection title="Reviewer Board" members={boardReviewers} startIndex={currentIndex} />
        {(() => { currentIndex += boardReviewers.length; return null; })()}

        <EditorialListSection title="Production & Administration" members={production} startIndex={currentIndex} />
      </main>
    </div>
  );
}
