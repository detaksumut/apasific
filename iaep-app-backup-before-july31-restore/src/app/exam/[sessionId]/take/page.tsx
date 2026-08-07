"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CandidateTakeExam() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Answer states
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sprint 4: Countdown timer (server-driven: exam_data.timeLimit in minutes)
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const accessCodeRef = useRef<string>("");

  // Memoized submit handler so it can be called from timer
  const handleSubmitAnswers = useCallback(async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      if (!confirm("Apakah Anda yakin ingin mengumpulkan semua jawaban? Tindakan ini tidak dapat dibatalkan.")) return;
    }

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": accessCodeRef.current
        },
        body: JSON.stringify({
          status: 'SUBMITTED',
          answer_data: { mcqs: mcqAnswers, essays: essayAnswers }
          // access_locked set automatically by server when status = SUBMITTED
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        if (isAutoSubmit) alert("Waktu ujian habis! Jawaban Anda telah dikumpulkan secara otomatis.");
      } else {
        const errData = await res.json();
        alert("Server Error: " + (errData.error || "Gagal menyimpan ke database."));
      }
    } catch (e: any) {
      alert("Gagal mengirim jawaban (Koneksi Terputus).");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, mcqAnswers, essayAnswers]);

  useEffect(() => {
    // Check auth
    const authData = localStorage.getItem(`exam_auth_${sessionId}`);
    if (!authData) { router.push(`/exam/${sessionId}`); return; }
    const { role, access_code } = JSON.parse(authData);
    if (role !== 'candidate') {
      alert("Unauthorized role");
      router.push(`/exam/${sessionId}`);
      return;
    }
    accessCodeRef.current = access_code;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
          headers: { "x-access-code": access_code }
        });
        if (res.status === 403) {
          const errData = await res.json();
          if (errData.locked) { setSessionData({ status: "LOCKED" }); setLoading(false); return; }
        }
        if (res.ok) {
          const data = await res.json();
          setSessionData(data);
          if (data.answer_data) {
            setMcqAnswers(data.answer_data.mcqs || {});
            setEssayAnswers(data.answer_data.essays || {});
          }

          // Sprint 4: Start IN_PROGRESS transition + timer
          if (data.status === 'READY' && data.exam_data?.timeLimit) {
            // Notify server: candidate started exam
            await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", "x-access-code": access_code },
              body: JSON.stringify({ status: 'IN_PROGRESS' })
            });
            // Start countdown (server timeLimit in minutes)
            const totalSeconds = data.exam_data.timeLimit * 60;
            setTimeLeft(totalSeconds);
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

  // Sprint 4: Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitAnswers(true); // auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft === null ? null : "started", handleSubmitAnswers]);

  const updateMcqAnswer = (id: string, value: string) =>
    setMcqAnswers(prev => ({ ...prev, [id]: value }));

  const updateEssayAnswer = (id: string, value: string) =>
    setEssayAnswers(prev => ({ ...prev, [id]: value }));

  // Timer display helper
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const isUrgent = timeLeft !== null && timeLeft < 300; // < 5 minutes

  if (loading) return <div className="p-8 text-white text-center">Loading...</div>;

  // LOCKED state
  if (!sessionData || sessionData.status === "LOCKED") {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
        <div className="bg-[#0d0d1a] border border-red-900/50 rounded-2xl p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(255,0,0,0.08)]">
          <div className="w-16 h-16 bg-red-900/20 border border-red-900/50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-3">Ujian Telah Dikunci</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Jawaban Anda telah berhasil dikirim dan sesi ujian ini sudah dikunci secara permanen.
            Anda tidak dapat mengakses atau mengubah jawaban lagi.
          </p>
          <p className="text-gray-500 text-xs mt-4">
            Silakan hubungi panitia sertifikasi untuk informasi hasil ujian Anda.
          </p>
        </div>
      </div>
    );
  }

  // SUBMITTED / post-exam states
  if (['SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT_COMPLETED', 'CERTIFIED', 'FAILED'].includes(sessionData.status)) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
        <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-12 max-w-lg w-full text-center shadow-xl">
          {sessionData.status === 'CERTIFIED' ? (
            <>
              <div className="w-20 h-20 bg-green-900/20 border border-green-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-serif text-green-400 mb-3">Selamat, Anda Tersertifikasi!</h2>
              <p className="text-gray-400 text-sm">Sertifikat kompetensi Anda sedang dalam proses penerbitan. Admin akan menghubungi Anda segera.</p>
            </>
          ) : sessionData.status === 'FAILED' ? (
            <>
              <div className="w-20 h-20 bg-red-900/20 border border-red-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-serif text-red-400 mb-3">Hasil Ujian: Tidak Lulus</h2>
              <p className="text-gray-400 text-sm">Terima kasih atas partisipasi Anda. Silakan hubungi admin APASIFIC untuk informasi lebih lanjut terkait proses re-certification.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-serif text-white mb-3">Ujian Selesai!</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                {sessionData.status === 'SUBMITTED'
                  ? "Jawaban Anda telah terekam. Asesor akan segera memulai proses penilaian."
                  : sessionData.status === 'UNDER_REVIEW'
                  ? "Jawaban Anda sedang dalam proses penilaian oleh Asesor. Mohon tunggu."
                  : "Penilaian selesai. Admin APASIFIC sedang memproses keputusan sertifikasi Anda."}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
                {sessionData.status === 'SUBMITTED' ? 'Menunggu Penilaian' : sessionData.status === 'UNDER_REVIEW' ? 'Sedang Dinilai' : 'Penilaian Selesai'}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-gray-200" style={{ padding: '32px' }}>
      <div className="mx-auto" style={{ maxWidth: '896px' }}>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 mb-8 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#c9a84c]">Ruang Ujian: Peserta</h1>
            <p className="text-gray-400 mt-1">Sertifikasi: {sessionData.certification_field}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            {/* Sprint 4: Countdown Timer */}
            {timeLeft !== null && timeLeft > 0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg transition-colors ${
                isUrgent
                  ? 'bg-red-900/30 border-red-700 text-red-400 animate-pulse'
                  : 'bg-[#151522] border-gray-700 text-[#c9a84c]'
              }`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(timeLeft)}
              </div>
            )}
            <span className={`text-xs rounded-full border px-3 py-1 ${
              sessionData.status === 'READY' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900' :
              sessionData.status === 'IN_PROGRESS' ? 'bg-blue-900/30 text-blue-400 border-blue-900' :
              'bg-green-900/30 text-green-400 border-green-900'
            }`}>
              {sessionData.status === 'READY' ? 'MEMULAI...' : sessionData.status === 'IN_PROGRESS' ? 'BERLANGSUNG' : sessionData.status}
            </span>
            <button onClick={() => {
              localStorage.removeItem(`exam_auth_${sessionId}`);
              router.push(`/exam/${sessionId}`);
            }} className="text-xs text-red-500 hover:underline">Keluar</button>
          </div>
        </div>

        {/* Interview Notification */}
        {sessionData.exam_data?.interviewLink && (
          <div className="bg-[#1a1510] border border-[#c9a84c] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between p-6 mb-8 gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-[#c9a84c]/20 p-3 rounded-full text-[#c9a84c] flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[#c9a84c] mb-1">Wawancara Online Dijadwalkan</h3>
                <p className="text-gray-300 text-sm">Waktu: <span className="font-bold text-white">{sessionData.exam_data.interviewTime || 'Belum ditentukan'}</span></p>
              </div>
            </div>
            <a href={sessionData.exam_data.interviewLink} target="_blank" rel="noopener noreferrer"
              className="bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold rounded-lg px-6 py-3 text-sm flex-shrink-0">
              Masuk Google Meet
            </a>
          </div>
        )}

        {/* Exam Content */}
        {(sessionData.status === 'READY' || sessionData.status === 'IN_PROGRESS') && sessionData.exam_data && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-xl shadow-xl p-6">

            {/* Warning */}
            <div className="bg-red-900/20 text-red-400 rounded-lg border border-red-900/50 flex items-start gap-4 p-4 mb-8">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-bold text-sm">Perhatian</h4>
                <p className="text-sm mt-0.5">Anda tidak dapat mengubah jawaban setelah menekan tombol submit. Waktu Anda dicatat oleh sistem.</p>
              </div>
            </div>

            {/* MCQ */}
            {sessionData.exam_data.mcqs?.length > 0 && (
              <div className="mb-10">
                <h3 className="font-bold text-xl text-[#e8c97a] border-b border-gray-800 mb-6 pb-2">Bagian I: Pilihan Ganda</h3>
                {sessionData.exam_data.mcqs.map((mcq: any, index: number) => (
                  <div key={mcq.id} className="mb-8">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="font-bold text-gray-500 mt-1">{index + 1}.</span>
                      <p className="text-gray-200 text-lg">{mcq.q}</p>
                    </div>
                    <div className="flex flex-col pl-6 gap-3">
                      {['a', 'b', 'c', 'd'].map(opt => (
                        <label key={opt} className={`flex items-center rounded-lg border cursor-pointer transition-colors p-4 ${
                          mcqAnswers[mcq.id] === opt.toUpperCase()
                            ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                            : 'border-gray-800 bg-[#151522] hover:border-gray-600'
                        }`}>
                          <input type="radio" name={`mcq_${mcq.id}`} value={opt.toUpperCase()}
                            checked={mcqAnswers[mcq.id] === opt.toUpperCase()}
                            onChange={(e) => updateMcqAnswer(mcq.id, e.target.value)}
                            className="w-4 h-4 text-[#c9a84c]" />
                          <span className="font-semibold text-[#c9a84c] uppercase w-6 ml-3">{opt}.</span>
                          <span className="text-gray-300">{mcq[opt]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Essay */}
            {sessionData.exam_data.essays?.length > 0 && (
              <div className="mb-10">
                <h3 className="font-bold text-xl text-[#e8c97a] border-b border-gray-800 mb-6 pb-2">Bagian II: Essay / Kasus</h3>
                {sessionData.exam_data.essays.map((essay: any, index: number) => (
                  <div key={essay.id} className="mb-8">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="font-bold text-gray-500 mt-1">{index + 1}.</span>
                      <p className="text-gray-300 text-lg italic leading-relaxed">{essay.q}</p>
                    </div>
                    <div className="pl-6">
                      <textarea rows={6} placeholder="Ketik jawaban lengkap Anda di sini..."
                        value={essayAnswers[essay.id] || ""}
                        onChange={(e) => updateEssayAnswer(essay.id, e.target.value)}
                        className="w-full bg-[#05050a] border border-gray-700 rounded-lg text-white leading-relaxed focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] p-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => handleSubmitAnswers(false)} disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 py-4">
              {isSubmitting ? "Mengirim Jawaban..." : "Submit Seluruh Jawaban"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
