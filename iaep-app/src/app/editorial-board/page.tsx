import React from 'react';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { EditorialProfileCard } from '@/components/governance/EditorialProfileCard';
import { Metadata } from 'next';
import boardData from '@/data/editorial-board.json';

export const metadata: Metadata = {
  title: 'Editorial Board | APASIFIC Press',
  description: 'The editorial board and review network of APASIFIC Journal of Academic Research.',
};

export default function EditorialBoardPage() {
  const eic = boardData.find(e => e.role === 'Editor-in-Chief');
  const deputy = boardData.find(e => e.role === 'Deputy Editor-in-Chief');
  const advisory = boardData.filter(e => e.role === 'Advisory Board');
  const managing = boardData.filter(e => e.role === 'Managing Editor' || e.role === 'Ethics Editor' || e.role === 'Methodology & Statistics' || e.role === 'Quality Assurance');
  const boardEditors = boardData.filter(e => e.role === 'Board Editor');
  const boardReviewers = boardData.filter(e => e.role === 'Board Reviewer');
  const production = boardData.filter(e => ['Layout Editor', 'Cover Editor', 'Publish Editor', 'Supervisor Editor', 'Web Editor', 'Journal Administrator'].includes(e.role));

  return (
    <div className="min-h-screen bg-white">
      <GovernanceHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6 text-center">Editorial Board</h1>
        <p className="text-lg text-gray-600 mb-16 text-center max-w-3xl mx-auto">
          APASIFIC Press is guided by an international network of leading scholars dedicated to maintaining the highest standards of scientific integrity and open access publishing.
        </p>

        {/* Executive Board */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 border-b pb-2">Executive Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {eic && <EditorialProfileCard profile={eic} />}
            {deputy && <EditorialProfileCard profile={deputy} />}
          </div>
        </section>

        {/* Advisory Board */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 border-b pb-2">Advisory Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisory.map((editor, index) => (
              <EditorialProfileCard key={index} profile={editor} />
            ))}
          </div>
        </section>

        {/* Core Editorial Staff */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 border-b pb-2">Core Editorial Staff</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managing.map((editor, index) => (
              <EditorialProfileCard key={index} profile={editor} />
            ))}
          </div>
        </section>

        {/* Board Editors */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 border-b pb-2">Board Editors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardEditors.map((editor, index) => (
              <EditorialProfileCard key={index} profile={editor} />
            ))}
          </div>
        </section>

        {/* Reviewer Board */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 border-b pb-2">Reviewer Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardReviewers.map((editor, index) => (
              <EditorialProfileCard key={index} profile={editor} />
            ))}
          </div>
        </section>

        {/* Production & Administration */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 border-b pb-2">Production & Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {production.map((staff, index) => (
              <EditorialProfileCard key={index} profile={staff} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
