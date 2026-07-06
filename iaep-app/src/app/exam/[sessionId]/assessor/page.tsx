"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AssessorPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic States for DRAFT
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [essays, setEssays] = useState<any[]>([]);
  const [interviewLink, setInterviewLink] = useState("");
  const [interviewTime, setInterviewTime] = useState("");

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
          
          if (data.exam_data) {
            setMcqs(data.exam_data.mcqs || []);
            setEssays(data.exam_data.essays || []);
            setInterviewLink(data.exam_data.interviewLink || "");
            setInterviewTime(data.exam_data.interviewTime || "");
          } else {
            // Default empty state
            setMcqs([{ id: Date.now().toString(), q: "", a: "", b: "", c: "", d: "", correct: "A" }]);
            setEssays([{ id: (Date.now()+1).toString(), q: "" }]);
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

  // Dynamic Handlers
  const addMcq = () => {
    setMcqs([...mcqs, { id: Date.now().toString(), q: "", a: "", b: "", c: "", d: "", correct: "A" }]);
  };

  const removeMcq = (id: string) => {
    setMcqs(mcqs.filter(m => m.id !== id));
  };

  const updateMcq = (id: string, field: string, value: string) => {
    setMcqs(mcqs.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addEssay = () => {
    setEssays([...essays, { id: Date.now().toString(), q: "" }]);
  };

  const removeEssay = (id: string) => {
    setEssays(essays.filter(e => e.id !== id));
  };

  const updateEssay = (id: string, value: string) => {
    setEssays(essays.map(e => e.id === id ? { ...e, q: value } : e));
  };

  const handleReleaseExam = async () => {
    try {
      const res = await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'READY',
          exam_data: { mcqs, essays, interviewLink, interviewTime }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        alert("Soal berhasil dirilis! Peserta sekarang dapat mengerjakannya.");
      } else {
        const errData = await res.json();
        alert("Server Error: " + (errData.error || "Gagal menyimpan soal."));
      }
    } catch (e: any) {
      alert("Gagal merilis soal (Koneksi Terputus).");
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
      } else {
        const errData = await res.json();
        alert("Server Error: " + (errData.error || "Gagal menyimpan nilai."));
      }
    } catch (e: any) {
      alert("Gagal menyimpan nilai (Koneksi Terputus).");
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
            <h2 className="text-xl font-bold text-white" style={{ marginBottom: '24px' }}>Tahap 1: Buat Soal & Jadwal Ujian</h2>
            
            {/* Interview Section */}
            <div style={{ marginBottom: '40px', padding: '24px' }} className="bg-[#1a1510] border border-[#c9a84c]/30 rounded-xl">
              <h3 className="font-semibold text-lg text-[#c9a84c]" style={{ marginBottom: '16px' }}>
                <svg className="w-5 h-5 inline-block mr-2 -mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Jadwal Wawancara Online (Opsional)
              </h3>
              <p className="text-gray-400 text-sm" style={{ marginBottom: '16px' }}>Masukkan link Google Meet / Zoom dan waktunya. Kosongkan jika tidak ada wawancara.</p>
              
              <div className="flex flex-col md:flex-row" style={{ gap: '16px' }}>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-bold mb-1 block">Tanggal & Waktu</label>
                  <input type="text" placeholder="Contoh: 15 Juli 2026, 14:00 WIB" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="w-full bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '12px' }} />
                </div>
                <div className="flex-2 md:w-2/3">
                  <label className="text-xs text-gray-500 font-bold mb-1 block">Link Google Meet / Zoom</label>
                  <input type="url" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={interviewLink} onChange={e => setInterviewLink(e.target.value)} className="w-full bg-[#05050a] border border-gray-700 rounded text-sm text-blue-400" style={{ padding: '12px' }} />
                </div>
              </div>
            </div>

            {/* Multiple Choice Section */}
            <div style={{ marginBottom: '40px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h3 className="font-semibold text-lg text-[#e8c97a]">Bagian I: Pilihan Ganda</h3>
                <button onClick={addMcq} className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded" style={{ padding: '6px 12px' }}>+ Tambah Soal Pilihan Ganda</button>
              </div>

              {mcqs.length === 0 && <p className="text-gray-500 text-sm italic" style={{ marginBottom: '16px' }}>Belum ada soal pilihan ganda.</p>}

              {mcqs.map((mcq, index) => (
                <div key={mcq.id} className="border border-gray-800 rounded bg-[#151522] relative" style={{ padding: '16px', marginBottom: '16px' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                    <span className="text-gray-400 font-bold text-sm">Soal PG #{index + 1}</span>
                    <button onClick={() => removeMcq(mcq.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">Hapus</button>
                  </div>
                  
                  <div className="flex flex-col" style={{ gap: '16px' }}>
                    <textarea placeholder="Tulis pertanyaan di sini..." value={mcq.q} onChange={e => updateMcq(mcq.id, 'q', e.target.value)} rows={2} className="w-full bg-[#05050a] border border-gray-700 rounded text-white" style={{ padding: '12px' }} />
                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                      <input type="text" placeholder="Opsi A" value={mcq.a} onChange={e => updateMcq(mcq.id, 'a', e.target.value)} className="bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '8px' }} />
                      <input type="text" placeholder="Opsi B" value={mcq.b} onChange={e => updateMcq(mcq.id, 'b', e.target.value)} className="bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '8px' }} />
                      <input type="text" placeholder="Opsi C" value={mcq.c} onChange={e => updateMcq(mcq.id, 'c', e.target.value)} className="bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '8px' }} />
                      <input type="text" placeholder="Opsi D" value={mcq.d} onChange={e => updateMcq(mcq.id, 'd', e.target.value)} className="bg-[#05050a] border border-gray-700 rounded text-sm text-white" style={{ padding: '8px' }} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400" style={{ marginRight: '8px' }}>Kunci Jawaban Benar:</label>
                      <select value={mcq.correct} onChange={e => updateMcq(mcq.id, 'correct', e.target.value)} className="bg-[#05050a] border border-[#c9a84c] text-[#c9a84c] rounded text-sm font-bold" style={{ padding: '6px 12px' }}>
                        <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Essay Section */}
            <div style={{ marginBottom: '40px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h3 className="font-semibold text-lg text-[#e8c97a]">Bagian II: Essay / Kasus</h3>
                <button onClick={addEssay} className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded" style={{ padding: '6px 12px' }}>+ Tambah Soal Essay</button>
              </div>
              
              {essays.length === 0 && <p className="text-gray-500 text-sm italic" style={{ marginBottom: '16px' }}>Belum ada soal essay.</p>}

              {essays.map((essay, index) => (
                <div key={essay.id} className="border border-gray-800 rounded bg-[#151522]" style={{ padding: '16px', marginBottom: '16px' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                    <span className="text-gray-400 font-bold text-sm">Soal Essay #{index + 1}</span>
                    <button onClick={() => removeEssay(essay.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">Hapus</button>
                  </div>
                  <textarea placeholder="Ketik kasus atau pertanyaan essay di sini..." value={essay.q} onChange={e => updateEssay(essay.id, e.target.value)} rows={4} className="w-full bg-[#05050a] border border-gray-700 rounded text-white" style={{ padding: '12px' }}></textarea>
                </div>
              ))}
            </div>

            <button onClick={handleReleaseExam} className="w-full bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold rounded-lg shadow-[0_0_15px_rgba(201,168,76,0.3)]" style={{ padding: '16px' }}>
              SIMPAN & RILIS SEMUA SOAL UJIAN
            </button>
          </div>
        )}

        {sessionData.status === 'READY' && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-xl text-center shadow-xl" style={{ padding: '48px' }}>
            <svg className="w-16 h-16 text-yellow-500 mx-auto" style={{ marginBottom: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-white" style={{ marginBottom: '8px' }}>Menunggu Peserta</h2>
            <p className="text-gray-400" style={{ marginBottom: '32px' }}>Soal telah dirilis. Peserta saat ini bisa mengerjakan ujian. Anda akan menerima notifikasi jika peserta telah mensubmit jawabannya.</p>

            {sessionData.exam_data?.interviewLink && (
              <div className="bg-[#1a1510] border border-[#c9a84c] rounded-xl text-left" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <h3 className="font-bold text-[#c9a84c] mb-2">Jadwal Wawancara Anda</h3>
                <p className="text-gray-300 mb-4">Waktu: <span className="font-bold text-white">{sessionData.exam_data.interviewTime}</span></p>
                <a href={sessionData.exam_data.interviewLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold rounded" style={{ padding: '12px' }}>
                  Masuk Ruang Google Meet (Sebagai Asesor)
                </a>
              </div>
            )}
          </div>
        )}

        {sessionData.status === 'SUBMITTED' && (
          <div className="bg-[#0d0d1a] border border-blue-900/50 rounded-xl shadow-[0_0_30px_rgba(0,100,255,0.1)]" style={{ padding: '24px' }}>
            <h2 className="text-xl font-bold text-white" style={{ marginBottom: '24px' }}>Tahap 3: Periksa & Berikan Nilai</h2>
            
            {sessionData.exam_data?.interviewLink && (
              <div className="bg-[#1a1510] border border-[#c9a84c]/50 rounded-xl mb-8" style={{ padding: '16px' }}>
                <h3 className="font-bold text-[#c9a84c] mb-2 text-sm">Wawancara Online</h3>
                <p className="text-gray-300 text-sm mb-4">Waktu: <span className="font-bold text-white">{sessionData.exam_data.interviewTime}</span></p>
                <a href={sessionData.exam_data.interviewLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold rounded text-sm" style={{ padding: '8px 16px' }}>
                  Masuk Google Meet (Sebagai Asesor)
                </a>
              </div>
            )}

            {/* Display MCQs Submitted */}
            <div style={{ marginBottom: '32px' }}>
              <h3 className="font-semibold text-[#e8c97a] text-lg border-b border-gray-800" style={{ marginBottom: '16px', paddingBottom: '8px' }}>Bagian I: Pilihan Ganda</h3>
              {sessionData.exam_data?.mcqs?.map((mcq: any, index: number) => (
                <div key={mcq.id} className="border border-gray-800 rounded bg-[#151522]" style={{ padding: '16px', marginBottom: '16px' }}>
                  <span className="text-gray-500 font-bold text-xs" style={{ marginBottom: '8px', display: 'block' }}>Soal PG #{index + 1}</span>
                  <p className="text-white" style={{ marginBottom: '12px' }}>{mcq.q}</p>
                  
                  <div className="flex flex-col" style={{ gap: '8px' }}>
                    <div className="flex justify-between items-center bg-[#05050a] border border-green-900/50 rounded" style={{ padding: '8px 12px' }}>
                      <span className="text-gray-400 text-sm">Kunci Jawaban Asesor:</span>
                      <span className="text-green-500 font-bold">{mcq.correct} ({mcq[mcq.correct.toLowerCase()]})</span>
                    </div>
                    
                    <div className={`flex justify-between items-center bg-[#05050a] border rounded ${sessionData.answer_data?.mcqs?.[mcq.id] === mcq.correct ? 'border-green-900/50' : 'border-red-900/50'}`} style={{ padding: '8px 12px' }}>
                      <span className="text-gray-400 text-sm">Jawaban Peserta:</span>
                      <span className={`font-bold ${sessionData.answer_data?.mcqs?.[mcq.id] === mcq.correct ? 'text-green-400' : 'text-red-400'}`}>
                        {sessionData.answer_data?.mcqs?.[mcq.id] || "Tidak Dijawab"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Display Essays Submitted */}
            <div style={{ marginBottom: '40px' }}>
              <h3 className="font-semibold text-[#e8c97a] text-lg border-b border-gray-800" style={{ marginBottom: '16px', paddingBottom: '8px' }}>Bagian II: Essay / Kasus</h3>
              {sessionData.exam_data?.essays?.map((essay: any, index: number) => (
                <div key={essay.id} className="border border-gray-800 rounded bg-[#151522]" style={{ padding: '16px', marginBottom: '16px' }}>
                  <span className="text-gray-500 font-bold text-xs" style={{ marginBottom: '8px', display: 'block' }}>Soal Essay #{index + 1}</span>
                  <p className="text-white italic" style={{ marginBottom: '16px' }}>{essay.q}</p>
                  
                  <h4 className="text-sm text-blue-400 font-semibold" style={{ marginBottom: '8px' }}>Jawaban Tulis Peserta:</h4>
                  <div className="bg-[#05050a] rounded border border-gray-700 text-gray-200 whitespace-pre-wrap" style={{ padding: '16px', minHeight: '100px' }}>
                    {sessionData.answer_data?.essays?.[essay.id] || "Tidak ada jawaban"}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center" style={{ gap: '16px', marginBottom: '24px' }}>
              <label className="text-white font-bold text-lg">Beri Nilai Total Akhir (0-100):</label>
              <input type="number" min="0" max="100" value={score} onChange={e => setScore(Number(e.target.value))} className="bg-[#05050a] border border-[#c9a84c] text-[#c9a84c] rounded font-bold text-center w-32 text-2xl" style={{ padding: '12px' }} />
            </div>

            <button onClick={handleSubmitGrade} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(0,100,255,0.3)]" style={{ padding: '16px' }}>
              SELESAI PEMERIKSAAN & SIMPAN NILAI
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
            <div className="inline-block bg-green-900/30 border border-green-900 rounded-2xl" style={{ padding: '24px', marginBottom: '32px' }}>
              <div className="text-sm text-green-500 uppercase tracking-widest font-bold" style={{ marginBottom: '4px' }}>Skor Akhir</div>
              <div className="text-5xl font-bold text-white">{sessionData.score}</div>
            </div>

            {sessionData.exam_data?.interviewLink && (
              <div className="bg-[#1a1510] border border-[#c9a84c]/30 rounded-xl text-left" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <h3 className="font-bold text-[#c9a84c] mb-2 text-sm">Wawancara Online</h3>
                <p className="text-gray-300 text-sm mb-4">Waktu: <span className="font-bold text-white">{sessionData.exam_data.interviewTime}</span></p>
                <a href={sessionData.exam_data.interviewLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-bold rounded" style={{ padding: '12px' }}>
                  Masuk Google Meet (Sebagai Asesor)
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
