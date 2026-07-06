"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AssessorPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for DRAFT
  const [mcq1, setMcq1] = useState({ q: "", a: "", b: "", c: "", d: "", correct: "A" });
  const [essay1, setEssay1] = useState("");

  // States for Grading
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    // Check auth
    const authData = localStorage.getItem(`exam_auth_${sessionId}`);
    if (!authData) {
      router.push(`/exam/${sessionId}`);
      return;
    }
    const { role } = JSON.parse(authData);
    if (role !== 'assessor') {
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
          
          if (data.exam_data && data.exam_data.mcq1) {
            setMcq1(data.exam_data.mcq1);
            setEssay1(data.exam_data.essay1);
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

  const handleReleaseExam = async () => {
    try {
      const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'READY',
          exam_data: { mcq1, essay1 }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        alert("Soal berhasil dirilis! Peserta sekarang dapat mengerjakannya.");
      }
    } catch (e) {
      alert("Gagal merilis soal.");
    }
  };

  const handleSubmitGrade = async () => {
    try {
      const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'COMPLETED',
          score: score
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        alert("Penilaian selesai dan disimpan!");
      }
    } catch (e) {
      alert("Gagal menyimpan nilai.");
    }
  };

  if (loading || !sessionData) return <div className="p-8 text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#05050a] text-gray-200" style={{ padding: '32px' }}>
      <div className="mx-auto" style={{ maxWidth: '896px' }}>
        <div className="flex justify-between items-center border-b border-gray-800" style={{ marginBottom: '32px', paddingBottom: '16px' }}>
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#c9a84c]">Panel Asesor (Pembuat Soal)</h1>
            <p className="text-gray-400" style={{ marginTop: '4px' }}>Sertifikasi: {sessionData.certification_field}</p>
          </div>
          <div className="text-right">
            <span className={`text-xs rounded-full border ${
              sessionData.status === 'DRAFT' ? 'bg-gray-800 text-gray-300 border-gray-700' :
              sessionData.status === 'READY' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900' :
              sessionData.status === 'SUBMITTED' ? 'bg-blue-900/30 text-blue-400 border-blue-900' :
              'bg-green-900/30 text-green-400 border-green-900'
            }`} style={{ padding: '4px 12px' }}>
              STATUS: {sessionData.status}
            </span>
            <button onClick={() => {
              localStorage.removeItem(`exam_auth_${sessionId}`);
              router.push(`/exam/${sessionId}`);
            }} className="block text-xs text-red-500 hover:underline" style={{ marginTop: '8px' }}>Keluar</button>
          </div>
        </div>

        {sessionData.status === 'DRAFT' && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-xl shadow-xl" style={{ padding: '24px' }}>
            <h2 className="text-xl font-bold text-white" style={{ marginBottom: '24px' }}>Tahap 1: Buat Soal Ujian</h2>
            
            <div className="border border-gray-800 rounded bg-[#151522]" style={{ padding: '16px', marginBottom: '32px' }}>
              <h3 className="font-semibold text-[#e8c97a]" style={{ marginBottom: '16px' }}>Soal Multiple Choice</h3>
              <div className="flex flex-col" style={{ gap: '16px' }}>
                <input type="text" placeholder="Pertanyaan..." value={mcq1.q} onChange={e => setMcq1({...mcq1, q: e.target.value})} className="w-full bg-[#05050a] border border-gray-700 rounded text-white" style={{ padding: '12px' }} />
                <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                  <input type="text" placeholder="Opsi A" value={mcq1.a} onChange={e => setMcq1({...mcq1, a: e.target.value})} className="bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '8px' }} />
                  <input type="text" placeholder="Opsi B" value={mcq1.b} onChange={e => setMcq1({...mcq1, b: e.target.value})} className="bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '8px' }} />
                  <input type="text" placeholder="Opsi C" value={mcq1.c} onChange={e => setMcq1({...mcq1, c: e.target.value})} className="bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '8px' }} />
                  <input type="text" placeholder="Opsi D" value={mcq1.d} onChange={e => setMcq1({...mcq1, d: e.target.value})} className="bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '8px' }} />
                </div>
                <div>
                  <label className="text-sm text-gray-400" style={{ marginRight: '8px' }}>Jawaban Benar:</label>
                  <select value={mcq1.correct} onChange={e => setMcq1({...mcq1, correct: e.target.value})} className="bg-[#05050a] border border-gray-700 rounded text-white text-sm" style={{ padding: '8px' }}>
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-gray-800 rounded bg-[#151522]" style={{ padding: '16px', marginBottom: '32px' }}>
              <h3 className="font-semibold text-[#e8c97a]" style={{ marginBottom: '16px' }}>Soal Essay / Kasus</h3>
              <textarea placeholder="Tulis studi kasus atau soal essay di sini..." value={essay1} onChange={e => setEssay1(e.target.value)} rows={5} className="w-full bg-[#05050a] border border-gray-700 rounded text-white" style={{ padding: '12px' }}></textarea>
            </div>

            <button onClick={handleReleaseExam} className="w-full bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold rounded-lg shadow-[0_0_15px_rgba(201,168,76,0.3)]" style={{ padding: '12px' }}>
              Simpan & Rilis Soal Ujian
            </button>
          </div>
        )}

        {sessionData.status === 'READY' && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-xl text-center shadow-xl" style={{ padding: '48px' }}>
            <svg className="w-16 h-16 text-yellow-500 mx-auto" style={{ marginBottom: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-white" style={{ marginBottom: '8px' }}>Menunggu Peserta</h2>
            <p className="text-gray-400">Soal telah dirilis. Peserta saat ini bisa mengerjakan ujian. Anda akan menerima notifikasi jika peserta telah mensubmit jawabannya.</p>
          </div>
        )}

        {sessionData.status === 'SUBMITTED' && (
          <div className="bg-[#0d0d1a] border border-blue-900/50 rounded-xl shadow-[0_0_30px_rgba(0,100,255,0.1)]" style={{ padding: '24px' }}>
            <h2 className="text-xl font-bold text-white" style={{ marginBottom: '24px' }}>Tahap 3: Periksa & Berikan Nilai</h2>
            
            <div className="border border-gray-800 rounded bg-[#151522]" style={{ padding: '16px', marginBottom: '24px' }}>
              <h3 className="font-semibold text-gray-400 text-sm" style={{ marginBottom: '8px' }}>Jawaban Multiple Choice</h3>
              <p className="text-white">Soal: {sessionData.exam_data?.mcq1?.q}</p>
              <p className="text-[#e8c97a]" style={{ marginTop: '8px' }}>Jawaban Benar Asesor: {sessionData.exam_data?.mcq1?.correct}</p>
              <p className="font-bold text-blue-400" style={{ marginTop: '4px' }}>Jawaban Peserta: {sessionData.answer_data?.mcq1_answer}</p>
            </div>

            <div className="border border-gray-800 rounded bg-[#151522]" style={{ padding: '16px', marginBottom: '24px' }}>
              <h3 className="font-semibold text-gray-400 text-sm" style={{ marginBottom: '8px' }}>Jawaban Essay</h3>
              <p className="text-white italic" style={{ marginBottom: '16px' }}>Soal: {sessionData.exam_data?.essay1}</p>
              <div className="bg-[#05050a] rounded border border-gray-700 text-gray-200" style={{ padding: '16px' }}>
                {sessionData.answer_data?.essay1_answer || "Tidak ada jawaban"}
              </div>
            </div>

            <div className="flex items-center" style={{ gap: '16px', marginBottom: '24px' }}>
              <label className="text-white font-bold">Beri Nilai Total (0-100):</label>
              <input type="number" min="0" max="100" value={score} onChange={e => setScore(Number(e.target.value))} className="bg-[#05050a] border border-[#c9a84c] text-[#c9a84c] rounded font-bold text-center w-24 text-xl" style={{ padding: '8px' }} />
            </div>

            <button onClick={handleSubmitGrade} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(0,100,255,0.3)]" style={{ padding: '12px' }}>
              Selesai Pemeriksaan & Simpan Nilai
            </button>
          </div>
        )}

        {sessionData.status === 'COMPLETED' && (
          <div className="bg-[#0d0d1a] border border-green-900/50 rounded-xl text-center shadow-[0_0_30px_rgba(0,255,100,0.1)]" style={{ padding: '48px' }}>
            <svg className="w-16 h-16 text-green-500 mx-auto" style={{ marginBottom: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white" style={{ marginBottom: '8px' }}>Penilaian Selesai</h2>
            <p className="text-gray-400" style={{ marginBottom: '24px' }}>Anda telah memberikan nilai akhir untuk peserta ini.</p>
            <div className="inline-block bg-green-900/30 border border-green-900 rounded-2xl" style={{ padding: '24px' }}>
              <div className="text-sm text-green-500 uppercase tracking-widest font-bold" style={{ marginBottom: '4px' }}>Skor Akhir</div>
              <div className="text-5xl font-bold text-white">{sessionData.score}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
