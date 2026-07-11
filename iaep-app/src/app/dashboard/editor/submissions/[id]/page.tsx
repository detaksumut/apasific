"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { publishArticleToZenodo, ZenodoMetadata } from "@/utils/zenodo";
import { createClient } from "@/utils/supabase/client";

export default function SubmissionControlPanel() {
  const params = useParams();
  const submissionId = params.id as string;
  
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submission");
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decision, setDecision] = useState("");
  const [emailText, setEmailText] = useState("Dear Jane Doe,\n\nWe have reached a decision regarding your submission to APASIFIC IAEP: The Impact of Artificial Intelligence on Southeast Asian Higher Education.\n\nOur decision is: ");
  const [authorPhone, setAuthorPhone] = useState("+6281370062009");
  const [toastMessage, setToastMessage] = useState("");
  const [isPublishingZenodo, setIsPublishingZenodo] = useState(false);
  const [generatedDoi, setGeneratedDoi] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    const fetchSubmission = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles:author_id(full_name)')
        .eq('id', submissionId)
        .single();
        
      if (data) {
        setSubmission({
          id: data.id,
          title: data.title,
          author: data.profiles?.full_name || 'Unknown',
          abstract: data.abstract,
          file_url: data.file_url,
          stage: data.stage || 'Review',
          status: data.status || 'Awaiting Reviewers',
          doi: data.doi,
          zenodo_id: data.zenodo_id
        });
        if (data.doi) setGeneratedDoi(data.doi);
        
        // Auto set active tab based on stage
        if (data.stage === 'Review') setActiveTab('review');
        else if (data.stage === 'Copyediting') setActiveTab('copyediting');
        else if (data.stage === 'Production' || data.stage === 'Published') setActiveTab('production');
      } else {
        console.error("Error fetching submission:", error);
      }
      setLoading(false);
    };
    
    if (submissionId) fetchSubmission();
  }, [submissionId]);

  const handleDecisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDecision(val);
    const decisionText = val === 'accept' ? 'Accept Submission' : 
                         val === 'revisions' ? 'Revisions Required' : 
                         val === 'decline' ? 'Decline Submission' : '';
    setEmailText(prev => prev.split('Our decision is:')[0] + 'Our decision is: ' + decisionText + '\n\nEditor-in-Chief');
  };

  const handlePublishToZenodo = async () => {
    setIsPublishingZenodo(true);
    showToast("Publishing to Zenodo... Please wait.");
    
    try {
      const metadata: ZenodoMetadata = {
        title: submission.title,
        description: submission.abstract,
        upload_type: 'publication',
        publication_type: 'article',
        creators: [{ name: submission.author }],
        communities: [{ identifier: 'rjrakp' }],
        access_right: 'open',
        keywords: ['Artificial Intelligence', 'Education']
      };

      const fileUrl = submission.file_url || ""; 
      const fileName = fileUrl ? fileUrl.split('/').pop()?.split('?')[0] : `Manuscript_${submission.id}.pdf`;

      const result = await publishArticleToZenodo(metadata, fileUrl, fileName);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update Supabase with the new DOI
      const supabase = createClient();
      const { error: updateErr } = await supabase
        .from('submissions')
        .update({ doi: result.doi, zenodo_id: result.zenodo_id })
        .eq('id', submission.id);

      if (updateErr) throw updateErr;

      setGeneratedDoi(result.doi);
      showToast(`Successfully published to Zenodo! DOI: ${result.doi}`);
      
    } catch (err: any) {
      console.error(err);
      showToast('Failed to publish to Zenodo: ' + err.message);
    } finally {
      setIsPublishingZenodo(false);
    }
  };

  const handleRecordDecision = async (isWa: boolean) => {
    if (!decision) return;
    
    let newStage = submission.stage;
    let newStatus = submission.status;
    
    if (decision === 'accept') {
      newStage = 'Copyediting';
      newStatus = 'Accepted';
    } else if (decision === 'revisions') {
      newStatus = 'Needs Revision';
    } else if (decision === 'decline') {
      newStatus = 'Declined';
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('submissions')
        .update({ stage: newStage, status: newStatus })
        .eq('id', submission.id);
        
      if (error) throw error;
      
      setSubmission({ ...submission, stage: newStage, status: newStatus });
      
      if (newStage === 'Copyediting') setActiveTab('copyediting');
      
      showToast(`Decision Recorded & ${isWa ? 'WhatsApp Window Opened!' : 'Email Sent!'}`);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to record decision: ' + err.message);
    } finally {
      setDecisionModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a84c]"></div>
        </div>
      )}
      {!loading && !submission && (
        <div className="text-center py-20 text-gray-500 font-bold">Submission not found.</div>
      )}
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 animate-fade-in-down border border-green-400 backdrop-blur-sm flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {toastMessage}
        </div>
      )}

      {submission && (
        <>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/dashboard/editor" className="hover:text-[#c9a84c]">Editorial Board</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate w-64">Submission #{submission.id.substring(0, 8)}</span>
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
                      <div className="text-xs text-gray-500 mt-1">Due: July 30, 2024 • Phone: +628111222333</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">Completed</span>
                      <a 
                        href={`https://wa.me/628111222333?text=${encodeURIComponent("Dear Prof. Alan Turing, thank you for completing the review of paper #1045 on the APASIFIC platform.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[#25D366] hover:text-[#20ba56] text-xs font-semibold mt-2"
                        style={{ textDecoration: 'none' }}
                      >
                        💬 Contact Reviewer
                      </a>
                    </div>
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
                          <div className="text-xs text-gray-500">Expertise: AI, Machine Learning • Phone: +628987654321</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`https://wa.me/628987654321?text=${encodeURIComponent("Dear Dr. Sarah Connor, we invite you to review paper #1045 (The Impact of Artificial Intelligence on Southeast Asian Higher Education) on the APASIFIC platform.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-[#25D366] text-black font-semibold py-1 px-3 rounded hover:bg-[#22c35e] text-center"
                          style={{ textDecoration: 'none' }}
                        >
                          💬 Invite
                        </a>
                        <button className="text-xs bg-[#c9a84c] text-black font-semibold py-1 px-3 rounded hover:bg-[#b0923d]">Assign</button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">Prof. John von Neumann</div>
                          <div className="text-xs text-gray-500">Expertise: Education Technology • Phone: +628776655443</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`https://wa.me/628776655443?text=${encodeURIComponent("Dear Prof. John von Neumann, we invite you to review paper #1045 (The Impact of Artificial Intelligence on Southeast Asian Higher Education) on the APASIFIC platform.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-[#25D366] text-black font-semibold py-1 px-3 rounded hover:bg-[#22c35e] text-center"
                          style={{ textDecoration: 'none' }}
                        >
                          💬 Invite
                        </a>
                        <button className="text-xs bg-[#c9a84c] text-black font-semibold py-1 px-3 rounded hover:bg-[#b0923d]">Assign</button>
                      </div>
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
          
          {activeTab === 'copyediting' && (
            <div className="py-12 text-center text-gray-500">
              <div className="text-4xl mb-4">🛠️</div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Stage Locked</h2>
              <p>An editorial decision must be made in the Review stage before moving to {activeTab}.</p>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="py-8 space-y-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Publishing & Export</h3>
                <p className="text-sm text-gray-600 mb-6">Distribute this manuscript to external indexing services and assign persistent identifiers.</p>
                
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Integrasi Sistem Publikasi</h4>
                    {generatedDoi ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">LIVE</span>
                    ) : (
                      <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded text-[10px] font-bold">OFFLINE</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      disabled={!generatedDoi}
                      className={`flex-1 font-bold py-3 px-4 rounded transition-colors flex justify-center items-center gap-2 ${
                        generatedDoi 
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                          : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      Download XML Crossref
                    </button>

                    <button 
                      onClick={handlePublishToZenodo}
                      disabled={isPublishingZenodo || !!generatedDoi}
                      className={`flex-1 font-bold py-3 px-4 rounded transition-colors flex justify-center items-center gap-2 ${
                        !generatedDoi
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                          : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {isPublishingZenodo ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                      )}
                      {isPublishingZenodo ? 'Sending to Zenodo...' : (generatedDoi ? 'Telah Diterbitkan (DOI Active)' : 'Terbitkan ke Zenodo (Auto-DOI)')}
                    </button>
                  </div>
                  
                  {/* Tracking Indicators */}
                  <div className="flex gap-3 pt-3">
                    <div className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${generatedDoi ? 'bg-[#A6CE39]/10 border-[#A6CE39]/30 text-[#7ca221]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      <span className="text-xs font-black uppercase tracking-wider">ORCID</span>
                      <span className="text-[10px] font-medium mt-1">{generatedDoi ? 'Tracking' : 'Pasif'}</span>
                    </div>
                    <div className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${generatedDoi ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      <span className="text-xs font-black uppercase tracking-wider">Scopus</span>
                      <span className="text-[10px] font-medium mt-1">{generatedDoi ? 'Tracking' : 'Pasif'}</span>
                    </div>
                    <div className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${generatedDoi ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      <span className="text-xs font-black uppercase tracking-wider">WoS</span>
                      <span className="text-[10px] font-medium mt-1">{generatedDoi ? 'Tracking' : 'Pasif'}</span>
                    </div>
                  </div>
                </div>
                
                {generatedDoi && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm font-semibold">
                    ✅ Generated DOI: {generatedDoi}
                  </div>
                )}
              </div>
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
                  rows={6}
                  value={emailText}
                  onChange={e => setEmailText(e.target.value)}
                  className="w-full border border-gray-300 rounded p-3 text-sm text-gray-900 bg-white focus:border-[#c9a84c] font-mono focus:outline-none focus:ring-1 focus:ring-[#c9a84c] mb-4"
                ></textarea>

                <label className="block text-sm font-semibold mb-2 text-gray-700">Author's Phone / WhatsApp (Include Country Code)</label>
                <input 
                  type="tel"
                  value={authorPhone}
                  onChange={e => setAuthorPhone(e.target.value)}
                  placeholder="e.g. +62 813-7006-2009"
                  className="w-full border border-gray-300 rounded p-2 text-gray-900 bg-white focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] text-sm"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 items-center">
              <button onClick={() => setDecisionModalOpen(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-100">Cancel</button>
              <button disabled={!decision} onClick={() => handleRecordDecision(false)} className="px-6 py-2 bg-blue-600 text-white rounded font-bold disabled:opacity-50 hover:bg-blue-700">
                Record & Send Email
              </button>
              <a 
                href={decision ? `https://wa.me/${authorPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(emailText)}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleRecordDecision(true)}
                className={`px-6 py-2 bg-[#25D366] hover:bg-[#22c35e] text-black font-bold rounded flex items-center justify-center gap-1 transition-all ${!decision ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                💬 Kirim WA
              </a>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
