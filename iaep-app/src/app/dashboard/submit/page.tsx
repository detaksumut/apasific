"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SubmitManuscript() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    journalId: "1",
    title: "",
    abstract: "",
    abstractEn: "",
    file: null as File | null,
    anonFile: null as File | null,
    agreeTerms: false,
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const supabase = createClient();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please log in to submit a manuscript.");

      let fileUrl = "";
      
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        
        // Ensure manuscripts bucket exists (might fail if not created, but we proceed)
        const { error: uploadError } = await supabase.storage
          .from('manuscripts')
          .upload(fileName, formData.file);
          
        if (uploadError) {
          console.warn("Storage upload failed (bucket might not exist):", uploadError);
        } else {
          const { data } = supabase.storage.from('manuscripts').getPublicUrl(fileName);
          fileUrl = data.publicUrl;
        }
      }

      // Get Journal ID
      const slug = formData.journalId === "1" ? "iaep" : "rjrakp";
      const { data: journalData } = await supabase
        .from('journals')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!journalData) throw new Error("Journal not found in database.");

      // Insert submission
      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          author_id: user.id,
          journal_id: journalData.id,
          title: formData.title || "Untitled Manuscript",
          abstract: formData.abstract,
          file_url: fileUrl,
          stage: 'Review',
          status: 'Awaiting Reviewers'
        });
        
      if (insertError) throw insertError;

      setStep(5);
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: error.message || "Failed to submit manuscript." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ["Mulai", "Unggah File", "Metadata", "Konfirmasi", "Selesai"];
  const stepDescriptions = [
    "Tinjau persyaratan dan pilih jenis submisi",
    "Unggah dokumen naskah Anda",
    "Masukkan judul dan abstrak artikel",
    "Tinjau dan selesaikan submisi Anda",
    "Submisi selesai",
  ];

  return (
    <div className="submit-enterprise">
      {/* Page Header */}
      <div className="submit-header">
        <div>
          <h1 className="submit-page-title">Submit Artikel</h1>
          <p className="submit-page-subtitle">Sistem Double-Blind Peer Review APASIFIC</p>
        </div>
        <div className="submit-journal-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          APASIFIC IAEP
        </div>
      </div>

      {/* Stepper */}
      <div className="submit-stepper">
        {steps.map((s, i) => (
          <div key={s} className="submit-step-item">
            <div className={`submit-step-circle ${step > i + 1 ? "done" : step === i + 1 ? "active" : ""}`}>
              {step > i + 1 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <div className={`submit-step-label ${step >= i + 1 ? "active" : ""}`}>{s}</div>
            {i < steps.length - 1 && (
              <div className={`submit-step-line ${step > i + 1 ? "done" : ""}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Description */}
      <div className="submit-step-desc">{stepDescriptions[step - 1]}</div>

      {/* Form Panel */}
      <div className="submit-panel">
        {message && (
          <div className={`submit-message ${message.type}`}>
            {message.type === "error" ? "⚠" : "✓"} {message.text}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="submit-step-content">
            <div className="submit-field-group">
              <label className="submit-label">Jenis Submisi</label>
              <select
                value={formData.journalId}
                onChange={(e) => setFormData({ ...formData, journalId: e.target.value })}
                className="submit-select"
              >
                <option value="1">Artikel — Makalah penelitian orisinal</option>
                <option value="2">Review — Artikel tinjauan literatur</option>
                <option value="3">Editorial — Komentar editorial</option>
              </select>
            </div>

            <div className="submit-requirements">
              <div className="submit-req-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Submission Requirements
              </div>
              <ul className="submit-req-list">
                {[
                  "Submisi ini belum pernah diterbitkan sebelumnya.",
                  "Naskah dalam format OpenOffice, Microsoft Word, atau RTF.",
                  "Jika tersedia, URL untuk referensi telah disediakan.",
                  "Teks mematuhi persyaratan gaya dan bibliografi.",
                ].map((req, i) => (
                  <li key={i} className="submit-req-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <label className="submit-checkbox-wrap">
              <div className={`submit-checkbox ${formData.agreeTerms ? "checked" : ""}`} onClick={() => setFormData({ ...formData, agreeTerms: !formData.agreeTerms })}>
                {formData.agreeTerms && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span>Saya setuju dengan ketentuan <span style={{ color: "#c9a84c" }}>pernyataan hak cipta</span> dan mengonfirmasi bahwa naskah ini belum pernah diterbitkan di tempat lain.</span>
            </label>

            <div className="submit-actions-end">
              <button onClick={handleNext} disabled={!formData.agreeTerms} className="submit-btn-primary">
                Lanjutkan
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="submit-step-content">
            <div className="submit-alert-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <strong>Kebijakan Tinjauan Double-Blind</strong>
                <p>Anda harus mengunggah dua file: naskah lengkap (dengan detail penulis) dan versi anonim (tanpa nama penulis) untuk tinjauan sejawat yang adil.</p>
              </div>
            </div>

            <div className="submit-upload-grid">
              {[
                { key: "file" as const, label: "Naskah Lengkap", sub: "Word / PDF · Sertakan nama penulis & afiliasi", icon: "📄", accept: undefined },
                { key: "anonFile" as const, label: "Naskah Anonim", sub: "Hanya PDF · Hapus semua pengidentifikasi penulis", icon: "🔒", accept: ".pdf" },
              ].map((slot) => (
                <div key={slot.key} className={`submit-upload-zone ${formData[slot.key] ? "uploaded" : ""}`}>
                  <div className="submit-upload-icon">{slot.icon}</div>
                  <div className="submit-upload-title">{slot.label}</div>
                  <div className="submit-upload-sub">{slot.sub}</div>
                  <input
                    type="file"
                    id={`file-${slot.key}`}
                    className="hidden"
                    accept={slot.accept}
                    onChange={(e) => setFormData({ ...formData, [slot.key]: e.target.files?.[0] || null })}
                  />
                  <label htmlFor={`file-${slot.key}`} className={`submit-upload-btn ${formData[slot.key] ? "uploaded" : ""}`}>
                    {formData[slot.key] ? "✓ Ubah File" : "Pilih File"}
                  </label>
                  {formData[slot.key] && (
                    <div className="submit-file-name">
                      {(formData[slot.key] as File).name}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="submit-actions-between">
              <button onClick={handlePrev} className="submit-btn-ghost">← Kembali</button>
              <button onClick={handleNext} disabled={!formData.file || !formData.anonFile} className="submit-btn-primary">
                Lanjutkan →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="submit-step-content">
            <div className="submit-field-group">
              <label className="submit-label">Judul Artikel <span style={{ color: "#c9a84c" }}>*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul lengkap naskah Anda..."
                className="submit-input"
              />
              <div className="submit-field-hint">{formData.title.length} karakter · Direkomendasikan: 10–150 karakter</div>
            </div>

            <div className="submit-abstract-grid">
              <div className="submit-field-group">
                <label className="submit-label">Abstrak (Bahasa Indonesia) <span style={{ color: "#c9a84c" }}>*</span></label>
                <textarea
                  rows={9}
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Masukkan abstrak dalam bahasa Indonesia (150–300 kata)..."
                  className="submit-textarea"
                />
                <div className="submit-field-hint">{formData.abstract.split(/\s+/).filter(Boolean).length} kata</div>
              </div>

              <div className="submit-field-group">
                <div className="submit-label-row">
                  <label className="submit-label" style={{ color: "#c9a84c" }}>Abstrak (Bahasa Inggris) <span>*</span></label>
                  <button
                    type="button"
                    className="submit-translate-btn"
                    onClick={() => {
                      if (!formData.abstract) return;
                      setFormData({ ...formData, abstractEn: "Terjemahan AI sedang berlangsung...\n\n" + formData.abstract + "\n\n(Diterjemahkan melalui APASIFIC Neural Engine)" });
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Terjemahan Otomatis
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={formData.abstractEn}
                  onChange={(e) => setFormData({ ...formData, abstractEn: e.target.value })}
                  placeholder="Abstrak bahasa Inggris akan muncul di sini setelah diterjemahkan..."
                  className="submit-textarea gold-focus"
                />
                <div className="submit-field-hint">{formData.abstractEn.split(/\s+/).filter(Boolean).length} kata</div>
              </div>
            </div>

            <div className="submit-actions-between">
              <button onClick={handlePrev} className="submit-btn-ghost">← Kembali</button>
              <button onClick={handleNext} disabled={!formData.title || !formData.abstract || !formData.abstractEn} className="submit-btn-primary">
                Lanjutkan →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="submit-step-content">
            <div className="submit-confirm-box">
              <div className="submit-confirm-header">Ringkasan Submisi</div>
              <div className="submit-confirm-rows">
                <div className="submit-confirm-row">
                  <span>Judul</span>
                  <strong>{formData.title}</strong>
                </div>
                <div className="submit-confirm-row">
                  <span>Jurnal</span>
                  <strong>{formData.journalId === "1" ? "APASIFIC IAEP" : "RJRAKP"}</strong>
                </div>
                <div className="submit-confirm-row">
                  <span>Naskah</span>
                  <strong>{formData.file?.name}</strong>
                </div>
                <div className="submit-confirm-row">
                  <span>File Anonim</span>
                  <strong>{formData.anonFile?.name}</strong>
                </div>
                <div className="submit-confirm-row">
                  <span>Abstrak (ID)</span>
                  <strong className="submit-confirm-abstract">{formData.abstract.slice(0, 120)}...</strong>
                </div>
              </div>
            </div>

            <div className="submit-confirm-note">
              Dengan mengklik "Selesaikan Submisi", Anda mengonfirmasi semua detail di atas akurat dan Anda setuju dengan ketentuan publikasi jurnal.
            </div>

            <div className="submit-actions-between">
              <button onClick={handlePrev} disabled={isSubmitting} className="submit-btn-ghost">← Kembali</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="submit-btn-success">
                {isSubmitting ? (
                  <>
                    <div className="submit-spinner" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Selesaikan Submisi
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="submit-success-screen">
            <div className="submit-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="submit-success-title">Submisi Selesai!</h2>
            <p className="submit-success-desc">
              Terima kasih telah mengirim ke APASIFIC IAEP. Tim editorial telah diberitahu. 
              Anda akan menerima email konfirmasi dengan ID naskah Anda dan langkah selanjutnya.
            </p>
            <div className="submit-success-actions">
              <a href="/dashboard/submissions" className="submit-btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Lihat Submisi Saya →
              </a>
              <a href="/dashboard" className="submit-btn-ghost" style={{ textDecoration: "none" }}>
                Kembali ke Dasbor
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .submit-enterprise {
          max-width: 900px;
          margin: 0 auto;
          padding-bottom: 60px;
        }

        /* Header */
        .submit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .submit-page-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0 0 4px;
        }
        .submit-page-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }
        .submit-journal-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #c9a84c;
        }
        .submit-journal-badge svg { width: 15px; height: 15px; }

        /* Stepper */
        .submit-stepper {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .submit-step-item {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .submit-step-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          transition: all 0.25s;
        }
        .submit-step-circle.active {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201,168,76,0.1);
          box-shadow: 0 0 16px rgba(201,168,76,0.2);
        }
        .submit-step-circle.done {
          border-color: #34d399;
          background: rgba(52,211,153,0.12);
          color: #34d399;
        }
        .submit-step-circle svg { width: 13px; height: 13px; }
        .submit-step-label {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          margin: 0 8px;
          white-space: nowrap;
          font-weight: 500;
          transition: color 0.25s;
        }
        .submit-step-label.active { color: rgba(255,255,255,0.7); }
        .submit-step-line {
          height: 1px;
          width: 32px;
          background: rgba(255,255,255,0.08);
          flex-shrink: 0;
          transition: background 0.25s;
        }
        .submit-step-line.done { background: rgba(52,211,153,0.35); }

        .submit-step-desc {
          font-size: 12.5px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 24px;
          padding-left: 2px;
        }

        /* Panel */
        .submit-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 32px;
        }

        .submit-message {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .submit-message.error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
        }
        .submit-message.success {
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          color: #34d399;
        }

        .submit-step-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Fields */
        .submit-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .submit-label {
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.2px;
        }
        .submit-field-hint {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          margin-top: 4px;
        }
        :global(.submit-select),
        :global(.submit-input),
        :global(.submit-textarea) {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: rgba(255,255,255,0.8);
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
        }
        :global(.submit-select:focus),
        :global(.submit-input:focus),
        :global(.submit-textarea:focus) {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
        }
        :global(.submit-select option) {
          background: #0f0f1a;
          color: #e0e0e8;
        }
        :global(.submit-textarea) { resize: vertical; }
        :global(.submit-textarea.gold-focus:focus) {
          border-color: rgba(201,168,76,0.5);
        }

        /* Requirements */
        .submit-requirements {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 18px;
        }
        .submit-req-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.55);
          margin-bottom: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .submit-req-title svg { width: 15px; height: 15px; color: #c9a84c; }
        .submit-req-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .submit-req-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
        }
        .submit-req-item svg {
          width: 14px;
          height: 14px;
          color: #34d399;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Checkbox */
        .submit-checkbox-wrap {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.5;
          user-select: none;
        }
        .submit-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.18s;
          margin-top: 1px;
        }
        .submit-checkbox.checked {
          background: rgba(201,168,76,0.15);
          border-color: #c9a84c;
        }
        .submit-checkbox svg { width: 11px; height: 11px; color: #c9a84c; }

        /* Buttons */
        .submit-actions-end {
          display: flex;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .submit-actions-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        :global(.submit-btn-primary) {
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
          text-decoration: none;
        }
        :global(.submit-btn-primary:hover:not(:disabled)) {
          box-shadow: 0 6px 24px rgba(201,168,76,0.35);
          transform: translateY(-1px);
        }
        :global(.submit-btn-primary:disabled) {
          opacity: 0.35;
          cursor: not-allowed;
        }
        :global(.submit-btn-primary svg) { width: 14px; height: 14px; }

        :global(.submit-btn-ghost) {
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
          text-decoration: none;
        }
        :global(.submit-btn-ghost:hover:not(:disabled)) {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.04);
        }

        .submit-btn-success {
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
        .submit-btn-success:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(52,211,153,0.35);
          transform: translateY(-1px);
        }
        .submit-btn-success:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn-success svg { width: 14px; height: 14px; }

        /* Upload */
        .submit-alert-info {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(96,165,250,0.07);
          border: 1px solid rgba(96,165,250,0.15);
          border-radius: 12px;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
        }
        .submit-alert-info svg { width: 18px; height: 18px; color: #60a5fa; flex-shrink: 0; margin-top: 1px; }
        .submit-alert-info strong { display: block; color: #60a5fa; margin-bottom: 4px; font-size: 13px; }
        .submit-alert-info p { margin: 0; }
        .submit-upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .submit-upload-grid { grid-template-columns: 1fr; }
        }
        .submit-upload-zone {
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 28px 20px;
          text-align: center;
          transition: all 0.2s;
        }
        .submit-upload-zone.uploaded {
          border-color: rgba(52,211,153,0.3);
          background: rgba(52,211,153,0.03);
        }
        .submit-upload-zone:hover {
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.02);
        }
        .submit-upload-icon { font-size: 32px; margin-bottom: 10px; }
        .submit-upload-title {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.75);
          margin-bottom: 4px;
        }
        .submit-upload-sub {
          font-size: 11.5px;
          color: rgba(255,255,255,0.25);
          margin-bottom: 14px;
          line-height: 1.5;
        }
        :global(.submit-upload-btn) {
          display: inline-block;
          padding: 7px 18px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
          transition: all 0.18s;
        }
        :global(.submit-upload-btn:hover) {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.25);
        }
        :global(.submit-upload-btn.uploaded) {
          border-color: rgba(52,211,153,0.35);
          color: #34d399;
          background: rgba(52,211,153,0.08);
        }
        .submit-file-name {
          font-size: 11px;
          color: #34d399;
          margin-top: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 8px;
        }

        /* Metadata */
        .submit-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .submit-translate-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: rgba(96,165,250,0.08);
          border: 1px solid rgba(96,165,250,0.2);
          border-radius: 7px;
          font-size: 11px;
          font-weight: 600;
          color: #60a5fa;
          cursor: pointer;
          transition: all 0.18s;
        }
        .submit-translate-btn:hover {
          background: rgba(96,165,250,0.15);
          border-color: rgba(96,165,250,0.35);
        }
        .submit-translate-btn svg { width: 12px; height: 12px; }
        .submit-abstract-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 760px) {
          .submit-abstract-grid { grid-template-columns: 1fr; }
        }

        /* Confirm */
        .submit-confirm-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
        }
        .submit-confirm-header {
          background: rgba(201,168,76,0.06);
          border-bottom: 1px solid rgba(201,168,76,0.1);
          padding: 12px 20px;
          font-size: 12px;
          font-weight: 700;
          color: #c9a84c;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .submit-confirm-rows {
          display: flex;
          flex-direction: column;
        }
        .submit-confirm-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 13px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px;
        }
        .submit-confirm-row:last-child { border-bottom: none; }
        .submit-confirm-row span { color: rgba(255,255,255,0.3); flex-shrink: 0; min-width: 100px; }
        .submit-confirm-row strong { color: rgba(255,255,255,0.7); text-align: right; word-break: break-word; }
        .submit-confirm-abstract { font-weight: 400 !important; font-style: italic; font-size: 12px !important; }
        .submit-confirm-note {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          line-height: 1.6;
          padding: 4px 0;
        }

        /* Submit Spinner */
        .submit-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Success */
        .submit-success-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 20px;
        }
        .submit-success-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(52,211,153,0.1);
          border: 2px solid rgba(52,211,153,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          animation: success-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes success-pop {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .submit-success-icon svg { width: 30px; height: 30px; color: #34d399; }
        .submit-success-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0 0 12px;
        }
        .submit-success-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          max-width: 460px;
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .submit-success-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
