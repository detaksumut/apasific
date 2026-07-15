"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { submitAuthorRevision } from '@/app/actions/submission';

export default function AuthorRevisedUpload({ submissionId }: { submissionId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("Pilih file terlebih dahulu.");
      return;
    }
    
    setIsUploading(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await submitAuthorRevision(submissionId, formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || "Gagal mengunggah file.");
      }
    } catch (e: any) {
      setErrorMsg("Terjadi kesalahan sistem.");
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Revisi Berhasil Dikirim!</h3>
        <p className="text-zinc-400">Terima kasih, naskah revisi Anda telah berhasil diunggah dan status telah diperbarui. Editor akan segera memeriksa naskah Anda.</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-zinc-800 rounded-2xl p-8">
      <h3 className="text-xl font-bold text-white mb-2">Unggah Naskah Revisi</h3>
      <p className="text-zinc-400 text-sm mb-6">Pastikan Anda telah memperbaiki naskah sesuai dengan catatan reviewer di atas. Naskah yang diunggah disarankan dalam format DOCX atau PDF.</p>
      
      <div 
        className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 bg-zinc-900/30 rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        
        {file ? (
          <div className="flex flex-col items-center w-full">
            <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl mb-4 w-full flex items-center justify-between border border-emerald-500/20">
               <div className="flex items-center gap-3 truncate">
                  <div className="p-2 bg-emerald-500/20 rounded">📄</div>
                  <span className="font-semibold truncate">{file.name}</span>
               </div>
               <button 
                 onClick={(e) => { e.stopPropagation(); setFile(null); }}
                 className="text-zinc-400 hover:text-red-400 p-1"
               >
                 ✕
               </button>
            </div>
            
            {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleUpload(); }}
              disabled={isUploading}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors w-full sm:w-auto"
            >
              {isUploading ? 'Sedang Mengunggah...' : 'Kirim Naskah Revisi'}
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="w-12 h-12 text-zinc-500 mb-4" />
            <p className="text-zinc-300 font-semibold mb-1">Klik di sini untuk memilih file revisi</p>
            <p className="text-zinc-500 text-xs mb-6">(Format: .DOCX / .PDF - Maks. 10MB)</p>
            <button className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg text-sm transition-colors border border-zinc-700">
                Pilih File Revisi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
