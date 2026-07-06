"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CandidateTakeExam() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for answers
  const [mcqAnswer, setMcqAnswer] = useState<string>("");
  const [essayAnswer, setEssayAnswer] = useState<string>("");
  
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
          
          if (data.answer_data && data.answer_data.mcq1_answer) {
            setMcqAnswer(data.answer_data.mcq1_answer);
            setEssayAnswer(data.answer_data.essay1_answer);
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

  const handleSubmitAnswers = async () => {
    if (!mcqAnswer || !essayAnswer.trim()) {
      alert("Harap jawab semua soal sebelum submit.");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin submit? Jawaban tidak bisa diubah lagi!")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'SUBMITTED',
          answer_data: { 
            mcq1_answer: mcqAnswer, 
            essay1_answer: essayAnswer 
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        alert("Jawaban berhasil dikirim! Asesor akan segera memeriksanya.");
      }
    } catch (e) {
      alert("Gagal mengirim jawaban.");
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

            <div style={{ marginBottom: '32px' }}>
              <h3 className="font-bold text-lg text-white border-b border-gray-800" style={{ marginBottom: '16px', paddingBottom: '8px' }}>Soal 1: Multiple Choice</h3>
              <p className="text-gray-300 text-lg" style={{ marginBottom: '16px' }}>{sessionData.exam_data.mcq1.q}</p>
              
              <div className="flex flex-col" style={{ gap: '12px' }}>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <label key={opt} className={`flex items-center rounded-lg border cursor-pointer transition-colors ${
                    mcqAnswer === opt.toUpperCase() 
                    ? 'border-[#c9a84c] bg-[#c9a84c]/10' 
                    : 'border-gray-800 bg-[#151522] hover:border-gray-600'
                  }`} style={{ padding: '16px' }}>
                    <input 
                      type="radio" 
                      name="mcq" 
                      value={opt.toUpperCase()}
                      checked={mcqAnswer === opt.toUpperCase()}
                      onChange={(e) => setMcqAnswer(e.target.value)}
                      className="w-5 h-5 text-[#c9a84c] border-gray-600 focus:ring-[#c9a84c] focus:ring-offset-[#151522]"
                    />
                    <span className="font-semibold text-[#c9a84c] uppercase w-6" style={{ marginLeft: '12px' }}>{opt}.</span>
                    <span className="text-gray-300">{sessionData.exam_data.mcq1[opt]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 className="font-bold text-lg text-white border-b border-gray-800" style={{ marginBottom: '16px', paddingBottom: '8px' }}>Soal 2: Essay / Kasus</h3>
              <p className="text-gray-300 text-lg italic leading-relaxed" style={{ marginBottom: '16px' }}>{sessionData.exam_data.essay1}</p>
              
              <textarea 
                rows={8}
                placeholder="Ketik jawaban lengkap Anda di sini..."
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                className="w-full bg-[#05050a] border border-gray-700 rounded-lg text-white leading-relaxed focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]"
                style={{ padding: '16px' }}
              ></textarea>
            </div>

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
