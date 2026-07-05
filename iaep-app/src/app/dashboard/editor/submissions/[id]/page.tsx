"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubmissionControlPanel() {
  const [activeTab, setActiveTab] = useState("submission");
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decision, setDecision] = useState("");
  const [emailText, setEmailText] = useState("Dear Jane Doe,\n\nWe have reached a decision regarding your submission to APASIFIC IAEP: The Impact of Artificial Intelligence on Southeast Asian Higher Education.\n\nOur decision is: ");

  // Dummy submission data
  const submission = {
    id: 1045,
    title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education",
    author: "Jane Doe",
    abstract: "This paper explores the transformative effects of AI technologies on university curricula...",
    stage: "Review",
    status: "Awaiting Reviewers"
  };

  const handleDecisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDecision(val);
    const decisionText = val === 'accept' ? 'Accept Submission' : 
                         val === 'revisions' ? 'Revisions Required' : 
                         val === 'decline' ? 'Decline Submission' : '';
    setEmailText(prev => prev.split('Our decision is:')[0] + 'Our decision is: ' + decisionText + '\n\nEditor-in-Chief');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard/editor" className="hover:text-[#c9a84c]">Editorial Board</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Submission #{submission.id}</span>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#18182e] px-8 py-6 border-b border-[#c9a84c]/30">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white font-['Cinzel']">{submission.title}</h1>
              <p className="text-gray-400 mt-1">Author: {submission.author}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#c9a84c] text-black">
                {submission.stage}
              </span>
            </div>
          </div>
          
          {/* Workflow Tabs */}
          <div className="flex items-center mt-8 overflow-x-auto">
            {['Submission', 'Review', 'Copyediting', 'Production'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`flex-1 py-3 px-6 text-sm font-semibold text-center whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? 'border-[#c9a84c] text-[#c9a84c]' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          
          {activeTab === 'submission' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Submission Files</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">1045-1-Manuscript-Main.docx</div>
                    <div className="text-xs text-gray-500">Uploaded July 1, 2024</div>
                  </div>
                  <button className="text-blue-600 hover:underline text-sm font-semibold">Download</button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Action</h3>
                <button className="bg-blue-600 text-white px-6 py-2 rounded shadow-sm hover:bg-blue-700 font-semibold">
                  Send to Review
                </button>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Reviewers */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-800">Assigned Reviewers (Round 1)</h3>
                  <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-1.5 px-4 rounded border border-gray-300">
                    Add Reviewer
                  </button>
                </div>

                {/* Assigned Reviewer Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-800">Prof. Alan Turing</h4>
                      <div className="text-xs text-gray-500 mt-1">Due: July 30, 2024</div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">Completed</span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                    <div className="font-semibold mb-2 text-green-700">Recommendation: Revisions Required</div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-2">
                      <div className="font-semibold text-yellow-800 text-xs mb-1">Correction Notes / Catatan Kesalahan:</div>
                      <p className="text-xs text-gray-600">Bab 2 - Paragraf 3: Referensi tahun 2015 terlalu usang, harap gunakan referensi 5 tahun terakhir.</p>
                      <p className="text-xs text-gray-600 mt-1">Bab 3 - Metodologi: Penjelasan sampling kurang mendetail.</p>
                    </div>

                    <button className="text-blue-600 hover:underline text-xs mt-1">Read Full Review Comments</button>
                  </div>
                </div>

                {/* Active Reviewers Panel */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Active Reviewers (Online Now)</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">Dr. Sarah Connor</div>
                          <div className="text-xs text-gray-500">Expertise: AI, Machine Learning</div>
                        </div>
                      </div>
                      <button className="text-xs bg-[#c9a84c] text-black font-semibold py-1 px-3 rounded hover:bg-[#b0923d]">Assign</button>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">Prof. John von Neumann</div>
                          <div className="text-xs text-gray-500">Expertise: Education Technology</div>
                        </div>
                      </div>
                      <button className="text-xs bg-[#c9a84c] text-black font-semibold py-1 px-3 rounded hover:bg-[#b0923d]">Assign</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Decisions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Editorial Decision</h3>
                  <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg shadow-inner">
                    <p className="text-sm text-gray-600 mb-4">Make a decision based on the reviews to move this submission to the next stage.</p>
                    <button 
                      onClick={() => setDecisionModalOpen(true)}
                      className="w-full bg-[#0d0d1a] hover:bg-[#1a1a2e] text-white font-bold py-3 rounded transition-colors"
                    >
                      Record Decision
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(activeTab === 'copyediting' || activeTab === 'production') && (
            <div className="py-12 text-center text-gray-500">
              <div className="text-4xl mb-4">🛠️</div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Stage Locked</h2>
              <p>An editorial decision must be made in the Review stage before moving to {activeTab}.</p>
            </div>
          )}

        </div>
      </div>

      {/* Decision Modal */}
      {decisionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Record Editorial Decision</h2>
              <button onClick={() => setDecisionModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Decision *</label>
                <select 
                  value={decision}
                  onChange={handleDecisionChange}
                  className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                >
                  <option value="" disabled>Choose one...</option>
                  <option value="accept">Accept Submission (Send to Copyediting)</option>
                  <option value="revisions">Revisions Required</option>
                  <option value="decline">Decline Submission</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center justify-between text-sm font-semibold mb-2 text-gray-700">
                  <span>Email Notification to Author</span>
                  <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">Required by Policy</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Reviewer comments will be automatically attached below this email.</p>
                <textarea 
                  rows={8}
                  value={emailText}
                  onChange={e => setEmailText(e.target.value)}
                  className="w-full border border-gray-300 rounded p-3 text-sm text-gray-900 bg-white focus:border-[#c9a84c] font-mono focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
              <button onClick={() => setDecisionModalOpen(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-100">Cancel</button>
              <button disabled={!decision} onClick={() => { alert('Decision Recorded & Email Sent!'); setDecisionModalOpen(false); }} className="px-6 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50 hover:bg-green-700">
                Record Decision & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
