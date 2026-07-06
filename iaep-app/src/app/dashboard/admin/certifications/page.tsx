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
}

export default function CertificationsAdmin() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);

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
        alert("Ruang Ujian Berhasil Dibuat!");
        fetchData();
      } else {
        alert("Gagal membuat ruang ujian.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating exam.");
    }
  };

  const handleGenerateDummy = async () => {
    try {
      const res = await fetch("/api/certifications/candidates/dummy", { method: "POST" });
      if (res.ok) {
        alert("Berhasil membuat peserta percobaan!");
        fetchData();
      } else {
        alert("Gagal membuat peserta. Pastikan database Anda siap.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading data...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-[#05050a] text-gray-200">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#c9a84c]">Certification Enrollments</h1>
            <p className="text-gray-400 mt-2">Kelola pendaftaran sertifikasi dan generate Ruang Ujian Online</p>
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
                    <p className="mb-4">Belum ada pendaftar sertifikasi.</p>
                    <button onClick={handleGenerateDummy} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700">
                      + Buat Pendaftar Percobaan (Dummy)
                    </button>
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
                        <div className="text-xs text-gray-500">{cand.phone || "No Phone"}</div>
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
    </div>
  );
}
