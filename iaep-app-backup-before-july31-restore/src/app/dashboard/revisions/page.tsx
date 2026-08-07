"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AuthorRevisions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/author/submissions');
      if (res.status === 401) {
        window.location.href = '/auth/login';
        return;
      }
      if (res.ok) {
        const json = await res.json();
        // Hanya ambil yang butuh revisi atau sedang dalam proses revisi
        const revisionSubmissions = (json.submissions || []).filter((s: any) => 
          s.status === 'Needs Revision' || s.status === 'Revision Submitted'
        );
        setSubmissions(revisionSubmissions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleUpload = async (file: File, submissionId: string) => {
    setUploadingId(submissionId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('submissionId', submissionId);
    
    try {
      const res = await fetch('/api/upload-revised-manuscript', { method: 'POST', body: formData });
      const data = await res.json();
      if(data.success) {
        alert('Berhasil upload naskah revisi!');
        fetchSubmissions();
      } else {
        alert('Gagal upload: ' + data.error);
      }
    } catch(err) {
      alert('Error uploading file');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-orange-500 font-bold tracking-wide mb-3">Revisi Naskah</h1>
        <p className="text-zinc-400 text-lg">Pantau pemberitahuan revisi dan unggah naskah perbaikan Anda di sini.</p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="bg-black/40 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">
              Daftar Naskah Memerlukan Revisi
            </h3>
          </div>
          
          <div className="divide-y divide-zinc-800/80">
            {isLoading ? (
              <div className="p-12 text-center text-zinc-500">Memuat data...</div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
                <CheckCircle2 className="w-12 h-12 mb-4 opacity-20 text-green-500" />
                <p>Tidak ada naskah yang memerlukan revisi saat ini.</p>
              </div>
            ) : (
              submissions.map((sub, idx) => (
                <div key={idx} className="p-6 hover:bg-zinc-900/30 transition-colors group">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">#{sub.id.split('-')[0]}</span>
                        <span className="text-xs font-bold text-orange-500/70">{sub.journals?.name || 'Jurnal'}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-4 leading-snug">
                        {sub.title}
                      </h4>
                      
                      {/* Pemberitahuan Revisi */}
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 text-orange-400 font-bold mb-2 text-sm">
                          <AlertCircle className="w-4 h-4" /> Pemberitahuan Revisi
                        </div>
                        <p className="text-sm text-zinc-300">
                          {sub.status === 'Needs Revision' 
                            ? 'Reviewer/Editor telah memberikan catatan perbaikan untuk naskah Anda. Silakan unggah file revisi yang telah diperbaiki.'
                            : 'Anda telah berhasil mengirimkan naskah revisi. Sedang menunggu keputusan Editor.'}
                        </p>
                        <Link href={`/dashboard/submissions/${sub.id}`} className="text-orange-500 text-xs mt-2 inline-block hover:underline font-bold">
                          Lihat Detail Catatan Reviewer di Halaman Lacak Proses &rarr;
                        </Link>
                      </div>

                    </div>
                    
                    {/* Area Upload Revisi */}
                    <div className="w-full lg:w-96 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 flex flex-col justify-center">
                      {sub.status === 'Needs Revision' ? (
                        <>
                          <label className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-emerald-500" />
                            Upload File Revisi Baru
                          </label>
                          <p className="text-xs text-zinc-500 mb-4">Gunakan format DOCX atau PDF.</p>
                          <div className="relative">
                            <input 
                              type="file" 
                              accept=".doc,.docx,.rtf,.pdf"
                              disabled={uploadingId === sub.id}
                              onChange={(e) => {
                                if(e.target.files && e.target.files[0]) {
                                  handleUpload(e.target.files[0], sub.id);
                                }
                              }}
                              className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-500 hover:file:bg-emerald-500/30 disabled:opacity-50 cursor-pointer border border-zinc-700 rounded-lg focus:outline-none" 
                            />
                            {uploadingId === sub.id && (
                              <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                                  Mengunggah...
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                          <span className="text-emerald-500 font-bold text-sm">Revisi Terkirim</span>
                          <span className="text-xs text-zinc-400 mt-1">Sistem menunggu validasi dari Editor.</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
