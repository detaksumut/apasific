"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CandidateTakeExam() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic States for answers
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check auth
    const authData = localStorage.getItem(`exam_auth_${sessionId}`);
    if (!authData) {
      router.push(`/exam/${sessionId}`);
      return;
    }
    const { role } = JSON.parse(authData);
    if (role !== 'candidate') {
      alert("Unauthorized role");
      router.push(`/exam/${sessionId}`);
      return;
    }

    // Fetch data
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/data`);
        if (res.ok) {
          const data = await res.json();
          setSessionData(data);
          
          if (data.answer_data) {
            setMcqAnswers(data.answer_data.mcqs || {});
            setEssayAnswers(data.answer_data.essays || {});
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, router]);

  const updateMcqAnswer = (id: string, value: string) => {
    setMcqAnswers(prev => ({ ...prev, [id]: value }));
  };

  const updateEssayAnswer = (id: string, value: string) => {
    setEssayAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmitAnswers = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'SUBMITTED',
          answer_data: { 
            mcqs: mcqAnswers, 
            essays: essayAnswers 
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        alert("Jawaban berhasil dikirim! Asesor akan segera memeriksanya.");
      } else {
        const errData = await res.json();
        alert("Server Error: " + (errData.error || "Gagal menyimpan ke database."));
      }
    } catch (e: any) {
      alert("Gagal mengirim jawaban (Koneksi Terputus). Cek console log.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !sessionData) return <div className="p-8 text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#05050a] text-gray-200" style={{ padding: '32px' }}>
      <div className="mx-auto" style={{ maxWidth: '896px' }}>
        <div className="flex justify-between items-center border-b border-gray-800" style={{ marginBottom: '32px', paddingBottom: '16px' }}>
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#c9a84c]">Ruang Ujian: Peserta</h1>
            <p className="text-gray-400" style={{ marginTop: '4px' }}>Sertifikasi: {sessionData.certification_field}</p>
          </div>
          <div className="text-right">
            <span className={`text-xs rounded-full border ${
              sessionData.status === 'READY' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900' :
              sessionData.status === 'SUBMITTED' ? 'bg-blue-900/30 text-blue-400 border-blue-900' :
              'bg-green-900/30 text-green-400 border-green-900'
            }`} style={{ padding: '4px 12px' }}>
              STATUS: {sessionData.status === 'READY' ? 'ONGOING' : sessionData.status}
            </span>
            <button onClick={() => {
              localStorage.removeItem(`exam_auth_${sessionId}`);
              router.push(`/exam/${sessionId}`);
            }} className="block text-xs text-red-500 hover:underline" style={{ marginTop: '8px' }}>Keluar</button>
          </div>
        </div>

        {/* Global Interview Notification Banner */}
        {sessionData.exam_data?.interviewLink && (
          <div className="bg-[#1a1510] border border-[#c9a84c] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between" style={{ padding: '24px', marginBottom: '32px' }}>
            <div className="flex items-start" style={{ gap: '16px', marginBottom: '16px' }}>
              <div className="bg-[#c9a84c]/20 p-3 rounded-full text-[#c9a84c]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#c9a84c]" style={{ marginBottom: '4px' }}>Wawancara Online Dijadwalkan</h3>
                <p className="text-gray-300">Waktu: <span className="font-bold text-white">{sessionData.exam_data.interviewTime || 'Belum ditentukan'}</span></p>
                <p className="text-sm text-gray-500 mt-1">Harap standby di ruang wawancara pada waktu yang ditentukan.</p>
              </div>
            </div>
            <div>
              <a href={sessionData.exam_data.interviewLink} target="_blank" rel="noopener noreferrer" className="bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold rounded-lg shadow-lg w-full md:w-auto text-center" style={{ padding: '12px 24px', display: 'inline-block' }}>
                Masuk Ruang Google Meet
              </a>
            </div>
          </div>
        )}

        {sessionData.status === 'READY' && sessionData.exam_data && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-xl shadow-xl" style={{ padding: '24px' }}>
            
            <div className="bg-red-900/20 text-red-400 rounded-lg border border-red-900/50 flex items-start" style={{ padding: '16px', marginBottom: '32px', gap: '16px' }}>
              <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-bold">Perhatian</h4>
                <p className="text-sm">Anda tidak dapat mengubah jawaban setelah menekan tombol submit. Waktu Anda dicatat oleh sistem.</p>
              </div>
            </div>

            {/* MCQ List */}
            {sessionData.exam_data.mcqs && sessionData.exam_data.mcqs.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3 className="font-bold text-xl text-[#e8c97a] border-b border-gray-800" style={{ marginBottom: '24px', paddingBottom: '8px' }}>Bagian I: Pilihan Ganda</h3>
                
                {sessionData.exam_data.mcqs.map((mcq: any, index: number) => (
                  <div key={mcq.id} style={{ marginBottom: '32px' }}>
                    <div className="flex items-start" style={{ gap: '12px', marginBottom: '16px' }}>
                      <span className="font-bold text-gray-500">{index + 1}.</span>
                      <p className="text-gray-200 text-lg">{mcq.q}</p>
                    </div>
                    
                    <div className="flex flex-col pl-6" style={{ gap: '12px' }}>
                      {['a', 'b', 'c', 'd'].map(opt => (
                        <label key={opt} className={`flex items-center rounded-lg border cursor-pointer transition-colors ${
                          mcqAnswers[mcq.id] === opt.toUpperCase() 
                          ? 'border-[#c9a84c] bg-[#c9a84c]/10' 
                          : 'border-gray-800 bg-[#151522] hover:border-gray-600'
                        }`} style={{ padding: '16px' }}>
                          <input 
                            type="radio" 
                            name={`mcq_${mcq.id}`} 
                            value={opt.toUpperCase()}
                            checked={mcqAnswers[mcq.id] === opt.toUpperCase()}
                            onChange={(e) => updateMcqAnswer(mcq.id, e.target.value)}
                            className="w-5 h-5 text-[#c9a84c] border-gray-600 focus:ring-[#c9a84c] focus:ring-offset-[#151522]"
                          />
                          <span className="font-semibold text-[#c9a84c] uppercase w-6" style={{ marginLeft: '12px' }}>{opt}.</span>
                          <span className="text-gray-300">{mcq[opt]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Essay List */}
            {sessionData.exam_data.essays && sessionData.exam_data.essays.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3 className="font-bold text-xl text-[#e8c97a] border-b border-gray-800" style={{ marginBottom: '24px', paddingBottom: '8px' }}>Bagian II: Essay / Kasus</h3>
                
                {sessionData.exam_data.essays.map((essay: any, index: number) => (
                  <div key={essay.id} style={{ marginBottom: '32px' }}>
                    <div className="flex items-start" style={{ gap: '12px', marginBottom: '16px' }}>
                      <span className="font-bold text-gray-500">{index + 1}.</span>
                      <p className="text-gray-300 text-lg italic leading-relaxed">{essay.q}</p>
                    </div>
                    
                    <div className="pl-6">
                      <textarea 
                        rows={6}
                        placeholder="Ketik jawaban lengkap Anda di sini..."
                        value={essayAnswers[essay.id] || ""}
                        onChange={(e) => updateEssayAnswer(essay.id, e.target.value)}
                        className="w-full bg-[#05050a] border border-gray-700 rounded-lg text-white leading-relaxed focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]"
                        style={{ padding: '16px' }}
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleSubmitAnswers} 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ padding: '16px' }}
            >
              {isSubmitting ? "Mengirim Jawaban..." : "Submit Seluruh Jawaban"}
            </button>
          </div>
        )}

        {(sessionData.status === 'SUBMITTED' || sessionData.status === 'COMPLETED') && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-xl text-center shadow-xl" style={{ padding: '48px' }}>
            <svg className="w-20 h-20 text-[#c9a84c] mx-auto" style={{ marginBottom: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-2xl font-bold font-serif text-white" style={{ marginBottom: '8px' }}>Ujian Selesai!</h2>
            <p className="text-gray-400 mx-auto" style={{ maxWidth: '32rem' }}>
              {sessionData.status === 'SUBMITTED' 
                ? "Jawaban Anda telah terekam di sistem dan sedang dalam tahap pemeriksaan (grading) oleh asesor Anda. Silakan hubungi admin untuk informasi lebih lanjut." 
                : "Ujian Anda telah selesai diperiksa oleh asesor."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
