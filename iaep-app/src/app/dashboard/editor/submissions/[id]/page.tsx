"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
// Target #4 (CONNECT): the consolidated deposit now runs through the
// publishToZenodo server action (PublicationDepositService +
// ProviderRuntimeManager). Legacy direct-Zenodo utilities remain in the
// codebase untouched, pending the later DEPRECATE phase.
import { getSubmissionDetailsEditor, updateIssn, updateDoi, removeCoverFile, sendRevisionForwardWaFonnte, publishToZenodo, refreshPublicationIndexStatus } from "@/app/actions/editor";
import { createClient } from "@/utils/supabase/client";
import DynamicCover from "@/components/ui/DynamicCover";

export default function SubmissionControlPanel() {
  const params = useParams();
  const submissionId = params.id as string;
  
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submission");
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decision, setDecision] = useState("");
  const [emailText, setEmailText] = useState("");
  const [authorPhone, setAuthorPhone] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isPublishingZenodo, setIsPublishingZenodo] = useState(false);
  const [isRefreshingIndex, setIsRefreshingIndex] = useState(false);
  const [generatedDoi, setGeneratedDoi] = useState("");
  const [manualIssn, setManualIssn] = useState("");
  const [manualDoi, setManualDoi] = useState("");
  const [isSavingManualDoi, setIsSavingManualDoi] = useState(false);
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
  const [customVolume, setCustomVolume] = useState("");
  const [customIssue, setCustomIssue] = useState("");
  const [customAuthor, setCustomAuthor] = useState("");
const [uploadingReviewId, setUploadingReviewId] = useState<string | null>(null);
  const [isSendingFonnte, setIsSendingFonnte] = useState(false);
// AI-Assisted Review Enhancement Layer (advisory only).
  // AI is NOT a reviewer. It enhances COMPLETED HUMAN reviewer reports.
  const [enhancementsMap, setEnhancementsMap] = useState<Record<string, any>>({});
  const [enhancementsLoading, setEnhancementsLoading] = useState<Record<string, boolean>>({});
  const [enhancementsError, setEnhancementsError] = useState<Record<string, string>>({});
  
  // AI Reviewer Assistant States
  const [aiAssessment, setAiAssessment] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Save volume & issue to LocalStorage for draft purposes only
  useEffect(() => {
    if (submissionId && customVolume !== "") {
      localStorage.setItem(`draft_vol_${submissionId}`, customVolume);
    }
  }, [customVolume, submissionId]);

  useEffect(() => {
    if (submissionId && customIssue !== "") {
      localStorage.setItem(`draft_iss_${submissionId}`, customIssue);
    }
  }, [customIssue, submissionId]);

// AI-Assisted Review Enhancement Layer â€” load any existing enhancement
  // records for completed HUMAN reviews so the editor can view them.
  // AI is advisory only; it never alters the human recommendation.
  useEffect(() => {
    if (!reviews || reviews.length === 0) return;
    let cancelled = false;
    const completed = reviews.filter((r: any) => r.status === 'completed');
    if (completed.length === 0) return;

    (async () => {
      const m = await import("@/app/actions/reviewEnhancement");
      for (const r of completed) {
        if (cancelled) return;
        try {
          const res = await m.getReviewEnhancement(r.id);
          if (cancelled) return;
          if (res?.success && res.enhancement) {
            setEnhancementsMap(prev => ({ ...prev, [r.id]: res.enhancement }));
          }
        } catch {
          // silent â€” enhancement panel is optional
        }
      }
    })().catch(() => {});
    return () => { cancelled = true; };
  }, [reviews]);

  // Determine role cleanly
  const roleStr = currentUserRole.toLowerCase();
  const isCoAdmin = roleStr.includes('co_admin') || roleStr.includes('co-admin');
  const isLayoutEditor = roleStr.includes('layout');
  const isCoverEditor = roleStr.includes('cover');
  const isPublishEditor = roleStr.includes('publish');
  const isSupervisor = roleStr.includes('supervisor');
  const isPureEditor = (roleStr.includes('admin') && !roleStr.includes('co')) || roleStr.includes('supervisor') || (roleStr.includes('editor') && !roleStr.includes('layout') && !roleStr.includes('cover') && !roleStr.includes('publish'));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

// AI-Assisted Review Enhancement â€” enhances a COMPLETED HUMAN review.
  // AI is advisory only; it never alters the human recommendation or status.
  const handleRunEnhancement = async (reviewId: string) => {
    if (!reviewId || enhancementsLoading[reviewId]) return;
    setEnhancementsLoading(prev => ({ ...prev, [reviewId]: true }));
    setEnhancementsError(prev => { const clone = { ...prev }; delete clone[reviewId]; return clone; });
    showToast("Menghasilkan Quality Observation AI untuk review manusia...");
    try {
      const m = await import("@/app/actions/reviewEnhancement");
      const res = await m.runReviewEnhancement(reviewId);
      if (res.success && res.enhancement) {
        setEnhancementsMap(prev => ({ ...prev, [reviewId]: res.enhancement }));
        showToast("Quality Observation AI berhasil dibuat (advisory).");
      } else {
        setEnhancementsError(prev => ({ ...prev, [reviewId]: res.error || 'Gagal menghasilkan observation.' }));
        showToast("Gagal membuat observation: " + (res.error || 'Unknown error'));
      }
    } catch {
      setEnhancementsError(prev => ({ ...prev, [reviewId]: 'Gagal menjalankan enhancement.' }));
      showToast("Gagal menjalankan AI enhancement.");
    } finally {
      setEnhancementsLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  useEffect(() => {
    const fetchSubmission = async () => {
      // Force compile cache refresh
      const supabase = createClient();
      const res = await getSubmissionDetailsEditor(submissionId);
        
      if (res.success && res.submission) {
        const data = res.submission;
        setSubmission({
          ...data,
          author: data.profiles?.full_name || 'Unknown',
          stage: data.stage || 'Review',
          status: data.status || 'Awaiting Reviewers',
        });
        if (data.doi) setGeneratedDoi(data.doi);
        if (data.issn) setManualIssn(data.issn);
        
        // Update author phone dynamically
        if (data.phone) setAuthorPhone(data.phone);
        else if (data.profiles?.phone) setAuthorPhone(data.profiles.phone);

        // Dynamically build the email text based on actual author and title
        const authorFirstName = data.profiles?.full_name ? data.profiles.full_name.split(' ')[0] : 'Author';
        setEmailText(`Dear ${authorFirstName},\n\nWe have reached a decision regarding your submission to APASIFIC IAEP: ${data.title}.\n\nOur decision is: `);

        // Pre-fill volume and issue from database (database is always authoritative)
        // Also clear stale localStorage so database value always wins
        if (data.volume) {
          setCustomVolume(data.volume);
          localStorage.setItem(`draft_vol_${data.id}`, data.volume);
        } else {
          localStorage.removeItem(`draft_vol_${data.id}`);
        }
        if (data.issue) {
          setCustomIssue(data.issue);
          localStorage.setItem(`draft_iss_${data.id}`, data.issue);
        } else {
          localStorage.removeItem(`draft_iss_${data.id}`);
        }
        
        if (data.author) {
          setCustomAuthor(data.author);
        } else if (data.profiles?.full_name) {
          setCustomAuthor(data.profiles.full_name);
        }
        
        // Auto set active tab based on stage
        if (data.stage === 'Review') setActiveTab('review');
        else if (data.stage === 'Copyediting') setActiveTab('copyediting');
        else if (data.stage === 'Production' || data.stage === 'Published') setActiveTab('production');

        // Fetch reviews, reviewers, and board members in parallel to speed up rendering
        const m = await import("@/app/actions/editor");
        
        const [revRes, availRes, boardRes] = await Promise.all([
          m.getReviewsForSubmission(submissionId),
          m.getActiveReviewers(),
          data.journals?.name ? m.getEditorialBoard(data.journals.name) : Promise.resolve({ success: true, members: [] })
        ]);

        if (revRes.success) setReviews(revRes.reviews || []);
        if (availRes.success) setAvailableReviewers(availRes.reviewers || []);
        if (boardRes.success) setBoardMembers(boardRes.members || []);

        // Load AI Assessment & Recommendations (Tata Kelola AI)
        const [assessRes, recomRes] = await Promise.all([
          supabase.from('ai_reviewer_assessments').select('*').eq('submission_id', submissionId).maybeSingle(),
          supabase.from('ai_reviewer_recommendations').select('*, profiles:reviewer_profile_id(full_name, phone_number, email)').eq('submission_id', submissionId)
        ]);

        if (assessRes.data) setAiAssessment(assessRes.data);
        if (recomRes.data) setAiRecommendations(recomRes.data);

      } else {
        console.error("Error fetching submission:", res.error);
      }
      
      // Fetch current user role to customize UI
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

  const handleSaveManualDoi = async () => {
    const doiInput = manualDoi.trim();
    if (!doiInput) {
      showToast("Mohon masukkan nomor DOI terlebih dahulu.");
      return;
    }
    setIsSavingManualDoi(true);
    try {
      const m = await import("@/app/actions/editor");
      const res = await m.updateDoi(submission.id, doiInput, 0);
      if (!res.success) throw new Error(res.error);
      setGeneratedDoi(doiInput);
      setSubmission((prev: any) => prev ? { ...prev, doi: doiInput } : null);
      showToast("DOI berhasil disimpan!");
    } catch (err: any) {
      showToast("Gagal menyimpan DOI: " + err.message);
    } finally {
      setIsSavingManualDoi(false);
    }
  };

  const handlePublishToZenodo = async () => {
    setIsPublishingZenodo(true);
    showToast("Menjalankan deposit terpusat dari server... Mohon tunggu.");

    try {
      // Target #4: consolidated flow through PublicationDepositService +
      // ProviderRuntimeManager. Preserves any existing DOI/Zenodo record.
      const res = await publishToZenodo(submission.id, {
        volume: customVolume || undefined,
        issue: customIssue || undefined,
        authorName: customAuthor || undefined
      });

      if (!res.success) throw new Error(res.error || "Federasi publikasi gagal.");

      // Reflect preserved identifiers immediately in the UI.
      if (res.doi) setGeneratedDoi(res.doi);
      setSubmission((prev: any) => prev ? {
        ...prev,
        doi: res.doi || prev.doi,
        zenodo_id: res.zenodoId || prev.zenodo_id
      } : null);

      if (res.skippedDeposit) {
        showToast(`Identifier yang sudah ada dipertahankan (DOI: ${res.doi || "-"}) â€” deposit duplikat dilewati.`);
      } else {
        showToast(`Berhasil diterbitkan ke Zenodo! DOI: ${res.doi || "pending"}`);
      }

      const failedProviders = (res.providers || []).filter((p: any) => p.status === "FAILED");
      if (failedProviders.length > 0) {
        console.warn("Penyedia yang gagal selama federasi:", failedProviders);
        showToast(`Catatan: ${failedProviders.length} langkah lanjutan gagal (lihat konsol). DOI/deposit tetap aman.`);
      }

      if (res.zenodoUrl) {
        window.open(res.zenodoUrl, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Gagal menerbitkan ke Zenodo: ' + err.message);
    } finally {
      setIsPublishingZenodo(false);
    }
  };

  const handleRefreshIndexStatus = async () => {
    setIsRefreshingIndex(true);
    try {
      const res = await refreshPublicationIndexStatus(submission.id);
      if (!res.success) throw new Error(res.error || "Gagal memperbarui status indexing.");
      showToast(`Status indexing diperbarui: ${res.indexStatus?.overall?.visibility || "tidak diketahui"}`);
    } catch (err: any) {
      showToast("Gagal memperbarui status indexing: " + err.message);
    } finally {
      setIsRefreshingIndex(false);
    }
  };

  const handleForwardToReviewersFonnte = async () => {
    setIsSendingFonnte(true);
    try {
      const targetReviews = reviews.filter(r => ['major_revision', 'revisions_major', 'minor_revision', 'revisions_minor', 'accepted'].includes(r.recommendation));
      
      if (targetReviews.length === 0) {
        showToast("Tidak ada reviewer yang perlu diteruskan file revisi ini.");
        return;
      }

      const m = await import("@/app/actions/editor");

      // Collect assignment IDs and reviewer phones for the new server action
      const assignmentIds = targetReviews.map((r: any) => r.id).filter(Boolean);
      const reviewerPhones = targetReviews.map((r: any) => ({
        phone: r.reviewer?.phone || '',
        name: r.reviewer?.full_name || 'Reviewer'
      }));
      const revisedFileUrl = submission.revised_file_url || submission.file_url || '';

      // Call the new comprehensive server action (updates DB status + sends WA)
      const res = await m.forwardRevisionToReviewer(
        submission.id,
        assignmentIds,
        reviewerPhones,
        submission.title,
        revisedFileUrl
      );

      if (res.success) {
        // Update local state to reflect new status
        setSubmission({ ...submission, status: 'Revision Under Review' });
        showToast(`Revisi berhasil diteruskan ke ${res.waCount ?? 0} Reviewer via WhatsApp.`);
      } else {
        showToast("Terjadi kesalahan: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan sistem saat meneruskan revisi.");
    } finally {
      setIsSendingFonnte(false);
    }
  };

  const handleRecordDecision = async () => {
    if (!decision) return;
    
    let backendDecision: 'Accepted' | 'Needs Revision' | 'Declined';
    if (decision === 'accept') backendDecision = 'Accepted';
    else if (decision === 'revisions') backendDecision = 'Needs Revision';
    else backendDecision = 'Declined';

    try {
      const m = await import("@/app/actions/editor");
      const res = await m.recordEditorialDecision(
          submission.id,
          backendDecision,
          emailText,
          authorPhone,
          submission.journals?.name || 'Jurnal',
          submission.title || 'Artikel'
      );
        
      if (!res.success) throw new Error(res.error);
      
      setSubmission({ ...submission, stage: res.newStage, status: res.newStatus });
      
      if (res.newStage === 'Copyediting') setActiveTab('copyediting');
      
      let msg = 'Keputusan berhasil disimpan!';
      if (res.warning) msg += ' (' + res.warning + ')';
      
      showToast(msg);
    } catch (err: any) {
      console.error(err);
      showToast('Gagal menyimpan keputusan: ' + err.message);
    } finally {
      setDecisionModalOpen(false);
    }
  };

  const isAuthorized = currentUserRole && (
    isCoAdmin || isPureEditor || isLayoutEditor || isCoverEditor || isPublishEditor || isSupervisor
  );

  if (!loading && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-[#0c0c16] rounded-2xl border border-red-500/20 max-w-lg mx-auto mt-20 space-y-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-3xl">âš ï¸</div>
        <h2 className="text-xl font-bold text-white font-['Cinzel']">Akses Ditolak (Access Denied)</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Akun Anda ({currentUserRole}) tidak memiliki izin untuk mengakses halaman kontrol panel editor ini.
        </p>
        <Link href="/dashboard" className="px-6 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm font-bold">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const membersArray = Array.isArray(boardMembers) ? boardMembers : [];

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
            <Link href="/dashboard/editor" prefetch={false} className="hover:text-[#c9a84c]">Editorial Board</Link>
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
          
          {/* OJS Workflow Progress Timeline â€” Premium Enterprise Design */}
          <div className="w-full mt-10 bg-[#0c0c16]/50 border border-gray-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-[48px] left-[8%] right-[8%] h-[2px] bg-gray-800 -z-10 hidden md:block">
              <div 
                className="h-full bg-gradient-to-r from-[#c9a84c] via-yellow-500 to-[#c9a84c] shadow-[0_0_8px_#c9a84c] transition-all duration-500"
                style={{
                  width: activeTab === 'submission' ? '0%' :
                         activeTab === 'review' ? '25%' :
                         activeTab === 'ai assistant' ? '50%' :
                         activeTab === 'copyediting' ? '75%' : '100%'
                }}
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 w-full">
              {(isPureEditor 
                ? (['Submission', 'Review', 'AI Assistant', 'Copyediting', 'Production'] as const)
                : (['Submission', 'Review', 'Copyediting', 'Production'] as const).filter(tab => isCoAdmin ? ['Submission', 'Review'].includes(tab) : true)
              ).map((tab, idx) => {
                const isActive = activeTab === tab.toLowerCase() || (tab === 'AI Assistant' && activeTab === 'ai assistant');
                
                // Determine step status colors
                let statusColor = 'border-gray-800 text-gray-500 bg-[#07070d]';
                let labelColor = 'text-gray-400';
                
                if (isActive) {
                  statusColor = 'border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/10 shadow-[0_0_20px_rgba(201,168,76,0.25)]';
                  labelColor = 'text-[#c9a84c] font-bold';
                }

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className="flex-1 flex flex-col items-center w-full focus:outline-none group transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${statusColor} group-hover:scale-105`}>
                      <span className="text-sm font-black">{idx + 1}</span>
                    </div>
                    <span className={`text-[11px] uppercase tracking-widest font-extrabold mt-3 transition-colors duration-300 ${labelColor}`}>
                      {tab}
                    </span>
                    <span className={`text-[8px] tracking-wider uppercase font-semibold mt-1 transition-opacity ${isActive ? 'text-[#c9a84c]/80 opacity-100' : 'text-gray-600 opacity-60'}`}>
                      {isActive ? 'Active Stage' : 'Workflow Step'}
                    </span>
                  </button>
                );
              })}
            </div>
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

              {/* Metadata & Author Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Metadata & Informasi Penulis</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  {(() => {
                    let metadata: any = {};
                    try {
                      metadata = JSON.parse(submission.abstract || "{}");
                    } catch (e) {
                      metadata = { abstract_id: submission.abstract };
                    }
                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Scope Jurnal</span>
                            <div className="text-sm text-gray-800 font-medium bg-gray-50 p-2 border border-gray-200 rounded">{metadata.scope || "-"}</div>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Paket Publikasi</span>
                            <div className="text-sm text-gray-800 font-medium bg-gray-50 p-2 border border-gray-200 rounded">{metadata.paket || "-"}</div>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nomor WhatsApp (Aktif)</span>
                            <div className="text-sm text-gray-800 font-medium bg-gray-50 p-2 border border-gray-200 rounded">{metadata.phone || "-"}</div>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kata Kunci (Keywords)</span>
                            <div className="text-sm text-gray-800 font-medium bg-gray-50 p-2 border border-gray-200 rounded">{metadata.keywords || "-"}</div>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Abstrak (Bahasa Indonesia)</span>
                          <div className="text-sm text-gray-800 bg-gray-50 p-3 border border-gray-200 rounded leading-relaxed whitespace-pre-wrap">{metadata.abstract_id || metadata.abstract || "-"}</div>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Abstract (English)</span>
                          <div className="text-sm text-gray-800 bg-gray-50 p-3 border border-gray-200 rounded leading-relaxed whitespace-pre-wrap">{metadata.abstract_en || "-"}</div>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2 border-b pb-1">Daftar Penulis (Authors)</span>
                          {metadata.authors && Array.isArray(metadata.authors) && metadata.authors.length > 0 ? (
                            <div className="space-y-3 mt-3">
                              {metadata.authors.map((author: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-3">
                                  <div className="font-bold text-gray-800 mb-1">
                                    {idx === 0 ? "Penulis Pertama (Koresponden): " : `Penulis ${idx + 1}: `}
                                    {author.full_name}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                    <div><span className="font-semibold text-gray-600">Email:</span> {author.email || "-"}</div>
                                    <div><span className="font-semibold text-gray-600">Afiliasi:</span> {author.affiliation || "-"}</div>
                                    <div><span className="font-semibold text-gray-600">NIDN/ID Akademik:</span> {author.nidn || "-"}</div>
                                    <div><span className="font-semibold text-gray-600">ORCID:</span> {author.orcid || "-"}</div>
                                    <div><span className="font-semibold text-gray-600">Scholar ID:</span> {author.scholar_id || "-"}</div>
                                    <div><span className="font-semibold text-gray-600">SINTA ID:</span> {author.sinta_id || "-"}</div>
                                    <div><span className="font-semibold text-gray-600">SCOPUS ID:</span> {author.scopus_id || "-"}</div>
                                    <div><span className="font-semibold text-gray-600">WoS ID:</span> {author.wos_id || "-"}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">Data penulis detail tidak ditemukan.</div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
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

          {activeTab === 'ai assistant' && (
            <div className="space-y-8">
              {/* Top Warning Banner: Human Authority Governance */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <div className="text-xl text-amber-600">âš ï¸</div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Prinsip Tata Kelola AI (AI Governance Notice)</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    AI Reviewer Assistant bertindak strictly sebagai **alat bantu analisis awal (asisten)** bagi Editor. Keputusan akhir untuk menerima (Accept), merevisi (Needs Revision), atau menolak (Reject) naskah sepenuhnya berada di tangan Editor manusia. AI dilarang keras menggantikan peran penilai sejawat (*peer reviewer*) manusia.
                  </p>
                </div>
              </div>

              {/* Assessment Section */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h4 className="font-bold text-gray-800 text-xs tracking-wider uppercase">SKRINING NASKAH AWAL (AI SCREENING REPORT)</h4>
                  {aiAssessment && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Audit: {aiAssessment.model_name} â€¢ {aiAssessment.prompt_version}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {!aiAssessment ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="text-4xl">ðŸ¤–</div>
                      <h4 className="font-bold text-gray-800 text-sm">Analisis Akademis Awal belum dijalankan</h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        AI akan secara otomatis menganalisis kebaruan (novelty), metodologi, dan kejelasan (clarity) naskah ini tanpa membocorkan identitas penulis (double-blind compliant).
                      </p>
                      <button
                        onClick={async () => {
                          setAiLoading(true);
                          try {
                            const res = await fetch('/api/editor/ai-analyze', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ submissionId: submission.id })
                            });
                            const data = await res.json();
                            if (data.success) {
                              showToast('Analisis AI berhasil dijalankan!');
                              // Reload data
                              const db = createClient();
                              const [assessRes, recomRes] = await Promise.all([
                                db.from('ai_reviewer_assessments').select('*').eq('submission_id', submission.id).maybeSingle(),
                                db.from('ai_reviewer_recommendations').select('*, profiles:reviewer_profile_id(full_name, phone_number, email)').eq('submission_id', submission.id)
                              ]);
                              if (assessRes.data) setAiAssessment(assessRes.data);
                              if (recomRes.data) setAiRecommendations(recomRes.data);
                            } else {
                              showToast('Gagal menjalankan analisis AI: ' + data.error);
                            }
                          } catch (e: any) {
                            showToast('Gagal memanggil API AI: ' + e.message);
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                        disabled={aiLoading}
                        className="inline-flex items-center gap-2 bg-[#18182e] hover:bg-[#18182e]/90 text-white font-bold px-6 py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-sm disabled:opacity-50"
                      >
                        {aiLoading ? 'Sedang Menganalisis...' : 'Analisis UltimateAI'}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Star Ratings & Confidence */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                          <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Metrik Penilaian AI</h5>
                          
                          {/* Novelty */}
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-semibold text-gray-700">Kebaruan (Novelty)</span>
                              <span className="font-bold text-gray-900">{aiAssessment.novelty_rating}/5</span>
                            </div>
                            <div className="flex text-amber-500 gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="text-lg">{i < aiAssessment.novelty_rating ? 'â˜…' : 'â˜†'}</span>
                              ))}
                            </div>
                          </div>

                          {/* Methodology */}
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-semibold text-gray-700">Metodologi (Methodology)</span>
                              <span className="font-bold text-gray-900">{aiAssessment.methodology_rating}/5</span>
                            </div>
                            <div className="flex text-amber-500 gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="text-lg">{i < aiAssessment.methodology_rating ? 'â˜…' : 'â˜†'}</span>
                              ))}
                            </div>
                          </div>

                          {/* Clarity */}
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-semibold text-gray-700">Kejelasan (Clarity)</span>
                              <span className="font-bold text-gray-900">{aiAssessment.clarity_rating}/5</span>
                            </div>
                            <div className="flex text-amber-500 gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="text-lg">{i < aiAssessment.clarity_rating ? 'â˜…' : 'â˜†'}</span>
                              ))}
                            </div>
                          </div>

                          {/* Confidence Score */}
                          <div className="pt-2 border-t border-gray-200/60">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-semibold text-gray-700">Confidence Score AI</span>
                              <span className="font-bold text-green-700">{aiAssessment.confidence_score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-green-600 h-full rounded-full transition-all" style={{ width: `${aiAssessment.confidence_score}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Summary & Improvement Reports */}
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Evaluasi Ringkasan (Evaluation Summary)</span>
                          <div className="text-xs text-gray-800 bg-gray-50 p-4 border border-gray-200 rounded-lg leading-relaxed whitespace-pre-wrap">{aiAssessment.summary_evaluation}</div>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Saran Perbaikan (Suggested Improvements)</span>
                          <div className="text-xs text-gray-800 bg-gray-50 p-4 border border-gray-200 rounded-lg leading-relaxed whitespace-pre-wrap">{aiAssessment.suggested_improvements}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Section */}
              {aiAssessment && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h4 className="font-bold text-gray-800 text-xs tracking-wider uppercase">REKOMENDASI REVIEWER MANUSIA (AI REVIEWER MATCHING)</h4>
                  </div>

                  <div className="p-6">
                    {aiRecommendations.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg border-dashed">
                        Belum ada rekomendasi reviewer yang cocok dengan topik artikel ini.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {aiRecommendations.map((recom) => (
                          <div key={recom.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-800 text-sm">{recom.profiles?.full_name}</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                                  Kecocokan: {recom.match_score}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 leading-relaxed">
                                <span className="font-semibold text-gray-700">Alasan:</span> {recom.match_reason}
                              </div>
                              {recom.expertise_overlap && (
                                <div className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100 inline-block">
                                  Overlap Keahlian: {recom.expertise_overlap}
                                </div>
                              )}
                            </div>
                            
                            <div className="shrink-0 flex items-center gap-2">
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Tugaskan ${recom.profiles?.full_name} sebagai reviewer naskah ini?`)) {
                                    setToastMessage("Menugaskan reviewer...");
                                    const m = await import("@/app/actions/editor");
                                    const res = await m.assignReviewer(
                                      submission.id,
                                      recom.reviewer_profile_id,
                                      recom.profiles?.full_name,
                                      recom.profiles?.email
                                    );
                                    if (res.success) {
                                      showToast("Reviewer berhasil ditugaskan!");
                                      setTimeout(() => window.location.reload(), 1500);
                                    } else {
                                      showToast("Gagal menugaskan reviewer: " + res.error);
                                    }
                                  }
                                }}
                                className="text-xs bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors"
                              >
                                Tugaskan Reviewer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                            (rev.recommendation === 'minor_revision' || rev.recommendation === 'revisions_minor') ? 'bg-yellow-100 text-yellow-800' :
                            (rev.recommendation === 'major_revision' || rev.recommendation === 'revisions_major') ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {rev.recommendation === 'accept' ? 'âœ… Accept' :
                             (rev.recommendation === 'minor_revision' || rev.recommendation === 'revisions_minor') ? 'ðŸŸ¡ Revisi Minor' :
                             (rev.recommendation === 'major_revision' || rev.recommendation === 'revisions_major') ? 'ðŸŸ  Revisi Mayor' :
                             rev.recommendation === 'resubmit' ? 'ðŸ”„ Resubmit' :
                             rev.recommendation === 'reject' ? 'âŒ Decline' : rev.recommendation}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Completed</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Comments for Author */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">ðŸ’¬ Komentar untuk Penulis (Author)</span>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{rev.comments_for_author || 'Tidak ada komentar.'}</p>
                          </div>
                        </div>

                        {/* Correction Notes */}
                        {(rev.correction_notes) && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">âœï¸ Correction Notes / Catatan Koreksi</span>
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
                              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">ðŸ”’ Catatan Rahasia untuk Editor (Confidential)</span>
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
                            <div className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">ðŸ“Ž File Hasil Pemeriksaan (dari Reviewer)</div>
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex-1">
                                <p className="text-xs text-blue-700 font-semibold">File telah diunggah oleh Reviewer</p>
                                <p className="text-xs text-gray-500 mt-1">â¬† Download, periksa, lalu upload ulang di tab <strong>Copyediting</strong> untuk diteruskan ke Layout Editor.</p>
                              </div>
                              <a
                                href={rev.annotated_file_url || rev.review_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center gap-2 text-xs bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-lg transition-colors"
                              >
                                â†“ Download
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Manual Upload for Editor */}
                        {isPureEditor && (
                          <div className="pt-3 border-t border-gray-100 mt-4">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Upload Manual File Reviewer (Opsional)</label>
                            <p className="text-[10px] text-gray-500 mb-2">Jika Reviewer lupa upload atau mengirim via WA, Editor bisa uploadkan untuk mereka di sini.</p>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={async (e) => {
                                if(!e.target.files || !e.target.files[0]) return;
                                setUploadingReviewId(rev.id);
                                const formData = new FormData();
                                formData.append('file', e.target.files[0]);
                                formData.append('submissionId', submission.id);
                                try {
                                  // 1. Upload to storage using the new safe endpoint
                                  const res = await fetch('/api/upload-review-file', { method: 'POST', body: formData });
                                  const data = await res.json();
                                  if(data.success) {
                                    // 2. Update review_assignments table
                                    const { createClient } = await import('@supabase/supabase-js');
                                    const supabaseAdmin = createClient(
                                      process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                                    );
                                    await supabaseAdmin.from('review_assignments').update({ review_file_url: data.url }).eq('id', rev.id);
                                    
                                    // 3. Update local state
                                    setReviews(reviews.map(r => r.id === rev.id ? { ...r, review_file_url: data.url } : r));
                                    showToast('Berhasil upload manual file reviewer!');
                                  } else {
                                    showToast('Gagal upload: ' + data.error);
                                  }
                                } catch(err) {
                                  showToast('Error uploading review file');
                                } finally {
                                  setUploadingReviewId(null);
                                }
                              }}
                              disabled={uploadingReviewId === rev.id}
                              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                            />
                            {uploadingReviewId === rev.id && <span className="text-[10px] text-blue-600 font-bold animate-pulse">Mengunggah...</span>}
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
                                      <div className="text-xs text-gray-500">Keahlian: {rev.expertise || 'Umum'} â€¢ Kontak: {rev.phone_number || '-'}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={async () => {
                                        if (window.confirm("Tugaskan reviewer ini dan kirim pesan otomatis via WhatsApp?")) {
                                            setToastMessage("Menugaskan reviewer & mengirim pesan...");
                                            const m = await import("@/app/actions/editor");
                                            
                                            // 1. Assign to database first
                                            const assignRes = await m.assignReviewer(submission.id, rev.id || rev.email, rev.full_name || rev.name, rev.email);
                                            
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
                                      ðŸ’¬ Assign & Invite
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        if (window.confirm(`Tugaskan ${rev.full_name} sebagai reviewer?`)) {
                                          setToastMessage("Menugaskan reviewer...");
                                          const m = await import("@/app/actions/editor");
                                          const res = await m.assignReviewer(submission.id, rev.id || rev.email, rev.full_name || rev.name, rev.email);
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
              {!isCoAdmin && (
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

                {/* Right Column: Revision Management */}
                {reviews.some(r => ['major_revision', 'revisions_major', 'minor_revision', 'revisions_minor'].includes(r.recommendation)) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Manajemen Revisi</h3>
                    <div className="bg-orange-50 p-5 border border-orange-200 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <h4 className="font-bold text-orange-900">Menunggu Revisi Penulis</h4>
                      </div>
                      <p className="text-sm text-orange-800 mb-4 leading-relaxed">
                        Reviewer meminta perbaikan pada naskah ini. Silakan hubungi Penulis untuk mengirimkan file revisi, lalu unggah file tersebut di bawah ini jika sudah diterima.
                      </p>
                      
                      <div className="flex flex-col gap-3 mb-6">
                        <a 
                          href={`https://wa.me/${authorPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Dear ${submission?.author?.full_name || 'Author'},\n\nNaskah Anda ("${submission?.title}") membutuhkan revisi berdasarkan masukan Reviewer. Mohon segera perbaiki naskah Anda dan kirimkan kembali file revisinya kepada kami.\n\nTerima kasih,\nTim Editor APASIFIC IAEP`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          Minta Revisi via WhatsApp
                        </a>
                      </div>

                      {/* Revised Manuscript Block (Moved here) */}
                      <div className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm">
                         {submission?.revised_file_url ? (
                           <div className="flex flex-col items-center justify-center p-4 text-center">
                              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <h4 className="font-bold text-gray-900 mb-1">File Revisi Telah Diterima!</h4>
                              <p className="text-xs text-gray-500 mb-4">Penulis telah berhasil mengunggah naskah hasil perbaikan.</p>
                              <a 
                                href={submission.revised_file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full bg-green-600 text-white hover:bg-green-700 font-bold py-2 px-4 rounded shadow-sm inline-flex justify-center items-center gap-2 mb-2"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Download Naskah Revisi
                              </a>
                              <button
                                onClick={handleForwardToReviewersFonnte}
                                disabled={isSendingFonnte}
                                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebd5a] disabled:opacity-50 text-white font-bold py-2 px-4 rounded shadow-sm transition-colors"
                              >
                                {isSendingFonnte ? (
                                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                )}
                                {isSendingFonnte ? "Mengirim..." : "Teruskan ke Reviewer (Fonnte)"}
                              </button>
                           </div>
                         ) : (
                           <div>
                             <div className="flex flex-col items-center justify-center p-4 text-center bg-gray-50 rounded-lg border border-gray-100 mb-3">
                                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2">
                                  <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h4 className="font-bold text-gray-700 text-sm">Menunggu Author...</h4>
                                <p className="text-[10px] text-gray-500">Sistem sedang menunggu Author untuk mengunggah file revisi dari dashboard mereka.</p>
                             </div>
                             
                             <details className="group">
                               <summary className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer list-none flex items-center justify-center gap-1">
                                 <span>Upload Manual (Opsional)</span>
                                 <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                               </summary>
                               <div className="pt-3 mt-3 border-t border-gray-100">
                                 <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                                   Gunakan fitur ini <b>hanya</b> jika Author kesulitan mengakses sistem dan mengirimkan file revisi secara langsung kepada Editor (misal via WhatsApp).
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
                                     disabled={isUploadingRevised || !isPureEditor}
                                     className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-800 hover:file:bg-orange-200 disabled:opacity-50 cursor-pointer border border-gray-200 rounded focus:outline-none" 
                                   />
                                   {isUploadingRevised && (
                                     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center">
                                        <div className="flex items-center gap-2 text-orange-600 font-bold text-xs">
                                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                          Mengunggah...
                                        </div>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             </details>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}
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
                          {membersArray.filter(m => m.jabatan && m.jabatan.toLowerCase().includes('admin') || m.jabatan && m.jabatan.toLowerCase().includes('copy') || m.jabatan && m.jabatan.toLowerCase().includes('layout') || m.jabatan && m.jabatan.toLowerCase().includes('cover') || m.jabatan && m.jabatan.toLowerCase().includes('publish')).length > 0 ? (
                            membersArray.filter(m => m.jabatan && m.jabatan.toLowerCase().includes('admin') || m.jabatan && m.jabatan.toLowerCase().includes('copy') || m.jabatan && m.jabatan.toLowerCase().includes('layout') || m.jabatan && m.jabatan.toLowerCase().includes('cover') || m.jabatan && m.jabatan.toLowerCase().includes('publish')).map((member, idx) => (
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

                        {/* File Naskah Hasil Review (Anonim) */}
                        <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide">File Naskah Hasil Review (Anonim)</h5>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                File revisi atau hasil dari reviewer yang disetujui Editor.
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-right">
                            {(submission?.revised_file_url || reviews.filter(r => r.status === 'completed' && (r.annotated_file_url || r.review_file_url)).length > 0 || submission?.file_url) ? (
                              <div className="flex flex-col items-end gap-2">
                                <a
                                  href={submission?.revised_file_url || reviews.find(r => r.status === 'completed' && (r.annotated_file_url || r.review_file_url))?.annotated_file_url || reviews.find(r => r.status === 'completed' && (r.annotated_file_url || r.review_file_url))?.review_file_url || submission?.anonymous_file_url || submission?.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold transition-all shadow-sm flex items-center gap-1.5"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                  Download File Anonim
                                </a>
                              </div>
                            ) : (
                              <span className="text-xs bg-gray-400 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-1.5 cursor-not-allowed">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Belum Ada Revisi
                              </span>
                            )}
                          </div>
                        </div>

                        {/* File Naskah Asli (Beridentitas) */}
                        <div className="bg-orange-50/40 border border-orange-100/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide">File Naskah Asli (Beridentitas)</h5>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                File awal dari author (memuat nama & afiliasi asli).
                              </p>
                            </div>
                          </div>
                          {submission?.original_file_metadata?.status === 'AVAILABLE' || submission?.file_metadata?.status === 'AVAILABLE' ? (
                            <div className="flex flex-col items-end gap-2">
                              {submission.file_metadata.legacyFallbackUsed && !submission.original_file_url && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" title="Diselesaikan melalui pencarian Legacy">
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                  Legacy Storage
                                </span>
                              )}
                              <a
                                href={submission?.original_file_url || submission?.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-bold transition-all shadow-sm flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download Asli {submission?.original_file_metadata?.filename ? `(${submission.original_file_metadata.filename})` : (submission?.file_metadata?.filename ? `(${submission.file_metadata.filename})` : '')}
                              </a>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end gap-1 text-right">
                              <span className="text-xs bg-gray-400 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-1.5 cursor-not-allowed">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {submission?.file_metadata?.status === 'METADATA_MISSING' ? 'Metadata Kosong' : 
                                 submission?.file_metadata?.status === 'FILE_MISSING' ? 'File Hilang di Storage' : 
                                 submission?.file_metadata?.status === 'URL_GENERATION_FAILED' ? 'Gagal Membuat Link' : 'File Tidak Tersedia'}
                              </span>
                            </div>
                          )}
                        </div>

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
                                  <div className="mb-3 text-sm text-gray-700 bg-gray-50/80 p-3 rounded-lg border border-gray-100 leading-relaxed">
                                    <span className="font-bold text-gray-900 block mb-1">Catatan Revisi:</span>
                                    {rev.correction_notes || rev.comments_for_author ? (
                                      <span className="whitespace-pre-wrap">{rev.correction_notes || rev.comments_for_author}</span>
                                    ) : (
                                      <span className="text-gray-400 italic">Tidak ada catatan tertulis dari reviewer.</span>
                                    )}
                                  </div>
                                  <div className={`flex items-center justify-between border rounded-lg p-3 mt-2 ${(rev.annotated_file_url || rev.review_file_url) ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center gap-3">
                                      <div className={`p-1.5 rounded-md shadow-sm border ${(rev.annotated_file_url || rev.review_file_url) ? 'bg-white border-blue-100 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                      </div>
                                      <div>
                                        <div className={`text-xs font-bold ${(rev.annotated_file_url || rev.review_file_url) ? 'text-blue-900' : 'text-gray-600'}`}>File Upload dari Reviewer</div>
                                        <div className={`text-[10px] mt-0.5 ${(rev.annotated_file_url || rev.review_file_url) ? 'text-blue-600' : 'text-gray-400'}`}>
                                          {(rev.annotated_file_url || rev.review_file_url) ? 'Berisi coretan/anotasi pada naskah' : 'Reviewer tidak mengunggah file'}
                                        </div>
                                      </div>
                                    </div>
                                    {(rev.annotated_file_url || rev.review_file_url) ? (
                                      <a
                                        href={rev.annotated_file_url || rev.review_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-bold transition-colors shadow-sm"
                                      >
                                        Download
                                      </a>
                                    ) : (
                                      <span className="text-xs bg-gray-200 text-gray-500 px-4 py-1.5 rounded-md font-bold shadow-sm cursor-not-allowed">
                                        Kosong
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
                              <p className="text-xs text-gray-500 font-medium">Tidak ada catatan review yang tersedia untuk naskah ini.</p>
                            </div>
                          )}
                        </div>

                        {/* Revised Manuscript Block Moved to Review Tab */}
                        
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
                                Papan Kerja Cover Editor
                             </h4>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                {/* Kiri: Form & Info */}
                                <div>
                                  <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
                                    <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Informasi Naskah (Bahan Desain)</h5>
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Judul Artikel</p>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                                          <div>
                                            <span className="inline-block bg-[#18182e] text-[#f0c05a] text-xs font-bold px-2.5 py-1 rounded border border-[#c9a84c]/40 uppercase tracking-wider font-mono">
                                              AJAF - ACCOUNTING, AUDITING & TAXATION
                                            </span>
                                          </div>
                                          <p className="text-sm font-bold text-gray-900 leading-snug">{submission.title || 'Judul tidak tersedia'}</p>
                                        </div>
                                      </div>
                                      {submission.file_url_galley && (
                                        <div className="pt-2">
                                          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Naskah Akhir (Galley)</p>
                                          <a href={submission.file_url_galley} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Unduh File Galley (.DOCX / .PDF)
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                 <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Unggah Kover Jurnal (Manual)</h5>
                                 {submission?.cover_file_url ? (
                                   <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                     <svg className="w-12 h-12 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                     <h5 className="font-bold text-green-900 text-lg mb-1">Kover Saat Ini Sudah Tersimpan</h5>
                                     <p className="text-sm text-green-700 mb-6">Naskah ini sudah memiliki file kover yang dilampirkan.</p>
                                     <div className="flex gap-4">
                                       <button type="button" onClick={async () => {
                                         if(!confirm('Yakin ingin menghapus kover ini secara permanen?')) return;
                                         showToast('Menghapus kover...');
                                         const res = await removeCoverFile(submission.id);
                                         if (res.success) {
                                           setSubmission({...submission, cover_file_url: null});
                                           showToast('Kover berhasil dihapus!');
                                         } else {
                                           showToast('Gagal menghapus kover: ' + res.error);
                                         }
                                       }} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-6 rounded-lg border border-red-200 transition-all text-sm flex items-center gap-2">
                                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                         Hapus Kover
                                       </button>
                                     </div>
                                   </div>
                                 ) : (
                                   <label className="border-2 border-dashed border-[#c9a84c]/50 bg-yellow-50/30 hover:bg-yellow-50/50 p-8 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group">
                                      <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                      </div>
                                      <span className="text-gray-800 font-bold mb-1">Pilih File Gambar Kover (.PNG / .JPG)</span>
                                      <span className="text-sm text-gray-500 mb-4 text-center max-w-sm">Unggah file kover yang sudah didesain secara manual di luar sistem. Sistem lama telah ditiadakan sesuai instruksi.</span>
                                      
                                      <input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={async (e) => {
                                          if (!e.target.files || e.target.files.length === 0) return;
                                          const file = e.target.files[0];
                                          try {
                                            showToast('Sedang mengunggah kover...');
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('submissionId', submission.id);
                                            
                                            const res = await fetch('/api/upload-cover', {
                                              method: 'POST',
                                              body: formData
                                            });
                                            if (!res.ok) throw new Error('Upload failed');
                                            const data = await res.json();
                                            if(data.success) {
                                              setSubmission({...submission, cover_file_url: data.url});
                                              showToast('Kover berhasil diunggah!');
                                            } else {
                                              showToast('Gagal upload: ' + data.error);
                                            }
                                          } catch(err: any) {
                                            showToast('Error uploading file');
                                          }
                                        }}
                                        className="hidden" 
                                      />
                                   </label>
                                 )}
                               </div>

                               {/* Kanan: Preview Image */}
                               <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-hidden min-h-[400px]">
                                  {submission?.cover_file_url ? (
                                    <div className="relative w-full h-full flex flex-col items-center justify-start">
                                      <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 w-full text-center">Pratinjau Kover Saat Ini</h5>
                                      <div className="relative inline-block mx-auto overflow-hidden max-w-sm w-full">
                                        <DynamicCover 
                                          title={submission.title || ""}
                                          journalCode={submission.journals?.name || ""}
                                          doi={submission.doi || ""}
                                          coverUrl={submission.cover_file_url || null}
                                          variant="preview"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                      <p className="text-gray-400 font-bold">Belum Ada Kover</p>
                                      <p className="text-xs text-gray-400 mt-2">Pratinjau gambar akan muncul di sini setelah Anda mengunggah file kover di kotak sebelah kiri.</p>
                                    </div>
                                  )}
                               </div>
                             </div>
                             
                             {submission?.cover_file_url && (
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
                      {submission?.status === 'Published' ? 'âœ“ Diterbitkan (Published)' : 'â— Siap Terbit (Production Completed)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Cover Display */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 w-full">Sampul Depan (Cover)</h4>
                      {submission?.cover_file_url ? (
                          <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-w-sm w-full relative mx-auto">
                            <DynamicCover 
                              title={submission.title || ""}
                              journalCode={submission.journals?.name || ""}
                              doi={submission.doi || generatedDoi || ""}
                              volume={customVolume || ""}
                              issue={customIssue || ""}
                              createdAt={new Date().toISOString()}
                              coverUrl={submission.cover_file_url || null}
                              variant="preview"
                            />
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


                      {(submission?.status === 'Production Completed' || submission?.status === 'Published') ? (
                        <div className="space-y-4 pt-4">
                          {submission?.status === 'Published' ? (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
                              âœ“ Naskah telah dipublikasikan. Anda dapat memperbarui data Volume & Edisi di bawah ini jika terdapat kesalahan, lalu klik tombol Perbarui.
                            </div>
                          ) : (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium">
                              âš ï¸ Seluruh proses produksi (Layout, Cover, & API) telah disahkan oleh Supervisor. Anda sekarang dapat merilis naskah ini.
                            </div>
                          )}
                          
                          <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Volume</label>
                              <input 
                                type="text" 
                                value={customVolume} 
                                onChange={(e) => setCustomVolume(e.target.value)}
                                className="w-full p-3 border border-zinc-800 bg-[#0c0c16] text-[#e8e8f0] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium" 
                                placeholder="e.g. Vol. 1" 
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Edisi</label>
                              <input 
                                type="text" 
                                value={customIssue} 
                                onChange={(e) => setCustomIssue(e.target.value)}
                                className="w-full p-3 border border-zinc-800 bg-[#0c0c16] text-[#e8e8f0] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium" 
                                placeholder="e.g. No. 2" 
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-[-10px] leading-relaxed">
                            *Jika dikosongkan, sistem akan mengurutkan Volume/Edisi secara otomatis. (Untuk Edisi 2, ketik: <b>No. 2</b>)<br/>
                            <span className="text-emerald-500 font-medium">Aturan Jurnal: Mulai dari Vol 1 No 1 untuk setiap disiplin ilmu. Volume mengacu pada tahun terbit (2 Volume per tahun jika terbit 2 kali). Edisi tidak dibatasi.</span>
                          </p>

                          <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama-Nama Penulis (Teks Berjalan)</label>
                            <input 
                              type="text" 
                              value={customAuthor} 
                              onChange={(e) => setCustomAuthor(e.target.value)}
                              className="w-full p-3 border border-zinc-800 bg-[#0c0c16] text-[#e8e8f0] focus:border-[#c9a84c] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium" 
                              placeholder="Pisahkan dengan koma, misal: Nur Alim Natsir, Jamilah, Muhammad Rijal" 
                            />
                            <p className="text-[10px] text-zinc-400 mt-1">
                              *Nama-nama ini akan langsung di-marquee di halaman publish artikel. Pisahkan masing-masing nama dengan koma.
                            </p>
                          </div>

                          <button
                            onClick={async () => {
                              const isRepublish = submission.status === 'Published';
                              const confirmMsg = isRepublish 
                                ? "Apakah Anda yakin ingin memperbarui metadata Volume dan Edisi untuk naskah yang sudah terbit ini?" 
                                : "Apakah Anda yakin ingin menerbitkan naskah ini? Status naskah akan berubah menjadi Published dan Sertifikat Publikasi penulis akan diterbitkan secara otomatis.";
                              
                              const confirmPublish = confirm(confirmMsg);
                              if (!confirmPublish) return;
                              const m = await import("@/app/actions/editor");
                              const res = await m.publishArticle(submission.id, submission.journal_id || "", customVolume, customIssue, customAuthor);
                              if (res.success) {
                                showToast(isRepublish ? "Metadata Publikasi Berhasil Diperbarui!" : "Naskah resmi diterbitkan!");
                                setTimeout(() => window.location.reload(), 1000);
                              } else {
                                showToast("Gagal menerbitkan naskah.");
                              }
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-colors text-base flex justify-center items-center gap-2 border border-emerald-500/30"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {submission?.status === 'Published' ? 'Perbarui Metadata Terbitan' : 'Mempublikasikan Naskah (Publish)'}
                          </button>

                          {submission?.status === 'Published' && (
                            <Link
                              href="/dashboard/certificates"
                              target="_blank"
                              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-4 px-6 rounded-xl transition-colors text-base flex justify-center items-center gap-2 border border-zinc-700 text-center mt-2"
                              style={{ textDecoration: 'none' }}
                            >
                              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              Lihat Sertifikat Terbit
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 pt-4">
                          <div className="p-4 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg text-xs font-medium">
                            Naskah belum mencapai tahap produksi akhir.
                          </div>
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
                        {membersArray.filter(m => m.jabatan && m.jabatan.toLowerCase().includes('layout') || m.jabatan && m.jabatan.toLowerCase().includes('cover') || m.jabatan && m.jabatan.toLowerCase().includes('publish')).length > 0 ? (
                          membersArray.filter(m => m.jabatan && m.jabatan.toLowerCase().includes('layout') || m.jabatan && m.jabatan.toLowerCase().includes('cover') || m.jabatan && m.jabatan.toLowerCase().includes('publish')).map((member, idx) => (
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
                        <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-xs mx-auto md:mx-0 relative">
                            <DynamicCover 
                              title={submission.title || ""}
                              journalCode={submission.journals?.name || ""}
                              doi={submission.doi || generatedDoi || ""}
                              volume={customVolume || ""}
                              issue={customIssue || ""}
                              createdAt={new Date().toISOString()}
                              coverUrl={submission.cover_file_url || null}
                              variant="preview"
                            />
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

                      {/* Volume & Issue Inputs */}
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-3">
                         <h5 className="font-bold text-blue-900 text-sm">Penentuan Volume & Edisi Publikasi</h5>
                         <div className="flex gap-4">
                           <div className="flex-1">
                             <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Volume</label>
                             <input 
                               type="text" 
                               value={customVolume} 
                               onChange={(e) => setCustomVolume(e.target.value)}
                               className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                               placeholder="e.g. Vol. 1" 
                             />
                           </div>
                           <div className="flex-1">
                             <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Edisi / Issue</label>
                             <input 
                               type="text" 
                               value={customIssue} 
                               onChange={(e) => setCustomIssue(e.target.value)}
                               className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                               placeholder="e.g. No. 2" 
                             />
                           </div>
                         </div>
                         <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                            *Jika dikosongkan, sistem akan mengurutkan otomatis. Ketik manual (contoh: <b>No. 2</b>) untuk memaksa ke edisi tertentu. (Perubahan akan otomatis terlihat di pratinjau Cover di atas).<br/>
                            <span className="text-blue-700 font-medium">Aturan Jurnal: Mulai dari Vol 1 No 1 untuk setiap disiplin ilmu. Volume mengacu pada tahun terbit (2 Volume per tahun jika terbit 2 kali). Edisi tidak dibatasi.</span>
                          </p>
                      </div>

                      {/* Manual DOI Input */}
                      {!generatedDoi && (
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-700">Input DOI Manual (dari Zenodo)</label>
                          <p className="text-xs text-gray-500">Jika sudah mempunyai DOI dari Zenodo, masukkan di sini (contoh: <b>10.5281/zenodo.12345678</b>)</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Contoh: 10.5281/zenodo.12345678"
                              value={manualDoi}
                              onChange={(e) => setManualDoi(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                            />
                            <button
                              onClick={handleSaveManualDoi}
                              disabled={isSavingManualDoi}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-bold transition-colors shadow-sm shrink-0"
                            >
                              {isSavingManualDoi ? 'Menyimpan...' : 'Simpan DOI'}
                            </button>
                          </div>
                        </div>
                      )}

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

                        <button
                          onClick={handleRefreshIndexStatus}
                          disabled={!generatedDoi || isRefreshingIndex}
                          className={`font-bold py-3 px-4 rounded transition-colors flex justify-center items-center gap-2 ${
                            generatedDoi && !isRefreshingIndex
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          {isRefreshingIndex ? 'Memeriksa indeks...' : 'Perbarui Status Indexing (Zenodo + OpenAIRE)'}
                        </button>
                      </div>

                      {generatedDoi && (
                        <div className="mt-4 p-4 bg-[#0c0c16] border border-zinc-800 rounded-lg text-[#e8e8f0] text-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-semibold">
                          <div className="text-emerald-400">
                            âœ… Persistent Identifier (DOI): {generatedDoi}
                          </div>
                          <button
                            onClick={async () => {
                              const confirmReset = confirm("Apakah Anda yakin ingin menghapus/mereset DOI ini? Anda akan bisa membuat ulang/menghubungkan kembali naskah ini ke Zenodo menggunakan akun baru.");
                              if (!confirmReset) return;
                              
                              const m = await import("@/app/actions/editor");
                              const res = await m.resetDoi(submission.id);
                              if (res.success) {
                                showToast("DOI berhasil direset! Silakan generate ulang.");
                                setGeneratedDoi('');
                                setTimeout(() => window.location.reload(), 1000);
                              } else {
                                showToast("Gagal mereset DOI: " + res.error);
                              }
                            }}
                            className="text-xs bg-red-950 text-red-400 border border-red-900/50 hover:bg-red-900/30 hover:text-red-300 font-bold px-3 py-1.5 rounded transition-all shrink-0"
                          >
                            Hapus & Reset DOI
                          </button>
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
                          {membersArray.filter(m => m.jabatan && m.jabatan.toLowerCase().includes('admin')).length > 0 ? (
                            membersArray.filter(m => m.jabatan && m.jabatan.toLowerCase().includes('admin')).map((member, idx) => (
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
                      placeholder="Belum ada no HP â€” isi manual dengan kode negara, contoh: +62812xxxx"
                      className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  {!authorPhone && (
                    <p className="text-xs text-red-500 font-medium">âš ï¸ No HP Author tidak ditemukan di database. Isi manual sebelum kirim WA.</p>
                  )}
                  {authorPhone && (
                    <p className="text-xs text-green-600 font-medium">âœ“ No HP Author terdeteksi: {authorPhone}</p>
                  )}
                  <p className="text-xs text-gray-500">Sertakan kode negara untuk integrasi WhatsApp (contoh: +62812xxxx).</p>
                </div>
              </div>
            </div>

            {/* Enterprise Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-row-reverse gap-3 bg-gray-50">
              <button disabled={!decision} onClick={() => handleRecordDecision()} className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent">
                Simpan Keputusan & Beri Tahu Penulis
              </button>
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
                    placeholder="ðŸ” Cari berdasarkan nama, institusi, atau negara..." 
                    value={reviewerSearch}
                    onChange={(e) => { setReviewerSearch(e.target.value); setReviewerPage(1); }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-800"
                />
            </div>

<div className="p-6 overflow-y-auto">
              {/* Manual reviewer selection */}
              <h4 className="text-sm font-bold text-gray-800 mb-3">Semua Reviewer (Manual Selection)</h4>

{/* AI-Assisted Review Enhancement (advisory) â€” enhances a COMPLETED HUMAN review */}
              {!reviewerSearch && reviews.some((r: any) => r.status === 'completed') && (
                <div className="mb-6 border border-cyan-200 bg-cyan-50/60 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <h4 className="text-sm font-bold text-cyan-800">ðŸ§  AI Quality Observation</h4>
                    <span className="text-[10px] text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full font-semibold">Advisory â€” tidak mengubah rekomendasi manusia</span>
                  </div>
                  <p className="text-[11px] text-cyan-700 mb-3">
                    AI hanya menganalisis laporan review <b>manusia yang sudah selesai (completed)</b> untuk
                    memberikan observasi kualitas tambahan. AI tidak pernah menugaskan reviewer, tidak
                    mengubah status naskah, dan tidak membuat keputusan editorial.
                  </p>

                  <div className="space-y-3">
                    {reviews.filter((r: any) => r.status === 'completed').map((rev: any) => {
                      const enh = enhancementsMap[rev.id];
                      const loading = enhancementsLoading[rev.id];
                      const error = enhancementsError[rev.id];
                      return (
                        <div key={rev.id} className="bg-white border border-cyan-100 rounded-lg p-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="text-sm text-gray-800">
                              <span className="font-bold">{rev.reviewer?.full_name || 'Reviewer'}</span>
                              <span className="text-xs text-gray-400 ml-2">
                                {enh ? `Observation ${enh.enhancementVersion || ''}` : 'Belum ada observation AI'}
                              </span>
                            </div>
                            {enh && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white bg-emerald-600 rounded-full px-2.5 py-0.5">Kualitas {enh.qualityScore ?? '-'}</span>
                                <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 rounded px-2 py-0.5 uppercase">{String(enh.severityLevel || '').replace('_', ' ')}</span>
                              </div>
                            )}
                          </div>

                          {enh?.enhancedReviewContent && (
                            <details className="mt-2">
                              <summary className="text-[11px] text-cyan-700 cursor-pointer select-none">Lihat observasi AI lengkap</summary>
                              <pre className="mt-1 text-[11px] text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-2 max-h-56 overflow-y-auto">{enh.enhancedReviewContent}</pre>
                            </details>
                          )}

                          {error && <p className="text-[11px] text-red-600 mt-2">{error}</p>}

                          <button
                            onClick={() => handleRunEnhancement(rev.id)}
                            disabled={loading}
                            className={`mt-2 w-full py-2 rounded font-bold text-sm transition-colors ${
                              loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                            }`}
                          >
                            {loading ? 'Menghasilkan Observation...' : enh ? 'Jalankan Ulang Observation' : 'Hasilkan Quality Observation AI'}
                          </button>
                        </div>
                      );
                    })}
</div>
                </div>
              )}

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
                              <div className="text-sm text-gray-500">{rev.university || rev.institution || 'Unknown University'} â€¢ {rev.country || 'Unknown Country'}</div>
                              <div className="text-xs text-blue-600 font-semibold mt-1">{rev.email}</div>
                            </div>
                            <button 
                              onClick={async () => {
                                setToastMessage("Menugaskan reviewer...");
                                const m = await import("@/app/actions/editor");
                                const res = await m.assignReviewer(submissionId, rev.id || rev.email, rev.full_name || rev.name, rev.email);
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


