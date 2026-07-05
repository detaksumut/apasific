"use client";

import { useState } from "react";

export default function RatesSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const [membershipRates, setMembershipRates] = useState({
    mahasiswa: 0,
    praktisi: 250000,
    s2: 250000,
    s3_prof: 500000,
  });

  const [articleReviewRates, setArticleReviewRates] = useState({
    mahasiswa: 50000,
    s1: 100000,
    s2: 150000,
    s3_prof: 250000,
  });

  const [reviewerLevelRates, setReviewerLevelRates] = useState({
    s2: 100000,
    s3: 200000,
    prof: 350000,
  });

  const [boardStipends, setBoardStipends] = useState({
    eic: 1500000,
    editorBoard: 1000000,
    reviewerBoard: 750000,
    layout: 500000,
    cover: 500000,
    copy: 500000,
    publish: 500000,
  });

  const handleSave = (section: string) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`Success! ${section} have been updated and will be applied to all new transactions.`);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Rates & Honorariums Settings</h1>
        <p className="text-gray-400">Master Control: Dynamically adjust membership tariffs and academic stipends.</p>
      </div>

      {/* 1. Membership Tariffs */}
      <div className="bg-[#12121f] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="bg-[#1a1a2e] p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#c9a84c]">Membership Tariffs (Annual)</h2>
            <p className="text-xs text-gray-500 mt-1">Fees charged for new member registrations based on academic level.</p>
          </div>
          <button 
            onClick={() => handleSave('Membership Tariffs')}
            disabled={isSaving}
            className="bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold py-2 px-6 rounded transition-colors text-sm"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Mahasiswa (S1)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">Rp</span>
              <input type="number" disabled value={membershipRates.mahasiswa} className="w-full bg-[#0d0d1a] border border-gray-700 text-gray-500 rounded p-3 pl-10 cursor-not-allowed" />
            </div>
            <p className="text-xs text-green-500 mt-1">Locked to Free (Policy)</p>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Praktisi (Industri)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={membershipRates.praktisi} onChange={e => setMembershipRates({...membershipRates, praktisi: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-[#333] text-white rounded p-3 pl-10 focus:border-[#c9a84c] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">S2 (Magister)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={membershipRates.s2} onChange={e => setMembershipRates({...membershipRates, s2: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-[#333] text-white rounded p-3 pl-10 focus:border-[#c9a84c] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">S3 (Doktor) & Profesor</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={membershipRates.s3_prof} onChange={e => setMembershipRates({...membershipRates, s3_prof: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-[#333] text-white rounded p-3 pl-10 focus:border-[#c9a84c] focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Reviewer Honorariums by Reviewer Level */}
      <div className="bg-[#12121f] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="bg-[#1a1a2e] p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-blue-400">Review Honorarium by Reviewer Level</h2>
            <p className="text-xs text-gray-500 mt-1">Rates paid to Reviewers based on their own academic qualification.</p>
          </div>
          <button 
            onClick={() => handleSave('Reviewer Level Honorariums')}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded transition-colors text-sm"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Reviewer S2</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={reviewerLevelRates.s2} onChange={e => setReviewerLevelRates({...reviewerLevelRates, s2: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-blue-900 text-white rounded p-3 pl-10 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Reviewer S3</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={reviewerLevelRates.s3} onChange={e => setReviewerLevelRates({...reviewerLevelRates, s3: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-blue-900 text-white rounded p-3 pl-10 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Reviewer Profesor</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={reviewerLevelRates.prof} onChange={e => setReviewerLevelRates({...reviewerLevelRates, prof: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-blue-900 text-white rounded p-3 pl-10 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Reviewer Honorariums by Article Level */}
      <div className="bg-[#12121f] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="bg-[#1a1a2e] p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-green-400">Review Honorarium by Article Level</h2>
            <p className="text-xs text-gray-500 mt-1">Rates paid per completed review based on the article's submitter tier.</p>
          </div>
          <button 
            onClick={() => handleSave('Article Level Honorariums')}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded transition-colors text-sm"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Artikel Mahasiswa</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={articleReviewRates.mahasiswa} onChange={e => setArticleReviewRates({...articleReviewRates, mahasiswa: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-green-900 text-white rounded p-3 pl-10 focus:border-green-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Artikel S1</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={articleReviewRates.s1} onChange={e => setArticleReviewRates({...articleReviewRates, s1: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-green-900 text-white rounded p-3 pl-10 focus:border-green-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Artikel S2</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={articleReviewRates.s2} onChange={e => setArticleReviewRates({...articleReviewRates, s2: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-green-900 text-white rounded p-3 pl-10 focus:border-green-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Artikel S3 / Profesor</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">Rp</span>
              <input type="number" value={articleReviewRates.s3_prof} onChange={e => setArticleReviewRates({...articleReviewRates, s3_prof: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-green-900 text-white rounded p-3 pl-10 focus:border-green-500 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Board Base Honorariums */}
      <div className="bg-[#12121f] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="bg-[#1a1a2e] p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-purple-400">Board Base Stipends (Fixed Pay)</h2>
            <p className="text-xs text-gray-500 mt-1">Monthly/Annual fixed salaries for structural editorial and production teams.</p>
          </div>
          <button 
            onClick={() => handleSave('Board Base Stipends')}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded transition-colors text-sm"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Editor in Chief</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400">Rp</span>
                <input type="number" value={boardStipends.eic} onChange={e => setBoardStipends({...boardStipends, eic: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-purple-900 text-white rounded p-3 pl-10 focus:border-purple-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Editor On Board</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400">Rp</span>
                <input type="number" value={boardStipends.editorBoard} onChange={e => setBoardStipends({...boardStipends, editorBoard: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-purple-900 text-white rounded p-3 pl-10 focus:border-purple-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Reviewer On Board</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400">Rp</span>
                <input type="number" value={boardStipends.reviewerBoard} onChange={e => setBoardStipends({...boardStipends, reviewerBoard: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-purple-900 text-white rounded p-3 pl-10 focus:border-purple-500 focus:outline-none" />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 border-t border-gray-800 my-2 pt-6">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Production Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Layout Editor</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400">Rp</span>
                  <input type="number" value={boardStipends.layout} onChange={e => setBoardStipends({...boardStipends, layout: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-gray-700 text-white rounded p-3 pl-10 focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Cover Editor</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400">Rp</span>
                  <input type="number" value={boardStipends.cover} onChange={e => setBoardStipends({...boardStipends, cover: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-gray-700 text-white rounded p-3 pl-10 focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Copy Editor</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400">Rp</span>
                  <input type="number" value={boardStipends.copy} onChange={e => setBoardStipends({...boardStipends, copy: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-gray-700 text-white rounded p-3 pl-10 focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Publish Editor</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400">Rp</span>
                  <input type="number" value={boardStipends.publish} onChange={e => setBoardStipends({...boardStipends, publish: Number(e.target.value)})} className="w-full bg-[#0d0d1a] border border-gray-700 text-white rounded p-3 pl-10 focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
