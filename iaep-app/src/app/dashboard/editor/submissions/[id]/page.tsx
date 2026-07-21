"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { publishArticleToZenodo, ZenodoMetadata } from "@/utils/zenodo";
import { getSubmissionDetailsEditor, updateIssn, updateDoi } from "@/app/actions/editor";
import { createClient } from "@/utils/supabase/client";
import CoverGenerator from "@/components/dashboard/CoverGenerator";

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
  const [manualIssn, setManualIssn] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [availableReviewers, setAvailableReviewers] = useState<any[]>([]);
  const [isAddReviewerOpen, setIsAddReviewerOpen] = useState(false);
  const [reviewerSearch, setReviewerSearch] = useState("");
  const [reviewerPage, setReviewerPage] = useState(1);
  const [onlineReviewerPage, setOnlineReviewerPage] = useState(1);
  const REVIEWERS_PER_PAGE = 10;
  const [isUploadingRevised, setIsUploadingRevised] = useState(false);
  const [isUploadingGalley, setIsUploadingGalley] = useState(false);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Determine role cleanly
  const roleStr = currentUserRole.toLowerCase();
  const isLayoutEditor = roleStr.includes('layout');
  const isCoverEditor = roleStr.includes('cover');
  const isPublishEditor = roleStr.includes('publish');
  const isSupervisor = roleStr.includes('supervisor');
  const isPureEditor = (roleStr.includes('admin') && !roleStr.includes('co')) || roleStr.includes('supervisor') || (roleStr.includes('editor') && !roleStr.includes('layout') && !roleStr.includes('cover') && !roleStr.includes('publish'));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    const fetchSubmission = async () => {
      const res = await getSubmissionDetailsEditor(submissionId);
        
      if (res.success && res.submission) {
        const data = res.submission;
        setSubmission({
          id: data.id,
          title: data.title,
          author: data.profiles?.full_name || 'Unknown',
          abstract: data.abstract,
          file_url: data.file_url,
          revised_file_url: data.revised_file_url,
          file_url_galley: data.file_url_galley,
          cover_file_url: data.cover_file_url,
          stage: data.stage || 'Review',
          status: data.status || 'Awaiting Reviewers',
          doi: data.doi,
          zenodo_id: data.zenodo_id,
          journals: data.journals
        });
        if (data.doi) setGeneratedDoi(data.doi);
        if (data.issn) setManualIssn(data.issn);
        
        // Update author phone dynamically
        if (data.phone) setAuthorPhone(data.phone);
        else if (data.profiles?.phone) setAuthorPhone(data.profiles.phone);
        else setAuthorPhone(""); // Clear dummy if no phone found
        
        // Auto set active tab based on stage
        if (data.stage === 'Review') setActiveTab('review');
        else if (data.stage === 'Copyediting') setActiveTab('copyediting');
        else if (data.stage === 'Production' || data.stage === 'Published') setActiveTab('production');

        // Fetch reviews
        const m = await import("@/app/actions/editor");
        const revRes = await m.getReviewsForSubmission(submissionId);
        if (revRes.success) setReviews(revRes.reviews || []);

        const availRes = await m.getActiveReviewers();
        if (availRes.success) setAvailableReviewers(availRes.reviewers || []);

        if (data.journals?.name) {
          const boardRes = await m.getEditorialBoard(data.journals.name);
          if (boardRes.success) setBoardMembers(boardRes.members || []);
        }
      } else {
        console.error("Error fetching submission:", res.error);
      }
      
      // Fetch current user role to customize UI
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      let roleStr = "";
      if (user) {
         const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
         if (profile && profile.role) {
             roleStr = profile.role.toLowerCase();
         } else if (user.email) {
             // Fallbacks for the explicitly created production accounts
             if (user.email.includes('kun@apasific.org')) roleStr = 'layout editor';
             if (user.email.includes('rizky@apasific.org')) roleStr = 'cover editor';
             if (user.email.includes('parida@apasific.org')) roleStr = 'publish editor';
             if (user.email.includes('danil@apasific.org')) roleStr = 'supervisor';
         }
      }

      if (!roleStr) {
         const match = document.cookie.match(new RegExp('(^| )active_portal_role=([^;]+)')) || 
                       document.cookie.match(new RegExp('(^| )user_role=([^;]+)'));
         if (match) {
             roleStr = decodeURIComponent(match[2]).toLowerCase();
         } else if (user?.email) {
             if (user.email.includes('editor')) roleStr = 'editor';
             if (user.email.includes('admin')) roleStr = 'admin';
         }
      }
      
      setCurrentUserRole(roleStr || 'editor');
      
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

  const handleSaveIssn = async () => {
    if (!manualIssn.trim()) {
      showToast("ISSN tidak boleh kosong");
      return;
    }
    
    try {
      const res = await updateIssn(submission.id, manualIssn);
      if (!res.success) throw new Error(res.error);
      
      showToast("ISSN berhasil disimpan!");
    } catch (err: any) {
      console.error(err);
      showToast("ISSN gagal disimpan: " + err.message);
    }
  };

  const handlePublishToZenodo = async () => {
    setIsPublishingZenodo(true);
    showToast("Publishing to Zenodo... Please wait.");
    
    try {
      const creatorName = submission.profiles?.full_name || submission.author || "Unknown Author";
      const creatorAffiliation = submission.profiles?.university || submission.university || undefined;
      const creatorOrcid = submission.profiles?.orcid || submission.orcid || undefined;

      // Parse abstract JSON to HTML for Zenodo description
      let formattedAbstract = submission.abstract;
      try {
        const parsed = JSON.parse(submission.abstract);
        formattedAbstract = `
          <h3>Abstrak</h3>
          <p>${parsed.abstract || ''}</p>
          <br/>
          <h3>Abstract</h3>
          <p>${parsed.abstract_en || ''}</p>
          <br/>
          <p><strong>Keywords:</strong> ${parsed.keywords || ''}</p>
        `;
      } catch (e) {
        // Not a JSON string, leave as is
      }

      const metadata: ZenodoMetadata = {
        title: submission.title,
        description: formattedAbstract,
        upload_type: 'publication',
        publication_type: 'article',
        creators: [{ 
          name: creatorName,
          ...(creatorAffiliation ? { affiliation: creatorAffiliation } : {}),
          ...(creatorOrcid ? { orcid: creatorOrcid } : {})
        }],
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

      const updateRes = await updateDoi(submission.id, result.doi, result.deposition?.id);
      if (!updateRes.success) throw new Error("Failed to update database: " + updateRes.error);

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
      const m = await import("@/app/actions/editor");
      const res = await m.updateSubmissionStage(submission.id, newStage, newStatus);
        
      if (!res.success) throw new Error(res.error);
      
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
                {submission.file_url ? (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {submission.file_url.split('/').pop()?.split('?')[0] || 'Manuscript File'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Disubmit: {submission.created_at ? new Date(submission.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </div>
                    </div>
                    <a
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      Download
                    </a>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    <p className="text-sm text-gray-500">Tidak ada file yang diupload oleh Author.</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Action</h3>
                <button 
                  onClick={async () => {
                     const m = await import("@/app/actions/editor");
                     const res = await m.updateSubmissionStage(submission.id, 'Review', 'Awaiting Reviewers');
                     if (res.success) {
                       showToast("Sent to Review Stage!");
                       setTimeout(() => window.location.reload(), 1500);
                     } else {
                       showToast("Error updating stage");
                     }
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded shadow-sm hover:bg-blue-700 font-semibold">
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
                  <button onClick={() => setIsAddReviewerOpen(true)} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-1.5 px-4 rounded border border-gray-300">
                    Add Reviewer
                  </button>
                </div>

                {/* Assigned Reviewer Card */}
                {reviews.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
                    Belum ada reviewer yang ditugaskan atau selesai.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
                      {/* Header */}
                      <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                        <div>
                          <h4 className="font-bold text-gray-800">{rev.reviewer?.full_name || 'Anonim'}</h4>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Selesai: {rev.completed_at ? new Date(rev.completed_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : new Date(rev.updated_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            rev.recommendation === 'accept' ? 'bg-green-100 text-green-800' :
                            rev.recommendation === 'minor_revision' ? 'bg-yellow-100 text-yellow-800' :
                            rev.recommendation === 'major_revision' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {rev.recommendation === 'accept' ? '✅ Accept' :
                             rev.recommendation === 'minor_revision' ? '🟡 Revisi Minor' :
                             rev.recommendation === 'major_revision' ? '🟠 Revisi Mayor' :
                             rev.recommendation === 'resubmit' ? '🔄 Resubmit' :
                             rev.recommendation === 'reject' ? '❌ Decline' : rev.recommendation}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Completed</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Comments for Author */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">💬 Komentar untuk Penulis (Author)</span>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{rev.comments_for_author || 'Tidak ada komentar.'}</p>
                          </div>
                        </div>

                        {/* Correction Notes */}
                        {(rev.correction_notes) && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">✏️ Correction Notes / Catatan Koreksi</span>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{rev.correction_notes}</p>
                            </div>
                          </div>
                        )}

                        {/* Private Comments for Editor */}
                        {(rev.comments_for_editor) && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">🔒 Catatan Rahasia untuk Editor (Confidential)</span>
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Hanya Editor yang bisa melihat ini</span>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{rev.comments_for_editor}</p>
                            </div>
                          </div>
                        )}

                        {/* Reviewer File */}
                        {(rev.annotated_file_url || rev.review_file_url) && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">📎 File Hasil Pemeriksaan (dari Reviewer)</div>
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex-1">
                                <p className="text-xs text-blue-700 font-semibold">File telah diunggah oleh Reviewer</p>
                                <p className="text-xs text-gray-500 mt-1">⬆ Download, periksa, lalu upload ulang di tab <strong>Copyediting</strong> untuk diteruskan ke Layout Editor.</p>
                              </div>
                              <a
                                href={rev.annotated_file_url || rev.review_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center gap-2 text-xs bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-lg transition-colors"
                              >
                                ↓ Download
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Active Reviewers Panel */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Reviewer yang Online</h3>
                  <div className="space-y-3">
                    {availableReviewers.length === 0 ? (
                        <div className="text-sm text-gray-500 bg-gray-50 p-4 border border-gray-200 rounded-lg text-center">Belum ada reviewer yang online saat ini.</div>
                    ) : (() => {
                        const totalPages = Math.ceil(availableReviewers.length / REVIEWERS_PER_PAGE) || 1;
                        const paginatedReviewers = availableReviewers.slice((onlineReviewerPage - 1) * REVIEWERS_PER_PAGE, onlineReviewerPage * REVIEWERS_PER_PAGE);
                        
                        return (
                          <>
                            {paginatedReviewers.map((rev) => (
                                <div key={rev.id} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                                    <div>
                                      <div className="font-semibold text-sm text-gray-800">{rev.full_name}</div>
                                      <div className="text-xs text-gray-500">Keahlian: {rev.expertise || 'Umum'} • Kontak: {rev.phone_number || '-'}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={async () => {
                                        if (window.confirm("Tugaskan reviewer ini dan kirim pesan otomatis via WhatsApp?")) {
                                            setToastMessage("Menugaskan reviewer & mengirim pesan...");
                                            const m = await import("@/app/actions/editor");
                                            
                                            // 1. Assign to database first
                                            const assignRes = await m.assignReviewer(submission.id, rev.id || rev.email, rev.full_name || rev.name);
                                            
                                            if (assignRes.success) {
                                                // 2. Send WA message
                                                const res = await m.sendReviewerInviteWa(rev.phone_number || '', rev.full_name, submission.id);
                                                if (res.success) {
                                                    setToastMessage("Reviewer ditugaskan & Pesan WA terkirim!");
                                                } else {
                                                    setToastMessage("Reviewer ditugaskan, tapi WA gagal: " + res.error);
                                                }
                                                setTimeout(() => window.location.reload(), 1500);
                                            } else {
                                                setToastMessage("Gagal menugaskan reviewer: " + assignRes.error);
                                            }
                                        }
                                      }}
                                      className="text-xs bg-[#25D366] text-black font-semibold py-1 px-3 rounded hover:bg-[#22c35e] text-center"
                                    >
                                      💬 Assign & Invite
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        if (window.confirm(`Tugaskan ${rev.full_name} sebagai reviewer?`)) {
                                          setToastMessage("Menugaskan reviewer...");
                                          const m = await import("@/app/actions/editor");
                                          const res = await m.assignReviewer(submission.id, rev.id || rev.email, rev.full_name || rev.name);
                                          if (res.success) {
                                            setToastMessage("Reviewer berhasil ditugaskan!");
                                            setTimeout(() => window.location.reload(), 1500);
                                          } else {
                                            setToastMessage("Gagal menugaskan reviewer: " + res.error);
                                          }
                                        }
                                      }}
                                      className="text-xs bg-gray-800 text-white font-semibold py-1 px-3 rounded hover:bg-gray-700"
                                    >
                                      Assign
                                    </button>
                                  </div>
                                </div>
                            ))}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center pt-2 mt-4">
                                    <button 
                                        disabled={onlineReviewerPage === 1}
                                        onClick={() => setOnlineReviewerPage(p => Math.max(1, p - 1))}
                                        className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                                    >
                                        Sebelumnya
                                    </button>
                                    <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">Hal {onlineReviewerPage} dari {totalPages}</span>
                                    <button 
                                        disabled={onlineReviewerPage === totalPages}
                                        onClick={() => setOnlineReviewerPage(p => Math.min(totalPages, p + 1))}
                                        className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                                    >
                                        Berikutnya
                                    </button>
                                </div>
                            )}
                          </>
                        );
                    })()}
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
            <div className="space-y-8 animate-fade-in-up">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Copyediting & Layout</h3>
                    <p className="text-gray-500 mt-2 max-w-3xl leading-relaxed text-sm">
                      Tahap perbaikan tata bahasa, format referensi, dan penyesuaian tata letak (layout) naskah agar sesuai dengan <span className="font-semibold text-gray-700">template resmi jurnal</span> sebelum dipublikasikan.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      In Progress
                    </span>
                    {isPureEditor && (
                      <button 
                        onClick={async () => {
                           const m = await import("@/app/actions/editor");
                           const res = await m.updateSubmissionStage(submission.id, 'Copyediting', 'Assigned to Layout');
                           if(res.success) {
                             showToast("Berhasil ditugaskan ke Layout Editor!");
                             setTimeout(() => window.location.reload(), 1500);
                           } else {
                             showToast("Gagal menugaskan naskah.");
                           }
                        }}
                        className="bg-[#18182e] hover:bg-[#252542] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center gap-2 border border-gray-700">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Tugaskan ke Layout Editor (Kirim Naskah)
                      </button>
                    )}
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${!isPureEditor ? '' : 'lg:grid-cols-12'} gap-8`}>
                  {/* Left: Tasks */}
                  {isPureEditor && (
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* Card: Supervisor Assignment */}
                      <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-[#18182e] p-2 rounded-lg">
                            <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </div>
                          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide">TIM SUPERVISI & DESAIN</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {boardMembers.filter(m => m.jabatan.toLowerCase().includes('admin') || m.jabatan.toLowerCase().includes('copy') || m.jabatan.toLowerCase().includes('layout') || m.jabatan.toLowerCase().includes('cover') || m.jabatan.toLowerCase().includes('publish')).length > 0 ? (
                            boardMembers.filter(m => m.jabatan.toLowerCase().includes('admin') || m.jabatan.toLowerCase().includes('copy') || m.jabatan.toLowerCase().includes('layout') || m.jabatan.toLowerCase().includes('cover') || m.jabatan.toLowerCase().includes('publish')).map((member, idx) => (
                              <label key={idx} className="group flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#c9a84c] hover:shadow-md transition-all duration-200">
                                <div className="relative flex items-center justify-center">
                                  <input type="checkbox" className="peer form-checkbox h-4 w-4 text-[#18182e] border-gray-300 rounded focus:ring-[#c9a84c] focus:ring-offset-1 transition-all" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-900 font-bold group-hover:text-[#18182e] transition-colors">{member.nama}</span>
                                  <span className="text-[10px] text-gray-500 font-medium">{member.jabatan}</span>
                                </div>
                              </label>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200 border-dashed">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              <span>Belum ada personil yang tersedia.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card: Standar Checklist */}
                      <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="bg-blue-100 p-2 rounded-lg">
                             <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                           </div>
                           <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide">STANDAR CHECKLIST</h4>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3 p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all">
                            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300" />
                            <span className="text-xs text-gray-700 font-semibold">Proofreading & Ejaan</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all">
                            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300" />
                            <span className="text-xs text-gray-700 font-semibold">Format Referensi (APA/IEEE)</span>
                          </label>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Right: Files */}
                  <div className={`space-y-6 ${!isPureEditor ? '' : 'lg:col-span-8'}`}>
                    
                    {/* Source File to Download */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h4 className="font-bold text-gray-800 text-xs tracking-wider uppercase">BAHAN NASKAH (DARI EDITOR)</h4>
                      </div>
                      <div className="p-6 space-y-6">
                        
                        {/* Reviewer Notes Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h5 className="text-sm font-bold text-gray-800">Catatan Hasil Review (Telah Diverifikasi Editor)</h5>
                          </div>
                          
                          {reviews.length > 0 ? (
                            <div className="space-y-3">
                              {reviews.filter(r => r.status === 'completed').map((rev) => (
                                <div key={rev.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-center mb-3">
                                    <div className="text-sm font-bold text-gray-900">{rev.reviewer?.full_name || 'Reviewer'}</div>
                                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-gray-100 text-gray-600">
                                      {rev.recommendation}
                                    </span>
                                  </div>
                                  {(rev.correction_notes || rev.comments_for_author) && (
                                    <div className="mb-3 text-sm text-gray-700 bg-gray-50/80 p-3 rounded-lg border border-gray-100 leading-relaxed">
                                      <span className="font-bold text-gray-900 block mb-1">Catatan Revisi:</span>
                                      {rev.correction_notes || rev.comments_for_author}
                                    </div>
                                  )}
                                  {(rev.annotated_file_url || rev.review_file_url) && (
                                    <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-lg p-3 mt-2">
                                      <div className="flex items-center gap-3">
                                        <div className="bg-white p-1.5 rounded-md shadow-sm border border-blue-100">
                                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                        </div>
                                        <div>
                                          <div className="text-xs font-bold text-blue-900">File Upload dari Reviewer</div>
                                          <div className="text-[10px] text-blue-600 mt-0.5">Berisi coretan/anotasi pada naskah</div>
                                        </div>
                                      </div>
                                      <a
                                        href={rev.annotated_file_url || rev.review_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-bold transition-colors shadow-sm"
                                      >
                                        Download
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
                              <p className="text-xs text-gray-500 font-medium">Tidak ada catatan review yang tersedia untuk naskah ini.</p>
                            </div>
                          )}
                        </div>

                        {/* Revised Manuscript Block */}
                        <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-xl p-5">
                          <div className="flex items-start gap-4">
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm shrink-0">
                               <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-bold text-gray-900">{submission?.revised_file_url ? 'Naskah Pasca-Review (.DOCX)' : 'Naskah Orisinal (Belum Direvisi Editor)'}</h5>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-md">Gunakan file ini sebagai sumber utama (source) untuk dikerjakan tata letaknya di Microsoft Word.</p>
                              
                              <div className="mt-4 flex gap-3">
                                <a 
                                  href={submission?.revised_file_url || submission?.file_url || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-[#18182e] text-white hover:bg-[#252542] font-semibold py-2 px-5 rounded-lg text-sm shadow-md transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                  Download Source
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Upload Revised Manuscript (For Editors) */}
                        {isPureEditor && (
                          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                             <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                               <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                               Upload Pembaruan Naskah (Opsional)
                             </label>
                             <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                               Jika Anda sudah mengedit naskah pasca-review, unggah file terbarunya di sini agar Layout Editor menggunakan versi yang benar.
                             </p>
                             
                             <div className="relative">
                               <input 
                                 type="file" 
                                 accept=".doc,.docx,.rtf,.pdf"
                                 onChange={async (e) => {
                                   if(!e.target.files || !e.target.files[0]) return;
                                   setIsUploadingRevised(true);
                                   const formData = new FormData();
                                   formData.append('file', e.target.files[0]);
                                   formData.append('submissionId', submission.id);
                                   try {
                                     const res = await fetch('/api/upload-revised-manuscript', { method: 'POST', body: formData });
                                     const data = await res.json();
                                     if(data.success) {
                                       showToast('Berhasil upload naskah revisi!');
                                       setSubmission({...submission, revised_file_url: data.url});
                                     } else {
                                       showToast('Gagal upload: ' + data.error);
                                     }
                                   } catch(err) {
                                     showToast('Error uploading file');
                                   } finally {
                                     setIsUploadingRevised(false);
                                   }
                                 }}
                                 disabled={isUploadingRevised}
                                 className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 cursor-pointer border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                               />
                               {isUploadingRevised && (
                                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                      Mengunggah...
                                    </div>
                                 </div>
                               )}
                             </div>
                          </div>
                        )}
                        
                      </div>
                    </div>
                    
                    {/* Final Layout Galley Upload */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h4 className="font-bold text-gray-800 text-xs tracking-wider uppercase">HASIL AKHIR LAYOUT (GALLEY)</h4>
                      </div>
                      <div className="p-6">
                        <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer group block relative">
                          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          </div>
                          <p className="text-sm font-bold text-gray-900 mb-1">Upload File Naskah Final (.DOCX / .PDF)</p>
                          <p className="text-xs text-gray-500 mb-6 max-w-sm">File ini adalah versi akhir yang sudah diformat dengan template jurnal.</p>
                          {submission?.file_url_galley ? (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col gap-3 w-full" onClick={(e) => e.preventDefault()}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  <div>
                                    <p className="text-sm font-bold text-green-900">Galley File Berhasil Diunggah!</p>
                                    <a href={submission.file_url_galley} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 hover:underline">Lihat File</a>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSubmission({ ...submission, file_url_galley: null });
                                  }}
                                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
                                >
                                  Ganti File
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full flex justify-center">
                              <span className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg shadow-sm group-hover:bg-gray-50 group-hover:border-gray-400 transition-colors text-xs pointer-events-none">
                                Pilih File dari Komputer
                              </span>
                              <input 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                onChange={async (e) => {
                                  if (!e.target.files || e.target.files.length === 0) return;
                                  setIsUploadingGalley(true);
                                  const file = e.target.files[0];
                                  try {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('submissionId', submission.id);
                                    
                                    const res = await fetch('/api/upload-galley', {
                                      method: 'POST',
                                      body: formData
                                    });
                                    if (!res.ok) {
                                      const text = await res.text();
                                      throw new Error(`HTTP ${res.status} - ${text.substring(0, 100)}`);
                                    }
                                    const data = await res.json();
                                    if(data.success) {
                                      setSubmission({...submission, file_url_galley: data.url});
                                      showToast('File Galley berhasil diupload!');
                                    } else {
                                      showToast('Gagal upload: ' + data.error);
                                    }
                                  } catch(err: any) {
                                    console.error('Upload Galley Error:', err);
                                    showToast('Error uploading file: ' + (err.message || String(err)));
                                  } finally {
                                    setIsUploadingGalley(false);
                                  }
                                }}
                                disabled={isUploadingGalley}
                                className="hidden" 
                              />
                              {isUploadingGalley && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Mengunggah...
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </label>

                        {isLayoutEditor && submission?.status === 'Assigned to Layout' && (
                           <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                             <div>
                               <h5 className="font-bold text-blue-900 text-sm">Tugas Layout Selesai?</h5>
                               <p className="text-xs text-blue-700 mt-1">Lanjutkan naskah ini ke Cover Editor untuk pembuatan sampul.</p>
                             </div>
                             <button 
                               onClick={async () => {
                                  const m = await import("@/app/actions/editor");
                                  const res = await m.updateSubmissionStage(submission.id, 'Copyediting', 'Assigned to Cover');
                                  if(res.success) {
                                    showToast("Berhasil dikirim ke Cover Editor!");
                                    setTimeout(() => window.location.href = '/dashboard/production/layout', 1500);
                                  } else {
                                    showToast("Gagal mengirim.");
                                  }
                               }}
                               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2">
                               Kirim ke Cover Editor
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                             </button>
                           </div>
                        )}

                        {isCoverEditor && (
                           <div className="mt-8 border-t pt-6">
                             <h4 className="text-md font-bold text-gray-800 uppercase mb-4 border-b pb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Cover Generator
                             </h4>
                             <CoverGenerator submission={submission} generatedDoi={generatedDoi || submission.doi} />
                             
                             {submission?.status === 'Assigned to Cover' && (
                               <div className="mt-6 p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl flex items-center justify-between">
                                 <div>
                                   <h5 className="font-bold text-yellow-900 text-sm">Tugas Cover Selesai?</h5>
                                   <p className="text-xs text-yellow-700 mt-1">Lanjutkan naskah ini ke Publish Editor untuk publikasi dan metadata (DOI).</p>
                                 </div>
                                 <button 
                                   onClick={async () => {
                                      const m = await import("@/app/actions/editor");
                                      // Publish Editor is in the Production tab
                                      const res = await m.updateSubmissionStage(submission.id, 'Production', 'Assigned to Publish');
                                      if(res.success) {
                                        showToast("Berhasil dikirim ke Publish Editor!");
                                        setTimeout(() => window.location.href = '/dashboard/production/cover', 1500);
                                      } else {
                                        showToast("Gagal mengirim.");
                                      }
                                   }}
                                   className="bg-[#c9a84c] hover:bg-yellow-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2">
                                   Kirim ke Publish Editor
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                 </button>
                               </div>
                             )}
                           </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Admin Editor Buttons (Hidden from specialized production roles) */}
              </div>
            </div>
          )}
          {activeTab === 'production' && (
            <div className="py-8 space-y-8">
              {(submission?.status === 'Production Completed' || submission?.status === 'Published') ? (
                <div className="bg-[#0b0c10]/60 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6 mb-8 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white font-serif">Penerbitan & Publikasi Jurnal</h3>
                      <p className="text-sm text-zinc-400 mt-1">Langkah akhir untuk mempublikasikan artikel secara resmi ke publik dan menerbitkan sertifikat penulis.</p>
                    </div>
                    <span className={`px-4 py-2 text-xs font-bold rounded-full border uppercase tracking-wider ${
                      submission?.status === 'Published' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    }`}>
                      {submission?.status === 'Published' ? '✓ Diterbitkan (Published)' : '● Siap Terbit (Production Completed)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Cover Display */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 w-full">Sampul Depan (Cover)</h4>
                      {submission?.cover_file_url ? (
                        <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-w-sm w-full relative" style={{ containerType: 'inline-size' }}>
                          <img src={submission.cover_file_url} alt="Cover Naskah" className="w-full h-auto object-contain relative z-0" />
                          {(submission.doi || generatedDoi) && (
                            <a 
                              href={(() => {
                                const doiVal = submission.doi || generatedDoi;
                                if (doiVal.includes('zenodo.')) {
                                  const zenodoId = doiVal.split('zenodo.')[1];
                                  return `https://zenodo.org/records/${zenodoId}`;
                                }
                                return `https://doi.org/${doiVal}`;
                              })()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute z-10 font-bold flex items-center hover:underline hover:text-emerald-300 transition-colors" 
                              style={{
                                top: (() => {
                                  let hasScope = false;
                                  try {
                                    if (submission?.abstract) {
                                      const parsed = JSON.parse(submission.abstract);
                                      if (parsed.scope || (parsed.keywords && parsed.keywords.includes('Scope:'))) hasScope = true;
                                    }
                                  } catch(e) {}
                                  const doiY = hasScope ? 440 : 370;
                                  return `${(doiY / 1754) * 100}%`;
                                })(),
                                left: 0,
                                width: '100%',
                                backgroundColor: 'transparent',
                                display: 'flex',
                                justifyContent: 'center',
                                fontSize: '1.8cqw',
                                whiteSpace: 'normal',
                                color: 'transparent',
                                textDecoration: 'none',
                                lineHeight: '1.2'
                              }}
                            >
                              {submission.doi || generatedDoi}
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 w-full flex flex-col items-center justify-center text-center bg-zinc-900/30 text-zinc-500">
                          <svg className="w-12 h-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-sm font-semibold">Cover belum diunggah oleh Cover Editor</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Final Actions */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800/80 space-y-4">
                        <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Metadata Penerbitan</h5>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div>
                            <span className="text-zinc-500 block text-xs uppercase font-semibold">Jurnal</span>
                            <span className="font-semibold text-zinc-200">{submission?.journals?.name || '-'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-xs uppercase font-semibold">ISSN</span>
                            <span className="font-semibold text-zinc-200">{submission?.issn || '-'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-zinc-500 block text-xs uppercase font-semibold">Digital Object Identifier (DOI)</span>
                            {(submission?.doi || generatedDoi) ? (
                              <a 
                                href={(() => {
                                  const doiVal = submission.doi || generatedDoi;
                                  if (doiVal.includes('zenodo.')) {
                                    const zenodoId = doiVal.split('zenodo.')[1];
                                    return `https://zenodo.org/records/${zenodoId}`;
                                  }
                                  return `https://doi.org/${doiVal}`;
                                })()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-emerald-400 hover:text-emerald-300 hover:underline break-all"
                              >
                                {submission?.doi || generatedDoi}
                              </a>
                            ) : (
                              <span className="text-zinc-500">Menunggu API Publish Editor</span>
                            )}
                          </div>
                        </div>
                      </div>


                      {submission?.status === 'Production Completed' ? (
                        <div className="space-y-4 pt-4">
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium">
                            ⚠️ Seluruh proses produksi (Layout, Cover, & API) telah disahkan oleh Supervisor. Anda sekarang dapat merilis naskah ini.
                          </div>
                          <button
                            onClick={async () => {
                              const confirmPublish = confirm("Apakah Anda yakin ingin menerbitkan naskah ini? Status naskah akan berubah menjadi Published dan Sertifikat Publikasi penulis akan diterbitkan secara otomatis.");
                              if (!confirmPublish) return;
                              const m = await import("@/app/actions/editor");
                              const res = await m.publishArticle(submission.id, submission.journal_id || "");
                              if (res.success) {
                                showToast("Naskah resmi diterbitkan!");
                                setTimeout(() => window.location.reload(), 1000);
                              } else {
                                showToast("Gagal menerbitkan naskah.");
                              }
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-colors text-base flex justify-center items-center gap-2 border border-emerald-500/30"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Mempublikasikan Naskah (Publish)
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-4">
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
                            ✓ Naskah telah dipublikasikan dan sertifikat penghargaan penulis telah aktif.
                          </div>
                          <Link
                            href="/dashboard/certificates"
                            target="_blank"
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-4 px-6 rounded-xl transition-colors text-base flex justify-center items-center gap-2 border border-zinc-700 text-center"
                            style={{ textDecoration: 'none' }}
                          >
                            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            Lihat Sertifikat Terbit
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 1. Publish Editor Dashboard */}
                  {(isPublishEditor || isPureEditor || isSupervisor) ? (
                  <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm border-t-4 border-t-blue-500">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Publish Editor</h3>
                    <p className="text-sm text-gray-600 mb-6">Bertanggung jawab atas metadata, integrasi identifier (DOI), pengecekan similarity akhir, dan sinkronisasi mesin indeks eksternal.</p>
                    
                    {/* Publish Editor Staff */}
                    <div className="space-y-3 mb-6">
                        {boardMembers.filter(m => m.jabatan.toLowerCase().includes('layout') || m.jabatan.toLowerCase().includes('cover') || m.jabatan.toLowerCase().includes('publish')).length > 0 ? (
                          boardMembers.filter(m => m.jabatan.toLowerCase().includes('layout') || m.jabatan.toLowerCase().includes('cover') || m.jabatan.toLowerCase().includes('publish')).map((member, idx) => (
                            <label key={idx} className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-100 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                              <div className="flex flex-col">
                                <span className="text-sm text-blue-900 font-bold">{member.nama}</span>
                                <span className="text-xs text-blue-700">{member.jabatan}</span>
                              </div>
                            </label>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                            Belum ada Publish Editor di menu Board Editor.
                          </div>
                        )}
                    </div>

                    {/* Publish Editor Tools */}
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cover Naskah Final</h4>
                      {submission?.cover_file_url ? (
                        <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-xs mx-auto md:mx-0 relative" style={{ containerType: 'inline-size' }}>
                           <img src={submission.cover_file_url} alt="Cover Naskah" className="w-full h-auto object-contain relative z-0" />
                           {(generatedDoi || submission.doi) && (
                             <div 
                               className="absolute z-10 font-bold flex items-center" 
                               style={{
                                 top: (() => {
                                   let hasScope = false;
                                   try {
                                     if (submission?.abstract) {
                                       const parsed = JSON.parse(submission.abstract);
                                       if (parsed.scope || (parsed.keywords && parsed.keywords.includes('Scope:'))) hasScope = true;
                                     }
                                   } catch(e) {}
                                   const doiY = hasScope ? 440 : 370;
                                   return `${(doiY / 1754) * 100}%`;
                                 })(),
                                 left: 0,
                                 width: '100%',
                                 backgroundColor: 'transparent',
                                 display: 'flex',
                                 justifyContent: 'center',
                                 fontSize: '1.8cqw',
                                 whiteSpace: 'normal',
                                 color: 'transparent',
                                 textDecoration: 'none',
                                 lineHeight: '1.2'
                               }}
                             >
                               {generatedDoi || submission.doi}
                             </div>
                           )}
                        </div>
                      ) : (
                        <div className="mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                           Belum ada cover yang dikirim dari Cover Editor.
                        </div>
                      )}

                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 border-t pt-4">Alur Publikasi (Integrasi & API)</h4>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                        <span className="text-sm font-semibold text-gray-700">Skor Plagiasi Akhir (Turnitin)</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold">N/A</span>
                      </div>

                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded flex flex-col gap-2">
                         <label className="text-sm font-semibold text-gray-700">ISSN Jurnal (Manual)</label>
                         <div className="flex gap-2">
                           <input 
                              type="text" 
                              placeholder="Contoh: 2722-1234"
                              value={manualIssn}
                              onChange={(e) => setManualIssn(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                           />
                           <button 
                              onClick={handleSaveIssn}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors shadow-sm"
                           >
                              Simpan ISSN
                           </button>
                         </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-4">
                        <button 
                          onClick={handlePublishToZenodo}
                          disabled={isPublishingZenodo || !!generatedDoi}
                          className={`font-bold py-3 px-4 rounded transition-colors flex justify-center items-center gap-2 ${
                            !generatedDoi
                              ? 'bg-[#1a1a2e] text-white hover:bg-[#252542]'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {isPublishingZenodo ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                          )}
                          {isPublishingZenodo ? 'Menyambungkan ke API...' : (generatedDoi ? 'Telah Diterbitkan (DOI Active)' : 'Terbitkan Metadata & Generate DOI')}
                        </button>

                        <button 
                          disabled={!generatedDoi}
                          className={`font-bold py-3 px-4 rounded transition-colors flex justify-center items-center gap-2 ${
                            generatedDoi 
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                              : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          Download XML Crossref
                        </button>
                      </div>

                      {generatedDoi && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm font-semibold">
                          ✅ Persistent Identifier (DOI): {generatedDoi}
                        </div>
                      )}

                      {currentUserRole.includes('publish') && submission?.status === 'Assigned to Publish' && (
                         <div className="flex justify-end pt-6 mt-4 border-t border-gray-200">
                           <button 
                             onClick={async () => {
                                const m = await import("@/app/actions/editor");
                                const res = await m.updateSubmissionStage(submission.id, 'Production', 'Pending Supervisor');
                                if(res.success) {
                                  showToast("Berhasil dikirim ke Supervisor!");
                                  setTimeout(() => window.location.href = '/dashboard/production/publish', 1500);
                                } else {
                                  showToast("Gagal mengirim.");
                                }
                             }}
                             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded shadow-sm text-sm flex items-center gap-2">
                             Kirim ke Supervisor
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                           </button>
                         </div>
                      )}
                    </div>
                  </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center text-center shadow-inner h-full">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <h3 className="text-xl font-bold text-gray-500">Akses Dibatasi</h3>
                      <p className="text-gray-400 mt-2 text-sm max-w-sm">Halaman ini hanya dapat diakses oleh Publish Editor dan Supervisor. Tugas Anda di naskah ini sudah selesai.</p>
                    </div>
                  )}

                  {/* 2. Supervisor Dashboard */}
                  <div className="bg-white border border-green-200 rounded-lg p-6 shadow-sm border-t-4 border-t-green-500">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Supervisor (Pemeriksa Final)</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full border border-gray-200">Pending</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Sebagai pintu gerbang terakhir, Supervisor bertugas memvalidasi hasil kerja tim Layout Editor, Cover Editor, dan Publish Editor sebelum naskah benar-benar diterbitkan.</p>
                      
                      {/* Admin Produksi Staff */}
                      <div className="space-y-3 mb-6">
                          {boardMembers.filter(m => m.jabatan.toLowerCase().includes('admin')).length > 0 ? (
                            boardMembers.filter(m => m.jabatan.toLowerCase().includes('admin')).map((member, idx) => (
                              <label key={idx} className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded cursor-pointer hover:bg-yellow-100 transition-colors">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-[#c9a84c] rounded focus:ring-[#c9a84c]" />
                                <div className="flex flex-col">
                                  <span className="text-sm text-yellow-900 font-bold">{member.nama}</span>
                                  <span className="text-xs text-yellow-700">{member.jabatan}</span>
                                </div>
                              </label>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                              Belum ada Admin Editor di menu Board Editor.
                            </div>
                          )}
                      </div>

                      <div className="pt-4 border-t border-gray-200 space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Checklist Validasi Supervisor</h4>
                        <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200">
                          <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded" />
                          <span className="text-xs text-gray-700 font-medium">Validasi Kerja Tim Layout & Cover (Galley PDF sudah sesuai standar)</span>
                        </label>
                        <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200">
                          <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded" />
                          <span className="text-xs text-gray-700 font-medium">Validasi Kerja Publish Editor (DOI dan Metadata sudah aktif)</span>
                        </label>

                        {/* Tracking Indicators */}
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-6 mb-2">Monitor Mesin Indeks (OAI-PMH)</h4>
                        <div className="flex gap-2">
                          <div className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${generatedDoi ? 'bg-[#A6CE39]/10 border-[#A6CE39]/30 text-[#7ca221]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                            <span className="text-[10px] font-black uppercase tracking-wider">ORCID</span>
                            <span className="text-[9px] font-medium mt-1">{generatedDoi ? 'Pushing Data' : 'Menunggu DOI'}</span>
                          </div>
                          <div className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${generatedDoi ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                            <span className="text-[10px] font-black uppercase tracking-wider">Scopus</span>
                            <span className="text-[9px] font-medium mt-1">{generatedDoi ? 'Ready to Sync' : 'Menunggu DOI'}</span>
                          </div>
                          <div className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${generatedDoi ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                            <span className="text-[10px] font-black uppercase tracking-wider">WoS</span>
                            <span className="text-[9px] font-medium mt-1">{generatedDoi ? 'Ready to Sync' : 'Menunggu DOI'}</span>
                          </div>
                        </div>
                      </div>

                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <button 
                        onClick={async () => {
                           const m = await import("@/app/actions/editor");
                           const res = await m.updateSubmissionStage(submission.id, 'Production', 'Production Completed');
                           if(res.success) {
                             showToast("Produksi selesai! Naskah dikembalikan ke Editor.");
                             setTimeout(() => window.location.href = '/dashboard/production/supervisor', 1500);
                           } else {
                             showToast("Gagal memproses.");
                           }
                        }}
                        className={`w-full font-bold py-4 px-6 rounded-lg shadow-sm transition-colors text-base flex justify-center items-center gap-2 ${
                          submission?.status === 'Pending Supervisor' ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={submission?.status !== 'Pending Supervisor'}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        {submission?.status === 'Pending Supervisor' ? 'Kembalikan ke Editor (Selesai)' : 'Menunggu Publish Editor'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Decision Modal */}
      {decisionModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
            {/* Enterprise Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Record Editorial Decision</h2>
              <button onClick={() => setDecisionModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
              
              {/* Decision Select */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Decision <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={decision}
                    onChange={handleDecisionChange}
                    className="w-full appearance-none border border-gray-300 rounded-md py-2.5 pl-3 pr-10 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow cursor-pointer shadow-sm"
                  >
                    <option value="" disabled>Select a decision...</option>
                    <option value="accept">Accept Submission (Send to Copyediting)</option>
                    <option value="revisions">Revisions Required</option>
                    <option value="decline">Decline Submission</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                {/* Email Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Email Notification to Author</label>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200">Required</span>
                  </div>
                  <p className="text-xs text-gray-500">Reviewer comments will be automatically appended to this email.</p>
                  <textarea 
                    rows={6}
                    value={emailText}
                    onChange={e => setEmailText(e.target.value)}
                    data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" spellCheck={false}
                    className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-y shadow-sm font-mono"
                  ></textarea>
                </div>

                {/* Phone Section */}
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-gray-700">Author's Phone / WhatsApp</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <input 
                      type="tel"
                      value={authorPhone}
                      onChange={e => setAuthorPhone(e.target.value)}
                      placeholder="+62 813-7006-2009"
                      className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Include country code for WhatsApp integration.</p>
                </div>
              </div>
            </div>

            {/* Enterprise Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-row-reverse gap-3 bg-gray-50">
              <button disabled={!decision} onClick={() => handleRecordDecision(false)} className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent">
                Record Decision
              </button>
              <a 
                href={decision ? `https://wa.me/${authorPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(emailText)}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!decision) { e.preventDefault(); return; }
                  handleRecordDecision(true);
                }}
                className={`inline-flex justify-center items-center gap-1.5 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors ${!decision ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Send via WA
              </a>
              <button onClick={() => setDecisionModalOpen(false)} className="inline-flex justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm border border-gray-300 hover:bg-gray-50 mr-auto transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reviewer Modal */}
      {isAddReviewerOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Assign Reviewer</h3>
              <button onClick={() => setIsAddReviewerOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200 bg-white">
                <input 
                    type="text" 
                    placeholder="🔍 Cari berdasarkan nama, institusi, atau negara..." 
                    value={reviewerSearch}
                    onChange={(e) => { setReviewerSearch(e.target.value); setReviewerPage(1); }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-800"
                />
            </div>

            <div className="p-6 overflow-y-auto">
              {availableReviewers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Tidak ada reviewer yang tersedia di database.</div>
              ) : (() => {
                const filteredReviewers = availableReviewers.filter(r => 
                    (r.full_name || r.name || '').toLowerCase().includes(reviewerSearch.toLowerCase()) || 
                    (r.university || r.institution || '').toLowerCase().includes(reviewerSearch.toLowerCase()) ||
                    (r.country || '').toLowerCase().includes(reviewerSearch.toLowerCase())
                );
                const totalPages = Math.ceil(filteredReviewers.length / REVIEWERS_PER_PAGE) || 1;
                const paginatedReviewers = filteredReviewers.slice((reviewerPage - 1) * REVIEWERS_PER_PAGE, reviewerPage * REVIEWERS_PER_PAGE);
                
                return (
                  <div className="space-y-4">
                    {filteredReviewers.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">Pencarian tidak menemukan hasil.</div>
                    ) : (
                        paginatedReviewers.map(rev => (
                          <div key={rev.id || rev.email} className="flex justify-between items-center p-4 border rounded-lg hover:border-blue-500 hover:shadow-sm transition-all">
                            <div>
                              <div className="font-bold text-gray-800">{rev.full_name || rev.name}</div>
                              <div className="text-sm text-gray-500">{rev.university || rev.institution || 'Unknown University'} • {rev.country || 'Unknown Country'}</div>
                              <div className="text-xs text-blue-600 font-semibold mt-1">{rev.email}</div>
                            </div>
                            <button 
                              onClick={async () => {
                                setToastMessage("Menugaskan reviewer...");
                                const m = await import("@/app/actions/editor");
                                const res = await m.assignReviewer(submissionId, rev.id || rev.email, rev.full_name || rev.name);
                                if (res.success) {
                                  setToastMessage("Reviewer berhasil ditugaskan!");
                                  setIsAddReviewerOpen(false);
                                  setTimeout(() => window.location.reload(), 1500);
                                } else {
                                  setToastMessage("Gagal menugaskan reviewer: " + res.error);
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm transition-colors"
                            >
                              Tugaskan
                            </button>
                          </div>
                        ))
                    )}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-100">
                            <button 
                                disabled={reviewerPage === 1}
                                onClick={() => setReviewerPage(p => Math.max(1, p - 1))}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                            >
                                Sebelumnya
                            </button>
                            <span className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">Halaman {reviewerPage} dari {totalPages}</span>
                            <button 
                                disabled={reviewerPage === totalPages}
                                onClick={() => setReviewerPage(p => Math.min(totalPages, p + 1))}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                            >
                                Berikutnya
                            </button>
                        </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      </>
      )}
    </div>
  );
}
