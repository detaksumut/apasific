"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2, MessageCircle } from "lucide-react";
import { updateSubmissionStatus, deleteSubmission, sendReminderWa } from "@/app/actions/submission";
import { useRouter } from "next/navigation";

export default function IncomingActionButtons({ articleId, authorPhone }: { articleId: string, authorPhone?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change this submission to ${newStatus}?`)) return;
    setLoading(true);
    try {
      const res = await updateSubmissionStatus(articleId, newStatus);
      if (!res.success) {
        alert(res.error || "Failed to update status");
      } else {
        if (newStatus === "Awaiting Reviewers") {
          window.location.href = "/dashboard/editor/assign-reviewer";
        }
      }
    } catch (e) {
      alert("Error updating status");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this submission? This action cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await deleteSubmission(articleId);
      if (!res.success) {
        alert(res.error || "Failed to delete submission");
      }
    } catch (e) {
      alert("Error deleting submission");
    }
    setLoading(false);
  };

  const handleWA = async () => {
    if (!confirm("Kirim pesan otomatis via WhatsApp (Sistem APASIFIC) ke Penulis ini?")) return;
    setLoading(true);
    try {
      let res = await sendReminderWa(articleId);
      
      // Jika nomor HP benar-benar tidak ada di database, minta Editor memasukkannya secara manual
      if (!res.success && res.error?.includes("tidak ditemukan")) {
         const manualPhone = prompt(res.error + "\n\nJika Anda mengetahuinya, silakan masukkan nomor WhatsApp penulis secara manual (Gunakan format 628...):");
         if (manualPhone && manualPhone.trim() !== "") {
             res = await sendReminderWa(articleId, manualPhone.trim());
         } else {
             setLoading(false);
             return; // Dibatalkan oleh pengguna
         }
      }
      
      if (res.success) {
        alert("Pesan WA berhasil terkirim melalui sistem!");
      } else {
        alert(res.error || "Gagal mengirim pesan WA");
      }
    } catch (e) {
      alert("Error saat memproses kirim WA");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 shrink-0">
      <button 
        disabled={loading}
        onClick={handleWA}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20 disabled:opacity-50"
        title="Kirim pesan otomatis ke Penulis"
      >
        <MessageCircle className="w-4 h-4" /> {loading ? "Mengirim..." : "Pesan WA"}
      </button>
      <button 
        disabled={loading}
        onClick={() => handleAction("Awaiting Reviewers")}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 disabled:opacity-50"
      >
        <CheckCircle className="w-4 h-4" /> {loading ? "Memproses..." : "Terima & Teruskan"}
      </button>
      <button 
        disabled={loading}
        onClick={() => handleAction("Desk Reject")}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20 disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" /> {loading ? "Memproses..." : "Tolak (Desk Reject)"}
      </button>
      <button 
        disabled={loading}
        onClick={handleDelete}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
        title="Hapus Permanen"
      >
        <Trash2 className="w-4 h-4" /> {loading ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  );
}
