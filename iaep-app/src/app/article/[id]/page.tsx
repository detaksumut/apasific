"use client";

import Link from "next/link";
import { useState } from "react";

export default function ArticlePaywall() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const article = {
    title: "The Impact of Artificial Intelligence on Regional Economic Policies in ASEAN",
    author: "Dr. Budi Santoso, M.Sc",
    journal: "Riau Journal of Review Audit & Keuangan Perusahaan (RJRAKP)",
    date: "July 2026",
    abstract: "This paper examines the transformative effects of Artificial Intelligence (AI) integration within the economic sectors of ASEAN member states. As digital transformation accelerates globally, regional economic policies must adapt to leverage AI's potential while mitigating risks associated with automation and data privacy. Through a comparative analysis of policy frameworks across Singapore, Indonesia, and Malaysia, this study identifies key areas where AI can drive sustainable economic growth. The findings suggest that a unified, cross-border AI governance framework is essential for maintaining competitive advantage in the global market. Furthermore, the paper proposes a set of actionable recommendations for policymakers to foster innovation ecosystems that support AI-driven enterprises.",
    keywords: ["Artificial Intelligence", "ASEAN Economy", "Economic Policy", "Digital Transformation", "Regional Development"],
    price: 50000
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      setHasPaid(true);
      alert("Payment Successful! Rp 50.000 has been transferred to APASIFIC. The author will receive their royalty. You can now download the full PDF.");
    }, 2000);
  };

  return (
    <div className="min-h-screen text-[#e8e8f0] font-sans pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center text-[#c9a84c] hover:text-[#e8c97a] mb-8 font-bold transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Journal Collection
        </Link>

        {/* Article Header */}
        <div className="mb-10">
          <div className="inline-block px-3 py-1 bg-[#1a1a2e] text-[#c9a84c] rounded-full text-xs font-bold mb-4 border border-[#c9a84c]/30">
            {article.journal} • {article.date}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel'] mb-6 leading-tight text-white">
            {article.title}
          </h1>
          <div className="flex items-center text-lg text-gray-400">
            <span className="font-bold text-gray-200">{article.author}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Abstract */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-[#0d0d1a] rounded-2xl p-8 border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-bold text-[#c9a84c] mb-4">Abstract</h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {article.abstract}
              </p>
              
              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map(kw => (
                    <span key={kw} className="px-3 py-1 bg-[#1a1a2e] text-gray-300 text-sm rounded border border-gray-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </section>
            
            {/* Blurred Content Teaser */}
            <section className="relative rounded-2xl p-8 border border-gray-800 overflow-hidden bg-[#0d0d1a]">
              <div className="blur-sm opacity-50 select-none">
                <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
                <p className="mb-4">The rapid advancement of artificial intelligence technologies has fundamentally altered the landscape of global economics. In the context of the Association of Southeast Asian Nations (ASEAN)...</p>
                <p>Furthermore, early adopters of AI-driven analytics have reported significant gains in operational efficiency. This paper seeks to quantify these gains across multiple sectors...</p>
              </div>
              
              {/* Paywall Overlay */}
              {!hasPaid && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#05050a] via-[#05050a]/80 to-transparent">
                  <div className="bg-[#12121f] p-8 rounded-2xl border border-[#c9a84c]/30 text-center shadow-2xl max-w-md mx-auto mt-20">
                    <svg className="w-12 h-12 text-[#c9a84c] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">Read Full Article</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Purchase this article to unlock the full text PDF. The revenue directly supports the author and APASIFIC.
                    </p>
                    <button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-[#c9a84c] text-black font-bold py-3 rounded-lg hover:bg-[#e8c97a] transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                    >
                      {isProcessing ? (
                        "Processing Secure Payment..."
                      ) : (
                        `Purchase Article (Rp ${article.price.toLocaleString('id-ID')})`
                      )}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Secure APASIFIC Gateway
                    </div>
                  </div>
                </div>
              )}
              
              {hasPaid && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05050a]/90 backdrop-blur-sm">
                  <div className="bg-green-900/20 p-8 rounded-2xl border border-green-500/30 text-center shadow-2xl max-w-md mx-auto">
                    <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-white mb-2">Access Granted</h3>
                    <p className="text-green-200 text-sm mb-6">
                      Thank you for your purchase. The author has been credited.
                    </p>
                    <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Full PDF
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Metrics & Citation */}
          <div className="space-y-6">
            <div className="bg-[#0d0d1a] rounded-xl p-6 border border-gray-800">
              <h3 className="text-[#c9a84c] font-bold mb-4 uppercase text-sm tracking-widest">Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                  <span className="text-gray-400">Views</span>
                  <span className="font-bold text-white">1,245</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                  <span className="text-gray-400">Downloads</span>
                  <span className="font-bold text-white">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Citations</span>
                  <span className="font-bold text-white">12</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#c9a84c]/20">
              <h3 className="text-white font-bold mb-2 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Author Royalty Program
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                APASIFIC directly rewards authors for their scholarly contributions. A percentage of every purchase goes straight to the author's designated bank account.
              </p>
              <div className="text-xs font-bold text-[#c9a84c] uppercase tracking-wide">Support Academic Excellence</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
