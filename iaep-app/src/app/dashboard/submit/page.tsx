"use client";

import { useState } from "react";
import { submitManuscript } from "@/app/actions/submission";

export default function SubmitManuscript() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const [formData, setFormData] = useState({
    journalId: "1",
    title: "",
    abstract: "",
    abstractEn: "",
    file: null as File | null,
    anonFile: null as File | null,
    agreeTerms: false
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      // Simulate real-time API latency
      await new Promise(resolve => setTimeout(resolve, 1200));

      const newId = String(Math.floor(1000 + Math.random() * 9000));
      const newSub = {
        id: newId,
        title: formData.title || "Untitled Manuscript",
        journal: formData.journalId === "1" ? "APASIFIC IAEP" : "RJRAKP",
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
        status: "Awaiting Assignment",
        lastAction: "Submitted successfully"
      };

      // 1. Add to submissions in localStorage:
      const defaultSubs = [
        {
          id: "1045",
          title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education",
          journal: "APASIFIC IAEP",
          date: "July 01, 2026",
          status: "Under Review",
          lastAction: "Sent to Reviewers on July 03, 2026"
        },
        {
          id: "1022",
          title: "Analyzing Regional Economic Policies Post-Pandemic in ASEAN",
          journal: "RJRAKP",
          date: "May 15, 2026",
          status: "Published",
          lastAction: "Published in Vol. 4 No. 2 (2026)"
        },
        {
          id: "1056",
          title: "Blockchain Integration in Academic Credential Verification",
          journal: "APASIFIC IAEP",
          date: "July 04, 2026",
          status: "Awaiting Assignment",
          lastAction: "Submitted successfully"
        }
      ];

      const stored = localStorage.getItem("mock_submissions");
      const currentList = stored ? JSON.parse(stored) : defaultSubs;
      currentList.unshift(newSub); // Insert at beginning of list
      localStorage.setItem("mock_submissions", JSON.stringify(currentList));

      // 2. Add to system activity logs:
      try {
        const defaultLogs = [
          { time: "10 mins ago", text: "New Journal created: 'APASIFIC Medical Journal'", status: "success" },
          { time: "1 hour ago", text: "System backup completed successfully.", status: "info" },
          { time: "3 hours ago", text: "M. A. Rahman granted 'Editor' role in RJRAKP.", status: "warning" },
          { time: "1 day ago", text: "High traffic warning: 50+ simultaneous submissions.", status: "error" }
        ];
        const storedLogs = localStorage.getItem("mock_system_logs");
        const currentLogs = storedLogs ? JSON.parse(storedLogs) : defaultLogs;
        currentLogs.unshift({
          time: "Just now",
          text: `New manuscript submitted: '${newSub.title}'`,
          status: "success"
        });
        localStorage.setItem("mock_system_logs", JSON.stringify(currentLogs));
      } catch (logErr) {
        console.error("Log error:", logErr);
      }

      setStep(5);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Gagal mengirimkan manuskrip." });
    }
    setIsSubmitting(false);
  };

  const steps = ["Start", "Upload Submission", "Enter Metadata", "Confirmation", "Next Steps"];

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-[#18182e] px-8 py-6 border-b border-[#c9a84c]/30">
        <h1 className="text-2xl font-bold text-white font-['Cinzel']">Submit an Article</h1>
        
        {/* Stepper UI */}
        <div className="flex items-center mt-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold ${
                step > i + 1 ? 'bg-[#c9a84c] border-[#c9a84c] text-black' : 
                step === i + 1 ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-gray-600 text-gray-500'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <div className={`ml-2 text-xs font-semibold hidden md:block ${
                step >= i + 1 ? 'text-white' : 'text-gray-500'
              }`}>
                {s}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 md:w-12 h-0.5 mx-2 md:mx-4 ${step > i + 1 ? 'bg-[#c9a84c]' : 'bg-gray-700'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 text-gray-800">
        {message && (
          <div className={`p-4 mb-6 rounded-lg text-sm border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
            {message.text}
          </div>
        )}

        {/* Step 1: Start */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-2">Step 1. Start</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Section</label>
              <select 
                value={formData.journalId} 
                onChange={e => setFormData({...formData, journalId: e.target.value})}
                className="w-full border border-gray-300 rounded p-2 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]"
              >
                <option value="1">Articles</option>
                <option value="2">Reviews</option>
                <option value="3">Editorials</option>
              </select>
            </div>
            
            <div className="bg-gray-50 p-4 border border-gray-200 rounded">
              <h3 className="font-semibold mb-2">Submission Requirements</h3>
              <ul className="list-disc pl-5 text-sm space-y-2 text-gray-600">
                <li>The submission has not been previously published.</li>
                <li>The submission file is in OpenOffice, Microsoft Word, or RTF document file format.</li>
                <li>Where available, URLs for the references have been provided.</li>
                <li>The text adheres to the stylistic and bibliographic requirements.</li>
              </ul>
            </div>

            <label className="flex items-center space-x-3 mt-4">
              <input 
                type="checkbox" 
                checked={formData.agreeTerms}
                onChange={e => setFormData({...formData, agreeTerms: e.target.checked})}
                className="w-5 h-5 text-[#c9a84c] focus:ring-[#c9a84c] border-gray-300 rounded"
              />
              <span className="text-sm font-medium">Yes, I agree to abide by the terms of the copyright statement.</span>
            </label>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleNext} 
                disabled={!formData.agreeTerms}
                className="bg-[#0d0d1a] text-white px-6 py-2 rounded font-semibold disabled:opacity-50 hover:bg-[#1a1a2e]"
              >
                Save and continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-2">Step 2. Upload Submission Files</h2>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-sm mb-4">
              <strong>Double-Blind Requirement:</strong> You must upload two separate files. One complete manuscript (with author names) and one anonymous manuscript (without author names or affiliations) in PDF format for the reviewers.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File 1: Author Version */}
              <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <h3 className="font-bold text-gray-800 mb-2">1. Complete Manuscript</h3>
                <p className="text-xs text-gray-500 mb-4">(Includes author names & affiliations. Word/PDF)</p>
                <input 
                  type="file" 
                  id="file-upload-author" 
                  className="hidden"
                  onChange={e => setFormData({...formData, file: e.target.files?.[0] || null})}
                />
                <label htmlFor="file-upload-author" className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 font-medium inline-block">
                  Upload File
                </label>
                {formData.file && (
                  <div className="mt-4 text-green-600 font-medium text-sm truncate px-2">
                    ✓ {formData.file.name}
                  </div>
                )}
              </div>

              {/* File 2: Anonymous Version */}
              <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <h3 className="font-bold text-gray-800 mb-2">2. Anonymous Manuscript</h3>
                <p className="text-xs text-gray-500 mb-4">(For Blind Review. MUST BE PDF)</p>
                <input 
                  type="file" 
                  accept=".pdf"
                  id="file-upload-anon" 
                  className="hidden"
                  onChange={e => setFormData({...formData, anonFile: e.target.files?.[0] || null})}
                />
                <label htmlFor="file-upload-anon" className="cursor-pointer bg-[#c9a84c] text-black border border-[#b0923d] px-4 py-2 rounded shadow-sm hover:bg-[#b0923d] font-semibold inline-block">
                  Upload PDF
                </label>
                {formData.anonFile && (
                  <div className="mt-4 text-green-600 font-medium text-sm truncate px-2">
                    ✓ {formData.anonFile.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button onClick={handlePrev} className="text-gray-600 font-semibold px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleNext} disabled={!formData.file || !formData.anonFile} className="bg-[#0d0d1a] text-white px-6 py-2 rounded font-semibold disabled:opacity-50 hover:bg-[#1a1a2e]">Save and continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Metadata */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-2">Step 3. Enter Metadata</h2>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Title *</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded p-2 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Abstract (Indonesian) *</label>
                <textarea 
                  rows={8}
                  required
                  value={formData.abstract}
                  onChange={e => setFormData({...formData, abstract: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] text-sm"
                  placeholder="Masukkan abstrak dalam bahasa Indonesia..."
                ></textarea>
              </div>
              
              <div className="relative">
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-[#c9a84c]">Abstract (English) *</label>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!formData.abstract) return alert('Silakan isi abstrak bahasa Indonesia terlebih dahulu');
                      // Dummy translate action
                      setFormData({...formData, abstractEn: "Translating...\n\n" + formData.abstract + "\n\n(Translated via APASIFIC Neural Engine)"});
                    }}
                    className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded border border-blue-200 hover:bg-blue-100 flex items-center transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                    Auto Translate
                  </button>
                </div>
                <textarea 
                  rows={8}
                  required
                  value={formData.abstractEn}
                  onChange={e => setFormData({...formData, abstractEn: e.target.value})}
                  className="w-full border border-[#c9a84c]/50 bg-yellow-50/30 rounded p-2 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] text-sm"
                  placeholder="English translation will appear here..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button onClick={handlePrev} className="text-gray-600 font-semibold px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleNext} disabled={!formData.title || !formData.abstract || !formData.abstractEn} className="bg-[#0d0d1a] text-white px-6 py-2 rounded font-semibold disabled:opacity-50 hover:bg-[#1a1a2e]">Save and continue</button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-2">Step 4. Confirmation</h2>
            
            <p className="text-gray-600">
              Your submission has been uploaded and is ready to be sent. You may go back to review and adjust any of the information you have entered before continuing. When you are ready, click "Finish Submission".
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h3 className="font-semibold">{formData.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{formData.file?.name}</p>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={handlePrev} className="text-gray-600 font-semibold px-4 py-2 hover:bg-gray-100 rounded" disabled={isSubmitting}>Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50 hover:bg-green-700">
                {isSubmitting ? "Submitting..." : "Finish Submission"}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="space-y-6 text-center py-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Submission Complete</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Thank you for your interest in publishing with APASIFIC IAEP. What happens next? The journal has been notified of your submission, and you will be emailed a confirmation for your records.
            </p>
            
            <div className="pt-8">
              <a href="/dashboard" className="text-[#c9a84c] font-semibold hover:underline">
                Return to your dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
