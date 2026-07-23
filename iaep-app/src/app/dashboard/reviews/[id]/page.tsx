"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAssignmentDetails, submitReviewResultsWithFile } from "@/app/actions/reviewer";

export default function ReviewEvaluation({ params }: { params: any }) {
  const [assignmentId, setAssignmentId] = useState<string>('');
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [commentsForEditor, setCommentsForEditor] = useState("");
  const [commentsForAuthor, setCommentsForAuthor] = useState("");
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [annotatedFile, setAnnotatedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = ["Request", "Guidelines", "Review", "Submit"];

  const [submission, setSubmission] = useState<any>({
    id: "",
    title: "Loading...",
    abstract: "Loading...",
    type: "Articles",
    journal: "Loading...",
    dueDate: "Loading...",
    round: 1,
    file_url: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(params).then((p: any) => {
      if (p && p.id) setAssignmentId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (!assignmentId) return;
    async function fetchData() {
        setIsLoading(true);
        try {
          const data = await getAssignmentDetails(assignmentId);
          if (data) {
              setSubmission(data);
          }
        } catch(e) {
          console.error("fetchData error:", e);
        }
        setIsLoading(false);
    }
    fetchData();
  }, [assignmentId]);

  const recommendations = [
    { value: "accept", label: "Accept Submission", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
    { value: "revisions_minor", label: "Minor Revisions Required", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
    { value: "revisions_major", label: "Major Revisions Required", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
    { value: "resubmit", label: "Resubmit for Review", color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
    { value: "decline", label: "Decline Submission", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  ];

  if (submitted) {
    return (
      <div className="rev-enterprise">
        <div className="rev-success-wrap">
          <div className="rev-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="rev-success-title">Review Submitted!</h2>
          <p className="rev-success-desc">
            Your review for manuscript #{submission.id} has been submitted to the editorial team. Your honorarium will be processed within 7 working days.
          </p>
          <div className="rev-success-detail">
            <div className="rev-sd-row">
              <span>Manuscript</span>
              <strong>{(submission?.title || '').slice(0, 50)}...</strong>
            </div>
            <div className="rev-sd-row">
              <span>Recommendation</span>
              <strong style={{ color: "#34d399" }}>{recommendations.find(r => r.value === recommendation)?.label}</strong>
            </div>
          </div>
          <Link href="/dashboard/reviews/pending" className="rev-back-btn">
            ← Back to Pending Reviews
          </Link>
        </div>
        <style>{`
          .rev-enterprise { max-width: 700px; margin: 0 auto; padding-bottom: 60px; }
          .rev-success-wrap {
            display: flex; flex-direction: column; align-items: center;
            text-align: center; padding: 60px 40px;
            background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
            border-radius: 20px; margin-top: 40px;
          }
          .rev-success-icon {
            width: 72px; height: 72px; border-radius: 50%;
            background: rgba(52,211,153,0.1); border: 2px solid rgba(52,211,153,0.3);
            display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
            animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          @keyframes pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .rev-success-icon svg { width: 32px; height: 32px; color: #34d399; }
          .rev-success-title { font-size: 26px; font-weight: 700; color: #f0f0f8; margin: 0 0 12px; }
          .rev-success-desc { font-size: 14px; color: rgba(255,255,255,0.4); max-width: 440px; line-height: 1.7; margin-bottom: 28px; }
          .rev-success-detail { width: 100%; max-width: 420px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; margin-bottom: 28px; }
          .rev-sd-row { display: flex; justify-content: space-between; gap: 16px; padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
          .rev-sd-row:last-child { border-bottom: none; }
          .rev-sd-row span { color: rgba(255,255,255,0.3); flex-shrink: 0; }
          .rev-sd-row strong { color: rgba(255,255,255,0.75); text-align: right; }
          :global(.rev-back-btn) { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); border-radius: 10px; text-decoration: none; font-size: 13px; transition: all 0.18s; }
          :global(.rev-back-btn:hover) { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rev-enterprise">
      {/* Breadcrumb */}
      <div className="rev-breadcrumb">
        <Link href="/dashboard/reviews/pending" className="rev-bc-link">Pending Reviews</Link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        <span>Review Evaluation</span>
      </div>

      {/* Page Header */}
      <div className="rev-header">
        <div>
          <h1 className="rev-page-title">Tinjau Naskah</h1>
          <p className="rev-page-sub">Naskah #{submission.id} · {submission.journal} · Putaran {submission.round}</p>
        </div>
        <div className="rev-deadline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          Batas Waktu: {submission.dueDate || 'Tidak ditentukan'}
        </div>
      </div>

      {/* Stepper */}
      <div className="rev-stepper">
        {steps.map((s, i) => (
          <div key={s} className="rev-step-item">
            <div className={`rev-step-circle ${step > i + 1 ? "done" : step === i + 1 ? "active" : ""}`}>
              {step > i + 1
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                : <span>{i + 1}</span>}
            </div>
            <span className={`rev-step-label ${step >= i + 1 ? "active" : ""}`}>{s}</span>
            {i < steps.length - 1 && <div className={`rev-step-line ${step > i + 1 ? "done" : ""}`} />}
          </div>
        ))}
      </div>

      {/* Panel */}
      <div className="rev-panel">

        {/* Step 1: Request */}
        {step === 1 && (
          <div className="rev-step-body">
            <div className="rev-step-heading">
              <div className="rev-step-num">Step 1</div>
              <h2 className="rev-step-title">Request for Review</h2>
            </div>

            <div className="rev-info-box info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span>You have been selected as a potential reviewer for the following submission. Please review the abstract below before accepting.</span>
            </div>

            <div className="rev-ms-card">
              <div className="rev-ms-field">
                <div className="rev-ms-label">Manuscript Title</div>
                <div className="rev-ms-value title">{submission.title}</div>
              </div>
              <div className="rev-ms-field">
                <div className="rev-ms-label">Abstract</div>
                <div className="rev-ms-value" style={{ lineHeight: '1.7' }}>
                   {(() => {
                      let abs = submission.abstract;
                      if (typeof abs === 'string' && abs.startsWith('{')) {
                         try {
                             const parsed = JSON.parse(abs);
                             return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '8px' }}>
                                   {parsed.abstract && (
                                     <div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#c9a84c', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Abstract (Bahasa Indonesia)</div>
                                        <div style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'justify' }}>{parsed.abstract}</div>
                                     </div>
                                   )}
                                   {parsed.abstract_en && (
                                     <div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#c9a84c', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Abstract (English)</div>
                                        <div style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'justify' }}>{parsed.abstract_en}</div>
                                     </div>
                                   )}
                                   {parsed.keywords && (
                                     <div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#c9a84c', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Keywords</div>
                                        <div style={{ color: '#f0f0f8' }}>{parsed.keywords}</div>
                                     </div>
                                   )}
                                </div>
                             )
                         } catch(e) {}
                      }
                      return abs;
                   })()}
                </div>
              </div>
              <div className="rev-ms-row">
                <div className="rev-ms-mini">
                  <div className="rev-ms-label">Type</div>
                  <div className="rev-ms-value">{submission.type}</div>
                </div>
                <div className="rev-ms-mini">
                  <div className="rev-ms-label">Journal</div>
                  <div className="rev-ms-value gold">{submission.journal}</div>
                </div>
              </div>
            </div>

            <div className="rev-info-box warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span>Double-Blind Peer Review: The author's identity and affiliations have been hidden from this evaluation page.</span>
            </div>

            <div className="rev-actions-between">
              <button className="rev-btn-danger" onClick={() => window.history.back()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                Decline Review
              </button>
              <button className="rev-btn-primary" onClick={() => setStep(2)}>
                Accept & Continue
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Guidelines */}
        {step === 2 && (
          <div className="rev-step-body">
            <div className="rev-step-heading">
              <div className="rev-step-num">Step 2</div>
              <h2 className="rev-step-title">Reviewer Guidelines</h2>
            </div>

            <div className="rev-guidelines-box">
              <div className="rev-guide-title">APASIFIC IAEP Reviewer Code of Conduct</div>
              {[
                { icon: "🔒", title: "Confidentiality", desc: "Treat the manuscript and your review as strictly confidential. Do not discuss the paper with third parties." },
                { icon: "⚖️", title: "Objectivity", desc: "Reviews must be conducted objectively and based on academic merit. Personal criticism of the author is inappropriate." },
                { icon: "⏱️", title: "Promptness", desc: "If you feel unqualified or unable to complete the review on time, please notify the editor immediately." },
                { icon: "🚫", title: "Conflict of Interest", desc: "Disclose any conflicts of interest that may affect your review, including professional or personal relationships with authors." },
              ].map((g, i) => (
                <div key={i} className="rev-guide-item">
                  <div className="rev-guide-icon">{g.icon}</div>
                  <div>
                    <div className="rev-guide-name">{g.title}</div>
                    <div className="rev-guide-desc">{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <label className="rev-checkbox-wrap" onClick={() => setAgreed(v => !v)}>
              <div className={`rev-checkbox ${agreed ? "checked" : ""}`}>
                {agreed && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <span>I have read, understood, and agree to abide by the APASIFIC reviewer guidelines and code of conduct.</span>
            </label>

            <div className="rev-actions-between">
              <button className="rev-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="rev-btn-primary" onClick={() => setStep(3)} disabled={!agreed}>
                Proceed to Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="rev-step-body">
            <div className="rev-step-heading">
              <div className="rev-step-num">Step 3</div>
              <h2 className="rev-step-title">Read & Review Manuscript</h2>
            </div>

            <div className="rev-review-grid">
              {/* PDF Viewer */}
              <div className="rev-pdf-panel">
                <div className="rev-pdf-topbar">
                  <div className="rev-pdf-name">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    {submission.file_url ? (submission.file_url.includes('.docx') ? 'Manuscript.docx' : 'Manuscript.pdf') : 'No File Attached'}
                  </div>
                  {submission.file_url && (
                      <a href={submission.file_url} target="_blank" rel="noreferrer" className="rev-download-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#c9a84c', color: '#080810', fontWeight: 'bold', padding: '6px 14px', borderRadius: '4px', textDecoration: 'none' }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Unduh / Buka Naskah
                      </a>
                  )}
                </div>
                <div className="rev-pdf-body">
                  {submission.file_url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
                      <div style={{ background: 'rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '8px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#c9a84c' }}>
                        <span>📄 File Naskah Tersedia ({submission.file_url.includes('.docx') ? 'Dokumen Word .docx' : 'Dokumen PDF'})</span>
                        <a href={submission.file_url} target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 'bold' }}>
                          Klik disini jika iFrame tidak terbuka ➔
                        </a>
                      </div>
                      <iframe 
                          src={submission.file_url.toLowerCase().includes('.pdf') ? submission.file_url : `https://docs.google.com/gview?url=${encodeURIComponent(submission.file_url)}&embedded=true`} 
                          style={{ width: '100%', flex: 1, minHeight: '560px', border: 'none' }} 
                          title="Manuscript Document"
                      />
                    </div>
                  ) : (
                    <div className="rev-pdf-mock">
                      <div className="rev-pdf-icon">📄</div>
                      <div className="rev-pdf-mock-title">Anonymous Manuscript</div>
                      <div className="rev-pdf-mock-sub">Blind review document · No file provided</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Forms */}
              <div className="rev-forms-panel">
                <div className="rev-form-section">
                  <div className="rev-form-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Correction Notes
                  </div>
                  <p className="rev-form-hint">List specific corrections per chapter or paragraph for easy reference.</p>
                  <textarea
                    className="rev-textarea warning-style"
                    rows={4}
                    value={correctionNotes}
                    onChange={e => setCorrectionNotes(e.target.value)}
                    placeholder="e.g. Chapter 2, Para 3: Reference from 2010 is outdated. Please update to recent literature (2020+)..."
                  />
                </div>

                <div className="rev-form-section">
                  <div className="rev-form-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                    Comments for Author & Editor
                  </div>
                  <textarea
                    className="rev-textarea"
                    rows={5}
                    value={commentsForAuthor}
                    onChange={e => setCommentsForAuthor(e.target.value)}
                    placeholder="Enter constructive feedback visible to both the author and editor..."
                  />
                </div>

                <div className="rev-form-section">
                  <div className="rev-form-section-title confidential">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    Confidential Notes (Editor Only)
                  </div>
                  <textarea
                    className="rev-textarea confidential-style"
                    rows={3}
                    value={commentsForEditor}
                    onChange={e => setCommentsForEditor(e.target.value)}
                    placeholder="Private remarks visible only to the editorial team..."
                  />
                </div>

                <div className="rev-form-section">
                  <div className="rev-form-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                    Upload Annotated File (Optional)
                  </div>
                  <div 
                    className="rev-upload-zone"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        setAnnotatedFile(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                    {annotatedFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
                        <span style={{ color: '#34d399', fontWeight: 600, fontSize: '13px' }}>
                          ✓ File siap dikirim: {annotatedFile.name}
                        </span>
                        <label htmlFor="annotated-file" className="rev-browse-link" style={{ fontSize: '11.5px', opacity: 0.8 }}>
                          (Klik di sini untuk mengganti file)
                        </label>
                      </div>
                    ) : (
                      <span>
                        Drop file (PDF/Word) here or <label htmlFor="annotated-file" className="rev-browse-link">browse</label>
                      </span>
                    )}
                    <input 
                       type="file" 
                       id="annotated-file" 
                       accept=".pdf,.doc,.docx" 
                       className="rev-file-input"
                       title="Upload file"
                       onChange={(e) => {
                         if (e.target.files && e.target.files.length > 0) {
                           setAnnotatedFile(e.target.files[0]);
                         }
                       }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rev-actions-between" style={{ marginTop: 24 }}>
              <button className="rev-btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="rev-btn-primary" onClick={() => setStep(4)}>
                Save & Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Submit */}
        {step === 4 && (
          <div className="rev-step-body">
            <div className="rev-step-heading">
              <div className="rev-step-num">Step 4</div>
              <h2 className="rev-step-title">Final Recommendation</h2>
            </div>

            <p className="rev-submit-desc">
              Select your recommendation for this manuscript. This decision will be sent to the editorial team along with your review comments.
            </p>

            <div className="rev-rec-grid">
              {recommendations.map(rec => (
                <button
                  key={rec.value}
                  className={`rev-rec-option ${recommendation === rec.value ? "selected" : ""}`}
                  style={recommendation === rec.value ? {
                    borderColor: rec.border,
                    background: rec.bg,
                    color: rec.color,
                  } : {}}
                  onClick={() => setRecommendation(rec.value)}
                >
                  {recommendation === rec.value && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                  <span>{rec.label}</span>
                </button>
              ))}
            </div>

            {recommendation && (
              <div className="rev-rec-preview" style={{ borderColor: recommendations.find(r => r.value === recommendation)?.border, background: recommendations.find(r => r.value === recommendation)?.bg }}>
                <strong style={{ color: recommendations.find(r => r.value === recommendation)?.color }}>
                  Your Recommendation: {recommendations.find(r => r.value === recommendation)?.label}
                </strong>
                <p>This will be submitted along with your review comments to the editorial team.</p>
              </div>
            )}

            <div className="rev-actions-between" style={{ marginTop: 24 }}>
              <button className="rev-btn-ghost" onClick={() => setStep(3)}>← Back</button>
              <button
                className="rev-btn-success"
                disabled={!recommendation || isSubmitting}
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    const formData = new FormData();
                    formData.append('assignmentId', assignmentId);
                    formData.append('submissionId', submission.id);
                    formData.append('recommendation', recommendation);
                    formData.append('commentsForEditor', commentsForEditor);
                    formData.append('commentsForAuthor', commentsForAuthor);
                    formData.append('correctionNotes', correctionNotes);
                    if (annotatedFile) {
                      formData.append('file', annotatedFile);
                    }

                    const res = await submitReviewResultsWithFile(formData);
                    setIsSubmitting(false);
                    if (res.success) {
                        setSubmitted(true);
                    } else {
                        alert("Error submitting review: " + res.error);
                    }
                  } catch (err: any) {
                    setIsSubmitting(false);
                    alert("Terjadi kesalahan jaringan atau file terlalu besar. Silakan coba lagi. (" + err.message + ")");
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .rev-enterprise {
          max-width: 1100px;
          margin: 0 auto;
          padding-bottom: 60px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Breadcrumb */
        .rev-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
          font-size: 12.5px;
          color: rgba(255,255,255,0.3);
        }
        .rev-breadcrumb svg { width: 13px; height: 13px; }
        :global(.rev-bc-link) {
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.18s;
        }
        :global(.rev-bc-link:hover) { color: #c9a84c; }

        /* Header */
        .rev-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .rev-page-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0 0 5px;
        }
        .rev-page-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }
        .rev-deadline {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 600;
          color: #f59e0b;
          flex-shrink: 0;
        }
        .rev-deadline svg { width: 14px; height: 14px; }

        /* Stepper */
        .rev-stepper {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          overflow-x: auto;
        }
        .rev-step-item {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .rev-step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
          transition: all 0.25s;
        }
        .rev-step-circle.active {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201,168,76,0.1);
          box-shadow: 0 0 14px rgba(201,168,76,0.2);
        }
        .rev-step-circle.done {
          border-color: #34d399;
          background: rgba(52,211,153,0.12);
          color: #34d399;
        }
        .rev-step-circle svg { width: 12px; height: 12px; }
        .rev-step-label {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          margin: 0 10px;
          white-space: nowrap;
          font-weight: 500;
          transition: color 0.25s;
        }
        .rev-step-label.active { color: rgba(255,255,255,0.65); }
        .rev-step-line {
          width: 32px;
          height: 1px;
          background: rgba(255,255,255,0.08);
          flex-shrink: 0;
          transition: background 0.25s;
        }
        .rev-step-line.done { background: rgba(52,211,153,0.3); }

        /* Panel */
        .rev-panel {
          margin-top: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          overflow: hidden;
        }
        .rev-step-body {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* Step Heading */
        .rev-step-heading { display: flex; align-items: center; gap: 12px; }
        .rev-step-num {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(201,168,76,0.1);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.2);
          letter-spacing: 1px;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .rev-step-title {
          font-size: 18px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0;
        }

        /* Info boxes */
        .rev-info-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px 16px;
          border-radius: 11px;
          font-size: 13px;
          line-height: 1.6;
        }
        .rev-info-box svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }
        .rev-info-box.info {
          background: rgba(96,165,250,0.06);
          border: 1px solid rgba(96,165,250,0.15);
          color: rgba(255,255,255,0.5);
        }
        .rev-info-box.info svg { color: #60a5fa; }
        .rev-info-box.warning {
          background: rgba(245,158,11,0.06);
          border: 1px solid rgba(245,158,11,0.15);
          color: rgba(255,255,255,0.5);
        }
        .rev-info-box.warning svg { color: #f59e0b; }

        /* Manuscript Card */
        .rev-ms-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rev-ms-field { display: flex; flex-direction: column; gap: 6px; }
        .rev-ms-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .rev-ms-value {
          font-size: 13.5px;
          color: rgba(255,255,255,0.65);
          line-height: 1.6;
        }
        .rev-ms-value.title {
          font-size: 16px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          line-height: 1.4;
        }
        .rev-ms-value.gold { color: #c9a84c; font-weight: 600; }
        .rev-ms-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .rev-ms-mini { display: flex; flex-direction: column; gap: 5px; }

        /* Buttons */
        .rev-actions-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .rev-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          background: linear-gradient(135deg, #c9a84c 0%, #a07828 100%);
          color: #000;
          font-size: 13px;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(201,168,76,0.2);
        }
        .rev-btn-primary:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(201,168,76,0.35);
          transform: translateY(-1px);
        }
        .rev-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
        .rev-btn-primary svg { width: 14px; height: 14px; }
        .rev-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .rev-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.04); }
        .rev-btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          color: #f87171;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .rev-btn-danger:hover { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.35); }
        .rev-btn-danger svg { width: 14px; height: 14px; }
        .rev-btn-success {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          color: #000;
          font-size: 13px;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(52,211,153,0.2);
        }
        .rev-btn-success:hover:not(:disabled) { box-shadow: 0 6px 24px rgba(52,211,153,0.35); transform: translateY(-1px); }
        .rev-btn-success:disabled { opacity: 0.35; cursor: not-allowed; }
        .rev-btn-success svg { width: 14px; height: 14px; }

        /* Guidelines */
        .rev-guidelines-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .rev-guide-title {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 18px;
        }
        .rev-guide-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .rev-guide-item:last-child { border-bottom: none; }
        .rev-guide-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .rev-guide-name { font-size: 13.5px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 4px; }
        .rev-guide-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        /* Checkbox */
        .rev-checkbox-wrap {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
          user-select: none;
        }
        .rev-checkbox {
          width: 20px; height: 20px; border-radius: 6px;
          border: 2px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.18s; margin-top: 1px;
        }
        .rev-checkbox.checked { background: rgba(201,168,76,0.15); border-color: #c9a84c; }
        .rev-checkbox svg { width: 11px; height: 11px; color: #c9a84c; }

        /* Review Grid */
        .rev-review-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 24px;
        }
        @media (max-width: 800px) { .rev-review-grid { grid-template-columns: 1fr; } }

        /* PDF Panel */
        .rev-pdf-panel {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          height: 800px;
        }
        .rev-pdf-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 16px;
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .rev-pdf-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
        }
        .rev-pdf-name svg { width: 15px; height: 15px; color: #f87171; }
        .rev-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 7px;
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: all 0.18s;
        }
        .rev-download-btn:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.7); }
        .rev-download-btn svg { width: 12px; height: 12px; }
        .rev-pdf-body {
          flex: 1;
          overflow-y: auto;
          background: rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          gap: 12px;
          scrollbar-width: none;
        }
        .rev-pdf-body::-webkit-scrollbar { display: none; }
        .rev-pdf-mock {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          width: 100%;
        }
        .rev-pdf-icon { font-size: 36px; margin-bottom: 10px; }
        .rev-pdf-mock-title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
        .rev-pdf-mock-sub { font-size: 11.5px; color: rgba(255,255,255,0.25); margin-bottom: 20px; }
        .rev-pdf-pages { display: flex; flex-direction: column; gap: 12px; }
        .rev-pdf-page {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 16px;
          text-align: left;
        }
        .rev-pdf-page-num { font-size: 10px; color: rgba(255,255,255,0.2); margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase; }
        .rev-pdf-line { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; margin-bottom: 6px; }

        /* Review Forms */
        .rev-forms-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 620px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .rev-form-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rev-form-section-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rev-form-section-title.confidential { color: #f87171; }
        .rev-form-section-title svg { width: 14px; height: 14px; }
        .rev-form-hint { font-size: 11.5px; color: rgba(255,255,255,0.25); line-height: 1.5; }
        .rev-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          font-family: inherit;
          outline: none;
          resize: vertical;
          width: 100%;
          transition: border-color 0.2s;
          line-height: 1.6;
        }
        .rev-textarea:focus { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.03); }
        .rev-textarea.warning-style { border-color: rgba(245,158,11,0.12); }
        .rev-textarea.warning-style:focus { border-color: rgba(245,158,11,0.35); background: rgba(245,158,11,0.02); }
        .rev-textarea.confidential-style { border-color: rgba(248,113,113,0.12); }
        .rev-textarea.confidential-style:focus { border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.02); }
        .rev-upload-zone {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border: 2px dashed rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 12.5px;
          color: rgba(255,255,255,0.3);
          transition: border-color 0.2s;
          cursor: pointer;
          position: relative;
        }
        .rev-upload-zone:hover { border-color: rgba(255,255,255,0.15); }
        .rev-upload-zone svg { width: 16px; height: 16px; flex-shrink: 0; }
        .rev-browse-link { color: #c9a84c; cursor: pointer; font-weight: 600; }
        .rev-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

        /* Recommendation */
        .rev-submit-desc { font-size: 13.5px; color: rgba(255,255,255,0.4); line-height: 1.6; margin: 0; }
        .rev-rec-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rev-rec-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          text-align: left;
          transition: all 0.18s;
        }
        .rev-rec-option:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.05); }
        .rev-rec-option.selected { font-weight: 700; }
        .rev-rec-preview {
          padding: 14px 18px;
          border: 1px solid;
          border-radius: 12px;
          font-size: 13px;
        }
        .rev-rec-preview p { margin: 6px 0 0; font-size: 12px; color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  );
}
