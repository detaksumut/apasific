"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { sendRevisionForwardWaFonnte } from "@/app/actions/editor";

interface FonnteForwardButtonProps {
  title: string;
  revisedFileUrl: string;
  reviews: any[];
}

export default function FonnteForwardButton({ title, revisedFileUrl, reviews }: FonnteForwardButtonProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const targetReviews = reviews.filter(r => ['major_revision', 'revisions_major', 'minor_revision', 'revisions_minor'].includes(r.recommendation));
      
      if (targetReviews.length === 0) {
        alert("Tidak ada reviewer yang memberikan rekomendasi revisi.");
        return;
      }

      let successCount = 0;
      for (const rev of targetReviews) {
        const phone = rev.profiles?.phone || rev.reviewer?.phone;
        const name = rev.profiles?.full_name || rev.reviewer?.full_name || 'Reviewer';
        
        if (phone) {
          const res = await sendRevisionForwardWaFonnte(phone, name, title, revisedFileUrl);
          if (res.success) successCount++;
        }
      }
      
      if (successCount > 0) {
        alert(`Berhasil mengirim notifikasi Fonnte ke ${successCount} Reviewer.`);
      } else {
        alert("Gagal mengirim pesan. Pastikan reviewer memiliki nomor telepon yang valid.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menghubungi Fonnte.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={isSending}
      className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] disabled:opacity-50 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm"
    >
      {isSending ? (
        <svg className="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
      ) : (
        <Phone className="w-3.5 h-3.5" />
      )}
      {isSending ? "Mengirim..." : "Teruskan (Fonnte)"}
    </button>
  );
}
