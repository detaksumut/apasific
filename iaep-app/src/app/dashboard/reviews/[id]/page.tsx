"use client";

import { useState } from "react";
import Link from "next/link";
// import { useParams } from "next/navigation";

export default function ReviewEvaluation() {
  // const params = useParams();
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [commentsForEditor, setCommentsForEditor] = useState("");
  const [commentsForAuthor, setCommentsForAuthor] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const steps = ["1. Request", "2. Guidelines", "3. Download & Review", "4. Completion"];

  const handleNext = () => setStep(s => Math.min(s + 1, 4));

  // Dummy submission data
  const submission = {
    title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education",
    abstract: "This paper explores the transformative effects of AI technologies on university curricula and administrative processes across ASEAN nations...",
    type: "Articles"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard/reviews/pending" className="hover:text-[#c9a84c]">Pending Reviews</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Review Evaluation</span>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-[#18182e] px-8 py-6 border-b border-[#c9a84c]/30">
          <h1 className="text-2xl font-bold text-white font-['Cinzel']">Evaluate Submission</h1>
          
          <div className="flex items-center mt-8 overflow-x-auto pb-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-shrink-0">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold ${
                  step > i + 1 ? 'bg-[#c9a84c] border-[#c9a84c] text-black' : 
                  step === i + 1 ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-gray-600 text-gray-500'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <div className={`ml-2 text-xs font-semibold ${
                  step >= i + 1 ? 'text-white' : 'text-gray-500'
                }`}>
                  {s}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 md:mx-4 ${step > i + 1 ? 'bg-[#c9a84c]' : 'bg-gray-700'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 text-gray-800">
          {/* Step 1: Request */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Step 1. Request for Review</h2>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded text-sm text-blue-800">
                You have been selected as a potential reviewer for the following submission. Below is an overview of the manuscript.
              </div>
              
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Title</div>
                  <div className="font-medium text-lg mt-1">{submission.title}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Abstract</div>
                  <div className="text-gray-700 mt-1 leading-relaxed">{submission.abstract}</div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-yellow-800 font-medium">
                Note: This is a Double-Blind Peer Review. The author's identity has been hidden from this page.
              </div>

              <div className="flex justify-end pt-4 space-x-4">
                <button className="bg-white border-2 border-red-500 text-red-600 px-6 py-2 rounded font-bold hover:bg-red-50 transition-colors shadow-sm">
                  Decline Review
                </button>
                <button onClick={handleNext} className="bg-green-600 border-2 border-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                  Accept Review <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Guidelines */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Step 2. Reviewer Guidelines</h2>
              <div className="prose max-w-none text-sm text-gray-600 bg-gray-50 p-6 border border-gray-200 rounded">
                <h3 className="text-gray-800 font-bold">APASIFIC IAEP Reviewer Guidelines</h3>
                <p>By proceeding with this review, you agree to the following:</p>
                <ul>
                  <li><strong>Confidentiality:</strong> Treat the manuscript and your review as confidential documents.</li>
                  <li><strong>Objectivity:</strong> Reviews should be conducted objectively. Personal criticism of the author is inappropriate.</li>
                  <li><strong>Promptness:</strong> If you feel unqualified to review the research or know that its prompt review will be impossible, please notify the editor immediately.</li>
                </ul>
              </div>

              <label className="flex items-center space-x-3 mt-4">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="w-5 h-5 text-[#c9a84c] focus:ring-[#c9a84c] border-gray-300 rounded"
                />
                <span className="text-sm font-medium">I have read and agree to the reviewer guidelines.</span>
              </label>

              <div className="flex justify-end pt-4">
                <button onClick={handleNext} disabled={!agreed} className="bg-[#0d0d1a] text-white px-6 py-2 rounded font-semibold disabled:opacity-50 hover:bg-[#1a1a2e]">
                  Continue to Step 3
                </button>
              </div>
            </div>
          )}

        {/* Step 3: Download & Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-2">Step 3. Read & Review</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: PDF Viewer */}
              <div className="flex flex-col h-[700px] border border-gray-300 rounded-lg overflow-hidden bg-gray-100 shadow-inner">
                <div className="bg-[#2d2d2d] text-white p-3 border-b border-gray-800 flex justify-between items-center shadow-md z-10">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                    <span className="font-semibold text-sm">Anonymous_Manuscript.pdf</span>
                  </div>
                  <button className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download
                  </button>
                </div>
                
                {/* PDF Viewer Mockup */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-300 flex justify-center">
                  <div className="bg-white w-full max-w-lg shadow-lg aspect-[1/1.4] p-10 flex flex-col items-center justify-center text-gray-400 border border-gray-200">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-center font-medium">Interactive PDF Reader</p>
                    <p className="text-xs text-center mt-2">(Anonymous blind manuscript displayed here)</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Review Forms & Error Notes */}
              <div className="flex flex-col h-[700px] overflow-y-auto pr-4 space-y-6">
                
                <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg shadow-sm">
                  <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Correction Notes / Catatan Kesalahan
                  </h3>
                  <p className="text-xs text-yellow-700 mb-3">Tuliskan koreksi spesifik per bab atau paragraf di sini agar Penulis dan Editor mudah membacanya.</p>
                  <textarea 
                    rows={4}
                    placeholder="Contoh: Bab 2 - Paragraf 3: Referensi tahun 2015 terlalu usang..."
                    className="w-full border border-yellow-300 rounded p-3 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 bg-white"
                  ></textarea>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">General Review Comments</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">For Author and Editor</label>
                    <textarea 
                      rows={5}
                      value={commentsForAuthor}
                      onChange={e => setCommentsForAuthor(e.target.value)}
                      placeholder="Enter your constructive feedback for the author here..."
                      className="w-full border border-gray-300 rounded p-3 text-sm focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">For Editor Only (Confidential)</label>
                    <textarea 
                      rows={3}
                      value={commentsForEditor}
                      onChange={e => setCommentsForEditor(e.target.value)}
                      placeholder="Enter private remarks for the editorial team..."
                      className="w-full border border-gray-300 rounded p-3 text-sm focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]"
                    ></textarea>
                  </div>
                  
                  {/* Upload Reviewer Attachment Option */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Upload Annotated File (Optional)</label>
                    <p className="text-xs text-gray-500 mb-2">You may upload an annotated version of the manuscript.</p>
                    <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>

              <div className="flex justify-end pt-4 border-t">
                <button onClick={handleNext} className="bg-[#0d0d1a] text-white px-6 py-2 rounded font-semibold hover:bg-[#1a1a2e]">
                  Save and Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Completion */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Step 4. Completion</h2>
              
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
                <label className="block text-sm font-semibold mb-3 text-gray-800">Recommendation *</label>
                <select 
                  value={recommendation}
                  onChange={e => setRecommendation(e.target.value)}
                  className="w-full border border-gray-300 rounded p-3 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] bg-white"
                >
                  <option value="" disabled>Choose one...</option>
                  <option value="accept">Accept Submission</option>
                  <option value="revisions_required">Revisions Required</option>
                  <option value="resubmit">Resubmit for Review</option>
                  <option value="resubmit_elsewhere">Resubmit Elsewhere</option>
                  <option value="decline">Decline Submission</option>
                  <option value="see_comments">See Comments</option>
                </select>
              </div>

              <div className="flex justify-end pt-6 space-x-4">
                <button onClick={() => setStep(3)} className="text-gray-600 font-semibold px-4 py-2 hover:bg-gray-100 rounded">Go Back</button>
                <button disabled={!recommendation} className="bg-green-600 text-white px-8 py-2 rounded font-bold disabled:opacity-50 hover:bg-green-700 shadow-sm">
                  Submit Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
