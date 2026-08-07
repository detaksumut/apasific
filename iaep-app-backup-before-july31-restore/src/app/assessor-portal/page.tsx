"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AssessorPortalDeprecated() {
  const router = useRouter();

  // Auto-redirect after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/exam");
    }, 8000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0d0d1a]/90 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-10 shadow-2xl z-10 text-center">

        {/* Warning Icon */}
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Portal Lama — Deprecated
        </div>

        <h1 className="text-2xl font-bold font-serif text-white mb-3">
          Assessor Portal Telah Dipindahkan
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Portal Asesor lama (<code className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-xs">/assessor-portal</code>) 
          telah dimigrasi ke <strong className="text-white">Certification Exam Workspace</strong> yang baru.
          Sistem baru mendukung MCQ, Essay, dan Wawancara dalam satu platform terpadu.
        </p>

        {/* Info box */}
        <div className="bg-[#151522] border border-gray-800 rounded-xl p-5 mb-8 text-left space-y-3">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Cara Mengakses Sistem Baru</p>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <p className="text-gray-300 text-sm">Admin membuat <strong>Exam Room</strong> di halaman Certification Admin.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <p className="text-gray-300 text-sm">Admin mengirimkan <strong>Exam Room URL</strong> beserta <strong>Kode Asesor</strong> ke Anda.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <p className="text-gray-300 text-sm">Buka URL ujian dan masukkan Kode Asesor untuk mengakses Panel Asesor.</p>
          </div>
        </div>

        {/* Redirect indicator */}
        <p className="text-xs text-gray-600 mb-5">
          Anda akan diarahkan secara otomatis dalam beberapa detik...
        </p>

        <button
          onClick={() => router.push("/exam")}
          className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold uppercase tracking-wider py-3.5 rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5"
        >
          Menuju Certification Exam Workspace
        </button>
      </div>
    </div>
  );
}
