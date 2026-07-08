"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ExamSession {
  id: string;
  candidate_id: string;
  certification_field: string;
  assessor_code: string;
  candidate_code: string;
  status: string;
}

interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  academicField?: string;
  cert: string;
  method: string;
  schedule: string;
  status: string;
  zoomLink?: string;
  buktiTransferUrl?: string;
}

export default function CertificationsAdmin() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resCand = await fetch("/api/certifications/candidates");
      if (resCand.ok) {
        const dataCand = await resCand.json();
        setCandidates(dataCand);
      }
      const resSess = await fetch("/api/certifications/exam/sessions");
      if (resSess.ok) {
        const dataSess = await resSess.json();
        setSessions(dataSess);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateExam = async (candidateId: string, certField: string) => {
    try {
      const res = await fetch("/api/certifications/exam/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidateId,
          certification_field: certField
        })
      });
      if (res.ok) {
        showToast("Ruang Ujian Berhasil Dibuat!");
        fetchData();
      } else {
        showToast("Gagal membuat ruang ujian.");
      }
    } catch (e) {
      console.error(e);
      showToast("Error generating exam.");
    }
  };

  const handleGenerateDummy = async () => {
    try {
      const res = await fetch("/api/certifications/candidates/dummy", { method: "POST" });
      if (res.ok) {
        showToast("Berhasil membuat peserta percobaan!");
        fetchData();
      } else {
        showToast("Gagal membuat peserta. Pastikan database Anda siap.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading data...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-[#05050a] text-gray-200 relative">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 animate-fade-in-down border border-green-400 backdrop-blur-sm flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#c9a84c]">Certification Enrollments</h1>
            <p className="text-gray-400 mt-2">Kelola pendaftaran sertifikasi dan generate Ruang Ujian Online</p>
          </div>
          <div>
            <button onClick={handleGenerateDummy} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-lg transition-colors border border-gray-700 shadow-lg">
              + Buat Pendaftar Percobaan (Dummy)
            </button>
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#151522] text-[#c9a84c] border-b border-gray-800">
                <th className="p-4 font-semibold text-sm">Peserta & Info</th>
                <th className="p-4 font-semibold text-sm">Sertifikasi</th>
                <th className="p-4 font-semibold text-sm">Jadwal</th>
                <th className="p-4 font-semibold text-sm">Status / Ruang Ujian</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    Belum ada pendaftar sertifikasi.
                  </td>
                </tr>
              ) : (
                candidates.map(cand => {
                  const session = sessions.find(s => s.candidate_id === cand.id);
                  const examLink = typeof window !== "undefined" ? `${window.location.origin}/exam/${session?.id}` : `/exam/${session?.id}`;
                  
                  return (
                    <tr key={cand.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{cand.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{cand.email || "No Email"}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{cand.phone || "No Phone"}</span>
                          {cand.phone && (
                            <a 
                              href={`https://wa.me/${cand.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo, ini dari Admin ASIA (Association of Asia Pacific Academician). Kami ingin menginformasikan terkait pendaftaran ujian Sertifikasi Anda.')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-500 hover:text-green-400 p-1 rounded-full transition-colors flex-shrink-0"
                              title="Chat WhatsApp"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437-9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-[#e8c97a]">{cand.cert}</div>
                        <div className="text-xs text-gray-400 mt-1">{cand.method}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300">{cand.schedule}</div>
                        <div className="mt-2 inline-block px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full border border-blue-900/50">
                          {cand.status}
                        </div>
                        {cand.buktiTransferUrl && (
                          <div className="mt-3">
                            <button 
                              onClick={() => setSelectedReceipt(cand.buktiTransferUrl || null)}
                              className="bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20 px-3 py-1.5 rounded-md hover:bg-[#c9a84c]/20 transition-colors text-xs font-semibold flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Lihat Bukti
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {session ? (
                          <div className="bg-black/40 border border-gray-800 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Exam Room URL</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                session.status === 'DRAFT' ? 'bg-gray-800 text-gray-300' :
                                session.status === 'READY' ? 'bg-yellow-900/50 text-yellow-500' :
                                session.status === 'SUBMITTED' ? 'bg-blue-900/50 text-blue-400' :
                                'bg-green-900/50 text-green-400'
                              }`}>
                                {session.status}
                              </span>
                            </div>
                            <div className="text-xs text-blue-400 break-all bg-[#0d0d1a] p-2 rounded border border-gray-800 mb-3">
                              <Link href={examLink} target="_blank" className="hover:underline">{examLink}</Link>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-[#151522] p-2 rounded border border-gray-800">
                                <span className="block text-gray-500 mb-1">Kode Asesor:</span>
                                <span className="font-mono text-[#c9a84c] font-bold">{session.assessor_code}</span>
                              </div>
                              <div className="bg-[#151522] p-2 rounded border border-gray-800">
                                <span className="block text-gray-500 mb-1">Kode Peserta:</span>
                                <span className="font-mono text-white font-bold">{session.candidate_code}</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">
                              * Kirimkan Link & Kode Asesor ke penilai. Kirim Link & Kode Peserta ke calon.
                            </p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleGenerateExam(cand.id, cand.cert)}
                            className="bg-[#c9a84c] hover:bg-[#e8c97a] text-black text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg"
                          >
                            + Generate Exam Room
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-gray-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-[#c9a84c] font-bold">Bukti Transfer Sertifikasi</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 flex justify-center bg-black/50">
              {selectedReceipt.startsWith("data:application/pdf") ? (
                <iframe src={selectedReceipt} className="w-full h-[600px] border-0" />
              ) : (
                <img src={selectedReceipt} alt="Bukti Transfer" className="max-w-full max-h-[70vh] object-contain rounded" />
              )}
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end">
              <a href={selectedReceipt} download="bukti_transfer" className="bg-[#c9a84c] text-black px-4 py-2 rounded font-semibold hover:bg-[#e8c97a] transition-colors text-sm">
                Unduh File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
