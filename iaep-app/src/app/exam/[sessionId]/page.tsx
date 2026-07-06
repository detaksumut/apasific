"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ExamPortal() {
  const { sessionId } = useParams();
  const router = useRouter();
  
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);

  // Fetch session meta info to know if it's valid
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`/api/certifications/exam/sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSessionData(data);
        } else {
          setErrorMsg("Ruang ujian tidak ditemukan atau URL tidak valid.");
        }
      } catch (e) {
        setErrorMsg("Koneksi error.");
      }
    }
    if (sessionId) {
      checkSession();
    }
  }, [sessionId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: accessCode })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Store the token/role in localStorage for simple auth in this prototype
        localStorage.setItem(`exam_auth_${sessionId}`, JSON.stringify({
          role: data.role,
          access_code: accessCode
        }));
        
        if (data.role === 'assessor') {
          router.push(`/exam/${sessionId}/assessor`);
        } else if (data.role === 'candidate') {
          router.push(`/exam/${sessionId}/take`);
        }
      } else {
        setErrorMsg(data.error || "Kode Akses salah.");
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  if (errorMsg && !sessionData) {
    return (
      <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center p-4">
        <div className="bg-[#0d0d1a] border border-red-900/50 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(255,0,0,0.1)]">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-xl font-bold text-white mb-2">Akses Ditolak</h1>
          <p className="text-gray-400">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c9a84c]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0d0d1a]/80 backdrop-blur-xl border border-[#c9a84c]/20 p-8 rounded-2xl shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
            <svg className="w-8 h-8 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#c9a84c] tracking-wide uppercase">ASIACERT Exam Portal</h1>
          <p className="text-gray-400 text-sm mt-2">
            {sessionData ? `Sertifikasi: ${sessionData.certification_field}` : "Memuat data ujian..."}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">Kode Akses Ujian</label>
            <input 
              type="text" 
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode unik..." 
              className="w-full bg-[#05050a] border border-gray-700 text-white font-mono text-center text-lg focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] rounded-xl px-4 py-3 transition-all"
              required
            />
          </div>

          {errorMsg && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/50">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !sessionData}
            className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold uppercase tracking-wider py-3 rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memverifikasi..." : "Masuk ke Ruang Ujian"}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-500">
            Sistem otomatis mendeteksi peran (Asesor / Peserta) berdasarkan kode akses yang Anda gunakan.
          </p>
        </div>
      </div>
    </div>
  );
}
